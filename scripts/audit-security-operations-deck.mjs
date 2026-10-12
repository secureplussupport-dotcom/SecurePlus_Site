import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
import {SY0701_ACRONYM_SETS,SY0701_ACRONYM_CARDS,SY0701_ACRONYM_SOURCE,groupSy0701AcronymSetsByChapter} from '../src/data/sy0701AcronymFlashcards.js';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';

const scriptPath='scripts/audit-security-operations-deck.mjs',packetPath='docs/drafts/phase-2b5-security-operations-deck-proposals.json',reportPath='docs/phase-2b5-security-operations-deck-review.md';
const basePath='docs/drafts/phase-2b5-objective31-glossary-proposals.json',baseReport='docs/phase-2b5-objective31-glossary-review.md',baseAudit='scripts/audit-objective31-glossary.mjs';
assert.equal(hashFile(basePath),'d2e5657a49e46ee60018408bb78721dd09a03de14c0eead052eaaa85d1c292d4');
assert.equal(hashFile(baseReport),'05b4713fee20e4a62ba07f6c89c98754d930c73edcfdba3dfeb391b9edd2da55');
assert.equal(hashFile(baseAudit),'bf3955f5efca410b7fd60abbbac35ea46fd5143bcfa4740e1185704d682a9a5b');
const base=readJson(basePath),c=readReviewTriage();verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const priorCensus=new Map(base.catalogueCensus.map(r=>[r.recordId,r])),priorRemaining=new Set(base.remainingCatalogueRecordIds);
assert.equal(priorCensus.size,1878);assert.equal(priorRemaining.size,464);
const previous=new Set(c.pkg.records.filter(r=>!priorRemaining.has(r.id)).map(r=>r.id));assert.equal(previous.size,1414);
for(const r of c.pkg.records){const old=priorCensus.get(r.id);assert(old);assert.equal(old.sourceRevision,r.sourceSignature);assert.equal(old.kind,r.kind);assert.equal(previous.has(r.id),['prior_agent_disposition_pending_owner','new_card_proposal_pending_owner','new_partial_deck_proposal_pending_owner','new_glossary_proposal_pending_owner','new_teaching_proposal_pending_owner'].includes(old.status));}
// Reuse the immutable preceding census; reconcile its credited identities against the actual bound disposition arrays.
const inventory=[...base.allPacketReconciliation.inventory,{path:basePath,sha256:hashFile(basePath),substantiveRows:base.questionProposals.length+base.explanationProposals.length+base.instructionalProposals.length}].sort((a,b)=>a.path.localeCompare(b.path));
assert.equal(inventory.length,97);const actualInventory=readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')&&'docs/drafts/'+n!==packetPath).map(n=>'docs/drafts/'+n).filter(path=>['instructionalProposals','questionProposals','explanationProposals'].some(k=>Array.isArray(readJson(path)[k]))).sort();
assert.deepEqual(actualInventory,inventory.map(r=>r.path).sort());
const fullReferences=new Set(),instructionalOccurrences=[];
for(const entry of inventory){assert.equal(hashFile(entry.path),entry.sha256);const p=readJson(entry.path);verifySourceBindings(Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256})));const rows=['questionProposals','explanationProposals','instructionalProposals'].flatMap(k=>p[k]||[]);assert.equal(rows.length,entry.substantiveRows);
 for(const row of rows){const r=c.records.get(row.recordId);assert(r);assert.equal(row.publishedRecordSignature??row.sourceRevision,r.sourceSignature);if(previous.has(r.id))fullReferences.add(r.id);}
 for(const row of p.instructionalProposals||[])instructionalOccurrences.push(row.recordId);
}
assert.deepEqual([...fullReferences].sort(),[...previous].sort());assert.equal(instructionalOccurrences.length,532);assert.equal(new Set(instructionalOccurrences).size,524);
const deckIds=['security-operations-response'];
const selectedTerms=['CAR','CIO / CSO','CIRT / CERT','DRP','IRP','GPO','IPFIX','UEBA','PICERL','CVE','CVSS','PAM','JIT','MSSP','SIEM','SOAR','SOC','XDR'];
const groups=deckIds.map(id=>{const deck=SY0701_ACRONYM_SETS.find(d=>d.id===id);assert(deck);const raw=deck.cards,flat=raw.map(raw=>SY0701_ACRONYM_CARDS.find(card=>card.id===raw.id));assert(flat.every(Boolean));assert.deepEqual(raw.map(card=>card.acronym),selectedTerms);return{deck,raw,flat};});
assert.deepEqual(groups.map(g=>g.deck.cards.length),[18]);assert.deepEqual(groups.map(g=>g.deck.objectiveCodes),[['4.4','4.5','4.8','4.9']]);
const values=new Map(groups.flatMap(g=>[['deck:'+g.deck.id,g.deck],...g.flat.map(card=>['flashcard:'+card.id,card])])),candidateRecordIds=[...values.keys()];assert.equal(values.size,19);
const censusSelection=base.objectiveCoverage['4.4'].census.filter(r=>r.status==='inventory_only_unreviewed'&&values.has(r.recordId));assert.equal(censusSelection.length,19);
assert.deepEqual(censusSelection.map(r=>r.recordId),[...candidateRecordIds].sort());assert(censusSelection.every(r=>base.objectiveCoverage['4.4'].remainingRecordIds.includes(r.recordId)));
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(kind=>[kind,rows.filter(r=>r.kind===kind).length]));assert.deepEqual(counts(censusSelection),{deck_container:1,flashcard:18});
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
for(const g of groups){assert(g.deck.cards.every(c=>!c.example));assert.equal(safeMode('example',false,g.deck.setType),'definition');assert.equal(safeMode('acronym',false,g.deck.setType),'acronym');const last=g.raw.at(-1);assert.equal(completed(last,new Set(g.deck.cards.filter(c=>c.id!==last.id).map(c=>c.id)),18),true);assert.equal(completed(last,new Set(g.raw.slice(0,16).map(c=>c.id)),18),false);assert.equal(completed(g.raw[0],new Set([g.raw[0].id]),18),false);}
const related=Function('CONCEPT_DEEP_DIVES','getSy0701DeepDiveProfile','STARRED_FLASHCARD_SET_ID',tokenUnit.code+relatedUnit.code+';return getFlashcardRelatedDeepDives;')(CONCEPT_DEEP_DIVES,getSy0701DeepDiveProfile,'__audit_starred__');
const helpers=Function('SY0701_ACRONYM_CARDS','SY0701_ACRONYM_SETS','RANDOM_FLASHCARD_SET_ID','SAVED_RANDOM_FLASHCARD_PREFIX','FLASHCARD_DEFINITION_NEXT_LABEL','FLASHCARD_ACRONYM_SECTION_LABEL','getSafeFlashcardMode',randomUnits.map(u=>u.code).join('\n')+';return{buildRandomFlashcardSet,hydrateSavedRandomFlashcardSets,getNextFlashcardSet};')(SY0701_ACRONYM_CARDS,SY0701_ACRONYM_SETS,'__audit_random__','__audit_saved__','__audit_terms__','__audit_acronyms__',safeMode);
const idList=cards=>cards.filter(c=>c.cardType!=='divider').map(c=>'flashcard:'+c.id);
const reuseProbes=groups.map((g,i)=>{const random=helpers.buildRandomFlashcardSet({count:10,sourceCards:g.flat,includeTerms:false,includeAcronyms:true,preserveOrder:true,color:'#000'}),restored=helpers.hydrateSavedRandomFlashcardSets([{id:'__audit_saved__'+i,title:'source-only fixture',cardIds:g.flat.map(c=>c.id),color:'#000',config:{mode:'definition',includeTerms:false,includeAcronyms:true}}])[0];assert.deepEqual(idList(random.cards),idList(g.flat.slice(0,10)));assert.deepEqual(idList(restored.cards),idList(g.flat));const lessons=related(g.deck).map(d=>{const id='lesson:'+d.id;assert.equal(sig({d,profile:getSy0701DeepDiveProfile(d)}),c.records.get(id).sourceSignature);return{recordId:id,sourceRevision:c.records.get(id).sourceSignature,previousDisposition:previous.has(id),semanticReviewHere:false};});return{deckRecordId:'deck:'+g.deck.id,syntheticRequestedCount:10,syntheticRandomRecordIds:idList(random.cards),syntheticHydratedRecordIds:idList(restored.cards),syntheticHydrationNormalizedTarget:20,hydratedBelowTargetBecauseFinitePool:true,relatedLessonReferences:lessons,nextDeckRecordId:'deck:'+helpers.getNextFlashcardSet(g.deck).id,approvedRemediation:false,newEvidence:0};});
assert.deepEqual(helpers.hydrateSavedRandomFlashcardSets([{cardIds:['not-current']}]),[]);
const starred=Function('SY0701_ACRONYM_CARDS','FLASHCARD_STAR_TYPE','starKey',starredUnit.code+';return getStarredFlashcards;')(SY0701_ACRONYM_CARDS,'flashcard',(type,id)=>type+':'+id),flatCards=groups.flatMap(g=>g.flat),allSelectedCards=new Set(flatCards.map(c=>c.id)),starredRecordIds=idList(starred([...flatCards].reverse().map(c=>'flashcard:'+c.id)));assert.deepEqual(starredRecordIds,idList(SY0701_ACRONYM_CARDS.filter(c=>allSelectedCards.has(c.id))));assert.deepEqual(starred(['flashcard:not-current']),[]);
const weak=Function('SY0701_ACRONYM_CARDS','CHAPTERS','ASSISTANT_FLASHCARD_SET_ID','tokenizeLearningText',weakUnit.code+';return buildCipherWeakFlashcardSet;')(SY0701_ACRONYM_CARDS,[{id:'4',title:'Security Operations'}],'__audit_assistant__',Function(tokenUnit.code+';return tokenizeLearningText;')());
const weakProbes=['DRP','IRP','UEBA','SIEM','SOAR','XDR'].map(topic=>{const out=weak({weakChapterId:'4',weakTopics:[topic]});assert(out);return{syntheticTopic:topic,outputCount:out.cards.length,selectedIntersections:idList(out.cards).filter(id=>values.has(id)),outputIdentityRevision:sig(idList(out.cards)),coarseSelectorOnly:true,approvedRemediation:false,newEvidence:0};});assert.equal(weak({weakChapterId:'missing'}),null);
const selectorBindings=readSelectors().filter(s=>['flashcard-navigation','flashcard-study-pass','next-flashcard-deck','random-flashcards','related-flashcard-lessons','starred-flashcards','weak-area-deck','lesson-navigation'].includes(s.id)).map(s=>({recordId:'intervention:'+s.id,sourceRevision:s.sourceSignature,limitation:s.selector.mappingDependencies}));assert.equal(selectorBindings.length,8);for(const r of selectorBindings)assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);
const sourcePath='src/data/sy0701AcronymFlashcards.js',literalUnits=groups.map(g=>sourceUnit(sourcePath,'    '+JSON.stringify(g.deck.id)+',','  ),'));
const factoryUnits=[sourceUnit(sourcePath,'const makeCard =','export const SY0701_ACRONYM_SOURCE')];
const sourceChecks=candidateRecordIds.map(recordId=>{const r=c.records.get(recordId),g=groups.find(g=>recordId==='deck:'+g.deck.id||g.flat.some(card=>recordId==='flashcard:'+card.id)),isDeck=r.kind==='deck_container',raw=isDeck?g.deck:g.deck.cards.find(card=>recordId==='flashcard:'+card.id),anchor=isDeck?'    '+JSON.stringify(g.deck.id)+',':'      ['+JSON.stringify(raw.acronym)+', ',u=literalUnits[groups.indexOf(g)],offset=u.code.indexOf(anchor);assert(offset>=0);assert.equal(u.code.indexOf(anchor,offset+anchor.length),-1);const line=u.provenance.startLine+u.code.slice(0,offset).split('\n').length-1;assert(readFileSync(sourcePath,'utf8').split('\n')[line-1].includes(anchor));if(!isDeck)assert.notEqual(sig(raw),r.sourceSignature);assert.equal(r.parentId??null,null);if(!isDeck)assert.equal(values.get(recordId).setId,g.deck.id);return{recordId,kind:r.kind,parentRecordId:isDeck?null:'deck:'+g.deck.id,catalogueParentRecordIdObserved:null,sourceRevision:r.sourceSignature,publishedRecordSignature:r.sourceSignature,deliveredRevision:sig(raw),objectiveCodesObserved:r.objectiveCodes,precisionObserved:r.precision,trustedRevisionObserved:null,existingPrimarySupportCandidate:r.primaryConceptId,sourceOrderIndex:isDeck?SY0701_ACRONYM_SETS.indexOf(g.deck):g.deck.cards.indexOf(raw),termObserved:isDeck?g.deck.title:raw.acronym,sourceCitations:[{path:sourcePath,line,fileSha256:hashFile(sourcePath),anchorRevision:sig(anchor),parentUnitRevision:u.provenance.sourceSignature}],subunits:isDeck?g.deck.cards.map((card,index)=>({fieldPath:'cards['+index+']',recordId:'flashcard:'+card.id,sourceRevision:sig(card),reviewStatus:'selected_candidate_independently_reviewed_no_parent_approval_transfer'})):['acronym','expansion','meaning','topic','cardType'].map(field=>({fieldPath:field,sourceRevision:sig(raw[field]??null)})),sourcePrecedence:'local_factory_then_raw_deck_to_lab;flattened_catalogue_metadata_separate;no_question_override',exampleAvailable:false,contentInvented:false};});
const decisions={
 "CAR": [
  "Recognize a document recording a problem, root cause and corrective action.",
  "Qualified as corrective-action documentation vocabulary, not proof the action was implemented or effective.",
  "No verified root cause, closure, prevention of recurrence, compliance result or incident recovery."
 ],
 "CIO / CSO": [
  "Recognize the two executive-role expansions but hold the complete combined duties card.",
  "HOLD: the shared senior-leader statement lists IT direction and security risk without assigning duties to CIO versus CSO.",
  "Correct expansions and authored order alone do not teach distinct authority or accountability. No CIO/CSO/CISO identity union, organization charter or precise canonical role inferred."
 ],
 "CIRT / CERT": [
  "Recognize the two named incident-response-team labels and their shared response purpose.",
  "Qualified as generic incident-handling team vocabulary, not a guarantee all teams with these labels provide identical services or authority.",
  "Constituencies, mandate, internal response versus coordination and service portfolios vary. No universal charter, interchangeability of every team or component-specific independent assessment."
 ],
 "DRP": [
  "Recognize a plan to restore IT systems after a major disruption or disaster.",
  "Qualified as IT disaster-recovery planning vocabulary, distinct from responding to a cyber incident.",
  "DRP and IRP can coordinate but are not identical; no full business-continuity plan, tested restoration, RTO/RPO achievement or disaster readiness."
 ],
 "IRP": [
  "Recognize a written process for responding to a cyber incident.",
  "Qualified as cyber incident-response planning vocabulary, distinct from IT disaster-restoration planning.",
  "No exercised roles, completed containment/recovery, mandatory single sequence or substitution for DRP/business continuity."
 ],
 "GPO": [
  "Recognize Group Policy configuration/security settings in Microsoft Active Directory environments.",
  "Qualified as domain-policy mechanism vocabulary, not a guarantee every policy applies to every endpoint.",
  "Links, permissions, filtering, processing and supported Windows settings govern application; local GPOs also exist. No all-platform hardening, actual application or verified configuration."
 ],
 "IPFIX": [
  "Recognize standardized export of IP flow information with illustrative address/port/count metadata.",
  "Qualified as flow-export vocabulary, distinct from a guarantee of full packet capture or payload visibility.",
  "Templates and information elements determine fields; examples are not mandatory complete records. Extensible exports may include richer fields, but no full-PCAP equivalence, every-packet accounting, encryption or forensic completeness."
 ],
 "UEBA": [
  "Recognize behavior analytics flagging unusual user/entity activity against a baseline.",
  "Qualified as anomaly-analytics vocabulary, distinct from log aggregation, response orchestration or automatic proof of an attack.",
  "Baselines and data quality can drift; legitimate activity can be unusual and malicious activity can look normal. No all-entity coverage, verified maliciousness or guaranteed automatic response."
 ],
 "PICERL": [
  "Recognize the six named stages as a common incident-handling mnemonic.",
  "Qualified with the source common boundary, not a mandatory universal linear lifecycle or current NIST phase model.",
  "Activities can repeat/overlap and organizational response models differ; current NIST61r3 integrates response with CSF2.0. No mandatory sequencing, stage completion, runbook or real response."
 ],
 "CVE": [
  "Recognize standardized vulnerability identifiers as a public naming system.",
  "Qualified as identifier vocabulary, distinct from vulnerability severity, risk or proof of affected local assets.",
  "IDs can be reserved, published, disputed or rejected; not every known vulnerability has a CVE. No valid exploit, patch status, numeric severity or guaranteed record completeness inferred from an ID."
 ],
 "CVSS": [
  "Recognize standardized vulnerability-severity scoring, commonly on a0.0-to10.0 scale.",
  "Qualified as severity vocabulary, distinct from CVE naming and a complete business-risk or exploitation-likelihood assessment.",
  "Version/vector and Base/Threat/Environmental metrics matter. A base score alone is not organizational risk; asset exposure, impact and threats need separate evaluation. No score computed or remediation priority calibrated."
 ],
 "PAM": [
  "Recognize controls/tools securing, monitoring and auditing privileged access, with administrator/root examples.",
  "Qualified as a privileged-access management category, broader than the time-bounded JIT grant pattern.",
  "Privileged service/application identities also matter; capabilities and policy vary. No guaranteed least privilege, every-session audit, credential safety or actual access control."
 ],
 "JIT": [
  "Recognize temporary privileged access granted when needed with task/window-limited removal.",
  "Qualified as a time-bounded access pattern, distinct from all PAM controls and from just-in-time compilation.",
  "Approval, scope, duration, token/session behavior and revocation implementation matter; no tested expiry, immediate end-of-task detection, successful revocation or authorization outcome."
 ],
 "MSSP": [
  "Recognize an external provider of security monitoring or operations services.",
  "Qualified as a service-provider category, not every outsourced security function or transfer of all customer responsibility.",
  "Contract, scope, telemetry, permissions and response authority govern service. No universal24/7 coverage, detected attack, incident ownership transfer or achieved service level."
 ],
 "SIEM": [
  "Recognize log collection/correlation supporting alerts and investigation.",
  "Qualified as information/event-management vocabulary, distinct from SOAR workflow automation and UEBA anomaly methods.",
  "Data sources, retention, rules and analyst work govern outcomes; SIEM may integrate these other functions without making the categories identical. No every-log visibility or guaranteed detection/response."
 ],
 "SOAR": [
  "Recognize automation/orchestration of repeatable response workflows through playbooks.",
  "Qualified as workflow capability vocabulary, distinct from mere SIEM log correlation or UEBA anomaly detection.",
  "Playbooks, integrations, permissions and human approvals may govern actions. No fully autonomous safe response, every-incident remediation or executed automation."
 ],
 "SOC": [
  "Recognize a security-operations team/function monitoring, detecting and responding to events.",
  "HOLD SUPPORT IDENTITY ONLY: the operations-center definition is clear, but sy0701.term.soc also merges the distinct chip SoC and multi-meaning held glossary.",
  "Do not label this learner definition incorrect. No chip/center/audit union, replacement node, approved glossary repair or mapping credit; owner disambiguation remains pending."
 ],
 "XDR": [
  "Recognize correlation of detection/response data across multiple security domains.",
  "Qualified as cross-domain detection/response vocabulary, distinct from all SIEM/SOAR/UEBA functions.",
  "Endpoint/network/cloud are category examples; actual sensors, connectors, vendors and permissions govern scope. No every-domain coverage, universal taxonomy, guaranteed detection or tested containment."
 ]
};
const heldCardTerms=['CIO / CSO','SOC'],heldIds=sourceChecks.filter(r=>r.kind==='deck_container'||heldCardTerms.includes(r.termObserved)).map(r=>r.recordId),heldSet=new Set(heldIds),selectedRecordIds=candidateRecordIds.filter(id=>!heldSet.has(id)),selected=new Set(selectedRecordIds);assert.equal(heldIds.length,3);assert.equal(selected.size,16);
const commonLimits=['Observed objective tags are catalogue context, not precise assessed scope or owner approval.','No trusted revision, canonical role, learner evidence, independent family, verified recovery, publication or activation.'];
const semanticReviews=sourceChecks.map(r=>{const[teachingUnderstanding,contentQualification,limit]=r.kind==='deck_container'?['Navigation container for18 authored operation/response cards, not independent assessment.','HOLD: all18 children were inspected, but CIO/CSO teaching and SOC support identity remain held; zero whole-container credit.','Inspection of every child is not complete child qualification or owner approval.']:decisions[r.termObserved];assert(teachingUnderstanding);return{recordId:r.recordId,sourceRevision:r.sourceRevision,definitionSemanticallyClear:r.termObserved==='SOC'||selected.has(r.recordId),identityLinkQualified:selected.has(r.recordId),semanticallyQualifiedAsBoundedDraft:selected.has(r.recordId),teachingUnderstanding,contentQualification,limits:[limit,...commonLimits]};});
const zeroBoundary={roleProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],objectiveScopeProposal:null,assessedCanonicalRoleProposals:[],masteryWeight:0,trustedRevisionId:null,humanApproved:false,published:false,independentEvidence:false,canonicalApprovalTransferred:false,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0};
const deckObservations=groups.map(g=>{const id='deck:'+g.deck.id,children=idList(g.deck.cards),heldChildIds=children.filter(id=>heldSet.has(id));assert.equal(children.length,18);assert.equal(heldChildIds.length,2);return{recordId:id,sourceRevision:sig(g.deck),setType:g.deck.setType,childRecordIdsInAuthoredOrder:children,childCatalogueRevisions:children.map(id=>c.records.get(id).sourceSignature),rawChildRevisions:g.deck.cards.map(sig),selectedChildCount:18,unselectedChildCount:0,unselectedChildRecordIds:[],allChildrenInspected:true,partialInspection:false,partialQualification:true,qualifiedChildRecordIds:children.filter(id=>selected.has(id)),heldChildIds,partialContainer:true,allSelectedChildrenQualifyAsDrafts:false,allChildrenOwnerApproved:false,childApprovalTransferred:false,newDeckContainerCredit:0,availableModes:['definition','acronym'],completionDistinctRatedCount:18,completionIncludesAgain:true,all18RatingsCompleteStudyPass:true,studyPassCompletionApprovesContent:false,chapterFilteredQuickStartPosition:groupSy0701AcronymSetsByChapter().find(group=>group.sets.some(s=>s.id===g.deck.id)).sets.slice(0,3).findIndex(s=>s.id===g.deck.id)+1,defaultQuickStartPosition:groupSy0701AcronymSetsByChapter().flatMap(group=>group.sets).slice(0,3).findIndex(s=>s.id===g.deck.id)+1,gradingKeyPresent:false};});
const proposal=r=>{const s=semanticReviews.find(s=>s.recordId===r.recordId);if(selected.has(r.recordId))assert.equal(c.pkg.concepts.find(n=>n.id===r.existingPrimarySupportCandidate)?.nodeKind,'supporting_concept');return{...r,...zeroBoundary,status:selected.has(r.recordId)?'CODEX_CARD_PROPOSAL_PENDING_OWNER_APPROVAL':'ZERO_CREDIT_TEACHING_CONTENT_DEFERRED',teachingUnderstanding:s.teachingUnderstanding,definitionSemanticallyClear:s.definitionSemanticallyClear,identityLinkQualified:s.identityLinkQualified,contentQualification:s.contentQualification,qualificationHolds:s.limits,conceptLinkProposals:selected.has(r.recordId)?[{conceptId:r.existingPrimarySupportCandidate,role:'instructional_support_only',weight:0,status:'candidate_pending_owner_no_canonical_approval'}]:[],newTeachingContentProposalCredit:selected.has(r.recordId)?1:0,...(!selected.has(r.recordId)?{reason:s.contentQualification}:{}),deliveryRoleObserved:r.kind==='deck_container'?'navigation_container':'self_rated_vocabulary_reveal',familyRelation:'same_authored_content_across_mode_flip_shuffle_reuse_rating;no_independent_assessment',postMissUsefulnessProposal:{approvedRemediation:false,weight:0,status:selected.has(r.recordId)?'bounded_vocabulary_support_no_observed_recovery':'held_ambiguous_or_partial_support'},...(r.kind==='deck_container'?{containerObservation:deckObservations.find(d=>d.recordId===r.recordId)}:{faceBindings:faceProbes.find(f=>f.recordId===r.recordId)})};};
const instructionalProposals=sourceChecks.filter(r=>selected.has(r.recordId)).map(proposal),deferredSelectedRows=sourceChecks.filter(r=>!selected.has(r.recordId)).map(proposal);assert.deepEqual(deferredSelectedRows.map(r=>r.recordId),heldIds);

const inheritedFields=["priorHoldBindings", "priorHeldRows", "deferredSelectedRows", "canonicalBoundary", "remainingBankFeedback", "remainingBankQuestions", "deliveryObservations", "instructionalProposals", "semanticReviews", "heldGuideSubunitReferences", "glossaryMatcherProbes", "collisionProbes", "identityCollisionProbes", "socIdentityBoundary", "usageInventory", "surfaceProbes", "lessonDeliveryProbes", "plainLessonReferences", "cardOverlapObservations", "independentContentHoldBindings", "carriedSelectedHoldReferences", "selectionDiscrepancy", "outOfTrackedObjectiveReferences"];
const priorHoldBindings=[...base.priorHoldBindings,...inheritedFields.map(field=>{assert(field in base);return{packetPath:basePath,field,sourceRevision:sig(base[field]),resolved:false,newCredit:0};})];
assert.equal(priorHoldBindings.length,183);
for(const r of priorHoldBindings){assert.equal(sig(readJson(r.packetPath)[r.field]),r.sourceRevision);assert.equal(r.resolved,false);assert.equal(r.newCredit,0);}
const priorHeldRows=[...base.priorHeldRows,...base.deferredSelectedRows.map(row=>({recordId:row.recordId,sourceRevision:c.records.get(row.recordId).sourceSignature,priorDispositionRevision:sig(row),packetPath:basePath,field:'deferredSelectedRows',status:row.status,resolved:false,newCredit:0}))];
assert.equal(priorHeldRows.length,76);assert.equal(new Set(priorHeldRows.map(r=>r.recordId)).size,76);
for(const row of priorHeldRows){assert(!previous.has(row.recordId)&&!selected.has(row.recordId));assert(priorRemaining.has(row.recordId));assert.equal(c.records.get(row.recordId).sourceSignature,row.sourceRevision);assert.equal(sig(readJson(row.packetPath)[row.field].find(r=>r.recordId===row.recordId)),row.priorDispositionRevision);}
const independentGlossaryHoldBindings=['glossary:cyod','glossary:srtp','glossary:ssh'].map(id=>{const row=priorHeldRows.find(r=>r.recordId===id);assert(row);return{...row,lessonApprovalTransferred:false};});
const unsupportedRef=priorHoldBindings.find(r=>r.field==='unsupportedDesignBoundary'),unsupported=readJson(unsupportedRef.packetPath).unsupportedDesignBoundary;assert.equal(unsupported.rows.length,23);for(const r of unsupported.rows){assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert(!selected.has(r.recordId));}
for(const id of ['private:pbq:p003','private:explanation:pbq:p003','private:pbq:p017','private:explanation:pbq:p017']){assert.equal(c.records.get(id).trustedRevisionId,null);assert(!previous.has(id)&&!selected.has(id));}
const censusRow=r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:previous.has(r.id)?'prior_agent_disposition_pending_owner':selected.has(r.id)?'new_teaching_proposal_pending_owner':heldSet.has(r.id)||priorCensus.get(r.id).status.startsWith('zero_credit')?'zero_credit_prior_or_selected_hold':'inventory_only_unreviewed'});
const coverageCodes=[...new Set([...Object.keys(base.objectiveCoverage),...sourceChecks.flatMap(r=>r.objectiveCodesObserved)])].sort();
const objectiveCoverage={};for(const code of coverageCodes){const rows=c.pkg.records.filter(r=>r.objectiveCodes.includes(code)),prior=rows.filter(r=>previous.has(r.id)),fresh=rows.filter(r=>selected.has(r.id)),remaining=rows.filter(r=>!previous.has(r.id)&&!selected.has(r.id));if(base.objectiveCoverage[code])assert.equal(prior.length,base.objectiveCoverage[code].denominator.combinedPendingDispositions);else assert(prior.every(r=>fullReferences.has(r.id)));objectiveCoverage[code]={denominator:{broadCandidates:rows.length,allPacketPriorDispositions:prior.length,newTeachingProposals:fresh.length,newQuestionDispositions:0,newFeedbackDispositions:0,combinedPendingDispositions:prior.length+fresh.length,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivate:remaining.filter(r=>r.id.startsWith('private:')).length,priorByKind:counts(prior),newByKind:counts(fresh),remainingByKind:counts(remaining)},census:rows.map(censusRow),remainingRecordIds:remaining.map(r=>r.id)};}
assert.deepEqual([objectiveCoverage['4.1'].denominator.allPacketPriorDispositions,objectiveCoverage['4.1'].denominator.newTeachingProposals,objectiveCoverage['4.1'].denominator.combinedPendingDispositions,objectiveCoverage['4.1'].denominator.remaining],[187,0,187,16]);
const expectedNewMemberships={'4.4':16,'4.5':16,'4.8':16,'4.9':16};for(const[code,v]of Object.entries(objectiveCoverage))assert.equal(v.denominator.newTeachingProposals,expectedNewMemberships[code]||0);
const catalogueByKind=Object.keys(counts(c.pkg.records)).map(kind=>{const rows=c.pkg.records.filter(r=>r.kind===kind),prior=rows.filter(r=>previous.has(r.id)).length,fresh=rows.filter(r=>selected.has(r.id)).length;return{kind,total:rows.length,prior,new:fresh,combined:prior+fresh,remaining:rows.length-prior-fresh};});
for(const[k,total,combined]of [['flashcard',313,196],['deck_container',29,11],['glossary_definition',162,122],['lesson',32,21],['keyword_guide',32,21],['lesson_traps',32,21],['lesson_section',106,66],['lesson_check',128,71]])assert.deepEqual([catalogueByKind.find(r=>r.kind===k).total,catalogueByKind.find(r=>r.kind===k).combined],[total,combined]);
const sum=key=>catalogueByKind.filter(r=>base.supportProgress.kindScope.includes(r.kind)).reduce((n,r)=>n+r[key],0),supportProgress={kindScope:base.supportProgress.kindScope,denominator:sum('total'),priorFullDispositions:sum('prior'),newQualifiedTeachingProposals:16,combinedPending:sum('combined'),remaining:sum('remaining'),limitedPriorReferencesStillUnreviewed:6,newQuestionJudgments:0,newFeedbackJudgments:0};assert.deepEqual([sum('total'),sum('prior'),sum('combined'),sum('remaining')],[834,513,529,305]);
const bankProgress=base.bankProgress;assert.equal(c.ledger.rows.filter(r=>previous.has(r.recordId)).length,454);assert.equal(c.ledger.rows.filter(r=>previous.has('explanation:'+r.recordId)).length,447);assert.equal(bankProgress.completePairs,447);assert.equal(bankProgress.olderQuestionOnlyFullFeedbackGaps,7);
const memberships=new Map();for(const[code,v]of Object.entries(objectiveCoverage))for(const r of v.census)memberships.set(r.recordId,[...(memberships.get(r.recordId)||[]),code]);const sharedObjectiveRecords=[...memberships].filter(([,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));for(const r of sourceChecks)assert.deepEqual(memberships.get(r.recordId),r.objectiveCodesObserved);
const affectedCodes=Object.keys(expectedNewMemberships),priorOverlapReferences=c.pkg.records.filter(r=>previous.has(r.id)&&r.objectiveCodes.some(code=>affectedCodes.includes(code))).map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,objectiveCodesObserved:r.objectiveCodes,priorDispositionBoundBy:basePath,relation:'metadata_overlap_only_no_approval_or_new_credit'}));
const preservedHybridHoldBinding=priorHeldRows.find(r=>r.recordId==='section:platform-cloud-hardening:1');assert(preservedHybridHoldBinding);assert.equal(preservedHybridHoldBinding.resolved,false);
assert.deepEqual([objectiveCoverage['3.1'].denominator.allPacketPriorDispositions,objectiveCoverage['3.1'].denominator.newTeachingProposals,objectiveCoverage['3.1'].denominator.combinedPendingDispositions,objectiveCoverage['3.1'].denominator.remaining],[188,0,188,32]);
assert.deepEqual([objectiveCoverage['4.2'].denominator.combinedPendingDispositions,objectiveCoverage['4.2'].denominator.remaining],[59,9]);assert.deepEqual([objectiveCoverage['2.5'].denominator.combinedPendingDispositions,objectiveCoverage['2.5'].denominator.remaining],[61,5]);
for(const id of ['section:platform-cloud-hardening:1','section:cloud-containers-automation:1','practice:ot-iot-cyber-physical:practice-keyword-0','practice:ot-iot-cyber-physical:practice-keyword-1','glossary:phi'])assert(priorHeldRows.some(r=>r.recordId===id&&r.resolved===false&&r.newCredit===0));
const heldGuideSubunitReferences=priorHoldBindings.filter(r=>r.field==='heldGuideSubunits').map(r=>({...r,subunitBindings:readJson(r.packetPath)[r.field].map(s=>({recordId:s.recordId,fieldPath:s.fieldPath,sourceRevision:s.sourceRevision,resolved:s.resolved,newCredit:s.newCatalogueCredit}))}));
for(const id of ['keywords:cloud-containers-automation','keywords:data-classification-lifecycle'])assert(heldGuideSubunitReferences.some(r=>r.subunitBindings.some(s=>s.recordId===id&&s.resolved===false&&s.newCredit===0)));
const externalReferences=[
 [
  "https://www.first.org/standards/frameworks/csirts/csirt_services_framework_v2.1",
  "Targeted purpose section: team services/mandates vary and no team is expected to deliver every listed service; not a full framework or charter audit."
 ],
 [
  "https://www.rfc-editor.org/rfc/rfc7011.html",
  "Targeted abstract/introduction and template examples: export/collection of flow information, extensible records and selected metadata. Not full RFC conformance or packet capture."
 ],
 [
  "https://www.sans.org/media/score/504-incident-response-cycle.pdf",
  "Primary indexed mnemonic excerpt only; PDF text extraction empty and screenshot returned no readable image in this tool. No full cheat-sheet or mandated lifecycle review."
 ],
 [
  "https://csrc.nist.gov/pubs/sp/800/61/r3/final",
  "Current final abstract: integrate incident response throughout CSF2.0 cybersecurity risk management. No full publication or implementation audit."
 ],
 [
  "https://github.com/CVEProject/cve-documents/blob/master/CNA_Rules.md",
  "Targeted CVE Program rules4.5.3: published records may change/reject; identifiers are not severity or local affected-asset proof. No full rulebook audit."
 ],
 [
  "https://www.first.org/cvss/v4.0/user-guide",
  "Targeted Base severity versus risk and metric nomenclature sections: Base/Threat/Environmental groups matter. No full scoring audit or computed score."
 ],
 [
  "https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-scope",
  "Targeted scope/link/filter paragraphs: AD links, permissions and filtering govern application, with local GPOs distinct. No client or policy application run."
 ],
 [
  "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure?WT.mc_id=AZ-MVP-5004810",
  "Targeted reasons/features: time/approval-based activation, limited grants and audit support. Vendor example, not every PAM/JIT product or verified expiry."
 ],
 [
  "https://learn.microsoft.com/en-us/security/zero-trust/siem-xdr-overview",
  "Targeted introduction/integration paragraphs: SIEM/SOAR capabilities coexist and XDR integrates with SIEM; indexed UEBA reference. Not universal taxonomy or measured security outcome."
 ]
].map(([url,claimScope])=>({url,claimScope,verifiedAt:'2026-10-12',primarySource:true,approvalTransferred:false}));
const deliveryUnits=[modeUnit,navUnit,labUnit,chooserUnit,tokenUnit,relatedUnit,...randomUnits,starredUnit,weakUnit];
const sourceBindings=[...new Map([...base.sourceBindings,...[basePath,baseReport,baseAudit,scriptPath].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];verifySourceBindings(sourceBindings);assert.equal(sourceBindings.length,286);
const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
const newObjectiveMemberships=instructionalProposals.reduce((n,r)=>n+r.objectiveCodesObserved.length,0);assert.equal(newObjectiveMemberships,64);
assert.equal(new Set(flatCards.map(card=>sig([card.acronym,card.expansion,card.meaning]))).size,18);
const duplicateObservations=sourceChecks.filter(r=>r.kind==='flashcard').map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,existingSupportConcept:r.existingPrimarySupportCandidate,catalogueSameSupportReferences:c.pkg.records.filter(other=>other.id!==r.recordId&&other.primaryConceptId===r.existingPrimarySupportCandidate).map(other=>({recordId:other.id,sourceRevision:other.sourceSignature,previousDisposition:previous.has(other.id)})),metadataComparisonOnly:true,neighborPayloadReviewed:false,definitionReversalOrReuseIsIndependent:false,newFamilyCredit:0}));
const deliveryObservations={sourceOnly:true,freshBrowserObserved:false,learnerHandlersExecuted:false,standardDeckRequiresAccount:false,standardDeckRequiresPro:false,flipAndDefinitionFeedbackRequirePro:false,acronymModes:['definition','acronym'],exampleModeAvailable:false,requestedExampleFallsBackToDefinition:true,oneActiveCard:true,movementResetsFlip:true,shuffleResetsPass:true,againAndGotItAreSelfRating:true,completionCountsDistinctRatedRegardlessRating:true,masteredLabelIsNotTrustedEvidence:true,sourceRatingDeviceAndEligibleAccountPersistence:true,relatedLessonsGate:'account_then_pro',assistantInventoryRequiresPro:true,sharedCurrentIdResolutionCap:30,savedReplayIsNotHistoricalRevision:true,sourceBadgeRevision:sig(SY0701_ACRONYM_SOURCE),sourceBadgeIsNotDefinitionApproval:true,coarseSelectorsNotValidatedPostMissRecovery:true,neighborDestinationsApproved:false,newMasteryEvidence:0,knownApprovedFreeDomain1LessonGapPreserved:true,knownApprovedFreePbqPreviewCoinsGapPreserved:true};
const compoundFaceProbes=groups[0].raw.filter(card=>card.acronym.includes(' / ')).map(card=>{const id='flashcard:'+card.id,labels=card.acronym.split(' / '),expansionParts=card.expansion.split(' / ');assert.equal(labels.length,expansionParts.length);return{recordId:id,sourceRevision:sig(card),componentLabelsObserved:labels,componentExpansionRevisions:expansionParts.map(sig),completeMeaningRevision:sig(card.meaning),sharedSuffixInCombinedExpansion:false,componentDistinctionsSupplied:false,genericSharedTeamPurposeSupplied:card.acronym==='CIRT / CERT',universalTeamEquivalence:false,boundedDraftQualified:selected.has(id),acronymExpansionDoesNotRepairMissingMeaning:true,separateComponentAssessmentCredit:0,independentEvidence:false};});assert.equal(compoundFaceProbes.length,2);
for(const id of deckObservations[0].unselectedChildRecordIds){assert(!values.has(id)&&!selected.has(id)&&!previous.has(id));assert.equal(priorCensus.get(id).status,'inventory_only_unreviewed');}
const socRow=sourceChecks.find(r=>r.termObserved==='SOC'),socNode=c.pkg.concepts.find(n=>n.id===socRow.existingPrimarySupportCandidate),chipId='flashcard:sy0701-acronym-cloud-endpoint-infrastructure-soc-system-on-chip',chip=c.records.get(chipId),glossary=c.records.get('glossary:soc');assert.equal(chip.primaryConceptId,socNode.id);assert.equal(glossary.primaryConceptId,socNode.id);
const identityCollisionProbes=[{recordId:socRow.recordId,sourceRevision:socRow.sourceRevision,existingSupportConcept:socNode.id,supportNodeRevision:sig(socNode),definitionSemanticallyClear:true,identityLinkQualified:false,ownerDisambiguationPending:true,identityUnionApproved:false,replacementNodeInvented:false,newLinkCredit:0,metadataComparisonOnly:true,neighborPayloadReviewed:false,peerReferences:[chip,glossary].map(r=>({recordId:r.id,sourceRevision:r.sourceSignature,existingSupportConcept:r.primaryConceptId,newDisposition:0,neighborPayloadReviewed:false}))}];
const independentSourceHoldBindings=priorHeldRows.filter(r=>[chipId,'glossary:soc','glossary:zta'].includes(r.recordId)).map(r=>({...r,currentCardApprovalTransferred:false}));assert.equal(independentSourceHoldBindings.length,3);assert(independentSourceHoldBindings.every(r=>r.resolved===false&&r.newCredit===0));
assert.equal(socRow.sourceRevision,'sha256:40681b5924386a681fdcab479da754164b95a1bfdf5ba60b1ac639d56bbeae26');
const semanticBoundaries={cioCsoDutiesIndividuallyAssigned:false,cirtCertUniversalCharterEquivalence:false,drpEqualsIrp:false,ipfixGuaranteesFullPacketCapture:false,picerlMandatoryLinearOrder:false,cveIdIsSeverityOrRisk:false,cvssBaseAloneIsOrganizationalRisk:false,pamEqualsJit:false,jitExpiryExecuted:false,siemSoarUebaXdrIdentical:false,socClearCardResolvesHeldIdentity:false,studyPassSelfRatingIsContentApproval:false};
const packet={schemaVersion:1,status:'LOCAL_CODEX_SECURITY_OPERATIONS_DECK_PROPOSALS_WITH_HOLDS_NOT_READY',baselineCommit:'9d531d0fec9392d1a3a23c02648c1ab5a412db52',selectionPolicy:'Exactly19 objective4.4 inventory-only records:security-operations-response deck plus all18 authored acronym cards in source order. Two card holds keep the fully inspected container held at zero; sixteen bounded support drafts only.',authority:{...base.authority,delegationApprovesOfflineTeachingAndGlossaryOnly:false,delegationApprovesOfflineSelectedGlossaryOnly:false,delegationApprovesOfflineCardAndDeckOnly:false,parentQuestionReapprovalAllowed:false},sourceBindings,triageLedgerBinding:base.triageLedgerBinding,allPacketReconciliation:{inventory,priorQuestionOnlyAndDuplicateReconciliation:{packetPath:basePath,sourceRevision:sig(base.allPacketReconciliation),olderQuestions:42,olderMcqs:30,olderPbqs:12,duplicateReferences:22,supportOnlyReferences:7,newCredit:0}},instructionalReconciliation:{rawPriorRows:532,distinctPriorRecords:524,duplicatePriorOccurrences:8,limitedInstructionalReferences:base.instructionalReconciliation.limitedInstructionalReferences,newQualifiedRows:16,combinedRawRows:548,combinedDistinctRecords:540,limitedLinksUpgraded:0,newCandidateAlreadyPresent:0},candidateRecordIds,selectedRecordIds,sourceChecks,semanticReviews,instructionalProposals,questionProposals:[],explanationProposals:[],deferredSelectedRows,deliverySourceBindings:deliveryUnits.map(u=>u.provenance),authoredSourceBindings:[...factoryUnits,...literalUnits].map(u=>u.provenance),selectorBindings,faceProbes,compoundFaceProbes,deckObservations,reuseProbes,starredRecordIds,weakProbes,duplicateObservations,identityCollisionProbes,independentSourceHoldBindings,semanticBoundaries,externalReferences,deliveryObservations,objectiveCoverage,sharedObjectiveRecords,distinctAffectedCatalogueRecords:memberships.size,summedObjectiveMemberships:Object.values(objectiveCoverage).reduce((n,v)=>n+v.census.length,0),newObjectiveMemberships,sharedMembershipsCreateNoAdditionalGlobalCredit:true,priorOverlapReferences,catalogueProgress:{denominator:1878,priorDispositions:1414,newProposals:16,combinedPending:1430,remaining:448,byKind:catalogueByKind},catalogueCensus:c.pkg.records.map(censusRow),remainingCatalogueRecordIds:c.pkg.records.filter(r=>!previous.has(r.id)&&!selected.has(r.id)).map(r=>r.id),supportProgress,bankProgress,remainingBankQuestions:base.remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,priorHoldBindings,priorHeldRows,heldGuideSubunitReferences,independentGlossaryHoldBindings,preservedHybridHoldBinding,canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
assert.equal(packet.remainingCatalogueRecordIds.length,448);assert.equal(Object.keys(objectiveCoverage).length,21);assert.equal(priorHeldRows.length+deferredSelectedRows.length,79);assert.equal(memberships.size,1504);assert.equal(packet.summedObjectiveMemberships,2863);assert.equal(sharedObjectiveRecords.length,607);
let completedNegativeChecks;
function validate(value){assertSafeReviewExport(value);assert(!/"(?:definition|fullName|meaning|answerMain|correctOrder|correctAnswer|frontText)"\s*:/.test(JSON.stringify(value)),'Raw learner/key export');const{negativeMutationChecks,...actual}=value;assert(isDeepStrictEqual(actual,packet),'Source, delivery, semantic decision, hold or count drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);assert.equal(actual.instructionalProposals.length,16);assert.equal(actual.deferredSelectedRows.length,3);for(const r of [...actual.instructionalProposals,...actual.deferredSelectedRows]){assert.equal(r.roleProposal,null);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);assert.equal(r.humanApproved,false);}}
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
for(let i=0;i<deckObservations.length;i++)for(const[key,bad]of Object.entries({sourceRevision:'stale',childRecordIdsInAuthoredOrder:[],heldChildIds:[],partialContainer:false,allSelectedChildrenQualifyAsDrafts:true,allChildrenOwnerApproved:true,childApprovalTransferred:true,newDeckContainerCredit:1,availableModes:['example'],unselectedChildCount:1,allChildrenInspected:false,partialInspection:true,partialQualification:false,studyPassCompletionApprovesContent:true,completionIncludesAgain:false,gradingKeyPresent:true}))reject(p=>p.deckObservations[i][key]=bad);
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
reject(p=>p.deckObservations[0].unselectedChildRecordIds=['invented']);reject(p=>p.deckObservations[0].all18RatingsCompleteStudyPass=false);
for(const id of deckObservations[0].unselectedChildRecordIds){reject(p=>p.selectedRecordIds.push(id));reject(p=>p.catalogueCensus.find(r=>r.recordId===id).status='new_teaching_proposal_pending_owner');}
for(let i=0;i<semanticReviews.length;i++){reject(p=>p.semanticReviews[i].definitionSemanticallyClear=!p.semanticReviews[i].definitionSemanticallyClear);reject(p=>p.semanticReviews[i].identityLinkQualified=!p.semanticReviews[i].identityLinkQualified);}
for(const[key,bad]of Object.entries({sourceRevision:'stale',supportNodeRevision:'stale',definitionSemanticallyClear:false,identityLinkQualified:true,ownerDisambiguationPending:false,identityUnionApproved:true,replacementNodeInvented:true,newLinkCredit:1,neighborPayloadReviewed:true}))reject(p=>p.identityCollisionProbes[0][key]=bad);
for(let i=0;i<identityCollisionProbes[0].peerReferences.length;i++){reject(p=>p.identityCollisionProbes[0].peerReferences[i].sourceRevision='stale');reject(p=>p.identityCollisionProbes[0].peerReferences[i].newDisposition=1);reject(p=>p.identityCollisionProbes[0].peerReferences[i].neighborPayloadReviewed=true);}
for(let i=0;i<independentSourceHoldBindings.length;i++){reject(p=>p.independentSourceHoldBindings[i].resolved=true);reject(p=>p.independentSourceHoldBindings[i].currentCardApprovalTransferred=true);}
for(const key of Object.keys(semanticBoundaries))reject(p=>p.semanticBoundaries[key]=true);
for(let i=0;i<compoundFaceProbes.length;i++){reject(p=>p.compoundFaceProbes[i].genericSharedTeamPurposeSupplied=!p.compoundFaceProbes[i].genericSharedTeamPurposeSupplied);reject(p=>p.compoundFaceProbes[i].universalTeamEquivalence=true);}
assert.equal(semanticReviews.find(r=>r.recordId===socRow.recordId).definitionSemanticallyClear,true);assert.equal(deferredSelectedRows.find(r=>r.termObserved==='SOC').conceptLinkProposals.length,0);
completedNegativeChecks=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-security-operations-deck-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const loc=u=>u.provenance.path+':'+u.provenance.startLine;
const report=`# Phase 2B-5 — security operations/response deck review

**LOCAL, default-off, unwired and learner-invisible. Phase2B-5 NOT READY.** Codex proposals pending owner approval, not publication, activation or trusted evidence. Baseline **${packet.baselineCommit}**; packet SHA-256 **${hashFile(packetPath)}**; audit SHA-256 **${hashFile(scriptPath)}**. Only the packet, this report and focused audit change.

The master plan and Phase1 audit were read in full earlier in this continuing session and remain source-bound. Approved free-Domain1 lesson and free-PBQ versus current preview/coins implementation gaps remain unchanged. This finite review introduces no behavior change or new product-decision conflict.

## Exact finite selection

Exactly **19** baseline objective4.4 inventory-only IDs: **deck:security-operations-response** plus all **18 authored acronym cards**, CAR, CIO/CSO, CIRT/CERT, DRP, IRP, GPO, IPFIX, UEBA, PICERL, CVE, CVSS, PAM, JIT, MSSP, SIEM, SOAR, SOC and XDR. Full IDs, metadata, authored child membership/order and each raw lab/flattened catalogue revision are bound. Source literal **${loc(literalUnits[0])}**, factory **${loc(factoryUnits[0])}**, per-row lines below. Catalogue parentId is absent; raw membership/flattened setId establishes the parent. No chapter4 term deck, other card/deck, glossary, lesson, PBQ or earlier held record receives a new disposition.

**16 qualifying card proposals. CIO/CSO, SOC and the whole parent container are held at zero**, for three new whole-row holds. Every child was inspected; container qualification remains partial because two children are held. Combined cards count once, not once per component; no learner wording is rewritten.

| Identity | Source line | Decision and bounded understanding |
| --- | ---: | --- |
${sourceChecks.map(r=>{const sem=semanticReviews.find(s=>s.recordId===r.recordId);return '| '+r.recordId+' | '+r.sourceCitations[0].line+' | '+(selected.has(r.recordId)?'Draft support; weight0. ':'HOLD; credit0. ')+sem.teachingUnderstanding+' '+sem.contentQualification+' '+sem.limits[0]+' |';}).join('\n')}

Qualifying rows propose existing supporting-concept links at weight0. All primary-concept/precise objective scope/assessed canonical roles/trusted revision fields remain null. Observed4.4/4.5/4.8/4.9 tags are broad metadata, not full objective coverage. No owner approval, question/full-feedback disposition, independent family, calibrated difficulty or demonstrated post-miss recovery.

## Adversarial semantic boundaries

CIO/CSO’s correct expansions and joint duty list do not assign IT direction versus security-risk authority to either executive; the whole card remains held. No CIO/CSO/CISO interchangeability or organization-specific charter is inferred. CIRT/CERT instead supplies a shared incident-handling team purpose; this qualifies as bounded team-label vocabulary without universal team equivalence. [FIRST CSIRT purpose/services section](https://www.first.org/standards/frameworks/csirts/csirt_services_framework_v2.1) explains mission/constituency/service choices rather than identical service portfolios. Two compound-face probes bind exact expansions and complete meanings. Neither proposes component-specific assessment, canonical roles or independent families.

DRP explicitly concerns IT restoration after disruption, while IRP concerns response to a cyber incident. They can coordinate without becoming each other or a complete business-continuity plan. CAR documents corrective action rather than proving implemented remediation. [Microsoft GPO scope/link/filter sections](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-scope) show why centrally managed settings do not establish application to every endpoint or actual hardening; local GPOs also exist.

[RFC7011 abstract/introduction and template examples](https://www.rfc-editor.org/rfc/rfc7011.html) establish flow export/collection with configurable records. IPFIX’s address/port/count examples are not mandatory complete fields or a guarantee of full packet contents, payload visibility, every-packet accounting or forensic completeness. No categorical ban on richer information elements is inferred. The transport/export mechanism is not itself proof of encryption or an actual collector.

[SANS indexed PICERL cheat-sheet excerpt](https://www.sans.org/media/score/504-incident-response-cycle.pdf) corroborates the six named stages. PDF text extraction was empty and the screenshot tool returned no readable image; no full cheat-sheet review is claimed. The source says common, so this is mnemonic vocabulary, not mandatory linear execution or the current NIST model. [NIST61r3 final abstract](https://csrc.nist.gov/pubs/sp/800/61/r3/final) integrates incident response throughout CSF2.0 risk management; phases can overlap/repeat, and no executed response or stage completion is established.

[CVE Program targeted record-change rules](https://github.com/CVEProject/cve-documents/blob/master/CNA_Rules.md) allow records to be updated/rejected. CVE identifies vulnerability records rather than giving severity, proving a valid exploit or identifying affected SecurePlus assets. [FIRST CVSSv4 severity/risk and metric sections](https://www.first.org/cvss/v4.0/user-guide) distinguish base severity from organizational risk and Base/Threat/Environmental score meaning. The authored0.0–10.0 severity wording qualifies without an uncomputed risk score or remediation priority.

PAM is a privileged-access control category, while JIT is a temporary-grant pattern. [Microsoft PIM reasons/features](https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure?WT.mc_id=AZ-MVP-5004810) illustrates time/approval-based activation and audit support; it does not define every PAM product, prove task-end detection or verify revocation. Administrator/root are examples, not the only privileged identities. MSSP is an external service-provider category, not universal24/7 coverage, transferred customer responsibility or an achieved SLA.

SIEM collects/correlates logs for investigation, SOAR orchestrates repeatable playbooks, UEBA flags baseline-relative anomalies, and XDR correlates cross-domain signals. [Microsoft SIEM/XDR integration introduction](https://learn.microsoft.com/en-us/security/zero-trust/siem-xdr-overview) demonstrates coexistence/integration rather than category identity; vendor examples are not a universal taxonomy. No every-log/domain coverage, confirmed maliciousness, safe autonomous response or containment outcome. Configurations, sensors, analysts, permissions and integrations govern results.

**SOC’s operations-center definition is clear, but its support mapping remains held.** The existing sy0701.term.soc node also contains the chip SoC and the already-held multi-meaning SOC glossary. Current record/node/peer revisions are bound by metadata-only collision probes; neither neighboring card nor glossary definition is freshly judged. No chip/center/audit union, replacement node/alias, glossary repair or owner decision is invented. This card is not labeled wrong, and its clearer wording cannot resolve the held identity/glossary or approve the parent deck.

Evidence is targeted primary HTML sections/abstracts and explicitly identified primary indexed excerpts. No full RFC/standard/framework, lifecycle conformance, CVSS calculation, device/network/product deployment, business charter or SLA audit. External sources explain limitations without supplying owner approval.

## Actual delivery and reuse

Source navigation **${loc(navUnit)}**, lab **${loc(labUnit)}**, modes **${loc(modeUnit)}**, chooser **${loc(chooserUnit)}** and eight selector signatures are bound. Standard authored decks/reveals are guest/free accessible; related lessons have account-then-Pro gating and Pro assistant inventory is separate. Definition and acronym modes are available. No examples exist; requested example falls back to definition. **36 pure card-face probes** bind each exact front/main/copy revision in both modes, with no raw learner-text export. Cards use plain faces without glossary overlays or scenario-specific corrective feedback; no grading key.

Chapter4 quick-start position **${deckObservations[0].chapterFilteredQuickStartPosition}**; default quick-start position **${deckObservations[0].defaultQuickStartPosition}** (0 means absent). Browsing and initial study follow all18 authored IDs. Previous/next wrap/reset reveal; shuffle resets the pass. Again/Got it self-rate whole IDs. Completion needs **18 distinct rated cards including Again**; duplicate ratings and an incomplete17-card pass do not complete it. Completion/self-report labels and device/eligible-account persistence do not approve content or create trusted mastery evidence. Buttons/aria are source observations, not a fresh browser accessibility audit. No React, learner state, storage, telemetry, save or sync handler executes.

Source next deck **${reuseProbes[0].nextDeckRecordId}** and ranked Learn More references **${reuseProbes[0].relatedLessonReferences.map(r=>r.recordId).join(', ')}** remain metadata/destination references only, not fresh teaching or approved remediation. Shared current-ID hydration caps at30 and does not preserve historical revisions. Approved free-access gaps remain unchanged.

Synthetic random10 over these18 eligible cards returns indexes0–9; saved hydration normalizes the target20 but returns all18 from the finite pool. This is not a global count/mix guarantee or earlier24-to20 repair. Unknown saved/star IDs drop; reversed stars return global source order. Six synthetic weak-topic probes bind coarse selector outputs/intersections, not actual learner recovery. Eighteen distinct authored triples, modes/flips, compounds, ratings, shuffled/random/saved/star/weak reuse and shared supports add **zero independent families**.

## Exact reconciliation

All **97 preceding substantive packets** reconcile actual question/explanation/instruction arrays, credit identities and file/source hashes. Prior instruction **532 raw/524 distinct**, eight repeated occurrences and six limited uncredited references remain; new16 yield **548 raw/540 distinct**, without limited-link upgrades. All **76 preceding whole-row holds**, **183 prior field bindings**, both IaC/tokenization guide subunits, prior SOC/ZTA/CYOD glossary and chip/card/deck/hybrid/private/unsupported boundaries remain unresolved. Three new holds produce **79 distinct whole-row holds**, with no repeated prior hold added as new credit.

| Kind | Total | Prior | New | Combined pending | Remaining |
| --- | --- | --- | --- | --- | --- |
${catalogueByKind.map(r=>'| '+r.kind+' | '+r.total+' | '+r.prior+' | '+r.new+' | '+r.combined+' | '+r.remaining+' |').join('\n')}

Support **529/834**, remaining305. Catalogue **1430/1878**, remaining448. Cards **196/313**, remaining117; decks **11/29** and glossary **122/162** unchanged. Bank **454/483 question judgments**, **447/483 complete pairs/full feedback**,29 question and36 feedback gaps, including7 older question-only feedback gaps, unchanged. Counts are pending agent proposals, not complete learning coverage.

| Tracked objective | Candidates | Prior | New support | Combined pending | Remaining |
| --- | --- | --- | --- | --- | --- |
${Object.entries(objectiveCoverage).map(([code,{denominator:d}])=>'| '+code+' | '+d.broadCandidates+' | '+d.allPacketPriorDispositions+' | '+d.newTeachingProposals+' | '+d.combinedPendingDispositions+' | '+d.remaining+' |').join('\n')}

Objective4.4 **60/120**, remaining60;4.5 **116/169**, remaining53;4.8 **71/130**, remaining59;4.9 **63/96**, remaining33. Every other tracked objective receives zero new rows, including3.1 **188/220**. Sixteen new global rows create64 observed memberships without quadrupling catalogue credit. The21 tracked censuses bind2863 memberships,1504 distinct records and607 shared rows; no all28-objective coverage claim. Exact objective4.4 remaining IDs:

${objectiveCoverage['4.4'].remainingRecordIds.map(id=>'- '+id).join('\n')}

## Validation and delivery gate

Run \`node ${scriptPath}\` and \`npm run audit:content-mapping\`. Focused checks reject **${negativeMutationChecks}** mutations of source/raw/flat/face/component/identity/peer revisions, child membership/order, complete inspection versus partial qualification, prior holds/subunits, inflated counts/families and invented canonical/scope/trust/owner/weights or forbidden exports. All **286 source bindings**, **25 protected release hashes** and the unchanged ledger are checked; the ordinary command deterministically compares packet and report.

Require all29 mapping tests/deterministic active package, diff --check, skip-marker exit0/control1, task-only three-file **[skip deploy]** commit/push, remote commit/full artifact SHA equality, empty index and all eight unrelated dirty entries preserved. Git push is repository delivery; deployment is skipped.

No learner runtime, private payload, production, fresh browser, migration, Phase3 or activation work. Owner decisions, remaining content/private coverage, precise scope/canonical approval, calibrated/remediation evidence and operational release gates remain open. **Phase2B-5 NOT READY.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_SECURITY_OPERATIONS_DECK_NOT_READY',priorPackets:inventory.length,selectedCandidates:19,newQualifiedCards:16,newDeckContainers:0,newZeroCreditRows:3,priorWholeHolds:76,totalWholeHolds:79,compoundFaceProbes:compoundFaceProbes.length,identityCollisionProbes:identityCollisionProbes.length,negativeMutationChecks,supportProgress,objective44:objectiveCoverage['4.4'].denominator,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
