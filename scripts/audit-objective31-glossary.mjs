import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors,readGlossary} from './lib/content-mapping/delivery-inventory.mjs';
import {SY0701_ACRONYM_CARDS} from '../src/data/sy0701AcronymFlashcards.js';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';

const scriptPath='scripts/audit-objective31-glossary.mjs',packetPath='docs/drafts/phase-2b5-objective31-glossary-proposals.json',reportPath='docs/phase-2b5-objective31-glossary-review.md';
const basePath='docs/drafts/phase-2b5-cloud-endpoint-remaining-cards-proposals.json',baseReport='docs/phase-2b5-cloud-endpoint-remaining-cards-review.md',baseAudit='scripts/audit-cloud-endpoint-remaining-cards.mjs';
assert.equal(hashFile(basePath),'f357c2c128228b328f61fbd5aba8db4123402eebe9f525418df2fe3964b05cfc');
assert.equal(hashFile(baseReport),'d4eccfa0d962d3f83ace713b1590255c210aaaecd36f2ff5ed7cc7f1350c37da');
assert.equal(hashFile(baseAudit),'b54b49a940c509562a0979849a403d62471d5c7eb31ce1104f0d44d08a213177');
const base=readJson(basePath),c=readReviewTriage();verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const priorCensus=new Map(base.catalogueCensus.map(r=>[r.recordId,r])),priorRemaining=new Set(base.remainingCatalogueRecordIds);
assert.equal(priorCensus.size,1878);assert.equal(priorRemaining.size,474);
const previous=new Set(c.pkg.records.filter(r=>!priorRemaining.has(r.id)).map(r=>r.id));assert.equal(previous.size,1404);
for(const r of c.pkg.records){const old=priorCensus.get(r.id);assert(old);assert.equal(old.sourceRevision,r.sourceSignature);assert.equal(old.kind,r.kind);assert.equal(previous.has(r.id),['prior_agent_disposition_pending_owner','new_card_proposal_pending_owner','new_partial_deck_proposal_pending_owner','new_glossary_proposal_pending_owner','new_teaching_proposal_pending_owner'].includes(old.status));}
// Reuse the immutable preceding census; reconcile its credited identities against the actual bound disposition arrays.
const inventory=[...base.allPacketReconciliation.inventory,{path:basePath,sha256:hashFile(basePath),substantiveRows:base.questionProposals.length+base.explanationProposals.length+base.instructionalProposals.length}].sort((a,b)=>a.path.localeCompare(b.path));
assert.equal(inventory.length,96);const actualInventory=readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')&&'docs/drafts/'+n!==packetPath).map(n=>'docs/drafts/'+n).filter(path=>['instructionalProposals','questionProposals','explanationProposals'].some(k=>Array.isArray(readJson(path)[k]))).sort();
assert.deepEqual(actualInventory,inventory.map(r=>r.path).sort());
const fullReferences=new Set(),instructionalOccurrences=[];
for(const entry of inventory){assert.equal(hashFile(entry.path),entry.sha256);const p=readJson(entry.path);verifySourceBindings(Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256})));const rows=['questionProposals','explanationProposals','instructionalProposals'].flatMap(k=>p[k]||[]);assert.equal(rows.length,entry.substantiveRows);
 for(const row of rows){const r=c.records.get(row.recordId);assert(r);assert.equal(row.publishedRecordSignature??row.sourceRevision,r.sourceSignature);if(previous.has(r.id))fullReferences.add(r.id);}
 for(const row of p.instructionalProposals||[])instructionalOccurrences.push(row.recordId);
}
assert.deepEqual([...fullReferences].sort(),[...previous].sort());assert.equal(instructionalOccurrences.length,522);assert.equal(new Set(instructionalOccurrences).size,514);
const terms=['CASB','CYOD','HIDS','HIPS','IaaS','IAM','NIDS','PaaS','RAID','SaaS','SASE','SOC','ZTA'],glossId=term=>'glossary:'+term.toLowerCase(),candidateRecordIds=terms.map(glossId);
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(kind=>[kind,rows.filter(r=>r.kind===kind).length]));
const carriedSelectedHoldReferences=base.priorHeldRows.filter(r=>candidateRecordIds.includes(r.recordId));assert.deepEqual(carriedSelectedHoldReferences.map(r=>r.recordId),['glossary:cyod']);
const freshCandidateRecordIds=candidateRecordIds.filter(id=>!carriedSelectedHoldReferences.some(r=>r.recordId===id));assert.equal(freshCandidateRecordIds.length,12);
for(const id of candidateRecordIds){assert(!previous.has(id));assert(base.objectiveCoverage['3.1'].remainingRecordIds.includes(id));assert.equal(priorCensus.get(id).sourceRevision,c.records.get(id).sourceSignature);assert(!instructionalOccurrences.includes(id));assert.equal(priorCensus.get(id).status,id==='glossary:cyod'?'zero_credit_prior_or_selected_hold':'inventory_only_unreviewed');}
const selectionDiscrepancy={all13InventoryOnly:false,freshInventoryOnlyCount:12,carriedPriorHoldCount:1,carriedRecordId:'glossary:cyod',resolution:'preserve_bound_prior_hold_zero_without_new_disposition_or_duplicate_hold_count',behaviorChanged:false};
const g=readGlossary(),unit=(a,b)=>sourceUnit('src/App.jsx',a,b);
const renderer=unit('function GlossaryText(','function PBQProseText('),entry=unit('  const getEntry=term=>{','  const splitGlossaryParts='),parts=unit('  const splitGlossaryParts=','  const parts=parseInlineFormats(text)'),format=unit('function parseInlineFormats(','function GlossaryText('),matcher=unit('  const terms=Object.keys(GLOSSARY_TERMS).sort','  const getEntry=term=>'),stemSplit=unit('function splitQuestionStem(','function QuestionStemText('),stem=unit('function QuestionStemText(','function ChBadge('),mcq=unit('function MCQPractice(','function UpgradeModal('),lesson=unit('function ConceptDeepDivesPage(','function FlashcardsPage('),bites=unit('function DeepDiveReadableBites(','function ConceptDeepDivesPage('),sentence=unit('function splitReadableSentences(','function expectedExamSeconds('),pbq=unit('function PBQSim(','function ExamModeGuideModal('),prose=unit('function PBQProseText(','function splitQuestionStem('),lab=unit('function AcronymFlashcardLab(','function DeepDiveReadableBites(');
const wrongFeedbackUnit=unit('function getWrongOptionFeedback(','function MCQFeedbackVerdict(');
const deliveryUnits=[renderer,entry,parts,format,matcher,stemSplit,stem,mcq,lesson,bites,sentence,pbq,prose,lab,wrongFeedbackUnit];
const wrongFeedback=Function(wrongFeedbackUnit.code+';return getWrongOptionFeedback;')();
const delivery=Function('GLOSSARY_TERMS',format.code+matcher.code+entry.code+parts.code+';return {getEntry,parts:value=>parseInlineFormats(value).flatMap(s=>splitGlossaryParts(s.text,s)).map(p=>({...p,canonicalTerm:p.term?normalize(p.text):null}))};')(g.terms);
const splitStem=Function(stemSplit.code+';return splitQuestionStem;')(),splitSentence=Function(sentence.code+';return splitReadableSentences;')();
for(const marker of ['role="button"','tabIndex={0}','aria-expanded={openTerm===key}','e.key!=="Enter"&&e.key!==" "','setOpenTerm(openTerm===key?null:key)','document.addEventListener("pointerdown",close,true)','getEntry(term).fullName','getEntry(term).definition'])assert(renderer.code.includes(marker));
assert(!renderer.code.includes('user.tier')&&!renderer.code.includes('<GlossaryText'));assert(!lab.code.includes('GlossaryText'));
for(const marker of ['const canSeeFeedback = user.tier === "pro"','<QuestionStemText text={current.q}','<GlossaryText text={opt}','disabled={submitted}','<GlossaryText text={getWrongOptionFeedback(current, i)}','<GlossaryText text={current.exp}'])assert(mcq.code.includes(marker));
assert(stem.code.includes('<GlossaryText text={question}')&&stem.code.includes('<GlossaryText text={context}'));assert(bites.code.includes('<GlossaryText text={item.first}')&&bites.code.includes('<GlossaryText text={item.rest}'));
const appLines=readFileSync('src/App.jsx','utf8').split('\n');
const sourceChecks=terms.map(term=>{const r=c.records.get(glossId(term)),authored=g.terms[term],rendered=delivery.getEntry(term),location=g.definitionLocations[term];assert.equal(sig({term,definition:authored}),r.sourceSignature);assert.equal(sig(authored),r.definitionSignature);assert.deepEqual(rendered,authored);assert.equal(r.kind,'glossary_definition');assert.equal(r.precision,'support_only');assert.equal(r.trustedRevisionId,null);assert.equal(r.contentSha256,null);assert.equal(c.pkg.concepts.find(n=>n.id===r.primaryConceptId)?.nodeKind,'supporting_concept');assert(appLines[location.line-1].trimStart().startsWith(JSON.stringify(term)+':'));assert.equal(typeof authored,'object');assert.equal(delivery.getEntry(term.toLowerCase()).definition,'');
 return{recordId:r.id,kind:r.kind,sourceOrderIndex:Object.keys(g.terms).indexOf(term),priorDispositionStatus:priorCensus.get(r.id).status,freshSemanticDisposition:term!=='CYOD',subunits:['fullName','definition'].map(field=>({fieldPath:field,sourceRevision:sig(rendered[field])})),termObserved:term,sourceRevision:r.sourceSignature,definitionRevision:r.definitionSignature,renderedEntryRevision:sig(rendered),renderedFullNameRevision:sig(rendered.fullName),renderedDefinitionRevision:sig(rendered.definition),definitionShape:'object',sourceCitations:[{...location,anchorRevision:sig(appLines[location.line-1]),fileSha256:hashFile('src/App.jsx')}],objectiveCodesObserved:r.objectiveCodes,existingPrimarySupportCandidate:r.primaryConceptId,trustedRevisionObserved:null,precisionObserved:r.precision,publicationStatusObserved:r.publicationStatus,sourcePrecedence:'ACRONYM_GLOSSARY_TERMS_spread_into_GLOSSARY_TERMS_direct_lookup_no_question_override',caseNormalizationOccursBeforeLookup:true,fullNameIsAutomaticAlias:false,contentInvented:false};});
assert.deepEqual(sourceChecks.map(r=>r.recordId),candidateRecordIds);
const glossaryMatcherProbes=[];
for(const term of terms){for(const [input,selectedTermMatched,boundary] of [...[term,term.toLowerCase(),'**'+term+'**','__'+term+'__','=='+term+'==','('+term+')'].map(v=>[v,true,'exact_case_or_format']),...['A'+term+'9',term+'x',term.slice(0,1)+'**'+term.slice(1)+'**',g.terms[term].fullName,term+'s'].map(v=>[v,false,'extension_split_or_unregistered_alias']),['é'+term,true,'non_ASCII_letter_is_boundary'],['_'+term+'_',true,'underscore_is_boundary'],['A**'+term+'**9',true,'format_segment_resets_boundary'],[term+' / '+term,true,'repeat_not_new_evidence']]){const result=delivery.parts(input),matched=[...new Set(result.map(p=>p.canonicalTerm).filter(Boolean))];assert.equal(g.matchTerms(input).includes(term),selectedTermMatched);assert.equal(matched.includes(term),selectedTermMatched);glossaryMatcherProbes.push({recordId:glossId(term),inputRevision:sig(input),selectedTermMatched,boundary,renderedPartsRevision:sig(result),matchedTermsRevision:sig(matched),freshBrowserObserved:false,newEvidence:0});}}
assert.equal(glossaryMatcherProbes.length,195);
const collisionProbes=['CASB/CYOD','HIDS HIPS NIDS','IaaS PaaS SaaS','IAM/RAID','SASE/SOC/ZTA'].map(input=>{const expected=input.split(/[ /]+/).sort();assert.deepEqual(g.matchTerms(input),expected);assert.deepEqual([...new Set(delivery.parts(input).map(p=>p.canonicalTerm).filter(Boolean))].sort(),expected);return{inputRevision:sig(input),matchedTerms:expected,renderedPartsRevision:sig(delivery.parts(input)),longestFirstObserved:true,newEvidence:0};});
const usageInventory=terms.map(term=>{const r=c.records.get(glossId(term));return{recordId:r.id,sourceReferenceCount:r.usageReferences.length,status:'lexical_source_union_not_delivery_or_scope_approval',references:r.usageReferences.map(ref=>{const current=c.records.get(ref.recordId);assert.equal(ref.sourceSignature,current.sourceSignature);const q=c.questions.get(ref.recordId);return{recordId:current.id,kind:current.kind,sourceRevision:current.sourceSignature,localRevision:q?sig(q.q):null,objectiveCodesObserved:current.objectiveCodes,previouslyCredited:previous.has(current.id),status:'source_reference_only_not_new_parent_disposition',glossaryDeliveryProven:false,approvalTransferred:false,newCredit:0};})};});assert.deepEqual(usageInventory.map(r=>r.sourceReferenceCount),[3,3,2,1,9,4,2,4,5,5,1,9,1]);
const surfaceProbes=[];for(const term of terms)for(const ref of c.records.get(glossId(term)).usageReferences.filter(r=>r.recordId.startsWith('mcq:'))){const s=c.questions.get(ref.recordId);for(const [fieldGroup,values] of [['stem',Object.values(splitStem(s.q.q))],['options',s.q.opts],['main_feedback',[s.q.exp]],['wrong_feedback',s.q.opts.flatMap((_opt,index)=>index===s.q.correct?[]:[wrongFeedback(s.q,index)])]])if(values.some(text=>typeof text==='string'&&g.matchTerms(text).includes(term)))surfaceProbes.push({recordId:glossId(term),parentRecordId:ref.recordId,parentSourceRevision:s.record.sourceSignature,parentLocalRevision:sig(s.q),fieldGroup,fieldGroupRevision:sig(values),renderedPartsRevision:sig(values.filter(v=>typeof v==='string').map(delivery.parts)),gate:fieldGroup.includes('feedback')?'selected_question_submitted_Pro_feedback':'selected_question_visible_'+fieldGroup,interactionAfterSubmission:fieldGroup==='options'?'disabled_option_ancestor_browser_interaction_unverified':'not_exercised',sourceMatcherVerified:true,freshBrowserObserved:false,newParentDisposition:0});}
const lessonDeliveryProbes=[],plainLessonReferences=[];for(const term of terms)for(const ref of c.records.get(glossId(term)).usageReferences.filter(r=>r.recordId.startsWith('lesson:'))){const d=CONCEPT_DEEP_DIVES.find(d=>'lesson:'+d.id===ref.recordId);assert.equal(sig({d,profile:getSy0701DeepDiveProfile(d)}),ref.sourceSignature);for(const[sIndex,s]of d.sections.entries()){assert.equal(sig(s),c.records.get('section:'+d.id+':'+sIndex).sourceSignature);for(const[pIndex,text]of(s.body||[]).entries()){const sentences=splitSentence(text),pieces=[sentences[0]||text,sentences.slice(1).join(' ')];for(const[index,piece]of pieces.entries())if(g.matchTerms(piece).includes(term))lessonDeliveryProbes.push({recordId:glossId(term),lessonRecordId:ref.recordId,lessonRevision:ref.sourceSignature,parentRecordId:'section:'+d.id+':'+sIndex,parentRevision:sig(s),fieldPath:'body['+pIndex+']',renderedSegment:index?'collapsed_supporting_detail':'first_sentence',renderedSegmentRevision:sig(piece),renderedPartsRevision:sig(delivery.parts(piece)),gate:'selected_Pro_lesson_section'+(index?'_detail_open':''),sourceMatcherVerified:true,freshBrowserObserved:false,newParentDisposition:0});}const cells=(s.table?.rows||[]).flat().filter(v=>typeof v==='string'&&g.matchTerms(v).includes(term));if(cells.length)plainLessonReferences.push({recordId:glossId(term),parentRecordId:'section:'+d.id+':'+sIndex,parentRevision:sig(s),matchedCellsRevision:sig(cells),renderer:'plain_table_cells_without_GlossaryText',glossaryDeliveryProven:false,newParentDisposition:0});}}
const cardOverlapObservations=usageInventory.flatMap(r=>r.references.filter(ref=>ref.kind==='flashcard').map(ref=>{const card=SY0701_ACRONYM_CARDS.find(card=>'flashcard:'+card.id===ref.recordId);assert(card);assert.equal(sig(card),ref.sourceRevision);return{glossaryRecordId:r.recordId,cardRecordId:ref.recordId,cardSourceRevision:ref.sourceRevision,parentDeckRecordId:'deck:'+card.setId,status:'plain_flashcard_face_not_glossary_tooltip_route',glossaryDeliveryProven:false,newCardCredit:0,approvalTransferred:false};}));
assert.deepEqual(sourceChecks.map(r=>r.sourceCitations[0].line),[2258,2273,2299,2300,2306,2307,2332,2341,2351,2359,2362,2369,2392]);
assert(sourceChecks.every((r,i)=>i===0||r.sourceOrderIndex>sourceChecks[i-1].sourceOrderIndex));
// The matcher is case-insensitive and context-free; chip casing cannot select a separate chip definition.
const identityCollisionProbes=['SOC','soc','SoC','System on Chip','Security Operations Center'].map(input=>{const matched=g.matchTerms(input),out=delivery.parts(input),socMatched=matched.includes('SOC');assert.equal(socMatched,['SOC','soc','SoC'].includes(input));const normalized=out.filter(p=>p.canonicalTerm==='SOC').map(p=>p.canonicalTerm);return{inputRevision:sig(input),socMatched,normalizedTermReferences:normalized,renderedPartsRevision:sig(out),resolvedEntryRevision:socMatched?sig(delivery.getEntry(normalized[0])):null,contextSensitiveResolution:false,chipMeaningResolved:false,neighborApprovalTransferred:false,newCredit:0};});
const soc=c.records.get('glossary:soc'),socNode=c.pkg.concepts.find(n=>n.id===soc.primaryConceptId);
const identityPeerReferences=['flashcard:sy0701-acronym-cloud-endpoint-infrastructure-soc-system-on-chip','flashcard:sy0701-acronym-security-operations-response-soc-security-operations-center'].map(id=>{const r=c.records.get(id);assert.equal(r.primaryConceptId,soc.primaryConceptId);return{recordId:id,sourceRevision:r.sourceSignature,existingSupportConcept:r.primaryConceptId,neighborPayloadReviewed:false,newDisposition:0};});
const socIdentityBoundary={recordId:soc.id,sourceRevision:soc.sourceSignature,existingSupportConcept:soc.primaryConceptId,supportNodeRevision:sig(socNode),peerReferences:identityPeerReferences,chipCenterAuditMeaningsKeptDistinct:true,mergedIdentityQualified:false,ownerDisambiguationPending:true,replacementNodeInvented:false,newLinkCredit:0};
const decisions={
 "CASB": [
  "Recognize a policy-enforcement broker role between users and cloud services.",
  "Qualified as logical policy mediation, not necessarily an inline proxy for every request.",
  "API/log/proxy integrations can differ; no automatic coverage of all services, provider duties, authentication or encrypted paths."
 ],
 "CYOD": [
  "Carry the earlier CYOD definition hold without a fresh semantic disposition.",
  "PRESERVED PRIOR HOLD: approved-list choice does not establish enterprise ownership; the bound prior decision remains unresolved.",
  "No new glossary credit, policy/privacy/wipe inference, learner rewrite or approval from the compound card."
 ],
 "HIDS": [
  "Recognize host/local-activity monitoring and suspicious-behavior alerts.",
  "Qualified as host-based detection vocabulary, distinct from network observation and prevention.",
  "Visibility and configuration limit detection; alerts do not automatically block attacks or guarantee a secure endpoint."
 ],
 "HIPS": [
  "Recognize host-based prevention that can block suspicious local activity.",
  "Qualified with the authored can-block boundary, distinct from detection alone and network prevention.",
  "Blocking depends on configured policy and capabilities; false positives and bypasses remain possible, with no guaranteed prevention."
 ],
 "IaaS": [
  "Recognize provider compute/storage/network resources with customer operating systems and applications.",
  "Qualified as an explicit infrastructure-service capability/control contrast.",
  "Provider underlying infrastructure versus customer OS/apps is not a complete security-duty matrix; data, identities, configuration and provider-specific controls remain separate."
 ],
 "IAM": [
  "Recognize identity, authentication, authorization and access-right management as systems and processes.",
  "Qualified because the definition names these distinct functions rather than treating successful authentication as authorization.",
  "Policy, identity lifecycle, least privilege and actual enforcement remain necessary; no login automatically grants every resource or proves safe access."
 ],
 "NIDS": [
  "Recognize detection of suspicious network packet/traffic patterns.",
  "Qualified as network-based detection vocabulary, distinct from host telemetry and traffic blocking.",
  "Sensor placement, encrypted traffic, signatures and false positives limit visibility; no automatic prevention or every-packet assurance."
 ],
 "PaaS": [
  "Recognize provider-managed application runtimes/platforms with developer-deployed applications.",
  "Qualified as an explicit platform-service capability contrast, distinct from customer OS management or provider-hosted ready applications.",
  "Application/data/identity/configuration responsibilities remain; no universal managed component list or complete security-duty matrix."
 ],
 "RAID": [
  "Recognize a multi-drive storage layout for performance, parity or fault tolerance.",
  "Qualified with the source alternative purposes; not every RAID level provides parity or redundancy.",
  "RAID0 has no fault tolerance; supported redundancy addresses certain drive failures, not deletion/ransomware/disaster. RAID is not backup or guaranteed recoverability/performance."
 ],
 "SaaS": [
  "Recognize provider-operated applications accessed by users.",
  "Qualified as provider-managed application-stack capability, not a claim the provider owns all customer security duties.",
  "User-specific settings, customer identities, data and access governance remain; no complete security-duty matrix, all-data protection or infrastructure-control guarantee."
 ],
 "SASE": [
  "Recognize a cloud-delivered network-routing plus edge-security architecture.",
  "Qualified as architectural convergence, distinct from a measured security outcome.",
  "Configuration, routing, identity and implementation govern protection; no automatic zero trust, every-path inspection or guaranteed security."
 ],
 "SOC": [
  "Recognize that the glossary combines an operations team/facility and assurance-report meanings.",
  "HOLD: the context-free entry and existing support identity also overlap the distinct system-on-chip meaning; the generic audit expansion is historical rather than the current System and Organization Controls name.",
  "Correct Center vocabulary cannot approve the complete multi-meaning record or node. No chip/operations/audit identity union, new alias/node or approval transfer; owner disambiguation remains pending."
 ],
 "ZTA": [
  "Recognize the expansion but hold the slogan-only architecture definition.",
  "HOLD: never-trust/always-verify alone omits resource-access authorization and removal of implicit trust based solely on location or ownership.",
  "No per-resource policy basis, subject/device authorization distinction or actual verified architecture is supplied. Review notes cannot repair the definition or resolve the independently held ZTA card."
 ]
};
const heldCardTerms=['CYOD','SOC','ZTA'],heldIds=sourceChecks.filter(r=>heldCardTerms.includes(r.termObserved)).map(r=>r.recordId),heldSet=new Set(heldIds),selectedRecordIds=candidateRecordIds.filter(id=>!heldSet.has(id)),selected=new Set(selectedRecordIds);assert.equal(heldIds.length,3);assert.equal(selected.size,10);
const semanticReviews=sourceChecks.map(r=>{const[teachingUnderstanding,contentQualification,limit]=decisions[r.termObserved];return{recordId:r.recordId,sourceRevision:r.sourceRevision,freshSemanticDisposition:r.freshSemanticDisposition,semanticallyQualifiedAsBoundedDraft:selected.has(r.recordId),teachingUnderstanding,contentQualification,limits:[limit,'Observed objective metadata is not precise assessed scope; no owner approval, trusted evidence or independent family.']};});
const zeroBoundary={roleProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],objectiveScopeProposal:null,assessedCanonicalRoleProposals:[],masteryWeight:0,trustedRevisionId:null,humanApproved:false,published:false,independentEvidence:false,canonicalApprovalTransferred:false,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0};
const proposal=r=>{const sem=semanticReviews.find(s=>s.recordId===r.recordId);return{...r,...zeroBoundary,status:selected.has(r.recordId)?'CODEX_GLOSSARY_PROPOSAL_PENDING_OWNER_APPROVAL':'ZERO_CREDIT_GLOSSARY_CONTENT_DEFERRED',teachingUnderstanding:sem.teachingUnderstanding,contentQualification:sem.contentQualification,qualificationHolds:sem.limits,conceptLinkProposals:selected.has(r.recordId)?[{conceptId:r.existingPrimarySupportCandidate,role:'instructional_support_only',weight:0,status:'candidate_pending_owner_no_canonical_approval'}]:[],newGlossaryContentProposalCredit:selected.has(r.recordId)?1:0,newCardContentProposalCredit:0,newDeckContainerProposalCredit:0,...(!selected.has(r.recordId)?{reason:sem.contentQualification}:{}),deliveryRoleObserved:'conditional_inline_glossary_popup_support',familyRelation:'same_authored_definition_case_format_repeat_usage;no_independent_assessment',postMissUsefulnessProposal:{approvedRemediation:false,weight:0,status:'vocabulary_support_no_observed_recovery'}};};
const instructionalProposals=sourceChecks.filter(r=>selected.has(r.recordId)).map(proposal),deferredSelectedRows=sourceChecks.filter(r=>heldSet.has(r.recordId)&&r.freshSemanticDisposition).map(proposal);assert.deepEqual(deferredSelectedRows.map(r=>r.recordId),['glossary:soc','glossary:zta']);
const selectorBindings=readSelectors().filter(s=>s.id==='glossary-delivery').map(s=>({recordId:'intervention:'+s.id,sourceRevision:s.sourceSignature,limitation:s.selector.mappingDependencies}));assert.equal(selectorBindings.length,1);assert.equal(selectorBindings[0].sourceRevision,c.records.get(selectorBindings[0].recordId).sourceSignature);
const inheritedFields=['priorHoldBindings','priorHeldRows','deferredSelectedRows','canonicalBoundary','remainingBankFeedback','remainingBankQuestions','deliveryObservations','instructionalProposals','semanticReviews','heldGuideSubunitReferences','deckObservations','faceProbes','compoundFaceProbes','duplicateObservations','identityCollisionProbes'];
const priorHoldBindings=[...base.priorHoldBindings,...inheritedFields.map(field=>{assert(field in base);return{packetPath:basePath,field,sourceRevision:sig(base[field]),resolved:false,newCredit:0};})];
assert.equal(priorHoldBindings.length,160);
for(const r of priorHoldBindings){assert.equal(sig(readJson(r.packetPath)[r.field]),r.sourceRevision);assert.equal(r.resolved,false);assert.equal(r.newCredit,0);}
const priorHeldRows=[...base.priorHeldRows,...base.deferredSelectedRows.map(row=>({recordId:row.recordId,sourceRevision:c.records.get(row.recordId).sourceSignature,priorDispositionRevision:sig(row),packetPath:basePath,field:'deferredSelectedRows',status:row.status,resolved:false,newCredit:0}))];
assert.equal(priorHeldRows.length,74);assert.equal(new Set(priorHeldRows.map(r=>r.recordId)).size,74);
for(const row of priorHeldRows){assert(!previous.has(row.recordId)&&!selected.has(row.recordId));assert(priorRemaining.has(row.recordId));assert.equal(c.records.get(row.recordId).sourceSignature,row.sourceRevision);assert.equal(sig(readJson(row.packetPath)[row.field].find(r=>r.recordId===row.recordId)),row.priorDispositionRevision);}
const independentGlossaryHoldBindings=['glossary:cyod','glossary:srtp','glossary:ssh'].map(id=>{const row=priorHeldRows.find(r=>r.recordId===id);assert(row);return{...row,lessonApprovalTransferred:false};});
const unsupportedRef=priorHoldBindings.find(r=>r.field==='unsupportedDesignBoundary'),unsupported=readJson(unsupportedRef.packetPath).unsupportedDesignBoundary;assert.equal(unsupported.rows.length,23);for(const r of unsupported.rows){assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert(!selected.has(r.recordId));}
for(const id of ['private:pbq:p003','private:explanation:pbq:p003','private:pbq:p017','private:explanation:pbq:p017']){assert.equal(c.records.get(id).trustedRevisionId,null);assert(!previous.has(id)&&!selected.has(id));}
const censusRow=r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:previous.has(r.id)?'prior_agent_disposition_pending_owner':selected.has(r.id)?'new_teaching_proposal_pending_owner':heldSet.has(r.id)||priorCensus.get(r.id).status.startsWith('zero_credit')?'zero_credit_prior_or_selected_hold':'inventory_only_unreviewed'});
const coverageCodes=Object.keys(base.objectiveCoverage).sort();
const objectiveCoverage={};for(const code of coverageCodes){const rows=c.pkg.records.filter(r=>r.objectiveCodes.includes(code)),prior=rows.filter(r=>previous.has(r.id)),fresh=rows.filter(r=>selected.has(r.id)),remaining=rows.filter(r=>!previous.has(r.id)&&!selected.has(r.id));if(base.objectiveCoverage[code])assert.equal(prior.length,base.objectiveCoverage[code].denominator.combinedPendingDispositions);else assert(prior.every(r=>fullReferences.has(r.id)));objectiveCoverage[code]={denominator:{broadCandidates:rows.length,allPacketPriorDispositions:prior.length,newTeachingProposals:fresh.length,newQuestionDispositions:0,newFeedbackDispositions:0,combinedPendingDispositions:prior.length+fresh.length,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivate:remaining.filter(r=>r.id.startsWith('private:')).length,priorByKind:counts(prior),newByKind:counts(fresh),remainingByKind:counts(remaining)},census:rows.map(censusRow),remainingRecordIds:remaining.map(r=>r.id)};}
assert.deepEqual([objectiveCoverage['4.1'].denominator.allPacketPriorDispositions,objectiveCoverage['4.1'].denominator.newTeachingProposals,objectiveCoverage['4.1'].denominator.combinedPendingDispositions,objectiveCoverage['4.1'].denominator.remaining],[187,0,187,16]);
const expectedNewMemberships={'3.1':10,'3.2':2,'3.3':8,'3.4':9,'4.4':1,'4.6':2,'4.7':3};for(const[code,v]of Object.entries(objectiveCoverage))assert.equal(v.denominator.newTeachingProposals,expectedNewMemberships[code]||0);
const catalogueByKind=Object.keys(counts(c.pkg.records)).map(kind=>{const rows=c.pkg.records.filter(r=>r.kind===kind),prior=rows.filter(r=>previous.has(r.id)).length,fresh=rows.filter(r=>selected.has(r.id)).length;return{kind,total:rows.length,prior,new:fresh,combined:prior+fresh,remaining:rows.length-prior-fresh};});
for(const[k,total,combined]of [['flashcard',313,180],['deck_container',29,11],['glossary_definition',162,122],['lesson',32,21],['keyword_guide',32,21],['lesson_traps',32,21],['lesson_section',106,66],['lesson_check',128,71]])assert.deepEqual([catalogueByKind.find(r=>r.kind===k).total,catalogueByKind.find(r=>r.kind===k).combined],[total,combined]);
const sum=key=>catalogueByKind.filter(r=>base.supportProgress.kindScope.includes(r.kind)).reduce((n,r)=>n+r[key],0),supportProgress={kindScope:base.supportProgress.kindScope,denominator:sum('total'),priorFullDispositions:sum('prior'),newQualifiedGlossaryProposals:10,newQualifiedCardProposals:0,newQualifiedDeckContainerProposals:0,combinedPending:sum('combined'),remaining:sum('remaining'),limitedPriorReferencesStillUnreviewed:6,newQuestionJudgments:0,newFeedbackJudgments:0};assert.deepEqual([sum('total'),sum('prior'),sum('combined'),sum('remaining')],[834,503,513,321]);
const bankProgress=base.bankProgress;assert.equal(c.ledger.rows.filter(r=>previous.has(r.recordId)).length,454);assert.equal(c.ledger.rows.filter(r=>previous.has('explanation:'+r.recordId)).length,447);assert.equal(bankProgress.completePairs,447);assert.equal(bankProgress.olderQuestionOnlyFullFeedbackGaps,7);
const memberships=new Map();for(const[code,v]of Object.entries(objectiveCoverage))for(const r of v.census)memberships.set(r.recordId,[...(memberships.get(r.recordId)||[]),code]);const sharedObjectiveRecords=[...memberships].filter(([,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));for(const r of sourceChecks)assert.deepEqual(memberships.get(r.recordId),r.objectiveCodesObserved.filter(code=>coverageCodes.includes(code)));
const affectedCodes=Object.keys(expectedNewMemberships),priorOverlapReferences=c.pkg.records.filter(r=>previous.has(r.id)&&r.objectiveCodes.some(code=>affectedCodes.includes(code))).map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,objectiveCodesObserved:r.objectiveCodes,priorDispositionBoundBy:basePath,relation:'metadata_overlap_only_no_approval_or_new_credit'}));
const preservedHybridHoldBinding=priorHeldRows.find(r=>r.recordId==='section:platform-cloud-hardening:1');assert(preservedHybridHoldBinding);assert.equal(preservedHybridHoldBinding.resolved,false);
assert.deepEqual([objectiveCoverage['3.1'].denominator.allPacketPriorDispositions,objectiveCoverage['3.1'].denominator.newTeachingProposals,objectiveCoverage['3.1'].denominator.combinedPendingDispositions,objectiveCoverage['3.1'].denominator.remaining],[178,10,188,32]);
assert.deepEqual([objectiveCoverage['4.2'].denominator.combinedPendingDispositions,objectiveCoverage['4.2'].denominator.remaining],[59,9]);assert.deepEqual([objectiveCoverage['2.5'].denominator.combinedPendingDispositions,objectiveCoverage['2.5'].denominator.remaining],[61,5]);
for(const id of ['section:platform-cloud-hardening:1','section:cloud-containers-automation:1','practice:ot-iot-cyber-physical:practice-keyword-0','practice:ot-iot-cyber-physical:practice-keyword-1','glossary:phi'])assert(priorHeldRows.some(r=>r.recordId===id&&r.resolved===false&&r.newCredit===0));
const heldGuideSubunitReferences=priorHoldBindings.filter(r=>r.field==='heldGuideSubunits').map(r=>({...r,subunitBindings:readJson(r.packetPath)[r.field].map(s=>({recordId:s.recordId,fieldPath:s.fieldPath,sourceRevision:s.sourceRevision,resolved:s.resolved,newCredit:s.newCatalogueCredit}))}));
for(const id of ['keywords:cloud-containers-automation','keywords:data-classification-lifecycle'])assert(heldGuideSubunitReferences.some(r=>r.subunitBindings.some(s=>s.recordId===id&&s.resolved===false&&s.newCredit===0)));
const outOfTrackedObjectiveReferences=sourceChecks.flatMap(r=>r.objectiveCodesObserved.filter(code=>!coverageCodes.includes(code)).map(code=>({recordId:r.recordId,objectiveCodeObserved:code,status:'observed_metadata_only_outside_existing_tracked_censuses',newProposalCredit:selected.has(r.recordId)?1:0,censusExtended:false})));assert.deepEqual(outOfTrackedObjectiveReferences.map(r=>[r.recordId,r.objectiveCodeObserved,r.newProposalCredit]),[['glossary:soc','5.5',0]]);
const independentContentHoldBindings=priorHeldRows.filter(r=>['flashcard:sy0701-acronym-cloud-endpoint-infrastructure-mac-media-access-control-address','flashcard:sy0701-acronym-cloud-endpoint-infrastructure-soc-system-on-chip','flashcard:sy0701-acronym-cloud-endpoint-infrastructure-byod-cope-cyod-bring-your-own-device-corporate-owned-personally-enabled-choose-your-own-device','flashcard:sy0701-acronym-cloud-endpoint-infrastructure-iaas-paas-saas-infrastructure-platform-software-as-a-service','flashcard:sy0701-acronym-chapter3-architecture-resilience-acronyms-zta-zero-trust-architecture'].includes(r.recordId)).map(r=>({...r,glossaryApprovalTransferred:false,newCardDisposition:0}));assert.equal(independentContentHoldBindings.length,5);
const externalReferences=[
 [
  "https://learn.microsoft.com/en-us/compliance/assurance/assurance-data-exfiltration-access-controls",
  "Relevant CASB deployment section: log, API and reverse-proxy integrations; no all-service or inline-only guarantee."
 ],
 [
  "https://csrc.nist.gov/pubs/sp/800/94/final",
  "Final abstract: host/network IDPS classes and distinct detection/prevention technologies. Historical2007 final, no full standard review or current product assertion."
 ],
 [
  "https://csrc.nist.gov/glossary/term/infrastructure_as_a_service",
  "Full NIST800-145 glossary definition: provider underlying infrastructure and customer OS/app control."
 ],
 [
  "https://csrc.nist.gov/glossary/term/platform_as_a_service",
  "Full NIST800-145 glossary definition: provider platform and customer deployed applications/configuration."
 ],
 [
  "https://csrc.nist.gov/glossary/term/software_as_a_service",
  "Full NIST800-145 glossary definition: provider applications and limited user-specific settings."
 ],
 [
  "https://csrc.nist.gov/glossary/term/authentication",
  "Primary indexed definition: identity verification often precedes resource access. Indexed excerpt only, no current identity-system verification."
 ],
 [
  "https://cloud.ibm.com/docs/bare-metal?locale=en&topic=bare-metal-bm-raid-levels",
  "Relevant RAID0/no-fault-tolerance and not-backup sections only. Other table claims and historical controllers not approved or generalized."
 ],
 [
  "https://www.cisco.com/c/en/us/products/security/what-is-sase-secure-access-service-edge.html?ccid=cc003036",
  "Primary indexed architecture definition: converged cloud networking/security; no implementation or outcome guarantee."
 ],
 [
  "https://www.aicpa.com/resources/article/aicpa-system-and-organization-controls-communications-guidelines",
  "Primary indexed naming statement:2017 System and Organization Controls replaces prior generic service-organization naming. Indexed excerpt only; no assurance engagement review."
 ],
 [
  "https://csrc.nist.gov/pubs/sp/800/207/final",
  "Final abstract: resource focus, no implicit trust from location/ownership and separate authentication/authorization. No full publication or deployment audit."
 ]
].map(([url,claimScope])=>({url,claimScope,verifiedAt:'2026-10-12',primarySource:true,approvalTransferred:false}));
const sourceBindings=[...new Map([...base.sourceBindings,...[basePath,baseReport,baseAudit,scriptPath].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];verifySourceBindings(sourceBindings);assert.equal(sourceBindings.length,283);
const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
const newObjectiveMemberships=instructionalProposals.reduce((n,r)=>n+r.objectiveCodesObserved.length,0);assert.equal(newObjectiveMemberships,35);
const deliveryObservations={sourceOnly:true,definitionCount:13,freshSemanticDefinitionCount:12,carriedPriorHoldCount:1,caseInsensitiveLongestFirst:true,asciiAlphanumericBoundaryWithinEachFormatSegment:true,unicodeLettersAndUnderscoresAreBoundaries:true,formatSegmentationCanCreateExtraBoundaries:true,fullNamesOrPluralsNotAutomaticAliases:true,directLowercaseLookupReturnsEmpty:true,normalizedRendererLookupMatchesAuthoredEntry:true,contextSensitiveResolution:false,popupRecursiveGlossary:false,glossaryComponentOwnAccountGate:false,parentRouteGatesRemain:true,mcqFeedbackRequiresSubmittedPro:true,disabledOptionAncestorInteractionUnverified:true,plainCardFacesHaveNoGlossaryPopups:true,pbqReferencesNotBlanketDeliveryApproval:true,sourceUnionDoesNotProveTooltipOpened:true,freshBrowserObserved:false,learnerHandlersExecuted:false,newMasteryEvidence:0,knownApprovedFreeDomain1LessonGapPreserved:true,knownApprovedFreePbqPreviewCoinsGapPreserved:true};
const packet={schemaVersion:1,status:'LOCAL_CODEX_OBJECTIVE31_GLOSSARY_PROPOSALS_WITH_HOLDS_NOT_READY',baselineCommit:'c19cc19db1cdb5296c7aaad4e3b0473226cd79b2',selectionPolicy:'Exactly13 named objective3.1 remaining glossary IDs in delegated/source order:12 fresh inventory-only definitions and1 bound prior CYOD hold. No prior hold reopened or duplicated; ten fresh drafts and two fresh zero-credit holds.',selectionDiscrepancy,authority:{...base.authority,delegationApprovesOfflineSelectedCardsOnly:false,delegationApprovesOfflineSelectedGlossaryOnly:true,parentDeckReapprovalAllowed:false,parentQuestionReapprovalAllowed:false},sourceBindings,triageLedgerBinding:base.triageLedgerBinding,allPacketReconciliation:{inventory,priorQuestionOnlyAndDuplicateReconciliation:{packetPath:basePath,sourceRevision:sig(base.allPacketReconciliation),olderQuestions:42,olderMcqs:30,olderPbqs:12,duplicateReferences:22,supportOnlyReferences:7,newCredit:0}},instructionalReconciliation:{rawPriorRows:522,distinctPriorRecords:514,duplicatePriorOccurrences:8,limitedInstructionalReferences:base.instructionalReconciliation.limitedInstructionalReferences,newQualifiedRows:10,combinedRawRows:532,combinedDistinctRecords:524,limitedLinksUpgraded:0,newCandidateAlreadyPresent:0},candidateRecordIds,freshCandidateRecordIds,carriedSelectedHoldReferences,selectedRecordIds,sourceChecks,semanticReviews,instructionalProposals,questionProposals:[],explanationProposals:[],deferredSelectedRows,deliverySourceBindings:deliveryUnits.map(u=>u.provenance),authoredSourceBindings:g.sourceUnits,selectorBindings,glossaryMatcherProbes,collisionProbes,identityCollisionProbes,socIdentityBoundary,usageInventory,surfaceProbes,lessonDeliveryProbes,plainLessonReferences,cardOverlapObservations,independentContentHoldBindings,externalReferences,deliveryObservations,objectiveCoverage,outOfTrackedObjectiveReferences,sharedObjectiveRecords,distinctAffectedCatalogueRecords:memberships.size,summedObjectiveMemberships:Object.values(objectiveCoverage).reduce((n,v)=>n+v.census.length,0),newObjectiveMemberships,newDistinctGlossaryProposals:10,newHeldGlossaryRows:2,carriedHeldGlossaryRows:1,newDistinctCardProposals:0,newDistinctDeckContainerProposals:0,sharedMembershipsCreateNoAdditionalGlobalCredit:true,priorOverlapReferences,catalogueProgress:{denominator:1878,priorDispositions:1404,newProposals:10,combinedPending:1414,remaining:464,byKind:catalogueByKind},catalogueCensus:c.pkg.records.map(censusRow),remainingCatalogueRecordIds:c.pkg.records.filter(r=>!previous.has(r.id)&&!selected.has(r.id)).map(r=>r.id),supportProgress,bankProgress,remainingBankQuestions:base.remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,priorHoldBindings,priorHeldRows,heldGuideSubunitReferences,independentGlossaryHoldBindings,preservedHybridHoldBinding,canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
assert.equal(packet.remainingCatalogueRecordIds.length,464);assert.equal(Object.keys(objectiveCoverage).length,21);assert.equal(priorHeldRows.length+deferredSelectedRows.length,76);assert.equal(new Set([...priorHeldRows,...deferredSelectedRows].map(r=>r.recordId)).size,76);assert.equal(memberships.size,1504);assert.equal(packet.summedObjectiveMemberships,2863);assert.equal(sharedObjectiveRecords.length,607);
let completedNegativeChecks;
function validate(value){assertSafeReviewExport(value);assert(!/"(?:definition|fullName|meaning|answerMain|correctOrder|correctAnswer|frontText|answerCopy|acronym|expansion|example|items|blanks)"\s*:/.test(JSON.stringify(value)),'Raw learner/key export');const{negativeMutationChecks,...actual}=value;assert(isDeepStrictEqual(actual,packet),'Source, delivery, semantic decision, hold or count drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);assert.equal(actual.instructionalProposals.length,10);assert.equal(actual.deferredSelectedRows.length,2);for(const r of [...actual.instructionalProposals,...actual.deferredSelectedRows]){assert.equal(r.roleProposal,null);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);assert.equal(r.humanApproved,false);}}
validate(packet);validate(JSON.parse(JSON.stringify(packet)));let negativeMutationChecks=0;
const reject=mutate=>{const changed=structuredClone(packet);mutate(changed);assert(!isDeepStrictEqual(changed,packet),'Mutation must change data');assert.throws(()=>validate(changed));negativeMutationChecks++;};
for(let i=0;i<sourceChecks.length;i++){
 for(const key of ['recordId','sourceRevision','definitionRevision','renderedEntryRevision','renderedFullNameRevision','renderedDefinitionRevision','existingPrimarySupportCandidate'])reject(p=>p.sourceChecks[i][key]='stale_or_wrong');
 reject(p=>p.sourceChecks[i].objectiveCodesObserved=[]);reject(p=>p.sourceChecks[i].sourceOrderIndex=-1);reject(p=>p.sourceChecks[i].sourceCitations[0].fileSha256='stale');reject(p=>p.sourceChecks[i].sourceCitations[0].line=0);reject(p=>p.sourceChecks[i].sourceCitations[0].anchorRevision='stale');
 for(let j=0;j<sourceChecks[i].subunits.length;j++)reject(p=>p.sourceChecks[i].subunits[j].sourceRevision='stale');
 reject(p=>p.semanticReviews[i].contentQualification='');reject(p=>p.semanticReviews[i].limits=[]);reject(p=>p.semanticReviews[i].semanticallyQualifiedAsBoundedDraft=!p.semanticReviews[i].semanticallyQualifiedAsBoundedDraft);reject(p=>p.semanticReviews[i].freshSemanticDisposition=!p.semanticReviews[i].freshSemanticDisposition);
}
for(let i=0;i<instructionalProposals.length;i++){
 for(const[key,bad]of Object.entries({roleProposal:'assessment',primaryConceptProposal:'invented',objectiveScopeProposal:['3.1'],assessedCanonicalRoleProposals:['invented'],masteryWeight:1,trustedRevisionId:'invented',humanApproved:true,published:true,independentEvidence:true,canonicalApprovalTransferred:true,newQuestionCredit:1,newFeedbackCredit:1,newFamilyCredit:1,newGlossaryContentProposalCredit:2,newCardContentProposalCredit:1,newDeckContainerProposalCredit:1,contentQualification:'',qualificationHolds:[]}))reject(p=>p.instructionalProposals[i][key]=bad);
 reject(p=>p.instructionalProposals[i].postMissUsefulnessProposal.approvedRemediation=true);reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].weight=1);reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].conceptId='sy0701.objective.3.1');
}
for(let i=0;i<deferredSelectedRows.length;i++){for(const[key,bad]of Object.entries({sourceRevision:'stale',reason:'',contentQualification:'',qualificationHolds:[],newGlossaryContentProposalCredit:1,masteryWeight:1,trustedRevisionId:'invented',humanApproved:true,conceptLinkProposals:[{conceptId:'invented'}]}))reject(p=>p.deferredSelectedRows[i][key]=bad);reject(p=>p.selectedRecordIds.push(deferredSelectedRows[i].recordId));reject(p=>p.instructionalProposals.push(p.deferredSelectedRows[i]));}
for(const code of Object.keys(objectiveCoverage)){reject(p=>p.objectiveCoverage[code].denominator.newTeachingProposals++);reject(p=>p.objectiveCoverage[code].census.pop());reject(p=>p.objectiveCoverage[code].remainingRecordIds.pop());}
for(let i=0;i<priorHoldBindings.length;i++){reject(p=>p.priorHoldBindings[i].resolved=true);reject(p=>p.priorHoldBindings[i].sourceRevision='stale');}
for(let i=0;i<priorHeldRows.length;i++){reject(p=>p.priorHeldRows[i].resolved=true);reject(p=>p.priorHeldRows[i].newCredit=1);reject(p=>p.priorHeldRows[i].priorDispositionRevision='stale');}
for(let i=0;i<sourceBindings.length;i++)reject(p=>p.sourceBindings[i].sha256='stale');for(let i=0;i<inventory.length;i++)reject(p=>p.allPacketReconciliation.inventory[i].sha256='stale');
for(let i=0;i<heldGuideSubunitReferences.length;i++){reject(p=>p.heldGuideSubunitReferences[i].resolved=true);reject(p=>p.heldGuideSubunitReferences[i].sourceRevision='stale');for(let j=0;j<heldGuideSubunitReferences[i].subunitBindings.length;j++){reject(p=>p.heldGuideSubunitReferences[i].subunitBindings[j].resolved=true);reject(p=>p.heldGuideSubunitReferences[i].subunitBindings[j].newCredit=1);}}
for(const key of Object.keys(deliveryObservations).filter(k=>typeof deliveryObservations[k]==='boolean'))reject(p=>p.deliveryObservations[key]=!p.deliveryObservations[key]);
for(const[key,bad]of Object.entries({humanApproved:true,published:true,activationAllowed:true,masteryWeight:1,newFamilyCredit:1,privatePayloadIncluded:true,privatePayloadFetched:true,learnerRuntimeObserved:true,productionAction:true,phase3Work:true,status:'READY'}))reject(p=>p[key]=bad);
for(const key of ['q','options','answer','correct','gradingKey','payload','learnerId','email','definition','fullName','meaning','answerMain'])reject(p=>p[key]='forbidden');
reject(p=>p.instructionalProposals.push(p.instructionalProposals[0]));reject(p=>p.priorHeldRows.pop());reject(p=>p.catalogueProgress.newProposals=17);reject(p=>p.supportProgress.combinedPending++);reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.bankProgress.combinedFullFeedback=483);reject(p=>p.bankProgress.olderQuestionOnlyFullFeedbackGaps=0);reject(p=>p.instructionalReconciliation.limitedLinksUpgraded=6);reject(p=>p.authority.feedbackApprovalInferred=true);reject(p=>p.catalogueCensus.pop());reject(p=>p.remainingCatalogueRecordIds.pop());reject(p=>p.remainingBankFeedback.pop());reject(p=>p.remainingBankQuestions.pop());reject(p=>p.newObjectiveMemberships=14);reject(p=>p.preservedHybridHoldBinding.resolved=true);reject(p=>p.candidateRecordIds.reverse());
for(let i=0;i<glossaryMatcherProbes.length;i++)for(const[key,bad]of Object.entries({inputRevision:'stale',renderedPartsRevision:'stale',matchedTermsRevision:'stale',freshBrowserObserved:true,newEvidence:1}))reject(p=>p.glossaryMatcherProbes[i][key]=bad);
for(let i=0;i<glossaryMatcherProbes.length;i++)reject(p=>p.glossaryMatcherProbes[i].selectedTermMatched=!p.glossaryMatcherProbes[i].selectedTermMatched);
for(let i=0;i<collisionProbes.length;i++){reject(p=>p.collisionProbes[i].matchedTerms=[]);reject(p=>p.collisionProbes[i].renderedPartsRevision='stale');}
for(let i=0;i<identityCollisionProbes.length;i++){reject(p=>p.identityCollisionProbes[i].socMatched=!p.identityCollisionProbes[i].socMatched);reject(p=>p.identityCollisionProbes[i].contextSensitiveResolution=true);reject(p=>p.identityCollisionProbes[i].chipMeaningResolved=true);reject(p=>p.identityCollisionProbes[i].newCredit=1);}
for(const[key,bad]of Object.entries({sourceRevision:'stale',supportNodeRevision:'stale',mergedIdentityQualified:true,chipCenterAuditMeaningsKeptDistinct:false,ownerDisambiguationPending:false,replacementNodeInvented:true,newLinkCredit:1}))reject(p=>p.socIdentityBoundary[key]=bad);
for(let i=0;i<identityPeerReferences.length;i++){reject(p=>p.socIdentityBoundary.peerReferences[i].sourceRevision='stale');reject(p=>p.socIdentityBoundary.peerReferences[i].neighborPayloadReviewed=true);reject(p=>p.socIdentityBoundary.peerReferences[i].newDisposition=1);}
for(let i=0;i<usageInventory.length;i++){reject(p=>p.usageInventory[i].sourceReferenceCount++);for(let j=0;j<usageInventory[i].references.length;j++){reject(p=>p.usageInventory[i].references[j].sourceRevision='stale');reject(p=>p.usageInventory[i].references[j].glossaryDeliveryProven=true);reject(p=>p.usageInventory[i].references[j].approvalTransferred=true);reject(p=>p.usageInventory[i].references[j].newCredit=1);}}
for(const key of ['surfaceProbes','lessonDeliveryProbes'])for(let i=0;i<packet[key].length;i++){reject(p=>p[key][i].renderedPartsRevision='stale');reject(p=>p[key][i].freshBrowserObserved=true);reject(p=>p[key][i].newParentDisposition=1);}
for(let i=0;i<plainLessonReferences.length;i++)reject(p=>p.plainLessonReferences[i].glossaryDeliveryProven=true);
for(let i=0;i<cardOverlapObservations.length;i++){reject(p=>p.cardOverlapObservations[i].glossaryDeliveryProven=true);reject(p=>p.cardOverlapObservations[i].newCardCredit=1);reject(p=>p.cardOverlapObservations[i].approvalTransferred=true);}
for(let i=0;i<independentContentHoldBindings.length;i++){reject(p=>p.independentContentHoldBindings[i].resolved=true);reject(p=>p.independentContentHoldBindings[i].glossaryApprovalTransferred=true);reject(p=>p.independentContentHoldBindings[i].newCardDisposition=1);}
reject(p=>p.carriedSelectedHoldReferences[0].resolved=true);reject(p=>p.carriedSelectedHoldReferences[0].newCredit=1);reject(p=>p.carriedSelectedHoldReferences[0].priorDispositionRevision='stale');reject(p=>p.deferredSelectedRows.push(p.sourceChecks.find(r=>r.recordId==='glossary:cyod')));reject(p=>p.instructionalProposals.push(p.sourceChecks.find(r=>r.recordId==='glossary:cyod')));reject(p=>p.selectionDiscrepancy.all13InventoryOnly=true);reject(p=>p.outOfTrackedObjectiveReferences[0].newProposalCredit=1);reject(p=>p.outOfTrackedObjectiveReferences[0].censusExtended=true);
completedNegativeChecks=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-objective31-glossary-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson('docs/phase-2b5-question-review-ledger.json'),c.ledger);
const location=u=>u.provenance.path+':'+u.provenance.startLine;
const report=`# Phase 2B-5 — objective3.1 glossary review

**LOCAL, default-off, unwired and learner-invisible. Phase2B-5 NOT READY.** Codex proposals pending owner approval, not publication, activation or trusted evidence. Baseline **${packet.baselineCommit}**. Packet SHA-256 **${hashFile(packetPath)}**; audit SHA-256 **${hashFile(scriptPath)}**. Only the packet, this report and focused audit change.

## Exact selection and discrepancy

The13 delegated full IDs below occur in baseline objective3.1 remainingRecordIds. **Twelve are inventory-only; glossary:cyod is already a zero-credit prior hold.** Calling all13 inventory-only conflicts with the verified census. Preserve CYOD’s bound prior disposition, with no fresh semantic decision, reopening, rewritten definition or duplicate hold count. No behavior change is required. The master plan and Phase1 audit were read in full earlier in this continuing session and remain source-bound; approved free-Domain1 lesson and free-PBQ versus current preview/coins implementation gaps remain unchanged.

**Ten glossary drafts qualify. SOC and ZTA are two new whole-row holds. CYOD is carried, making three held selected identities.** All74 preceding whole-row holds remain, for **76 distinct whole-row holds**. No card, deck, lesson, question, feedback, other glossary or earlier held content receives a new approval/disposition. Metadata and lexical usage checks below do not semantically rereview those parents.

| Identity | Source line in src/App.jsx | Decision | Catalogue revision |
| --- | ---: | --- | --- |
${sourceChecks.map(r=>'| '+r.recordId+' | '+r.sourceCitations[0].line+' | '+(r.recordId==='glossary:cyod'?'Preserved prior hold':selected.has(r.recordId)?'Support draft; owner pending':'New HOLD; zero credit')+' | '+r.sourceRevision+' |').join('\n')}

| Term | Understanding and complete-definition qualification |
| --- | --- |
${semanticReviews.map(r=>'| '+sourceChecks.find(s=>s.recordId===r.recordId).termObserved+' | '+r.teachingUnderstanding+' '+r.contentQualification+' '+r.limits[0]+' |').join('\n')}

Source order, exact object/full-name/definition revisions, delivered getEntry output and line/file/anchor hashes are bound. All13 definitions are authored objects spread directly into GLOSSARY_TERMS; no question override replaces them. The ten proposed existing supporting-concept links have weight0. Primary concepts, precise scope, assessed canonical roles and trusted revisions remain null; no family/evidence/calibration/recovery credit or owner approval is inferred.

## Adversarial source evidence

CASB describes a logical control role, not a requirement that every flow traverses one proxy. [Microsoft CASB deployment modes](https://learn.microsoft.com/en-us/compliance/assurance/assurance-data-exfiltration-access-controls) include log collection, API connectors and reverse proxy; implementation coverage is not universal. HIDS/NIDS respectively describe host versus network detection, while HIPS’s can-block wording gives bounded prevention rather than automatic attack prevention. [NIST800-94 final abstract](https://csrc.nist.gov/pubs/sp/800/94/final) distinguishes these technology/deployment categories; this is historical taxonomy, not approval of a current product or a full-standard audit.

[NIST IaaS](https://csrc.nist.gov/glossary/term/infrastructure_as_a_service), [PaaS](https://csrc.nist.gov/glossary/term/platform_as_a_service) and [SaaS](https://csrc.nist.gov/glossary/term/software_as_a_service) definitions distinguish infrastructure with customer OS/apps, a provider application platform with customer apps, and provider-operated applications with limited user-specific configuration. The actual three glossary definitions independently supply these capability contrasts. They do not supply a full duty matrix or approve the still-held combined IaaS/PaaS/SaaS card. SaaS full-stack management does not remove customer identity/data/configuration responsibilities. IAM explicitly lists authentication, authorization and access-right management; [NIST indexed authentication definition](https://csrc.nist.gov/glossary/term/authentication) treats identity verification as a possible prerequisite to access, not every-resource authorization.

RAID’s performance/parity/fault-tolerance alternatives avoid claiming every RAID level is redundant. [IBM relevant RAID sections](https://cloud.ibm.com/docs/bare-metal?locale=en&topic=bare-metal-bm-raid-levels) identify RAID0’s lack of fault tolerance and distinguish RAID from backup. Other historical controller/table claims are not endorsed. SASE is architecture vocabulary; [Cisco indexed definition](https://www.cisco.com/c/en/us/products/security/what-is-sase-secure-access-service-edge.html?ccid=cc003036) supports cloud network/security convergence, without a security-outcome or every-path inspection guarantee.

SOC’s actual entry combines operations-center and audit-report meanings. Its case-insensitive context-free matcher resolves **SOC, soc and SoC to the same entry**, and its existing sy0701.term.soc node also contains the system-on-chip card. Metadata-only peer revisions and the node signature are bound. The chip, operations-center and assurance meanings must stay distinct; neither card approval nor a correct expansion clears the complete glossary record. [AICPA indexed communications guidance](https://www.aicpa.com/resources/article/aicpa-system-and-organization-controls-communications-guidelines) identifies the2017 System and Organization Controls naming; the generic service-organization expansion here is historical. No fresh node, alias, glossary repair or neighbor approval is invented. No chip definition is labeled wrong.

ZTA’s actual glossary sentence supplies only a verification slogan. [NIST800-207 final abstract](https://csrc.nist.gov/pubs/sp/800/207/final) describes resource-focused infrastructure/workflows, no implicit trust based solely on location/ownership, and distinct subject/device authentication and authorization before resource sessions. Those missing distinctions keep this whole definition held, independently from the already-held ZTA card. Reviewer qualifications cannot silently add teaching to the learner text. CYOD’s ownership ambiguity is carried from its exact prior disposition; no new device policy, privacy or wipe claim is approved.

Primary HTML definitions/sections/abstracts and explicitly labeled indexed excerpts were checked. No full standards, current product implementation, fleet, cloud, assurance engagement or compliance audit. External definitions supply comparison evidence, not owner approval.

## Actual renderer and placement

Glossary renderer **${location(renderer)}**, formatting **${location(format)}**, matcher **${location(matcher)}**, lookup **${location(entry)}**, parts **${location(parts)}** and the existing glossary-delivery selector are source-bound. Pure existing expressions execute for **${glossaryMatcherProbes.length}** exact case/format/boundary/alias/repeat probes and five multi-term probes. Case-insensitive normalization precedes case-sensitive direct lookup; direct lowercase entry lookup returns empty. Matching uses longest-first alternatives and ASCII letter/digit boundaries within each formatting segment. Unicode letters and underscores can form boundaries; splitting a token across formatting markers can suppress a match, while surrounding letters in different segments can permit one. Plurals and full-name strings are not automatically aliases. SOC casing does not resolve context. Popup content is not recursively glossary-wrapped.

Source shows button role/tabIndex, Enter/Space and click toggling, aria-expanded and outside-pointer close. The component has no account/Pro gate; parent route/content gates remain. Source checks are not a fresh browser/accessibility test or proof a tooltip was opened. MCQ stems/options are glossary-wrapped; submitted Pro feedback contains main/wrong-option definitions. Options have a disabled ancestor after submission, so actual interaction there is unverified. Lesson bodies use first-sentence/collapsed-detail wrappers; matched plain table cells lack GlossaryText. PBQ prose uses wrappers but a PBQ usage reference is not blanket proof every configuration surface renders a popup. The standard flashcard lab has plain faces without GlossaryText.

| Glossary identity | Lexical source references |
| --- | ---: |
${usageInventory.map(r=>'| '+r.recordId+' | '+r.sourceReferenceCount+' |').join('\n')}

All usage IDs/parent revisions, ${surfaceProbes.length} actual MCQ field-group probes, ${lessonDeliveryProbes.length} lesson paragraph-segment probes, ${plainLessonReferences.length} plain-table references and ${cardOverlapObservations.length} plain-card overlaps are bound. Source-text union/usage is metadata and exact lexical placement, not parent approval, precise concept scope, observed browser delivery, learner exposure or corrective recovery. No raw definitions, stems, options, grading keys, private payload or learner records are exported. Repeated names/cases/formats/usages provide zero independent families.

## Reconciliation

All **96 preceding substantive packets** reconcile actual question/explanation/instruction arrays, source signatures, credited IDs and file hashes. Prior instruction **522 raw/514 distinct**, eight repeated occurrences and six limited uncredited references remain; new10 produce **532 raw/524 distinct**, without limited-link upgrades. All **74 prior whole-row holds**, **160 prior field bindings**, both held IaC/tokenization guide subunits, MAC/SoC identity collisions, CYOD/service-model/ZTA cards, previous independent glossary and hybrid/private/unsupported boundaries remain unresolved. Two new holds produce76 distinct; carried CYOD is counted once.

| Kind | Total | Prior | New | Combined pending | Remaining |
| --- | --- | --- | --- | --- | --- |
${catalogueByKind.map(r=>'| '+r.kind+' | '+r.total+' | '+r.prior+' | '+r.new+' | '+r.combined+' | '+r.remaining+' |').join('\n')}

Support **513/834**, remaining321. Catalogue **1414/1878**, remaining464. Glossary **122/162**, remaining40; cards180/313 and decks11/29 unchanged. Bank **454/483 question judgments**, **447/483 complete pairs/full feedback**,29 question and36 feedback gaps, including7 older question-only feedback gaps, unchanged. These are pending proposals, not complete learning coverage.

| Tracked objective | Candidates | Prior | New glossary | Combined pending | Remaining |
| --- | --- | --- | --- | --- | --- |
${Object.entries(objectiveCoverage).map(([code,{denominator:d}])=>'| '+code+' | '+d.broadCandidates+' | '+d.allPacketPriorDispositions+' | '+d.newTeachingProposals+' | '+d.combinedPendingDispositions+' | '+d.remaining+' |').join('\n')}

Objective3.1 **188/220**, remaining32;3.2 **162/220**, remaining58;3.3 **125/164**, remaining39;3.4 **125/176**, remaining51. Further new memberships:4.4 adds1,4.6 adds2,4.7 adds3. Other tracked objectives unchanged. Ten global rows yield35 observed memberships without multiplying global credit. Existing21 tracked censuses still bind2863 memberships,1504 distinct rows and607 shared rows. The held SOC metadata additionally observes5.5; it is explicitly bound outside those existing censuses with zero credit, no extended census and no all28-objective claim. Exact objective3.1 remaining:

${objectiveCoverage['3.1'].remainingRecordIds.map(id=>'- '+id).join('\n')}

## Validation and delivery gate

Run \`node ${scriptPath}\` and \`npm run audit:content-mapping\`. The focused audit rejects **${negativeMutationChecks}** mutations of definitions/renderer/matcher/placements/usage/source order, SOC casing/identity, prior CYOD double-counting, inherited holds/subunits, counts, sources, owner/canonical/scope/trust/weights/families and forbidden exports. All **283 source bindings**, **25 protected release hashes** and the unchanged ledger are checked; the ordinary command deterministically compares both artifacts.

Required delivery: all29 mapping tests/deterministic active package, diff --check, skip-marker exit0/control1, task-only three-file **[skip deploy]** commit/push, full remote commit/artifact SHA verification, empty index and all eight unrelated dirty entries preserved. Git push is repository delivery; deployment is skipped.

No learner runtime, private payload, production, fresh browser, migration, Phase3 or activation work. Owner decisions, remaining review/private coverage, precise scope/canonical approvals, calibrated/remediation evidence and operational release gates remain open. **Phase2B-5 NOT READY.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE31_GLOSSARY_NOT_READY',priorPackets:inventory.length,selectedCandidates:13,freshInventoryOnlyCandidates:12,carriedPriorHoldCount:1,newQualifiedGlossary:10,newZeroCreditRows:2,priorWholeHolds:74,totalWholeHolds:76,negativeMutationChecks,glossaryMatcherProbes:glossaryMatcherProbes.length,surfaceProbes:surfaceProbes.length,lessonDeliveryProbes:lessonDeliveryProbes.length,supportProgress,objective31:objectiveCoverage['3.1'].denominator,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
