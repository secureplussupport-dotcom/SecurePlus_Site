import {useEffect,useRef} from 'react';
import {ArrowRight,BookOpen,Brain,Check,Flame,Layers3,Sparkles,X} from 'lucide-react';
import './FirstStepsJourney.css';
const details={
 'mcq-set':{title:'Try Smart Review',copy:'Complete one MCQ set.',cta:'Start a set',Icon:Brain},
 lesson:{title:'Follow your curiosity',copy:'Finish any Concept Deep Dive.',cta:'Choose a lesson',Icon:BookOpen},
 deck:{title:'Build your recall',copy:'Review every card in one deck.',cta:'Choose flashcards',Icon:Layers3},
};
export function FirstStepsJourney({journey,onNavigate,mascot}){
 if(!journey.active)return null;
 if(journey.status==='loading')return <div className="first-steps-pending" role="status" aria-label="Loading your first steps">{mascot}</div>;
 return <section className="first-steps-journey" aria-labelledby="first-steps-title">
  <header><div><span className="first-steps-kicker"><Sparkles size={16}/> YOUR FIRST 3 STEPS</span><h2 id="first-steps-title">Three small wins.<br/><em>A strong start.</em></h2></div><div className="first-steps-mascot" aria-hidden="true">{mascot}<strong>{journey.steps.doneCount}<span> / 3</span></strong></div></header>
  <div className="first-steps-track" role="progressbar" aria-label="First steps completed" aria-valuemin={0} aria-valuemax={3} aria-valuenow={journey.steps.doneCount}>{journey.steps.steps.map(step=><i key={step.id} data-done={step.done}/>)}</div>
  <div className="first-steps-cards">{journey.steps.steps.map((step,index)=>{const {title,copy,cta,Icon}=details[step.id];return <article key={step.id} className={step.done?'is-done':''}>
   <span className="first-steps-icon">{step.done?<Check size={25}/>:<Icon size={25}/>}</span><span className="first-steps-number">0{index+1}</span><h3>{title}</h3><p>{copy}</p><button type="button" onClick={()=>onNavigate(step.action)} disabled={step.done}>{step.done?'Complete':cta}{step.done?<Check size={17}/>:<ArrowRight size={17}/>}</button>
  </article>;})}</div>
  <footer><Flame size={20}/><span>Three wins. One day toward your streak.</span></footer>
  {(journey.recommendations.lessonIds.size>0||journey.recommendations.deckIds.size>0)&&<p className="first-steps-hint">Pick any lesson or deck. <span className="first-steps-recommended">Recommended</span> matches your diagnostic.</p>}
  {journey.error&&<p role="status" className="first-steps-sync">Your steps are saved on this device. <button onClick={journey.retry}>Retry account sync</button></p>}
  {journey.steps.allDone&&<p role="status" className="first-steps-sync">Saving your three wins…</p>}
 </section>;
}
export function FirstStepsCelebration({journey,mascot,onContinue}){
 const dialog=useRef(null);
 useEffect(()=>{const opener=document.activeElement;dialog.current?.showModal();return()=>{dialog.current?.close();if(opener?.isConnected)opener.focus();};},[]);
 return <dialog ref={dialog} className="first-steps-celebration" aria-labelledby="first-steps-celebration-title" onCancel={event=>{event.preventDefault();journey.acknowledge();}}>
  <button className="first-steps-close" aria-label="Close celebration" onClick={journey.acknowledge}><X size={22}/></button>
  <div className="first-steps-confetti" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{'--piece':i}}/>)}</div>
  <div className="first-steps-celebration-mascot" aria-hidden="true">{mascot}</div><span className="first-steps-kicker">THREE WINS. ONE NEW HABIT.</span><h2 id="first-steps-celebration-title">Look at you go!</h2><p>You’ve explored your toolkit.<br/>Now let’s build on it.</p>
  <div className="first-steps-reward"><Flame size={35}/><div><strong>Today counts.</strong><span>Your streak has a new spark.</span></div><Check size={24}/></div>
  <button className="btn btn-primary" onClick={()=>{journey.acknowledge();onContinue?.();}}>Keep the momentum <ArrowRight size={19}/></button>
 </dialog>;
}
