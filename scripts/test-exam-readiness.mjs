import test from 'node:test';
import assert from 'node:assert/strict';
import {localReadinessEvidence,summarizeReadiness} from '../src/lib/examReadiness.js';
const event=(conceptTag,correct,extra={})=>({conceptTag,correct,ch:'1',readinessSource:'mcq-set',...extra});
test('readiness averages concepts equally, excludes unattempted concepts and uses exact 80 threshold',()=>{
  const profile=summarizeReadiness({concepts:[{tag:'a',score:100,chapter:'1'},{tag:'b',score:60,chapter:'2'}]});
  assert.equal(profile.score,80);assert.equal(profile.level,'Exam ready');assert.equal(profile.attempted,2);assert.equal(profile.mastered,1);
  assert.equal(summarizeReadiness({concepts:[{tag:'a',score:100},{tag:'b',score:59}]}).score,79.5);
  assert.equal(summarizeReadiness({concepts:[{tag:'a',score:100},{tag:'b',score:59}]}).level,'Growing confidence');
  assert.equal(summarizeReadiness().score,null);assert.equal(summarizeReadiness().level,'Just starting');
});
test('only MCQ-set and Exam evidence updates mastery and chapter accuracy',()=>{
  const rows=[event('a',true),event('a',true),event('b',false,{ch:'2',readinessSource:'exam'}),
    event('a',false,{readinessSource:'daily-challenge'}),event('b',true,{readinessSource:'diagnostic'}),
    event('a',false,{pbq:true}),event('c',true,{readinessSource:undefined}),event('d',false,{readinessSource:'exam',selected:null}),event('',true)];
  const evidence=localReadinessEvidence(rows);const profile=summarizeReadiness(evidence);
  assert.equal(evidence.total,3);assert.equal(profile.mean,52.5);assert.equal(profile.score,52.5);
  assert.deepEqual(evidence.chapters,{'1':{total:2,correct:2},'2':{total:1,correct:0}});
  assert.deepEqual(profile.byChapter,{'2':1});assert.equal(profile.mastered,1);
});
test('chronological replay clamps scores, correct answers reset losses, unknown chapter is explicit',()=>{
  const rows=[event('a',true,{createdAt:'2026-01-03'}),event('a',false,{createdAt:'2026-01-01'}),event('a',false,{createdAt:'2026-01-02'}),event('b',false,{ch:null})];
  const profile=summarizeReadiness(localReadinessEvidence(rows));
  assert.equal(profile.mean,17.5);assert.deepEqual(profile.byChapter,{'1':1,unknown:1});
  assert.equal(summarizeReadiness(localReadinessEvidence(Array.from({length:20},()=>event('a',true)))).score,100);
});
