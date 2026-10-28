import test from 'node:test';
import assert from 'node:assert/strict';
import {createBillingHistoryHandler,safeReceipt} from '../server/stripe/history.js';
import {flashcardMatch,textSegments} from '../src/lib/flashcardSearch.js';
import {smartReviewPreview} from '../src/lib/smartReviewPreview.js';
const owner='owner-account';
function setup({token=true,valid=true,stripeOwner=owner,customer='cus_owner',receipt='https://pay.stripe.com/receipts/test',failReceipt=false}={}){
 const queries=[];
 const admin={auth:{getUser:async value=>({data:{user:valid&&value==='valid'?{id:owner}:null},error:null})},from:table=>{
  const query={select:()=>query,eq:(key,value)=>{queries.push({table,key,value});return query;},order:()=>query,range:async()=>({data:[{checkout_session_id:'cs_test',plan:'sprint',amount:1199,currency:'usd',starts_at:'2026-10-01',expires_at:'2026-10-31',created_at:'2026-10-01'}],error:null}),maybeSingle:async()=>({data:{stripe_customer_id:'cus_owner',pro_pass_expires_at:'2026-10-31'},error:null})};return query;
 }};
 const stripe={checkout:{sessions:{retrieve:async()=>{if(failReceipt)throw Error('offline');return{client_reference_id:stripeOwner,customer,payment_intent:{latest_charge:{receipt_url:receipt}}};}}},invoices:{list:async()=>({data:[],has_more:false})}};
 const invoke=async(body={},method='POST')=>{
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(text){this.body=JSON.parse(text);}};
  await createBillingHistoryHandler({admin:()=>admin,stripe:()=>stripe})({method,headers:token?{authorization:'Bearer valid'}:{},body},res);return res;
 };return{invoke,queries};
}
test('billing requires server-verified identity; caller-supplied owner is ignored',async()=>{
 assert.equal((await setup({token:false}).invoke()).statusCode,401);assert.equal((await setup({valid:false}).invoke()).statusCode,401);
 const {invoke,queries}=setup();const r=await invoke({user_id:'victim'});assert.equal(r.statusCode,200);assert.equal(r.headers['cache-control'],'no-store, private');assert(queries.some(q=>q.table==='pro_pass_purchases'&&q.key==='user_id'&&q.value===owner));assert(!JSON.stringify(queries).includes('victim'));assert.equal(r.body.purchases[0].receiptUrl,'https://pay.stripe.com/receipts/test');assert(!JSON.stringify(r.body).includes('cus_owner'));
});
test('foreign or unsafe Stripe receipt never leaks; purchase survives receipt outage',async()=>{
 for(const options of [{stripeOwner:'victim'},{customer:'cus_victim'},{receipt:'https://evil.test/pay'},{failReceipt:true}]){const r=await setup(options).invoke();assert.equal(r.statusCode,200);assert.equal(r.body.purchases[0].receiptUrl,null);assert.equal(r.body.purchases[0].plan,'sprint');}
 assert.equal(safeReceipt('javascript:alert(1)'),null);assert.equal(safeReceipt('https://pay.stripe.com.evil.test/'),null);assert.equal(safeReceipt('https://invoice.stripe.com/i/test'),'https://invoice.stripe.com/i/test');
});
test('billing pagination and HTTP method are bounded',async()=>{assert.equal((await setup().invoke({page:-1})).statusCode,400);assert.equal((await setup().invoke({invoiceCursor:'../../secret'})).statusCode,400);assert.equal((await setup().invoke({},'GET')).statusCode,405);});
test('Smart Review preview derives due, shortest cooldown and weakest under-80 concept',()=>{
 assert.deepEqual(smartReviewPreview(null),{due:null,next:null,weakest:null});const s=smartReviewPreview({failed:[{cooldown_counter:0},{cooldown_counter:12},{cooldown_counter:3}],mastery:[{concept_tag:'a',score:80},{concept_tag:'b',score:20},{concept_tag:'c',score:5}]});assert.equal(s.due,1);assert.equal(s.next,3);assert.equal(s.weakest.concept_tag,'c');
});
test('flashcard search provides a literal highlight and match reason without HTML interpretation',()=>{
 const set={title:'Recovery',cards:[{term:'Recovery time objective',acronym:'RTO',concept_tags:['risk.bia-rto-rpo']}]};assert.equal(flashcardMatch(set,'#risk.bia').reason,'Concept tag');assert.equal(flashcardMatch(set,'time objective').reason,'Term');assert.equal(flashcardMatch(set,'zzz'),null);assert.deepEqual(textSegments('<script>','script'),[{text:'<',match:false},{text:'script',match:true},{text:'>',match:false}]);
});
