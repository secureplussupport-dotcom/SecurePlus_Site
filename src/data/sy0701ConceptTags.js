import assignments from './mcqConceptTagAssignments.json' with { type: 'json' };
import originalVocabulary from './mcqConceptTagVocabulary.json' with { type: 'json' };
import tagGroups from './mcqConceptTagGroups.json' with { type: 'json' };
import { SY0701_ACRONYM_CARDS } from './sy0701AcronymFlashcards.js';

export const MCQ_TAGGING_VERSION = assignments.version;

// Owner-defined bank minimums, not sampling weights or verified exam frequencies.
export const MCQ_CONCEPT_TAG_GROUPS = tagGroups;
const groupByTagId = new Map(Object.entries(tagGroups).flatMap(([group, { minimumQuestions, minimumQuestionsByDifficulty, tagIds }]) =>
  tagIds.map(id => [id, { group, minimumQuestions, minimumQuestionsByDifficulty }])));

// Tag choices must remain available after an owner removes their last assignment.
const ids = [...new Set([...originalVocabulary, ...groupByTagId.keys()])].sort();

// Keep Gemini's IDs intact. A display name is only a readable rendering of
// the ID; it does not assert a new definition or a relationship to other tags.
export const CONCEPT_TAGS = Object.freeze(ids.map(id => {
  const name = id.split('.').at(-1).replace(/-/g, ' ');
  return Object.freeze({ id, tag: `#${id}`, name, acronym: name, sourceCardId: null, chapterId: null,
    group: groupByTagId.get(id)?.group ?? null,
    minimumQuestions: groupByTagId.get(id)?.minimumQuestions ?? null,
    minimumQuestionsByDifficulty: groupByTagId.get(id)?.minimumQuestionsByDifficulty ?? null });
}));

const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const aliases = new Map();
for (const tag of CONCEPT_TAGS) {
  const key = normalize(tag.name);
  if (!key) continue;
  aliases.set(key, new Set([...(aliases.get(key) || []), tag.id]));
  // A one-token tag may also be found by its published acronym expansion.
  if (key.includes(' ')) continue;
  for (const card of SY0701_ACRONYM_CARDS) {
    if (normalize(card.acronym) !== key) continue;
    const expansion = normalize(card.expansion);
    if (expansion) aliases.set(expansion, new Set([...(aliases.get(expansion) || []), tag.id]));
  }
}
const matchers = [...aliases].filter(([, matches]) => matches.size === 1).map(([term, matches]) => ({
  id: [...matches][0],
  pattern: new RegExp(`(^|[^A-Za-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}(?=$|[^A-Za-z0-9])`, 'i'),
}));

export function inferMcqConceptTagIds(questionText) {
  const text = normalize(String(questionText || '').replace(/\*\*|__|==/g, ''));
  return [...new Set(matchers.filter(({ pattern }) => pattern.test(text)).map(({ id }) => id))];
}

export function searchMcqConceptTags(query, selectedIds = [], limit = 12) {
  const term = String(query || '').trim().replace(/^#/, '').toLowerCase();
  if (!term) return [];
  const selected = new Set(selectedIds);
  return CONCEPT_TAGS.filter(tag => !selected.has(tag.id)).map(tag => {
    const labels = [tag.id, tag.name, tag.acronym].map(value => String(value || '').toLowerCase());
    const rank = labels.some(value => value.startsWith(term)) ? 0
      : labels.some(value => value.split(/[.\s-]+/).some(token => token.startsWith(term))) ? 1
      : labels.some(value => value.includes(term)) ? 2 : 3;
    return { tag, rank };
  }).filter(item => item.rank < 3)
    .sort((a, b) => a.rank - b.rank || a.tag.id.localeCompare(b.tag.id))
    .slice(0, limit).map(item => item.tag);
}
