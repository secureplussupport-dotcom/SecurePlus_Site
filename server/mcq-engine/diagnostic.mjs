import { fisherYates, EngineError } from './engine.mjs';
import { normalizeMcqDifficulty } from '../../src/lib/mcqDifficulty.js';

// Six concise Core questions per domain. Effective Question Manager revisions win.
export function diagnosticPool(bank) {
  const usedConcepts=new Set();
  return [1,2,3,4,5].flatMap(chapter => {
    const candidates=bank.filter(q=>Number(q.chapter)===chapter && q.concept_tag &&
      normalizeMcqDifficulty(q.difficulty)==='core' && !usedConcepts.has(q.concept_tag) && q.prompt.length<=240 &&
      q.options.every(o=>o.text.length<=140) && q.explanation?.trim());
    candidates.sort((a,b)=>a.prompt.length-b.prompt.length || a.id.localeCompare(b.id));
    const concepts=new Set();
    const diverse=candidates.filter(q=>{if(concepts.has(q.concept_tag))return false;concepts.add(q.concept_tag);return true;});
    if(diverse.length<6)throw new EngineError('The diagnostic is being refreshed. Please try again shortly.',503);
    const chosen=diverse.slice(0,6);
    chosen.forEach(q=>usedConcepts.add(q.concept_tag));
    return chosen;
  });
}
export function diagnosticSet(bank) {
  const pool=diagnosticPool(bank);
  return fisherYates([1,2,3,4,5].flatMap(ch=>fisherYates(pool.filter(q=>Number(q.chapter)===ch)).slice(0,2)))
    .map(q=>({...q,options:fisherYates(q.options)}));
}
export function diagnosticQuestion(q) {
  return {id:q.id,concept_tag:q.concept_tag,chapter:q.chapter,topic:q.topic,difficulty:'core',prompt:q.prompt,
    options:q.options.map(({id,text})=>({id,text})),correct:q.options.findIndex(o=>o.is_correct),explanation:q.explanation};
}
