import { useEffect, useState } from 'react';
import { mcqEngineEnabled, mcqEngineRequest } from '../lib/mcqEngineClient.js';
import { localReadinessEvidence, summarizeReadiness } from '../lib/examReadiness.js';
import './ExamReadiness.css';

export function useExamReadiness(user, attempts) {
  const [revision,retry]=useState(0);
  const [remote,setRemote]=useState(null);
  const cloud=user?.authProvider==='supabase';
  const owner=user?.id || user?.email;
  useEffect(()=>{
    if(!cloud || !mcqEngineEnabled)return;
    let active=true;
    setRemote({owner,status:'loading'});
    mcqEngineRequest('readiness').then(evidence=>{if(active)setRemote({owner,status:'ready',evidence});})
      .catch(()=>{if(active)setRemote({owner,status:'error'});});
    return()=>{active=false;};
  },[cloud,owner,attempts,revision]);
  if(!cloud)return {...summarizeReadiness(localReadinessEvidence(attempts)),status:'ready'};
  const state=remote?.owner===owner?remote:null;
  return {...summarizeReadiness(state?.evidence),status:!mcqEngineEnabled?'error':state?.status || 'loading',retry:()=>retry(n=>n+1)};
}

const percentage=(count,total)=>total?Number((count/total*100).toFixed(1)):0;
const COLORS=['#6b9dff','#43c8bb','#b59bff','#e5b967','#64bddf'];
function Donut({slices,total,label,center,centerLabel="concepts"}) {
  let offset=0;
  return <div className="er-donut" role="img" aria-label={`${label}: ${slices.map(s=>`${s.label} ${total?percentage(s.count,total):0}% (${s.count})`).join(', ')}`}>
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="46" fill="none" stroke="var(--er-track)" strokeWidth="13"/>
      {slices.filter(s=>s.count>0).map(s=>{const length=s.count/total*100;const start=offset;offset+=length;return <circle key={s.label} cx="60" cy="60" r="46" pathLength="100" fill="none" stroke={s.color} strokeWidth="13" strokeDasharray={`${length} ${100-length}`} strokeDashoffset={-start} transform="rotate(-90 60 60)"/>;})}
    </svg>
    <div><strong>{center}</strong><small>{total?centerLabel:'No data yet'}</small></div>
  </div>;
}
function Legend({slices,total}) {
  return <ul className="er-legend">{slices.map(s=><li key={s.label}><i style={{background:s.color}}/><span>{s.label}</span><strong>{total?percentage(s.count,total):0}%</strong><small>{s.count}</small></li>)}</ul>;
}

export function ReadinessBreakdown({profile,chapters}) {
  const {attempted,mastered,unmastered,byChapter,status}=profile;
  const masterySlices=[{label:'Mastered',count:mastered,color:'#43c8bb'},{label:'Still growing',count:unmastered,color:'#6b9dff'}];
  const chapterSlices=chapters.map((ch,i)=>({label:`Ch. ${ch.id}`,count:byChapter[ch.id] || 0,color:COLORS[i]}));
  if(byChapter.unknown)chapterSlices.push({label:'Chapter unavailable',count:byChapter.unknown,color:'#a0aaba'});
  return <section id="exam-readiness-breakdown" className="er-breakdown" aria-label="Exam readiness breakdown">
    <header><div><span className="er-eyebrow">YOUR READINESS, AT A GLANCE</span><h2>{profile.level}</h2></div><span className="er-milestone">80% · Exam ready</span></header>
    {status==='loading'?<p role="status">Loading your MCQ and Exam progress…</p>:status==='error'?<p role="status">Your readiness couldn’t load. <button type="button" onClick={profile.retry}>Try again</button></p>:<>
      <p className="er-scope">MCQ sets + Exam mode · {attempted} attempted concept{attempted===1?'':'s'} · Unattempted concepts excluded</p>
      <div className="er-chapters">
        <h3>Chapter accuracy</h3>
        <div className="er-benchmark-label"><span>85% target accuracy</span></div>
        <div className="er-bars"><div className="er-target" aria-hidden="true"/>
          {chapters.map((ch,i)=>{const stats=profile.chapters[ch.id];const value=stats?.total?stats.correct/stats.total*100:null;return <div className="er-row" key={ch.id}>
            <div className="er-row-label"><span style={{color:COLORS[i]}}>0{ch.id}</span><span>{ch.title}</span><strong>{value==null?'—':`${Math.round(value)}%`}</strong></div>
            <div className="er-track" role="img" aria-label={`${ch.title}: ${value==null?'Not attempted':`${Math.round(value)}% accuracy, ${stats.correct} of ${stats.total} correct`}. Target accuracy 85%.`}><span style={{width:`${value ?? 0}%`,background:COLORS[i]}}/></div>
          </div>;})}
        </div><div className="er-axis"><span>0%</span><span>100%</span></div>
      </div>
      <div className="er-chart-grid">
        <article><h3>Concept mastery</h3><p>Mastered at 80 points</p><Donut slices={masterySlices} total={attempted} label="Attempted concept mastery" centerLabel="mastered" center={attempted?`${percentage(mastered,attempted)}%`:'—'}/><Legend slices={masterySlices} total={attempted}/></article>
        <article><h3>Where to grow next</h3><p>Chapter share of unmastered concepts</p><Donut slices={chapterSlices} total={unmastered} label="Unmastered concepts by chapter" center={unmastered || (attempted?'0':'—')}/>{unmastered?<Legend slices={chapterSlices.filter(s=>s.count)} total={unmastered}/>:<p className="er-empty">{attempted?'Every attempted concept is mastered. Keep your momentum!':'Your first set starts the picture.'}</p>}</article>
      </div>
      {profile.unclassified>0&&<small className="er-history-note">Older answers without an activity label are excluded.</small>}
    </>}
  </section>;
}
