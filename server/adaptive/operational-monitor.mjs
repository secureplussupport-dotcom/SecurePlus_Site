// Privacy boundary: fixed numeric metrics and fixed alert codes only.
export const ALERT_RULES=Object.freeze([
 ['queue_backlog','queueDepth',100,'warning'],['queue_age','oldestEligibleMs',60000,'critical'],
 ['global_lease_limit','leases',3,'critical'],['expired_lease','expiredLeases',1,'warning'],
 ['retry_backlog','retryDepth',20,'warning'],['dead_letter','deadLetters',1,'critical'],
 ['quarantine','quarantined',1,'warning'],['erasure_age','oldestErasureMs',60000,'critical'],
 ['expiry_backlog','expiryBacklog',20,'warning'],['retention_backlog','retentionBacklog',1000,'warning'],
 ['lease_recovery','leaseRecoveries',5,'warning'],['generation_churn','generationConflicts',100,'warning'],
 ['scheduler_denial','schedulerDenials',10,'warning'],['connection_failure','connectionFailures',1,'critical'],
 ['projection_failure','projectionFailures',1,'critical'],['projection_slow','projectionP95Ms',1000,'warning'],
 ['kill_violation','acceptedAfterKill',1,'critical'],['connection_budget','purposeConnections',4,'critical'],
]);
const gauges=new Set(['queueDepth','oldestEligibleMs','leases','expiredLeases','retryDepth','deadLetters','quarantined','incompleteErasures','oldestErasureMs','expiryBacklog','retentionBacklog','dbConnections','leaseRecoveries','generationConflicts','purposeConnections']);
export function evaluateOperationalAlerts(metrics) {
  const allowed=new Set([...gauges,'schedulerDenials','connectionFailures','projectionFailures','projectionP95Ms','acceptedAfterKill']);
  if(!metrics||Object.keys(metrics).some(k=>!allowed.has(k))||Object.values(metrics).some(v=>!Number.isFinite(v)||v<0||v>Number.MAX_SAFE_INTEGER))throw new Error('Invalid aggregate metrics');
  return ALERT_RULES.filter(([,metric,threshold])=>(metrics[metric]??0)>=threshold).map(([code,,threshold,severity])=>({code,severity,threshold}));
}
export function createOperationalMonitor({clock=()=>Date.now()}={}) {
  const events=[];
  return {
    // Accepts the existing event contract, discards incident IDs and all extras.
    record(record) {
      const kind=['scheduler_denied','connection_failure','projection_failure','projection_success','runtime_accepted'].includes(record?.event)?record.event:null;
      if(!kind)return;
      const duration=Number.isFinite(record.durationMs)?Math.min(3600000,Math.max(0,record.durationMs)):0;
      events.push({kind,duration,at:clock()});
      if(events.length>10000)events.splice(0,events.length-10000);
    },
    sample(raw={}, {disabledSince=null,purposeConnections=0}={}) {
      const now=clock();while(events[0]?.at<now-300000)events.shift();
      const metrics={};for(const name of gauges)if(Object.hasOwn(raw,name))metrics[name]=Number(raw[name]);
      metrics.purposeConnections=purposeConnections;
      const count=kind=>events.filter(e=>e.kind===kind).length;
      Object.assign(metrics,{schedulerDenials:count('scheduler_denied'),connectionFailures:count('connection_failure'),projectionFailures:count('projection_failure'),acceptedAfterKill:disabledSince===null?0:events.filter(e=>e.kind==='runtime_accepted'&&e.at>disabledSince).length});
      const latencies=events.filter(e=>e.kind==='projection_success').map(e=>e.duration).sort((a,b)=>a-b);
      // At least 20 observations before reporting a p95.
      if(latencies.length>=20)metrics.projectionP95Ms=latencies[Math.ceil(latencies.length*.95)-1];
      return {metrics,alerts:evaluateOperationalAlerts(metrics),windowSeconds:300,saturated:events.length===10000};
    },
  };
}
