import { createHash } from 'node:crypto';
import { createOperationalEvents, localBoundaryEnabled } from './operations.mjs';

const bounded=async(work,ms)=>{let timer;try{return await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Scheduler deadline')),ms);})]);}finally{clearTimeout(timer);}};
export function createSchedulerReplayGuard(sql) {
  return async ({nonce,expiresAt})=>{
    const digest=createHash('sha256').update(nonce).digest('hex');
    const [r]=await sql`select adaptive_private.consume_scheduler_nonce(${digest},${new Date(expiresAt)}) as accepted`;
    return r.accepted;
  };
}
// Trusted injected verifier must verify signature, issuer, audience, expiry and
// server identity. No default verifier, real credential, public route or cron config.
export function createAdaptiveScheduler({verifyCredential,consumeNonce,drain,readEnvironment=()=>process.env,log,clock=()=>Date.now()}={}) {
  const emit=createOperationalEvents(log);
  return async request=>{
    const headers={'cache-control':'no-store'};
    if(!localBoundaryEnabled(readEnvironment())){emit('kill_switch','disabled');return Response.json({status:'disabled'},{status:503,headers});}
    try {
      if(request.method!=='POST'||!request.headers.get('content-type')?.startsWith('application/json'))throw new Error('Invalid request');
      // Learner Bearer JWTs are never scheduler authority, even if injected incorrectly.
      const credential=request.headers.get('authorization')?.match(/^Scheduler ([A-Za-z0-9._~-]{16,4096})$/)?.[1];
      if(!credential||typeof verifyCredential!=='function'||typeof consumeNonce!=='function')throw new Error('Denied');
      const authority=await bounded(Promise.resolve(verifyCredential(credential)),1000);
      if(authority?.kind!=='scheduler'||authority.audience!=='adaptive-worker'||typeof authority.nonce!=='string'||authority.nonce.length<16||authority.nonce.length>256||
        !Number.isFinite(authority.expiresAt)||authority.expiresAt<=clock()||authority.expiresAt>clock()+60000)throw new Error('Denied');
      const reader=request.body?.getReader();if(!reader)throw new Error('Body required');
      let bytes=0;const chunks=[];const bodyDeadline=clock()+1000;
      try {for(;;){if(clock()>=bodyDeadline)throw new Error('Body deadline');const {value,done}=await bounded(reader.read(),Math.max(1,bodyDeadline-clock()));if(done)break;bytes+=value.byteLength;if(bytes>1024)throw new Error('Body limit');chunks.push(Buffer.from(value));}}
      finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
      const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length)throw new Error('No caller-selected jobs');
      if(!await bounded(Promise.resolve(consumeNonce(authority)),3000))throw new Error('Replay denied');
      const result=await bounded(Promise.resolve(drain({deadline:clock()+20000})),30000);
      // Explicit construction excludes owner/job/payload fields from injected code.
      const count=v=>Number.isSafeInteger(v)&&v>=0&&v<=5?v:0;
      return Response.json({status:result.disabled?'disabled':'accepted',completed:count(result.completed),retried:count(result.retried),parked:count(result.parked)}, {headers});
    }catch{return Response.json({status:'rejected',incidentId:emit('scheduler_denied','unauthenticated')},{status:401,headers});}
  };
}
