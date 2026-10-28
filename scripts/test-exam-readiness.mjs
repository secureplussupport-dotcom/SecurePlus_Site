import {CONCEPT_TAGS} from '../src/data/sy0701ConceptTags.js';
import test from 'node:test';import assert from 'node:assert/strict';
import{localReadinessEvidence,summarizeReadiness,READINESS_CATALOGUE}from'../src/lib/examReadiness.js';
const now=Date.parse('2026-10-28T12:00:00Z');
const catalogue=Array.from({length:5},(_,d)=>Array.from({length:20},(_,i)=>({tag:`d${d+1}.${i}`,chapter:String(d+1)}))).flat();
const metrics=(n=150)=>({distinctQuestions:n,domainsAttempted:['1','2','3','4','5'],practiceDays:3,firstAttemptAt:'2026-10-10T10:00:00Z',lastPracticeAt:'2026-10-28T10:00:00Z'});
const evidence=(score,n=150)=>({concepts:catalogue.map(c=>({...c,score})),metrics:metrics(n),total:n,correct:n,chapters:{}});
test('new account has no estimate, not baseline 50%',()=>{const r=summarizeReadiness({},catalogue,now);assert.equal(r.score,null);assert.equal(r.level,'No estimate yet');});
test('ten questions, nine correct, eight concepts produce only an early estimate near 51',()=>{
 const rows=Array.from({length:10},(_,i)=>({qid:`q${i}`,conceptTag:`d${i%5+1}.${Math.floor(i/5)}`,ch:String(i%5+1),correct:i!==9,readinessSource:'mcq-set',createdAt:'2026-10-28T10:00:00Z'}));
 rows[8].conceptTag=rows[0].conceptTag;rows[9].conceptTag=rows[1].conceptTag;
 const r=summarizeReadiness(localReadinessEvidence(rows),catalogue,now);assert.equal(r.attempted,8);assert.equal(r.confidence,'Low');assert.equal(r.level,'Early estimate');assert(Math.abs(r.score-51)<=1);assert.equal(r.accuracy,90);
});
test('repeating ten questions twenty times never gives High confidence',()=>{
 const rows=Array.from({length:200},(_,i)=>({qid:`q${i%10}`,conceptTag:`d${i%5+1}.0`,ch:String(i%5+1),correct:true,readinessSource:'exam',createdAt:new Date(now-(200-i)*86400000).toISOString()}));
 const r=summarizeReadiness(localReadinessEvidence(rows),catalogue,now);assert.equal(r.distinctQuestions,10);assert.equal(r.confidence,'Low');assert.notEqual(r.level,'Exam ready');
});
test('28% operations weakness proportionally lowers readiness and rounded breakdown reconciles',()=>{
 const e=evidence(90);e.concepts=e.concepts.map(c=>({...c,score:c.chapter==='4'?20:90}));const r=summarizeReadiness(e,catalogue,now);assert.equal(r.score,70);assert.equal(r.domains[3].mastery,20);assert(Math.abs(r.domains.reduce((s,d)=>s+d.mastery*d.weight/100,0)-r.score)<=1);
});
test('skips, lessons, cards and Daily Challenge cannot affect readiness or accuracy',()=>{
 const base={qid:'q1',conceptTag:'d1.0',ch:'1',correct:true,readinessSource:'mcq-set',createdAt:'2026-10-28'};
 const e=localReadinessEvidence([base,{...base,qid:'q2',selected:null},{...base,qid:'q3',skipped:true},{...base,qid:'q4',readinessSource:'lesson'},{...base,qid:'q5',readinessSource:'flashcard'},{...base,qid:'q6',readinessSource:'daily-challenge'}]);assert.equal(e.total,1);assert.equal(e.metrics.distinctQuestions,1);assert.equal(e.concepts[0].score,70);
});
test('all concepts at 85 score 85, but confidence still needs sample breadth and days',()=>{
 const high=summarizeReadiness(evidence(85),catalogue,now);assert.equal(high.score,85);assert.equal(high.confidence,'High');assert.equal(high.level,'Exam ready');
 const low=summarizeReadiness(evidence(85,10),catalogue,now);assert.equal(low.confidence,'Low');assert.equal(low.level,'Above 80 on early evidence — keep covering the exam');
 const e=evidence(85,100);e.metrics.practiceDays=2;assert.equal(summarizeReadiness(e,catalogue,now).confidence,'Medium');
});
test('stale labels are evaluated at last practice, never promoted just by waiting',()=>{
 const e=evidence(85);e.metrics.firstAttemptAt='2026-10-01';e.metrics.lastPracticeAt='2026-10-02';const first=summarizeReadiness(e,catalogue,Date.parse('2026-10-03'));const stale=summarizeReadiness(e,catalogue,now);assert.equal(stale.level,first.level);assert.equal(stale.confidence,first.confidence);assert.equal(stale.stale,true);assert.match(stale.staleNotice,/complete a new set/);
});
test('mastery updates retain +20/-35 clamping and all canonical concepts have one domain',()=>{
 const e=localReadinessEvidence([false,false,true].map((correct,i)=>({qid:`q${i}`,conceptTag:'d1.0',correct,ch:'1',readinessSource:'exam',createdAt:`2026-10-${10+i}`})));assert.equal(e.concepts[0].score,20);
 assert.deepEqual(READINESS_CATALOGUE.map(c=>c.tag).sort(),CONCEPT_TAGS.map(c=>c.id).sort());assert.equal(new Set(READINESS_CATALOGUE.map(c=>c.tag)).size,READINESS_CATALOGUE.length);assert(READINESS_CATALOGUE.every(c=>/^[1-5]$/.test(c.chapter)));
});
