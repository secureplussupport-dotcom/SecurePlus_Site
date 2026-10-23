import test from 'node:test';
import assert from 'node:assert/strict';
import {createLiveRefresh,progressOwner} from '../src/lib/liveRefresh.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('simultaneous readers share a request and mutations queue exactly one fresh follow-up',async()=>{
 const first=deferred(),second=deferred();let calls=0;const values=[];
 const resource=createLiveRefresh(()=>{calls++;return (calls===1?first:second).promise;},v=>values.push(v),assert.fail);
 const a=resource.refresh();assert.equal(a,resource.refresh());resource.refresh({followUp:true});resource.refresh({followUp:true});
 await tick();assert.equal(calls,1);first.resolve('before mutation');await a;await tick();assert.equal(calls,2);
 second.resolve('after mutation');await tick();assert.deepEqual(values,['before mutation','after mutation']);resource.dispose();
});
test('discarded owner requests cannot publish after account switch or unmount',async()=>{
 const request=deferred(),values=[];const resource=createLiveRefresh(()=>request.promise,v=>values.push(v),assert.fail);
 const pending=resource.refresh();await tick();resource.refresh({followUp:true});resource.dispose();request.resolve('old owner');await pending;
 assert.deepEqual(values,[]);await resource.refresh();assert.deepEqual(values,[]);
 assert.notEqual(progressOwner({id:'one',authProvider:'supabase'}),progressOwner({id:'two',authProvider:'supabase'}));
 assert.notEqual(progressOwner(null),progressOwner({email:'guest',authProvider:'local'}));
});
test('failed refresh preserves the last successful value and allows retry',async()=>{
 let fail=false;const values=[],errors=[];const resource=createLiveRefresh(async()=>{if(fail)throw new Error('Offline');return 8;},v=>values.push(v),e=>errors.push(e.message));
 await resource.refresh();fail=true;assert.equal(await resource.refresh(),null);assert.deepEqual(values,[8]);assert.deepEqual(errors,['Offline']);
 fail=false;await resource.refresh();assert.deepEqual(values,[8,8]);resource.dispose();
});

test('late failures from an unmounted view cannot replace a new owner’s state',async()=>{
 const request=deferred(),errors=[];const resource=createLiveRefresh(()=>request.promise,assert.fail,e=>errors.push(e.message));
 const pending=resource.refresh();await tick();resource.dispose();request.reject(new Error('Old account went offline'));await pending;assert.deepEqual(errors,[]);
});
