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
