import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {readGlossary,readSelectors,sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
import {SY0701_ACRONYM_CARDS,SY0701_ACRONYM_SETS,groupSy0701AcronymSetsByChapter} from '../src/data/sy0701AcronymFlashcards.js';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';
const packetPath='docs/drafts/phase-2b5-objective11-support-mapping-proposals.json',reportPath='docs/phase-2b5-objective11-support-mapping-review.md';
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const p=JSON.parse(readFileSync(packetPath)),pkg=JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json'));
const prior=JSON.parse(readFileSync('docs/drafts/phase-2b5-objective11-controls-mapping-proposals.json'));
const g=readGlossary(),bank=readLearningPilotBank(),deck=SY0701_ACRONYM_SETS.find(s=>s.id==='security-principles-access-models');
const records=new Map(pkg.records.map(r=>[r.id,r])),concepts=new Map(pkg.concepts.map(c=>[c.id,c]));
assert.equal(p.baselineCommit,'79f0176d37133ef34baa7445934cc442815ac238');assert.equal(p.status,'LOCAL_SEMANTIC_PROPOSALS_NOT_READY');
assert.equal(hash('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.equal(hash('docs/drafts/phase-2b5-objective11-controls-mapping-proposals.json'),'0ba95c5c8f8a00e091daa9d852de0350a01ca00bedcba7c317155ea94cad88a9');
assert.equal(contentSignature(bank),p.bankSignature);
for(const key of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(p[key],false);
assert.equal(p.masteryWeight,0);assert.equal(p.newFamilyCredit,0);
for(const s of p.sourceBindings)assert.equal(hash(s.path),s.sha256,'Source binding drift: '+s.path);
assert(!/"(?:q|question|prompt|clue|options|opts|answer|correct|wrongFeedback|optionFeedback|selectionFeedback|explanation|exp|payload|learnerId|email)"\s*:/.test(JSON.stringify(p)),'No authored/graded/private payload fields in review export');
const rows=p.instructionalProposals,cards=rows.filter(r=>r.kind==='flashcard'),definitions=rows.filter(r=>r.kind==='glossary_definition'),containers=rows.filter(r=>r.kind==='deck_container');
assert.equal(cards.length,9);assert.equal(definitions.length,14);assert.equal(containers.length,1);assert.equal(rows.length,24);
assert.deepEqual(rows.map(r=>r.recordId).sort(),prior.remainingObjective11RecordIds);
const selected=new Set(rows.map(r=>r.recordId));assert.equal(selected.size,24);
const old=[...prior.questionProposals,...prior.explanationProposals,...prior.instructionalProposals].map(r=>r.recordId);
assert(old.every(id=>!selected.has(id)),'Prior slice overlap cannot inflate coverage');
const combined=[...old,...selected];assert.equal(combined.length,69);assert.equal(new Set(combined).size,69);
assert.deepEqual(combined.sort(),pkg.records.filter(r=>r.objectiveCodes.includes('1.1')).map(r=>r.id).sort());
function validateRole(row){
 const r=records.get(row.recordId);assert(r);assert.equal(row.kind,r.kind);assert.equal(row.sourceRevision,r.sourceSignature);
 assert.deepEqual(row.objectiveCodesObserved,r.objectiveCodes);assert.equal(row.existingPrimarySupportCandidate,r.primaryConceptId);
 assert.equal(row.primaryConceptProposal,null,'No instructional primary mastery');assert.deepEqual(row.secondaryConceptProposals,[]);
 for(const key of ['masteryWeight','newFamilyCredit'])assert.equal(row[key],0,'No exposure or recall credit');
 for(const key of ['humanApproved','published','independentEvidence'])assert.equal(row[key],false);assert.equal(row.trustedRevisionId,null,'No fabricated instructional trusted revision');
 for(const c of row.conceptLinkProposals){assert.equal(concepts.get(c.conceptId)?.nodeKind,'supporting_concept','Use existing support identities only');assert.equal(c.role,'instructional_support');assert.equal(c.weight,0);}
 for(const id of row.withheldCanonicalCandidates)assert.equal(concepts.get(id)?.nodeKind,'supporting_concept');
 if(row.withheldCanonicalCandidates.length)assert.deepEqual(row.conceptLinkProposals,[],'Ambiguous identity must stay withheld');
 for(const code of [...row.objectiveScopeProposal.instructionalCodes,...row.objectiveScopeProposal.contextCodes])assert.equal(concepts.get('sy0701.objective.'+code)?.nodeKind,'topic');
 assert(row.meaningProposal.length>20&&row.postMissUsefulnessProposal.rationale.length>35);
}
rows.forEach(validateRole);
const card=term=>cards.find(r=>r.termObserved===term),definition=term=>definitions.find(r=>r.termObserved===term);
assert.throws(()=>validateRole({...card('AAA'),masteryWeight:1}),/recall credit/);
assert.throws(()=>validateRole({...card('ACL'),primaryConceptProposal:'sy0701.term.acl'}),/primary mastery/);
assert.throws(()=>validateRole({...definition('SIEM'),conceptLinkProposals:[{conceptId:'sy0701.objective.1.1',role:'instructional_support',weight:0}]}),/support identities/);
assert.throws(()=>validateRole({...card('CIA'),conceptLinkProposals:[{conceptId:'sy0701.term.cia',role:'instructional_support',weight:0}]}),/Ambiguous identity/);
for(const row of cards){
 const flat=SY0701_ACRONYM_CARDS.find(c=>'flashcard:'+c.id===row.recordId),raw=deck.cards.find(c=>c.id===flat?.id);assert(flat&&raw);
 assert.equal(row.sourceRevision,contentSignature(flat));assert.equal(row.catalogueCardRevision,contentSignature(flat));assert.equal(row.deliveredCardRevision,contentSignature(raw));
 assert.equal(row.parentDeckRecordId,'deck:'+deck.id);assert.equal(row.deliveryBinding,'flashcard-study-pass');
 assert.deepEqual(row.availableModes,['definition','acronym']);assert.equal(row.exampleModeAvailable,false);assert(!raw.example);
 assert.equal(row.familyRelation,'same_authored_card_across_modes_shuffle_and_reuse_not_new_evidence');
}
const modes=sourceUnit('src/App.jsx','const flashcardSetType=','function FlashcardModeCipher(');
const safeMode=Function(modes.code+';return getSafeFlashcardMode;')();assert.equal(safeMode('example',false,'acronym'),'definition');assert.equal(safeMode('acronym',false,'acronym'),'acronym');
const reader=sourceUnit('src/App.jsx','  const getEntry=term=>{','  const splitGlossaryParts=');
const getEntry=Function('GLOSSARY_TERMS',reader.code+';return getEntry;')(g.terms);
const fieldValue=(q,group)=>({stem:q.q,options:q.opts,explanation:q.exp,wrong_option_feedback:q.wrongFeedback})[group];
const matches=(term,value)=>Array.isArray(value)?value.some(v=>g.matchTerms(v).includes(term)):value&&typeof value==='object'?Object.values(value).some(v=>g.matchTerms(v).includes(term)):g.matchTerms(value).includes(term);
function validateSurface(row,example=row.verifiedSurfaceExample){
 const q=bank.mcqs.find(q=>'mcq:'+q.id===example.parentRecordId);assert(q,'Missing probe parent');
 assert.equal(example.parentLocalRevision,contentSignature(q),'Stale probe parent');assert.equal(example.rendererBinding,'mcq-renderer');
 const value=fieldValue(q,example.fieldGroup);assert(value,'Only rendered prose field groups, no metadata');
 assert.equal(example.fieldGroupRevision,contentSignature(value),'Stale probe field');assert(matches(row.termObserved,value),'No matching delivered prose');
 assert.equal(example.gate,['explanation','wrong_option_feedback'].includes(example.fieldGroup)?'submission_and_feedback_access_gate':'selected_question_and_rendered_text');
 assert.equal(example.scope,'delivery_probe_only_not_semantic_review_of_parent');
}
for(const row of definitions){
 const r=records.get(row.recordId),term=row.termObserved,value=g.terms[term];assert(value);
 assert.equal(row.sourceRevision,contentSignature({term,definition:value}));assert.equal(row.definitionRevision,contentSignature(value));assert.equal(row.definitionRevision,r.definitionSignature);
 assert.deepEqual(row.definitionSource,g.definitionLocations[term]);assert.equal(row.definitionShape,typeof value);
 assert.equal(row.sourceReferenceCount,r.usageReferences.length);assert.equal(row.sourceReferencesAreDeliveryProof,false);
 assert.equal(row.publicationStatusObserved,'available_conditional');assert.equal(row.deliveryBinding,'glossary-delivery');
 const rendered=getEntry(term);assert(rendered.definition.length>15);assert.equal(rendered.definition,typeof value==='string'?value:value.definition);
 validateSurface(row);
}
const wafQuestion=bank.mcqs.find(q=>q.id==='m402');
assert.equal(definitions.filter(r=>r.definitionShape==='object').length,12);assert.equal(definitions.filter(r=>r.definitionShape==='string').length,2);
assert(records.get('glossary:waf').usageReferences.some(r=>r.recordId==='mcq:m402'));
assert(!['stem','options','explanation','wrong_option_feedback'].some(group=>matches('WAF',fieldValue(wafQuestion,group))),'m402 WAF metadata cannot become tooltip delivery');
assert.throws(()=>validateSurface(definition('WAF'),{...definition('WAF').verifiedSurfaceExample,parentRecordId:'mcq:m402',parentLocalRevision:contentSignature(wafQuestion),fieldGroup:'stem',fieldGroupRevision:contentSignature(wafQuestion.q)}),/No matching delivered prose/);
assert.throws(()=>validateSurface(definition('MAC'),{...definition('MAC').verifiedSurfaceExample,fieldGroup:'cat'}),/Only rendered prose/);
const container=containers[0];assert.equal(container.sourceRevision,contentSignature(deck));assert.deepEqual(container.conceptLinkProposals,[]);
assert.deepEqual(container.childRecordIds,deck.cards.map(c=>'flashcard:'+c.id));assert.equal(container.roleProposal,'navigation_container_overlapping_nine_cards');
assert.equal(container.mobileQuickStartObserved,groupSy0701AcronymSetsByChapter().flatMap(g=>g.sets).slice(0,3).some(s=>s.id===deck.id));
const relatedUnit=sourceUnit('src/App.jsx','const getFlashcardRelatedDeepDives =','const FlashcardSocialIcon =');
const tokenUnit=sourceUnit('src/App.jsx','const tokenizeLearningText =','const buildCipherWeakFlashcardSet =');
const related=Function('CONCEPT_DEEP_DIVES','getSy0701DeepDiveProfile','STARRED_FLASHCARD_SET_ID',tokenUnit.code+relatedUnit.code+';return getFlashcardRelatedDeepDives;')(CONCEPT_DEEP_DIVES,getSy0701DeepDiveProfile,'__audit_starred__');
assert.deepEqual(container.relatedLessonIdsObserved,related(deck).map(d=>d.id));
const selectors=new Map(readSelectors().map(s=>['intervention:'+s.id,s]));assert.equal(p.selectorBindings.length,8);
for(const s of p.selectorBindings){assert.equal(s.sourceRevision,selectors.get(s.id)?.sourceSignature);assert.equal(s.sourceRevision,records.get(s.id).sourceSignature);}
for(const b of p.deliveryBindings)assert.deepEqual(sourceUnit(b.path,b.anchor,b.endAnchor).provenance,(({id,...provenance})=>provenance)(b));
assert(!sourceUnit('src/App.jsx','function AcronymFlashcardLab(','function DeepDiveReadableBites(').code.includes('GlossaryText'),'Card face source is not inline glossary delivery');
for(const r of [card('CIA'),definition('CIA'),card('MAC'),definition('MAC'),card('RBAC-role'),card('RBAC-rule'),definition('RBAC'),card('TOU')])assert(r.withheldCanonicalCandidates.length>0);
assert.notEqual(card('RBAC-role').meaningProposal,card('RBAC-rule').meaningProposal);assert.notEqual(card('RBAC-role').deliveredCardRevision,card('RBAC-rule').deliveredCardRevision);
assert.deepEqual(card('TOU').objectiveScopeProposal.instructionalCodes,['4.6']);assert(!card('TOU').objectiveScopeProposal.contextCodes.includes('2.3'));
assert.deepEqual(card('AAA').objectiveScopeProposal.instructionalCodes,['1.2']);assert.deepEqual(definition('Zero Trust').objectiveScopeProposal.instructionalCodes,['1.2']);
assert.deepEqual(definition('CCTV').objectiveScopeProposal.instructionalCodes,['1.1','1.2']);assert.deepEqual(definition('WAF').objectiveScopeProposal.instructionalCodes,['3.2']);
assert.equal(rows.filter(r=>r.withheldCanonicalCandidates.length).length,8);assert.equal(rows.filter(r=>r.conceptLinkProposals.length).length,15);
assert.equal(p.ambiguityBoundary.withheldInstructionalIdentities,8);assert.equal(p.ambiguityBoundary.proposedSupportLinkedRecords,15);
assert.equal(p.overlapGroups.length,7);for(const o of p.overlapGroups){assert(o.recordIds.length>=2);assert(o.recordIds.every(id=>selected.has(id)));}
assert.equal(p.denominator.authoredInstructionalRecordsExcludingContainer,23);assert.equal(p.denominator.combinedDistinctObjective11Candidates,69);assert.equal(p.denominator.remainingObjective11CandidatesWithoutAnAgentProposal,0);assert.equal(p.denominator.remainingPackageRecordsOutsideCombinedSlices,pkg.records.length-combined.length);
assert.equal(p.phaseWideBacklog.packageRecordsUnchanged,pkg.counts.records);assert.equal(p.phaseWideBacklog.reviewQueueUnchanged,pkg.counts.reviewQueue);assert.equal(p.phaseWideBacklog.unresolvedQuestionMappingsUnchanged,pkg.counts.unresolvedQuestionMappings);assert.equal(p.phaseWideBacklog.existingPrimaryQuestionProposalsUnchanged,pkg.counts.primaryQuestionProposals);
for(const [kind,key]of [['mastery_concept','masteryConcepts'],['topic','topics'],['supporting_concept','supportingConcepts']])assert.equal(p.phaseWideBacklog.taxonomyUnchanged[key],pkg.concepts.filter(c=>c.nodeKind===kind).length);
assert.equal(p.privateBoundary.sourceRevision,records.get('private:pbq:p017').sourceSignature);assert.equal(p.privateBoundary.trustedRevisionId,null);assert.equal(p.privateBoundary.payloadReviewed,false);assert.equal(p.privateBoundary.masteryWeight,0);
assert.equal(p.humanDecisionReferences.humanApprovalRequestedThisTurn,false);assert.equal(p.phaseWideBacklog.humanApprovedNewMappings,0);
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [path,sha]of Object.entries(manifest.files))assert.equal(hash(path),sha,'Active release file changed: '+path);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-objective11-support-mapping-proposals'),'Runtime proposal import');
console.log(JSON.stringify({status:'PASS_BOUND_OFFLINE_SUPPORT_PROPOSALS_NOT_APPROVAL',counts:{newRecords:24,cards:9,definitions:14,containers:1,ambiguousIdentityRecords:8,supportLinkedRecords:15,combinedDistinctObjective11Candidates:69,approvedNewMappings:0,eligibleNewEvidence:0,queueUnchanged:2954,unresolvedQuestionMappingsUnchanged:489},sha256:Object.fromEntries([packetPath,reportPath,'scripts/audit-objective11-support-mapping.mjs'].map(path=>[path,hash(path)]))}));
