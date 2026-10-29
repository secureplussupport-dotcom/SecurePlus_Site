import { SmartReviewStory } from './SmartReviewStory.jsx';
import { useState, useSyncExternalStore } from 'react';
import { useScrollReveal } from '../lib/useScrollReveal.js';
import { ArrowRight, Target, Layers3, RotateCcw, Sparkles } from 'lucide-react';
import { GuestDiagnostic, guestPalette } from './GuestDiagnostic.jsx';
import {subscribeGuestDiagnostic, guestDiagnosticSnapshot, diagnosticComplete} from '../lib/guestDiagnosticStore.js';
import './GuestLanding.css';

export function GuestLanding({t,onSignup,onWhy,renderDefinitions,onSave}) {
 const [startSignal,setStartSignal]=useState(0);
 const root=useScrollReveal();
 const draft=useSyncExternalStore(subscribeGuestDiagnostic,guestDiagnosticSnapshot,guestDiagnosticSnapshot);
 const complete=diagnosticComplete(draft);
 const start=()=>{setStartSignal(n=>n+1);document.getElementById('guest-diagnostic')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});};
 return <div ref={root} className="guest-studio" style={guestPalette(t)} data-page-label="Guest main landing page">
  <section className="gs-hero"><div className="gs-hero-copy"><span className="guest-eyebrow"><span className="gs-status-dot"/> COMPTIA SECURITY+ · SY0-701</span><h1><span>Diagnose your weak spots.</span><span>Follow your path.</span><strong>Pass with confidence.</strong></h1><p>Answer 10 Core questions across all five domains.<br className="gs-desktop-break"/> Get topics to study from the questions you miss.</p><div className="gs-actions"><button className="btn btn-primary" onClick={start}>Try my 10 Q diagnostic <ArrowRight size={18}/></button>{!complete&&<button className="btn gs-signup-secondary" data-signup-placement="hero" onClick={()=>onSignup("hero")}>Create free account</button>}</div>{!complete&&<small className="gs-account-promise">Free · No card · Saves your diagnostic and progress</small>}<button className="gs-why" onClick={onWhy}>Why we’re different <ArrowRight size={16}/></button><div className="gs-path" aria-label="Connected learning path"><span><Target size={18}/> Diagnose</span><i/><span><Layers3 size={18}/> Strengthen</span><i/><span><RotateCcw size={18}/> Retest</span></div></div>
  <div className="gs-diagnostic-stage"><span className="gs-stage-note">TRY THE PRODUCT <Sparkles size={14}/></span><GuestDiagnostic secondaryStart t={t} onSignup={onSignup} onSave={onSave} renderDefinitions={renderDefinitions} startSignal={startSignal}/><span className="gs-stage-foot">Your result includes lesson and flashcard links.</span>{!complete&&<button className="gs-decided-link" data-signup-placement="hero" onClick={()=>onSignup("hero")}>Already decided? Create free account.</button>}</div></section>
  <section className="gs-loop" data-reveal><div className="gs-loop-heading"><span className="guest-eyebrow">MEET SMART REVIEW</span><h2>See how<br/><span>Smart Review works.</span></h2><p>Two examples of how missed concepts lead to targeted practice.</p></div><SmartReviewStory/></section>
  <section className="gs-closing" aria-labelledby="gs-closing-title"><h2 id="gs-closing-title">Ready to save your path?</h2><div className="gs-actions"><button className="btn btn-primary" data-signup-placement="closing-block" onClick={()=>onSignup("closing-block")}>Create free account</button><button className="btn gs-signup-secondary" onClick={start}>Try my 10Q diagnostic</button></div><p>Free · No card · Saves your diagnostic and progress</p></section>
 </div>;
}
