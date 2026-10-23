import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMcqExam, examConceptTag, examTiming, formatExamTime } from '../src/lib/mcqExam.js';
const tags=['iam.mfa','iam.rbac','iam.pam','att.app-xss','ops.siem','att.phishing','data.dlp','risk.treatment','arch.vpn','vul.zero-day','cry.hmac','att.quishing','arch.air-gap','ops.fim','gov.soc2'];
const bank=tags.flatMap((tag,i)=>Array.from({length:12},(_,j)=>({id:`m${i}_${j}`,q:tag,opts:['a','b'],correct:0,conceptTagIds:[tag]})));
function seeded(seed=17){return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
test('free accepts remainder batches through 30; Pro accepts integer counts through 90',()=>{
  for(const count of [1,9,10,15,20,30])assert.equal(buildMcqExam(bank,count,false,seeded()).length,count);
  for(const count of [11,37,50,90])assert.equal(buildMcqExam(bank,count,true,seeded()).length,count);
  for(const count of [0,31,50,20.5])assert.throws(()=>buildMcqExam(bank,count,false));
  for(const count of [0,91,NaN,10.5])assert.throws(()=>buildMcqExam(bank,count,true));
});
test('selection is unique, MCQ-only, source-bound and capped per concept',()=>{
  const excluded=[{...bank[0],id:'p001'},{...bank[0],id:'mbeyond',beyondTextbook:true},{...bank[0],id:'mpbq',pbq:true}];
  for(const count of [10,20,30,50]){
    const exam=buildMcqExam([...bank,...excluded,bank[0]],count,true,seeded(count));
    assert.equal(new Set(exam.map(q=>q.id)).size,count);
    const counts={};for(const q of exam){assert.ok(bank.includes(q));counts[examConceptTag(q)]=(counts[examConceptTag(q)]||0)+1;}
    assert.ok(Object.values(counts).every(n=>n<=Math.ceil(count/10)));
  }
});
test('insufficient concept diversity fails rather than silently flooding one concept',()=>{
  assert.throws(()=>buildMcqExam(bank.slice(0,8),10),/distinct concepts/);
});
test('random group sampling prefers Heavyweight over Standard over Niche',()=>{
  const rng=seeded();const counts=[0,0,0];
  for(let n=0;n<1000;n++)for(const q of buildMcqExam(bank,10,false,rng))counts[Math.floor(tags.indexOf(examConceptTag(q))/5)]++;
  assert.ok(counts[0]>counts[1]&&counts[1]>counts[2],counts.join(','));
});
test('timer uses wall time, freezes on submission, and flags overtime strictly above budget',()=>{
  assert.deepEqual(examTiming(1000,null,10,601000),{elapsed:600,permitted:600,remaining:0,overtime:false});
  assert.equal(examTiming(1000,null,10,602000).overtime,true);
  assert.equal(examTiming(1000,11000,20,999999).elapsed,10);
  assert.equal(examTiming(1000,null,50,0).elapsed,0);
  assert.equal(formatExamTime(3601),'1:00:01');assert.equal(formatExamTime(72),'01:12');
});

test('the effective question bank can supply every exam size without repeating a primary concept past its cap',async()=>{
  const {effectiveCatalogue}=await import('../server/mcq-engine/catalogue.mjs');
  const actual=effectiveCatalogue().map(q=>({id:q.id,opts:q.options,conceptTagIds:[q.concept_tag]}));
  for(const count of [10,20,30,50]){
    const exam=buildMcqExam(actual,count,true,seeded(count));
    assert.equal(exam.length,count);
    const frequencies={};for(const q of exam)frequencies[examConceptTag(q)]=(frequencies[examConceptTag(q)]||0)+1;
    assert.ok(Object.values(frequencies).every(value=>value<=Math.ceil(count/10)));
  }
});

test('each sufficiently stocked exam retains Heavyweight > Standard > Niche, with random questions inside each tier',()=>{
  for(const count of [10,11,20,30,37,50,90]){
    const exam=buildMcqExam(bank,count,true,seeded(count));
    const counts=[0,0,0];for(const q of exam)counts[Math.floor(tags.indexOf(examConceptTag(q))/5)]++;
    assert.deepEqual(counts,[Math.round(count/2),Math.round(count/3),count-Math.round(count/2)-Math.round(count/3)]);
  }
  assert.notDeepEqual(buildMcqExam(bank,20,true,seeded(1)).map(q=>q.id),buildMcqExam(bank,20,true,seeded(2)).map(q=>q.id));
});
