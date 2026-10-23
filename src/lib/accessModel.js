export const FREE_GENERATION_LIMIT = 50;
export const GENERATION_WINDOW_MS = 12 * 60 * 60 * 1000;
export const GUEST_QUESTION_LIMIT = 10;
export const FREE_STAR_LIMIT = 10;
export const PRO_MAX_SET_SIZE = 90;
export const PASS_PLANS = Object.freeze({
  sprint: {name:'Sprint Pass',days:30,amount:1199,currency:'usd'},
  comprehensive: {name:'Comprehensive Pass',days:90,amount:2499,currency:'usd'},
});
export const isProProfile=(profile,now=Date.now())=>Boolean(profile && (
  (profile.pro_pass_expires_at && Date.parse(profile.pro_pass_expires_at)>now) ||
  ['active','trialing','admin_permanent'].includes(profile.subscription_status) ||
  (profile.pro_trial_until && Date.parse(profile.pro_trial_until)>now) ||
  (profile.tier==='pro' && !profile.pro_pass_expires_at)
));
export function generationChoices(access,pro=false){
  const remaining=pro?90:Math.max(0,access?.remaining??0);
  return {sizes:[10,20,30].map(size=>({size,enabled:remaining>=size,left:Math.max(0,remaining-size)})),
    remainder:remaining>0&&remaining<30&&![10,20,30].includes(remaining)?remaining:null};
}
