import { ArrowDown, ArrowRight, BookOpenCheck, Heart, Layers3, MessageCircle, ShieldCheck, Sparkles, Target, UsersRound } from 'lucide-react';
import { MascotAnimation } from '../lib/MascotAnimation.jsx';
import { FREE_GENERATION_LIMIT, GENERATION_WINDOW_MS } from '../lib/accessModel.js';
import { guestPalette } from './GuestDiagnostic.jsx';
import { useScrollReveal } from '../lib/useScrollReveal.js';
import './AboutUs.css';

const tools = [
  {view:'deep-dives',icon:BookOpenCheck,title:'Understand it.',name:'Concept Deep Dives',copy:'Learn the idea behind the answer, in plain English.',color:'#b58aec',action:'Explore the lessons'},
  {view:'flashcards',icon:Layers3,title:'Recall it.',name:'Flashcards',copy:'A quick reset for terms, acronyms and concepts.',color:'#d3a458',action:'Open the flashcards'},
  {view:'mcq',icon:Target,title:'Apply it.',name:'Targeted MCQs',copy:'Test your understanding. Give your next set a direction.',color:'#729bf5',action:'Go to practice'},
];

export function AboutUs({t,onStart,onExplore,feedbackHref,isGuest=true}) {
  const root=useScrollReveal();
  const explore=()=>{
    const section=root.current?.querySelector('#about-hub');
    section?.focus({preventScroll:true});
    section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  };
  return <div ref={root} className="guest-studio about-page" style={guestPalette(t)} data-page-label="Why we're different">
    <header className="about-hero">
      <div className="about-hero-copy">
        <span className="guest-eyebrow"><span className="about-small-dot"/> WHY WE’RE DIFFERENT</span>
        <h1>What happens after<br/><em>a wrong answer?</em></h1>
        <p>A missed concept leads to a lesson, matching flashcards and targeted questions. Here’s a result from an actual diagnostic run.</p>
        <button className="btn btn-primary about-primary" onClick={onStart}>{isGuest?'Try the diagnostic':'Open my practice hub'}<ArrowRight size={18}/></button>
        <span className="about-hero-note">{isGuest?'Start with 10 Core questions. No account needed.':'Build on what you know. Focus on what needs work.'}</span>
        <div className="about-hero-signature"><ShieldCheck size={17}/> Built for CompTIA Security+ · SY0-701</div>
        <button type="button" className="about-scroll-cue" onClick={explore} aria-label="Explore how Deep Dives, flashcards and MCQs connect">
          <span className="about-scroll-tools" aria-hidden="true"><BookOpenCheck size={19}/><i/><Layers3 size={19}/><i/><Target size={19}/></span>
          <span>See how it connects</span><span className="about-scroll-arrow" aria-hidden="true"><ArrowDown size={19}/></span>
        </button>
      </div>
      <figure className="about-product-proof"><a href="/images/product/diagnostic-result.webp" target="_blank" rel="noreferrer" aria-label="Open the full diagnostic result screenshot"><img src="/images/product/diagnostic-result.webp" width="676" height="769" alt="Actual SecurePlus diagnostic result: reducing risk is highlighted, with Flashcards, Concept Deep Dive and Build my free study plan actions." fetchPriority="high"/></a><figcaption>Actual product screenshot · sample guest run · no personal data</figcaption></figure>
    </header>

    <section id="about-hub" className="about-hub" tabIndex={-1} data-reveal aria-labelledby="about-hub-title">
      <div className="about-section-heading"><span className="guest-eyebrow">ONE CONNECTED STUDY HUB</span><h2 id="about-hub-title">Understand. Recall. Apply.</h2><p>Three resources, linked by the same concept tags.</p></div>
      <div className="about-tools">{tools.map(({view,icon:Icon,title,name,copy,color,action},i)=><article key={view} style={{'--tool-color':color}}><div className="about-tool-art" aria-hidden="true"><span>0{i+1}</span><Icon size={49} strokeWidth={1.3}/><i/><i/></div><div className="about-tool-content"><span>{name}</span><h3>{title}</h3><p>{copy}</p><button onClick={()=>onExplore(view)}>{action}<ArrowRight size={17}/></button></div></article>)}</div>
    </section>

    <section className="about-personal" data-reveal aria-labelledby="about-personal-title">
      <div className="about-section-heading"><span className="guest-eyebrow">THE REVIEW RULES</span><h2 id="about-personal-title">What changes in your next set.</h2><p>Specific rules you can see working as you practise.</p></div>
      <div className="about-personal-points"><div><span>DIFFICULTY</span><h3>Two consecutive misses.</h3><p>Next time that concept is tested, you get a Core question if one is available.</p></div><div><span>RETEST TIMING</span><h3>30 other MCQ answers.</h3><p>That’s the cooldown before the original missed question becomes eligible to return.</p></div><div><span>MISSED QUEUE</span><h3>A correct answer clears it.</h3><p>Answer the original question correctly to remove it from your missed queue.</p></div></div>
    </section>

    <section className="about-access" data-reveal aria-labelledby="about-access-title">
      <div className="about-access-intro"><span className="guest-eyebrow"><Heart size={15}/> A USEFUL FREE WAY FORWARD</span><h2 id="about-access-title">Good learning<br/>should open doors.</h2><p>Your core study tools don’t require a paid plan. Create a free account for guided lessons, Smart Review and saved progress. Build a routine one concept at a time.</p><small>Optional paid passes add practice capacity and extra controls. Free-account generation limits apply.</small></div>
      <div className="about-free-grid"><div><strong>10<span>Q</span></strong><h3>Your starting point</h3><p>Guest diagnostic. No account required.</p></div><div><strong>{FREE_GENERATION_LIMIT}<span> / {GENERATION_WINDOW_MS/3600000}h</span></strong><h3>Free-account practice</h3><p>MCQs with Smart Review and saved progress.</p></div><div><Layers3 size={27}/><h3>Every curated deck</h3><p>Flashcards available without a paid plan.</p></div><div><BookOpenCheck size={27}/><h3>The guided lesson path</h3><p>Free account for full access. Guests can preview.</p></div></div>
    </section>

    <section className="about-people" data-reveal aria-labelledby="about-people-title">
      <div className="about-people-art" aria-hidden="true"><span><UsersRound size={43} strokeWidth={1.4}/></span><i><Heart size={20}/></i><i><Sparkles size={21}/></i><MascotAnimation animation="wave" size={96}/></div>
      <div><span className="guest-eyebrow">THE PEOPLE BEHIND SECUREPLUS</span><h2 id="about-people-title">Edtech for more of us.</h2><p>We’re a team of individuals who believe in democratising education technology. Our aim is simple: make clear, connected Security+ preparation accessible to more people.</p><p>SecurePlus is still growing. Your experience helps us decide what to improve next.</p></div>
    </section>

    <section className="about-feedback" data-reveal aria-labelledby="about-feedback-title"><div><span className="guest-eyebrow"><MessageCircle size={16}/> BUILT WITH YOUR FEEDBACK</span><h2 id="about-feedback-title">Help shape the next step.</h2><p>An unclear explanation? A missing topic? Something that could work better? We’re listening.</p></div><a className="about-feedback-link" href={feedbackHref}>Share your feedback<ArrowRight size={19}/></a></section>
    <footer className="about-final"><span>See your own result in 10 questions.</span><button className="btn btn-primary about-primary" onClick={onStart}>{isGuest?'Try the 10 Q diagnostic':'Start my next set'}<ArrowRight size={18}/></button></footer>
  </div>;
}
