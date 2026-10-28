import { useState } from 'react';
import { ArrowUpRight, RotateCcw, Sparkles } from 'lucide-react';
import { flashcardFaces } from '../lib/flashcardConcepts.js';

// A preview only: flipping it never records a review or changes learner progress.
export function FlashcardPreview({card}) {
  const [revealed,setRevealed]=useState(false);
  if(!card)return null;
  const face=flashcardFaces(card);
  return <div className="fc-preview-deck">
    <div className="fc-preview-sheet fc-preview-sheet-one" aria-hidden="true"/>
    <div className="fc-preview-sheet fc-preview-sheet-two" aria-hidden="true"/>
    <button type="button" className={`fc-preview-card ${revealed?'is-revealed':''}`}
      aria-pressed={revealed} aria-label={revealed?`${face.fullForm}. ${face.definition}. Show term.`:`${face.front}. Preview flashcard: reveal meaning.`}
      onClick={()=>setRevealed(current=>!current)}>
      <span className="fc-preview-top"><span><Sparkles size={13}/> TRY A CARD</span><ArrowUpRight size={16}/></span>
      <span className="fc-preview-content" key={String(revealed)}>
        <small>{revealed?'THE MEANING':'WHAT DOES IT STAND FOR?'}</small>
        <strong>{revealed?face.fullForm:face.front}</strong>
        {revealed?<span className="fc-preview-definition">{face.definition}</span>:<span className="fc-preview-topic">Business continuity & recovery</span>}
      </span>
      <span className="fc-preview-bottom"><span><RotateCcw size={13}/>{revealed?'Turn back':'Tap to reveal'}</span><span>JUST A PREVIEW</span></span>
    </button>
  </div>;
}
