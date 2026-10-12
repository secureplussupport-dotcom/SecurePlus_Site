import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
import {SY0701_ACRONYM_SETS,SY0701_ACRONYM_CARDS,SY0701_ACRONYM_SOURCE,groupSy0701AcronymSetsByChapter} from '../src/data/sy0701AcronymFlashcards.js';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';

const scriptPath='scripts/audit-cloud-endpoint-remaining-cards.mjs',packetPath='docs/drafts/phase-2b5-cloud-endpoint-remaining-cards-proposals.json',reportPath='docs/phase-2b5-cloud-endpoint-remaining-cards-review.md';
const basePath='docs/drafts/phase-2b5-cloud-endpoint-first-cards-proposals.json',baseReport='docs/phase-2b5-cloud-endpoint-first-cards-review.md',baseAudit='scripts/audit-cloud-endpoint-first-cards.mjs';
assert.equal(hashFile(basePath),'ef191a8f9561eceb27ae554363fd301e33dfa77610248c53d01fb7e7fbfe33a3');
assert.equal(hashFile(baseReport),'f5aa7c008a6c07a32b5cf16bfa67d896540b763ac8ea9c8ec1c8efddd87339fa');
assert.equal(hashFile(baseAudit),'0ce955270f85daea801a962027c78753468e0f0599df6d60cf3dec7b5b33bc82');
const base=readJson(basePath),c=readReviewTriage();verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const priorCensus=new Map(base.catalogueCensus.map(r=>[r.recordId,r])),priorRemaining=new Set(base.remainingCatalogueRecordIds);
assert.equal(priorCensus.size,1878);assert.equal(priorRemaining.size,486);
const previous=new Set(c.pkg.records.filter(r=>!priorRemaining.has(r.id)).map(r=>r.id));assert.equal(previous.size,1392);
for(const r of c.pkg.records){const old=priorCensus.get(r.id);assert(old);assert.equal(old.sourceRevision,r.sourceSignature);assert.equal(old.kind,r.kind);assert.equal(previous.has(r.id),['prior_agent_disposition_pending_owner','new_card_proposal_pending_owner','new_partial_deck_proposal_pending_owner','new_glossary_proposal_pending_owner','new_teaching_proposal_pending_owner'].includes(old.status));}
// Reuse the immutable preceding census; reconcile its credited identities against the actual bound disposition arrays.
const inventory=[...base.allPacketReconciliation.inventory,{path:basePath,sha256:hashFile(basePath),substantiveRows:base.questionProposals.length+base.explanationProposals.length+base.instructionalProposals.length}].sort((a,b)=>a.path.localeCompare(b.path));
assert.equal(inventory.length,95);const actualInventory=readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')&&'docs/drafts/'+n!==packetPath).map(n=>'docs/drafts/'+n).filter(path=>['instructionalProposals','questionProposals','explanationProposals'].some(k=>Array.isArray(readJson(path)[k]))).sort();
assert.deepEqual(actualInventory,inventory.map(r=>r.path).sort());
const fullReferences=new Set(),instructionalOccurrences=[];
for(const entry of inventory){assert.equal(hashFile(entry.path),entry.sha256);const p=readJson(entry.path);verifySourceBindings(Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256})));const rows=['questionProposals','explanationProposals','instructionalProposals'].flatMap(k=>p[k]||[]);assert.equal(rows.length,entry.substantiveRows);
 for(const row of rows){const r=c.records.get(row.recordId);assert(r);assert.equal(row.publishedRecordSignature??row.sourceRevision,r.sourceSignature);if(previous.has(r.id))fullReferences.add(r.id);}
 for(const row of p.instructionalProposals||[])instructionalOccurrences.push(row.recordId);
}
assert.deepEqual([...fullReferences].sort(),[...previous].sort());assert.equal(instructionalOccurrences.length,510);assert.equal(new Set(instructionalOccurrences).size,502);
const deckIds=['cloud-endpoint-infrastructure'];
const selectedTerms=['MAC','MDM','ML','OS','OT / ICS','PDU / UPS','SASE','SCADA','SDK','SDLC / SDLM','SELinux','SED','SEH','SoC','UEM','VM'];
const groups=deckIds.map(id=>{const deck=SY0701_ACRONYM_SETS.find(d=>d.id===id);assert(deck);const raw=deck.cards.slice(16,32),flat=raw.map(raw=>SY0701_ACRONYM_CARDS.find(card=>card.id===raw.id));assert(flat.every(Boolean));assert.deepEqual(raw.map(card=>card.acronym),selectedTerms);return{deck,raw,flat};});
assert.deepEqual(groups.map(g=>g.deck.cards.length),[32]);assert.deepEqual(groups.map(g=>g.deck.objectiveCodes),[['3.1','3.3','3.4']]);
const values=new Map(groups.flatMap(g=>g.flat.map(card=>['flashcard:'+card.id,card]))),candidateRecordIds=[...values.keys()];assert.equal(values.size,16);
const censusSelection=base.objectiveCoverage['3.1'].census.filter(r=>r.status==='inventory_only_unreviewed'&&values.has(r.recordId));assert.equal(censusSelection.length,16);
assert.deepEqual(censusSelection.map(r=>r.recordId),[...candidateRecordIds].sort());assert(censusSelection.every(r=>base.objectiveCoverage['3.1'].remainingRecordIds.includes(r.recordId)));
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(kind=>[kind,rows.filter(r=>r.kind===kind).length]));assert.deepEqual(counts(censusSelection),{flashcard:16});
for(const[id,v]of values){const r=c.records.get(id);assert.equal(sig(v),r.sourceSignature,id);assert.equal(r.trustedRevisionId,null);assert(!previous.has(id));}
const unit=(a,b)=>sourceUnit('src/App.jsx',a,b),modeUnit=unit('const flashcardSetType=','function FlashcardModeCipher('),navUnit=unit('function FlashcardsPage(','function ObjectivesPage('),labUnit=unit('function AcronymFlashcardLab(','function DeepDiveReadableBites('),chooserUnit=unit('function FlashcardModeChooser(','function AcronymFlashcardLab('),tokenUnit=unit('const tokenizeLearningText =','const buildCipherWeakFlashcardSet ='),relatedUnit=unit('const getFlashcardRelatedDeepDives =','const FlashcardSocialIcon ='),randomUnits=[unit('const RANDOM_FLASHCARD_COUNTS =','async function saveFlashcardReviewAuthIntent('),unit('const buildRandomFlashcardSet =','const readSavedRandomFlashcardSets =')],starredUnit=unit('const getStarredFlashcards =','const getFlashcardStarKeys ='),weakUnit=unit('const buildCipherWeakFlashcardSet =','const buildCipherStarterFlashcardSet =');
const safeMode=Function(modeUnit.code+';return getSafeFlashcardMode;')(),nav=navUnit.code,lab=labUnit.code;
for(const marker of ['savedRandomSets.find(set=>set.id===selectedSetId) || SY0701_ACRONYM_SETS.find','visibleGroups.flatMap(group=>group.sets).slice(0,3)','const shouldChooseMode=!signedIn || hasExample || !safeDefault','AcronymFlashcardLab acronymSet={selectedSet}','if(canSyncFlashcards)saveSupabaseFlashcardProgress','secureplus-acronym-mastered','user?.tier==="pro"&&Boolean(assistantSet?.cards?.length)','{signedIn&&<section','const cardMap=new Map(SY0701_ACRONYM_CARDS.map(card=>[card.id,card]))','filter(Boolean).slice(0,30)'])assert(nav.includes(marker),marker);
const open=nav.slice(nav.indexOf('  const openSet='),nav.indexOf('  const startSomewhere='));assert(!open.includes('onRequireSignup')&&!open.includes('onUpgrade')&&!open.includes('user.tier'));
assert(chooserUnit.code.includes('? [FLASHCARD_MODE_OPTIONS.definition]'));assert(!lab.includes('GlossaryText'));
for(const marker of ['onRate(activeCard.id,mastered)','nextRated.size>=studyCardCount','if(!user){','if(user.tier!=="pro"){','aria-pressed={isFlipped}','onClick={()=>rateCard(false)}','onClick={()=>rateCard(true)}','setCardOrder(acronymSet.cards.map(card=>card.id))'])assert(lab.includes(marker),marker);
// Execute existing pure expressions only; no React, learner state, storage or sync handlers run.
const faces=Function('activeCard','isDividerCard','asksFromExample','testsAcronym','setType',lab.slice(lab.indexOf('  const frontPrompt='),lab.indexOf('  const masteredCount='))+';return{frontText,answerMain,answerCopy};');
const completed=Function('activeCard','ratedCardsThisPass','studyCardCount',lab.slice(lab.indexOf('    const nextRated=new Set(ratedCardsThisPass);'),lab.indexOf('    setRatedCardsThisPass(nextRated);'))+';return completed;');
const faceProbes=groups.flatMap(g=>g.raw.map(raw=>({recordId:'flashcard:'+raw.id,modes:(g.deck.setType==='term'?['definition']:['definition','acronym']).map(mode=>{const f=faces(raw,false,false,mode==='acronym',g.deck.setType);assert.equal(f.frontText,mode==='acronym'?raw.acronym:raw.meaning);assert.equal(f.answerMain,mode==='acronym'||g.deck.setType==='term'?raw.expansion:`${raw.expansion} (${raw.acronym})`);assert.equal(f.answerCopy,mode==='acronym'||g.deck.setType==='term'?`Definition: ${raw.meaning}`:`Acronym: ${raw.acronym}. Definition: ${raw.meaning}`);return{mode,frontTextRevision:sig(f.frontText),backMainRevision:sig(f.answerMain),backCopyRevision:sig(f.answerCopy),graded:false};})})));
for(const g of groups){assert(g.deck.cards.every(c=>!c.example));assert.equal(safeMode('example',false,g.deck.setType),'definition');assert.equal(safeMode('acronym',false,g.deck.setType),'acronym');const last=g.raw.at(-1);assert.equal(completed(last,new Set(g.deck.cards.filter(c=>c.id!==last.id).map(c=>c.id)),32),true);assert.equal(completed(last,new Set(g.raw.map(c=>c.id)),32),false);assert.equal(completed(g.raw[0],new Set([g.raw[0].id]),32),false);}
const related=Function('CONCEPT_DEEP_DIVES','getSy0701DeepDiveProfile','STARRED_FLASHCARD_SET_ID',tokenUnit.code+relatedUnit.code+';return getFlashcardRelatedDeepDives;')(CONCEPT_DEEP_DIVES,getSy0701DeepDiveProfile,'__audit_starred__');
const helpers=Function('SY0701_ACRONYM_CARDS','SY0701_ACRONYM_SETS','RANDOM_FLASHCARD_SET_ID','SAVED_RANDOM_FLASHCARD_PREFIX','FLASHCARD_DEFINITION_NEXT_LABEL','FLASHCARD_ACRONYM_SECTION_LABEL','getSafeFlashcardMode',randomUnits.map(u=>u.code).join('\n')+';return{buildRandomFlashcardSet,hydrateSavedRandomFlashcardSets,getNextFlashcardSet};')(SY0701_ACRONYM_CARDS,SY0701_ACRONYM_SETS,'__audit_random__','__audit_saved__','__audit_terms__','__audit_acronyms__',safeMode);
const idList=cards=>cards.filter(c=>c.cardType!=='divider').map(c=>'flashcard:'+c.id);
const reuseProbes=groups.map((g,i)=>{const random=helpers.buildRandomFlashcardSet({count:10,sourceCards:g.flat,includeTerms:false,includeAcronyms:true,preserveOrder:true,color:'#000'}),restored=helpers.hydrateSavedRandomFlashcardSets([{id:'__audit_saved__'+i,title:'source-only fixture',cardIds:g.flat.map(c=>c.id),color:'#000',config:{mode:'definition',includeTerms:false,includeAcronyms:true}}])[0];assert.deepEqual(idList(random.cards),idList(g.flat.slice(0,10)));assert.deepEqual(idList(restored.cards),idList(g.flat));const lessons=related(g.deck).map(d=>{const id='lesson:'+d.id;assert.equal(sig({d,profile:getSy0701DeepDiveProfile(d)}),c.records.get(id).sourceSignature);return{recordId:id,sourceRevision:c.records.get(id).sourceSignature,previousDisposition:previous.has(id),semanticReviewHere:false};});return{deckRecordId:'deck:'+g.deck.id,syntheticRequestedCount:10,syntheticRandomRecordIds:idList(random.cards),syntheticHydratedRecordIds:idList(restored.cards),syntheticHydrationNormalizedTarget:20,hydratedBelowTargetBecauseFinitePool:true,relatedLessonReferences:lessons,nextDeckRecordId:'deck:'+helpers.getNextFlashcardSet(g.deck).id,approvedRemediation:false,newEvidence:0};});
assert.deepEqual(helpers.hydrateSavedRandomFlashcardSets([{cardIds:['not-current']}]),[]);
const starred=Function('SY0701_ACRONYM_CARDS','FLASHCARD_STAR_TYPE','starKey',starredUnit.code+';return getStarredFlashcards;')(SY0701_ACRONYM_CARDS,'flashcard',(type,id)=>type+':'+id),flatCards=groups.flatMap(g=>g.flat),allSelectedCards=new Set(flatCards.map(c=>c.id)),starredRecordIds=idList(starred([...flatCards].reverse().map(c=>'flashcard:'+c.id)));assert.deepEqual(starredRecordIds,idList(SY0701_ACRONYM_CARDS.filter(c=>allSelectedCards.has(c.id))));assert.deepEqual(starred(['flashcard:not-current']),[]);
const weak=Function('SY0701_ACRONYM_CARDS','CHAPTERS','ASSISTANT_FLASHCARD_SET_ID','tokenizeLearningText',weakUnit.code+';return buildCipherWeakFlashcardSet;')(SY0701_ACRONYM_CARDS,[{id:'3',title:'Security Architecture'}],'__audit_assistant__',Function(tokenUnit.code+';return tokenizeLearningText;')());
const weakProbes=['MDM','ML','SASE','SED','UEM','VM'].map(topic=>{const out=weak({weakChapterId:'3',weakTopics:[topic]});assert(out);return{syntheticTopic:topic,outputCount:out.cards.length,selectedIntersections:idList(out.cards).filter(id=>values.has(id)),outputIdentityRevision:sig(idList(out.cards)),coarseSelectorOnly:true,approvedRemediation:false,newEvidence:0};});assert.equal(weak({weakChapterId:'missing'}),null);
const selectorBindings=readSelectors().filter(s=>['flashcard-navigation','flashcard-study-pass','next-flashcard-deck','random-flashcards','related-flashcard-lessons','starred-flashcards','weak-area-deck','lesson-navigation'].includes(s.id)).map(s=>({recordId:'intervention:'+s.id,sourceRevision:s.sourceSignature,limitation:s.selector.mappingDependencies}));assert.equal(selectorBindings.length,8);for(const r of selectorBindings)assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);
const sourcePath='src/data/sy0701AcronymFlashcards.js',literalUnits=groups.map(g=>sourceUnit(sourcePath,'    '+JSON.stringify(g.deck.id)+',','  ),'));
const factoryUnits=[sourceUnit(sourcePath,'const makeCard =','export const SY0701_ACRONYM_SOURCE')];
const sourceChecks=candidateRecordIds.map(recordId=>{const r=c.records.get(recordId),g=groups.find(g=>recordId==='deck:'+g.deck.id||g.flat.some(card=>recordId==='flashcard:'+card.id)),isDeck=r.kind==='deck_container',raw=isDeck?g.deck:g.deck.cards.find(card=>recordId==='flashcard:'+card.id),anchor=isDeck?'    '+JSON.stringify(g.deck.id)+',':'      ['+JSON.stringify(raw.acronym)+', ',u=literalUnits[groups.indexOf(g)],offset=u.code.indexOf(anchor);assert(offset>=0);assert.equal(u.code.indexOf(anchor,offset+anchor.length),-1);const line=u.provenance.startLine+u.code.slice(0,offset).split('\n').length-1;assert(readFileSync(sourcePath,'utf8').split('\n')[line-1].includes(anchor));if(!isDeck)assert.notEqual(sig(raw),r.sourceSignature);assert.equal(r.parentId??null,null);if(!isDeck)assert.equal(values.get(recordId).setId,g.deck.id);return{recordId,kind:r.kind,parentRecordId:isDeck?null:'deck:'+g.deck.id,catalogueParentRecordIdObserved:null,sourceRevision:r.sourceSignature,publishedRecordSignature:r.sourceSignature,deliveredRevision:sig(raw),objectiveCodesObserved:r.objectiveCodes,precisionObserved:r.precision,trustedRevisionObserved:null,existingPrimarySupportCandidate:r.primaryConceptId,sourceOrderIndex:isDeck?SY0701_ACRONYM_SETS.indexOf(g.deck):g.deck.cards.indexOf(raw),termObserved:isDeck?g.deck.title:raw.acronym,sourceCitations:[{path:sourcePath,line,fileSha256:hashFile(sourcePath),anchorRevision:sig(anchor),parentUnitRevision:u.provenance.sourceSignature}],subunits:isDeck?g.deck.cards.map((card,index)=>({fieldPath:'cards['+index+']',recordId:'flashcard:'+card.id,sourceRevision:sig(card),reviewStatus:index<16?'selected_candidate':'membership_only_unreviewed_zero_credit'})):['acronym','expansion','meaning','topic','cardType'].map(field=>({fieldPath:field,sourceRevision:sig(raw[field]??null)})),sourcePrecedence:'local_factory_then_raw_deck_to_lab;flattened_catalogue_metadata_separate;no_question_override',exampleAvailable:false,contentInvented:false};});
const decisions={
 "MAC": [
  "Recognize the media-access-control address expansion but hold the complete address card.",
  "HOLD: calling every MAC a unique hardware address overstates permanent physical-device identity; the existing support identity also collides with Mandatory Access Control.",
  "Private/locally assigned addresses can change; duplication or spoofing cannot be excluded. No permanent identity, authenticated source, Mandatory Access Control equivalence or repaired catalogue identity."
 ],
 "MDM": [
  "Recognize tooling that manages mobile devices and applies organizational policies.",
  "Qualified as mobile-device management vocabulary, distinct from broader unified endpoint management and app-only management.",
  "Enrollment, platform permissions, ownership policy and configuration govern enforcement; no every-device coverage, lawful wipe authority or safe policy verdict."
 ],
 "ML": [
  "Recognize learning from data patterns as an AI approach.",
  "Qualified as introductory machine-learning vocabulary: improvement is a learning goal, not guaranteed accuracy or continual retraining.",
  "Not all AI is machine learning; data quality, distribution changes and model choices can degrade results. No intelligence, security, bias-free output or tested model capability."
 ],
 "OS": [
  "Recognize software managing hardware, applications, users, files and system resources.",
  "Qualified as operating-system vocabulary without asserting that resource management ensures a secure host.",
  "Patch state, configuration, permissions and applications remain separate; no kernel integrity, malware-free state or reliable isolation."
 ],
 "OT / ICS": [
  "Recognize the two expansions but hold the complete combined OT/ICS card.",
  "HOLD: the single industrial-process meaning does not distinguish broader operational technology from industrial control systems.",
  "OT also includes nonindustrial building, transport and physical access systems; ICS is a subset, and SCADA is an ICS form. No identity union or transferred SCADA approval."
 ],
 "PDU / UPS": [
  "Recognize the ordered contrast of power distribution versus backup-power equipment.",
  "Qualified as bounded introductory PDU/UPS vocabulary; the ordered expansion and meaning supply distribution versus backup distinctions.",
  "A PDU distributes an existing power source; a UPS supplies finite battery ride-through governed by load, charge and condition. No PDU battery backup, generator identity or indefinite uptime."
 ],
 "SASE": [
  "Recognize a cloud-delivered architecture combining network access and security controls.",
  "Qualified as architecture vocabulary, not automatic zero trust or a security outcome.",
  "Routing, identity, inspection, configuration and provider capabilities determine coverage; no every-path protection, universal inline inspection or guaranteed security."
 ],
 "SCADA": [
  "Recognize supervisory monitoring and control of physical processes as an industrial-control form.",
  "Qualified as introductory SCADA vocabulary, without equating SCADA with all ICS or OT.",
  "Supervisory control is distinct from every local control loop; no guaranteed actuator access, timing, safety, availability or complete industrial topology."
 ],
 "SDK": [
  "Recognize tools and libraries used to develop software for a platform.",
  "Qualified as development-kit vocabulary, distinct from an API interface contract.",
  "An SDK may include API clients, headers, tools or documentation; no SDK/API identity, safe dependencies, compatible version or secure resulting application."
 ],
 "SDLC / SDLM": [
  "Recognize the two expansions but hold the complete lifecycle/methodology card.",
  "HOLD: the shared process meaning does not distinguish a development lifecycle from a lifecycle methodology and implies security without explicit secure-development practices.",
  "Security practices must be integrated and verified; a lifecycle label or ordered stages alone do not establish secure software. No lifecycle/methodology union or transferred SDK approval."
 ],
 "SELinux": [
  "Recognize the Linux policy mechanism supporting additional access control.",
  "Qualified as mechanism vocabulary when appropriately configured and enforcing, not an unconditional stronger-policy outcome.",
  "Permissive mode logs without policy denial and disabled mode does not enforce SELinux policy; labels and rules matter. No full Linux hardening, all-process coverage or always stronger configuration."
 ],
 "SED": [
  "Recognize encryption implemented within the storage drive.",
  "Qualified as drive-feature vocabulary, without an automatic effective data-at-rest guarantee.",
  "Locking, authentication, key management and host integration remain necessary; an unlocked drive returns readable data. No protection of a compromised unlocked host, completed cryptographic erase or universal storage coverage."
 ],
 "SEH": [
  "Recognize Windows structured exception handling for program/system exceptions.",
  "Qualified as Windows exception-mechanism vocabulary, including hardware faults and software exceptions.",
  "Not security-event handling or SOC incident response, and not a portable-language exception identity. Handling an exception does not prove memory safety, successful recovery or secure execution."
 ],
 "SoC": [
  "Recognize a system-on-chip integrating multiple computing components into one integrated circuit.",
  "HOLD SUPPORT IDENTITY ONLY: the chip definition is clear, but its existing sy0701.term.soc support node also represents Security Operations Center.",
  "Do not label the learner definition incorrect. Pending owner identity disambiguation; no SOC operations equivalence, merged approval, invented replacement node or link credit."
 ],
 "UEM": [
  "Recognize centralized management across desktop, laptop, mobile and other endpoints.",
  "Qualified as broader endpoint-management vocabulary, distinct from the narrower mobile focus of MDM.",
  "Supported platforms, enrollment, permissions, telemetry and configuration govern coverage; no automatic patch compliance, perfect inventory or always-enforced policy."
 ],
 "VM": [
  "Recognize a software-based computer running on a physical or virtual host.",
  "Qualified as virtual-machine vocabulary, including nested virtualization, without a security-isolation guarantee.",
  "Hypervisor/host, guest, network and resource controls govern isolation; no container identity, cloud-only restriction, protected-host verdict or escape-proof boundary."
 ]
};
const heldCardTerms=['MAC','OT / ICS','SDLC / SDLM','SoC'],heldIds=sourceChecks.filter(r=>heldCardTerms.includes(r.termObserved)).map(r=>r.recordId),heldSet=new Set(heldIds),selectedRecordIds=candidateRecordIds.filter(id=>!heldSet.has(id)),selected=new Set(selectedRecordIds);assert.equal(heldIds.length,4);assert.equal(selected.size,12);
const commonLimits=['Observed objective tags are catalogue context, not precise assessed scope or owner approval.','No trusted revision, canonical role, learner evidence, independent family, verified recovery, publication or activation.'];
const semanticReviews=sourceChecks.map(r=>{const [teachingUnderstanding,contentQualification,limit]=decisions[r.termObserved];assert(teachingUnderstanding);return{recordId:r.recordId,sourceRevision:r.sourceRevision,definitionSemanticallyClear:r.termObserved==='SoC'||selected.has(r.recordId),identityLinkQualified:selected.has(r.recordId),semanticallyQualifiedAsBoundedDraft:selected.has(r.recordId),teachingUnderstanding,contentQualification,limits:[limit,...commonLimits]};});
const zeroBoundary={roleProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],objectiveScopeProposal:null,assessedCanonicalRoleProposals:[],masteryWeight:0,trustedRevisionId:null,humanApproved:false,published:false,independentEvidence:false,canonicalApprovalTransferred:false,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0};
// Parent membership is a delivery reference only; its earlier hold cannot be reopened by this card slice.
const deckObservations=groups.map(g=>{const id='deck:'+g.deck.id,children=idList(g.deck.cards),selectedChildren=idList(g.raw),earlierHeld=base.deferredSelectedRows.filter(r=>r.kind==='flashcard').map(r=>r.recordId),heldChildIds=[...earlierHeld,...heldIds],priorHold=base.deferredSelectedRows.find(r=>r.recordId===id);assert(priorHold);assert.equal(priorHold.newTeachingContentProposalCredit,0);assert.equal(sig(g.deck),priorHold.sourceRevision);assert.equal(heldChildIds.length,6);return{recordId:id,sourceRevision:sig(g.deck),setType:g.deck.setType,childRecordIdsInAuthoredOrder:children,childCatalogueRevisions:children.map(id=>c.records.get(id).sourceSignature),rawChildRevisions:g.deck.cards.map(sig),selectedChildCount:16,previouslyInspectedChildCount:16,allChildrenInspectedAcrossLocalSlices:true,unselectedChildCount:16,unselectedChildRecordIds:children.slice(0,16),unselectedChildReviewStatus:'prior_dispositions_or_holds_reference_only_no_new_credit',qualifiedChildRecordIds:selectedChildren.filter(id=>selected.has(id)),heldChildIds,partialContainer:true,priorPartialContainerHoldPreserved:true,referenceOnly:true,parentDispositionPacket:basePath,parentDispositionRevision:sig(priorHold),parentReapprovalAllowed:false,allSelectedChildrenQualifyAsDrafts:false,allChildrenOwnerApproved:false,childApprovalTransferred:false,newDeckContainerCredit:0,availableModes:['definition','acronym'],completionDistinctRatedCount:32,completionIncludesAgain:true,selected16RatingsCompleteDeck:false,chapterFilteredQuickStartPosition:groupSy0701AcronymSetsByChapter().find(group=>group.sets.some(s=>s.id===g.deck.id)).sets.slice(0,3).findIndex(s=>s.id===g.deck.id)+1,defaultQuickStartPosition:groupSy0701AcronymSetsByChapter().flatMap(group=>group.sets).slice(0,3).findIndex(s=>s.id===g.deck.id)+1,gradingKeyPresent:false};});
const proposal=r=>{const s=semanticReviews.find(s=>s.recordId===r.recordId);if(selected.has(r.recordId))assert.equal(c.pkg.concepts.find(n=>n.id===r.existingPrimarySupportCandidate)?.nodeKind,'supporting_concept');return{...r,...zeroBoundary,status:selected.has(r.recordId)?'CODEX_CARD_PROPOSAL_PENDING_OWNER_APPROVAL':'ZERO_CREDIT_TEACHING_CONTENT_DEFERRED',teachingUnderstanding:s.teachingUnderstanding,definitionSemanticallyClear:s.definitionSemanticallyClear,identityLinkQualified:s.identityLinkQualified,contentQualification:s.contentQualification,qualificationHolds:s.limits,conceptLinkProposals:selected.has(r.recordId)?[{conceptId:r.existingPrimarySupportCandidate,role:'instructional_support_only',weight:0,status:'candidate_pending_owner_no_canonical_approval'}]:[],newTeachingContentProposalCredit:selected.has(r.recordId)?1:0,...(!selected.has(r.recordId)?{reason:s.contentQualification}:{}),deliveryRoleObserved:r.kind==='deck_container'?'navigation_container':'self_rated_vocabulary_reveal',familyRelation:'same_authored_content_across_mode_flip_shuffle_reuse_rating;no_independent_assessment',postMissUsefulnessProposal:{approvedRemediation:false,weight:0,status:selected.has(r.recordId)?'bounded_vocabulary_support_no_observed_recovery':'held_ambiguous_or_partial_support'},...(r.kind==='deck_container'?{containerObservation:deckObservations.find(d=>d.recordId===r.recordId)}:{faceBindings:faceProbes.find(f=>f.recordId===r.recordId)})};};
const instructionalProposals=sourceChecks.filter(r=>selected.has(r.recordId)).map(proposal),deferredSelectedRows=sourceChecks.filter(r=>!selected.has(r.recordId)).map(proposal);assert.deepEqual(deferredSelectedRows.map(r=>r.recordId),heldIds);

const inheritedFields=['priorHoldBindings','priorHeldRows','deferredSelectedRows','canonicalBoundary','remainingBankFeedback','remainingBankQuestions','deliveryObservations','instructionalProposals','semanticReviews','heldGuideSubunitReferences','deckObservations','faceProbes','compoundFaceProbes','duplicateObservations'];
const priorHoldBindings=[...base.priorHoldBindings,...inheritedFields.map(field=>{assert(field in base);return{packetPath:basePath,field,sourceRevision:sig(base[field]),resolved:false,newCredit:0};})];
assert.equal(priorHoldBindings.length,145);
for(const r of priorHoldBindings){assert.equal(sig(readJson(r.packetPath)[r.field]),r.sourceRevision);assert.equal(r.resolved,false);assert.equal(r.newCredit,0);}
const priorHeldRows=[...base.priorHeldRows,...base.deferredSelectedRows.map(row=>({recordId:row.recordId,sourceRevision:c.records.get(row.recordId).sourceSignature,priorDispositionRevision:sig(row),packetPath:basePath,field:'deferredSelectedRows',status:row.status,resolved:false,newCredit:0}))];
assert.equal(priorHeldRows.length,70);assert.equal(new Set(priorHeldRows.map(r=>r.recordId)).size,70);
for(const row of priorHeldRows){assert(!previous.has(row.recordId)&&!selected.has(row.recordId));assert(priorRemaining.has(row.recordId));assert.equal(c.records.get(row.recordId).sourceSignature,row.sourceRevision);assert.equal(sig(readJson(row.packetPath)[row.field].find(r=>r.recordId===row.recordId)),row.priorDispositionRevision);}
const independentGlossaryHoldBindings=['glossary:cyod','glossary:srtp','glossary:ssh'].map(id=>{const row=priorHeldRows.find(r=>r.recordId===id);assert(row);return{...row,lessonApprovalTransferred:false};});
const unsupportedRef=priorHoldBindings.find(r=>r.field==='unsupportedDesignBoundary'),unsupported=readJson(unsupportedRef.packetPath).unsupportedDesignBoundary;assert.equal(unsupported.rows.length,23);for(const r of unsupported.rows){assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert(!selected.has(r.recordId));}
for(const id of ['private:pbq:p003','private:explanation:pbq:p003','private:pbq:p017','private:explanation:pbq:p017']){assert.equal(c.records.get(id).trustedRevisionId,null);assert(!previous.has(id)&&!selected.has(id));}
const censusRow=r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:previous.has(r.id)?'prior_agent_disposition_pending_owner':selected.has(r.id)?'new_teaching_proposal_pending_owner':heldSet.has(r.id)||priorCensus.get(r.id).status.startsWith('zero_credit')?'zero_credit_prior_or_selected_hold':'inventory_only_unreviewed'});
const coverageCodes=[...new Set([...Object.keys(base.objectiveCoverage),...sourceChecks.flatMap(r=>r.objectiveCodesObserved)])].sort();
const objectiveCoverage={};for(const code of coverageCodes){const rows=c.pkg.records.filter(r=>r.objectiveCodes.includes(code)),prior=rows.filter(r=>previous.has(r.id)),fresh=rows.filter(r=>selected.has(r.id)),remaining=rows.filter(r=>!previous.has(r.id)&&!selected.has(r.id));if(base.objectiveCoverage[code])assert.equal(prior.length,base.objectiveCoverage[code].denominator.combinedPendingDispositions);else assert(prior.every(r=>fullReferences.has(r.id)));objectiveCoverage[code]={denominator:{broadCandidates:rows.length,allPacketPriorDispositions:prior.length,newTeachingProposals:fresh.length,newQuestionDispositions:0,newFeedbackDispositions:0,combinedPendingDispositions:prior.length+fresh.length,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivate:remaining.filter(r=>r.id.startsWith('private:')).length,priorByKind:counts(prior),newByKind:counts(fresh),remainingByKind:counts(remaining)},census:rows.map(censusRow),remainingRecordIds:remaining.map(r=>r.id)};}
assert.deepEqual([objectiveCoverage['4.1'].denominator.allPacketPriorDispositions,objectiveCoverage['4.1'].denominator.newTeachingProposals,objectiveCoverage['4.1'].denominator.combinedPendingDispositions,objectiveCoverage['4.1'].denominator.remaining],[187,0,187,16]);
const expectedNewMemberships={'3.1':12,'3.3':12,'3.4':12};for(const[code,v]of Object.entries(objectiveCoverage))assert.equal(v.denominator.newTeachingProposals,expectedNewMemberships[code]||0);
const catalogueByKind=Object.keys(counts(c.pkg.records)).map(kind=>{const rows=c.pkg.records.filter(r=>r.kind===kind),prior=rows.filter(r=>previous.has(r.id)).length,fresh=rows.filter(r=>selected.has(r.id)).length;return{kind,total:rows.length,prior,new:fresh,combined:prior+fresh,remaining:rows.length-prior-fresh};});
for(const[k,total,combined]of [['flashcard',313,180],['deck_container',29,11],['glossary_definition',162,112],['lesson',32,21],['keyword_guide',32,21],['lesson_traps',32,21],['lesson_section',106,66],['lesson_check',128,71]])assert.deepEqual([catalogueByKind.find(r=>r.kind===k).total,catalogueByKind.find(r=>r.kind===k).combined],[total,combined]);
const sum=key=>catalogueByKind.filter(r=>base.supportProgress.kindScope.includes(r.kind)).reduce((n,r)=>n+r[key],0),supportProgress={kindScope:base.supportProgress.kindScope,denominator:sum('total'),priorFullDispositions:sum('prior'),newQualifiedTeachingProposals:12,combinedPending:sum('combined'),remaining:sum('remaining'),limitedPriorReferencesStillUnreviewed:6,newQuestionJudgments:0,newFeedbackJudgments:0};assert.deepEqual([sum('total'),sum('prior'),sum('combined'),sum('remaining')],[834,491,503,331]);
const bankProgress=base.bankProgress;assert.equal(c.ledger.rows.filter(r=>previous.has(r.recordId)).length,454);assert.equal(c.ledger.rows.filter(r=>previous.has('explanation:'+r.recordId)).length,447);assert.equal(bankProgress.completePairs,447);assert.equal(bankProgress.olderQuestionOnlyFullFeedbackGaps,7);
const memberships=new Map();for(const[code,v]of Object.entries(objectiveCoverage))for(const r of v.census)memberships.set(r.recordId,[...(memberships.get(r.recordId)||[]),code]);const sharedObjectiveRecords=[...memberships].filter(([,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));for(const r of sourceChecks)assert.deepEqual(memberships.get(r.recordId),r.objectiveCodesObserved);
const affectedCodes=Object.keys(expectedNewMemberships),priorOverlapReferences=c.pkg.records.filter(r=>previous.has(r.id)&&r.objectiveCodes.some(code=>affectedCodes.includes(code))).map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,objectiveCodesObserved:r.objectiveCodes,priorDispositionBoundBy:basePath,relation:'metadata_overlap_only_no_approval_or_new_credit'}));
const preservedHybridHoldBinding=priorHeldRows.find(r=>r.recordId==='section:platform-cloud-hardening:1');assert(preservedHybridHoldBinding);assert.equal(preservedHybridHoldBinding.resolved,false);
assert.deepEqual([objectiveCoverage['3.1'].denominator.allPacketPriorDispositions,objectiveCoverage['3.1'].denominator.newTeachingProposals,objectiveCoverage['3.1'].denominator.combinedPendingDispositions,objectiveCoverage['3.1'].denominator.remaining],[166,12,178,42]);
assert.deepEqual([objectiveCoverage['4.2'].denominator.combinedPendingDispositions,objectiveCoverage['4.2'].denominator.remaining],[59,9]);assert.deepEqual([objectiveCoverage['2.5'].denominator.combinedPendingDispositions,objectiveCoverage['2.5'].denominator.remaining],[61,5]);
for(const id of ['section:platform-cloud-hardening:1','section:cloud-containers-automation:1','practice:ot-iot-cyber-physical:practice-keyword-0','practice:ot-iot-cyber-physical:practice-keyword-1','glossary:phi'])assert(priorHeldRows.some(r=>r.recordId===id&&r.resolved===false&&r.newCredit===0));
const heldGuideSubunitReferences=priorHoldBindings.filter(r=>r.field==='heldGuideSubunits').map(r=>({...r,subunitBindings:readJson(r.packetPath)[r.field].map(s=>({recordId:s.recordId,fieldPath:s.fieldPath,sourceRevision:s.sourceRevision,resolved:s.resolved,newCredit:s.newCatalogueCredit}))}));
for(const id of ['keywords:cloud-containers-automation','keywords:data-classification-lifecycle'])assert(heldGuideSubunitReferences.some(r=>r.subunitBindings.some(s=>s.recordId===id&&s.resolved===false&&s.newCredit===0)));
const externalReferences=[
 [
  "https://support.apple.com/en-us/102509",
  "Private Wi-Fi sections: different per-network MACs and rotating/fixed modes. Counterexample to permanent hardware identity; no device tested."
 ],
 [
  "https://csrc.nist.gov/pubs/sp/800/82/r3/final",
  "Final publication abstract: OT is broader than ICS, including building/transport/access systems. Revision4 was an initial draft on the checked date. No full-standard audit."
 ],
 [
  "https://csrc.nist.gov/pubs/sp/800/218/final",
  "Final SSDF abstract: few SDLC models detail security and practices usually need adding. No methodology or software-security certification."
 ],
 [
  "https://learn.microsoft.com/en-us/intune/fundamentals/what-is-intune",
  "Relevant MDM/MAM paragraphs: enrollment and whole-device management versus work-app data; no deployed fleet or ownership policy verified."
 ],
 [
  "https://learn.microsoft.com/en-us/mem/intune/fundamentals/byod-technology-decisions",
  "Primary indexed planning excerpt: unified endpoint management with MDM enrollment. Indexed excerpt only, no full guide review."
 ],
 [
  "https://csrc.nist.gov/glossary/term/machine_learning",
  "Targeted definition: learning from data with accuracy improvement as a goal; not guaranteed improvement or all AI."
 ],
 [
  "https://www.eaton.com/us/en-us/products/backup-power-ups-surge-it-power-distribution/power-distribution-for-it-equipment/power-distribution-unit-faq.html",
  "Primary indexed UPS/PDU comparison: battery backup versus distribution from UPS/AC source. Indexed excerpt only; no equipment or runtime test."
 ],
 [
  "https://www.cisco.com/c/en/us/products/security/what-is-sase-secure-access-service-edge.html?ccid=cc003036",
  "Primary indexed definition: converged network/security functions in cloud service; no implemented configuration or guaranteed coverage."
 ],
 [
  "https://learn.microsoft.com/en-us/windows/apps/windows-sdk/",
  "Primary indexed overview: platform headers/libraries/metadata/build tools; no SDK installed or API compatibility tested."
 ],
 [
  "https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_selinux/changing-selinux-states-and-modes_using-selinux",
  "Targeted states/modes sections: enforcing policy denial versus permissive logging and disabled no policy. No host hardening or policy execution."
 ],
 [
  "https://trustedcomputinggroup.org/wp-content/uploads/SWG_TCG_Enterprise-Introduction_Sept2010.pdf",
  "Targeted slide6 (PDF page5): authentication unlock permits readable data; encryption-only does not prevent access. Historical conceptual slide only; no current protocol compliance audit."
 ],
 [
  "https://learn.microsoft.com/en-us/windows/win32/debug/structured-exception-handling",
  "Relevant exception mechanism sections: CPU faults/software exceptions with structured handling; no security event/incident response equivalence."
 ],
 [
  "https://learn.microsoft.com/en-us/cpp/cpp/structured-exception-handling-c-cpp?view=msvc-160",
  "Relevant C/C++ section: Microsoft SEH extension versus portable C++ exception handling; no program executed."
 ],
 [
  "https://learn.microsoft.com/virtualization/hyper-v-on-windows/user-guide/nested-virtualization",
  "Primary indexed definition: Hyper-V can run inside a VM. No nested host or isolation test."
 ],
 [
  "https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/plan-hyper-v-security-in-windows-server?trk=article-ssr-frontend-pulse_little-text-block",
  "Primary indexed security planning excerpt: protect host OS, VMs/configuration/data. No runtime isolation assurance."
 ]
].map(([url,claimScope])=>({url,claimScope,verifiedAt:'2026-10-12',primarySource:true,approvalTransferred:false}));
const deliveryUnits=[modeUnit,navUnit,labUnit,chooserUnit,tokenUnit,relatedUnit,...randomUnits,starredUnit,weakUnit];
const sourceBindings=[...new Map([...base.sourceBindings,...[basePath,baseReport,baseAudit,scriptPath].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];verifySourceBindings(sourceBindings);assert.equal(sourceBindings.length,280);
const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
const newObjectiveMemberships=instructionalProposals.reduce((n,r)=>n+r.objectiveCodesObserved.length,0);assert.equal(newObjectiveMemberships,36);
assert.equal(new Set(flatCards.map(card=>sig([card.acronym,card.expansion,card.meaning]))).size,16);
const duplicateObservations=sourceChecks.filter(r=>r.kind==='flashcard').map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,existingSupportConcept:r.existingPrimarySupportCandidate,catalogueSameSupportReferences:c.pkg.records.filter(other=>other.id!==r.recordId&&other.primaryConceptId===r.existingPrimarySupportCandidate).map(other=>({recordId:other.id,sourceRevision:other.sourceSignature,previousDisposition:previous.has(other.id)})),metadataComparisonOnly:true,neighborPayloadReviewed:false,definitionReversalOrReuseIsIndependent:false,newFamilyCredit:0}));
const deliveryObservations={sourceOnly:true,freshBrowserObserved:false,learnerHandlersExecuted:false,standardDeckRequiresAccount:false,standardDeckRequiresPro:false,flipAndDefinitionFeedbackRequirePro:false,acronymModes:['definition','acronym'],exampleModeAvailable:false,requestedExampleFallsBackToDefinition:true,oneActiveCard:true,movementResetsFlip:true,shuffleResetsPass:true,againAndGotItAreSelfRating:true,completionCountsDistinctRatedRegardlessRating:true,masteredLabelIsNotTrustedEvidence:true,sourceRatingDeviceAndEligibleAccountPersistence:true,relatedLessonsGate:'account_then_pro',assistantInventoryRequiresPro:true,sharedCurrentIdResolutionCap:30,savedReplayIsNotHistoricalRevision:true,sourceBadgeRevision:sig(SY0701_ACRONYM_SOURCE),sourceBadgeIsNotDefinitionApproval:true,coarseSelectorsNotValidatedPostMissRecovery:true,neighborDestinationsApproved:false,newMasteryEvidence:0,knownApprovedFreeDomain1LessonGapPreserved:true,knownApprovedFreePbqPreviewCoinsGapPreserved:true};
const compoundFaceProbes=groups[0].raw.filter(card=>card.acronym.includes(' / ')).map(card=>{const id='flashcard:'+card.id,labels=card.acronym.split(' / '),expansionParts=card.expansion.split(' / ');assert.equal(labels.length,expansionParts.length);return{recordId:id,sourceRevision:sig(card),componentLabelsObserved:labels,componentExpansionRevisions:expansionParts.map(sig),completeMeaningRevision:sig(card.meaning),sharedSuffixInCombinedExpansion:false,componentDistinctionsSupplied:selected.has(id),boundedDraftQualified:selected.has(id),acronymExpansionDoesNotRepairMissingMeaning:true,separateComponentAssessmentCredit:0,independentEvidence:false};});assert.equal(compoundFaceProbes.length,3);
for(const id of deckObservations[0].unselectedChildRecordIds){assert(!values.has(id)&&!selected.has(id));assert(previous.has(id)||priorHeldRows.some(r=>r.recordId===id));}
assert(priorHeldRows.some(r=>r.recordId===deckObservations[0].recordId&&r.resolved===false&&r.newCredit===0));
const identityCollisionProbes=['MAC','SoC'].map(term=>{const row=sourceChecks.find(r=>r.termObserved===term),node=c.pkg.concepts.find(n=>n.id===row.existingPrimarySupportCandidate),peerId=term==='MAC'?'flashcard:sy0701-acronym-security-principles-access-models-mac-mandatory-access-control':'flashcard:sy0701-acronym-security-operations-response-soc-security-operations-center',peer=c.records.get(peerId);assert(node&&peer);assert.equal(peer.primaryConceptId,row.existingPrimarySupportCandidate);assert(heldSet.has(row.recordId));const glossary=term==='SoC'?c.records.get('glossary:soc'):null;return{recordId:row.recordId,sourceRevision:row.sourceRevision,existingSupportConcept:node.id,supportNodeRevision:sig(node),supportNodeKind:node.nodeKind,peerRecordId:peer.id,peerSourceRevision:peer.sourceSignature,peerExistingSupportConcept:peer.primaryConceptId,...(glossary?{glossaryMetadataReference:{recordId:glossary.id,sourceRevision:glossary.sourceSignature,existingSupportConcept:glossary.primaryConceptId,definitionBodyReviewed:false,newCredit:0}}:{}),definitionSemanticallyClear:term==='SoC',identityLinkQualified:false,metadataComparisonOnly:true,neighborPayloadReviewed:false,ownerDisambiguationPending:true,identityUnionApproved:false,replacementNodeInvented:false,newLinkCredit:0,newFamilyCredit:0};});
assert.deepEqual(identityCollisionProbes.map(p=>p.sourceRevision),['sha256:074efb8abf7f886cdcbb44244c761dbe81036353ea6878d1e6e08ee039224dc0','sha256:aba30d96bfc84fdd56da7c85a34da4da5d8a296e2b93be2da5162bb7f85ff6d2']);
const packet={schemaVersion:1,status:'LOCAL_CODEX_CLOUD_ENDPOINT_REMAINING_CARD_PROPOSALS_WITH_HOLDS_NOT_READY',baselineCommit:'a374497ca2ab8bf9caa5914234b01a183ebd11ae',selectionPolicy:'Exactly16 preceding objective3.1 inventory-only cloud-endpoint-infrastructure cards at authored indexes16-31, MAC through VM. No parent or earlier-card reapproval; earlier parent hold remains zero. Four complete rows held; twelve support drafts only.',authority:{...base.authority,delegationApprovesOfflineTeachingAndGlossaryOnly:false,delegationApprovesOfflineCardAndDeckOnly:false,delegationApprovesOfflineSelectedCardsOnly:true,parentDeckReapprovalAllowed:false,parentQuestionReapprovalAllowed:false},sourceBindings,triageLedgerBinding:base.triageLedgerBinding,allPacketReconciliation:{inventory,priorQuestionOnlyAndDuplicateReconciliation:{packetPath:basePath,sourceRevision:sig(base.allPacketReconciliation),olderQuestions:42,olderMcqs:30,olderPbqs:12,duplicateReferences:22,supportOnlyReferences:7,newCredit:0}},instructionalReconciliation:{rawPriorRows:510,distinctPriorRecords:502,duplicatePriorOccurrences:8,limitedInstructionalReferences:base.instructionalReconciliation.limitedInstructionalReferences,newQualifiedRows:12,combinedRawRows:522,combinedDistinctRecords:514,limitedLinksUpgraded:0,newCandidateAlreadyPresent:0},candidateRecordIds,selectedRecordIds,sourceChecks,semanticReviews,instructionalProposals,questionProposals:[],explanationProposals:[],deferredSelectedRows,deliverySourceBindings:deliveryUnits.map(u=>u.provenance),authoredSourceBindings:[...factoryUnits,...literalUnits].map(u=>u.provenance),selectorBindings,faceProbes,compoundFaceProbes,deckObservations,reuseProbes,starredRecordIds,weakProbes,duplicateObservations,identityCollisionProbes,externalReferences,deliveryObservations,objectiveCoverage,sharedObjectiveRecords,distinctAffectedCatalogueRecords:memberships.size,summedObjectiveMemberships:Object.values(objectiveCoverage).reduce((n,v)=>n+v.census.length,0),newObjectiveMemberships,sharedMembershipsCreateNoAdditionalGlobalCredit:true,priorOverlapReferences,catalogueProgress:{denominator:1878,priorDispositions:1392,newProposals:12,combinedPending:1404,remaining:474,byKind:catalogueByKind},catalogueCensus:c.pkg.records.map(censusRow),remainingCatalogueRecordIds:c.pkg.records.filter(r=>!previous.has(r.id)&&!selected.has(r.id)).map(r=>r.id),supportProgress,bankProgress,remainingBankQuestions:base.remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,priorHoldBindings,priorHeldRows,heldGuideSubunitReferences,independentGlossaryHoldBindings,preservedHybridHoldBinding,canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
assert.equal(packet.remainingCatalogueRecordIds.length,474);assert.equal(Object.keys(objectiveCoverage).length,21);assert.equal(priorHeldRows.length+deferredSelectedRows.length,74);assert.equal(memberships.size,1504);assert.equal(packet.summedObjectiveMemberships,2863);assert.equal(sharedObjectiveRecords.length,607);
let completedNegativeChecks;
function validate(value){assertSafeReviewExport(value);assert(!/"(?:definition|fullName|meaning|answerMain|correctOrder|correctAnswer|frontText)"\s*:/.test(JSON.stringify(value)),'Raw learner/key export');const{negativeMutationChecks,...actual}=value;assert(isDeepStrictEqual(actual,packet),'Source, delivery, semantic decision, hold or count drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);assert.equal(actual.instructionalProposals.length,12);assert.equal(actual.deferredSelectedRows.length,4);for(const r of [...actual.instructionalProposals,...actual.deferredSelectedRows]){assert.equal(r.roleProposal,null);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);assert.equal(r.humanApproved,false);}}
validate(packet);validate(JSON.parse(JSON.stringify(packet)));let negativeMutationChecks=0;
const reject=mutate=>{const changed=structuredClone(packet);mutate(changed);assert(!isDeepStrictEqual(changed,packet),'Mutation must change data');assert.throws(()=>validate(changed));negativeMutationChecks++;};
for(let i=0;i<sourceChecks.length;i++){
 for(const key of ['recordId','sourceRevision','publishedRecordSignature','deliveredRevision','parentRecordId','precisionObserved'])reject(p=>p.sourceChecks[i][key]='stale_or_wrong');
 reject(p=>p.sourceChecks[i].objectiveCodesObserved=[]);reject(p=>p.sourceChecks[i].sourceOrderIndex=-1);reject(p=>p.sourceChecks[i].sourceCitations[0].fileSha256='stale');reject(p=>p.sourceChecks[i].sourceCitations[0].line=0);
 for(let j=0;j<sourceChecks[i].subunits.length;j++)reject(p=>p.sourceChecks[i].subunits[j].sourceRevision='stale');
 reject(p=>p.semanticReviews[i].contentQualification='');reject(p=>p.semanticReviews[i].limits=[]);reject(p=>p.semanticReviews[i].semanticallyQualifiedAsBoundedDraft=!p.semanticReviews[i].semanticallyQualifiedAsBoundedDraft);
}
for(let i=0;i<instructionalProposals.length;i++){
 for(const[key,bad]of Object.entries({roleProposal:'assessment',primaryConceptProposal:'invented',objectiveScopeProposal:['3.1'],assessedCanonicalRoleProposals:['invented'],masteryWeight:1,trustedRevisionId:'invented',humanApproved:true,published:true,independentEvidence:true,canonicalApprovalTransferred:true,newQuestionCredit:1,newFeedbackCredit:1,newFamilyCredit:1,newTeachingContentProposalCredit:2,contentQualification:'',qualificationHolds:[]}))reject(p=>p.instructionalProposals[i][key]=bad);
 reject(p=>p.instructionalProposals[i].postMissUsefulnessProposal.approvedRemediation=true);reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].weight=1);reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].conceptId='sy0701.objective.3.1');
}
for(let i=0;i<deferredSelectedRows.length;i++){for(const[key,bad]of Object.entries({sourceRevision:'stale',reason:'',contentQualification:'',qualificationHolds:[],newTeachingContentProposalCredit:1,masteryWeight:1,trustedRevisionId:'invented',humanApproved:true,conceptLinkProposals:[{conceptId:'invented'}]}))reject(p=>p.deferredSelectedRows[i][key]=bad);reject(p=>p.selectedRecordIds.push(heldIds[i]));reject(p=>p.instructionalProposals.push(p.deferredSelectedRows[i]));}
for(let i=0;i<deckObservations.length;i++)for(const[key,bad]of Object.entries({sourceRevision:'stale',childRecordIdsInAuthoredOrder:[],heldChildIds:[],partialContainer:false,allSelectedChildrenQualifyAsDrafts:true,allChildrenOwnerApproved:true,childApprovalTransferred:true,newDeckContainerCredit:1,availableModes:['example'],unselectedChildCount:0,referenceOnly:false,priorPartialContainerHoldPreserved:false,parentReapprovalAllowed:true,completionIncludesAgain:false,gradingKeyPresent:true}))reject(p=>p.deckObservations[i][key]=bad);
for(let i=0;i<faceProbes.length;i++)for(let j=0;j<faceProbes[i].modes.length;j++)for(const[key,bad]of Object.entries({frontTextRevision:'stale',backMainRevision:'stale',backCopyRevision:'stale',graded:true}))reject(p=>p.faceProbes[i].modes[j][key]=bad);
for(let i=0;i<reuseProbes.length;i++){reject(p=>p.reuseProbes[i].syntheticHydratedRecordIds=[]);reject(p=>p.reuseProbes[i].syntheticRandomRecordIds=[]);reject(p=>p.reuseProbes[i].approvedRemediation=true);reject(p=>p.reuseProbes[i].newEvidence=1);}
for(let i=0;i<duplicateObservations.length;i++){reject(p=>p.duplicateObservations[i].newFamilyCredit=1);reject(p=>p.duplicateObservations[i].neighborPayloadReviewed=true);reject(p=>p.duplicateObservations[i].definitionReversalOrReuseIsIndependent=true);}
for(const code of Object.keys(objectiveCoverage)){reject(p=>p.objectiveCoverage[code].denominator.newTeachingProposals++);reject(p=>p.objectiveCoverage[code].census.pop());reject(p=>p.objectiveCoverage[code].remainingRecordIds.pop());}
for(let i=0;i<priorHoldBindings.length;i++){reject(p=>p.priorHoldBindings[i].resolved=true);reject(p=>p.priorHoldBindings[i].sourceRevision='stale');}
for(let i=0;i<priorHeldRows.length;i++){reject(p=>p.priorHeldRows[i].resolved=true);reject(p=>p.priorHeldRows[i].newCredit=1);reject(p=>p.priorHeldRows[i].priorDispositionRevision='stale');}
for(let i=0;i<sourceBindings.length;i++)reject(p=>p.sourceBindings[i].sha256='stale');for(let i=0;i<inventory.length;i++)reject(p=>p.allPacketReconciliation.inventory[i].sha256='stale');
for(let i=0;i<heldGuideSubunitReferences.length;i++){reject(p=>p.heldGuideSubunitReferences[i].resolved=true);reject(p=>p.heldGuideSubunitReferences[i].sourceRevision='stale');for(let j=0;j<heldGuideSubunitReferences[i].subunitBindings.length;j++){reject(p=>p.heldGuideSubunitReferences[i].subunitBindings[j].resolved=true);reject(p=>p.heldGuideSubunitReferences[i].subunitBindings[j].newCredit=1);}}
for(const key of Object.keys(deliveryObservations).filter(k=>typeof deliveryObservations[k]==='boolean'))reject(p=>p.deliveryObservations[key]=!p.deliveryObservations[key]);
for(const[key,bad]of Object.entries({humanApproved:true,published:true,activationAllowed:true,masteryWeight:1,newFamilyCredit:1,privatePayloadIncluded:true,privatePayloadFetched:true,learnerRuntimeObserved:true,productionAction:true,phase3Work:true,status:'READY'}))reject(p=>p[key]=bad);
for(const key of ['q','options','answer','correct','gradingKey','payload','learnerId','email','definition','fullName','meaning','answerMain'])reject(p=>p[key]='forbidden');
reject(p=>p.instructionalProposals.push(p.instructionalProposals[0]));reject(p=>p.priorHeldRows.pop());reject(p=>p.catalogueProgress.newProposals=17);reject(p=>p.supportProgress.combinedPending++);reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.bankProgress.combinedFullFeedback=483);reject(p=>p.bankProgress.olderQuestionOnlyFullFeedbackGaps=0);reject(p=>p.instructionalReconciliation.limitedLinksUpgraded=6);reject(p=>p.authority.feedbackApprovalInferred=true);reject(p=>p.catalogueCensus.pop());reject(p=>p.remainingCatalogueRecordIds.pop());reject(p=>p.remainingBankFeedback.pop());reject(p=>p.remainingBankQuestions.pop());reject(p=>p.newObjectiveMemberships=14);reject(p=>p.preservedHybridHoldBinding.resolved=true);reject(p=>p.starredRecordIds.reverse());
for(let i=0;i<compoundFaceProbes.length;i++)for(const[key,bad]of Object.entries({sourceRevision:'stale',completeMeaningRevision:'stale',componentExpansionRevisions:[],componentLabelsObserved:[],acronymExpansionDoesNotRepairMissingMeaning:false,separateComponentAssessmentCredit:1,independentEvidence:true}))reject(p=>p.compoundFaceProbes[i][key]=bad);
for(let i=0;i<compoundFaceProbes.length;i++){reject(p=>p.compoundFaceProbes[i].componentDistinctionsSupplied=!p.compoundFaceProbes[i].componentDistinctionsSupplied);reject(p=>p.compoundFaceProbes[i].boundedDraftQualified=!p.compoundFaceProbes[i].boundedDraftQualified);}
reject(p=>p.deckObservations[0].unselectedChildRecordIds=[]);reject(p=>p.deckObservations[0].selected16RatingsCompleteDeck=true);
for(const id of deckObservations[0].unselectedChildRecordIds){reject(p=>p.selectedRecordIds.push(id));reject(p=>p.catalogueCensus.find(r=>r.recordId===id).status='new_teaching_proposal_pending_owner');}
for(let i=0;i<identityCollisionProbes.length;i++)for(const[key,bad]of Object.entries({sourceRevision:'stale',supportNodeRevision:'stale',peerSourceRevision:'stale',peerExistingSupportConcept:'invented',identityLinkQualified:true,ownerDisambiguationPending:false,identityUnionApproved:true,replacementNodeInvented:true,newLinkCredit:1,newFamilyCredit:1,neighborPayloadReviewed:true}))reject(p=>p.identityCollisionProbes[i][key]=bad);
reject(p=>p.identityCollisionProbes[1].definitionSemanticallyClear=false);reject(p=>p.identityCollisionProbes[1].glossaryMetadataReference.definitionBodyReviewed=true);reject(p=>p.identityCollisionProbes[1].glossaryMetadataReference.newCredit=1);
for(let i=0;i<semanticReviews.length;i++){reject(p=>p.semanticReviews[i].definitionSemanticallyClear=!p.semanticReviews[i].definitionSemanticallyClear);reject(p=>p.semanticReviews[i].identityLinkQualified=!p.semanticReviews[i].identityLinkQualified);}
reject(p=>p.candidateRecordIds.push(deckObservations[0].recordId));reject(p=>p.deckObservations[0].parentDispositionRevision='stale');reject(p=>p.authority.parentDeckReapprovalAllowed=true);
assert.equal(semanticReviews.find(r=>r.recordId===identityCollisionProbes[1].recordId).definitionSemanticallyClear,true);assert.equal(deferredSelectedRows.find(r=>r.termObserved==='SoC').conceptLinkProposals.length,0);
completedNegativeChecks=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-cloud-endpoint-remaining-cards-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const loc=u=>u.provenance.path+':'+u.provenance.startLine;
const report=`# Phase 2B-5 — remaining cloud/endpoint cards review

**LOCAL, default-off, unwired and learner-invisible. Phase 2B-5 NOT READY.** Pending owner proposals only; no publication, activation, trusted evidence or learner text change. Baseline **${packet.baselineCommit}**. Packet SHA-256 **${hashFile(packetPath)}**. Only this report, the draft packet and focused audit change.

## Exact finite selection

Exactly **16** preceding objective3.1 inventory-only cards, **cloud-endpoint-infrastructure indexes16–31** in authored order: MAC, MDM, ML, OS, OT/ICS, PDU/UPS, SASE, SCADA, SDK, SDLC/SDLM, SELinux, SED, SEH, SoC, UEM and VM. The first16 cards, parent deck, glossary, lessons, PBQs and other decks receive no new disposition. The source literal **${loc(literalUnits[0])}**, factory **${loc(factoryUnits[0])}** and each line below bind actual authored order, raw lab card hashes and separate flattened catalogue hashes. Catalogue parentId is absent; actual parent membership comes from the raw deck and flattened setId. No question override changes these cards. Source badges do not approve definitions.

**12 qualifying support drafts;4 whole-row zero-credit holds.** MAC, OT/ICS and SDLC/SDLM lack safe complete teaching/mapping distinctions. **SoC has a clear chip definition but an ambiguous existing support identity**, not an incorrect learner definition. The existing sy0701.term.soc node also represents Security Operations Center; owner identity disambiguation is pending. No new node, alias, glossary/neighbor approval or runtime fix is invented. MAC also shares sy0701.term.mac with Mandatory Access Control. Metadata-only collision probes bind both peer identities/revisions and the SoC glossary reference, without reading neighboring card or glossary definition bodies.

| Card | Source line | Decision and limits |
| --- | --- | --- |
${sourceChecks.map(r=>{const s=semanticReviews.find(s=>s.recordId===r.recordId);return '| '+r.termObserved+' | '+r.sourceCitations[0].line+' | '+(selected.has(r.recordId)?'Draft support; weight0. ':'HOLD; credit0. ')+s.teachingUnderstanding+' '+s.contentQualification+' '+s.limits[0]+' |';}).join('\n')}

The exact sixteen IDs, citations and content/face hashes are in sourceChecks. Qualifying rows propose their existing supporting-concept links at weight0. Held rows propose no links. Primary concepts, precise objective scopes, assessed canonical roles and trusted revisions remain null. Broad 3.1/3.3/3.4 tags are observed metadata, not complete objective coverage. No new question, feedback, owner approval, family or demonstrated recovery credit.

## Adversarial boundaries and primary evidence

[Apple private Wi-Fi addresses](https://support.apple.com/en-us/102509) gives a concrete changing/per-network address counterexample to the MAC card’s permanent hardware identity implication. Duplication/spoofing cannot be excluded by this card. The support-node collision with Mandatory Access Control is separately bound. [NIST OT final abstract](https://csrc.nist.gov/pubs/sp/800/82/r3/final) includes ICS alongside broader building, transport and physical-access systems. Its current page mentions an initial Revision4 draft; no draft is treated as a final requirement. A single industrial-process definition cannot teach both OT and ICS. SCADA qualifies only as a supervisory ICS form, not all OT/ICS, every actuator or timing/safety assurance. Its clearer card cannot repair the combined hold.

[NIST SSDF final abstract](https://csrc.nist.gov/pubs/sp/800/218/final) says secure-development practices generally need adding to SDLC models. The combined lifecycle/methodology card neither supplies their distinction nor justifies intrinsic security. SDK qualifies as developer tools/libraries, distinct from an API contract; [Microsoft SDK indexed overview](https://learn.microsoft.com/en-us/windows/apps/windows-sdk/) exemplifies headers, libraries, metadata and build tools. SDKs may include API clients without becoming APIs. No installed SDK, version compatibility or software-security result is tested.

[Microsoft Intune MDM/MAM paragraphs](https://learn.microsoft.com/en-us/intune/fundamentals/what-is-intune) distinguish enrolled whole-device management from managed work-app data. Its [indexed UEM planning excerpt](https://learn.microsoft.com/en-us/mem/intune/fundamentals/byod-technology-decisions) supports broader endpoint management with MDM enrollment. MDM and UEM remain separate bounded roles; enrollment, permissions and policy govern actual coverage. [NIST ML definition](https://csrc.nist.gov/glossary/term/machine_learning) treats accuracy improvement as a goal. ML is a data-learning AI approach, not all AI, guaranteed improvement, continual learning or secure unbiased output. OS resource management and SoC component integration supply vocabulary without secure-system guarantees.

[Eaton indexed UPS/PDU comparison](https://www.eaton.com/us/en-us/products/backup-power-ups-surge-it-power-distribution/power-distribution-for-it-equipment/power-distribution-unit-faq.html) distinguishes distributing supplied power from battery backup. PDU/UPS is the one qualifying combined face; its ordered meaning/expansions supply the contrast. UPS runtime is finite and load/battery dependent, not a generator or indefinite availability. [Cisco indexed SASE definition](https://www.cisco.com/c/en/us/products/security/what-is-sase-secure-access-service-edge.html?ccid=cc003036) supports network/security convergence in cloud delivery. SASE describes an architecture, not automatic zero trust or every-path security.

[Red Hat SELinux states/modes](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_selinux/changing-selinux-states-and-modes_using-selinux) distinguishes enforcing policy denial from permissive logging and disabled policy. The bounded mechanism proposal does not imply all Linux hardening or a universally stronger policy. [TCG historical SED introduction, slide6/PDF page5](https://trustedcomputinggroup.org/wp-content/uploads/SWG_TCG_Enterprise-Introduction_Sept2010.pdf) shows authentication unlocking readable data and distinguishes locking from encryption alone. SED names a feature; locking, keys and integration remain necessary. No current protocol compliance, completed secure erase or unlocked-host protection is asserted.

[Microsoft Windows SEH](https://learn.microsoft.com/en-us/windows/win32/debug/structured-exception-handling) handles hardware faults/software exceptions. The [C/C++ extension distinction](https://learn.microsoft.com/en-us/cpp/cpp/structured-exception-handling-c-cpp?view=msvc-160) excludes portable-language equivalence. SEH is not security-event handling or SOC response. [Microsoft indexed nested-virtualization definition](https://learn.microsoft.com/virtualization/hyper-v-on-windows/user-guide/nested-virtualization) supports a VM on a virtual host, while [indexed Hyper-V security planning](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/plan-hyper-v-security-in-windows-server?trk=article-ssr-frontend-pulse_little-text-block) requires host/guest/configuration/data protections. A VM is not a container or automatic secure boundary.

Evidence is relevant primary HTML paragraphs, abstracts, one targeted historical PDF slide and explicitly identified primary indexed excerpts. No full-standard, compliance, deployment, hardware, host or fleet audit. These sources explain qualifications; they do not confer owner approval.

## Delivery reference and preserved parent hold

The full **32-child** parent membership/raw/flattened revisions are bound as **reference only**. First16 dispositions are carried from the baseline without fresh semantic review; this slice inspects the remaining16. All32 children have now received local inspection across slices, but **six child rows remain held** (BYOD/COPE/CYOD, IaaS/PaaS/SaaS and the four current holds). The parent’s earlier partial-container hold remains unresolved with zero credit, bound by its exact prior disposition signature. No container reapproval or transfer of child approval is allowed. All children remain unapproved by the owner.

Source navigation **${loc(navUnit)}**, lab **${loc(labUnit)}**, modes **${loc(modeUnit)}**, chooser **${loc(chooserUnit)}** and eight selector revisions are reused. Guest/free users can open standard authored decks and reveals. Definition and acronym modes are available; no examples exist and requested example falls back to definition. **32 pure selected-card face probes** bind front/main/copy hashes with no raw learner-text export. Three compound probes bind complete meanings and component expansions: only PDU/UPS qualifies, and none earns component-specific independent assessment credit. No glossary overlay, grading key or scenario-specific corrective feedback.

Chapter3 quick-start position **${deckObservations[0].chapterFilteredQuickStartPosition}**; default quick-start position **${deckObservations[0].defaultQuickStartPosition}** (0 means absent). Browsing/study follow authored order; wrap/movement resets reveal and shuffle resets the pass. Again/Got it self-rate the whole card ID. Completion counts **32 distinct rated cards including Again**; rating only these16 or duplicating a rating cannot complete the deck. Device/eligible-account persistence and the mastered label remain self-report, not trusted evidence. Buttons/aria are source observations, not a fresh browser accessibility audit. No React, storage, telemetry, save or sync handler executes.

Source next deck **${reuseProbes[0].nextDeckRecordId}** and related Learn More **${reuseProbes[0].relatedLessonReferences.map(r=>r.recordId).join(', ')}** are metadata references only, with account-then-Pro lesson gating. Pro assistant inventory stays distinct. Shared current-ID hydration caps at30 and cannot preserve historical revisions. Approved free-Domain1 lesson and free-PBQ versus current preview/coins gaps remain unchanged.

Synthetic random10 over this eligible16 pool returns authored indexes16–25. Saved hydration of these16 normalizes a target20 but returns16 because the pool is finite; no global count/mix guarantee or previous24-to20 repair. Unknown saved/star IDs drop; reverse stars return global source order. Six synthetic weak-topic probes bind coarse selector intersections, not actual learner recovery. Sixteen distinct authored triples, flips/reveals, ratings, compound components and random/saved/star/weak reuse add **zero independent families**.

## Reconciliation

All **95 preceding substantive packets** reconcile against their actual proposal arrays, file/source hashes and prior credit identities. **510 raw/502 distinct** preceding instructional occurrences preserve eight repeats and six limited uncredited references. New12 yield **522 raw/514 distinct**, without upgrading limited links. All **70 prior whole-row holds**, **145 inherited hold bindings**, both IaC/tokenization guide subunits, independent CYOD/SRTP/SSH glossary holds, hybrid/card/deck/guide/check/private/unsupported boundaries remain unresolved. Four new whole-row holds yield **74 total**. Parent hold is among the70, not counted again.

| Kind | Total | Prior | New | Combined pending | Remaining |
| --- | --- | --- | --- | --- | --- |
${catalogueByKind.map(r=>'| '+r.kind+' | '+r.total+' | '+r.prior+' | '+r.new+' | '+r.combined+' | '+r.remaining+' |').join('\n')}

Support **503/834**, remaining **331**. Catalogue **1404/1878**, remaining **474**. Cards **180/313**; decks **11/29** unchanged. Bank **454/483 question judgments**, **447/483 complete pairs/full feedback**;29 question/36 feedback gaps, including7 older question-only feedback gaps, unchanged. All are pending proposals rather than completed learning coverage.

| Tracked objective | Candidates | Prior | New support | Combined pending | Remaining |
| --- | --- | --- | --- | --- | --- |
${Object.entries(objectiveCoverage).map(([code,{denominator:d}])=>'| '+code+' | '+d.broadCandidates+' | '+d.allPacketPriorDispositions+' | '+d.newTeachingProposals+' | '+d.combinedPendingDispositions+' | '+d.remaining+' |').join('\n')}

Objective3.1 **178/220**, remaining42;3.3 **117/164**, remaining47;3.4 **116/176**, remaining60. Other tracked objectives have zero new rows:4.1 remains187/203,4.2 remains59/68,2.5 remains61/66,3.2 remains160/220. New12 global rows produce36 observed memberships, not36 global credits. The21 tracked censuses bind2863 memberships,1504 distinct records and607 shared rows; no all28-objective claim. Exact objective3.1 remaining IDs:

${objectiveCoverage['3.1'].remainingRecordIds.map(id=>'- '+id).join('\n')}

## Validation and delivery gate

Run \`node ${scriptPath}\` and \`npm run audit:content-mapping\`. Focused self-checks reject **${negativeMutationChecks}** adverse mutations of selection/order, raw/flat/face/component/identity/peer revisions, SoC clear-content versus held mapping, prior parent hold, source/packet hashes, lost holds/subunits, inflated counts, forbidden exports and invented scope/canonical/trust/owner/weights/families. All **280 source bindings**, **25 protected release hashes** and the unchanged question ledger are checked. The ordinary command deterministically compares the packet and report with the source-derived expected result.

Required delivery checks: all29 mapping tests and deterministic active package, diff --check, deployment skip-marker exit0/control1, task-only three-file **[skip deploy]** commit/push, full remote commit/artifact hash equality, empty index and all eight unrelated dirty entries intact. Git push is repository delivery; this slice deliberately skips deployment.

No runtime/private-payload/production/fresh-browser/migration/Phase3/activation work. Remaining coverage, owner decisions, precise scope/canonical review, calibration/remediation evidence and operational release gates remain open. **Phase2B-5 NOT READY.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_CLOUD_ENDPOINT_REMAINING_CARDS_NOT_READY',priorPackets:inventory.length,selectedCandidates:16,newQualifiedCards:12,newDeckContainers:0,newZeroCreditRows:4,priorWholeHolds:70,totalWholeHolds:74,compoundFaceProbes:compoundFaceProbes.length,identityCollisionProbes:identityCollisionProbes.length,negativeMutationChecks,supportProgress,objective31:objectiveCoverage['3.1'].denominator,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
