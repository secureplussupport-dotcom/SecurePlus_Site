import { useId, useState } from 'react';
import {useLiveSnapshot} from '../lib/useLiveSnapshot.js';
import {progressOwner} from '../lib/liveRefresh.js';
import { mcqEngineEnabled, mcqEngineRequest } from '../lib/mcqEngineClient.js';
import { localReadinessEvidence, summarizeReadiness } from '../lib/examReadiness.js';
import './ExamReadiness.css';
import {CipherLoader} from './CipherLoader.jsx';

const loadReadiness=()=>mcqEngineRequest('readiness');
export function useExamReadiness(user, attempts) {
  const cloud=user?.authProvider==='supabase';
  const snapshot=useLiveSnapshot({owner:progressOwner(user),load:loadReadiness,enabled:cloud&&mcqEngineEnabled,revision:attempts});
  if(!cloud)return {...summarizeReadiness(localReadinessEvidence(attempts)),status:'ready'};
  return {...summarizeReadiness(snapshot.value || {}),status:!mcqEngineEnabled?'error':snapshot.status,
    refreshing:snapshot.refreshing,refreshError:snapshot.error,updatedAt:snapshot.updatedAt,retry:snapshot.refresh};
}

const percentage=(count,total)=>total?Number((count/total*100).toFixed(1)):0;
const COLORS=['#6b9dff','#43c8bb','#b59bff','#e5b967','#64bddf'];
function Donut({slices,total,label,center,centerLabel="concepts"}) {
  const revealId=`er-pie-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
  let offset=0;
  return <div className="er-donut" role="img" aria-label={`${label}: ${slices.map(s=>`${s.label} ${total?percentage(s.count,total):0}% (${s.count})`).join(', ')}`}>
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="46" fill="none" stroke="var(--er-track)" strokeWidth="13"/>
      <defs><mask id={revealId} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
        <circle className="er-pie-reveal" cx="60" cy="60" r="46" pathLength="100" fill="none" stroke="white" strokeWidth="16" strokeDasharray="100 100" strokeDashoffset="0" transform="rotate(-90 60 60)"/>
      </mask></defs>
      <g mask={`url(#${revealId})`}>{slices.filter(s=>s.count>0).map(s=>{const length=s.count/total*100;const start=offset;offset+=length;return <circle key={s.label} cx="60" cy="60" r="46" pathLength="100" fill="none" stroke={s.color} strokeWidth="13" strokeDasharray={`${length} ${100-length}`} strokeDashoffset={-start} transform="rotate(-90 60 60)"/>;})}</g>
    </svg>
    <div><strong>{center}</strong><small>{total?centerLabel:'No data yet'}</small></div>
  </div>;
}
function Legend({slices,total}) {
  return <ul className="er-legend">{slices.map(s=><li key={s.label}><i style={{background:s.color}}/><span>{s.label}</span><strong>{total?`${percentage(s.count,total)}%`:'—'}</strong><small aria-label={`${s.count} concepts`}>({s.count})</small></li>)}</ul>;
}

export function ReadinessBreakdown({profile,chapters}) {
  const {attempted,mastered,unmastered,byChapter,status}=profile;
  // Tap-to-reveal uses plain React state, not native <details>: hidden
  // sections are not in the DOM at all until tapped. This is deliberate:
  // the previous compact design used <details> and the breakdown froze
  // on open in production, with no cause proven in its own render code.
  const [openSection,setOpenSection]=useState(null);
  const toggleSection=(name)=>setOpenSection((current)=>current===name?null:name);
  const masterySlices=[{label:'Mastered',count:mastered,color:'#43c8bb'},{label:'Still growing',count:unmastered,color:'#6b9dff'}];
  const chapterSlices=chapters.map((ch,i)=>({label:`Domain ${ch.id}`,count:byChapter[ch.id] || 0,color:COLORS[i]}));
  if(byChapter.unknown)chapterSlices.push({label:'Domain unavailable',count:byChapter.unknown,color:'#a0aaba'});
  const domains=Array.isArray(profile.domains)?profile.domains:[];
  const weakestLine=domains.flatMap((domain)=>domain.weakest.map((c)=>({...c,domain:domain.shortName || domain.name}))).sort((a,b)=>a.score-b.score || a.tag.localeCompare(b.tag)).slice(0,5);
  const confidenceColor=profile.confidence==='High'?'#2e9e6b':profile.confidence==='Medium'?'#b7791f':'#4a7fd4';
  return <section id="exam-readiness-breakdown" className="er-breakdown" aria-label="Exam readiness breakdown">
    <header><div><span className="er-eyebrow">READINESS BREAKDOWN</span><h2>{profile.level}</h2></div><span className="er-milestone">Target: 80% for Exam ready</span></header>
    {status==='loading'?<CipherLoader compact label="Loading your progress…"/>:status==='error'?<p role="status">Your readiness couldn’t load. <button type="button" onClick={profile.retry}>Try again</button></p>:<>
      <div className="er-pills">
        <span className="er-pill" style={{background:`${confidenceColor}1f`,borderColor:`${confidenceColor}55`,color:confidenceColor}}>{profile.confidence} confidence</span>
        <span className="er-pill">{attempted} concepts attempted</span>
        {profile.stale&&<span className="er-pill" style={{background:'#b7791f1f',borderColor:'#b7791f55',color:'#b7791f'}}>Stale — practise to refresh</span>}
      </div>
      <div className="er-card-heading"><h3>Where you stand by domain</h3><span>These add up to your headline score</span></div>
      <div className="er-domain-bars">
        {domains.map((domain,i)=><div className="er-domain-row" key={domain.id}>
          <div className="er-row-label"><span style={{color:COLORS[i]}}>0{domain.id}</span><span>{domain.shortName || domain.name}</span><strong>{domain.mastery}%</strong></div>
          <div className="er-track" role="img" aria-label={`${domain.name}: ${domain.mastery}% mastery`}><span style={{width:`${domain.mastery}%`,background:COLORS[i],animationDelay:`${i*40}ms`}}/></div>
          <div className="er-domain-meta"><span className="er-weight-chip">{domain.weight}% of the exam</span><span>{domain.attempted} of {domain.total} concepts attempted</span></div>
        </div>)}
      </div>
      <p className="er-note">Whole-number display: weighted domain values reconcile to the headline within 1 point; calculation uses unrounded mastery.</p>
      <div className="er-sections">
        <button className="er-section-toggle" type="button" aria-expanded={openSection==='how'} onClick={()=>toggleSection('how')}>How this score is worked out <span aria-hidden="true">{openSection==='how'?'▴':'▾'}</span></button>
        {openSection==='how'&&<div className="er-section-body">
          <p className="er-note">{profile.explanation}</p>
          <p className="er-note">Accuracy is shown separately and is not blended into readiness. Lessons and flashcards do not change readiness directly. Every concept starts at 50; unattempted concepts stay at 50.</p>
          <p className="er-note">Scope: {attempted} concepts attempted · MCQ + Exam · All concepts included · unseen = 50.</p>
          {profile.unclassified>0&&<p className="er-note">Older answers without an activity label are excluded.</p>}
          {profile.stale&&<p className="er-note">{profile.staleNotice}</p>}
        </div>}
        <button className="er-section-toggle" type="button" aria-expanded={openSection==='concepts'} onClick={()=>toggleSection('concepts')}>Concepts: mastered and still growing <span aria-hidden="true">{openSection==='concepts'?'▴':'▾'}</span></button>
        {openSection==='concepts'&&<div className="er-section-body">
          <div className="er-chart-body"><Donut slices={masterySlices} total={profile.totalConcepts} label="All concept mastery" centerLabel="mastered" center={attempted?`${percentage(mastered,profile.totalConcepts)}%`:'—'}/><Legend slices={masterySlices} total={profile.totalConcepts}/></div>
          <div className="er-card-heading"><h3>Where to grow</h3><span>By domain</span></div>
          {unmastered?<Legend slices={chapterSlices.filter(s=>s.count)} total={unmastered}/>:<p className="er-note">{attempted?'All concepts mastered.':'Complete a set to begin.'}</p>}
          {weakestLine.length>0&&<p className="er-note">Weakest: {weakestLine.map((c)=>`${c.tag} · ${c.score}`).join(' · ')}</p>}
        </div>}
        <button className="er-section-toggle" type="button" aria-expanded={openSection==='accuracy'} onClick={()=>toggleSection('accuracy')}>Accuracy by domain <span aria-hidden="true">{openSection==='accuracy'?'▴':'▾'}</span></button>
        {openSection==='accuracy'&&<div className="er-section-body">
          <p className="er-note">Accuracy is a different metric from mastery above.</p>
          <div className="er-benchmark-label"><span>85% target accuracy</span></div>
          <div className="er-bars"><div className="er-target" aria-hidden="true"/>
            {chapters.map((ch,i)=>{const stats=profile.chapters[ch.id];const value=stats?.total?stats.correct/stats.total*100:null;return <div className="er-row" key={ch.id}>
              <div className="er-row-label"><span style={{color:COLORS[i]}}>0{ch.id}</span><span>{ch.title}</span><strong>{value==null?'—':`${Math.round(value)}%`}</strong></div>
              <div className="er-track" role="img" aria-label={`${ch.title}: ${value==null?'Not attempted':`${Math.round(value)}% accuracy, ${stats.correct} of ${stats.total} correct`}. Target accuracy 85%.`}><span style={{width:`${value ?? 0}%`,background:COLORS[i],animationDelay:`${i*40}ms`}}/></div>
            </div>;})}
          </div><div className="er-axis"><span>0%</span><span>100%</span></div>
        </div>}
        <button className="er-section-toggle" type="button" aria-expanded={openSection==='detail'} onClick={()=>toggleSection('detail')}>Domain detail <span aria-hidden="true">{openSection==='detail'?'▴':'▾'}</span></button>
        {openSection==='detail'&&<div className="er-section-body">
          <div className="er-domain-grid">{domains.map(domain=><article key={domain.id}><header><strong>Domain {domain.id}</strong><span>{domain.weight}% weight</span></header><h4>{domain.name}</h4><strong className="er-domain-score">{domain.mastery}% <small>mastery</small></strong><p>{domain.attempted}/{domain.total} concepts attempted · {domain.accuracy==null?'No accuracy yet':`${domain.accuracy}% accuracy`}</p><span>Two weakest concepts</span><ul>{domain.weakest.map(c=><li key={c.tag}>#{c.tag} · {c.score}{!c.attempted?' · not attempted':''}</li>)}</ul></article>)}</div>
        </div>}
      </div>
    </>}
  </section>;
}
