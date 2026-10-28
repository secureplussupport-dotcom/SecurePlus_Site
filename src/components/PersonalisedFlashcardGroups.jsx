import {ArrowRight} from 'lucide-react';
export function PersonalisedFlashcardGroups({sets,onOpen}) {
  return <div className="fc-personal-topics">{sets.map(set=><button className="fc-personal-topic" key={set.id} onClick={()=>onOpen(set)} aria-label={`Review ${set.title}, ${set.cards.length} cards`}>
    <span className="fc-personal-topic-top"><span>Domain {set.chapterId}</span><span>{set.cards.length} cards</span></span>
    <strong>{set.title}</strong>
    <span className="fc-personal-topic-action">Review set<ArrowRight size={18}/></span>
  </button>)}</div>;
}
