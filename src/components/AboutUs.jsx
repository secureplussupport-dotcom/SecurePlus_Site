import { ArrowDown, ArrowRight, BookOpenCheck, Heart, Layers3, MessageCircle, ShieldCheck, Sparkles, Target, UsersRound } from 'lucide-react';
import { PracticeComparison } from './PracticeComparison.jsx';
import { SmartReviewStory } from './SmartReviewStory.jsx';
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
        <h1>Your effort.<br/><em>A clearer direction.</em></h1>
        <p>A clear path from your first question to stronger concepts. Learn, recall and practise—all in one place.</p>
        <button className="btn btn-primary about-primary" onClick={onStart}>{isGuest?'Find my starting point':'Open my practice hub'}<ArrowRight size={18}/></button>
        <span className="about-hero-note">{isGuest?'Start with 10 Core questions. No account needed.':'Build on what you know. Focus on what needs work.'}</span>
        <div className="about-hero-signature"><ShieldCheck size={17}/> Built for CompTIA Security+ · SY0-701</div>
        <button type="button" className="about-scroll-cue" onClick={explore} aria-label="Explore how Deep Dives, flashcards and MCQs connect">
          <span className="about-scroll-tools" aria-hidden="true"><BookOpenCheck size={19}/><i/><Layers3 size={19}/><i/><Target size={19}/></span>
          <span>See how it connects</span><span className="about-scroll-arrow" aria-hidden="true"><ArrowDown size={19}/></span>
        </button>
      </div>
      <PracticeComparison/>
    </header>

    <section id="about-hub" className="about-hub" tabIndex={-1} data-reveal aria-labelledby="about-hub-title">
      <div className="about-section-heading"><span className="guest-eyebrow">ONE CONNECTED STUDY HUB</span><h2 id="about-hub-title">Understand. Recall. Apply.</h2><p>Your resources belong together. Your study time should, too.</p></div>
      <div className="about-tools">{tools.map(({view,icon:Icon,title,name,copy,color,action},i)=><article key={view} style={{'--tool-color':color}}><div className="about-tool-art" aria-hidden="true"><span>0{i+1}</span><Icon size={49} strokeWidth={1.3}/><i/><i/></div><div className="about-tool-content"><span>{name}</span><h3>{title}</h3><p>{copy}</p><button onClick={()=>onExplore(view)}>{action}<ArrowRight size={17}/></button></div></article>)}</div>
    </section>

    <section className="about-personal" data-reveal aria-labelledby="about-personal-title">
      <div className="about-section-heading"><span className="guest-eyebrow">PERSONAL TO YOUR PROGRESS</span><h2 id="about-personal-title">Your answers shape your path.</h2><p>A realistic workplan starts with what you need, rather than another random test.</p></div>
      <div className="about-personal-points"><div><span>01</span><h3>Find your focus.</h3><p>The diagnostic gives you a starting point. Concept mastery tracks where your understanding needs attention.</p></div><div><span>02</span><h3>Practise with purpose.</h3><p>Smart Review targets weak concepts, brings missed questions back when due, and mixes in new ground.</p></div><div><span>03</span><h3>Keep it connected.</h3><p>Lessons explain. Flashcards reinforce. Further practice helps you check whether the concept is sticking.</p></div></div>
      <details className="about-adapts"><summary>How does my practice adapt?<ArrowRight size={18}/></summary><dl>
        <div><dt>A concept needs attention.</dt><dd>Smart Review uses your concept mastery to target further practice, alongside new topics.</dd></div>
        <div><dt>The same concept trips you up twice.</dt><dd>The next time that topic is tested, Smart Review selects a Core question if one is available.</dd></div>
        <div><dt>A missed question comes back.</dt><dd>The original becomes eligible after 30 other MCQ answers. Answer it correctly to clear it from your missed queue.</dd></div>
      </dl></details>
      <SmartReviewStory/>
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
    <footer className="about-final"><span>One concept. A little more confidence.</span><button className="btn btn-primary about-primary" onClick={onStart}>{isGuest?'Try the 10 Q diagnostic':'Start my next set'}<ArrowRight size={18}/></button></footer>
  </div>;
}
