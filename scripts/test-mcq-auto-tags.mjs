import assert from 'node:assert/strict';
import { inferMcqConceptTagIds } from '../src/data/sy0701ConceptTags.js';

assert(inferMcqConceptTagIds('What is MFA?').includes('iam.mfa'));
assert(inferMcqConceptTagIds('What is multi-factor authentication?').includes('iam.mfa'));
assert(!inferMcqConceptTagIds('What is a retrospective?').includes('risk.bia-rto-rpo'));
assert(!inferMcqConceptTagIds('What is MAC?').some(id => id.includes('mac')));

console.log('MCQ exact-term auto-tag matching passed.');
