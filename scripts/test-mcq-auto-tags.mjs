import assert from 'node:assert/strict';
import { inferMcqConceptTagIds } from '../src/data/sy0701ConceptWeb.js';

assert.deepEqual(inferMcqConceptTagIds('What is the Recovery Time Objective (RTO)?'), ['recovery.rto']);
assert.deepEqual(inferMcqConceptTagIds('What does **recovery time objective** mean?'), ['recovery.rto']);
assert.deepEqual(inferMcqConceptTagIds('What is an RTO?'), ['recovery.rto']);
assert.deepEqual(inferMcqConceptTagIds('What is a retrospective?'), []);
assert.deepEqual(inferMcqConceptTagIds('What is MAC?'), []);
assert.deepEqual(inferMcqConceptTagIds('What is mandatory access control?'), ['acronym.mac-access-control']);

console.log('MCQ auto-tag term matching passed.');
