import postgres from 'postgres';
import { createOperationalEvents } from './operations.mjs';

const purposes=Object.freeze({ingest:'adaptive_ingest',worker:'adaptive_worker',erasure:'adaptive_erasure'});
const pools=new Map();
const safeCodes=new Set(['40001','40P01','53300','57P01','08006','57014','55P03','55000','23505','23514','42501']);
const failure=(code='adaptive_connection_denied')=>Object.assign(new Error('Adaptive database unavailable'),{code});
function validate(config,env) {
  if(typeof window!=='undefined'||import.meta.env?.VITE||process.env.NODE_ENV==='production'||process.env.VERCEL||process.env.VERCEL_ENV||env.NODE_ENV==='production'||env.VERCEL||env.VERCEL_ENV||
    env.ADAPTIVE_RUNTIME_ENVIRONMENT!=='disposable_local'||config.mode!=='production_shape_validation'||!purposes[config.purpose])throw failure();
  if(Object.keys(env).some(k=>/^(VITE_|NEXT_PUBLIC_|PUBLIC_).*ADAPTIVE.*(URL|PASSWORD|SECRET|KEY)/i.test(k)))throw failure();
  let url;try{url=new URL(config.connectionString);}catch{throw failure();}
  const role=purposes[config.purpose],user=decodeURIComponent(url.username),password=decodeURIComponent(url.password);
  if(!['postgres:','postgresql:'].includes(url.protocol)||!/^aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com$/.test(url.hostname)||
    url.port!=='6543'||url.pathname!=='/postgres'||url.search||url.hash||
    !new RegExp(`^${role}_login\\.[a-z0-9]{20}$`).test(user)||password.length<16||password.startsWith('eyJ')||password.startsWith('sb_secret_')||
    password===env.SUPABASE_SERVICE_ROLE_KEY||config.max!==1||config.tls?.rejectUnauthorized!==true||
    typeof config.tls.ca!=='string'||!config.tls.ca.includes('-----BEGIN CERTIFICATE-----'))throw failure();
  return {role,user:user.split('.')[0],url};
}

// No network opens until begin(). Production execution is independently hard-denied.
// driverFactory is injected for disposable local proof; no real pooler credential is used.
export function createProductionShapedDatabase(config={}, {env=process.env,driverFactory=postgres,log}={}) {
  const emit=createOperationalEvents(log);let parsed;
  try{parsed=validate(config,env);}catch{emit('connection_denied','disabled');throw failure();}
  const key=config.purpose;
  if(pools.has(key)) {
    const existing=pools.get(key);
    if(existing.identity!==config.connectionString||existing.ca!==config.tls.ca||existing.factory!==driverFactory)throw failure();
    return existing.api;
  }
  let raw;try{raw=driverFactory(config.connectionString,{max:1,max_pipeline:1,prepare:false,ssl:{rejectUnauthorized:true,ca:config.tls.ca},connect_timeout:3,idle_timeout:5,max_lifetime:60,onnotice:()=>{},debug:false});}catch{emit('connection_failure','unavailable');throw failure();}
  let closed=false;
  const api=(...args)=>api.begin(tx=>tx(...args));
  api.begin=async fn=>{
    if(closed)throw failure();
    let reserved,timer,expired=false;
    try {
      const pending=raw.reserve().then(r=>{if(expired){r.release();throw failure();}return r;});
      reserved=await Promise.race([pending,new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(failure());},3000);})]);
      clearTimeout(timer);
      const transaction=async fn=>{
        await reserved`begin`;
        try{const result=await fn(reserved);await reserved`commit`;return result;}
        catch(error){await reserved`rollback`.catch(()=>{});throw error;}
      };
      return await transaction(async tx=>{
        const budget=config.purpose==='worker'?10000:5000;
        await tx`select set_config('lock_timeout','1000',true),set_config('statement_timeout',${String(budget)},true),set_config('idle_in_transaction_session_timeout',${String(budget)},true)`;
        // Every transaction resets role/timeouts. Nothing relies on prior pool state.
        const [identity]=await tx`select r.rolname,r.rolsuper,r.rolbypassrls,r.rolcreatedb,r.rolcreaterole from pg_roles r where r.rolname=session_user`;
        if(identity?.rolname!==parsed.user||identity.rolsuper||identity.rolbypassrls||identity.rolcreatedb||identity.rolcreaterole)throw failure();
        const memberships=await tx`select r.rolname from pg_roles r where r.rolname<>session_user and pg_has_role(session_user,r.oid,'MEMBER')`;
        if(memberships.length!==1||memberships[0].rolname!==parsed.role)throw failure();
        await tx.unsafe(`set local role ${parsed.role}`);
        let active=true,deadline;
        const wrapped=new Proxy(tx,{apply(target,thisArg,args){if(!active||closed)throw failure('57014');return Reflect.apply(target,thisArg,args);},get(target,p){const value=Reflect.get(target,p);if(typeof value!=='function')return value;return (...args)=>{if(!active||closed)throw failure('57014');return value.apply(target,args);};}});
        try{return await Promise.race([Promise.resolve().then(()=>fn(wrapped)),new Promise((_,reject)=>{deadline=setTimeout(()=>{active=false;reject(failure('57014'));},budget);})]);}
        finally{active=false;clearTimeout(deadline);}
      });
    }catch(error){emit('connection_failure','unavailable');throw failure(safeCodes.has(error?.code)?error.code:'adaptive_connection_failure');}
    finally{clearTimeout(timer);reserved?.release();}
  };
  api.end=async()=>{closed=true;pools.delete(key);try{await raw.end({timeout:1});}catch{emit('connection_failure','unavailable');throw failure();}};
  pools.set(key,{api,identity:config.connectionString,ca:config.tls.ca,factory:driverFactory});
  return api;
}
// Explicit idle/suspension hook for a future platform lifecycle integration.
export async function closeProductionShapedPools(){await Promise.all([...pools.values()].map(p=>p.api.end()));}
