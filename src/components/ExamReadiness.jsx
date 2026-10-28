import { useId } from 'react';
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

// Compact, infographic-first breakdown.
// What the learner sees on opening it, with no scrolling through prose:
//   - their level and a coloured confidence pill
//   - one bar per domain (mastery, with exam weight) — these bars add up
//     to the headline readiness, so there is only one set of domain bars
//     in view at a time.
// Everything else is tap-to-reveal, at 14px or larger, never 11–12px:
//   - how the score is worked out (the formula, accuracy kept separate)
//   - concepts: one donut, plus where to grow as a plain list
//   - accuracy by domain, clearly labelled as a different metric from mastery
export function ReadinessBreakdown({profile,chapters}) {
  const {attempted,mastered,unmastered,byChapter,status}=profile;
  const sampleText = profile.confidenceLabel && profile.confidence !== 'none'
    ? `${profile.confidenceLabel} · based on ${profile.sampleQuestions} ${profile.distinctQuestionsKnown ? 'distinct questions' : 'answers'}`
    : 'No estimate yet — complete a set to begin.';
  const masterySlices=[{label:'Mastered',count:mastered,color:'#43c8bb'},{label:'Still growing',count:unmastered,color:'#6b9dff'}];
  const chapterSlices=chapters.map((ch,i)=>({label:`Domain ${ch.id}`,count:byChapter[ch.id] || 0,color:COLORS[i]}));
  if(byChapter.unknown)chapterSlices.push({label:'Domain unavailable',count:byChapter.unknown,color:'#a0aaba'});
  const confidenceColor = profile.confidence === 'high' ? '#43c8bb' : profile.confidence === 'medium' ? '#e5b967' : '#6b9dff';
  const allWeakest = Array.isArray(profile.domains) ? profile.domains.flatMap((domain) => domain.weakest.map((w) => ({ ...w, domainId: domain.id }))) : [];
  return <section id="exam-readiness-breakdown" className="er-breakdown" aria-label="Exam readiness breakdown">
    <header><div><span className="er-eyebrow">YOUR READINESS</span><h2>{profile.level}</h2></div><span className="er-milestone">Target: 80% for Exam ready</span></header>
    {status==='loading'?<CipherLoader compact label="Loading your progress…"/>:status==='error'?<p role="status">Your readiness couldn’t load. <button type="button" onClick={profile.retry}>Try again</button></p>:<>
      <p className="er-confidence"><span className="er-pill" style={{borderColor:`${confidenceColor}66`,background:`${confidenceColor}14`,color:confidenceColor}}>{sampleText}</span><span className="er-pill">{attempted} concepts attempted</span>{profile.stale && <span className="er-pill er-pill-stale">{profile.staleNote}</span>}</p>
      {Array.isArray(profile.domains) && <div className="er-chapters">
        <div className="er-card-heading"><h3>Where you stand by domain</h3><span>These add up to your headline score</span></div>
        {profile.domains.map((domain, i) => {
          const chapter = chapters.find((ch) => ch.id === domain.id);
          return <div className="er-row" key={domain.id}>
            <div className="er-row-label"><span style={{color:COLORS[i]}}>0{domain.id}</span><span>{chapter?.title || `Domain ${domain.id}`}</span><strong>{domain.mastery == null ? '—' : `${Math.round(domain.mastery)}%`}</strong></div>
            <div className="er-track" role="img" aria-label={`${chapter?.title || `Domain ${domain.id}`}: ${domain.mastery == null ? 'No data' : `${Math.round(domain.mastery)}% mastery`}, ${domain.attempted} of ${domain.total} concepts attempted, exam weight ${domain.weight}%`}><span style={{width:`${domain.mastery ?? 0}%`,background:COLORS[i]}}/></div>
            <div className="er-row-meta"><span className="er-weight" style={{borderColor:`${COLORS[i]}55`,color:COLORS[i]}}>{domain.weight}% of the exam</span><span>{domain.attempted} of {domain.total} concepts attempted</span></div>
          </div>;
        })}
      </div>}
      <details className="er-details">
        <summary>How this score is worked out</summary>
        <div>
          <p className="er-note">{profile.explanation}</p>
          <p className="er-note">Lessons and flashcards do not change readiness directly. Learning shows up when you next answer MCQs.</p>
          {profile.accuracy != null && <p className="er-note">Accuracy: {profile.accuracy}%. Accuracy is shown separately and is never blended into readiness.</p>}
          {profile.unclassified>0&&<p className="er-note">Older answers without an activity label are excluded.</p>}
        </div>
      </details>
      <details className="er-details">
        <summary>Concepts: mastered and still growing</summary>
        <div>
          <div className="er-chart-body"><Donut slices={masterySlices} total={attempted} label="Attempted concept mastery" centerLabel="mastered" center={attempted?`${percentage(mastered,attempted)}%`:'—'}/><Legend slices={masterySlices} total={attempted}/></div>
          {unmastered?<div className="er-grow-list"><h3>Where to grow</h3><ul>{chapterSlices.filter(s=>s.count).map(s=><li key={s.label}><i style={{background:s.color}}/>{s.label}<strong>{s.count} to grow</strong></li>)}</ul></div>:<p className="er-note">{attempted?'All attempted concepts mastered.':'Complete a set to begin.'}</p>}
          {allWeakest.length>0&&<p className="er-note">Weakest concepts: {allWeakest.map((w) => `${w.tag} (${w.score})`).join(', ')}.</p>}
        </div>
      </details>
      <details className="er-details">
        <summary>Accuracy by domain</summary>
        <div>
          <p className="er-note">Accuracy is different from mastery. Accuracy is the share of attempted questions you got right; mastery is your readiness. Target accuracy: 85% (dashed line).</p>
          <div className="er-bars"><div className="er-target" aria-hidden="true"/>
            {chapters.map((ch,i)=>{const stats=profile.chapters[ch.id];const value=stats?.total?stats.correct/stats.total*100:null;return <div className="er-row" key={ch.id}>
              <div className="er-row-label"><span style={{color:COLORS[i]}}>0{ch.id}</span><span>{ch.title}</span><strong>{value==null?'—':`${Math.round(value)}%`}</strong></div>
              <div className="er-track" role="img" aria-label={`${ch.title}: ${value==null?'Not attempted':`${Math.round(value)}% accuracy, ${stats.correct} of ${stats.total} correct`}. Target accuracy 85%.`}><span style={{width:`${value ?? 0}%`,background:COLORS[i],animationDelay:`${i*40}ms`}}/></div>
            </div>;})}
          </div><div className="er-axis"><span>0%</span><span>100%</span></div>
        </div>
      </details>
    </>}
  </section>;
}
