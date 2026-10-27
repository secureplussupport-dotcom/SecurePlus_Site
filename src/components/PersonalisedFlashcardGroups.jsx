import {ArrowRight, Layers3} from 'lucide-react';
export function PersonalisedFlashcardGroups({sets,onOpen}) {
  const domains=[...new Set(sets.map(set=>set.chapterId))];
  return <div className="fc-personal-topics">{domains.map(domain=>{
    const topics=sets.filter(set=>set.chapterId===domain);
    return <section className="fc-personal-domain" key={domain} aria-label={topics[0].chapterTitle}>
      <h3><span>{domain==='other'?'CONCEPTS':`DOMAIN ${domain}`}</span>{topics[0].chapterTitle}</h3>
      <div className="fc-personal-topic-grid">{topics.map(set=><button className="fc-personal-topic" key={set.id} onClick={()=>onOpen(set)} aria-label={`Review ${set.title}, ${set.cards.length} ${set.cards.length===1?'card':'cards'}`}>
        <span className="fc-personal-topic-top"><Layers3 size={17}/><span>{set.cards.length} {set.cards.length===1?'card':'cards'}</span></span>
        <strong>{set.title}</strong><span className="fc-personal-term-preview">{set.cards.slice(0,3).map(card=>card.term||card.acronym).join(' · ')}</span>
        <span className="fc-personal-topic-action">Review topic<ArrowRight size={17}/></span>
      </button>)}</div>
    </section>;
  })}</div>;
}
