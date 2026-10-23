import { useEffect, useState } from 'react';
import { Target, Layers3, Flame, Infinity as InfinityIcon, Clock3 } from 'lucide-react';
import { activityAccuracy, quotaDisplay, streakWeek } from '../lib/dashboardMetrics.js';
import './DashboardMetrics.css';

function Ring({value,color,children,pending=false}) {
  return <div className={`dm-ring ${pending?'dm-ring-pending':''}`} aria-hidden="true">
    <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="40" pathLength="100" style={{stroke:color,opacity:!pending&&value===0?0:1,strokeDasharray:pending?'2 7':`${value*100} 100`}} transform="rotate(-90 50 50)"/></svg>
    <span>{children}</span>
  </div>;
}
export function DashboardMetrics({profile,streak,tier,t,quota=null}) {
  const isPro=tier==='pro';
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{
    if(isPro || !quota?.resetAt)return;
    setNow(Date.now());const id=setInterval(()=>setNow(Date.now()),30000);return()=>clearInterval(id);
  },[isPro,quota?.resetAt]);
  const activity=profile.status==='ready'?profile.activity:null;
  const accuracy=activityAccuracy(activity), allowance=quotaDisplay(quota,now);
  const week=streakWeek(streak?.streak || 0,Boolean(streak?.completedToday));
  return <section className="dashboard-metrics" aria-busy={profile.status==='loading'} aria-label="Your practice metrics" style={{'--dm-text':t.text,'--dm-muted':t.textSec,'--dm-panel':t.panel,'--dm-surface':t.surface,'--dm-border':t.border}}>
    <article className="dm-card dm-accuracy" style={{'--dm-accent':t.accent}}>
      <header><span className="dm-icon"><Target size={18}/></span><h3>Accuracy</h3></header>
      <div className="dm-main"><strong className="dm-number">{accuracy==null?'—':accuracy}<small>{accuracy==null?'':'%'}</small></strong><Ring value={(accuracy || 0)/100} color={t.accent}><Target size={21}/></Ring></div>
      <p>MCQ · Exam · Daily</p>
      <footer>{activity?.total?`${activity.correct.toLocaleString()} correct / ${activity.total.toLocaleString()} answered`:profile.status==='loading'?'Loading…':profile.status==='error'?'Progress unavailable':'No answers yet.'}</footer>
    </article>
    <article className="dm-card dm-completed" style={{'--dm-accent':t.green}}>
      <header><span className="dm-icon"><Layers3 size={18}/></span><h3>Questions completed</h3></header>
      <div className="dm-main"><strong className="dm-number">{activity?activity.total.toLocaleString():'—'}</strong><div className="dm-card-stack" aria-hidden="true"><i/><i/><i><Layers3 size={25}/></i></div></div>
      <footer>MCQs · repeats included</footer>
    </article>
    <article className={`dm-card dm-streak ${!streak?'dm-is-loading':''}`} style={{'--dm-accent':t.amber}}>
      <header><span className="dm-icon"><Flame size={18}/></span><h3>Daily streak</h3></header>
      <div className="dm-main"><strong className="dm-number">{streak?.streak ?? '—'}<small>{streak?.streak===1?'day':'days'}</small></strong><Flame className="dm-flame" size={44} strokeWidth={1.4} aria-hidden="true"/></div>
      <div className="dm-week" aria-label="Daily Challenge streak over the last seven days">{week.map((day,i)=><span key={i} data-active={day.active} data-today={day.today} aria-label={`${day.today?'Today':`${6-i} day${6-i===1?'':'s'} ago`}: ${day.active?'streak completed':'not completed'}`}><i/>{day.label}</span>)}</div>
      <footer>{streak?<>{streak.completedToday&&'Completed today · '}Best {streak.best}</>:'Loading streak…'}</footer>
    </article>
    <article className={`dm-card dm-allowance ${isPro?'dm-pro':''}`} style={{'--dm-accent':t.purple || '#a58aff'}}>
      <header><span className="dm-icon">{isPro?<InfinityIcon size={18}/>:<Clock3 size={18}/>}</span><h3>Practice allowance</h3>{isPro&&<span className="dm-tier">PRO</span>}</header>
      {isPro?<><div className="dm-main"><strong className="dm-infinity" aria-label="Unlimited">∞</strong><div className="dm-infinity-halo" aria-hidden="true"><InfinityIcon size={40}/></div></div><footer>Unlimited MCQs</footer></>:<>
        <div className="dm-main"><strong className="dm-number">{allowance&&!allowance.refreshing?allowance.remaining:'—'}<small>MCQs left</small></strong><Ring value={allowance?.fill || 0} color={t.purple || '#a58aff'} pending={!allowance||allowance.refreshing}><Clock3 size={20}/></Ring></div>
        <p>{allowance?`${allowance.limit} questions · rolling 12 hours`:'12-hour quota coming soon'}</p>
        <footer className="dm-reset"><Clock3 size={13}/>{allowance?(allowance.refreshing||allowance.idle?allowance.timer:<>Next release in <strong>{allowance.timer}</strong></>):'Countdown unavailable.'}</footer>
      </>}
    </article>
  </section>;
}
