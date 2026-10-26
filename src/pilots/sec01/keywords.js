import { SY0701_ACRONYM_CARDS } from '../../data/sy0701AcronymFlashcards.js';
import lesson from './lesson.json' with {type:'json'};

export const lessonKeywords = lesson.mapped_tags.map(tag => {
  const card = SY0701_ACRONYM_CARDS.find(item=>item.conceptTagIds.includes(tag));
  if (!card) throw new Error(`Missing lesson flashcard: ${tag}`);
  return card;
});
