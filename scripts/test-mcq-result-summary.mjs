import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMcqResultSummary, conceptDeepDive, advanceConceptStreak } from '../src/lib/mcqResultSummary.js';
import { CONCEPT_TAGS } from '../src/data/sy0701ConceptTags.js';
const chapters = [1,2,3,4,5].map(id => ({ id: String(id), title: `Chapter ${id}` }));
const questions = [
  {id:'m1',ch:'4',conceptTagIds:['ops.logs-syslog']},
  {id:'m2',ch:'4',conceptTagIds:['ops.siem']},
  {id:'m3',ch:'1',conceptTagIds:['iam.mfa']},
];
const results = [{correct:false}, {correct:true}, {correct:true}];
const build = engineState => buildMcqResultSummary({ questions, results, chapters, engineState });
test('domain accuracy uses this set only and omits absent domains', () => {
  const report=build();assert.deepEqual(report.domains.map(d=>[d.chapter.id,d.percent,d.correct,d.total]),[['1',100,1,1],['4',50,1,2]]);
  assert.equal(report.strongest.chapter.id,'1');
});
test('all existing tags link to an existing Deep Dive; unknown tags do not guess', () => {
  for(const tag of CONCEPT_TAGS)assert.ok(conceptDeepDive(tag.id),tag.id);
  assert.equal(conceptDeepDive('ops.logs-syslog').id,'incident-response-monitoring');
  assert.equal(conceptDeepDive('not-a-tag'),null);
});
test('cross-set two-miss streak promotes only a concept missed in this set',()=>{
  const report=build({mastery:[{concept_tag:'ops.logs-syslog',score:0}],concept_streaks:[{concept_tag:'ops.logs-syslog',wrong_streak:2},{concept_tag:'iam.mfa',wrong_streak:2}]});
  assert.deepEqual(report.nextFocus.map(i=>i.tag),['ops.logs-syslog']);
});
test('one miss or an intervening/later correct answer does not trigger repeat focus',()=>{
  for(const wrong_streak of [0,1])assert.equal(build({concept_streaks:[{concept_tag:'ops.logs-syslog',wrong_streak}]}).nextFocus.length,0);
});
test('above 80 is excluded; exactly 80 and zero remain eligible',()=>{
  for(const score of [81,100])assert.equal(build({mastery:[{concept_tag:'ops.logs-syslog',score}]}).weakPoints.length,0);
  for(const score of [0,80])assert.equal(build({mastery:[{concept_tag:'ops.logs-syslog',score}]}).weakPoints[0].score,score);
});
test('concept evidence from grading beats an edited question tag; duplicate misses form one row',()=>{
  const report=buildMcqResultSummary({questions:[questions[0],questions[0]],results:[{correct:false,conceptTag:'iam.mfa'},{correct:false,conceptTag:'iam.mfa'}],chapters});
  assert.equal(report.weakPoints.length,1);assert.equal(report.weakPoints[0].count,2);assert.equal(report.weakPoints[0].tag,'iam.mfa');
});
test('missing mastery remains unknown; stale/error state cannot trigger a streak',()=>{
  assert.equal(build().weakPoints[0].score,null);
  const report=buildMcqResultSummary({questions,results,chapters,progressAvailable:false,engineState:{concept_streaks:[{concept_tag:'ops.logs-syslog',wrong_streak:2}]}});
  assert.equal(report.nextFocus.length,0);
});
test('perfect and empty sets have no weak points or focus; strongest breaks ties by sample',()=>{
  const report=buildMcqResultSummary({questions,results:results.map(()=>({correct:true})),chapters});
  assert.equal(report.strongest.chapter.id,'4');assert.equal(report.weakPoints.length,0);assert.equal(report.nextFocus.length,0);
  assert.deepEqual(buildMcqResultSummary({questions:[],results:[],chapters}).domains,[]);
});

test('guest streaks span local sets, reset only on that concept, and never invent mastery',()=>{
  let streaks=advanceConceptStreak({},'ops.logs-syslog',false);
  streaks=advanceConceptStreak(streaks,'iam.mfa',true);
  streaks=advanceConceptStreak(streaks,'ops.logs-syslog',false);
  assert.equal(streaks['ops.logs-syslog'],2);
  streaks=advanceConceptStreak(streaks,'ops.logs-syslog',true);
  assert.equal(streaks['ops.logs-syslog'],0);
  assert.equal(advanceConceptStreak(streaks,null,false),streaks);
});
