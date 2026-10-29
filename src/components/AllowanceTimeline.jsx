import {useEffect,useState} from 'react';
import {ArrowRight,Clock3} from 'lucide-react';
import {allowanceTimeline,quotaDisplay} from '../lib/dashboardMetrics.js';
import './AllowanceTimeline.css';

function refillClock(at,now) {
  const date=new Date(at);
  const day=date.toDateString()===new Date(now).toDateString()?'Today':'Tomorrow';
  return `${day}, ${date.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}`;
}
function RefillTime({at,now,fallback}) {
  if(!at)return <span>{fallback}</span>;
  const date=new Date(at);
  const minutes=Math.max(0,Math.ceil((date.getTime()-now)/60000));
  const wait=minutes>=60?`${Math.floor(minutes/60)}h ${minutes%60}m`:`${minutes}m`;
  return <span><time dateTime={at}>{refillClock(at,now)}</time><small>in {wait}</small></span>;
}

export function AllowanceTimeline({quota,t,onUpgrade,onRefresh}) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{
    setNow(Date.now());
    if(!quota?.resetAt)return;
    const timer=setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(timer);
  },[quota?.resetAt]);
  const schedule=allowanceTimeline(quota,now),display=quotaDisplay(quota,now);
  const capped=display&&!display.refreshing&&display.remaining===0;
  const ready=schedule.status==='ready';
  const headline=ready?(schedule.canPracticeNow?'You can practise now.':`Practise again: ${refillClock(schedule.nextOneAt,now)}`):
    schedule.status==='refreshing'?'Updating your allowance…':display?.remaining>0?'You can practise now.':'Checking your allowance…';
  return <section className="allowance-timeline" aria-label="Rolling practice allowance" style={{'--al-text':t.text,'--al-muted':t.textSec,'--al-panel':t.panel,'--al-surface':t.surface,'--al-border':t.border,'--al-accent':t.purple||'#a58aff'}}>
    <header><div><Clock3 size={18} aria-hidden="true"/><strong role="status">{headline}</strong></div>{ready&&<span>{schedule.remaining} of {schedule.limit} available</span>}</header>
    {ready&&schedule.pending>0&&<dl>
      <div><dt>Next 1 back</dt><dd><RefillTime at={schedule.nextOneAt} now={now} fallback="Not scheduled"/></dd></div>
      <div><dt>Next 10 back</dt><dd><RefillTime at={schedule.nextTenAt} now={now} fallback={`Only ${schedule.pending} pending`}/></dd></div>
      <div><dt>All {schedule.limit} available</dt><dd><RefillTime at={schedule.fullAt} now={now} fallback="Now"/></dd></div>
    </dl>}
    {ready&&schedule.nextSetAt&&display?.remaining>0&&display.remaining<10&&<p>A 10-question set is available <RefillTime at={schedule.nextSetAt} now={now}/>.</p>}
    {!ready&&<p>{schedule.status==='refreshing'?'Refreshing from the server before showing new capacity.':'Refill times are unavailable.'} {onRefresh&&<button type="button" className="al-refresh" onClick={onRefresh}>Refresh allowance</button>}</p>}
    {ready&&schedule.pending>0&&<p>Each set’s questions return 12 hours after the set is created.</p>}
    {capped&&onUpgrade&&<button type="button" className="btn btn-primary al-upgrade" onClick={onUpgrade}>Unlock unlimited MCQs with Pro <ArrowRight size={17}/></button>}
  </section>;
}
