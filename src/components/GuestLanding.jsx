import { SmartReviewStory } from './SmartReviewStory.jsx';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Target, Layers3, BookOpenCheck, RotateCcw, Sparkles } from 'lucide-react';
import { MascotAnimation } from '../lib/MascotAnimation.jsx';
import { GuestDiagnostic, guestPalette } from './GuestDiagnostic.jsx';
import './GuestLanding.css';

function useLandingReveal() {
 const root=useRef(null);
 useEffect(()=>{
  if(!root.current || !('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}
  }),{threshold:.08});
  root.current.querySelectorAll('[data-reveal]').forEach(node=>{
   // Keep the initial viewport visible; reveal only content reached by scrolling.
   if(node.getBoundingClientRect().top<window.innerHeight)node.classList.add('is-revealed');
   else{node.classList.add('reveal-ready');observer.observe(node);}
  });
  return()=>observer.disconnect();
 },[]);
 return root;
}

const steps=[
 {icon:Target,word:'Find it.',title:'A miss becomes a direction.',copy:'Your answers reveal the concepts that need attention.',color:'#5c91f5'},
 {icon:BookOpenCheck,word:'Get it.',title:'Understand the idea behind it.',copy:'Concept Deep Dives explain the why. Flashcards help you recall it.',color:'#b88af4'},
 {icon:RotateCcw,word:'Keep it.',title:'Smart Review brings it back.',copy:'Practice targets weak concepts, schedules missed questions for retests, and keeps new topics in the mix.',color:'#33b7a3'},
];
export function GuestLanding({t,onSignup,onWhy,renderDefinitions,onSave}) {
 const [startSignal,setStartSignal]=useState(0);
 const root=useLandingReveal();
 const start=()=>{setStartSignal(n=>n+1);document.getElementById('guest-diagnostic')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});};
 return <div ref={root} className="guest-studio" style={guestPalette(t)} data-page-label="Guest main landing page">
  <section className="gs-hero"><div className="gs-hero-copy"><span className="guest-eyebrow"><span className="gs-status-dot"/> COMPTIA SECURITY+ · SY0-701</span><h1><span>Diagnose your weak spots.</span><span>Follow your path.</span><strong>Pass with confidence.</strong></h1><p>Security+ practice that turns your weak spots<br className="gs-desktop-break"/> into a study plan.</p><div className="gs-actions"><button className="btn btn-primary" onClick={start}>Try my 10 Q diagnostic <ArrowRight size={18}/></button><button className="gs-why" onClick={onWhy}>Why we’re different <ArrowRight size={16}/></button></div><small>10 Core questions. No account. No timer.</small><div className="gs-path" aria-label="Connected learning path"><span><Target size={18}/> Diagnose</span><i/><span><Layers3 size={18}/> Strengthen</span><i/><span><RotateCcw size={18}/> Retest</span></div></div>
  <div className="gs-diagnostic-stage"><span className="gs-stage-note">YOUR SECURITY+ STARTS HERE <Sparkles size={14}/></span><GuestDiagnostic t={t} onSignup={onSignup} onSave={onSave} renderDefinitions={renderDefinitions} startSignal={startSignal}/><span className="gs-stage-foot">Five domains. One personal starting point.</span></div></section>
  <section className="gs-loop" data-reveal><div className="gs-loop-heading"><span className="guest-eyebrow">MEET SMART REVIEW</span><h2>One miss.<br/><span>A smarter comeback.</span></h2><p>Watch your answers shape what comes next.</p></div><SmartReviewStory/></section>
 </div>;
}
export function WhyDifferent({t,onStart}) {
 const root=useLandingReveal();
 return <div ref={root} className="guest-studio gs-different" style={guestPalette(t)}><div className="gs-different-head"><span className="guest-eyebrow">WHY SECUREPLUS</span><h1>Your next question<br/><em>has a purpose.</em></h1><p>Smart Review connects what you miss with what you practise next.</p><MascotAnimation animation="tip" size={160} label="Cipher guides your learning"/></div><div className="gs-difference-grid">{steps.map(({icon:Icon,word,title,copy,color})=><article data-reveal key={word} style={{'--step-color':color}}><Icon size={30}/><span className="guest-eyebrow">{word}</span><h2>{title}</h2><p>{copy}</p></article>)}</div><div className="gs-different-story" data-reveal><SmartReviewStory/></div><div className="gs-different-cta" data-reveal><h2>See your own next step.</h2><button className="btn btn-primary" onClick={onStart}>Try the 10 Q diagnostic <ArrowRight size={18}/></button><small>No account needed to try.</small></div></div>;
}
