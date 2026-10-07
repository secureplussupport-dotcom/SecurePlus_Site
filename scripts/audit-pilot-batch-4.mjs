import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {QUESTION_MAPPINGS} from '../src/data/learningMappings.js';
const draftPath='docs/drafts/phase-2b5-pilot-batch-4.json',reportPath='docs/phase-2b5-pilot-batch-4-review.md';
const evidencePath='docs/evidence/phase-2b5/pilot-batch-4-validation.json';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const pinned={
 'docs/drafts/phase-2b5-pilot-batch-1.json':'91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda',
 'docs/drafts/phase-2b5-pilot-pbq-draft-2.json':'94adaf1c9ca90370636bc3c8c20a6e51156964a4f1871905d23a88cbe9d5ae02',
 'docs/drafts/phase-2b5-pilot-teaching-draft-3.json':'84757c5c7bec067e5baee182487525f3f843aa9e709af257b307be0c1655a921',
 'docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json':'de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c',
 'docs/evidence/phase-2b5/mapping-package.json':'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97'
};
for(const [p,h] of Object.entries(pinned))assert.equal(hash(p),h,p+' comparison changed');
const batch=JSON.parse(readFileSync(draftPath)),bank=readLearningPilotBank();
assert.equal(contentSignature(bank),'sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391');
assert.equal(batch.baselineCommit,'08b77cd10f618a06dc8e05baa6f6da8344a0258c');
assert.equal(batch.status,'CODEX_REVIEWED_UNDER_DELEGATION_PENDING_INDEPENDENT_GATE');
for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(batch[k],false);
assert.equal(batch.authority.sourceHumanMessageId,'01a113bf-b3d5-7e12-bb2a-e0c3c2ddc701');
assert.equal(batch.authority.exactInstruction,'you dont need my approval for the next questions or family tags anymore. just execute.');
const prior=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-batch-1.json'));
const pbq=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-pbq-draft-2.json'));
const teaching=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-teaching-draft-3.json'));
const pkg=JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json'));
const stems=[...bank.mcqs,...bank.pbqs].map(q=>({id:q.id,text:[q.q,q.title,q.scenario,q.question].filter(Boolean).join(' '),revision:contentSignature(q),kind:'effective_question'}));
const comparisons=[...stems,...prior.questions.map(q=>({id:q.id,text:q.stem,revision:contentSignature(q),kind:'prior_mcq'})),
 ...pbq.exercises.flatMap(e=>e.parts.map(p=>({id:e.id+':'+p.id,text:e.scenario+' '+p.prompt,revision:contentSignature({scenario:e.scenario,part:p}),kind:'prior_worksheet_row'}))),
 ...teaching.drafts.map(d=>({id:d.id,text:JSON.stringify(d.content),revision:d.contentSignature,kind:'teaching_only'}))];
const byId=new Map(batch.questions.map(q=>[q.id,q]));assert.equal(byId.size,6);assert.equal(batch.questions.length,6);
const meaningful=s=>typeof s==='string'&&s.trim().length>=25;
function checkQuestion(q){
 assert.match(q.id,/^draft\.pilot4\.(mtd|mttr|bia|rpo)\.0[12]$/);
 assert(['recovery.mtd','recovery.mttr','continuity.bia','recovery.rpo'].includes(q.primaryConceptProposal));
 assert.deepEqual(q.secondaryConceptProposals,[]);assert.deepEqual(q.objectiveCodes,['5.2']);
 assert.equal(q.objectiveScope,q.primaryConceptProposal==='recovery.mtd'?'supporting_context_not_explicit_bullet':'explicit_bia_bullet');
 assert.equal(q.domainId,'sy0701.domain-5');assert.equal(q.chapterId,'sy0701.objective-5.2');assert.equal(q.topicId,'business-continuity-metrics');
 assert.equal(q.format,'mcq');assert(['medium','hard'].includes(q.difficulty));assert.equal(q.difficultyStatus,'proposed_uncalibrated');
 assert(['scenario_application','evidence_evaluation','interpretation','calculation'].includes(q.cognitiveSkill));
 assert.equal(q.editorialStatus,'codex_reviewed_under_delegation');assert.equal(q.familyRelation,'proposed_distinct_reasoning_pending_independent_gate');
 for(const k of ['humanApproved','published','familyIndependenceApproved'])assert.equal(q[k],false);
 assert.equal(q.masteryWeight,0);assert.equal(q.newFamilyCredit,0);
 assert(meaningful(q.stem)&&meaningful(q.explanation)&&meaningful(q.familyRationale)&&meaningful(q.accuracyCheck));
 assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(s=>s.toLowerCase().trim())).size,4);
 assert(Number.isInteger(q.correctOption)&&q.correctOption>=0&&q.correctOption<4);
 assert.equal(q.optionFeedback.length,4);assert(q.optionFeedback.every(meaningful));assert.equal(q.explanation,q.optionFeedback[q.correctOption]);
 assert(q.sourceRefs.length>=2&&q.sourceRefs.every(id=>batch.sources.some(s=>s.id===id)));
 assert(q.comparisonIds.length>=3&&q.comparisonIds.every(id=>comparisons.some(c=>c.id===id)));
 assert.match(q.scenarioFamilyProposal,/^[a-z]+(?:-[a-z]+)+$/);
 assert(!comparisons.some(c=>c.id===q.id));assert(!QUESTION_MAPPINGS.some(m=>m.questionId===q.id));assert(!pkg.records.some(r=>r.questionId===q.id));
}
batch.questions.forEach(checkQuestion);
assert.equal(new Set(batch.questions.map(q=>q.scenarioFamilyProposal)).size,6);
assert(batch.questions.every(q=>!prior.questions.some(p=>p.scenarioFamilyProposal===q.scenarioFamilyProposal)));
const q=id=>byId.get('draft.pilot4.'+id),answer=id=>q(id).options[q(id).correctOption];
// Pin numerical premises as well as recomputing results: edited premises require a new review.
assert.match(q('mtd.01').stem,/3 hours.*8 hours.*10 hours.*same outage.*exceeding any one/s);
assert(answer('mtd.01').startsWith(`${Math.min(3,8,10)} hours,`));assert.equal((3+8+10)/3,7);
assert.match(q('mttr.01').stem,/three repairs.*20 minutes each.*ongoing after 240.*completed repairs only/s);
assert(answer('mttr.01').includes(`${[20,20,20].reduce((a,b)=>a+b)/3} minutes`));assert(answer('mttr.01').includes('reported separately'));
assert.equal((60+240)/4,75);assert(q('mttr.01').options[0].includes('75 minutes'));assert(q('mttr.01').options[2].includes(`${(60+240)/3} minutes`));
assert.match(q('mttr.02').stem,/10 completed repairs.*30 minutes.*30 completed repairs.*15 minutes.*fully contained.*do not overlap.*no other downtime/s);
assert(answer('mttr.02').includes(`${10*30} to ${30*15} minutes`));assert(30*15>10*30);
assert.match(q('bia.01').stem,/Each application report lists \$8,000.*exactly the same canceled orders.*no other loss/s);
assert(answer('bia.01').startsWith('$8,000 once,'));assert.equal(new Set(['same_orders','same_orders']).size*8000,8000);
assert.match(q('bia.02').stem,/first hour.*50 orders per hour.*initial backlog is zero.*20 orders per hour.*no other processing path.*full arrival workload/s);
assert(answer('bia.02').includes(`${50-20} orders unprocessed`));
assert.match(q('rpo.01').stem,/12:45.*15-minute RPO.*12:00.*12:00-12:10, 12:10-12:20 and 12:30-12:40.*12:20-12:30 block is missing.*requires every intervening log block.*no later base snapshot.*same date and timezone/s);
let point=720;for(const [start,end] of [[720,730],[730,740],[750,760]]){if(start!==point)break;point=end;}
assert.equal(point,740);assert.equal(765-point,25);assert(765-point>15);assert.equal(answer('rpo.01'),'12:20, giving a 25-minute window that misses the RPO.');
// ponytail: lexical screen only; semantic family independence remains a separate editorial gate.
const tokens=s=>new Set(s.toLowerCase().replace(/\d+(?::\d+)?(?:\.\d+)?/g,' # ').match(/[a-z]+|#/g)||[]);
const similarity=(a,b)=>{const x=tokens(a),y=tokens(b);return [...x].filter(t=>y.has(t)).length/new Set([...x,...y]).size;};
assert.equal(similarity('Restore service in 4 hours.','RESTORE service in 6 hours!'),1);
const nearest=batch.questions.map(d=>{
 const candidates=[...comparisons,...batch.questions.filter(q=>q.id!==d.id).map(q=>({id:q.id,text:q.stem,revision:contentSignature(q),kind:'same_batch'}))];
 const ranked=candidates.map(c=>({id:c.id,kind:c.kind,revision:c.revision,score:Number(similarity(d.stem,c.text).toFixed(4))})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 assert(ranked[0].score<0.65,d.id+' near-copy: revise or review');return {draftId:d.id,nearest:ranked.slice(0,3)};
});
for(const patch of [{humanApproved:true},{masteryWeight:1},{familyIndependenceApproved:true},{secondaryConceptProposals:['recovery.rpo']},{correctOption:4},{optionFeedback:[]},{primaryConceptProposal:'recovery.mtd',objectiveScope:'explicit_bia_bullet'}])assert.throws(()=>checkQuestion({...batch.questions[0],...patch}));
for(const root of ['src','api','server'])for(const f of readdirSync(root,{recursive:true}).filter(f=>/\.(jsx?|mjs)$/.test(f))){const s=readFileSync(root+'/'+f,'utf8');assert(!s.includes('phase-2b5-pilot-batch-4')&&!s.includes('draft.pilot4.'),'Draft referenced by runtime');}
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [p,h] of Object.entries(manifest.files))assert.equal(hash(p),h,p+' active artifact changed');
const evidence={status:'PASS_OFFLINE_DRAFT_CHECKS_PENDING_INDEPENDENT_EDITORIAL_GATE',date:batch.date,baselineCommit:batch.baselineCommit,
 questions:6,candidateNewFamilies:6,reusedFamilies:0,independentlyApprovedNewFamilies:0,eligibleEvidence:0,
 bankCounts:{mcqs:bank.mcqs.length,pbqs:bank.pbqs.length},bankSignature:contentSignature(bank),
 distribution:['recovery.mtd','recovery.mttr','continuity.bia','recovery.rpo'].map(concept=>({conceptId:concept,medium:batch.questions.filter(q=>q.primaryConceptProposal===concept&&q.difficulty==='medium').length,hard:batch.questions.filter(q=>q.primaryConceptProposal===concept&&q.difficulty==='hard').length})),
 checks:{keysAndFeedback:'six keys / 24 feedback entries; recomputed arithmetic and chain; negative schema/approval fixtures',adversarialRevision:'Corrected unfinished-time/count distractor from80 to100 before freezing draft',activeArtifacts:`${Object.keys(manifest.files).length} release-manifest files unchanged`,boundary:'Zero weight, no active mapping or runtime reference; MTD supporting scope'},
 nearDuplicateMethod:'Number-normalized stem token Jaccard <0.65. All483 effective questions,15 prior MCQs,6 worksheet rows,3 teaching drafts and5 sibling questions per draft. Teaching is comparison context only; scores do not approve semantic independence.',nearDuplicateResults:nearest,
 limitations:['Author review under delegated authority; independent monitor gate pending, not personally human-reviewed.','Six distinct-family proposals; no integrated independent-family or mastery credit.','Workaround and recoverability themes overlap earlier drafts; independent gate may merge or reject families.','No private p003/p017 payloads, fresh live bank/browser checks, learner calibration or demonstrated transfer.','Canonical tags, scope and difficulty approvals, integrations and remaining phase gates stay open; production NOT READY.'],
 sha256:Object.fromEntries([draftPath,reportPath,'scripts/audit-pilot-batch-4.mjs',...Object.keys(pinned),batch.authority.record].map(p=>[p,hash(p)]))};
const output=JSON.stringify(evidence,null,2)+'\n';
if(process.argv.includes('--write'))writeFileSync(evidencePath,output);else assert.equal(readFileSync(evidencePath,'utf8'),output,'Stale batch4 evidence');
console.log(JSON.stringify({status:evidence.status,questions:6,candidateNewFamilies:6,reusedFamilies:0,independentlyApprovedNewFamilies:0,eligibleEvidence:0,draftSha256:hash(draftPath)}));
