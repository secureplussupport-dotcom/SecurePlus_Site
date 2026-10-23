// One request at a time. A change during a request earns one fresh follow-up.
export function createLiveRefresh(load, onValue, onError) {
  let active=true, pending=null, queued=false;
  const refresh=({followUp=false}={})=>{
    if(!active)return Promise.resolve(null);
    if(pending){queued ||= followUp;return pending;}
    pending=Promise.resolve().then(()=>active?load():null).then(value=>{
      if(active)onValue(value);
      return value;
    }).catch(error=>{if(active)onError(error);return null;}).finally(()=>{
      pending=null;
      if(active&&queued){queued=false;refresh();}
    });
    return pending;
  };
  return {refresh,dispose:()=>{active=false;queued=false;}};
}
export const progressOwner = user => `${user?.authProvider || 'guest'}:${user?.id || user?.email || 'guest'}`;
