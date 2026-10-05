// Local rehearsal lifecycle only. A TTL expiry is not a confirmed disable.
const codes=new Set(['FORCED_AFTER_ENABLE','CONTROL_NOT_DISABLED','ECONNREFUSED','ECONNRESET','CONNECT_TIMEOUT','CONNECTION_CLOSED','CONNECTION_ENDED','ERR_ASSERTION']);
export function failureCode(error){
 const code=error?.code;
 return typeof code==='string'&&(codes.has(code)||/^[0-9]{2}[A-Z0-9]{3}$/.test(code))?code:'REHEARSAL_ERROR';
}

export async function disableAndVerifyControl(connect){
 const result={status:'FAIL',disableCommitted:false,verified:false,storedEnabled:null,effectiveEnabled:null,killSwitch:null,errors:[]};
 async function transaction(stage,work){
  let sql;
  try{
   sql=connect();
   await sql.begin(async tx=>{
    await tx`set local lock_timeout='5s'`;
    await tx`set local statement_timeout='8s'`;
    await work(tx);
   });
   return true;
  }catch(error){result.errors.push({stage,code:failureCode(error)});return false;}
  finally{
   try{await sql?.end({timeout:1});}
   catch(error){result.errors.push({stage:stage+'_connection_close',code:failureCode(error)});}
  }
 }
 // Use fresh administrative connections: the workload may have closed its
 // pools, aborted a transaction, restarted the server, or restored the DB.
 result.disableCommitted=await transaction('disable',async tx=>{
  await tx`select adaptive_private.set_runtime_control(false,60)`;
 });
 // A separate connection observes committed state. Attempt this even when
 // disable failed; report that failure independently of the observed flag.
 result.verified=await transaction('verify',async tx=>{
  const rows=await tx`select enabled as stored_enabled,adaptive_private.read_runtime_control() as control from adaptive_private.runtime_control where singleton`;
  const row=rows.length===1?rows[0]:null;
  result.storedEnabled=typeof row?.stored_enabled==='boolean'?row.stored_enabled:null;
  result.effectiveEnabled=typeof row?.control?.enabled==='boolean'?row.control.enabled:null;
  result.killSwitch=typeof row?.control?.killSwitch==='boolean'?row.control.killSwitch:null;
  if(result.storedEnabled!==false||result.effectiveEnabled!==false||result.killSwitch!==true){
   throw Object.assign(new Error('Control disable not verified'),{code:'CONTROL_NOT_DISABLED'});
  }
 });
 if(result.disableCommitted&&result.verified&&result.errors.length===0)result.status='PASS';
 return result;
}

export async function runWithControlCleanup({run,close,connect}){
 let primaryFailure=null;
 try{await run();}catch(error){primaryFailure={code:failureCode(error)};}
 const poolErrors=[];
 try{await close();}catch(error){poolErrors.push({stage:'workload_connection_close',code:failureCode(error)});}
 const cleanup=await disableAndVerifyControl(connect);
 cleanup.errors.unshift(...poolErrors);
 if(poolErrors.length)cleanup.status='FAIL';
 return {status:!primaryFailure&&cleanup.status==='PASS'?'PASS':'FAIL',primaryFailure,cleanup};
}
