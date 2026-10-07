import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {compileRevision} from '../server/adaptive/revision.mjs';
import {LEARNING_CONCEPTS} from '../src/data/learningConcepts.js';

const packetPath='docs/drafts/phase-2b5-recovery-overlap-semantic-proposals.json',reportPath='docs/phase-2b5-recovery-overlap-semantic-review.md';
const read=f=>JSON.parse(readFileSync(f)),hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const p=read(packetPath),report=readFileSync(reportPath,'utf8'),census=read('docs/drafts/phase-2b5-cross-objective34-census.json'),prior=read('docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json'),old34=read('docs/drafts/phase-2b5-objective34-semantic-proposals.json'),pkg=read('docs/evidence/phase-2b5/mapping-package.json');
for(const [f,h] of Object.entries(p.sourceBindings))assert.equal(hash(f),h,f+' source drift');
for(const [f,h] of Object.entries(census.sourceBindings))assert.equal(p.sourceBindings[f],h,'Missing inherited source binding');
assert.equal(p.sourceBindings['docs/drafts/phase-2b5-cross-objective34-census.json'],'2613a81bfc9a9720a90f5225d1265df3f538f5bcf543e29c9a4a2dc9b224b782');
assert.equal(p.baselineCommit,'1330c088c54ee7ac222595bc26665496519da980');assert.equal(p.status,'LOCAL_RECOVERY_OVERLAP_PROPOSALS_NOT_READY');
for(const k of ['humanApproved','published','activationAllowed'])assert.equal(p[k],false);for(const k of ['masteryWeight','newFamilyCredit','newQuestions'])assert.equal(p[k],0);
const bank=readLearningPilotBank(),all=[...bank.mcqs,...bank.pbqs],byId=new Map(all.map(q=>[q.id,q])),selected=census.candidates.filter(r=>r.classification==='direct_3_4_reasoning'),ids=selected.map(r=>r.questionId).sort();
assert.equal(contentSignature(bank),p.bankSignature);assert.equal(p.bankSignature,census.bankSignature);assert.equal(all.length,483);assert.equal(census.candidates.length,111);
assert.deepEqual(ids,['m068','m088','m352','m630','m708','p041','p043','p048']);
assert.deepEqual(p.denominator,{effectiveLocalBank:483,censusRetained:111,directOverlapSelected:8,mcqs:5,pbqs:3,reusedFullProposals:2,additionalBroadProposals:6,additionalMcqs:4,additionalPbqs:2,newDirectPilotProposals:0,eligibleEvidence:0,completeSemanticCoverageClaim:false});
const reused=selected.filter(r=>prior.questionProposals.some(q=>q.questionId===r.questionId)).map(r=>r.questionId).sort(),additional=ids.filter(id=>!reused.includes(id));
assert.deepEqual(reused,['m088','p048']);assert.deepEqual(old34.questionProposals.filter(r=>ids.includes(r.questionId)),[]);
function validateReuse(rows){
 assert.deepEqual(rows.map(r=>r.questionId).sort(),reused);
 for(const r of rows){const priorRow=prior.questionProposals.find(q=>q.questionId===r.questionId),q=byId.get(r.questionId);assert.equal(r.packetPath,'docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json');assert.equal(r.packetSha256,hash(r.packetPath));assert.equal(r.sourceRevision,contentSignature(q));assert.equal(r.sourceRevision,priorRow.sourceRevision);assert.equal(r.publishedRecordSignature,priorRow.publishedRecordSignature);assert.equal(r.disposition,'reuse_exact_prior_row_no_new_role_or_family');}
}
validateReuse(p.reusedProposals);
const supports={m708:['sy0701.term.ddos'],p041:['sy0701.term.encryption']},tabletop=['m068','m352','m630'],family={m708:'distributed-upstream-capacity-and-origin-restriction',p041:'mixed-data-state-protection-matching',p043:'mixed-incident-response-terminology-matching'};
function validateRows(rows){
 assert.deepEqual(rows.map(r=>r.questionId).sort(),additional,'Missing/duplicate additional proposal');
 for(const r of rows){const q=byId.get(r.questionId),source=selected.find(c=>c.questionId===r.questionId),record=pkg.records.find(c=>c.id===r.recordId);assert(q&&source&&record&&!r.recordId.startsWith('private:'));
  assert.equal(r.sourceRevision,contentSignature(q),'Stale local revision');assert.equal(r.sourceRevision,source.localRevision);assert.equal(r.sourceRevision,record.localRevisionSignature);assert.equal(r.publishedRecordSignature,source.capturedPublishedRevision);assert.equal(r.publishedRecordSignature,record.sourceSignature);
  assert.equal(r.kind,source.kind);assert.equal(r.capturedTrustedRevisionId,record.trustedRevisionId);assert.equal(r.capturedPrecision,record.precision);assert.equal(r.objectiveObserved,q.objective);assert.equal(r.difficultyObserved,q.difficulty);assert.equal(r.formatObserved,record.questionFormat);
  assert.equal(r.disposition,r.kind==='pbq'?'mixed_coarse_withheld':'outside_five_pilot_concepts');assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);assert.deepEqual(r.supportConceptProposals,supports[q.id]||[]);assert.equal(r.objectiveReassignmentProposal,null);assert.deepEqual(r.componentProposals,[]);
  for(const k of ['masteryWeight','componentEvidenceWeight','newFamilyCredit'])assert.equal(r[k],0);assert.equal(r.humanApproved,false);assert.equal(r.familyRelation,'existing_question_reasoning_label_only');assert.equal(r.familyReviewStatus,'agent_comparison_pending_independent_gate');
  assert.equal(r.familyLabelProposal,family[q.id]||'discussion-only-tabletop-recognition');assert.deepEqual(r.sharedReasoningLabels,tabletop.includes(q.id)||q.id==='p043'?['discussion-only-tabletop-recognition']:[]);assert(r.rationale.length>100&&r.assessedUnderstanding.length>25&&r.keyObservation.length>15);
  for(const id of r.supportConceptProposals)assert.equal(pkg.concepts.find(c=>c.id===id).nodeKind,'supporting_concept','Support must not become mastery');
 }
}
validateRows(p.questionProposals);
for(const [id,patch] of [['m068',{primaryConceptProposal:'recovery.rto'}],['m352',{familyLabelProposal:'new-independent-tabletop-family'}],['m630',{secondaryConceptProposals:['continuity.bia']}],['m708',{supportConceptProposals:['sy0701.objective.3.4']}],['m708',{sourceRevision:'sha256:'+'0'.repeat(64)}],['m708',{objectiveReassignmentProposal:'3.4'}],['p041',{componentProposals:[{id:'d',conceptId:'recovery.rpo'}]}],['p041',{componentEvidenceWeight:1}],['p043',{capturedTrustedRevisionId:'invented'}],['p043',{masteryWeight:1}],['m068',{humanApproved:true}],['m068',{newFamilyCredit:1}]])assert.throws(()=>validateRows(p.questionProposals.map(r=>r.questionId===id?{...r,...patch}:r)));
assert.throws(()=>validateRows(p.questionProposals.slice(1)));assert.throws(()=>validateRows([...p.questionProposals,p.questionProposals[0]]));assert.throws(()=>validateReuse(p.reusedProposals.slice(1)));
assert.deepEqual(LEARNING_CONCEPTS.map(c=>c.id).sort(),['continuity.bia','recovery.mtd','recovery.mttr','recovery.rpo','recovery.rto']);
for(const [id,index] of [['m068',2],['m352',1],['m630',0]]){const q=byId.get(id);assert.equal(q.correct,index);assert.match(q.opts[index],/Tabletop exercise/);assert.match(q.exp,/discuss/i);assert.equal(compileRevision(q,'mcq').revisionId,selected.find(r=>r.questionId===id).capturedTrustedRevisionId);}
const capacity=byId.get('m708');assert.equal(capacity.correct,2);assert.match(capacity.opts[2],/DDoS protection and restricted origin access/);assert.match(capacity.wrongFeedback[0],/saturated/);assert.equal(compileRevision(capacity,'mcq').revisionId,selected.find(r=>r.questionId==='m708').capturedTrustedRevisionId);
assert.deepEqual(byId.get('p041').correctMapping,{a:'1',b:'2',c:'3',d:'4',e:'5'});assert.match(byId.get('p041').blanks.find(b=>b.id==='d').answer,/Backup-media encryption before off-site shipment/);assert.match(byId.get('p041').blanks.find(b=>b.id==='d').explanation,/protect keys/);
assert.deepEqual(byId.get('p043').blanks.map(b=>b.answer),['Chain of Custody','Legal Hold','Threat Hunting','Tabletop','Digital Forensics']);assert.match(byId.get('p043').blanks.find(b=>b.id==='d').sentence,/without conducting live system actions/);
for(const id of ['p041','p043']){assert.throws(()=>compileRevision(byId.get(id),'pbq'));assert.equal(selected.find(r=>r.questionId===id).capturedTrustedRevisionId,null);}
assert.equal(byId.get('m088').correct,2);assert.match(byId.get('m088').opts[2],/every three hours/);assert.equal(prior.questionProposals.find(r=>r.questionId==='m088').primaryConceptProposal,'recovery.rpo');
assert.deepEqual(byId.get('p048').correctOrder,['c','a','e','b','f','d']);const old48=prior.questionProposals.find(r=>r.questionId==='p048');assert.equal(old48.primaryConceptProposal,null);assert.deepEqual(old48.supportConceptProposals,['recovery.rto','continuity.bia']);assert.equal(compileRevision(byId.get('p048'),'pbq').revisionId,selected.find(r=>r.questionId==='p048').capturedTrustedRevisionId);
assert.deepEqual(p.privateBoundary,census.privateBoundary);assert.equal(p.privateBoundary.selectedSourceRevision,pkg.privateRevisionProcessing.sourceSignature);assert.equal(p.privateBoundary.trustedRevisionId,null);for(const k of ['payloadAvailable','sourceReadRefreshed','localFallbackMaySubstitute'])assert.equal(p.privateBoundary[k],false);
const table=report.split('\n').filter(line=>/^\| [mp]\d{3} \| \d\.\d \|/.test(line));assert.equal(table.length,8);for(const r of selected)assert(table.includes(`| ${r.questionId} | ${r.originalObjective} | \`${r.localRevision}\` | \`${r.capturedPublishedRevision}\` | ${reused.includes(r.questionId)?'reuse objective-5.2 row':'additional broad proposal'} |`));
for(const text of [hash(packetPath),p.status,'8/111','8/483','Six additional broad mapping rows','not a personal human review','NOT READY'])assert(report.includes(text),'Report missing '+text);
assert.equal(p.remainingGaps.length,5);const manifest=read('docs/evidence/phase-2b5/release-checksums.json');for(const [f,h] of Object.entries(manifest.files))assert.equal(hash(f),h,f+' active artifact changed');
for(const root of ['src','api','server'])for(const f of readdirSync(root,{recursive:true}).filter(f=>/\.(jsx?|mjs)$/.test(f)))assert(!readFileSync(root+'/'+f,'utf8').includes('phase-2b5-recovery-overlap-semantic'),'Runtime imported proposal');
console.log(JSON.stringify({status:'PASS_LOCAL_RECOVERY_OVERLAP_PROPOSALS_NOT_READY',packetSha256:hash(packetPath),reportSha256:hash(reportPath),auditSha256:hash('scripts/audit-recovery-overlap-semantic.mjs'),selected:8,reusedFullProposals:2,additionalProposals:6,newDirectPilotRoles:0,additionalSupportLinks:2,unsupportedMixedPbqs:2,newQuestions:0,newFamilyCredit:0,eligibleEvidence:0,activeFilesUnchanged:Object.keys(manifest.files).length}));
