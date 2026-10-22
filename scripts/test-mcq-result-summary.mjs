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

const allMissed=results.map(()=>({correct:false}));
const focusFor=(scores,streaks=[],extra={})=>buildMcqResultSummary({questions,results:allMissed,chapters,engineState:{mastery:Object.entries(scores).map(([concept_tag,score])=>({concept_tag,score})),concept_streaks:streaks.map(concept_tag=>({concept_tag,wrong_streak:2}))},...extra});
test('empty focus promotes the two lowest known mastery scores, including zero',()=>{
  const report=focusFor({'ops.logs-syslog':50,'ops.siem':0,'iam.mfa':15});
  assert.deepEqual(report.nextFocus.map(row=>[row.tag,row.score,row.reason]),[['ops.siem',0,'lowest-mastery'],['iam.mfa',15,'lowest-mastery']]);
});
test('one repeat miss stays first and gains only the weakest different topic',()=>{
  const report=focusFor({'ops.logs-syslog':70,'ops.siem':0,'iam.mfa':15},['ops.logs-syslog']);
  assert.deepEqual(report.nextFocus.map(row=>[row.tag,row.reason]),[['ops.logs-syslog','repeat-miss'],['ops.siem','lowest-mastery']]);
});
test('two or more repeat topics are preserved, without fallback additions or duplicates',()=>{
  for(const count of [2,3]){
    const report=focusFor({'ops.logs-syslog':70,'ops.siem':60,'iam.mfa':0},questions.slice(0,count).map(q=>q.conceptTagIds[0]));
    assert.equal(report.nextFocus.length,count);assert(report.nextFocus.every(row=>row.reason==='repeat-miss'));
    assert.equal(new Set(report.nextFocus.map(row=>row.tag)).size,count);
  }
});
test('fallback excludes unknown mastery, above 80, stale progress, and topics not missed in this set',()=>{
  assert.equal(focusFor({'ops.logs-syslog':81}).nextFocus.length,0);
  assert.equal(focusFor({'ops.logs-syslog':80}).nextFocus[0].score,80);
  assert.equal(focusFor({'ops.logs-syslog':0},[],{progressAvailable:false}).nextFocus.length,0);
  assert.equal(focusFor({'ops.logs-syslog':0},[],{results:results.map(()=>({correct:true}))}).nextFocus.length,0);
  const report=focusFor({'ops.logs-syslog':20,'ops.siem':20,'iam.mfa':20});
  assert.deepEqual(report.nextFocus.map(row=>row.tag),['iam.mfa','ops.logs-syslog']);
});
