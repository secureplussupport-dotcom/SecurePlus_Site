import { useCallback, useEffect, useState } from 'react';
import { mcqEngineRequest } from './mcqEngineClient.js';
export function usePracticeAccess(user){
 const [access,setAccess]=useState(null),[error,setError]=useState('');
 const refresh=useCallback(async()=>{try{const value=await mcqEngineRequest('access');setAccess(value);setError('');return value;}catch(err){setError(err.message);return null;}},[user?.id,user?.email,user?.authProvider]);
 useEffect(()=>{setAccess(null);refresh();const timer=setInterval(refresh,30000);const changed=()=>refresh();window.addEventListener('practice-access-changed',changed);return()=>{clearInterval(timer);window.removeEventListener('practice-access-changed',changed);};},[refresh]);
 return {access,error,refresh};
}
