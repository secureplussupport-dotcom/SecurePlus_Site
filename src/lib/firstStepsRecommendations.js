import {conceptDeepDive} from './mcqResultSummary.js';
import {SY0701_ACRONYM_SETS} from '../data/sy0701AcronymFlashcards.js';

// Recommendations are exact diagnostic concept matches; no new mastery or inferred tags.
export function diagnosticRecommendations(tags=[],sets=SY0701_ACRONYM_SETS){
 const weak=new Set((Array.isArray(tags)?tags:[]).filter(tag=>typeof tag==='string'));
 return {lessonIds:new Set([...weak].map(tag=>conceptDeepDive(tag)?.id).filter(Boolean)),
  deckIds:new Set(sets.filter(set=>set.cards.some(card=>(card.concept_tags||[]).some(tag=>weak.has(tag)))).map(set=>set.id))};
}
