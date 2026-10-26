import { SmartReviewStory } from './SmartReviewStory.jsx';
import { useState } from 'react';
import { useScrollReveal } from '../lib/useScrollReveal.js';
import { ArrowRight, Target, Layers3, RotateCcw, Sparkles } from 'lucide-react';
import { GuestDiagnostic, guestPalette } from './GuestDiagnostic.jsx';
import './GuestLanding.css';

export function GuestLanding({t,onSignup,onWhy,renderDefinitions,onSave}) {
 const [startSignal,setStartSignal]=useState(0);
 const root=useScrollReveal();
 const start=()=>{setStartSignal(n=>n+1);document.getElementById('guest-diagnostic')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});};
 return <div ref={root} className="guest-studio" style={guestPalette(t)} data-page-label="Guest main landing page">
  <section className="gs-hero"><div className="gs-hero-copy"><span className="guest-eyebrow"><span className="gs-status-dot"/> COMPTIA SECURITY+ · SY0-701</span><h1><span>Diagnose your weak spots.</span><span>Follow your path.</span><strong>Pass with confidence.</strong></h1><p>Security+ practice that turns your weak spots<br className="gs-desktop-break"/> into a study plan.</p><div className="gs-actions"><button className="btn btn-primary" onClick={start}>Try my 10 Q diagnostic <ArrowRight size={18}/></button><button className="gs-why" onClick={onWhy}>Why we’re different <ArrowRight size={16}/></button></div><small>10 easy questions. Skip anything new. No account.</small><div className="gs-path" aria-label="Connected learning path"><span><Target size={18}/> Diagnose</span><i/><span><Layers3 size={18}/> Strengthen</span><i/><span><RotateCcw size={18}/> Retest</span></div></div>
  <div className="gs-diagnostic-stage"><span className="gs-stage-note">YOUR SECURITY+ STARTS HERE <Sparkles size={14}/></span><GuestDiagnostic t={t} onSignup={onSignup} onSave={onSave} renderDefinitions={renderDefinitions} startSignal={startSignal}/><span className="gs-stage-foot">Five domains. One personal starting point.</span></div></section>
  <section className="gs-loop" data-reveal><div className="gs-loop-heading"><span className="guest-eyebrow">MEET SMART REVIEW</span><h2>One miss.<br/><span>A smarter comeback.</span></h2><p>Watch your answers shape what comes next.</p></div><SmartReviewStory/></section>
 </div>;
}
