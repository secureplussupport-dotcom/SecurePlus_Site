import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
const path='docs/drafts/phase-2b5-pilot-power-draft-5.json',p=JSON.parse(readFileSync(path)),hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
for(const [f,h] of Object.entries(p.sourceBindings))assert.equal(hash(f),h,f+' comparison drift');
assert.equal(p.sourceBindings['docs/evidence/phase-2b5/mapping-package.json'],'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.equal(p.sourceBindings['docs/drafts/phase-2b5-pilot-batch-1.json'],'91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda');
assert.equal(p.sourceBindings['docs/drafts/phase-2b5-pilot-batch-4.json'],'7be45316dda58c45685e06c9d2062a58b6dfda6b56b898d7050ff2b28412714e');
assert.equal(p.sourceBindings['docs/phase-2b5-pilot-owner-decision-packet.md'],'01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953');
assert.equal(p.baselineCommit,'3892a7c0b33335971f9b05ef58e052743f15ac0a');assert.equal(p.status,'CODEX_REVIEWED_UNDER_DELEGATION_PENDING_INDEPENDENT_GATE');
for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(p[k],false);for(const k of ['masteryWeight','newFamilyCredit'])assert.equal(p[k],0);
assert.equal(p.authority.sourceHumanMessageId,'01a113bf-b3d5-7e12-bb2a-e0c3c2ddc701');assert.equal(p.authority.exactInstruction,'you dont need my approval for the next questions or family tags anymore. just execute.');
const bank=readLearningPilotBank(),all=[...bank.mcqs,...bank.pbqs],byId=new Map(all.map(q=>[q.id,q])),pkg=JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json'));
assert.equal(contentSignature(bank),p.bankSignature);assert.equal(p.bankSignature,'sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391');
const strings=v=>typeof v==='string'?[v]:Array.isArray(v)?v.flatMap(strings):v&&typeof v==='object'?Object.values(v).flatMap(strings):[];
assert.deepEqual(p.search.rules.map(r=>r.id),['power_terms','implicit_constraints']);assert(p.search.rules.every(r=>r.flags==='i'));
const selected=all.filter(q=>p.search.rules.some(r=>new RegExp(r.pattern,r.flags).test(strings(q).join('\n')))).map(q=>q.id).sort();
assert.equal(selected.length,61);assert.equal(all.length,p.search.bankCount);assert.equal(all.length-selected.length,p.search.unmatchedCount);assert.equal(p.search.unmatchedCount,422);assert.equal(p.search.retainedCount,61);assert.equal(p.search.completeSemanticCoverageClaim,false);assert.equal(contentSignature(selected),p.search.candidateIdsSignature);
assert.deepEqual(p.candidateReviews.map(r=>r.questionId),selected);
const supplemental=/\b(?:energy|amper\w*|amps?|volts?|kVA|mains|diesel|capacitor\w*|standby|supply\s+interruption|electrical)\b/i;
assert.equal(all.filter(q=>!selected.includes(q.id)&&supplemental.test(strings(q).join('\n'))).length,0,'Extra power synonym candidate needs review');
for(const r of p.candidateReviews){const q=byId.get(r.questionId),record=pkg.records.find(x=>x.questionId===q.id&&!x.id.startsWith('private:'));assert.equal(r.originalObjective,q.objective);assert.equal(r.localRevision,contentSignature(q));assert.equal(r.localRevision,record.localRevisionSignature);assert.equal(r.capturedPublishedRevision,record.sourceSignature);assert.equal(r.classification,'different_assessed_understanding');assert(r.assessedUnderstanding.length>8&&r.rationale.length>100);}
const prior=['docs/drafts/phase-2b5-pilot-batch-1.json','docs/drafts/phase-2b5-pilot-batch-4.json'].flatMap(f=>JSON.parse(readFileSync(f)).questions),worksheets=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-pbq-draft-2.json')).exercises,teaching=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-teaching-draft-3.json')).drafts;
assert.equal(prior.length,p.search.priorMcqsReviewed);assert.equal(prior.length,21);assert.equal(worksheets.flatMap(e=>e.parts).length,p.search.worksheetRowsReviewed);assert.equal(p.search.worksheetRowsReviewed,6);assert.equal(teaching.length,p.search.teachingDraftsCompared);assert.equal(p.search.similarPowerReasoningFound,0);
const explicit=new RegExp(p.search.rules[0].pattern,'i');assert(!prior.some(q=>explicit.test(strings(q).join('\n'))));assert(!worksheets.some(e=>explicit.test(strings(e).join('\n'))));
assert.equal(p.questions.length,1);const q=p.questions[0];
function check(item){
 assert.equal(item.id,'draft.pilot5.power.01');assert.equal(item.format,'mcq');assert.equal(item.options.length,4);assert.equal(new Set(item.options).size,4);assert.equal(item.correctOption,0);assert.equal(item.optionFeedback.length,4);assert(item.optionFeedback.every(s=>s.length>90));assert.equal(item.explanation,item.optionFeedback[item.correctOption]);
 assert.equal(item.editorialStatus,'codex_reviewed_under_delegation');assert.equal(item.difficulty,'medium');assert.equal(item.difficultyStatus,'proposed_uncalibrated');assert.equal(item.cognitiveSkill,'scenario_application');assert.deepEqual(item.objectiveCodesProposal,['3.4']);assert.equal(item.objectiveScopeProposal,'power_generators_and_ups_with_capacity_context');assert.equal(item.objectiveScopeApproved,false);assert.equal(item.primaryConceptProposal,null);assert.deepEqual(item.secondaryConceptProposals,[]);
 for(const k of ['humanApproved','published','familyIndependenceApproved'])assert.equal(item[k],false);for(const k of ['masteryWeight','newFamilyCredit'])assert.equal(item[k],0);
 assert.equal(item.scenarioFamilyProposal,'load-dependent-ups-generator-bridge');assert.equal(item.familyRelation,'proposed_distinct_reasoning_pending_independent_gate');assert(item.familyRationale.length>200&&item.taxonomyBlocker.length>100);
 assert.match(item.stem,/without interruption.*at least two minutes.*600 W.*400 W.*1,500 W.*12 minutes at 600 W.*seven minutes at 1,000 W.*eight minutes.*two more minutes.*compatibility and uninterrupted switching are verified.*no other power source/s);
 assert.equal(item.options[0],'Put only the essential 600 W on the UPS and keep the optional display off while the generator starts and transfers.');assert(item.options[1].includes('1,000 W is below its 1,500 W'));assert(item.options[2].includes('only to the generator'));assert(item.options[3].includes('shut it down at minute six'));
}
check(q);
const bridge=8+2,essentialMargin=12-bridge,combinedMargin=7-bridge;assert.equal(bridge,10);assert.equal(600+400,1000);assert(1000<1500);assert.equal(essentialMargin,2);assert(essentialMargin>=2);assert.equal(combinedMargin,-3);assert(combinedMargin<2);assert(6<bridge);
// Neither generator-only operation nor a deliberate shutdown supplies uninterrupted service during the bridge.
assert.deepEqual([600<=1500&&essentialMargin>=2,1000<=1500&&combinedMargin>=2,bridge===0,6>=bridge],[true,false,false,false]);
for(const patch of [{correctOption:1},{masteryWeight:1},{humanApproved:true},{objectiveScopeApproved:true},{primaryConceptProposal:'recovery.rto'},{familyIndependenceApproved:true},{optionFeedback:[]},{stem:q.stem.replace('12 minutes at 600 W','nine minutes at 600 W')}])assert.throws(()=>check({...q,...patch}));
// ponytail: lexical candidates are a review aid; physical power reasoning was compared manually, not approved by a similarity threshold.
const tokens=s=>new Set(s.toLowerCase().replace(/\d+(?::\d+)?(?:\.\d+)?/g,' # ').match(/[a-z]+|#/g)||[]),similarity=(a,b)=>{const x=tokens(a),y=tokens(b);return [...x].filter(t=>y.has(t)).length/new Set([...x,...y]).size;};assert.equal(similarity('A 600 W load runs for 12 minutes.','A 900 W LOAD runs for 9 minutes!'),1);
const comparisons=all.map(q=>({id:q.id,text:[q.q,q.title,q.scenario,q.question,q.diagram].filter(Boolean).join(' ')})).concat(prior.map(q=>({id:q.id,text:q.stem})),worksheets.flatMap(e=>e.parts.map(r=>({id:e.id+':'+r.id,text:e.scenario+' '+r.prompt}))),teaching.map(d=>({id:d.id,text:JSON.stringify(d.content)})));
assert(q.comparisonIds.every(id=>comparisons.some(c=>c.id===id)));assert(!comparisons.some(c=>c.id===q.id));assert(!prior.some(r=>r.scenarioFamilyProposal===q.scenarioFamilyProposal));assert(!pkg.records.some(r=>r.questionId===q.id));
const nearest=comparisons.map(c=>({id:c.id,score:Number(similarity(q.stem,c.text).toFixed(4))})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,3);assert(nearest[0].score<0.65);
assert.equal(p.privateBoundary.selectedSourceRevision,pkg.privateRevisionProcessing.sourceSignature);assert.equal(p.privateBoundary.selectedSourceRevision,'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42');assert.equal(p.privateBoundary.trustedRevisionId,null);for(const k of ['payloadAvailable','sourceReadRefreshed','localFallbackMaySubstitute'])assert.equal(p.privateBoundary[k],false);
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [f,h] of Object.entries(manifest.files))assert.equal(hash(f),h,f+' active artifact changed');
for(const root of ['src','api','server'])for(const f of readdirSync(root,{recursive:true}).filter(f=>/\.(jsx?|mjs)$/.test(f))){const s=readFileSync(root+'/'+f,'utf8');assert(!s.includes('phase-2b5-pilot-power-draft-5')&&!s.includes('draft.pilot5.power.01'),'Runtime imported draft');}
console.log(JSON.stringify({status:'PASS_OFFLINE_POWER_DRAFT_PENDING_INDEPENDENT_GATE_NOT_READY',draftSha256:hash(path),questionSignature:contentSignature(q),retainedCandidates:61,priorMcqs:21,worksheetRows:6,newQuestions:1,proposedFamilies:1,approvedNewFamilies:0,eligibleEvidence:0,essentialMargin,combinedMargin,nearest}));
