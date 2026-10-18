import assert from 'node:assert/strict';
import test from 'node:test';
import { SY0701_ACRONYM_CARDS } from '../src/data/sy0701AcronymFlashcards.js';
import { CONCEPT_TAGS, CONCEPT_WEB_EDGES, relatedConceptTagIds } from '../src/data/sy0701ConceptWeb.js';

test('every acronym card has one distinct concept tag', () => {
  const cards = SY0701_ACRONYM_CARDS.filter(card => card.setType === 'acronym');
  assert.equal(CONCEPT_TAGS.filter(tag => tag.sourceCardId).length, cards.length);
  assert.equal(new Set(CONCEPT_TAGS.map(tag => tag.id)).size, CONCEPT_TAGS.length);
  assert.equal(new Set(CONCEPT_TAGS.map(tag => tag.tag.toLowerCase())).size, CONCEPT_TAGS.length);
  for (const card of cards) assert.equal(CONCEPT_TAGS.filter(tag => tag.sourceCardId === card.id).length, 1);
  for (const acronym of ['MAC', 'RBAC', 'SOC']) {
    assert.equal(CONCEPT_TAGS.filter(tag => tag.acronym.toLowerCase() === acronym.toLowerCase()).length, 2);
  }
});

test('the web has explicit, valid, symmetric neighbors', () => {
  const ids = new Set(CONCEPT_TAGS.map(tag => tag.id));
  const edges = new Set();
  for (const { left, right } of CONCEPT_WEB_EDGES) {
    assert(ids.has(left) && ids.has(right) && left !== right);
    const key = [left, right].sort().join(':');
    assert(!edges.has(key), `Duplicate edge ${key}`);
    edges.add(key);
    assert(relatedConceptTagIds(left).includes(right));
    assert(relatedConceptTagIds(right).includes(left));
  }
  assert(relatedConceptTagIds('recovery.rto').includes('recovery.rpo'));
  assert(!relatedConceptTagIds('acronym.soc-chip').includes('acronym.soc-operations'));
});
