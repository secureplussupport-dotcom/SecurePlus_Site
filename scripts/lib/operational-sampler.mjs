// Keep timer work inside the awaited rehearsal lifecycle. The timer callback
// itself never returns a rejecting promise, and samples never overlap.
export async function runWithSampler({sample,run,intervalMs=20}){
 let stopped=false,inFlight=null,failed=false,firstFailure,value;
 const rememberFailure=error=>{if(!failed){failed=true;firstFailure=error;}};
 const timer=setInterval(()=>{
  if(stopped||inFlight)return;
  inFlight=Promise.resolve().then(sample).catch(error=>{
   rememberFailure(error);
   stopped=true;
   clearInterval(timer);
  }).finally(()=>{inFlight=null;});
 },intervalMs);
 try{value=await run();}catch(error){rememberFailure(error);}
 finally{
  stopped=true;
  clearInterval(timer);
  // No new callback can start after stop, even if its timer was already queued.
  // Settle an existing sample before run() can reject into connection cleanup.
  await inFlight;
 }
 if(failed)throw firstFailure;
 return value;
}
