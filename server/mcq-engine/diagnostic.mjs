import { fisherYates } from './engine.mjs';
import { optionId } from './catalogue.mjs';
import beginnerBank from './beginner-diagnostic-bank.json' with {type:'json'};

// Preview-only content: never merged into the registered practice catalogue.
export function diagnosticPool() {
  return beginnerBank.map(q=>({...q,format:'mcq',domain:`Domain ${q.chapter}`,difficulty:'core',diagnostic_only:true,
    options:q.options.map((text,index)=>({id:optionId({id:q.id,q:q.prompt,opts:q.options,correct:q.correct},index),text,is_correct:index===q.correct}))}));
}
export function diagnosticSet() {
  const pool=diagnosticPool();
  return fisherYates([1,2,3,4,5].flatMap(ch=>fisherYates(pool.filter(q=>Number(q.chapter)===ch)).slice(0,2)))
    .map(q=>({...q,options:fisherYates(q.options)}));
}
export function diagnosticQuestion(q) {
  return {id:q.id,concept_tag:q.concept_tag,chapter:q.chapter,topic:q.topic,difficulty:'core',diagnostic_only:q.diagnostic_only===true,prompt:q.prompt,
    options:q.options.map(({id,text})=>({id,text})),correct:q.options.findIndex(o=>o.is_correct),explanation:q.explanation};
}
