import test from 'node:test';
import assert from 'node:assert/strict';
import {createCentralControlReader} from '../server/adaptive/central-control.mjs';
import {createOperationalMonitor,evaluateOperationalAlerts,ALERT_RULES} from '../server/adaptive/operational-monitor.mjs';
const env={ADAPTIVE_RUNTIME_ENVIRONMENT:'disposable_local',ADAPTIVE_SHADOW_WRITES_ENABLED:'true',ADAPTIVE_SHADOW_WRITES_KILL_SWITCH:'false'};
test('central control defaults off and refuses stale, malformed and unavailable reads',async()=>{
 assert.equal((await createCentralControlReader()()).enabled,false);
 for(const control of [null,{}, {enabled:true,killSwitch:false,epoch:1,observedAt:new Date(0),validUntil:new Date(999999)}, {enabled:true,killSwitch:false,epoch:0,observedAt:new Date(10000),validUntil:new Date(999999)}])assert.equal((await createCentralControlReader({sql:async()=>[{control}],readEnvironment:()=>env,clock:()=>10000})()).enabled,false);
 assert.equal((await createCentralControlReader({sql:async()=>{throw new Error('secret');},readEnvironment:()=>env})()).enabled,false);
 assert.equal((await createCentralControlReader({sql:()=>new Promise(()=>{}),readEnvironment:()=>env,timeoutMs:1})()).enabled,false);
});
test('fresh control is uncached and production is hard denied',async()=>{
 let enabled=true,calls=0;const sql=async()=>{calls++;return[{control:{enabled,killSwitch:!enabled,epoch:1,observedAt:new Date(10000),validUntil:new Date(20000)}}];};
 const read=createCentralControlReader({sql,readEnvironment:()=>env,clock:()=>10000});assert.equal((await read()).enabled,true);enabled=false;assert.equal((await read()).enabled,false);assert.equal(calls,2);
 assert.equal((await createCentralControlReader({sql,readEnvironment:()=>({...env,NODE_ENV:'production'})})()).enabled,false);assert.equal(calls,2);
});
test('every operational alert has exact deterministic boundaries',()=>{
 for(const [code,metric,threshold] of ALERT_RULES){assert.ok(!evaluateOperationalAlerts({[metric]:threshold-1}).some(a=>a.code===code));assert.ok(evaluateOperationalAlerts({[metric]:threshold}).some(a=>a.code===code));}
 for(const invalid of [{ownerId:'secret'},{queueDepth:NaN},{queueDepth:-1},{token:'secret'}])assert.throws(()=>evaluateOperationalAlerts(invalid));
});
test('monitor strips payloads, expires windows and only publishes supported p95',()=>{
 let now=1000;const monitor=createOperationalMonitor({clock:()=>now});
 monitor.record({event:'runtime_accepted',ownerId:'secret',url:'secret',incidentId:'secret',durationMs:5});
 let result=monitor.sample({queueDepth:1,ownerId:'secret'},{disabledSince:999});assert.equal(result.metrics.acceptedAfterKill,1);assert.ok(!JSON.stringify(result).includes('secret'));assert.equal(result.metrics.projectionP95Ms,undefined);
 for(let i=1;i<=20;i++)monitor.record({event:'projection_success',durationMs:i});assert.equal(monitor.sample().metrics.projectionP95Ms,19);
 now+=300001;assert.equal(monitor.sample().metrics.acceptedAfterKill,0);assert.equal(monitor.sample().metrics.projectionP95Ms,undefined);
});

test('external erasure journal rejects tampering, old heads, concurrent writers and symlinks',async()=>{
 const {mkdtempSync,readFileSync,writeFileSync,symlinkSync,rmSync}=await import('node:fs');const {tmpdir}=await import('node:os');const {randomBytes,randomUUID}=await import('node:crypto');
 const {appendErasureIntent,readErasureJournal}=await import('../server/adaptive/recovery-journal.mjs');
 const directory=mkdtempSync(tmpdir()+'/adaptive-journal-'),path=directory+'/ledger',key=randomBytes(32),intent={ownerId:randomUUID(),enrollmentId:randomUUID()};
 try{
  const head=appendErasureIntent(path,key,intent);assert.equal(readErasureJournal(path,key,head).length,1);
  assert.throws(()=>readErasureJournal(path,key,'0'.repeat(64)));assert.throws(()=>readErasureJournal(path,randomBytes(32),head));
  const text=readFileSync(path,'utf8');writeFileSync(path,text.replace(intent.ownerId,randomUUID()));assert.throws(()=>readErasureJournal(path,key,head));writeFileSync(path,text);
  writeFileSync(path+'.lock','');assert.throws(()=>appendErasureIntent(path,key,intent,head));rmSync(path+'.lock');
  symlinkSync(path,directory+'/link');assert.throws(()=>readErasureJournal(directory+'/link',key,head));
 }finally{rmSync(directory,{recursive:true,force:true});}
});

// These lifecycle tests cover reporting and commit ordering. Real PostgreSQL
// exit-path proof is in audit-learning-operations-cleanup.mjs.
const {runWithControlCleanup}=await import('./lib/operational-cleanup.mjs');
function cleanupFixture({disableError,verifyError,storedEnabled=false,effectiveEnabled=false,closeError}={}){
 const order=[];let connections=0;
 const connect=()=>{
  const stage=++connections===1?'disable':'verify';order.push(stage+'_connect');
  return {
   begin:async work=>{
    const tx=async strings=>{
     const query=strings.join('');
     if(query.includes('set local'))return [];
     order.push(stage+'_query');
     if(stage==='disable'&&disableError)throw disableError;
     if(stage==='verify'&&verifyError)throw verifyError;
     return [{stored_enabled:storedEnabled,control:{enabled:effectiveEnabled,killSwitch:!effectiveEnabled}}];
    };
    await work(tx);order.push(stage+'_commit');
   },
   end:async()=>{order.push(stage+'_close');if(closeError)throw closeError;}
  };
 };
 return {connect,order};
}
test('successful rehearsal commits disable and verifies on a new connection before PASS',async()=>{
 const {connect,order}=cleanupFixture();
 const result=await runWithControlCleanup({connect,run:async()=>order.push('run'),close:async()=>order.push('close_workload')});
 assert.equal(result.status,'PASS');assert.equal(result.cleanup.storedEnabled,false);
 assert.deepEqual(order,['run','close_workload','disable_connect','disable_query','disable_commit','disable_close','verify_connect','verify_query','verify_commit','verify_close']);
});
test('failure after enable preserves primary failure and still confirms disable',async()=>{
 const {connect}=cleanupFixture();
 const result=await runWithControlCleanup({connect,run:async()=>{throw {code:'FORCED_AFTER_ENABLE'};},close:async()=>{}});
 assert.equal(result.status,'FAIL');assert.equal(result.primaryFailure.code,'FORCED_AFTER_ENABLE');assert.equal(result.cleanup.status,'PASS');
});
test('primary and cleanup failures are both reported without exception text',async()=>{
 const {connect,order}=cleanupFixture({disableError:{code:'55P03',message:'secret SQL'},verifyError:{code:'42501',detail:'secret URL'}});
 const result=await runWithControlCleanup({connect,run:async()=>{throw {code:'FORCED_AFTER_ENABLE',message:'secret token'};},close:async()=>{}});
 assert.equal(result.status,'FAIL');assert.equal(result.primaryFailure.code,'FORCED_AFTER_ENABLE');
 assert.deepEqual(result.cleanup.errors,[{stage:'disable',code:'55P03'},{stage:'verify',code:'42501'}]);
 assert.equal(result.cleanup.verified,false);assert.ok(order.includes('verify_connect'));assert.ok(!JSON.stringify(result).includes('secret'));
});
test('verification failure alone prevents PASS, including enabled-but-expired control',async()=>{
 for(const config of [{verifyError:{code:'42501'}},{storedEnabled:true,effectiveEnabled:false},{storedEnabled:false,effectiveEnabled:true},{storedEnabled:null},{effectiveEnabled:null}]){
  const {connect}=cleanupFixture(config);const result=await runWithControlCleanup({connect,run:async()=>{},close:async()=>{}});
  assert.equal(result.status,'FAIL');assert.equal(result.primaryFailure,null);assert.equal(result.cleanup.disableCommitted,true);assert.equal(result.cleanup.verified,false);
 }
});
test('pool close and cleanup connection failures never skip disable or replace the primary error',async()=>{
 const {connect,order}=cleanupFixture({closeError:{code:'ECONNRESET'}});
 const result=await runWithControlCleanup({connect,run:async()=>{throw {code:'ERR_ASSERTION'};},close:async()=>{throw {message:'secret'};}});
 assert.equal(result.status,'FAIL');assert.equal(result.primaryFailure.code,'ERR_ASSERTION');assert.ok(order.includes('disable_query'));
 assert.deepEqual(result.cleanup.errors.map(x=>x.stage),['workload_connection_close','disable_connection_close','verify_connection_close']);
 const unavailable=await runWithControlCleanup({connect:()=>{throw {code:'ECONNREFUSED'};},run:async()=>{},close:async()=>{}});
 assert.equal(unavailable.status,'FAIL');assert.equal(unavailable.cleanup.errors.length,2);assert.equal(unavailable.cleanup.storedEnabled,null);
});

const {runWithSampler}=await import('./lib/operational-sampler.mjs');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('sampler ECONNRESET after workload completion settles before pool close and verified cleanup',{timeout:2000},async()=>{
 const started=deferred(),query=deferred(),{connect,order}=cleanupFixture();let calls=0;
 const outcome=runWithControlCleanup({connect,close:async()=>order.push('workload_close'),run:()=>runWithSampler({intervalMs:1,
  sample:async()=>{calls++;started.resolve();try{await query.promise;}finally{order.push('sample_settled');}},
  run:async()=>{await started.promise;order.push('workload_finished');}
 })});
 await started.promise;await delay(10);
 assert.equal(calls,1);assert.ok(!order.includes('workload_close'));assert.ok(!order.includes('disable_connect'));
 query.reject(Object.assign(new Error('Synthetic connection reset'),{code:'ECONNRESET'}));
 const result=await outcome;
 assert.equal(result.status,'FAIL');assert.equal(result.primaryFailure.code,'ECONNRESET');assert.equal(result.cleanup.status,'PASS');
 assert.ok(order.indexOf('sample_settled')<order.indexOf('workload_close'));
 assert.ok(order.indexOf('workload_close')<order.indexOf('disable_connect'));
 assert.ok(order.indexOf('disable_commit')<order.indexOf('verify_connect'));
 await delay(10);assert.equal(calls,1);
});
test('first sampler rejection stops its timer and waits for the workload even if it also fails',{timeout:2000},async()=>{
 const sampled=deferred(),work=deferred();let calls=0,settled=false;
 const error=Object.assign(new Error('First failure'),{code:'ECONNRESET'});
 const result=runWithSampler({intervalMs:1,sample:()=>{calls++;sampled.resolve();throw error;},run:()=>work.promise}).then(()=>null,e=>{settled=true;return e;});
 await sampled.promise;await delay(10);
 assert.equal(calls,1);assert.equal(settled,false);
 work.reject(Object.assign(new Error('Later workload failure'),{code:'ERR_ASSERTION'}));
 assert.equal(await result,error);await delay(10);assert.equal(calls,1);
});
test('earlier workload failure is preserved while the final sample is still awaited',{timeout:2000},async()=>{
 const started=deferred(),query=deferred();let settled=false;
 const first=Object.assign(new Error('Workload failure'),{code:'ERR_ASSERTION'});
 const result=runWithSampler({intervalMs:1,sample:()=>{started.resolve();return query.promise;},run:async()=>{await started.promise;throw first;}}).then(()=>null,e=>{settled=true;return e;});
 await started.promise;await delay(10);assert.equal(settled,false);
 query.reject(Object.assign(new Error('Later sample failure'),{code:'ECONNRESET'}));
 assert.equal(await result,first);
});
test('successful sampler has no overlap or callbacks after stop',{timeout:2000},async()=>{
 const started=deferred(),query=deferred(),work=deferred();let calls=0,active=0,peak=0;
 const result=runWithSampler({intervalMs:1,sample:async()=>{calls++;active++;peak=Math.max(peak,active);started.resolve();await query.promise;active--;},run:()=>work.promise});
 await started.promise;await delay(10);assert.equal(calls,1);
 work.resolve('finished');query.resolve();assert.equal(await result,'finished');
 const stoppedCalls=calls;await delay(10);assert.equal(calls,stoppedCalls);assert.equal(peak,1);assert.equal(active,0);
});
