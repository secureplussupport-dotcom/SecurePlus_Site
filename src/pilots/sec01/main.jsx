import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, ArrowDown, Check, CheckCheck, LockKeyhole, Fingerprint, Layers3, ShieldCheck, ShieldAlert, FilePenLine, Activity, Clock3, Moon, Sun, KeyRound, ScanLine, ChevronRight, Lightbulb, CircleCheck, RotateCcw, ExternalLink } from 'lucide-react';
import lesson from './lesson.json';
import { gradePilotCheck } from './checks.js';
import './style.css';

const pillars = [
  { id:'confidentiality', letter:'C', name:'Confidentiality', verb:'Who can see it?', status:'Intact in this scenario', icon:LockKeyhole, tone:'blue', definition:'Keep information from people who are not allowed to see it.', evidence:'The scenario states that no unauthorized viewing or disclosure occurred. Encryption protects the connection; it is not proof that nothing was exposed.', controls:'Encryption · Access controls · Least privilege' },
  { id:'integrity', letter:'I', name:'Integrity', verb:'Can we trust it?', status:'Breached', icon:FilePenLine, tone:'rose', definition:'Protect information from unauthorized changes or destruction.', evidence:'The employee’s bank routing details changed without permission. The database can be encrypted and online while the record is still wrong.', controls:'Trusted hashes · Digital signatures · Message authentication codes' },
  { id:'availability', letter:'A', name:'Availability', verb:'Can we use it?', status:'Intact in this scenario', icon:Activity, tone:'mint', definition:'Keep systems and data usable when authorized people need them.', evidence:'Payroll remains usable with no interruption. In a different incident, a server that responds to a ping but cannot serve usable files would still have an availability failure.', controls:'Redundancy · Fault tolerance · Tested backups' },
];
const sections = [{id:'incident',label:'The incident'},{id:'mechanism',label:'The mechanism'},{id:'exam-trap',label:'The exam trap'},{id:'micro-checks',label:'Micro-checks'}];

function SectionHeading({number,eyebrow,title,children}) {
  return <div className="s01-section-heading"><span className="s01-number">{number}</span><div><span className="s01-eyebrow">{eyebrow}</span><h2>{title}</h2>{children&&<p>{children}</p>}</div></div>;
}

function MicroChecks() {
  const checks=lesson.content.micro_checks;
  const [index,setIndex]=useState(0),[choice,setChoice]=useState(null),[answers,setAnswers]=useState({}),[finished,setFinished]=useState(false);
  const question=checks[index],result=answers[index];
  const checkHeading=useRef(null),interacted=useRef(false);
  useEffect(()=>{
    if(!interacted.current)return;
    checkHeading.current?.focus({preventScroll:true});
    checkHeading.current?.closest('.s01-check-card')?.scrollIntoView({block:'start',behavior:'instant'});
  },[index,finished]);
  const submit=()=>{if(choice===null)return;setAnswers(current=>({...current,[index]:{choice,correct:gradePilotCheck(question,choice)}}));};
  const next=()=>{interacted.current=true;if(index===checks.length-1){setFinished(true);return;}setIndex(index+1);setChoice(null);};
  const reset=()=>{interacted.current=true;setIndex(0);setChoice(null);setAnswers({});setFinished(false);};
  return <div className="s01-check-card">
    <div className="s01-check-header"><span><ScanLine size={18}/> THINK IT THROUGH</span><span>{finished?'3 / 3 explored':`${index+1} / 3`}</span></div>
    <div className="s01-check-progress" aria-label={`${Object.keys(answers).length} of 3 micro-checks explored`}>{checks.map((check,i)=><i key={check.check_id} className={answers[i]?'is-done':i===index?'is-current':''}/>)}</div>
    {finished?<div className="s01-check-complete" role="status"><span className="s01-complete-icon"><CheckCheck size={32}/></span><span className="s01-eyebrow">THE THREE TAKEAWAYS</span><h3 ref={checkHeading} tabIndex={-1}>See the goal behind the clue.</h3><div className="s01-takeaways"><p><strong>Changed without permission?</strong> Integrity.</p><p><strong>Need verifiable evidence of origin?</strong> Non-repudiation.</p><p><strong>One barrier fails and everything falls?</strong> Defense-in-depth.</p></div><button className="s01-button s01-button-secondary" onClick={reset}><RotateCcw size={17}/> Try the checks again</button></div>:<>
      <p className="s01-check-topic">{['CIA triad','Non-repudiation','Defense-in-depth'][index]}</p>
      <h3 ref={checkHeading} tabIndex={-1} className="s01-check-question" id="s01-check-question">{question.prompt}</h3>
      <div className="s01-options" role="group" aria-labelledby="s01-check-question">{question.options.map((option,i)=>{
        const selected=(result?.choice??choice)===i;
        return <button key={option} type="button" aria-pressed={selected} disabled={!!result} onClick={()=>setChoice(i)} className={`${selected?'is-selected':''} ${result&&i===question.correct_index?'is-correct':''} ${result&&selected&&!result.correct?'is-revisit':''}`}><span className="s01-option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>{result&&i===question.correct_index&&<Check size={19}/>}</button>;
      })}</div>
      {result&&<div className={`s01-check-feedback ${result.correct?'is-correct':'is-revisit'}`} role="status"><strong>{result.correct?'That’s the distinction.':'A useful clue to revisit.'}</strong><p>{question.explanation}</p></div>}
      <div className="s01-check-footer"><span>Practice only · no mastery score recorded</span>{result?<button className="s01-button" onClick={next}>{index===2?'See the takeaways':'Next check'} <ArrowRight size={17}/></button>:<button className="s01-button" disabled={choice===null} onClick={submit}>Check my thinking <ArrowRight size={17}/></button>}</div>
    </>}
  </div>;
}

function Sec01Pilot() {
  const [active,setActive]=useState('integrity');
  const [dark,setDark]=useState(()=>{try{const saved=localStorage.getItem('secureplus-theme-mode');return saved?saved==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}catch{return false;}});
  const selected=pillars.find(pillar=>pillar.id===active);
  return <div className={`s01-page ${dark?'s01-dark':''}`}>
    <a className="s01-skip" href="#lesson-content">Skip to lesson</a>
    <header className="s01-topbar"><a className="s01-brand" href="/"><img src="/favicon-v2.svg" alt=""/><strong>SecurePlus</strong></a><div><span className="s01-pilot-badge">LESSON PILOT</span><button className="s01-theme" onClick={()=>setDark(!dark)} aria-label={dark?'Switch to light theme':'Switch to dark theme'}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button></div></header>
    <main className="s01-main" id="lesson-content">
      <a className="s01-back" href="/?view=deep-dives"><ArrowLeft size={15}/> Concept Deep Dives</a>
      <section className="s01-hero" aria-labelledby="lesson-title"><div><div className="s01-eyebrow"><span className="s01-lesson-code">SEC-01</span> FOUNDATIONAL SECURITY</div><h1 id="lesson-title">Core Security Triad<br/><span>& Principles</span></h1><p>Encrypted. Online. Still compromised.<br/>Learn to spot what actually failed.</p><div className="s01-meta"><span><Clock3 size={15}/> About 3 minutes</span><span><Layers3 size={15}/> 3 concepts</span><span><ScanLine size={15}/> 3 micro-checks</span></div></div><div className="s01-hero-symbol" aria-hidden="true"><span className="s01-orbit"/><span className="s01-orbit s01-orbit-inner"/><span className="s01-letter s01-c">C</span><span className="s01-letter s01-i">I</span><span className="s01-letter s01-a">A</span><ShieldCheck size={62} strokeWidth={1.2}/><span className="s01-symbol-caption">THREE GOALS. ONE SYSTEM.</span></div></section>
      <nav className="s01-lesson-nav" aria-label="Lesson sections">{sections.map((section,i)=><a href={`#${section.id}`} key={section.id}><span>0{i+1}</span>{section.label}</a>)}</nav>
      <section className="s01-section" id="incident">
        <SectionHeading number="01" eyebrow="THE BATTLEFIELD ANCHOR" title="A quiet change. A real breach."/>
        <div className="s01-incident-grid"><article className="s01-alert"><div className="s01-alert-head"><span><ShieldAlert size={18}/> SECURITY ALERT</span><span>prd-db-01</span></div><h3>Payroll record modified</h3><p>A direct-deposit destination changed inside the ERP database.</p><div className="s01-bank-change"><span><small>PREVIOUS ROUTING</small><strong>Bank A</strong></span><ArrowRight size={23}/><span><small>NEW ROUTING</small><strong>Bank B</strong></span></div><div className="s01-actor"><Fingerprint size={20}/><span><small>ACTOR ACCOUNT</small><strong>Admin_Shared</strong></span><em>6 managers</em></div><p className="s01-alert-failure">The employee never requested it.<br/><strong>The account is known. The person isn’t.</strong></p></article>
        <div className="s01-evidence"><span className="s01-eyebrow">WHAT THE EVIDENCE SAYS</span><div><LockKeyhole size={21}/><span><strong>Traffic encrypted</strong><small>No unauthorized disclosure in this scenario*</small></span><span className="s01-evidence-status">PRIVATE</span></div><div><Activity size={21}/><span><strong>100% uptime</strong><small>Payroll is still available and usable</small></span><span className="s01-evidence-status">ONLINE</span></div><div className="s01-evidence-failed"><FilePenLine size={21}/><span><strong>Unauthorized change</strong><small>The record no longer reflects the employee’s request</small></span><span className="s01-evidence-status">ALTERED</span></div><div className="s01-incident-takeaway"><Lightbulb size={22}/><p>Privacy and uptime do not guarantee<br/><strong>trustworthy data—or a provable actor.</strong></p></div><small className="s01-assumption">*An explicit scenario assumption. Encryption alone does not prove that confidentiality is intact.</small></div></div>
      </section>
      <section className="s01-section" id="mechanism">
        <SectionHeading number="02" eyebrow="THE CORE MECHANISM" title="Name the security goal." >Start with the outcome. Then choose the control.</SectionHeading>
        <div className="s01-cia-grid" aria-label="Explore the CIA triad">{pillars.map(pillar=>{const Icon=pillar.icon;return <button key={pillar.id} className={`s01-pillar tone-${pillar.tone} ${active===pillar.id?'is-active':''}`} aria-pressed={active===pillar.id} aria-controls="s01-pillar-detail" onClick={()=>setActive(pillar.id)}><span className="s01-pillar-letter">{pillar.letter}</span><Icon size={22}/><strong>{pillar.name}</strong><span>{pillar.verb}</span><small>{pillar.id==='integrity'?<ShieldAlert size={13}/>:<CircleCheck size={13}/>} {pillar.status}</small></button>;})}</div>
        <div className={`s01-pillar-detail tone-${selected.tone}`} id="s01-pillar-detail" aria-live="polite"><div><span className="s01-eyebrow">{selected.name.toUpperCase()}</span><h3>{selected.definition}</h3><p>{selected.evidence}</p></div><div className="s01-control-note"><span>CONTROLS THAT HELP</span><p>{selected.controls}</p>{selected.id==='integrity'&&<small>A plain hash needs a trusted reference. A shared-key MAC does not establish non-repudiation.</small>}</div></div>
        <div className="s01-principle-grid"><article className="s01-principle"><span className="s01-principle-icon tone-violet"><Fingerprint size={26}/></span><span className="s01-eyebrow">NON-REPUDIATION</span><h3>“Can we prove who signed?”</h3><p>Shared credentials leave an attribution gap. Unique identities help accountability; a digital signature adds independently verifiable evidence of origin and integrity.</p><div className="s01-signature-path"><span><KeyRound size={17}/> Private key signs</span><ChevronRight size={17}/><span><ShieldCheck size={17}/> Public key verifies</span></div><details><summary>The important limit</summary><p>Assurance depends on identity binding, transaction details and private-key protection. A hardware-bound key makes theft or copying harder; it does not make compromise or a dispute impossible.</p></details></article><article className="s01-principle"><span className="s01-principle-icon tone-mint"><Layers3 size={26}/></span><span className="s01-eyebrow">DEFENSE-IN-DEPTH</span><h3>“What if this barrier fails?”</h3><p>Use independent controls so one failure does not expose everything. Multiple layers can prevent, contain or detect a compromise.</p><ol className="s01-defense-layers"><li><span>01</span><div><strong>Administrative</strong><small>Two-person approval for payroll changes</small></div></li><li><span>02</span><div><strong>Technical</strong><small>Individual accounts, segmentation, anomaly alerts</small></div></li><li><span>03</span><div><strong>Physical</strong><small>Restricted access to management consoles</small></div></li></ol></article></div>
      </section>
      <section className="s01-section" id="exam-trap"><SectionHeading number="03" eyebrow="THE COMPTIA EXAM TRAP" title="Don’t let “encrypted” distract you."/><div className="s01-trap"><div className="s01-trap-myth"><span>THE ALMOST-RIGHT ASSUMPTION</span><p>“It’s encrypted.<br/>All three goals are safe.”</p><strong>Look at what happened instead.</strong><ArrowDown size={25}/></div><div className="s01-clues"><div><span>ALTERED / FORGED / CORRUPTED</span><strong>Integrity</strong><p>Even if the connection used encryption.</p></div><div><span>DISPUTED ACTION / ORIGIN</span><strong>Non-repudiation</strong><p>Look for a properly implemented digital signature.</p></div><div><span>ONE FAILED EDGE CONTROL</span><strong>Defense-in-depth</strong><p>A strong perimeter needs layers behind it.</p></div></div></div></section>
      <section className="s01-section" id="micro-checks"><SectionHeading number="04" eyebrow="THREE MICRO-CHECKS" title="Your turn to read the clues.">No timer. Choose an answer, then unpack why.</SectionHeading><MicroChecks/></section>
      <footer className="s01-footer"><div className="s01-footer-heading"><ShieldCheck size={24}/><div><strong>Protect the right goal.</strong><p>Private ≠ unmodified ≠ usable ≠ attributable.</p></div></div><details className="s01-review-notes"><summary>Lesson tags & sources <ChevronRight size={15}/></summary><div className="s01-tags">{lesson.mapped_tags.map(tag=><code key={tag}>{tag}</code>)}</div><div className="s01-source-links">{lesson.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={13}/></a>)}</div></details><a className="s01-back" href="/?view=deep-dives"><ArrowLeft size={15}/> Back to the current Deep Dives</a><small>SEC-01 · Pilot for review · Current lesson library unchanged</small></footer>
    </main>
  </div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><Sec01Pilot/></React.StrictMode>);
