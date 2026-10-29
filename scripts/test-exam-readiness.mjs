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

function assertBreakdownCounts(profile) {
 const sum=key=>profile.domains.reduce((total,domain)=>total+domain[key],0);
 assert.equal(profile.totalConcepts,sum('total'));
 assert.equal(profile.totalConcepts,profile.mastered+profile.unmastered);
 assert.equal(profile.mastered,sum('mastered'));
 assert.equal(profile.unmastered,sum('unmastered'));
 assert.equal(profile.unmastered,Object.values(profile.byChapter).reduce((a,b)=>a+b,0));
 assert.equal(profile.attempted,sum('attempted'));
 for(const domain of profile.domains){
  const concepts=profile.concepts.filter(c=>c.chapter===String(domain.id));
  assert.equal(domain.total,concepts.length);
  assert.equal(domain.attempted,concepts.filter(c=>c.attempted).length);
  assert.equal(domain.mastered,concepts.filter(c=>c.score>=80).length);
  assert.equal(domain.unmastered,domain.total-domain.mastered);
  assert.equal(profile.byChapter[domain.id],domain.unmastered);
  assert(domain.weakestAttempted.every(c=>c.attempted));
  assert(domain.newToCover.every(c=>!c.attempted));
  assert.deepEqual(domain.weakestAttempted,[...concepts].filter(c=>c.attempted).sort((a,b)=>a.score-b.score||a.tag.localeCompare(b.tag)).slice(0,2));
 }
}

test('29 Oct account: attempted, mastered and remaining counts reconcile across all 179 concepts',()=>{
 const scoresByDomain={1:[70,70],2:[70,70],3:[70,35],4:[90],5:[70]};
 const concepts=Object.entries(scoresByDomain).flatMap(([chapter,scores])=>READINESS_CATALOGUE.filter(c=>c.chapter===chapter).slice(0,scores.length).map((c,i)=>({...c,score:scores[i]})));
 const profile=summarizeReadiness({concepts,total:10,correct:9,metrics:{...metrics(10),practiceDays:1}},READINESS_CATALOGUE,now);
 assertBreakdownCounts(profile);
 assert.equal(profile.score,51);assert.equal(profile.confidence,'Low');assert.equal(profile.level,'Early estimate');
 assert.equal(profile.attempted,8);assert.equal(profile.mastered,1);assert.equal(profile.unmastered,178);assert.equal(profile.totalConcepts,179);
 assert.deepEqual(profile.domains.map(d=>[d.attempted,d.total]),[[2,36],[2,48],[2,34],[1,41],[1,20]]);
 assert.deepEqual(profile.domains.map(d=>d.unmastered),[36,48,34,40,20]);
 assert.equal(profile.domains[3].mastered,1);
});

test('zero attempts: every concept remains to grow and no attempted weakness is invented',()=>{
 const profile=summarizeReadiness({},READINESS_CATALOGUE,now);
 assertBreakdownCounts(profile);
 assert.equal(profile.score,null);assert.equal(profile.mastered,0);assert.equal(profile.unmastered,179);assert.equal(profile.attempted,0);
 for(const domain of profile.domains){assert.deepEqual(domain.weakestAttempted,[]);assert(domain.newToCover.length>0);}
});

test('fully mastered domain has zero still to grow without changing attempted counts',()=>{
 const concepts=READINESS_CATALOGUE.filter(c=>c.chapter==='4').map(c=>({...c,score:85}));
 const profile=summarizeReadiness({concepts,total:82,correct:82,metrics:metrics(82)},READINESS_CATALOGUE,now);
 assertBreakdownCounts(profile);
 const domain=profile.domains.find(d=>d.id===4);
 assert.equal(domain.total,41);assert.equal(domain.attempted,41);assert.equal(domain.mastered,41);assert.equal(domain.unmastered,0);
 assert.deepEqual(domain.newToCover,[]);
});

test('count invariants hold for varied mastery and ignore evidence outside the catalogue',()=>{
 for(let seed=0;seed<12;seed++){
  const concepts=READINESS_CATALOGUE.filter((_,i)=>(i+seed)%3!==0).map((c,i)=>({...c,score:[0,35,50,70,79,80,100][(i+seed)%7]}));
  concepts.push({tag:'unknown.concept',score:100});
  assertBreakdownCounts(summarizeReadiness({concepts,total:200,correct:100,metrics:metrics(200)},READINESS_CATALOGUE,now));
 }
});
