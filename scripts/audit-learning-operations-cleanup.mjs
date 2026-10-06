import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {psql,saveEvidence,connect} from './lib/operational-rehearsal.mjs';
import {runWithControlCleanup,disableAndVerifyControl} from './lib/operational-cleanup.mjs';
const checks=[],results=[];
const check=(condition,label)=>{assert.ok(condition,label);checks.push(label);};
async function run(args){
 return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['--unhandled-rejections=strict','scripts/rehearse-learning-operations.mjs',...args],{stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);
  child.on('error',reject);child.on('close',(code,signal)=>resolve({code,signal,stdout,stderr}));
 });
}
function readControl(){
 return JSON.parse(psql("select json_build_object('storedEnabled',enabled,'effectiveEnabled',(adaptive_private.read_runtime_control()->>'enabled')::boolean,'killSwitch',(adaptive_private.read_runtime_control()->>'killSwitch')::boolean) from adaptive_private.runtime_control where singleton;"));
}
saveEvidence('cleanup-regression',{status:'RUNNING'});
for(const scenario of [
 {name:'forced_failure_after_enable',args:['--fail-after-enable'],prefix:'forced-failure-',code:'FORCED_AFTER_ENABLE'},
 {name:'sampler_query_failure',args:['--fail-sampler-query'],prefix:'sampler-failure-',code:'CONNECTION_CLOSED'},
 {name:'full_success',args:[],prefix:'',code:null}
]){
 const fault=scenario.code!==null;
 const execution=await run(scenario.args);
 const prefix=scenario.prefix;
 const result=JSON.parse(readFileSync(`docs/evidence/phase-2b4d/${prefix}result.json`,'utf8'));
 const control=JSON.parse(readFileSync(`docs/evidence/phase-2b4d/${prefix}final-control.json`,'utf8'));
 check(execution.signal===null&&execution.code===(fault?1:0),'Expected process exit for '+scenario.name);
 check(result.status===(fault?'FAIL':'PASS'),'Result matches actual exit');
 check(fault?result.primaryFailure?.code===scenario.code:result.primaryFailure===null,'Primary failure is preserved independently');
 check(control.status==='PASS'&&control.disableCommitted&&control.verified,'Cleanup commits disable and verifies it');
 const independent=readControl();
 check(independent.storedEnabled===false&&independent.effectiveEnabled===false&&independent.killSwitch===true,'Independent psql observes disabled stored and effective control');
 const receipt=JSON.parse((fault?execution.stderr:execution.stdout).trim().split('\n').at(-1));
 check(receipt.status===result.status&&receipt.cleanup.status==='PASS','Console receipt includes verified cleanup');
 if(fault)check(!execution.stdout.includes('"status":"PASS"'),'Forced failure never prints a PASS receipt');
 const events=result.lifecycle;
 check(events.indexOf('workload_closed')>events.indexOf('workload_close_started')&&events.indexOf('cleanup_connection_opened')>events.indexOf('workload_closed'),'Workload connections settle before cleanup opens fresh connections');
 if(scenario.name==='sampler_query_failure'){
  const ordered=['sampling_started','sampler_query_in_flight','sampler_query_failed','sampling_settled','workload_close_started','workload_closed','cleanup_connection_opened'];
  check(ordered.every((event,i)=>events.indexOf(event)>=0&&(i===0||events.indexOf(event)>events.indexOf(ordered[i-1]))),'Actual sampler failure settles before workload close and disable/verification');
  check(result.checks.includes('Sampler fault occurs with stored control enabled'),'Sampler failure was injected after actual enablement');
  check(result.samplerFailureCode===result.primaryFailure.code&&receipt.primaryFailure.code===result.samplerFailureCode,'Original sampler error code is retained in the persisted and console failure receipts');
  check(events.filter(x=>x==='sampler_query_failed').length===1,'First sampler error stops subsequent samples');
  check(!execution.stderr.includes('UnhandledPromiseRejection')&&!execution.stderr.includes('triggerUncaughtException'),'Strict rejection process exits through the final failure receipt');
 }
 results.push({scenario:scenario.name,exitCode:execution.code,status:result.status,primaryFailure:result.primaryFailure,cleanup:control,lifecycle:events,samplerFailureCode:result.samplerFailureCode,independentControl:independent});
}
// A real permission failure on the fresh verification connection proves that
// failed cleanup remains visible alongside the original rehearsal failure.
let connections=0;
try{
 const result=await runWithControlCleanup({
  run:async()=>{
   psql('select adaptive_private.set_runtime_control(true,3600);');
   throw Object.assign(new Error('Deliberate failure'),{code:'FORCED_AFTER_ENABLE'});
  },close:async()=>{},connect:()=>{
   const sql=connect();
   if(++connections!==2)return sql;
   return {begin:work=>sql.begin(async tx=>{await tx`set local role adaptive_worker`;return work(tx);}),end:options=>sql.end(options)};
  }
 });
 check(result.status==='FAIL'&&result.primaryFailure?.code==='FORCED_AFTER_ENABLE','Real verification failure preserves the primary error');
 check(result.cleanup.status==='FAIL'&&result.cleanup.disableCommitted&&!result.cleanup.verified,'A committed disable alone cannot produce PASS');
 check(result.cleanup.errors.some(x=>x.stage==='verify'&&x.code==='42501'),'Real SQL permission error is separately reported');
 const independent=readControl();
 check(independent.storedEnabled===false&&independent.effectiveEnabled===false&&independent.killSwitch===true,'Independent read confirms disable despite deliberately denied verification');
 results.push({scenario:'primary_and_verification_failure',status:result.status,primaryFailure:result.primaryFailure,cleanup:result.cleanup,independentControl:independent});
}finally{
 const cleanup=await disableAndVerifyControl(connect);
 check(cleanup.status==='PASS','Fault-test harness also disables and verifies before exiting');
}
saveEvidence('cleanup-regression',{status:'PASS',assertions:checks.length,checks,results});
console.log(JSON.stringify({status:'PASS',assertions:checks.length,scenarios:results.map(({scenario,exitCode,independentControl})=>({scenario,exitCode,independentControl}))}));
