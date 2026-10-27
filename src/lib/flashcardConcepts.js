import { SY0701_ACRONYM_CARDS } from '../data/sy0701AcronymFlashcards.js';

export function flashcardFaces(card) {
  return {front:card.term || card.acronym, fullForm:card.is_acronym ? card.full_form : '',
    definition:card.definition ?? card.meaning ?? ''};
}

// A correct answer resets the server streak. Match IDs, never similarity or chapter labels.
export function personalisedFlashcards(state, cards = SY0701_ACRONYM_CARDS) {
  const tags = new Set((state?.concept_streaks || []).filter(row => row.wrong_streak >= 2).map(row => row.concept_tag));
  for(const tag of state?.diagnostic_weak_tags || [])tags.add(tag);
  return cards.filter(card => (card.concept_tags || []).some(tag => tags.has(tag)));
}

// Keep every matched card, balancing the final batch instead of dropping overflow.
export function partitionFlashcards(cards, max = 20) {
  if (!cards.length) return [];
  const count = Math.ceil(cards.length / max);
  const size = Math.floor(cards.length / count);
  let offset = 0;
  return Array.from({length:count}, (_, index) => {
    const length = size + (index < cards.length % count ? 1 : 0);
    const part = cards.slice(offset, offset + length);
    offset += length;
    return part;
  });
}

// Keep the bank's topic decks together within their official domains.
export function personalisedFlashcardGroups(cards) {
  const groups=new Map(),seen=new Set();
  for(const card of cards){
    if(seen.has(card.id))continue;
    seen.add(card.id);
    const domain=card.chapterId ?? card.domain_id ?? 'other';
    const topic=card.setTitle || card.sectionTitle || card.topic || 'Other concepts';
    const key=`${domain}:${card.setId || card.sectionId || topic}`;
    if(!groups.has(key))groups.set(key,{key,domain,topic,chapterTitle:card.chapterTitle || 'Other concepts',cards:[]});
    groups.get(key).cards.push(card);
  }
  return [...groups.values()].sort((a,b)=>String(a.domain).localeCompare(String(b.domain),undefined,{numeric:true}) || a.topic.localeCompare(b.topic)).flatMap(group=>{
    const parts=partitionFlashcards(group.cards);
    return parts.map(part=>({id:`personalised-${group.key}${parts.length>1?`:${part[0].id}`:''}`,
      title:parts.length>1?`${group.topic} · ${part[0].term || part[0].acronym}–${part.at(-1).term || part.at(-1).acronym}`:group.topic,
      description:'Cards matched to your missed concepts.',chapterId:group.domain,chapterTitle:group.chapterTitle,
      topic:group.topic,color:'#30b9a4',setType:'term',cards:part,
    }));
  });
}

export function personalisedFlashcardSet(state) {
  const cards = personalisedFlashcards(state);
  if (!cards.length) return null;
  const groups=personalisedFlashcardGroups(cards);
  return {id:'cipher-weak-area-flashcards',title:groups.length===1?groups[0].title:'Your personalised topics',
    description:'Cards matched to your missed concepts.',topicCount:groups.length,
    chapterTitle:groups.length===1?groups[0].chapterTitle:'Your concept review',topic:'Personalised review',setType:'term',color:'#30b9a4',cards};
}
