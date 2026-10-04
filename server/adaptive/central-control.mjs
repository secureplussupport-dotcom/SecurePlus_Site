import { localBoundaryEnabled } from './operations.mjs';

const denied = () => ({ enabled: false, killSwitch: true });
// Unwired, uncached read. The database barrier is authoritative even when a
// process retains an old response. External control failure never means enabled.
export function createCentralControlReader({sql,readEnvironment=()=>process.env,clock=()=>Date.now(),timeoutMs=500}={}) {
  if (!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>1000) throw new Error('Invalid control deadline');
  return async () => {
    if (!localBoundaryEnabled(readEnvironment())||!sql) return denied();
    let timer;
    try {
      const rows=await Promise.race([sql`select adaptive_private.read_runtime_control() as control`,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Unavailable')),timeoutMs);})]);
      const c=rows[0]?.control,now=clock(),observed=Date.parse(c?.observedAt),until=Date.parse(c?.validUntil);
      if(c?.enabled!==true||c.killSwitch!==false||!Number.isSafeInteger(c.epoch)||c.epoch<1||!Number.isFinite(observed)||Math.abs(now-observed)>1000||!Number.isFinite(until)||until<=now) return denied();
      return {enabled:true,killSwitch:false,epoch:c.epoch};
    } catch { return denied(); } finally { clearTimeout(timer); }
  };
}
