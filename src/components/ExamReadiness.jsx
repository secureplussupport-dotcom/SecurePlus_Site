import { useId } from 'react';
import {conceptDisplayName} from '../data/conceptDisplayNames.js';
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
  const masterySlices=[{label:'Mastered',count:mastered,color:'#43c8bb'},{label:'Still growing',count:unmastered,color:'#6b9dff'}];
  const chapterSlices=chapters.map((ch,i)=>({label:`Domain ${ch.id}`,count:byChapter[ch.id] || 0,color:COLORS[i]}));
  if(byChapter.unknown)chapterSlices.push({label:'Domain unavailable',count:byChapter.unknown,color:'#a0aaba'});
  return <section id="exam-readiness-breakdown" className="er-breakdown" aria-label="Exam readiness breakdown">
    <header><div><span className="er-eyebrow">READINESS BREAKDOWN</span><h2>{profile.level}</h2></div></header>
    {status==='loading'?<CipherLoader compact label="Loading your progress…"/>:status==='error'?<p role="status">Your readiness couldn’t load. <button type="button" onClick={profile.retry}>Try again</button></p>:<>
      <p className="er-scope"><span><strong>{attempted}</strong> concepts attempted</span><span>MCQ + Exam</span><span>All concepts included · unseen = 50</span></p>
      <div className="er-calculation">
        <div className="er-card-heading"><h3>Five domains. One estimate.</h3><span>Mastery × exam weight</span></div>
        <div className="er-weighted-total" role="img" aria-label={`Weighted readiness ${profile.score??'not estimated'}${profile.score==null?'':' percent'}. ${profile.domains?.map(d=>`Domain ${d.id}: ${d.contribution.toFixed(1)} points`).join(', ')}`}>
          <div className="er-contribution-track">{profile.domains?.map((d,i)=><span key={d.id} style={{width:`${d.contribution}%`,background:COLORS[i]}}/>)}</div><strong>{profile.score==null?'—':`${profile.score}%`}</strong>
        </div>
        <div className="er-formula-rows">{profile.domains?.map((domain,i)=><article key={domain.id} style={{'--domain-color':COLORS[i]}}>
          <header><span className="er-domain-index">0{domain.id}</span><h4>{domain.name}</h4></header>
          <div className="er-mastery-formula"><div className="er-domain-meter"><span style={{width:`${domain.mastery}%`}}/></div><strong>{domain.mastery}%</strong><span className="er-weight">× {domain.weight}%</span><span className="er-contribution">= <b>{domain.contribution.toFixed(1)}</b> pts</span></div>
          <div className="er-domain-evidence"><span>{domain.attempted}/{domain.total} concepts attempted</span><span>{domain.accuracy==null?'Accuracy —':`${domain.accuracy}% accuracy`}</span></div>
          <div className="er-weak-concepts"><span>Build next</span>{domain.weakest.map(c=><div key={c.tag}><span>{conceptDisplayName(c.tag)}</span><strong>{c.score}<small>{c.attempted?' pts':' · new'}</small></strong></div>)}</div>
        </article>)}</div>
        <small className="er-rounding">Rounded for display. Total uses full precision; accuracy stays separate.</small>
      </div>
      <div className="er-layout">
      <div className="er-chapters">
        <div className="er-card-heading"><h3>Domain accuracy</h3><span>01—05</span></div>
        <div className="er-benchmark-label"><span>85% target accuracy</span></div>
        <div className="er-bars"><div className="er-target" aria-hidden="true"/>
          {chapters.map((ch,i)=>{const stats=profile.chapters[ch.id];const value=stats?.total?stats.correct/stats.total*100:null;return <div className="er-row" key={ch.id}>
            <div className="er-row-label"><span style={{color:COLORS[i]}}>0{ch.id}</span><span>{ch.title}</span><strong>{value==null?'—':`${Math.round(value)}%`}</strong></div>
            <div className="er-track" role="img" aria-label={`${ch.title}: ${value==null?'Not attempted':`${Math.round(value)}% accuracy, ${stats.correct} of ${stats.total} correct`}. Target accuracy 85%.`}><span style={{width:`${value ?? 0}%`,background:COLORS[i],animationDelay:`${i*40}ms`}}/></div>
          </div>;})}
        </div><div className="er-axis"><span>0%</span><span>100%</span></div>
      </div>
      <div className="er-chart-grid">
        <article className="er-mastery"><div className="er-card-heading"><h3>Concept mastery</h3><span>80+ points</span></div><div className="er-chart-body"><Donut slices={masterySlices} total={profile.totalConcepts} label="All concept mastery" centerLabel="mastered" center={attempted?`${percentage(mastered,profile.totalConcepts)}%`:'—'}/><Legend slices={masterySlices} total={profile.totalConcepts}/></div></article>
        <article className="er-growth"><div className="er-card-heading"><h3>Where to grow</h3><span>By domain</span></div><div className="er-chart-body"><Donut slices={chapterSlices} total={unmastered} label="Unmastered concepts by domain" center={unmastered || (attempted?'0':'—')}/>{unmastered?<Legend slices={chapterSlices.filter(s=>s.count)} total={unmastered}/>:<p className="er-empty">{attempted?'All concepts mastered.':'Complete a set to begin.'}</p>}</div></article>
      </div>
      </div>
      {profile.unclassified>0&&<small className="er-history-note">Older answers without an activity label are excluded.</small>}
    </>}
  </section>;
}
