import {getBearerToken, getJsonBody, getStripe, getSupabaseAdmin, json} from '../../api/_utils.js';
const objectId=value=>typeof value==='string'?value:value?.id;
export function safeReceipt(value){
 try{const url=new URL(value);return url.protocol==='https:'&&['pay.stripe.com','invoice.stripe.com'].includes(url.hostname)?url.href:null;}catch{return null;}
}
export function createBillingHistoryHandler({admin=getSupabaseAdmin,stripe=getStripe}={}){
 return async(req,res)=>{
  res.setHeader('cache-control','no-store, private');
  if(req.method!=='POST'){res.setHeader('allow','POST');return json(res,405,{error:'Method not allowed'});}
  try{
   const token=getBearerToken(req);if(!token)return json(res,401,{error:'Sign in to view billing.'});
   const db=admin();const {data:auth,error:authError}=await db.auth.getUser(token);
   if(authError||!auth?.user)return json(res,401,{error:'Your session expired. Sign in again.'});
   const body=await getJsonBody(req),page=Number(body.page??0);
   if(!Number.isInteger(page)||page<0||page>10000)return json(res,400,{error:'Invalid history page.'});
   const userId=auth.user.id;
   const {data:profile,error:profileError}=await db.from('profiles').select('stripe_customer_id,pro_pass_expires_at,subscription_status,subscription_current_period_end').eq('id',userId).maybeSingle();
   if(profileError)throw profileError;
   const {data:rows,error}=await db.from('pro_pass_purchases').select('checkout_session_id,plan,amount,currency,starts_at,expires_at,created_at').eq('user_id',userId).order('created_at',{ascending:false}).order('checkout_session_id',{ascending:false}).range(page*20,page*20+20);
   if(error)throw error;
   const payments=stripe();
   const purchases=await Promise.all((rows||[]).slice(0,20).map(async row=>{
    let receiptUrl=null;
    try{
     const session=await payments.checkout.sessions.retrieve(row.checkout_session_id,{expand:['payment_intent.latest_charge']});
     // Both the stored owner and Stripe's signed checkout ownership must agree.
     const owner=session.client_reference_id||session.metadata?.supabase_user_id;
     if(owner===userId&&(!profile?.stripe_customer_id||objectId(session.customer)===profile.stripe_customer_id))receiptUrl=safeReceipt(session.payment_intent?.latest_charge?.receipt_url);
    }catch{/* Keep the purchase visible when Stripe cannot currently return its receipt. */}
    return{kind:'pass',id:row.checkout_session_id,plan:row.plan,amount:row.amount,currency:row.currency,start:row.starts_at,expiry:row.expires_at,purchasedAt:row.created_at,receiptUrl};
   }));
   let invoices=[],invoiceCursor=null,invoiceError=false;
   if(profile?.stripe_customer_id&&(page===0||body.invoiceCursor)){
    if(body.invoiceCursor&&!/^in_[A-Za-z0-9]+$/.test(body.invoiceCursor))return json(res,400,{error:'Invalid receipt page.'});
    try{
     const result=await payments.invoices.list({customer:profile.stripe_customer_id,status:'paid',limit:20,...(body.invoiceCursor?{starting_after:body.invoiceCursor}:{})});
     invoices=result.data.filter(row=>objectId(row.customer)===profile.stripe_customer_id).map(row=>({kind:'subscription',id:row.id,plan:'Existing subscription',amount:row.amount_paid,currency:row.currency,start:new Date(row.period_start*1000).toISOString(),expiry:new Date(row.period_end*1000).toISOString(),purchasedAt:new Date(row.created*1000).toISOString(),receiptUrl:safeReceipt(row.hosted_invoice_url)}));
     invoiceCursor=result.has_more?result.data.at(-1)?.id:null;
    }catch{invoiceError=true;}
   }
   return json(res,200,{purchases:[...purchases,...invoices],hasMore:(rows?.length||0)>20,invoiceCursor,invoiceError,access:{expiry:profile?.pro_pass_expires_at||profile?.subscription_current_period_end||null,type:profile?.pro_pass_expires_at?'Pro pass':['active','trialing'].includes(profile?.subscription_status)?'Existing subscription':'Free'}});
  }catch{return json(res,503,{error:'Billing history is temporarily unavailable. Try again.'});}
 };
}
export default createBillingHistoryHandler();
