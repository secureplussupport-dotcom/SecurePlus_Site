import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Maximize2, Minimize2, Check, BookOpenCheck, Layers3, RotateCcw, Target, ShieldCheck, Fingerprint, Network, Radar } from 'lucide-react';
import { CipherLoader } from './CipherLoader.jsx';
import { MascotAnimation } from '../lib/MascotAnimation.jsx';
import { mcqEngineRequest, prepareGuestDiagnostic } from '../lib/mcqEngineClient.js';
import { conceptDeepDive } from '../lib/mcqResultSummary.js';
import './GuestLanding.css';

// Tab memory only: navigation/expansion keeps the set; reload starts fresh.
let current=null, generating=null;
const listeners=new Set();
const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn);};
const publish=value=>{current=value;listeners.forEach(fn=>fn());};
const snapshot=()=>current;
export const clearGuestDiagnostic=()=>publish(null);
const conceptName=tag=>String(tag || '').split('.').at(-1).replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const domains=['Security concepts','Threats & mitigations','Security architecture','Security operations','Security management'];
export const guestPalette=t=>({'--guest-bg':t.bg,'--guest-panel':t.surface,'--guest-text':t.text,'--guest-muted':t.textSec,'--guest-line':t.border,'--guest-accent':t.green || '#30b9a4','--guest-blue':'color-mix(in srgb,#729bf5 75%,var(--guest-text))'});

export function GuestDiagnostic({t,onSignup,onSave,renderDefinitions=text=>text,startSignal=0}) {
 const draft=useSyncExternalStore(subscribe,snapshot,snapshot);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState(false),[saving,setSaving]=useState(false),[transitioning,setTransitioning]=useState(false);
 const questionBody=useRef(null),dialog=useRef(null),expandButton=useRef(null),heading=useRef(null),seenSignal=useRef(0);
 const start=async()=>{
  if(current?.questions?.length)return;
  setBusy(true);setError('');
  try{
   if(!generating)generating=(async()=>{
    // Establish the signed browser cookie before requesting a snapshot.
    await prepareGuestDiagnostic();
    const request=current?.request_id || crypto.randomUUID();publish({request_id:request});
    const plan=await mcqEngineRequest('generate',{mode:'diagnostic',set_size:10,request_id:request});
    publish({request_id:request,questions:plan.questions,answers:{},checked:{},index:0,startedAt:Date.now()});
   })().finally(()=>{generating=null;});
   await generating;
  }catch(e){setError(e.message);}finally{setBusy(false);}
 };
 useEffect(()=>{prepareGuestDiagnostic().catch(()=>{});},[]);
 useEffect(()=>{try{localStorage.removeItem('secureplus-guest-diagnostic-v1');}catch{}},[]);
 useEffect(()=>{if(startSignal>seenSignal.current){seenSignal.current=startSignal;start();}},[startSignal]);
 useEffect(()=>{
  if(!expanded)return;
  dialog.current?.showModal();
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous;expandButton.current?.focus();};
 },[expanded]);
 useEffect(()=>{if(draft?.questions?.length)heading.current?.focus({preventScroll:true});if(expanded&&dialog.current)dialog.current.scrollTop=0;},[draft?.index,expanded]);
 const questions=draft?.questions || [],index=draft?.index || 0,answers=draft?.answers || {},checked=draft?.checked || {};
 const done=questions.length>0 && index===questions.length,q=questions[index],marked=checked[index];
 const rows=questions.map((q,i)=>({qid:q.id,selected:answers[i],correct:answers[i]===q.correct,ch:q.chapter,topic:q.topic,title:q.prompt,conceptTag:q.concept_tag,mcq:true,readinessSource:'diagnostic',diagnosticSessionId:draft.request_id,selectedOptionId:q.options[answers[i]]?.id,createdAt:new Date(draft.startedAt+i).toISOString()}));
 const correct=rows.filter(r=>r.correct).length;
 const misses=[...new Map(rows.filter(r=>!r.correct).map(r=>[r.conceptTag,r])).values()];
 const signup=async()=>{
  setSaving(true);setError('');
  try{await onSave?.(rows);setExpanded(false);onSignup();}catch{setError('Your result could not be carried forward. Please try again.');}finally{setSaving(false);}
 };
 const nextQuestion=async()=>{
  if(transitioning)return;
  setTransitioning(true);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&questionBody.current?.animate){
   await questionBody.current.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:80,easing:'cubic-bezier(.23,1,.32,1)',fill:'forwards'}).finished.catch(()=>{});
  }
  if(current===draft)publish({...draft,index:index+1});
  setTransitioning(false);
 };
 const content=<section id={expanded?undefined:'guest-diagnostic'} className={`guest-diagnostic ${expanded?'is-expanded':''}`} style={guestPalette(t)} aria-label="10-question Core diagnostic">
  <header className="gd-header"><span><i/> YOUR SECURITY+ CHECK-IN</span><button ref={expandButton} className="gd-expand" onClick={()=>setExpanded(!expanded)} aria-label={expanded?'Close full format':'Expand diagnostic'}>{expanded?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button></header>
  {busy?<CipherLoader t={t} label="Creating your diagnostic…"/>:!questions.length?<div className="gd-welcome">
   <div className="gd-security-visual" role="img" aria-label="Security+ study: identity, threats and network defence">
    <div className="gd-security-rings" aria-hidden="true"><i/><i/></div>
    <span className="gd-security-node gd-node-identity"><Fingerprint size={21}/> Identity</span>
    <span className="gd-security-node gd-node-threats"><Radar size={21}/> Threats</span>
    <div className="gd-security-badge"><ShieldCheck size={46} strokeWidth={1.4}/><strong>Security+</strong><small>SY0-701</small></div>
    <span className="gd-security-node gd-node-network"><Network size={21}/> Networks</span>
    <div className="gd-security-cipher"><MascotAnimation animation="scan" size={82} label="Cipher guides your Security+ study"/></div>
   </div>
   <h2>Find your Security+<br/>starting point.</h2><p>Spot the gaps. Get your next move.</p>
   <div className="gd-welcome-stats"><span><strong>10</strong> Core questions</span><i/><span><strong>5</strong> Exam domains</span></div>
   <div className="gd-preview-domains" aria-label="All five exam domains">{domains.map((name,i)=><span key={name} title={name}>{['Security','Threats','Architecture','Operations','Risk'][i]}</span>)}</div>
   <button className="btn btn-primary" onClick={start}>Start my 10 Q diagnostic <ArrowRight size={18}/></button><small>No account needed · No timer</small>
  </div>:done?<div className="gd-results">
   <span className="guest-eyebrow">YOUR FIRST STEP, TAKEN</span>
   <div className="gd-score" role="img" aria-label={`${correct*10} percent, ${correct} of 10 correct`}><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="77"/><circle className="gd-score-sweep" cx="90" cy="90" r="77" pathLength="100" strokeDasharray="100" style={{strokeDashoffset:100-correct*10}}/></svg><strong>{correct*10}<small>%</small><em>{correct} / 10 correct</em></strong></div>
   <h2 ref={heading} tabIndex={-1}>{correct===10?'A strong starting point.':'Now we know where to start.'}</h2>
   <div className="gd-focus"><span className="guest-eyebrow"><Target size={15}/> YOUR NEXT FOCUS</span><h3>{misses[0]?conceptName(misses[0].conceptTag):'Keep your recall sharp.'}</h3><p>{misses.length?'We’ll use your missed concepts in future Smart Review sets, with retests when they’re due.':'Save your baseline and let Smart Review help you keep building.'}</p><button className="btn btn-primary" onClick={signup} disabled={saving}>{saving?'Saving your path…':'Start focused set'} <ArrowRight size={17}/></button><small>Create a free account to keep this result.</small></div>
   <div className="gd-domain-results">{domains.map((name,i)=>{const result=rows.filter(r=>Number(r.ch)===i+1),percent=result.filter(r=>r.correct).length/result.length*100;return <article key={name} style={{'--domain-tint':['#5c91f5','#b88af4','#e2a743','#33b7a3','#d487b5'][i]}}><span>0{i+1}</span><strong>{percent}%</strong><small>{name}</small><i><b style={{width:`${percent}%`}}/></i></article>;})}</div>
   {misses.length>0&&<details className="gd-recommendations"><summary>Your missed concepts <span>{misses.length}</span></summary>{misses.map(row=>{const lesson=conceptDeepDive(row.conceptTag);return <article key={row.conceptTag}><strong>{conceptName(row.conceptTag)}</strong><div><button onClick={signup}><BookOpenCheck size={15}/>{lesson?'Concept Deep Dive':'Explore this concept'} <ArrowRight size={14}/></button><button onClick={signup}><Layers3 size={15}/>Matching flashcards <ArrowRight size={14}/></button></div></article>;})}</details>}
   <button className="btn btn-ghost" onClick={()=>publish({...draft,index:0,reviewing:true})}><RotateCcw size={15}/> Review your answers</button>
  </div>:<div ref={questionBody} className="gd-question" key={`${draft.request_id}-${index}`} >
   <div className="gd-progress-copy"><span>{draft.reviewing?'ANSWER REVIEW':'CORE DIAGNOSTIC'}</span><strong>{index+1}<small> / 10</small></strong></div>
   <div className="gd-progress" role="progressbar" aria-label="Diagnostic answers checked" aria-valuemin={0} aria-valuemax={10} aria-valuenow={Object.keys(checked).length}>{questions.map((_,i)=><i key={i} className={checked[i]?'is-done':i===index?'is-current':''}/>)}</div>
   <span className="gd-domain-label">DOMAIN {q.chapter} · {domains[Number(q.chapter)-1]}</span><h2 ref={heading} tabIndex={-1}>{renderDefinitions(q.prompt)}</h2>
   <div className="gd-options">{q.options.map((o,i)=><button key={o.id} disabled={!!marked} aria-pressed={answers[index]===i} className={`${answers[index]===i?'is-selected':''} ${marked&&i===q.correct?'is-correct':''} ${marked&&answers[index]===i&&i!==q.correct?'is-missed':''}`} onClick={()=>publish({...draft,answers:{...answers,[index]:i}})}><span>{String.fromCharCode(65+i)}</span><span>{renderDefinitions(o.text)}</span>{marked&&i===q.correct&&<Check size={18}/>}</button>)}</div>
   {marked&&<div className="gd-feedback" role="status"><strong>{answers[index]===q.correct?'That’s right.':'One to revisit.'}</strong>{expanded?<p>{renderDefinitions(q.explanation)}</p>:<button onClick={()=>setExpanded(true)}>See why in full format <Maximize2 size={14}/></button>}</div>}
   <footer className="gd-question-actions"><span>{!expanded?'Tap underlined terms for definitions.':'Correct-answer explanation after every check.'}</span>{marked?<button className="btn btn-primary" disabled={transitioning} onClick={nextQuestion}>{index===9?'See my study path':'Next question'} <ArrowRight size={16}/></button>:<button className="btn btn-primary" disabled={answers[index]==null} onClick={()=>publish({...draft,checked:{...checked,[index]:true}})}>Check answer <Check size={16}/></button>}</footer>
  </div>}
  {error&&<p className="gd-error" role="alert">{error}</p>}
 </section>;
 return <>{expanded?<div className="gd-collapsed"><span>Your diagnostic is open in full format.</span><button className="btn btn-outline" onClick={()=>dialog.current?.focus()}>Return to diagnostic</button></div>:content}{expanded&&createPortal(<dialog ref={dialog} className="gd-dialog" aria-label="Diagnostic full format" onCancel={()=>setExpanded(false)} onClick={e=>{if(e.target===e.currentTarget)setExpanded(false);}}>{content}</dialog>,document.body)}</>;
}
