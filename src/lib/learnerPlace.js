import {useCallback, useEffect, useRef, useState} from 'react';

const memory=new Map();
export function readPlace(key,fallback,storage){
  try{const raw=memory.has(key)?memory.get(key):JSON.parse((storage??globalThis.sessionStorage)?.getItem(`secureplus-place:${key}`)||'null');
    if(raw===null||typeof raw!==typeof fallback||Array.isArray(raw)!==Array.isArray(fallback))return fallback;
    return raw;
  }catch{return fallback;}
}
export function writePlace(key,value,storage){
  memory.set(key,value);
  try{(storage??globalThis.sessionStorage)?.setItem(`secureplus-place:${key}`,JSON.stringify(value));}catch{}
}
export function usePlaceState(key,initial){
  const [value,setValue]=useState(()=>readPlace(key,initial));
  const latest=useRef(value);latest.current=value;
  const update=useCallback(next=>{
    const value=typeof next==='function'?next(latest.current):next;
    latest.current=value;writePlace(key,value);setValue(value);
  },[key]);
  useEffect(()=>{const value=readPlace(key,initial);latest.current=value;setValue(value);},[key]);
  return [value,update];
}

export function navigateDetail(history,key,next,replace=false){
  const current=history.state?.learnerDetail?.[key]??null;
  if(next===null&&current===null)return false;
  if(next!==null&&JSON.stringify(current)===JSON.stringify(next))return false;
  if(next===null&&!replace){history.back();return true;}
  const state={...history.state,learnerDetail:next===null?{}:{[key]:next}};
  history[replace?'replaceState':'pushState'](state,'');
  return false;
}

// Detail entries belong to the current route; browser Back restores the list entry.
export function useDetailState(key,{route=null}={}){
  const read=()=>window.history.state?.learnerDetail?.[key]??null;
  const [value,setValue]=useState(read);
  useEffect(()=>{setValue(read());const pop=()=>setValue(read());window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[key]);
  const update=useCallback((next,{replace=false}={})=>{
    if(next!==null&&route&&`${window.location.pathname}${window.location.search}`!==route){
      window.history.pushState({secureplusView:new URLSearchParams(route.split('?')[1]).get('view')},'',route);
    }
    if(!navigateDetail(window.history,key,next,replace))setValue(next);
  },[key,route]);
  return [value,update];
}

export function useListPlace(key,detail){
  useEffect(()=>{
    if(detail)return;
    const place=readPlace(`${key}:scroll`,{window:0,main:0,focus:''});
    let restoring=true;
    const restore=()=>{
      window.scrollTo({top:place.window,behavior:'instant'});
      const main=document.querySelector('.app-main');if(main)main.scrollTop=place.main;
      if(place.focus)[...document.querySelectorAll('button,a,input,select,[role="button"]')].find(node=>(node.getAttribute('aria-label')||node.textContent||'').trim()===place.focus)?.focus({preventScroll:true});
      restoring=false;
    };
    // App navigation also scrolls in a double frame; restore after that settles.
    let frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(restore);});});
    const save=event=>{
      if(restoring)return;
      const previous=readPlace(`${key}:scroll`,place);
      const focused=event?.type==='pointerdown'?event.target.closest('button,a,input,select,[role="button"]'):document.activeElement;
      writePlace(`${key}:scroll`,{window:window.scrollY,main:document.querySelector('.app-main')?.scrollTop||0,focus:focused&&focused!==document.body?(focused.getAttribute('aria-label')||focused.textContent||'').trim().slice(0,500):previous.focus});
    };
    window.addEventListener('scroll',save,true);window.addEventListener('pointerdown',save,true);window.addEventListener('focusin',save);window.addEventListener('pagehide',save);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',save,true);window.removeEventListener('pointerdown',save,true);window.removeEventListener('focusin',save);window.removeEventListener('pagehide',save);};
  },[key,Boolean(detail)]);
}
