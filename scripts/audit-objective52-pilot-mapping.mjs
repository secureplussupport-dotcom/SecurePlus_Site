import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {SY0701_ACRONYM_CARDS} from '../src/data/sy0701AcronymFlashcards.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';
import {QUESTION_MAPPINGS} from '../src/data/learningMappings.js';
import {readGlossary} from './lib/content-mapping/delivery-inventory.mjs';
const packetPath='docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json';
const reportPath='docs/phase-2b5-objective52-pilot-mapping-review.md';
const evidencePath='docs/evidence/phase-2b5/objective52-pilot-mapping-validation.json';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const packet=JSON.parse(readFileSync(packetPath)),pkg=JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json'));
const bank=readLearningPilotBank(),byId=new Map([...bank.mcqs,...bank.pbqs].map(q=>[q.id,q]));
assert.equal(hash('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.equal(contentSignature(bank),'sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391');
assert.equal(packet.baselineCommit,'2044c4e9b2b8478ddefd02920ea6d4e47a66365f');
assert.equal(packet.status,'LOCAL_SEMANTIC_PROPOSALS_NOT_READY');
for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(packet[k],false);
assert.equal(packet.masteryWeight,0);
const direct=QUESTION_MAPPINGS.filter(m=>m.format==='mcq');
function validateQuestion(row){
 const q=byId.get(row.questionId),r=pkg.records.find(r=>r.id===row.recordId);assert(q&&r,'Unknown effective question');
 assert.equal(row.sourceRevision,contentSignature(q),'Stale source revision');assert.equal(row.sourceRevision,r.localRevisionSignature,'Package local revision mismatch');
 assert.equal(row.publishedRecordSignature,r.sourceSignature,'Published signature mismatch');
 assert.equal(row.objectiveObserved,q.objective);assert.equal(row.domainObserved,q.ch);assert.equal(row.difficultyObserved,q.difficulty);
 assert.equal(row.humanApproved,false);assert.equal(row.masteryWeight,0);assert.equal(row.newFamilyCredit,0);assert.deepEqual(row.secondaryConceptProposals,[]);
 assert.equal(row.familyReviewStatus,'agent_comparison_pending_independent_gate');assert(row.skillDescription.length>15&&row.rationale.length>40);
 if(row.disposition==='direct_pilot_proposal'){
  const reviewed=direct.find(m=>m.questionId===q.id);assert(reviewed,'No keyword-only pilot promotion');
  assert.equal(row.kind,'mcq');assert.equal(row.primaryConceptProposal,reviewed.primaryConceptId);assert.equal(row.familyLabelProposal,reviewed.scenarioFamily);
  assert.equal(row.objectiveScopeProposal,q.id==='m196'?'supporting_context_not_explicit_bullet':'explicit_bia_bullet');
  assert.deepEqual(row.supportConceptProposals,[]);
 }else{
  assert.equal(row.primaryConceptProposal,null,'No coarse/context primary attribution');assert.equal(row.objectiveScopeProposal,null);
  if(row.disposition==='coarse_context_only')assert(['p048','p211'].includes(q.id));
  else {assert.equal(row.disposition,'outside_five_pilot_concepts');assert.deepEqual(row.supportConceptProposals,[]);}
 }
 const old=QUESTION_MAPPINGS.find(m=>m.questionId===q.id);
 assert.deepEqual(row.existingPilotMapping,old?{sourceRevision:old.questionRevision,primaryConceptId:old.primaryConceptId,secondaryConceptIds:old.secondaryConceptIds,evidencePrecision:old.evidencePrecision,scenarioFamily:old.scenarioFamily}:null);
}
assert.equal(packet.questionProposals.length,28);assert.equal(new Set(packet.questionProposals.map(r=>r.questionId)).size,28);
const expected=[...bank.mcqs.filter(q=>q.objective==='5.2'),...bank.pbqs.filter(q=>q.objective==='5.2'||q.id==='p211')].map(q=>q.id).sort();
assert.deepEqual(packet.questionProposals.map(r=>r.questionId).sort(),expected);
for(const row of packet.questionProposals)validateQuestion(row);
const row=id=>packet.questionProposals.find(r=>r.questionId===id);
assert.throws(()=>validateQuestion({...row('m029'),disposition:'direct_pilot_proposal',primaryConceptProposal:'continuity.bia'}),/keyword-only/);
assert.throws(()=>validateQuestion({...row('p211'),primaryConceptProposal:'recovery.rto'}),/coarse\/context/);
assert.throws(()=>validateQuestion({...row('m032'),sourceRevision:'sha256:'+'0'.repeat(64)}),/Stale source/);
assert.throws(()=>validateQuestion({...row('m196'),objectiveScopeProposal:'explicit_bia_bullet'}));
assert.throws(()=>validateQuestion({...row('m032'),secondaryConceptProposals:['recovery.rpo']}));
assert.deepEqual(row('p048').supportConceptProposals,['recovery.rto','continuity.bia']);assert.deepEqual(row('p211').supportConceptProposals,['recovery.rto','recovery.rpo']);
for(const ids of [['m032','m635'],['m031','m604'],['m029','m189','m373'],['m081','m651'],['m188','m733'],['m087','m655'],['p011','p029']])assert.equal(new Set(ids.map(id=>row(id).familyLabelProposal)).size,1,'Word/number/format substitution cannot inflate family counts');
const explanations=q=>({exp:q.exp,explanation:q.explanation,wrongFeedback:q.wrongFeedback,optionFeedback:q.optionFeedback,items:q.items,blanks:q.blanks,selectionFeedback:q.selectionFeedback});
const glossary=readGlossary();
const sources=new Map([...SY0701_ACRONYM_CARDS.map(c=>['flashcard:'+c.id,c]),...bank.mcqs.map(q=>['explanation:mcq:'+q.id,explanations(q)]),...Object.entries(glossary.terms).map(([term,definition])=>['glossary:'+encodeURIComponent(term.toLowerCase()),{term,definition}]),...CONCEPT_DEEP_DIVES.flatMap(d=>[['keywords:'+d.id,getSy0701DeepDiveProfile(d).keywordGuide],...d.sections.map((s,i)=>['section:'+d.id+':'+i,s])])]);
assert.equal(packet.instructionalProposals.length,19);
for(const link of packet.instructionalProposals){
 const value=sources.get(link.recordId),record=pkg.records.find(r=>r.id===link.recordId);assert(value&&record);
 assert.equal(link.sourceRevision,contentSignature(value));assert.equal(link.sourceRevision,record.sourceSignature);
 assert.equal(link.humanApproved,false);assert.equal(link.masteryWeight,0);assert.equal(link.objectiveCodesProposal,null);assert.deepEqual(link.objectiveCodesObserved,record.objectiveCodes);
 if(link.subunit){assert(Array.isArray(value));const term=value.find(v=>v.term===link.subunit.term);assert(term);assert.equal(contentSignature(term),link.subunit.sourceRevision,'Stale instructional subunit');}
}
const mttr=packet.instructionalProposals.find(r=>r.recordId==='glossary:mttr');assert.deepEqual(mttr.conceptLinkProposals,[]);assert.equal(mttr.mappingReviewStatus,'unresolved_definition_boundary');
assert.equal(packet.privateBoundary.primaryConceptProposal,null);assert.deepEqual(packet.privateBoundary.secondaryConceptProposals,[]);assert.equal(packet.privateBoundary.trustedRevisionId,null);
assert.equal(packet.privateBoundary.sourceRevision,pkg.records.find(r=>r.id==='private:pbq:p017').sourceSignature);
assert.notEqual(row('p017').sourceRevision,packet.privateBoundary.sourceRevision);
for(const draft of packet.draftComparisons)assert.equal(hash(draft.path),draft.sha256,'Changed draft comparison');
for(const root of ['src','api','server'])for(const p of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+p,'utf8').includes('phase-2b5-objective52-pilot-mapping-proposals'),'Runtime proposal import');
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [p,h] of Object.entries(manifest.files))assert.equal(hash(p),h,p+' active file changed');
const counts={objective52Mcqs:21,objective52Pbqs:6,additionalPbqs:1,reviewedQuestionRevisions:28,directPilotProposals:packet.questionProposals.filter(r=>r.disposition==='direct_pilot_proposal').length,coarseContextOnly:packet.questionProposals.filter(r=>r.disposition==='coarse_context_only').length,outsidePilot:packet.questionProposals.filter(r=>r.disposition==='outside_five_pilot_concepts').length,instructionalUnits:19,instructionalRecords:new Set(packet.instructionalProposals.map(r=>r.recordId)).size,unresolvedInstructionalUnits:1,unreviewablePrivateRevisions:1,eligibleNewEvidence:0};
assert.equal(counts.directPilotProposals,5);assert.equal(counts.coarseContextOnly,2);assert.equal(counts.outsidePilot,21);
const coverage=['recovery.rto','recovery.rpo','recovery.mtd','recovery.mttr','continuity.bia'].map(conceptId=>{const rows=packet.questionProposals.filter(r=>r.primaryConceptProposal===conceptId);return {conceptId,directMcqs:rows.map(r=>r.questionId),observedDifficultyCounts:Object.fromEntries(['easy','medium','hard'].map(d=>[d,rows.filter(r=>r.difficultyObserved===d).length])),existingReasoningFamilies:new Set(rows.map(r=>r.familyLabelProposal)).size,humanApprovedBankFamilies:0,activeDirectComponentPbqs:0,eligibleDrafts:0};});
const evidence={status:'PASS_BOUND_LOCAL_SEMANTIC_PROPOSALS_NOT_APPROVAL',date:packet.date,baselineCommit:packet.baselineCommit,counts,coverage,bankSignature:contentSignature(bank),checks:{fullObjective52Selection:'all 21 MCQs and 6 PBQs plus p211',keywordOnlyPromotion:'ALE to BIA rejected',coarseAttribution:'p211 direct primary rejected',scope:'MTD explicit-bullet claim rejected',secondary:'RTO contrast does not create RPO evidence',revisions:'local/published signatures separate; stale and draft changes rejected',activeArtifacts:'all release files unchanged'},limitations:['Semantics are agent-reviewed proposals, not human approval or calibrated competence.','Private p017 selected revision unreviewable; fallback cannot substitute.','MTTR glossary withheld for definition-boundary review.','No active mappings, evidence weights, publication or runtime changed.'],sha256:Object.fromEntries([packetPath,reportPath,'scripts/audit-objective52-pilot-mapping.mjs','docs/evidence/phase-2b5/mapping-package.json'].map(p=>[p,hash(p)]))};
const output=JSON.stringify(evidence,null,2)+'\n';
if(process.argv.includes('--write'))writeFileSync(evidencePath,output);else assert.equal(readFileSync(evidencePath,'utf8'),output,'Stale mapping-slice evidence');
console.log(JSON.stringify({status:evidence.status,counts,packetSha256:hash(packetPath)}));
