import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {compileRevision} from '../server/adaptive/revision.mjs';
const draftPath='docs/drafts/phase-2b5-pilot-pbq-draft-2.json';
const reportPath='docs/phase-2b5-pilot-pbq-draft-review.md';
const evidencePath='docs/evidence/phase-2b5/pilot-pbq-draft-validation.json';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const batch=JSON.parse(readFileSync(draftPath)),bank=readLearningPilotBank();
const prior=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-batch-1.json'));
assert.equal(hash('docs/drafts/phase-2b5-pilot-batch-1.json'),'91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda');
assert.equal(hash('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.equal(contentSignature(bank),'sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391');
assert.equal(batch.status,'CODEX_REVIEWED_UNDER_DELEGATION_PENDING_INDEPENDENT_GATE');
assert.equal(batch.baselineCommit,'e5cc39f7eeacdc083cc8900a1ec6835cb5532762');
for(const key of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(batch[key],false);
assert.equal(batch.gradingPolicy.masteryWeight,0);assert.equal(batch.gradingPolicy.crossConceptPropagation,false);
assert.equal(batch.exercises.length,2);
const parts=batch.exercises.flatMap(q=>q.parts);assert.equal(parts.length,6);
assert.equal(new Set(batch.exercises.map(q=>q.id)).size,2);
for(const q of batch.exercises){
 assert.match(q.id,/^draft\.pilot2\.pbq\.0[12]$/);assert.equal(q.format,'pbq_design');
 assert.equal(q.responseMode,'row_single_choice');assert.equal(q.parts.length,3);
 assert.equal(new Set(q.parts.map(p=>p.id)).size,3);assert(q.scenario.length>100&&q.instructions.length>50);
 assert.equal(q.domainId,'sy0701.domain-5');assert.equal(q.chapterId,'sy0701.objective-5.2');
 assert.equal(q.topicId,'business-continuity-metrics');
 for(const p of q.parts){
  const original=prior.questions.find(d=>d.id===p.comparisonDraftId);assert(original);
  assert.equal(p.scenarioFamilyProposal,original.scenarioFamilyProposal);
  assert.equal(p.primaryConceptProposal,original.primaryConceptProposal);assert.deepEqual(p.secondaryConceptProposals,[]);
  assert.equal(p.familyRelation,'same_reasoning_as_prior_draft');assert.equal(p.newFamilyCredit,0);assert.equal(p.masteryWeight,0);
  assert.equal(p.humanApproved,false);assert.equal(p.familyIndependenceApproved,false);
  assert.deepEqual(p.objectiveCodes,['5.2']);assert.equal(p.objectiveScope,original.objectiveScope);
  assert.equal(p.difficultyStatus,'proposed_uncalibrated');assert(['easy','medium','hard'].includes(p.difficulty));
  assert(['interpretation','calculation','scenario_application','evidence_evaluation'].includes(p.cognitiveSkill));
  assert.equal(p.options.length,4);assert.equal(new Set(p.options).size,4);
  assert(Number.isInteger(p.correctOption)&&p.correctOption>=0&&p.correctOption<4);
  assert.equal(p.optionFeedback.length,4);assert(p.optionFeedback.every(s=>s.length>25));
  assert.equal(p.explanation,p.optionFeedback[p.correctOption]);
  assert(p.sourceRefs.length>=2&&p.sourceRefs.every(id=>batch.sources.some(s=>s.id===id)));
 }
 // The existing trusted compiler must still reject this unsupported component grammar.
 assert.throws(()=>compileRevision({id:'p999',type:'DRAFT_MATRIX',scenario:q.scenario,parts:q.parts},'pbq'),/Unsupported question field: parts/);
}
assert.deepEqual([...new Set(parts.map(p=>p.primaryConceptProposal))].sort(),['continuity.bia','recovery.mtd','recovery.mttr','recovery.rpo','recovery.rto']);
// Offline answer-contract rehearsal only: no runtime export, state write or mastery signal.
function gradeWorksheet(q,responses){
 assert(responses&&typeof responses==='object'&&!Array.isArray(responses),'Invalid response object');
 for(const [id,choice] of Object.entries(responses)){
  assert(q.parts.some(p=>p.id===id),'Unknown row');
  assert(Number.isInteger(choice)&&choice>=0&&choice<4,'Invalid choice');
 }
 return q.parts.map(p=>({componentId:p.id,conceptId:p.primaryConceptProposal,observationGroup:q.id+':'+p.primaryConceptProposal,
  result:!Object.hasOwn(responses,p.id)?'unanswered':responses[p.id]===p.correctOption?'correct':'incorrect',masteryWeight:0}));
}
let gradedCombinations=0;
for(const q of batch.exercises){
 for(let n=0;n<64;n++){
  const responses=Object.fromEntries(q.parts.map((p,i)=>[p.id,Math.floor(n/4**i)%4]));
  const result=gradeWorksheet(q,responses);
  for(let i=0;i<3;i++){assert.equal(result[i].result,responses[q.parts[i].id]===q.parts[i].correctOption?'correct':'incorrect');assert.equal(result[i].masteryWeight,0);}
  gradedCombinations++;
 }
 assert(gradeWorksheet(q,{}).every(r=>r.result==='unanswered'));
 for(const p of q.parts){const result=gradeWorksheet(q,{[p.id]:p.correctOption});assert.equal(result.filter(r=>r.result==='correct').length,1);assert.equal(result.filter(r=>r.result==='unanswered').length,2);}
 for(const response of [null,[],{unknown:0},{[q.parts[0].id]:-1},{[q.parts[0].id]:4},{[q.parts[0].id]:'1'},{[q.parts[0].id]:1.5},{[q.parts[0].id]:undefined}])assert.throws(()=>gradeWorksheet(q,response));
}
assert.deepEqual(gradeWorksheet(batch.exercises[0],{rto:0,rpo:2,mtd:0}).map(r=>r.result),['incorrect','correct','correct']);
assert.deepEqual(gradeWorksheet(batch.exercises[1],{'mttr':3,'bia-input':0,'bia-dependency':0}).map(r=>r.result),['correct','correct','incorrect']);
const biaRows=gradeWorksheet(batch.exercises[1],Object.fromEntries(batch.exercises[1].parts.map(p=>[p.id,p.correctOption]))).filter(p=>p.conceptId==='continuity.bia');
assert.equal(biaRows[0].observationGroup,biaRows[1].observationGroup,'Same-parent BIA rows cannot become independent successes');
const answer=id=>{const p=parts.find(p=>p.id===id);return p.options[p.correctOption];};
assert.equal((10*60+50)-10*60,50);assert(50>45);assert(answer('rto').includes('50 minutes'));
assert.equal(10*60-(9*60+50),10);assert(10<=15);assert(answer('rpo').includes('10 minutes'));
assert.equal(50+70,120);assert.equal(120-110,10);assert(answer('mtd').includes('120 minutes'));
assert.equal((20+40+60)/3,40);assert.equal(answer('mttr'),'40 minutes');
const tokens=s=>new Set(s.toLowerCase().replace(/\d+(?::\d+)?(?:\.\d+)?/g,' # ').match(/[a-z]+|#/g)||[]);
const similarity=(a,b)=>{const x=tokens(a),y=tokens(b);return [...x].filter(t=>y.has(t)).length/new Set([...x,...y]).size;};
assert.equal(similarity('Restore in 4 hours.','RESTORE in 6 hours!'),1);
const stems=[...bank.mcqs,...bank.pbqs].map(q=>({id:q.id,text:[q.q,q.title,q.scenario,q.question].filter(Boolean).join(' ')}));
const comparisons=[...stems,...prior.questions.map(q=>({id:q.id,text:q.stem}))];
const nearest=batch.exercises.flatMap(exercise=>exercise.parts.map(p=>({componentId:exercise.id+':'+p.id,nearest:comparisons.map(q=>({id:q.id,score:Number(similarity(exercise.scenario+' '+p.prompt,q.text).toFixed(4))})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,3)})));
for(const q of batch.exercises)assert(!comparisons.some(c=>c.text.trim()===q.scenario.trim()),'Exact existing scenario copy');
for(const root of ['src','api','server'])for(const file of readdirSync(root,{recursive:true}).filter(f=>/\.(jsx?|mjs)$/.test(f)))assert(!readFileSync(root+'/'+file,'utf8').includes('phase-2b5-pilot-pbq-draft-2'),'Draft imported into runtime');
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [p,h] of Object.entries(manifest.files))assert.equal(hash(p),h,p+' active artifact changed');
const evidence={status:'PASS_OFFLINE_COMPONENT_CONTRACT_NOT_RUNTIME_SUPPORT',date:batch.date,baselineCommit:batch.baselineCommit,exercises:2,parts:6,concepts:5,gradedCombinations,newIndependentFamilies:0,eligibleEvidence:0,bankCounts:{mcqs:bank.mcqs.length,pbqs:bank.pbqs.length},checks:{partialAnswers:'unanswered is not negative evidence; correct rows do not propagate',invalidInputs:'unknown rows, arrays, null, strings, out-of-range and noninteger choices rejected',sameConceptGrouping:'BIA rows share a parent/concept observation group',runtimeCompiler:'unsupported parts rejected; no grammar change',activeArtifacts:'all release-manifest files unchanged',arithmetic:'50-minute restoration; 10-minute recovery-point gap; 120-minute business interruption; 40-minute MTTR'},nearDuplicateResults:nearest,limitations:['Same reasoning as batch 1: zero novelty or new-family credit.','Author review under delegation; independent editorial gate not completed.','Worksheet choice rows are a PBQ design, not a deployed simulation or compiler-supported PBQ.','Private p003/p017 payloads unavailable; no live inspection or psychometric calibration.','Offline rows have zero mastery weight; runtime schema/renderer/trusted ingestion must be reviewed separately.'],sha256:Object.fromEntries([draftPath,reportPath,'scripts/audit-pilot-pbq-drafts.mjs','docs/drafts/phase-2b5-pilot-batch-1.json','docs/evidence/phase-2b5/mapping-package.json'].map(p=>[p,hash(p)]))};
const output=JSON.stringify(evidence,null,2)+'\n';
if(process.argv.includes('--write'))writeFileSync(evidencePath,output);else assert.equal(readFileSync(evidencePath,'utf8'),output,'Stale PBQ draft evidence');
console.log(JSON.stringify({status:evidence.status,exercises:2,parts:6,concepts:5,gradedCombinations,newIndependentFamilies:0,eligibleEvidence:0,draftSha256:hash(draftPath)}));
