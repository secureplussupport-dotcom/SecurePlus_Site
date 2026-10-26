import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PASS_PLANS,generationChoices,isProProfile,PRO_QUESTION_COUNTS } from '../src/lib/accessModel.js';
import { passLineItem,fulfillAccessPass } from '../server/stripe/access-pass.js';
import { createMcqHandler } from '../server/mcq-engine/http.mjs';
import { effectiveCatalogue } from '../server/mcq-engine/catalogue.mjs';
import { guestOwner } from '../server/mcq-engine/access.mjs';
import { pacingSummary } from '../src/lib/mcqPacing.js';
const user=randomUUID(),id=randomUUID();
const invoke=async(handler,operation,body={},token='test',cookie='')=>{const headers={};let data;const res={setHeader:(k,v)=>headers[k]=v,end:value=>data=JSON.parse(value)};await handler({method:'POST',headers:{authorization:token?`Bearer ${token}`:'','content-type':'application/json',cookie},query:{operation},body},res);return {status:res.statusCode,data,headers};};
test('one-time pass prices, durations, expiry and legacy subscriptions',async()=>{
 assert.deepEqual(Object.values(PASS_PLANS).map(p=>[p.days,p.amount]),[[30,1199],[90,2499]]);
 for(const key of Object.keys(PASS_PLANS)){const item=passLineItem(key);assert.equal(item.price_data.unit_amount,PASS_PLANS[key].amount);assert(!Object.hasOwn(item.price_data,'recurring'));}
 assert.throws(()=>passLineItem('monthly'));
 let grants=0;const client={rpc:async()=>{grants++;return {data:'expiry'};}};
 const paid={id:'cs_paid',mode:'payment',payment_status:'paid',currency:'usd',amount_total:1199,client_reference_id:user,metadata:{supabase_user_id:user,access_pass:'sprint'}};
 await fulfillAccessPass(client,paid);assert.equal(grants,1);
 for(const patch of [{payment_status:'unpaid'},{amount_total:1},{currency:'sgd'},{mode:'subscription'},{client_reference_id:id}])await assert.rejects(fulfillAccessPass(client,{...paid,...patch}));
 assert.equal(grants,1);assert.equal(isProProfile({pro_pass_expires_at:'2000-01-01'}),false);assert.equal(isProProfile({subscription_status:'active'}),true);
});
test('partial quota enables only affordable buttons and a remainder batch',()=>{
 const a=generationChoices({remaining:15});assert.deepEqual(a.sizes.map(x=>x.enabled),[true,false,false]);assert.equal(a.remainder,15);
 assert.equal(generationChoices({remaining:35}).remainder,null);assert.equal(generationChoices({remaining:0}).remainder,null);
});
test('guest lifetime identity uses a signed HttpOnly cookie and rejects tampering on generation',()=>{
 process.env.SUPABASE_SERVICE_ROLE_KEY||='test-only-signing-key';let cookie;
 guestOwner({headers:{},query:{operation:'access'}},{setHeader:(k,v)=>cookie=v});assert(cookie.includes('HttpOnly'));assert(cookie.includes('SameSite=Lax'));
 const raw=cookie.split(';')[0];const req={headers:{cookie:raw},query:{operation:'generate'}};
 assert.equal(guestOwner(req,{setHeader(){}}),guestOwner(req,{setHeader(){}}));
 assert.throws(()=>guestOwner({...req,headers:{cookie:raw.replace('secureplus_diagnostic=','secureplus_diagnostic=bad')}},{setHeader(){}}),/Enable cookies/);
});
test('API refuses free filter/count bypasses and reports quota rejection',async()=>{
 let create=0;const bank=effectiveCatalogue();const client={auth:{getUser:async()=>({data:{user:{id:user}}})},rpc:async(name,args)=>({data:name==='practice_access_status'?{isPro:false,maxSetSize:30,remaining:5}:name==='mcq_engine_state'?{version:0,mastery:[],failed:[],history:[]}:(create++,{quotaExceeded:true,access:{remaining:5}})})};
 const handler=createMcqHandler({admin:()=>client,enabled:()=>true,catalogue:async()=>bank});
 assert.equal((await invoke(handler,'generate',{set_size:90})).status,400);assert.equal((await invoke(handler,'generate',{set_size:10,filters:{chapter:'1'}})).status,403);assert.equal(create,0);
 const denied=await invoke(handler,'generate',{set_size:10});assert.equal(denied.status,429);assert.equal(denied.data.access.remaining,5);
});
test('expired or unowned allocations cannot resume, answer or reveal exam keys',async()=>{
 for(const allocation of [null,{expired:true},{mode:'exam',completed:false,questions:[]}]){
 const client={auth:{getUser:async()=>({data:{user:{id:user}}})},rpc:async()=>({data:allocation})};const handler=createMcqHandler({admin:()=>client,enabled:()=>true});
 const r=await invoke(handler,'exam-review',{session_id:id});assert.equal(r.status,allocation===null?404:allocation.expired?410:403);
 }
});
test('core and applied pacing thresholds are descriptive and do not alter mastery',()=>{
 const r=pacingSummary([{id:'a',difficulty:'core'},{id:'b',difficulty:'applied'}],[{elapsedMs:46000},{elapsedMs:75000}]);assert.deepEqual(r.rows.map(q=>q.targetMs),[45000,75000]);assert(r.rows[0].elapsedMs>r.rows[0].targetMs);assert.equal(r.rows[1].elapsedMs,r.rows[1].targetMs);
});

test('Pro question-count options cover every ten-question increment through ninety',()=>{
 const expected=[10,20,30,40,50,60,70,80,90];
 assert.deepEqual(PRO_QUESTION_COUNTS,expected);
 const pro=generationChoices({remaining:0},true);
 assert.deepEqual(pro.sizes.map(option=>option.size),expected);
 assert(pro.sizes.every(option=>option.enabled));
 assert.equal(pro.remainder,null);
 assert.deepEqual(generationChoices({remaining:50},false).sizes.map(option=>option.size),[10,20,30]);
});
