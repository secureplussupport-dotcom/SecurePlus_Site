import {useEffect} from 'react';
import {mcqEngineRequest} from './mcqEngineClient.js';
import {useLiveSnapshot} from './useLiveSnapshot.js';
import {progressOwner} from './liveRefresh.js';
const load=()=>mcqEngineRequest('access');
const events=['practice-access-changed'];
export function usePracticeAccess(user,enabled=true){
  const snapshot=useLiveSnapshot({owner:progressOwner(user),load,enabled,events});
  useEffect(()=>{
    const release=Date.parse(snapshot.value?.resetAt);
    if(!enabled||!Number.isFinite(release)||release<=Date.now())return;
    const timer=setTimeout(()=>snapshot.refresh(),Math.min(release-Date.now()+50,2147483647));
    return()=>clearTimeout(timer);
  },[enabled,snapshot.value?.resetAt,snapshot.refresh]);
  return {...snapshot,access:snapshot.value};
}
