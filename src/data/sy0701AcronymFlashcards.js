import {domainName} from '../lib/navigationLabels.js';
import seedData from './sy0701_flashcard_seed.json' with { type: 'json' };

/** @type {import('./flashcardSeed').FlashcardSeed} */
const seed = seedData;

// Card IDs are permanent: moving a term to another deck never resets its progress.
const colors = {1:'#5d8ef5',2:'#df9660',3:'#30b9a4',4:'#a791e4',5:'#d9b45f'};
const titles = new Map(seed.domains.map(domain => [domain.id, domainName(domain.id)]));
const cardById = new Map(seed.cards.map(card => [card.id, card]));
export const SY0701_ACRONYM_SOURCE = Object.freeze({
  officialUrl: seed.source_url, reviewedAt: '2026-10-30', reviewNote: seed.source_note,
});
export const SY0701_ACRONYM_SETS = seed.decks.map(deck => ({
  id: deck.id, title: deck.title, code: deck.code,
  description: `${deck.section_title}. Recall the meaning, then turn the card.`,
  setType: 'term', color: colors[deck.domain_id],
  chapterId: deck.domain_id, chapterTitle: titles.get(deck.domain_id),
  sectionId: deck.section_id, sectionTitle: deck.section_title,
  topic: deck.section_title,
  // Study-section numbers are not CompTIA objective codes.
  objectiveCodes: [],
  cards: deck.card_ids.map(id => {
    const card = cardById.get(id);
    return {...card, acronym: card.term, expansion: card.full_form || card.term,
      meaning: card.definition, cardType: card.is_acronym ? 'acronym' : 'term',
      conceptTagIds: card.concept_tags, topic: deck.section_title};
  }),
}));
export const SY0701_ACRONYM_CARDS = SY0701_ACRONYM_SETS.flatMap(set =>
  set.cards.map(card => ({...card, setId:set.id, setTitle:set.title, setType:set.setType,
    chapterId:set.chapterId, chapterTitle:set.chapterTitle, sectionId:set.sectionId, objectiveCodes:[]})));
export const getSy0701AcronymSet = id => SY0701_ACRONYM_SETS.find(set => set.id === id)
  || SY0701_ACRONYM_SETS.find(set => set.id === seed.legacy_decks[id]?.[0]) || null;
export const groupSy0701AcronymSetsByChapter = () => seed.domains.map(domain => ({
  chapterId:domain.id, chapterTitle:domainName(domain.id),
  sets:SY0701_ACRONYM_SETS.filter(set => set.chapterId === domain.id),
}));
