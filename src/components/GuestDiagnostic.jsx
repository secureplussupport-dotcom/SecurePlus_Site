import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Maximize2, Minimize2, Check, BookOpenCheck, Layers3, RotateCcw, Target, Save, X, Sparkles, ShieldCheck, Fingerprint, Network, Radar } from 'lucide-react';
import { CipherLoader } from './CipherLoader.jsx';
import { MascotAnimation } from '../lib/MascotAnimation.jsx';
import { mcqEngineRequest, prepareGuestDiagnostic } from '../lib/mcqEngineClient.js';
import { diagnosticRows } from '../lib/guestDiagnosticProgress.js';
import {subscribeGuestDiagnostic as subscribe,guestDiagnosticSnapshot as snapshot,publishGuestDiagnostic as publish,isDiagnosticBrowserSaved,diagnosticImportable,diagnosticComplete,DIAGNOSTIC_IMPORT_WINDOW} from '../lib/guestDiagnosticStore.js';
import { conceptDeepDive } from '../lib/mcqResultSummary.js';
import './GuestLanding.css';

// The browser draft survives navigation, reload and reopening this device.
let generating=null;
export const clearGuestDiagnostic=()=>publish(null);
const conceptName=tag=>String(tag || '').split('.').at(-1).replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const domains=['Security concepts','Threats & mitigations','Security architecture','Security operations','Security management'];
export const guestPalette=t=>({'--guest-bg':t.bg,'--guest-panel':t.surface,'--guest-text':t.text,'--guest-muted':t.textSec,'--guest-line':t.border,'--guest-accent':t.green || '#30b9a4','--guest-blue':t.blue || 'color-mix(in srgb,#729bf5 75%,var(--guest-text))','--guest-violet':t.purple,'--guest-gold':t.blue?t.amber:undefined});

export function GuestDiagnostic({t,onSignup,onSave,renderDefinitions=text=>text,startSignal=0,fullPage=false}) {
 const draft=useSyncExternalStore(subscribe,snapshot,snapshot);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[expanded,setExpanded]=useState(false),[saving,setSaving]=useState(false),[transitioning,setTransitioning]=useState(false);
 const host=useRef(null),questionBody=useRef(null),dialog=useRef(null),expandButton=useRef(null),heading=useRef(null),seenSignal=useRef(0);
 const start=async()=>{
  if(snapshot()?.questions?.length)return;
  setBusy(true);setError('');
  try{
   if(!generating)generating=(async()=>{
    // Establish the signed browser cookie before requesting a snapshot.
    await prepareGuestDiagnostic();
    const request=snapshot()?.request_id || crypto.randomUUID();publish({request_id:request});
    const plan=await mcqEngineRequest('generate',{mode:'diagnostic',set_size:10,request_id:request});
    publish({request_id:request,questions:plan.questions,answers:{},checked:{},skipped:{},index:0,startedAt:Date.now()});
   })().finally(()=>{generating=null;});
   await generating;
  }catch(e){setError(e.message);}finally{setBusy(false);}
 };
 useEffect(()=>{prepareGuestDiagnostic().catch(()=>{});},[]);
 useEffect(()=>{if(startSignal>seenSignal.current){seenSignal.current=startSignal;start();}},[startSignal]);
 useEffect(()=>{
  if(!expanded)return;
  dialog.current?.showModal();
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous;expandButton.current?.focus();};
 },[expanded]);
 useEffect(()=>{if(draft?.questions?.length)heading.current?.focus({preventScroll:true});if(expanded&&dialog.current)dialog.current.scrollTop=0;},[draft?.index,expanded]);
 const fullFormat=fullPage||expanded;
 const questions=draft?.questions || [],index=draft?.index || 0,answers=draft?.answers || {},checked=draft?.checked || {};
 const done=questions.length>0 && index===questions.length,q=questions[index],marked=checked[index],skipped=draft?.skipped?.[index]===true;
 useEffect(()=>{
  if(!done)return;
  if(expanded){dialog.current.scrollTop=0;return;}
  const hero=matchMedia('(min-width: 721px)').matches&&host.current?.closest('.gs-hero');
  (hero||host.current)?.scrollIntoView({block:'start',behavior:'instant'});
 },[done,expanded]);
 const rows=diagnosticRows(draft);
 const misses=[...new Map(rows.filter(r=>r.correct!==true).map(r=>[r.conceptTag,r])).values()];
 const skip=()=>publish({...draft,answers:{...answers,[index]:null},skipped:{...draft.skipped,[index]:true},checked:{...checked,[index]:true}});
 const importable=diagnosticImportable(draft);
 const importDeadline=new Date((draft?.startedAt||Date.now())+DIAGNOSTIC_IMPORT_WINDOW).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
 const signup=async()=>{
  setSaving(true);setError('');
  try{publish({...draft,savePromptOpened:true});if(importable&&isDiagnosticBrowserSaved())await onSave?.(rows);setExpanded(false);onSignup();}catch{setError('Your result could not be carried forward. Please try again.');}finally{setSaving(false);}
 };
 const nextQuestion=async()=>{
  if(transitioning)return;
  setTransitioning(true);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&questionBody.current?.animate){
   await questionBody.current.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:80,easing:'cubic-bezier(.23,1,.32,1)',fill:'forwards'}).finished.catch(()=>{});
  }
  if(snapshot()===draft)publish({...draft,index:index+1});
  setTransitioning(false);
 };
 const content=<section ref={host} id={expanded?undefined:'guest-diagnostic'} className={`guest-diagnostic ${expanded?'is-expanded':''} ${fullFormat?'is-full-format':''} ${fullPage?'is-full-page':''}`} style={guestPalette(t)} aria-label="10-question Core diagnostic">
  <header className="gd-header"><span><i/> {fullPage?'10Q DIAGNOSTIC':'YOUR SECURITY+ CHECK-IN'}</span>{!fullPage&&<button ref={expandButton} className="gd-expand" onClick={()=>setExpanded(!expanded)} aria-label={expanded?'Close full format':'Expand diagnostic'}>{expanded?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button>}</header>
  {busy?<CipherLoader t={t} label="Creating your diagnostic…"/>:!questions.length?<div className="gd-welcome">
   <div className="gd-security-visual" role="img" aria-label="Security+ study: identity, threats and network defence">
    <div className="gd-security-rings" aria-hidden="true"><i/><i/></div>
    <span className="gd-security-node gd-node-identity"><Fingerprint size={21}/> Identity</span>
    <span className="gd-security-node gd-node-threats"><Radar size={21}/> Threats</span>
    <div className="gd-security-badge"><ShieldCheck size={46} strokeWidth={1.4}/><strong>Security+</strong><small>SY0-701</small></div>
    <span className="gd-security-node gd-node-network"><Network size={21}/> Networks</span>
    <div className="gd-security-cipher"><MascotAnimation animation="scan" size={82} label="Cipher guides your Security+ study"/></div>
   </div>
   <h2>New to Security+?<br/>You’re in the right place.</h2><p>Try a little. Skip anything new. See your path.</p>
   <div className="gd-welcome-stats"><span><strong>10</strong> easy questions</span><i/><span><strong>5</strong> Exam domains</span></div>
   <div className="gd-preview-domains" aria-label="All five exam domains">{domains.map((name,i)=><span key={name} title={name}>{['Security','Threats','Architecture','Operations','Risk'][i]}</span>)}</div>
   <button className="btn btn-primary" onClick={start}>Start my 10 Q diagnostic <ArrowRight size={18}/></button><small>No experience needed · No timer · No pressure</small>
  </div>:done?<div className="gd-results">
   <div className="gd-path-ready"><MascotAnimation animation="wave" size={64} label="Cipher welcomes you to your learning path"/><span className="guest-eyebrow">A STARTING POINT, NOT A SCORE</span><h2 ref={heading} tabIndex={-1}>Your next steps are ready.</h2><p>You don’t need to know it all. That’s what we’re here for.</p></div>
   {!draft.noticeDismissed&&<div className="gd-save-notice" role="status"><Save size={21}/><div><strong>Not saved to an account yet.</strong><p>{!isDiagnosticBrowserSaved()?"Browser saving is unavailable. Keep this tab open and save to a free account before leaving.":!importable?"Your result is still in this browser. The seven-day account import window has ended.":`Saved only in this browser. Create a free account or log in here by ${importDeadline} to import this exact diagnostic, including your weak topics and retests. Save to your account before switching devices.`}</p><button className="gd-save-action" onClick={signup} disabled={saving}>{importable?'Save my results to a free account':'Create a free account'}<ArrowRight size={17}/></button></div><button className="gd-save-dismiss" onClick={()=>publish({...draft,noticeDismissed:true})} aria-label="Dismiss save reminder"><X size={18}/></button></div>}
   <div className="gd-focus gd-next-step">
    <span className="guest-eyebrow"><Sparkles size={15}/> YOUR NEXT STEP</span>
    {misses.length>0&&<div className="gd-topic-preview" aria-label="Topics to work on"><span>A few things to explore</span><div>{misses.slice(0,3).map(row=><span key={row.conceptTag}>{row.topic||conceptName(row.conceptTag)}</span>)}</div></div>}
    <div className={`gd-start-topic ${misses.length?'has-topic':''}`}>
     <div className="gd-focus-icon" aria-hidden="true"><Target size={29}/></div>
     <div><span className="gd-focus-kicker">{misses.length?'LET’S START WITH ONE':'KEEP THE MOMENTUM'}</span><h3>{misses[0]?(misses[0].topic||conceptName(misses[0].conceptTag)):'Your next Security+ discovery'}</h3><p>{misses.length?'One concept. Two ways to make it click.':'You’ve met the basics. Keep building with lessons and flashcards.'}</p></div>
    </div>
    {misses.length>0&&<div className="gd-resource-actions">
     <button className="gd-resource gd-resource-cards" onClick={signup} disabled={saving}><Layers3 size={24}/><span><strong>Flashcards</strong><small>Remember the essentials</small></span><ArrowRight size={20}/></button>
     <button className="gd-resource gd-resource-lesson" onClick={signup} disabled={saving}><BookOpenCheck size={24}/><span><strong>Concept Deep Dive</strong><small>Make the idea click</small></span><ArrowRight size={20}/></button>
    </div>}
    <div className="gd-plan-signup"><span className="gd-plan-promise"><Sparkles size={17}/> Your topics. Your practice. Your pace.</span><button className="btn btn-primary gd-plan-cta" onClick={signup} disabled={saving}><span>{saving?'Saving your path…':'Build my free study plan'}</span><ArrowRight size={23}/></button><small>{importable?"Create a free account or log in here to import this exact diagnostic automatically. Your result stays in this browser until the import succeeds.":"Create a free account for new practice. This older diagnostic remains available in this browser."}</small></div>
   </div>
   <div className="gd-preview-counts"><div><strong>10</strong><span>Concepts explored</span></div><div><strong>{misses.length}</strong><span>To learn together</span></div><div><strong>5</strong><span>Domains discovered</span></div></div>
   <div className="gd-domain-results">{domains.map((name,i)=>{const result=rows.filter(r=>Number(r.ch)===i+1);return <article key={name} style={{'--domain-tint':['#5c91f5','#b88af4','#e2a743','#33b7a3','#d487b5'][i]}}><span>0{i+1}</span><strong>{result.length}<em> explored</em></strong><small>{name}</small><i><b style={{width:'100%'}}/></i></article>;})}</div>
   {misses.length>0&&<details className="gd-recommendations"><summary>Your learn-later list <span>{misses.length}</span></summary>{misses.map(row=>{const lesson=conceptDeepDive(row.conceptTag);return <article key={row.conceptTag}><strong>{row.topic||conceptName(row.conceptTag)}</strong><div><button onClick={signup}><BookOpenCheck size={15}/>{lesson?'Learn with a Deep Dive':'Explore this concept'} <ArrowRight size={14}/></button><button onClick={signup}><Layers3 size={15}/>Try matching flashcards <ArrowRight size={14}/></button></div></article>;})}</details>}
   <button className="btn btn-ghost" onClick={()=>publish({...draft,index:0,reviewing:true})}><RotateCcw size={15}/> Review your answers</button>
  </div>:<div ref={questionBody} className="gd-question" key={`${draft.request_id}-${index}`} >
   <div className="gd-progress-copy"><span>{draft.reviewing?'YOUR EXPLORATION':'A LITTLE TASTE OF SMART REVIEW'}</span><strong>{index+1}<small> / 10</small></strong></div>
   <div className="gd-progress" role="progressbar" aria-label="Diagnostic answers checked" aria-valuemin={0} aria-valuemax={10} aria-valuenow={Object.keys(checked).length}>{questions.map((_,i)=><i key={i} className={checked[i]?'is-done':i===index?'is-current':''}/>)}</div>
   <div className="gd-question-layout"><div className="gd-question-main">
    <span className="gd-domain-label">DOMAIN {q.chapter} · {domains[Number(q.chapter)-1]}</span><h2 ref={heading} tabIndex={-1}>{renderDefinitions(q.prompt)}</h2>
    <div className="gd-options">{q.options.map((o,i)=><button key={o.id} disabled={!!marked} aria-pressed={answers[index]===i} className={`${answers[index]===i?'is-selected':''} ${marked&&i===q.correct?'is-correct':''} ${marked&&answers[index]===i&&i!==q.correct?'is-missed':''}`} onClick={()=>publish({...draft,answers:{...answers,[index]:i}})}><span>{String.fromCharCode(65+i)}</span><span>{renderDefinitions(o.text)}</span><Check size={18} aria-hidden="true" className={`gd-option-check ${marked&&i===q.correct?'is-visible':''}`}/></button>)}</div>
   </div><div className="gd-feedback-slot">
    {marked?<div className={`gd-feedback ${skipped?'is-skipped':answers[index]===q.correct?'is-correct':'is-revisit'}`} role="status" tabIndex={0} aria-label="Answer feedback"><strong>{skipped?'Saved for your learning path.':answers[index]===q.correct?'You’ve got it!':'A new thing to learn.'}</strong>{fullFormat?<p>{skipped&&<span className="gd-skip-reassurance">Don’t worry! We’ll work on this later.</span>}{renderDefinitions(q.explanation)}</p>:<button onClick={()=>setExpanded(true)}>{skipped?'No worries—see this idea in full format':'See why in full format'} <Maximize2 size={14}/></button>}</div>:<div className="gd-feedback-placeholder"><BookOpenCheck size={22}/><span>{fullFormat?'A friendly explanation is waiting. Not sure? You can skip.':'Give it a try—or save it for later.'}</span></div>}
   </div></div>
   <footer className="gd-question-actions"><div className="gd-skip-slot">{!marked?<button type="button" className="gd-skip-button" onClick={skip}><Sparkles size={21}/><span><strong>New to this?</strong><small>Skip & learn later</small></span><ArrowRight size={16}/></button>:<span className="gd-step-encouragement">{skipped?'No pressure. This is on your learn-later list.':index===9?'Look at that—you’ve explored all ten!':`${index+1} explored. Your path is taking shape.`}</span>}</div>{marked?<button className="btn btn-primary" disabled={transitioning} onClick={nextQuestion}>{index===9?'See my learning path':'Let’s keep exploring'} <ArrowRight size={16}/></button>:<button className="btn btn-primary" disabled={answers[index]==null} onClick={()=>publish({...draft,checked:{...checked,[index]:true}})}>Try my answer <Check size={16}/></button>}</footer>

  </div>}
  {error&&<p className="gd-error" role="alert">{error}</p>}
 </section>;
 return <>{expanded?<div className="gd-collapsed"><span>Your diagnostic is open in full format.</span><button className="btn btn-outline" onClick={()=>dialog.current?.focus()}>Return to diagnostic</button></div>:content}{expanded&&createPortal(<dialog ref={dialog} className="gd-dialog" aria-label="Diagnostic full format" onCancel={()=>setExpanded(false)} onClick={e=>{if(e.target===e.currentTarget)setExpanded(false);}}>{content}</dialog>,document.body)}</>;
}

// Mounted once in the guest shell, so dismissing the prompt or auth dialog never loses the reminder.
export function GuestDiagnosticSaveBanner({t,onSignup,onViewResults}){
 const draft=useSyncExternalStore(subscribe,snapshot,snapshot);
 if(!diagnosticComplete(draft)||!(draft.noticeDismissed||draft.savePromptOpened))return null;
 const importable=diagnosticImportable(draft);
 const deadline=new Date(draft.startedAt+DIAGNOSTIC_IMPORT_WINDOW).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
 return <aside className="gd-save-banner" style={guestPalette(t)} aria-label="Save your diagnostic results"><Save size={22}/><div><strong>{importable?'Save your diagnostic results':'Your diagnostic is still in this browser'}</strong><span>{!isDiagnosticBrowserSaved()?'Browser saving unavailable. Save before closing this tab.':importable?`Browser only · save to a free account by ${deadline} for access on other devices.`:'The account import window has ended. You can still view this result.'}</span></div><button className="gd-save-view" onClick={()=>{publish({...draft,index:10});onViewResults();}}>View results</button>{importable&&<button className="gd-save-action" onClick={onSignup}>Save results<ArrowRight size={17}/></button>}</aside>;
}
