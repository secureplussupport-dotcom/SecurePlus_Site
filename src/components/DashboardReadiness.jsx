import {ChevronDown, LoaderCircle, RotateCcw} from 'lucide-react';
import {dashboardReadiness} from '../lib/examReadiness.js';
import './DashboardReadiness.css';

export function DashboardReadiness({profile,t,expanded,onToggle}) {
 const display=dashboardReadiness(profile);
 const score=display.score;
 return <article className="dh-readiness dh-readiness-simple" aria-label="Exam readiness">
  {display.state==='early'?<p className="dh-readiness-early">Too early to be judged</p>:
   display.state==='loading'?<div role="status" aria-label="Loading exam readiness"><LoaderCircle className="dh-readiness-loading" size={28} aria-hidden="true"/></div>:
   display.state==='error'?<button className="dh-readiness-retry" onClick={profile.retry} aria-label="Readiness unavailable. Retry" title="Retry readiness"><RotateCcw size={26} aria-hidden="true"/></button>:
   <button type="button" className="dh-readiness-toggle" onClick={onToggle} aria-label={`Exam readiness: ${score}%. ${expanded?'Hide':'Show'} breakdown`} aria-expanded={expanded} aria-controls="exam-readiness-breakdown">
    <div className="dh-score" style={{'--dh-score-color':score>=80?t.green:t.accent}}>
     <svg viewBox="0 0 200 200" aria-hidden="true">
      <defs><linearGradient id="dashboard-readiness-arc" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#30b9a4"/><stop offset="65%" stopColor="var(--dh-score-color)"/><stop offset="100%" stopColor="#e4c68b"/></linearGradient></defs>
      <circle className="dh-dial-rim" cx="100" cy="100" r="97"/>
      <circle className="dh-dial-ticks" cx="100" cy="100" r="91" pathLength="120" strokeDasharray=".35 1.65" transform="rotate(-90 100 100)"/>
      <circle className="dh-dial-track" cx="100" cy="100" r="78"/>
      <circle className="dh-score-fill" style={{opacity:score>0?1:0}} cx="100" cy="100" r="78" pathLength="100" strokeDasharray={`${score} 100`} transform="rotate(-90 100 100)"/>
      {score>0&&<circle className="dh-dial-tip" cx="100" cy="22" r="4" transform={`rotate(${score*3.6} 100 100)`}/>}
     </svg>
     <div><strong>{score}<small>%</small></strong></div>
    </div>
    <ChevronDown className="dh-readiness-chevron" size={20} aria-hidden="true"/>
   </button>}
 </article>;
}
