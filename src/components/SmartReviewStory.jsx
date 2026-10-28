import { useEffect, useState } from 'react';
import { ArrowRight, BookOpenCheck, Check, Layers3, RotateCcw, Sparkles, Target, X } from 'lucide-react';
import { MascotAnimation } from '../lib/MascotAnimation.jsx';
import './SmartReviewStory.css';

const scenes = [
  {label:'Spot the gap',title:'A miss becomes a plan.',copy:'Study it. Practise it. Revisit it.',animation:'thinking'},
  {label:'Study the concept',title:'Open the lesson or matching cards.',copy:'Explore the idea in a Deep Dive. Recall it with matching flashcards.',animation:'flashcards'},
  {label:'Build your next set',title:'Three kinds of question. One set.',copy:'Fresh questions target weak concepts, alongside new topics and retests when due.',animation:'scan'},
  {label:'Come back stronger',title:'Clear it from your missed queue.',copy:'The original missed question becomes eligible for a retest after 30 other MCQ answers.',animation:'cheer'},
];

function QuestionArtwork({retest=false}) {
  return <div className={`sr-question-art ${retest?'is-retest':''}`}>
    <div className="sr-art-top"><span><Target size={16}/> {retest?'RETEST':'DIAGNOSTIC'}</span><span>RTO</span></div>
    <h3>A service must be restored within four hours. Which metric defines that target?</h3>
    <div className={`sr-answer-art ${retest?'is-right':''}`}><span>A</span><strong>Recovery time objective</strong>{retest&&<Check size={19}/>}</div>
    <div className={`sr-answer-art ${retest?'':'is-wrong'}`}><span>B</span><strong>Recovery point objective</strong>{!retest&&<X size={19}/>}</div>
    <div className="sr-answer-outcome">{retest?<><Check size={16}/> Correct · removed from the missed queue</>:<><Target size={16}/> Recovery time needs another look</>}</div>
  </div>;
}

function LearningArtwork() {
  return <div className="sr-learning-art">
    <div className="sr-concept-anchor"><Target size={18}/> Recovery time <span>RTO</span></div>
    <div className="sr-branch-art" aria-hidden="true"><i/><i/><b/><b/></div>
    <div className="sr-learning-tools">
      <article className="sr-lesson-art"><BookOpenCheck size={27}/><small>CONCEPT DEEP DIVE</small><h3>Service recovery</h3><div className="sr-mini-timeline"><span>Outage</span><i><b/></i><span>Restored</span></div><p>RTO is your target time to restore a service.</p></article>
      <div className="sr-flashcard-art"><div className="sr-flashcard-turn"><article className="sr-flashcard-front"><Layers3 size={24}/><small>FLASHCARD</small><strong>RTO</strong><span>Can you recall it?</span></article><article className="sr-flashcard-back"><Check size={24}/><small>RECALL</small><strong>Recovery time<br/>objective</strong><span>Target time to restore a service.</span></article></div></div>
    </div>
  </div>;
}

function SetArtwork() {
  return <div className="sr-set-art"><div className="sr-set-top"><Sparkles size={19}/><strong>Your next Smart Review set</strong></div><div className="sr-set-cards">
    <article className="sr-set-card sr-remediation"><span><Target size={19}/> WEAK CONCEPT</span><strong>RTO</strong><p>A fresh question. Same concept.</p><small>Targeted practice <ArrowRight size={15}/></small></article>
    <article className="sr-set-card sr-discovery"><span><Sparkles size={19}/> DISCOVERY</span><strong>New ground.</strong><p>Keep building your coverage.</p><small>New topics <ArrowRight size={15}/></small></article>
    <article className="sr-set-card sr-retest"><span><RotateCcw size={19}/> RETEST</span><strong>Seen before.</strong><p>Missed questions return when due.</p><small>After the cooldown <ArrowRight size={15}/></small></article>
  </div><div className="sr-set-foot"><i/><span>Weak concepts, new topics and due retests.</span></div></div>;
}

export function SmartReviewStory() {
  const [{scene,previous},setFrame]=useState({scene:0,previous:null});
  const [reduced,setReduced]=useState(()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(motion.matches);
    motion.addEventListener('change',update);
    return()=>motion.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    if(previous==null)return;
    const timer=setTimeout(()=>setFrame(frame=>({...frame,previous:null})),280);
    return()=>clearTimeout(timer);
  },[scene,previous]);
  const choose=index=>setFrame(frame=>frame.scene===index?frame:{scene:index,previous:frame.scene});
  const renderScene=index=>{
    const active=scenes[index];
    return <><div className="sr-stage" aria-label={`Illustrated example: ${active.label}`}><div className="sr-stage-grid" aria-hidden="true"/>{index===1?<LearningArtwork/>:index===2?<SetArtwork/>:<QuestionArtwork retest={index===3}/>}</div>
      <div className="sr-narration"><div className="sr-cipher"><MascotAnimation animation={active.animation} size={128} label={`Cipher: ${active.label}`}/><span className="sr-cipher-spark" aria-hidden="true"><Sparkles size={20}/></span></div><span className="sr-scene-number">0{index+1} / 04</span><h3>{active.title}</h3><p>{active.copy}</p><span className="sr-example-note">Example · choose a step below</span></div></>;
  };
  return <section className={`sr-story is-manual ${reduced?'is-reduced':''}`} aria-label="See how Smart Review works">
    <header className="sr-story-toolbar"><span><span className="sr-live-dot"/> SMART REVIEW, STEP BY STEP</span><span className="sr-free-note"><Check size={15}/> Included with a free account</span></header>
    <div className="sr-first-step" aria-labelledby="sr-first-step-title">
      <h3 id="sr-first-step-title"><span>01</span> Start with a miss.</h3>
      <div className="sr-first-examples">
        <article><span>DOMAIN 5 · RECOVERY TIME</span><strong>Miss an RTO question?</strong><p><ArrowRight size={18}/> Practise another recovery-time question.</p></article>
        <article><span>DOMAIN 2 · PHISHING</span><strong>Miss a phishing question?</strong><p><ArrowRight size={18}/> Practise spotting another phishing attempt.</p></article>
      </div>
      <p className="sr-diagnostic-link">Your diagnostic misses become your first Smart Review set.</p>
    </div>
    <div className="sr-scene-window" aria-live="polite">
      {previous!=null&&!reduced&&<div className="sr-story-body sr-scene-out" aria-hidden="true" inert>{renderScene(previous)}</div>}
      <div className="sr-story-body sr-scene-in" key={scene}>{renderScene(scene)}</div>
    </div>
    <div className="sr-story-steps" role="group" aria-label="Explore the Smart Review steps">{scenes.map((item,index)=><button key={item.label} className={scene===index?'is-active':''} aria-pressed={scene===index} onClick={()=>choose(index)}><span>0{index+1}</span><strong>{item.label}</strong></button>)}</div>
  </section>;
}
