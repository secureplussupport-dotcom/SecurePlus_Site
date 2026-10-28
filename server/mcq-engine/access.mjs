import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { requireEnv } from '../../api/_utils.js';
import { buildMcqExam } from '../../src/lib/mcqExam.js';
import { generateSet, fisherYates, EngineError, learnerQuestion } from './engine.mjs';
export function guestOwner(req,res){
  // Signed, durable browser identity; no IP address or raw user agent is stored.
  const cookie=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('secureplus_diagnostic='))?.split('=')[1]||'';
  const [id,signature]=cookie.split('.');
  const sign=value=>createHmac('sha256',requireEnv('SUPABASE_SERVICE_ROLE_KEY')).update('guest-diagnostic:'+value).digest('hex');
  if(id&&/^[0-9a-f-]{36}$/.test(id)&&/^[0-9a-f]{64}$/.test(signature||'')&&timingSafeEqual(Buffer.from(signature),Buffer.from(sign(id))))return 'guest:'+id;
  const created=randomUUID();
  res.setHeader('set-cookie',`secureplus_diagnostic=${created}.${sign(created)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=315360000${process.env.NODE_ENV==='production'?'; Secure':''}`);
  if(req.query?.operation==='generate')throw new EngineError('Enable cookies and reload the diagnostic before starting.',400);
  return 'guest:'+created;
}
export async function accessRpc(client,name,args){
 const {data,error}=await client.rpc(name,args);
 if(error){const status=error.code==='P0001'&&name==='guest_diagnostic_create'?429:error.code==='42501'?403:error.code==='22023'?400:503;throw new EngineError(status===429?'Please wait before starting another diagnostic.':status===403?'This action is available with Pro.':status===400?'This set request is invalid.':'Practice access is temporarily unavailable. Please retry.',status);}return data;
}
export function chooseAccessSet(bank,state,count,mode,pro){
 if(mode==='diagnostic'){const chosen=[1,2,3,4,5].flatMap(ch=>fisherYates(bank.filter(q=>Number(q.chapter)===ch)).slice(0,2));if(chosen.length!==10)throw new EngineError('The diagnostic is temporarily unavailable.',503);return fisherYates(chosen);}
 if(mode==='smart')return generateSet(bank,state,count);
 if(mode==='exam')return buildMcqExam(bank.map(q=>({...q,opts:q.options,conceptTagIds:[q.concept_tag],ch:q.chapter})),count,pro).map(({opts,conceptTagIds,ch,...q})=>q);
 let eligible=bank;
 if(mode==='missed'){
  const failed=new Set(state.failed.map(q=>q.question_id));eligible=bank.filter(q=>failed.has(q.id));
 }
 if(eligible.length<count)throw new EngineError('Not enough matching questions. Choose a smaller batch.');
 return fisherYates(eligible).slice(0,count).map(q=>({...q,options:fisherYates(q.options),deck:3}));
}
export async function ownedSet(client,userId,id){
 const plan=await accessRpc(client,'practice_owned_set',{p_user_id:userId,p_request_id:id});
 if(!plan)throw new EngineError('Saved set not found.',404);
 if(plan.expired)throw new EngineError('This unfinished set expired after 12 hours. Generate a fresh set.',410);
 return plan;
}
export const guestQuestion=q=>({...learnerQuestion(q),correct:q.options.findIndex(o=>o.is_correct),explanation:q.explanation,feedback:q.options.map(o=>o.feedback||'')});

// Reveal only the graded question's pinned option explanations.
export const optionExplanations=q=>Object.fromEntries((q?.options||[]).map(o=>[o.id,o.is_correct?q.explanation||'':o.feedback||'']));
