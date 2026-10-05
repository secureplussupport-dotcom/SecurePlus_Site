import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {psql,saveEvidence,connect} from './lib/operational-rehearsal.mjs';
import {runWithControlCleanup,disableAndVerifyControl} from './lib/operational-cleanup.mjs';
const checks=[],results=[];
const check=(condition,label)=>{assert.ok(condition,label);checks.push(label);};
async function run(args){
 return new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['scripts/rehearse-learning-operations.mjs',...args],{stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);
  child.on('error',reject);child.on('exit',(code,signal)=>resolve({code,signal,stdout,stderr}));
 });
}
function readControl(){
 return JSON.parse(psql("select json_build_object('storedEnabled',enabled,'effectiveEnabled',(adaptive_private.read_runtime_control()->>'enabled')::boolean,'killSwitch',(adaptive_private.read_runtime_control()->>'killSwitch')::boolean) from adaptive_private.runtime_control where singleton;"));
}
saveEvidence('cleanup-regression',{status:'RUNNING'});
for(const fault of [true,false]){
 const execution=await run(fault?['--fail-after-enable']:[]);
 const prefix=fault?'forced-failure-':'';
 const result=JSON.parse(readFileSync(`docs/evidence/phase-2b4d/${prefix}result.json`,'utf8'));
 const control=JSON.parse(readFileSync(`docs/evidence/phase-2b4d/${prefix}final-control.json`,'utf8'));
 check(execution.signal===null&&execution.code===(fault?1:0),'Expected process exit for '+(fault?'forced failure':'success'));
 check(result.status===(fault?'FAIL':'PASS'),'Result matches actual exit');
 check(fault?result.primaryFailure?.code==='FORCED_AFTER_ENABLE':result.primaryFailure===null,'Primary failure is preserved independently');
 check(control.status==='PASS'&&control.disableCommitted&&control.verified,'Cleanup commits disable and verifies it');
 const independent=readControl();
 check(independent.storedEnabled===false&&independent.effectiveEnabled===false&&independent.killSwitch===true,'Independent psql observes disabled stored and effective control');
 const receipt=JSON.parse((fault?execution.stderr:execution.stdout).trim().split('\n').at(-1));
 check(receipt.status===result.status&&receipt.cleanup.status==='PASS','Console receipt includes verified cleanup');
 if(fault)check(!execution.stdout.includes('"status":"PASS"'),'Forced failure never prints a PASS receipt');
 results.push({scenario:fault?'forced_failure_after_enable':'full_success',exitCode:execution.code,status:result.status,primaryFailure:result.primaryFailure,cleanup:control,independentControl:independent});
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
