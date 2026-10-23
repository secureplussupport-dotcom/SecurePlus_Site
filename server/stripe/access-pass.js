import { PASS_PLANS } from '../../src/lib/accessModel.js';
export function passLineItem(key){
 const plan=PASS_PLANS[key];if(!plan)throw new Error('Choose a Sprint or Comprehensive Pass. Refresh the pricing page.');
 return {price_data:{currency:plan.currency,unit_amount:plan.amount,product_data:{name:`SecurePlus Pro ${plan.name}`,description:`${plan.days} days of Pro access. One payment. No automatic renewal.`}},quantity:1};
}
export async function fulfillAccessPass(supabase,session){
 const plan=PASS_PLANS[session.metadata?.access_pass];
 if(!plan||session.mode!=='payment'||session.payment_status!=='paid'||session.currency!==plan.currency||session.amount_total!==plan.amount)throw new Error('This checkout is not a paid SecurePlus access pass.');
 const userId=session.metadata?.supabase_user_id;
 if(!userId||session.client_reference_id!==userId)throw new Error('Pass owner mismatch.');
 const {data,error}=await supabase.rpc('grant_pro_access_pass',{p_user_id:userId,p_session_id:session.id,p_plan:session.metadata.access_pass,p_amount:session.amount_total,p_currency:session.currency});
 if(error)throw error;return data;
}
