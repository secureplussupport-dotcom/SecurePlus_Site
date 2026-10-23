import {useCallback,useEffect,useRef,useState} from 'react';
import {createLiveRefresh} from './liveRefresh.js';
const NO_EVENTS=[];

// Keep the last successful snapshot during refreshes; never share it across owners.
export function useLiveSnapshot({owner,load,enabled=true,revision=null,events=NO_EVENTS}) {
  const [snapshot,setSnapshot]=useState(null);
  const [state,setState]=useState(null);
  const controller=useRef(null);
  useEffect(()=>{
    if(!enabled)return;
    const refresh=createLiveRefresh(async()=>{
      setState({owner,refreshing:true,error:''});
      return load();
    },value=>{
      setSnapshot({owner,value,updatedAt:Date.now()});
      setState({owner,refreshing:false,error:''});
    },error=>setState({owner,refreshing:false,error:error?.message || 'Unable to refresh.'}));
    controller.current=refresh;
    const changed=()=>refresh.refresh({followUp:true});
    const visible=()=>{if(!document.hidden)refresh.refresh();};
    refresh.refresh();
    const timer=setInterval(()=>{if(!document.hidden)refresh.refresh();},30000);
    window.addEventListener('focus',visible);
    window.addEventListener('online',changed);
    document.addEventListener('visibilitychange',visible);
    events.forEach(event=>window.addEventListener(event,changed));
    return()=>{
      refresh.dispose();
      if(controller.current===refresh)controller.current=null;
      clearInterval(timer);
      window.removeEventListener('focus',visible);
      window.removeEventListener('online',changed);
      document.removeEventListener('visibilitychange',visible);
      events.forEach(event=>window.removeEventListener(event,changed));
    };
  },[owner,load,enabled,revision,events]);
  const current=snapshot?.owner===owner?snapshot:null;
  const progress=state?.owner===owner?state:null;
  const refresh=useCallback(()=>controller.current?.refresh({followUp:true}) || Promise.resolve(null),[]);
  return {value:enabled?current?.value ?? null:null,updatedAt:current?.updatedAt,
    status:!enabled?'idle':current?'ready':progress?.error?'error':'loading',
    refreshing:Boolean(enabled&&progress?.refreshing),error:enabled?progress?.error || '':'',refresh};
}
