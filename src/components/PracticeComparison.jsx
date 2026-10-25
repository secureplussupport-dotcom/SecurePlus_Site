import { useState } from 'react';
import { ArrowDown, ArrowRight, BookOpenCheck, Check, Cloud, Fingerprint, KeyRound, Layers3, Network, RotateCcw, ShieldCheck, Shuffle, Smartphone, Target } from 'lucide-react';
import './PracticeComparison.css';

const steps=[{label:'Learn',Icon:BookOpenCheck},{label:'Recall',Icon:Layers3},{label:'Try again',Icon:Target}];
const randomTopics=[{label:'Network ports',Icon:Network},{label:'Encryption',Icon:KeyRound},{label:'Cloud security',Icon:Cloud}];

export function PracticeComparison() {
  const [guided,setGuided]=useState(true),[step,setStep]=useState(0),[flipped,setFlipped]=useState(false),[answer,setAnswer]=useState(null),[randomIndex,setRandomIndex]=useState(0);
  const random=randomTopics[randomIndex];
  return <section className="practice-demo" aria-label="Try a missed-question example">
    <header><Fingerprint size={21}/><span>You missed a question about <strong>MFA.</strong></span></header>
    <div className="practice-demo-modes" role="group" aria-label="Compare what happens next">
      <button type="button" aria-pressed={!guided} onClick={()=>setGuided(false)}><Shuffle size={16}/>Random practice</button>
      <button type="button" aria-pressed={guided} onClick={()=>setGuided(true)}><ShieldCheck size={16}/>SecurePlus</button>
    </div>
    <div className="practice-demo-flow" key={String(guided)}>
      <div className="practice-demo-origin"><span>MFA</span><span>Needs another look</span><ArrowDown size={18}/></div>
      {guided?<>
        <div className="practice-demo-steps" role="group" aria-label="Explore your MFA study tools">{steps.map(({label,Icon},i)=><button type="button" key={label} aria-pressed={step===i} onClick={()=>setStep(i)}><Icon size={20}/><span>{label}</span></button>)}</div>
        <div className="practice-demo-stage" key={step}>
          {step===0?<div className="practice-demo-lesson"><span className="practice-demo-kicker">A QUICK LESSON · MFA</span><div className="practice-demo-factors"><span><KeyRound size={32}/><strong>Password</strong><small>You know it</small></span><b>+</b><span><Smartphone size={32}/><strong>Phone code</strong><small>You have it</small></span></div><p><Check size={17}/>Two different factors. One safer sign-in.</p></div>
            :step===1?<button type="button" className="practice-demo-flashcard" aria-label="Flip MFA flashcard" onClick={()=>setFlipped(!flipped)}><Layers3 size={24}/><span className="practice-demo-kicker">YOUR MFA FLASHCARD</span><strong key={String(flipped)}>{flipped?'Multi-factor authentication':'MFA'}</strong><span className="practice-demo-flip"><RotateCcw size={14}/>{flipped?'Tap to see the term':'Tap to reveal'}</span></button>
            :<div className="practice-demo-question"><span className="practice-demo-kicker">YOUR NEXT PRACTICE · MFA</span><h3>Which pair uses different factors?</h3><div>{['Password + PIN','Password + phone code'].map((text,i)=><button type="button" key={text} aria-pressed={answer===i} className={answer===i?(i===1?'is-correct':'is-retry'):''} onClick={()=>setAnswer(i)}><span>{String.fromCharCode(65+i)}</span>{text}{answer===i&&i===1&&<Check size={17}/>}</button>)}</div><p role="status">{answer===null?'Try an answer.':answer===1?'Exactly. Something you know + something you have.':'Both are things you know. Try the other pair.'}</p></div>}
        </div>
        <div className="practice-demo-outcome"><Target size={17}/><span>{step===2?'Practise the concept you missed.':'Same concept. A different way to learn.'}</span>{step<2&&<button type="button" onClick={()=>setStep(step+1)} aria-label={`Next: ${steps[step+1].label}`}><ArrowRight size={18}/></button>}</div>
      </>:<>
        <div className="practice-demo-random" key={randomIndex}><span className="practice-demo-kicker">ANOTHER RANDOM QUESTION</span><div className="practice-demo-random-art" aria-hidden="true"><span><Fingerprint size={26}/></span><Shuffle size={24}/><span><random.Icon size={35}/></span></div><strong>{random.label}</strong><span className="practice-demo-open-gap">MFA still needs work</span></div>
        <button type="button" className="practice-demo-shuffle" onClick={()=>setRandomIndex((randomIndex+1)%randomTopics.length)}><Shuffle size={16}/>Try another random pick<ArrowRight size={16}/></button>
      </>}
    </div>
    <footer>Interactive example · doesn’t affect your progress</footer>
  </section>;
}
