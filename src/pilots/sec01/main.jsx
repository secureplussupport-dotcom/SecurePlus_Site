import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft, ArrowRight, Check, Star, LockKeyhole, Fingerprint, Layers3, ShieldCheck, FilePenLine, Activity, Moon, Sun, RotateCcw, BookOpen, Lightbulb, ScanLine} from 'lucide-react';
import {supabase} from '../../lib/supabaseClient.js';
import {mcqEngineRequest} from '../../lib/mcqEngineClient.js';
import {createLessonBookmarks} from './bookmarks.js';
import {lessonKeywords} from './keywords.js';
import lesson from './lesson.json';
import {gradePilotCheck} from './checks.js';
import './style.css';

const bookmarks = createLessonBookmarks({
  getSession:async()=>{
    if(!supabase)return null;
    const {data,error}=await supabase.auth.getSession();
    if(error)throw error;
    return data.session;
  },
  request:mcqEngineRequest,
  storage:{
    get:async key=>window.storage?.get?window.storage.get(key):{value:localStorage.getItem(key)},
    set:async(key,value)=>window.storage?.set?window.storage.set(key,value):localStorage.setItem(key,value),
  },
});
const sections = [
  {id:'keywords',label:'Keywords',icon:BookOpen},
  {id:'incident',label:'The incident',icon:FilePenLine},
  {id:'mechanism',label:'How it works',icon:Layers3},
  {id:'exam-trap',label:'Exam trap',icon:Lightbulb},
  {id:'micro-checks',label:'Quick checks',icon:ScanLine},
];
const mechanisms = [
  {name:'CIA triad',icon:ShieldCheck,tone:'blue',title:'Three goals. Different failures.',body:'Private ≠ accurate ≠ usable.',items:[['Confidentiality','Who can see it?','Encryption · access controls'],['Integrity','Can we trust it?','Trusted hashes · signatures'],['Availability','Can we use it?','Redundancy · tested backups']]},
  {name:'Non-repudiation',icon:Fingerprint,tone:'violet',title:'Who signed this action?',body:'A shared login cannot identify the individual.',items:[['Private key','Signs the transfer','Bind the signature to the transaction'],['Public key','Verifies the signature','Evidence of origin and integrity'],['The limit','Protect the signing key','Identity binding and key security still matter']]},
  {name:'Defense-in-depth',icon:Layers3,tone:'mint',title:'One failure. More barriers.',body:'Independent layers prevent, contain or detect compromise.',items:[['Administrative','Two-person approval','Review payroll changes'],['Technical','Individual accounts','Segmentation · anomaly alerts'],['Physical','Restricted access','Protect management consoles']]},
];
function Keywords() {
  const [state,setState]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const mounted=useRef(true),locked=useRef(false);
  const load=async()=>{setError('');try{const next=await bookmarks.load();if(mounted.current)setState(next);}catch{if(mounted.current)setError('Saved terms unavailable. Try again.');}};
  useEffect(()=>{mounted.current=true;load();return()=>{mounted.current=false;};},[]);
  const toggle=async card=>{
    if(locked.current||!state)return;
    locked.current=true;setBusy(true);setError('');setNotice('');
    try{const next=await bookmarks.toggle(state,card.id);if(mounted.current){setState(next);setNotice(next.keys.includes(`flashcard:${card.id}`)?`${card.term} saved to Flashcards${next.signedIn?'': ' on this device'}.`:`${card.term} removed from saved Flashcards.`);}}
    catch(error){if(mounted.current){setError(error.message);setState(null);}}
    finally{locked.current=false;if(mounted.current)setBusy(false);}
  };
  return <><div className="s01-section-title"><span className="s01-eyebrow">START HERE</span><h2>Three terms to know.</h2><p>Star a term to save it in Flashcards.</p></div><div className="s01-keywords">{lessonKeywords.map((card,i)=>{const saved=state?.keys.includes(`flashcard:${card.id}`);return <article className={`s01-keyword tone-${['blue','violet','mint'][i]}`} key={card.id}><span className="s01-card-number">0{i+1}</span><div><h3>{card.term}</h3>{card.full_form&&<strong className="s01-full-form">{card.full_form}</strong>}<p>{card.definition||<em>Definition coming soon.</em>}</p></div><button className={`s01-star ${saved?'is-saved':''}`} disabled={!state||busy} onClick={()=>toggle(card)} aria-pressed={!!saved} aria-label={`${saved?'Unstar':'Star'} ${card.term}`}><Star size={23} fill={saved?'currentColor':'none'}/></button></article>;})}</div><div className="s01-save-status" role="status">{error?<>{error} <button onClick={load}>Reload saved terms</button></>:notice||(!state?'Loading saved terms…':'Definitions from your Flashcards bank.')}</div></>;
}
function Incident(){return <><div className="s01-section-title"><span className="s01-eyebrow">THE INCIDENT</span><h2>Encrypted. Online. Still compromised.</h2></div><div className="s01-incident"><article className="s01-payroll"><span className="s01-eyebrow">PAYROLL ALERT · prd-db-01</span><div className="s01-bank"><strong>Bank A</strong><ArrowRight/><strong>Bank B</strong></div><p>Routing changed without permission.</p><div className="s01-shared"><Fingerprint/><span><strong>Admin_Shared</strong><small>One account. Six managers.</small></span></div></article><div className="s01-signals"><div className="tone-blue"><LockKeyhole/><span><strong>Private</strong><small>No disclosure in this scenario*</small></span><Check/></div><div className="tone-mint"><Activity/><span><strong>Usable</strong><small>Payroll remains online</small></span><Check/></div><div className="tone-rose"><FilePenLine/><span><strong>Integrity breached</strong><small>The record was altered</small></span></div><p>The account is known.<br/><strong>The person isn’t.</strong></p></div></div><p className="s01-footnote">*An explicit assumption. Encryption alone does not prove confidentiality.</p></>;}
function Mechanism(){const [active,setActive]=useState(0),current=mechanisms[active];return <><div className="s01-section-title"><span className="s01-eyebrow">HOW IT WORKS</span><h2>Choose the goal. Then the control.</h2></div><div className="s01-concept-selector" aria-label="Explore a principle">{mechanisms.map((item,i)=>{const Icon=item.icon;return <button className={`tone-${item.tone} ${active===i?'is-active':''}`} onClick={()=>setActive(i)} aria-pressed={active===i} key={item.name}><Icon size={22}/>{item.name}</button>;})}</div><article className={`s01-mechanism tone-${current.tone}`} key={current.name}><h3>{current.title}</h3><p>{current.body}</p><div className="s01-mechanism-grid">{current.items.map(([name,goal,control],i)=><div key={name}><span className="s01-card-number">0{i+1}</span><h4>{name}</h4><strong>{goal}</strong><p>{control}</p></div>)}</div></article></>;}
function ExamTrap(){return <><div className="s01-section-title"><span className="s01-eyebrow">EXAM TRAP</span><h2>“Encrypted” isn’t the whole answer.</h2></div><div className="s01-myth"><span>THE DISTRACTION</span><p>“It’s encrypted. Everything is safe.”</p></div><div className="s01-clues">{[['ALTERED / FORGED','Integrity','Was the data changed?'],['DISPUTED ORIGIN','Non-repudiation','Can the signature be verified?'],['ONE BARRIER FAILS','Defense-in-depth','What stops the next step?']].map(([clue,goal,question],i)=><article className={`tone-${['rose','violet','mint'][i]}`} key={goal}><span>{clue}</span><ArrowRight/><h3>{goal}</h3><p>{question}</p></article>)}</div></>;}
function MicroChecks(){
  const checks=lesson.content.micro_checks;
  const [index,setIndex]=useState(0),[choice,setChoice]=useState(null),[answers,setAnswers]=useState({}),[finished,setFinished]=useState(false);
  const question=checks[index],result=answers[index],heading=useRef(null),interacted=useRef(false);
  useEffect(()=>{if(interacted.current)heading.current?.focus({preventScroll:true});},[index,finished]);
  const next=()=>{interacted.current=true;if(index===2)setFinished(true);else{setIndex(index+1);setChoice(null);}};
  return <div className="s01-check-card"><div className="s01-check-header"><span className="s01-eyebrow">QUICK CHECKS · {finished?'COMPLETE':`${index+1} / 3`}</span><span>No timer. Just clues.</span></div><div className="s01-progress">{checks.map((q,i)=><i key={q.check_id} className={answers[i]?'is-done':i===index?'is-current':''}/>)}</div>{finished?<div className="s01-takeaways"><ShieldCheck size={42}/><h2 tabIndex={-1} ref={heading}>Three clues. Three goals.</h2><p>Changed → <strong>Integrity</strong></p><p>Disputed origin → <strong>Non-repudiation</strong></p><p>One barrier → <strong>Defense-in-depth</strong></p><button className="s01-button" onClick={()=>{setIndex(0);setChoice(null);setAnswers({});setFinished(false);}}><RotateCcw size={17}/> Try again</button></div>:<><h2 className="s01-check-question" tabIndex={-1} ref={heading}>{question.prompt}</h2>{!result?<div className="s01-options" role="group" aria-label="Choose an answer">{question.options.map((option,i)=><button className={choice===i?'is-selected':''} key={option} aria-pressed={choice===i} onClick={()=>setChoice(i)}><span>{String.fromCharCode(65+i)}</span>{option}</button>)}</div>:<div className={`s01-feedback ${result.correct?'tone-mint':'tone-gold'}`} role="status"><span className="s01-eyebrow">{result.correct?'YOU FOUND THE CLUE':'A CLUE TO REVISIT'}</span><h3>{question.options[question.correct_index]}</h3><p>{question.explanation}</p>{!result.correct&&<small>Your choice: {question.options[result.choice]}</small>}</div>}<div className="s01-check-footer"><small>Practice only · not scored</small>{result?<button className="s01-button" onClick={next}>{index===2?'Finish checks':'Next check'}<ArrowRight size={17}/></button>:<button className="s01-button" disabled={choice===null} onClick={()=>setAnswers(prev=>({...prev,[index]:{choice,correct:gradePilotCheck(question,choice)}}))}>Check answer<ArrowRight size={17}/></button>}</div></>}</div>;
}
function Sec01Pilot(){
  const [tab,setTab]=useState(0),[dark,setDark]=useState(()=>{try{const saved=localStorage.getItem('secureplus-theme-mode');return saved?saved==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}catch{return false;}});
  const tabs=useRef([]),content=useRef(null);
  const select=(index,focus=false)=>{setTab(index);if(focus)tabs.current[index]?.focus();};
  return <div className={`s01-page ${dark?'s01-dark':''}`}><header className="s01-topbar"><a href="/" className="s01-brand"><img src="/favicon-v2.svg" alt=""/>SecurePlus</a><span className="s01-pilot-badge">SEC-01 · LESSON PILOT</span><button className="s01-theme" onClick={()=>setDark(!dark)} aria-label={dark?'Switch to light theme':'Switch to dark theme'}>{dark?<Sun size={20}/>:<Moon size={20}/>}</button></header><main className="s01-main"><div className="s01-lesson-heading"><a href="/?view=deep-dives" className="s01-back" aria-label="Back to Concept Deep Dives"><ArrowLeft size={20}/></a><div><span className="s01-eyebrow">FOUNDATIONAL SECURITY</span><h1>Core Security Triad <span>& Principles</span></h1></div><span className="s01-page-count">0{tab+1}<small> / 05</small></span></div><nav className="s01-tabs" role="tablist" aria-label="Lesson sections">{sections.map((section,i)=>{const Icon=section.icon;return <button ref={el=>tabs.current[i]=el} key={section.id} id={`tab-${section.id}`} role="tab" aria-selected={tab===i} aria-controls={`panel-${section.id}`} tabIndex={tab===i?0:-1} onClick={()=>select(i)} onKeyDown={event=>{let next;if(event.key==='ArrowRight')next=(i+1)%5;if(event.key==='ArrowLeft')next=(i+4)%5;if(event.key==='Home')next=0;if(event.key==='End')next=4;if(next!==undefined){event.preventDefault();select(next,true);}}}><Icon size={18}/><span>{section.label}</span></button>;})}</nav><div className="s01-stage" ref={content}>{sections.map((section,i)=><section key={section.id} id={`panel-${section.id}`} role="tabpanel" aria-labelledby={`tab-${section.id}`} tabIndex={0} hidden={tab!==i}>{[<Keywords/>,<Incident/>,<Mechanism/>,<ExamTrap/>,<MicroChecks/>][i]}</section>)}</div><footer className="s01-footer"><span>SEC-01 <span className="s01-footer-note">· 3 concepts</span></span><div><button className="s01-text-button" disabled={tab===0} onClick={()=>select(tab-1)}><ArrowLeft size={16}/> Back</button>{tab<4?<button className="s01-button" onClick={()=>select(tab+1)}>{tab===0?'Begin lesson':'Continue'}<ArrowRight size={17}/></button>:<a className="s01-button" href="/?view=deep-dives">Deep Dives<ArrowRight size={17}/></a>}</div></footer></main></div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><Sec01Pilot/></React.StrictMode>);
