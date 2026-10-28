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

// Two focused recommendations; use neighbouring cards only within the same domain.
export function recommendedFlashcardSets(state, cards = SY0701_ACRONYM_CARDS) {
  const weights=new Map((state?.concept_streaks || []).filter(row=>row.wrong_streak>=2).map(row=>[row.concept_tag,row.wrong_streak]));
  for(const tag of state?.diagnostic_weak_tags || [])if(!weights.has(tag))weights.set(tag,1);
  const relevance=card=>Math.max(0,...(card.concept_tags || []).map(tag=>weights.get(tag)||0));
  const groups=personalisedFlashcardGroups(personalisedFlashcards(state,cards))
    .sort((a,b)=>Math.max(...b.cards.map(relevance))-Math.max(...a.cards.map(relevance)) || b.cards.length-a.cards.length || a.title.localeCompare(b.title)).slice(0,2);
  const used=new Set();
  return groups.map(group=>{
    const lead=group.cards[0];
    const reserved=new Set(groups.filter(other=>other!==group).flatMap(other=>other.cards.map(card=>card.id)));
    const candidates=cards.filter(card=>card.chapterId===lead.chapterId&&!used.has(card.id)&&!reserved.has(card.id))
      .sort((a,b)=>relevance(b)-relevance(a) || Number(b.setId===lead.setId)-Number(a.setId===lead.setId) || Number(b.sectionId===lead.sectionId)-Number(a.sectionId===lead.sectionId));
    const selected=candidates.slice(0,15);
    selected.forEach(card=>used.add(card.id));
    return {...group,description:'A focused review built around your missed concepts.',cards:selected};
  }).filter(group=>group.cards.length);
}

export function personalisedFlashcardSet(state) {
  const groups=recommendedFlashcardSets(state);
  if (!groups.length) return null;
  return {id:'cipher-weak-area-flashcards',title:groups.length===1?groups[0].title:'Your personalised topics',
    description:'Focused reviews built around your missed concepts.',topicCount:groups.length,
    chapterTitle:groups.length===1?groups[0].chapterTitle:'Your concept review',topic:'Personalised review',setType:'term',color:'#30b9a4',cards:groups.flatMap(group=>group.cards)};
}
