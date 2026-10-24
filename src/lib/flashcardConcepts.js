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

export function personalisedFlashcardSet(state) {
  const cards = personalisedFlashcards(state);
  if (!cards.length) return null;
  return {id:'cipher-weak-area-flashcards',title:'Your personalised review',
    description:'Cards matched to your missed concepts.',
    chapterTitle:'Your concept review',topic:'Personalised review',setType:'term',color:'#30b9a4',cards};
}
