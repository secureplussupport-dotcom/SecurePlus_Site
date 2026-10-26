import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpenCheck, Check, Layers3, RotateCcw, Sparkles, Target, X } from 'lucide-react';
import { MascotAnimation } from '../lib/MascotAnimation.jsx';
import './SmartReviewStory.css';

const scenes = [
  {label:'Spot the gap',title:'A miss is a starting point.',copy:'Smart Review records the missed question and the concept behind it.',animation:'thinking'},
  {label:'Make it click',title:'One concept. Two ways in.',copy:'Explore the idea in a Deep Dive. Recall it with matching flashcards.',animation:'flashcards'},
  {label:'Build your next set',title:'Your next set has a purpose.',copy:'Fresh questions target weak concepts, alongside new topics and retests when due.',animation:'scan'},
  {label:'Come back stronger',title:'See it again. Know it better.',copy:'The original missed question becomes eligible for a retest after 30 other MCQ answers.',animation:'cheer'},
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
      <article className="sr-lesson-art"><BookOpenCheck size={27}/><small>CONCEPT DEEP DIVE</small><h3>Make the idea click.</h3><div className="sr-mini-timeline"><span>Outage</span><i><b/></i><span>Restored</span></div><p>RTO is your target time to restore a service.</p></article>
      <div className="sr-flashcard-art"><div className="sr-flashcard-turn"><article className="sr-flashcard-front"><Layers3 size={24}/><small>FLASHCARD</small><strong>RTO</strong><span>Can you recall it?</span></article><article className="sr-flashcard-back"><Check size={24}/><small>RECALL</small><strong>Recovery time<br/>objective</strong><span>Target time to restore a service.</span></article></div></div>
    </div>
  </div>;
}

function SetArtwork() {
  return <div className="sr-set-art"><div className="sr-set-top"><Sparkles size={19}/><strong>Your next Smart Review set</strong></div><div className="sr-set-cards">
    <article className="sr-set-card sr-remediation"><span><Target size={19}/> WEAK CONCEPT</span><strong>RTO</strong><p>A fresh question. Same concept.</p><small>Targeted practice <ArrowRight size={15}/></small></article>
    <article className="sr-set-card sr-discovery"><span><Sparkles size={19}/> DISCOVERY</span><strong>New ground.</strong><p>Keep building your coverage.</p><small>New topics <ArrowRight size={15}/></small></article>
    <article className="sr-set-card sr-retest"><span><RotateCcw size={19}/> RETEST</span><strong>Seen before.</strong><p>Missed questions return when due.</p><small>After the cooldown <ArrowRight size={15}/></small></article>
  </div><div className="sr-set-foot"><i/><span>Your answers shape the mix.</span></div></div>;
}

export function SmartReviewStory() {
  const host=useRef(null);
  const [{scene,previous},setFrame]=useState({scene:0,previous:null});
  const [engaged,setEngaged]=useState(false),[inView,setInView]=useState(false),[visible,setVisible]=useState(true),[reduced,setReduced]=useState(()=>typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(motion.matches);
    update();motion.addEventListener('change',update);
    const visibility=()=>setVisible(!document.hidden);visibility();document.addEventListener('visibilitychange',visibility);
    const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:.25});
    if(host.current)observer.observe(host.current);
    return()=>{motion.removeEventListener('change',update);document.removeEventListener('visibilitychange',visibility);observer.disconnect();};
  },[]);
  const running=inView&&visible&&!reduced&&!engaged;
  // The visible progress animation is the clock, so pauses cannot desynchronise it.
  const advance=event=>{
    if(event.animationName==='sr-step-clock'&&running)setFrame(frame=>({scene:(frame.scene+1)%scenes.length,previous:frame.scene}));
  };
  useEffect(()=>{
    if(previous==null)return;
    const timer=setTimeout(()=>setFrame(frame=>({...frame,previous:null})),280);
    return()=>clearTimeout(timer);
  },[scene,previous]);
  const choose=index=>setFrame(frame=>frame.scene===index?frame:{scene:index,previous:frame.scene});
  const renderScene=index=>{
    const active=scenes[index];
    return <><div className="sr-stage" aria-label={`Illustrated example: ${active.label}`}><div className="sr-stage-grid" aria-hidden="true"/>{index===1?<LearningArtwork/>:index===2?<SetArtwork/>:<QuestionArtwork retest={index===3}/>}</div>
      <div className="sr-narration"><div className="sr-cipher"><MascotAnimation animation={active.animation} size={128} label={`Cipher: ${active.label}`}/><span className="sr-cipher-spark" aria-hidden="true"><Sparkles size={20}/></span></div><span className="sr-scene-number">0{index+1} / 04</span><h3>{active.title}</h3><p>{active.copy}</p><span className="sr-example-note">Illustrated example · not your results</span></div></>;
  };
  return <section ref={host} className={`sr-story ${running?'is-playing':'is-paused'} ${reduced?'is-reduced':''}`} aria-label="See how Smart Review works" aria-roledescription="carousel" onFocusCapture={()=>setEngaged(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setEngaged(false);}}>
    <header className="sr-story-toolbar"><span><span className="sr-live-dot"/> SMART REVIEW, IN MOTION</span><span className="sr-auto-note">{reduced?'Choose a step below':'Your learning loop'}</span></header>
    <div className="sr-scene-window" aria-live="off">
      {previous!=null&&!reduced&&<div className="sr-story-body sr-scene-out" aria-hidden="true" inert>{renderScene(previous)}</div>}
      <div className="sr-story-body sr-scene-in" key={scene}>{renderScene(scene)}</div>
    </div>
    <div className="sr-story-steps" role="group" aria-label="Explore the Smart Review steps">{scenes.map((item,index)=><button key={item.label} className={scene===index?'is-active':''} aria-pressed={scene===index} onClick={()=>choose(index)}><span>0{index+1}</span><strong>{item.label}</strong>{scene===index&&<i key={scene} aria-hidden="true"><b onAnimationEnd={advance}/></i>}</button>)}</div>
  </section>;
}
