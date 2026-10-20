import assert from 'node:assert/strict';
import test from 'node:test';
import { CONCEPT_TAGS, MCQ_TAGGING_VERSION, searchMcqConceptTags } from '../src/data/sy0701ConceptTags.js';
import assignments from '../src/data/mcqConceptTagAssignments.json' with { type: 'json' };
import groups from '../src/data/mcqConceptTagGroups.json' with { type: 'json' };
import originalVocabulary from '../src/data/mcqConceptTagVocabulary.json' with { type: 'json' };

test('tag catalogue keeps the supplied MCQ vocabulary and all owner benchmark tags', () => {
  const assigned = new Set(assignments.assignments.flatMap(row => [row.primaryTagId, ...row.secondaryTagIds, ...row.distractorTagIds]));
  const expected = new Set([...originalVocabulary, ...Object.values(groups).flatMap(group => group.tagIds)]);
  assert.equal(MCQ_TAGGING_VERSION, 'gemini-mcq-tags-2026-10-20');
  assert.equal(originalVocabulary.length, assignments.tagCount);
  assert(assigned.size <= originalVocabulary.length);
  assert([...assigned].every(id => expected.has(id)));
  assert.equal(expected.size, 179);
  assert.equal(CONCEPT_TAGS.length, expected.size);
  assert.deepEqual(new Set(CONCEPT_TAGS.map(tag => tag.id)), expected);
  assert.equal(new Set(CONCEPT_TAGS.map(tag => tag.tag)).size, CONCEPT_TAGS.length);
  assert(CONCEPT_TAGS.every(tag => tag.tag === `#${tag.id}`));
});

test('Question Manager finds tag prefixes first and internal acronym tokens', () => {
  assert(searchMcqConceptTags('a').every(tag => tag.id.startsWith('a') || tag.name.startsWith('a')));
  assert(searchMcqConceptTags('rto').some(tag => tag.id === 'risk.bia-rto-rpo'));
  assert(!searchMcqConceptTags('rto', ['risk.bia-rto-rpo']).some(tag => tag.id === 'risk.bia-rto-rpo'));
});
