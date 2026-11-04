import {ArrowRight} from 'lucide-react';
export function PersonalisedFlashcardGroups({sets,onOpen,recommendedDeckIds=new Set()}) {
  const recommended=set=>set.cards.some(card=>recommendedDeckIds.has(card.setId));
  return <div className="fc-personal-topics">{sets.map(set=><button className="fc-personal-topic" key={set.id} onClick={()=>onOpen(set)} aria-label={`Review ${set.title}, ${set.cards.length} cards${recommended(set)?", recommended from your diagnostic":""}`}>
    <span className="fc-personal-topic-top"><span>Domain {set.chapterId}</span><span>{set.cards.length} cards</span></span>
    {recommended(set)&&<span className="first-steps-recommended" title="Matches a concept from your diagnostic">Recommended</span>}
    <strong>{set.title}</strong>
    <span className="fc-personal-topic-action">Review set<ArrowRight size={18}/></span>
  </button>)}</div>;
}
