import {readFileSync} from 'node:fs';
import {readLearningPilotBank} from '../read-learning-pilot-bank.mjs';
import {readPbqEnhancer} from '../read-authored-bank.mjs';
import {isMcqEditoriallyActive} from '../../../src/data/sy0701EditorialReview.js';
import {isPbqEditoriallyActive} from '../../../src/data/sy0701PbqReview.js';
import {isCapturedOverride,preferReviewedPbq} from '../../../src/data/sy0701PublishedSnapshot.js';

// Read the production functions themselves. A changed/missing boundary fails closed.
export function publicationPipeline(base=readLearningPilotBank()) {
  const source=readFileSync('src/App.jsx','utf8');
  const block=(start,end)=>{
    const a=source.indexOf(start),b=source.indexOf(end,a);
    if(a<0||b<0)throw new Error('Publication function boundary missing');
    return source.slice(a,b);
  };
  const code=block('function ensureMcqWrongFeedback(', 'function normalizeQuestionStem(')
    +block('function mergeRemotePBQBanks(', 'function buildSupabasePBQMutation(')
    +block('function applyQuestionOverrides(', '// ═');
  return Function('BASE_MCQ_BANK','BASE_PBQ_BANK','isMcqEditoriallyActive','isPbqEditoriallyActive','isCapturedOverride','preferReviewedPbq','enhancePBQQuestion',
    `"use strict";let MCQ_BANK,PBQ_BANK;${code};return {overrides(rows){applyQuestionOverrides(rows);return {mcqs:MCQ_BANK,pbqs:PBQ_BANK}},remote:mergeRemotePBQBanks}`
  )(base.mcqs,base.pbqs,isMcqEditoriallyActive,isPbqEditoriallyActive,isCapturedOverride,preferReviewedPbq,readPbqEnhancer());
}
