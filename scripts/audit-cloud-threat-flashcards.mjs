import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-cloud-threat-flashcards.mjs',packetPath='docs/drafts/phase-2b5-cloud-threat-flashcards-proposals.json',reportPath='docs/phase-2b5-cloud-threat-flashcards-review.md';
const basePath='docs/drafts/phase-2b5-social-engineering-flashcards-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'4858dd3d7960e4c2251805f770f4e0f827dabd93f68d8c904bd4f678cf315806');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json','docs/drafts/phase-2b5-objective51-mcqs-proposals.json','docs/drafts/phase-2b5-objective53-55-assurance-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-proposals.json','docs/drafts/phase-2b5-final-local-mcqs-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-pbqs-proposals.json','docs/drafts/phase-2b5-older-pbq-feedback-proposals.json','docs/drafts/phase-2b5-objective24-48-33-pbqs-proposals.json','docs/drafts/phase-2b5-objective43-45-46-pbqs-proposals.json','docs/drafts/phase-2b5-residual-supported-pbqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals,...(path===basePath?readJson(path).instructionalProposals:[])]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,412);


// Inventory every substantive packet, including older dictionary-bound question-only judgments.
const inventory=[],olderQuestions=[],duplicateReferences=[],supportOnlyReferences=[];
for(const name of readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')).sort()){
 const path='docs/drafts/'+name;if(path===packetPath)continue;const p=readJson(path);
 const arrays=['questionProposals','explanationProposals','instructionalProposals'];if(!arrays.some(k=>Array.isArray(p[k])))continue;
 const bindings=Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256}));verifySourceBindings(bindings);
 const rows=arrays.flatMap(k=>p[k]||[]);inventory.push({path,sha256:hashFile(path),substantiveRows:rows.length});
 for(const row of rows){
  const r=c.records.get(row.recordId);assert(r,'Missing prior record: '+row.recordId);assert.equal(row.publishedRecordSignature??row.sourceRevision,r.sourceSignature,'Prior source drift: '+row.recordId);
  const reference={recordId:row.recordId,kind:r.kind,sourceRevision:row.sourceRevision,publishedRecordSignature:r.sourceSignature,priorPacketPath:path,priorDispositionRevision:sig(row)};
  if(c.previous.has(row.recordId)){if(c.previous.get(row.recordId).path!==path)duplicateReferences.push(reference);continue;}
  if((p.questionProposals||[]).includes(row)){assert.equal(row.sourceRevision,r.localRevisionSignature);c.previous.set(row.recordId,{path,row});olderQuestions.push(reference);}
  else supportOnlyReferences.push({...reference,status:'link_or_context_only_not_full_current_feedback_or_unit_review'});
 }
}
assert.equal(inventory.length,74);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);


assert.deepEqual(inventory.filter(r=>r.path!==basePath),base.allPacketReconciliation.inventory);
assert.equal(duplicateReferences.length,22);assert.equal(supportOnlyReferences.length,7);
import {SY0701_ACRONYM_SETS,SY0701_ACRONYM_CARDS} from '../src/data/sy0701AcronymFlashcards.js';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';
import {readSelectors} from './lib/content-mapping/delivery-inventory.mjs';

const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;
assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
assert.equal(hashFile(ledgerPath),'e0ceeec3c5cc8adb94b36175954a8cefaebcb4f29f4c66aa38c400f65de3bb12');
assert.equal(hashFile('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');

const designPath='docs/drafts/phase-2b5-unsupported-pbq-remediation-design.json';
assert.equal(hashFile(designPath),'754c40a982e0bc0b8c031493fde678b159f54a5fd1120d7a777bf0564d90ab99');
const design=readJson(designPath);verifySourceBindings(design.sourceBindings);
assert.deepEqual(inventory,design.allPacketReconciliation.inventory);assert.equal(c.previous.size,1121);
const decks=SY0701_ACRONYM_SETS.filter(s=>['cloud-mobile-hardware-attacks','threat-intel-protection'].includes(s.id));
assert.equal(decks.length,2);assert.deepEqual(decks.map(d=>d.cards.length),[6,11]);
assert.deepEqual(decks.map(d=>d.objectiveCodes),[['2.2','3.1','3.3'],['2.2','2.4','4.2']]);
for(const d of decks){assert.equal(d.chapterId,2);assert.equal(d.setType,'acronym');assert.equal(sig(d),c.records.get('deck:'+d.id).sourceSignature);}
const flat=SY0701_ACRONYM_CARDS.filter(r=>decks.some(d=>d.id===r.setId)).sort((a,b)=>a.id.localeCompare(b.id));
const candidateRecordIds=base.objectiveCoverage['2.2'].census.filter(r=>r.status==='inventory_only_unreviewed'&&/^flashcard:sy0701-acronym-(cloud-mobile-hardware-attacks|threat-intel-protection)-/.test(r.recordId)).map(r=>r.recordId);
assert.equal(candidateRecordIds.length,17);assert.deepEqual(flat.map(r=>'flashcard:'+r.id),candidateRecordIds);
for(const id of candidateRecordIds)assert(!c.previous.has(id));
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(kind=>[kind,rows.filter(r=>r.kind===kind).length]));
const instructionalOccurrences=inventory.flatMap(({path})=>(readJson(path).instructionalProposals||[]).map(row=>({recordId:row.recordId,kind:c.records.get(row.recordId).kind,priorPacketPath:path,sourceRevision:c.records.get(row.recordId).sourceSignature,priorDispositionRevision:sig(row),fullPriorDisposition:c.previous.has(row.recordId)})));
const uniqueInstructional=new Map(instructionalOccurrences.map(r=>[r.recordId,r]));
assert.equal(instructionalOccurrences.length,239);assert.equal(uniqueInstructional.size,231);
const limitedInstructionalReferences=[...uniqueInstructional.values()].filter(r=>!r.fullPriorDisposition);
assert.equal(limitedInstructionalReferences.length,6);assert.equal(limitedInstructionalReferences.filter(r=>r.kind==='flashcard').length,4);
assert(candidateRecordIds.every(id=>!uniqueInstructional.has(id)));
const instructionalReconciliation={occurrences:instructionalOccurrences,rawRows:239,distinctRecords:231,duplicateOccurrences:8,distinctByKind:counts([...uniqueInstructional.keys()].map(id=>c.records.get(id))),limitedInstructionalReferences,newCandidateAlreadyPresent:0,limitedLinksUpgraded:0};
const unit=(start,end)=>sourceUnit('src/App.jsx',start,end);
const modeUnit=unit('const flashcardSetType=','function FlashcardModeCipher('),realAcronymUnit=unit('const flashcardHasRealAcronym =','const randomFlashcardStorageKey ='),faceUnit=unit('  const isDividerCard=activeCard?.cardType','  const masteredCount=acronymSet.cards.filter('),labUnit=unit('function AcronymFlashcardLab(','function DeepDiveReadableBites('),navUnit=unit('function FlashcardsPage(','function ObjectivesPage('),chooserUnit=unit('function FlashcardModeChooser(','function AcronymFlashcardLab('),tokenUnit=unit('const tokenizeLearningText =','const buildCipherWeakFlashcardSet ='),relatedUnit=unit('const getFlashcardRelatedDeepDives =','const FlashcardSocialIcon =');
const units=[modeUnit,realAcronymUnit,faceUnit,labUnit,navUnit,chooserUnit,tokenUnit,relatedUnit];
const modes=Function(modeUnit.code+';return {getSafeFlashcardMode,flashcardSetType};')();
const hasRealAcronym=Function(realAcronymUnit.code+';return flashcardHasRealAcronym;')();

assert.deepEqual(flat.filter(hasRealAcronym).map(r=>r.acronym),['Physical Attack','VM Escape','AV','DKIM','DLP','DMARC','FIM','SCAP','STIX','SWG','TAXII','WAF','WIDS / WIPS']);
assert(chooserUnit.code.includes('...(hasExample?[FLASHCARD_MODE_OPTIONS.example]:[])'));
const open=navUnit.code.slice(navUnit.code.indexOf('  const openSet='),navUnit.code.indexOf('  const startSomewhere='));
assert(open.length>0);assert(!open.includes('onRequireSignup')&&!open.includes('onUpgrade'));
for(const marker of ['onRate(activeCard.id,mastered)','nextRated.size>=studyCardCount','onClick={()=>rateCard(false)}','onClick={()=>rateCard(true)}','if(!user){','if(user.tier!=="pro"){'])assert(labUnit.code.includes(marker));
assert(!labUnit.code.includes('GlossaryText'));
const studyFaces=Function('activeCard','direction','setType','studyCards','acronymSet','flashcardHasRealAcronym',faceUnit.code+';return {frontPrompt,frontText,answerLabel,answerMain,answerCopy,testsAcronym,asksFromExample,studyCardCount,totalCardCount};');
const cardSourcePath='src/data/sy0701AcronymFlashcards.js',cardLines=readFileSync(cardSourcePath,'utf8').split('\n');
const authoringUnits=[sourceUnit(cardSourcePath,'const makeCard =','const makeTermCard ='),sourceUnit(cardSourcePath,'const makeSet =','const makeTermSet ='),sourceUnit(cardSourcePath,'export const SY0701_ACRONYM_CARDS =','export const getSy0701AcronymSet =')];
const sourceChecks=flat.map(card=>{
 const record=c.records.get('flashcard:'+card.id),deck=decks.find(d=>d.id===card.setId),raw=deck.cards.find(r=>r.id===card.id),hasExample=Boolean(raw.example);
 assert.equal(sig(card),record.sourceSignature);assert.equal(record.precision,'support_only');assert.equal(record.trustedRevisionId,null);assert.equal(record.contentSha256,null);
 assert.equal(hasExample,deck.id==='cloud-mobile-hardware-attacks');assert.equal(raw.cardType??null,hasExample?'attack':null);
 assert.equal(c.pkg.concepts.find(n=>n.id===record.primaryConceptId)?.nodeKind,'supporting_concept');
 const indices=cardLines.flatMap((line,i)=>line.trimStart().startsWith('['+JSON.stringify(raw.acronym)+',')?[i]:[]);assert.equal(indices.length,1);
 assert.equal(modes.getSafeFlashcardMode('example',hasExample,modes.flashcardSetType(deck)),hasExample?'example':'definition');
 const availableModes=['definition','acronym',...(hasExample?['example']:[])];
 const renderedFaces=availableModes.map(requestedMode=>{
  const direction=modes.getSafeFlashcardMode(requestedMode,hasExample,modes.flashcardSetType(deck));assert.equal(direction,requestedMode);
  const face=studyFaces(raw,direction,modes.flashcardSetType(deck),deck.cards,deck,hasRealAcronym);
  const tests=requestedMode==='acronym'&&hasRealAcronym(raw),fromExample=requestedMode==='example';
  assert.equal(face.frontText,fromExample?raw.example:tests?raw.acronym:raw.meaning);
  assert.equal(face.answerMain,fromExample||tests?raw.expansion:raw.expansion+' ('+raw.acronym+')');
  assert.equal(face.answerCopy,fromExample?'Exam meaning: '+raw.meaning:tests?'Definition: '+raw.meaning:'Acronym: '+raw.acronym+'. Definition: '+raw.meaning);
  assert.equal(face.testsAcronym,tests);assert.equal(face.asksFromExample,fromExample);assert.equal(face.studyCardCount,deck.cards.length);assert.equal(face.totalCardCount,deck.cards.length);
  return{requestedMode,deliveredTask:fromExample?'example_to_attack_name':tests?'term_or_acronym_to_expansion_and_definition':'definition_to_term',frontRevision:sig(face.frontText),answerTitleRevision:sig(face.answerMain),answerBodyRevision:sig(face.answerCopy),fullFaceRevision:sig(face),sameAuthoredCardId:true,newIndependentEvidence:0};
 });
 return{recordId:record.id,kind:record.kind,termObserved:raw.acronym,sourceRevision:record.sourceSignature,authoredCardRevision:sig(raw),deliveredCardRevision:sig(raw),parentDeckRecordId:'deck:'+deck.id,parentDeckRevision:sig(deck),publicationStatusObserved:record.publicationStatus,precisionObserved:record.precision,trustedRevisionObserved:null,objectiveCodesObserved:record.objectiveCodes,existingPrimarySupportCandidate:record.primaryConceptId,sourceCitations:[{path:cardSourcePath,line:indices[0]+1,anchorRevision:sig(cardLines[indices[0]]),fileSha256:hashFile(cardSourcePath)}],faceBindings:['acronym','expansion','meaning',...(hasExample?['example']:[])].map(field=>({field,sourceRevision:sig(raw[field])})),availableModes,unavailableExampleModeFallsBackToDefinition:!hasExample,renderedFaces,editorialPrecedence:'direct_authored_deck_and_flattened_catalogue_import_no_question_override_layer',contentInvented:false};
});
assert.equal(sourceChecks.flatMap(r=>r.renderedFaces).length,40);
const related=Function('CONCEPT_DEEP_DIVES','getSy0701DeepDiveProfile','STARRED_FLASHCARD_SET_ID',tokenUnit.code+relatedUnit.code+';return getFlashcardRelatedDeepDives;')(CONCEPT_DEEP_DIVES,getSy0701DeepDiveProfile,'__audit_starred__');
const containerObservations=decks.map(deck=>({recordId:'deck:'+deck.id,sourceRevision:sig(deck),childRecordIds:deck.cards.map(r=>'flashcard:'+r.id),newContainerCredit:0,approvedRemediation:false,relatedLessonLinksObserved:related(deck).map(d=>({recordId:'lesson:'+d.id,sourceRevision:sig({d,profile:getSy0701DeepDiveProfile(d)}),status:'selector_observation_only_not_semantic_approval_or_remediation',weight:0}))}));
for(const deck of containerObservations)for(const r of deck.relatedLessonLinksObserved)assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);
const selectorBindings=readSelectors().filter(s=>['flashcard-navigation','flashcard-study-pass','next-flashcard-deck','random-flashcards','related-flashcard-lessons','starred-flashcards','weak-area-deck'].includes(s.id)).map(s=>({recordId:'intervention:'+s.id,sourceRevision:s.sourceSignature,limitation:s.selector.mappingDependencies}));
assert.equal(selectorBindings.length,7);for(const r of selectorBindings)assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);
const semantic={
 'Firmware Attack':{family:'low_level_firmware_compromise_support',meaning:'The supplied device-code persistence example supports firmware-target vocabulary, without making persistence a universal outcome.',contrasts:['Firmware is distinct from ordinary application or disk-resident malware; disk formatting is not a universal firmware remediation.','No boot-chain verification, firmware exploit, signing-key compromise or actual recovery is assessed.'],prior:['m250']},
 'Jailbreaking / Rooting':{family:'mobile_security_restriction_bypass_support',meaning:'Qualify the shared restriction-bypass risk only; the one iOS illustration does not separately teach Android rooting or every mobile privilege boundary.',contrasts:['Jailbreaking and rooting are platform-dependent changes, not identical operations or proof of malicious intent.','Do not infer that every restriction disappears, every rooted app escapes isolation, or every off-store install requires elevated privileges.','The example is a stipulated bypass, not an executed exploit or separately approved platform skill.'],prior:[]},
 'Physical Attack':{family:'intentional_physical_environment_disruption_support',meaning:'The deliberate power disruption supports a broad physical/environmental attack comparison, not a universal recovery outcome.',contrasts:['A natural failure can be environmental without being an attack; the supplied intentional action is the distinguishing premise.','Tampering and environmental disruption overlap here; neither subcategory receives independent assessment or mastery credit.'],prior:[]},
 'Side-Loading':{defer:true,family:'off_store_installation_trust_definition_held',meaning:'The definition makes untrusted sourcing part of side-loading itself. Off-store installation may also use a legitimate developer or enterprise source; the malicious example does not repair that universal trust inference.',contrasts:['Hold until the installation route is separated from source trust and malware risk.','Side-loading does not itself require rooting/jailbreaking and does not establish malware, compromise or universal absence of verification.'],prior:[]},
 'Supply Chain Attack':{family:'trusted_third_party_path_compromise_support',meaning:'The breached-service-provider example supports indirect trusted-path compromise, while retaining distinctions from the earlier update-channel questions.',contrasts:['Service-provider credential abuse and compromised software updates are related paths, not identical mechanics or independent evidence.','Do not infer a malicious supplier, zero-day, APT attribution, actual victim access or validated vendor controls.'],prior:['m127','m250']},
 'VM Escape':{family:'guest_isolation_boundary_escape_support',meaning:'The explicit guest-to-host example supports escape vocabulary; authorised guest networking or sharing alone is not an escape.',contrasts:['Access to the host or another guest concerns breached isolation, not merely communication between machines.','No real hypervisor exploit, access to all guests, physical separation or demonstrated mitigation is established.'],prior:['m062']},
 'AV':{family:'anti_malware_tool_role_support',meaning:'Qualify antivirus as a tool category with malware detection/blocking/removal capabilities, rather than a guarantee that all three succeed.',contrasts:['The name is not limited to classic viruses, and products differ in coverage and enabled capabilities.','No real scan, clean system, malware attribution, prevention result or recovery is verified.'],prior:[]},
 'DKIM':{defer:true,family:'signing_domain_responsibility_definition_held',meaning:'The authorization wording leaves the signing domain and purported author insufficiently separated. A valid signature establishes a domain responsibility claim under its key, not approval by the visible sender or a trustworthy human.',contrasts:['Hold until signer identity and author-domain alignment are explicit and legitimate content is not implied.','Preserve DMARC alignment/either-pass and p067 combined-protocol holds; no cryptographic verification or sender authentication occurs.'],prior:['m144','m616','m278','m288']},
 'DLP':{family:'sensitive_data_movement_control_support',meaning:'The qualified prevention wording supports data-movement policy vocabulary; scope and approved locations remain contextual.',contrasts:['Policy can apply to several channels and data states; a location label does not prove sensitivity, authorisation or a leak.','Detection or blocking depends on visibility and configuration; no prevention guarantee, encryption equivalence or actual exfiltration result is claimed.'],prior:[]},
 'DMARC':{family:'aligned_mail_authentication_policy_support',meaning:'Qualify only the overview of SPF/DKIM-based mail policy. The current short definition does not teach the aligned-pass decision or receiver discretion.',contrasts:['DMARC pass requires an aligned SPF or DKIM pass; both mechanisms need not pass, and failing only one need not mean DMARC failure.','Domain validation does not approve a human sender, safe content or a business-payment request; receiver disposition is local policy.','Reports, DNS rollout and configuration are unassessed; current RFC9989 replaces RFC7489, and the card specifies no version.'],prior:['m144','m616','m278','m288']},
 'FIM':{family:'file_change_observation_support',meaning:'Qualify integrity monitoring as detecting changes for review, not automatically deciding that every change is unauthorized or malicious.',contrasts:['Approved updates can change important files; a baseline difference requires context and investigation.','No immutable baseline, blocking, rollback, complete visibility or validated compromise is established.'],prior:[]},
 'SCAP':{family:'security_automation_specification_suite_support',meaning:'Qualify standards-enabled configuration/vulnerability automation; SCAP is a suite of interoperable specifications, not a scanner or a universal security test.',contrasts:['Machine-readable content and processing support automation; a protocol name does not demonstrate a scan or compliance.','No version, product conformance, complete vulnerability coverage or independently understood component standard is approved.'],prior:['m722','m423']},
 'STIX':{family:'structured_threat_intelligence_representation_support',meaning:'The format description supports threat-intelligence representation vocabulary, with language/object relationships beyond a flat indicator list.',contrasts:['STIX representation and TAXII exchange are distinct standards; STIX does not require one transport or prove feed interoperability.','Serialization/version must be specified in an actual implementation; machine readability does not prove freshness, truth, confidence or safe automated blocking.','Retain the prior combined STIX/TAXII family holds; this card creates no separately assessed standard or component skill.'],prior:['m185','m722','m423']},
 'SWG':{family:'web_gateway_policy_filtering_support',meaning:'Qualify web-traffic filtering as a gateway capability dependent on visibility and policy, not a guarantee of safe browsing.',contrasts:['An SWG protects browsing paths; a WAF protects application traffic, with possible product overlap rather than universal exclusivity.','Encrypted-traffic visibility, bypass, content categories and deployment are unassessed; do not equate the label with a VPN or endpoint antivirus.'],prior:[]},
 'TAXII':{defer:true,family:'version_ambiguous_threat_exchange_expansion_held',meaning:'The expansion retains Indicator Information, while TAXII2.1 names Intelligence Information. With no version or historical qualification, acronym recall would reinforce an ambiguous version boundary.',contrasts:['Hold the expansion and exclusive-STIX reading; TAXII2.1 exchanges CTI over HTTPS and can transport other supported formats.','Version, content negotiation, authentication, source trust and useful indicators are separate; no feed, parser or exchange is verified.'],prior:['m185','m722','m423']},
 'WAF':{family:'web_application_traffic_filter_support',meaning:'The qualified help-block wording supports application-traffic filtering vocabulary, without claiming a complete SQL-injection/XSS fix.',contrasts:['Rules, placement and visibility affect coverage; a WAF does not replace secure coding, input handling or remediation.','The protective application role differs from outbound browsing gateways, but deployment/product capabilities may overlap; no request, exploit or rule is tested.'],prior:[]},
 'WIDS / WIPS':{family:'wireless_monitoring_prevention_role_support',meaning:'Qualify the combined label as wireless detection/prevention capabilities only; distinguish observation from attempted prevention rather than scoring two skills.',contrasts:['An alert does not guarantee blocking, an unknown AP is not automatically unauthorized, and authorised prevention requires context.','Capabilities vary by sensor coverage, channel and configuration; do not universally exclude assisting response from detection or assume every wireless threat is observed.','No RF monitoring, containment, rogue-device finding or separately assessed WIDS/WIPS implementation is approved.'],prior:[]},
};
assert.deepEqual(Object.keys(semantic).sort(),flat.map(r=>r.acronym).sort());
const priorReference=id=>{const p=c.previous.get('mcq:'+id);assert(p);return{recordId:'mcq:'+id,sourceRevision:c.records.get('mcq:'+id).sourceSignature,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),familyLabelObserved:p.row.familyLabelProposal,qualificationRevision:sig(p.row.contentQualification??null),approvalTransferred:false};};
const priorAssessmentComparisons=[...new Set(Object.values(semantic).flatMap(s=>s.prior))].sort().map(priorReference);
const selected=sourceChecks.filter(r=>!semantic[r.termObserved].defer),selectedIds=new Set(selected.map(r=>r.recordId));assert.equal(selected.length,14);
const instructionalProposals=selected.map(r=>({...r,status:'CODEX_CARD_PROPOSAL_PENDING_OWNER_APPROVAL',proposalType:'qualified_card_content_family_and_zero_weight_support_link',contentQualification:semantic[r.termObserved].meaning,comparisonTeaching:semantic[r.termObserved].contrasts,familyLabelProposal:semantic[r.termObserved].family,priorAssessmentRecordIds:semantic[r.termObserved].prior.map(id=>'mcq:'+id),primaryConceptProposal:null,secondaryConceptProposals:[],objectiveScopeProposal:null,conceptLinkProposals:[{conceptId:r.existingPrimarySupportCandidate,role:'instructional_support',weight:0,status:'candidate_reference_only_pending_owner_no_canonical_approval'}],familyRelation:'same_authored_card_across_modes_shuffle_and_reuse_not_new_evidence',postMissUsefulnessProposal:{status:'vocabulary_support_not_validated_recovery',approvedRemediation:false,rationale:'Meaning/contrast support is a review proposal only; actual learned distinction, recovery and transfer require separately approved teaching and assessed evidence.'},newCardContentProposalCredit:1,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0,masteryWeight:0,trustedRevisionId:null,humanApproved:false,published:false,independentEvidence:false,canonicalApprovalTransferred:false}));
const deferredSelectedRows=sourceChecks.filter(r=>!selectedIds.has(r.recordId)).map(r=>({...r,status:'ZERO_CREDIT_CARD_DEFINITION_DEFERRED',reason:semantic[r.termObserved].meaning,qualificationHolds:semantic[r.termObserved].contrasts,priorAssessmentRecordIds:semantic[r.termObserved].prior.map(id=>'mcq:'+id),newCardContentProposalCredit:0,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0,masteryWeight:0,canonicalApprovalTransferred:false}));
assert.deepEqual(deferredSelectedRows.map(r=>r.termObserved),['Side-Loading','DKIM','TAXII']);
const objectiveCoverage={};
for(const code of ['2.2','2.4','3.1','3.3','4.2']){
 const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes(code)),prior=broad.filter(r=>c.previous.has(r.id)),fresh=broad.filter(r=>selectedIds.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id));
 objectiveCoverage[code]={denominator:{broadCandidates:broad.length,allPacketPriorDispositions:prior.length,newCardProposals:fresh.length,newQuestionDispositions:0,newFeedbackDispositions:0,newDeckDispositions:0,combinedPendingDispositions:prior.length+fresh.length,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivate:remaining.filter(r=>r.id.startsWith('private:')).length,priorByKind:counts(prior),newByKind:counts(fresh),remainingByKind:counts(remaining)},census:broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_card_proposal_pending_owner':candidateRecordIds.includes(r.id)||base.deferredSelectedRows.some(d=>d.recordId===r.id)?'zero_credit_card_deferral':'inventory_only_unreviewed'})),remainingRecordIds:remaining.map(r=>r.id)};
}
for(const [code,total,prior,fresh]of [['2.2',134,74,14],['2.4',199,108,9],['3.1',220,101,5],['3.3',164,35,5]]){const d=objectiveCoverage[code].denominator;assert.deepEqual([d.broadCandidates,d.allPacketPriorDispositions,d.newCardProposals],[total,prior,fresh]);}
const memberships=new Map();for(const [code,v]of Object.entries(objectiveCoverage))for(const r of v.census)memberships.set(r.recordId,[...(memberships.get(r.recordId)||[]),code]);
const sharedObjectiveRecords=[...memberships].filter(([id,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));
for(const r of sourceChecks)assert.deepEqual(memberships.get(r.recordId),[...r.objectiveCodesObserved].sort());
const catalogueByKind=Object.keys(counts(c.pkg.records)).map(kind=>{const rs=c.pkg.records.filter(r=>r.kind===kind),prior=rs.filter(r=>c.previous.has(r.id)).length,fresh=rs.filter(r=>selectedIds.has(r.id)).length;return{kind,total:rs.length,prior,new:fresh,combined:prior+fresh,remaining:rs.length-prior-fresh};});
const supportKinds=['flashcard','deck_container','glossary_definition','keyword_guide','lesson','lesson_check','lesson_section','lesson_traps'];
const sum=key=>catalogueByKind.filter(r=>supportKinds.includes(r.kind)).reduce((n,r)=>n+r[key],0);
const supportProgress={kindScope:supportKinds,denominator:sum('total'),priorFullDispositions:sum('prior'),newQualifiedCardProposals:sum('new'),combinedPending:sum('combined'),remaining:sum('remaining'),limitedPriorReferencesStillUnreviewed:6,priorRawFlashcardReferences:64,priorFullFlashcardDispositions:60,newQuestionJudgments:0,newFeedbackJudgments:0,newDeckDispositions:0};
assert.deepEqual([supportProgress.denominator,supportProgress.priorFullDispositions,supportProgress.combinedPending,supportProgress.remaining],[834,220,234,600]);
assert.equal(c.ledger.rows.filter(r=>c.previous.has(r.recordId)).length,454);assert.equal(c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId)).length,447);
const bankProgress=base.bankProgress;assert.deepEqual(bankProgress,design.bankProgress);assert.equal(bankProgress.combinedQuestions,454);assert.equal(bankProgress.combinedFullFeedback,447);
const remainingBankQuestions=base.remainingBankQuestions,remainingBankFeedback=base.remainingBankFeedback;assert.deepEqual(remainingBankQuestions,design.remainingBankQuestions);assert.deepEqual(remainingBankFeedback,design.remainingBankFeedback);
const preservedHolds=base.preservedHolds,preservedRecentSemanticDeferrals=base.preservedRecentSemanticDeferrals,preservedCardDeferrals=base.deferredSelectedRows;
assert.deepEqual(preservedHolds,design.preservedHolds);assert.deepEqual(preservedRecentSemanticDeferrals,design.preservedRecentSemanticDeferrals);assert.equal(preservedRecentSemanticDeferrals.length,13);assert.deepEqual(preservedCardDeferrals.map(r=>r.termObserved),['Phishing','Tailgating']);
for(const r of [...preservedRecentSemanticDeferrals,...preservedCardDeferrals]){assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert(!c.previous.has(r.recordId)&&!selectedIds.has(r.recordId));assert.equal(r.publishedRecordSignature??r.sourceRevision,c.records.get(r.recordId).sourceSignature);}
const unsupportedDesignBoundary={path:designPath,sha256:hashFile(designPath),status:design.status,allTwentyThreeRemainZeroCredit:true,rows:design.rows.map(r=>{assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert.equal(r.originalTrustedRevisionId,null);assert(!c.previous.has(r.recordId));return{recordId:r.recordId,sourceRevision:r.sourceRevision,designRowRevision:sig(r),newQuestionCredit:0,newFeedbackCredit:0,trustedRevisionId:null};}),rootCauseCoverageRevision:sig(design.rootCauseCoverage),projectionChecksRevision:sig(design.projectionChecks),slotChecksRevision:sig(design.slotChecks),fixtureTotals:design.fixtureTotals,helpersRegistered:false,approvalTransferred:false};
assert.equal(unsupportedDesignBoundary.rows.length,23);
const p067=design.rows.find(r=>r.recordId==='pbq:p067');assert(p067);
const emailProtocolPreflightComparison={recordId:p067.recordId,sourceRevision:p067.sourceRevision,designRowRevision:sig(p067),holdRevision:sig(p067.semanticAndTeachingHolds),priorPacketPath:designPath,status:'prior_zero_credit_combined_protocol_preflight_not_an_approved_family_or_teaching_link',approvalTransferred:false};
for(const id of ['private:pbq:p003','private:explanation:pbq:p003','private:pbq:p017','private:explanation:pbq:p017']){assert.equal(c.records.get(id).trustedRevisionId,null);assert(!c.previous.has(id)&&!selectedIds.has(id));}
const externalReferences=[
 {id:'dkim',url:'https://www.rfc-editor.org/rfc/rfc6376',section:'Abstract and 2.1: signing responsibility differs from purported author'},
 {id:'dmarc',url:'https://datatracker.ietf.org/doc/html/rfc9989',section:'4.1,4.4,5.4: aligned SPF or DKIM pass; receiver discretion; obsoletes RFC7489'},
 {id:'stix',url:'https://oasis-open.github.io/cti-documentation/stix/intro',section:'Introduction: CTI language/serialization and objects'},
 {id:'taxii',url:'https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html',section:'1.6 and Appendix A: Intelligence Information; HTTPS; non-STIX content'},
 {id:'scap',url:'https://csrc.nist.gov/projects/security-content-automation-protocol',section:'Overview: suite of interoperable specifications'},
 {id:'off_store',url:'https://developer.android.com/distribute/marketing-tools/alternative-distribution',section:'Distributing through a website: developer/private/enterprise APK distribution'},
 {id:'jailbreak',url:'https://support.apple.com/en-mide/guide/iphone/iph9385bb26a/27/ios/27',section:'Unauthorized modification: security-feature bypass risks'},
 {id:'sandbox',url:'https://source.android.com/docs/security/app-sandbox',section:'Application Sandbox and Protections: kernel/UID and layered enforcement'},
 {id:'escape',url:'https://csrc.nist.gov/glossary/term/escape',section:'NIST SP800-125 guest isolation definition'},
 {id:'wireless',url:'https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-94.pdf',section:'5.3.3 and 5.3.4: detection versus prevention capabilities'}
].map(r=>({...r,verifiedAt:'2026-10-11',primarySource:true,localCardApprovalTransferred:false}));
const sourceBindings=[...new Map([...design.sourceBindings,...inventory.map(r=>({path:r.path,sha256:r.sha256})),...[basePath,designPath,'docs/phase-2b5-unsupported-pbq-remediation-design.md','scripts/audit-unsupported-pbq-remediation-design.mjs',scriptPath,cardSourcePath,'src/App.jsx','src/data/conceptDeepDives.js','src/data/sy0701DeepDiveMap.js','scripts/lib/content-mapping/package.mjs','scripts/lib/content-mapping/delivery-inventory.mjs'].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];verifySourceBindings(sourceBindings);
const packet={schemaVersion:1,status:'LOCAL_CODEX_FLASHCARD_PROPOSALS_NOT_READY',baselineCommit:'c26de5aa09d555b5dccabd64f53a490ab11af4d6',selectionPolicy:'Exactly seventeen remaining objective2.2 cards in the cloud/mobile/hardware and threat-intelligence/protection decks; fourteen qualified drafts and three zero-credit definition deferrals',authority:base.authority,sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),inventoryOnly:true,legacyTrackedPriorQuestions:412},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences},instructionalReconciliation,candidateRecordIds,selectedRecordIds:[...selectedIds],sourceChecks,instructionalProposals,questionProposals:[],explanationProposals:[],deferredSelectedRows,priorAssessmentComparisons,emailProtocolPreflightComparison,deliverySourceBindings:[...units,...authoringUnits].map(u=>u.provenance),selectorBindings,containerObservations,deliveryObservations:{sourceOnly:true,sourceDerivedFaces:40,definitionFaces:17,exampleFaces:6,acronymModeActualTermExpansionFaces:13,acronymModeDefinitionFallbackFaces:4,threatDeckExampleFaces:0,ordinaryDeckRequiresAccount:false,ordinaryDeckRequiresPro:false,relatedLessonGate:'account_then_pro',selfRatingAndPassCompletionAreNotGradedUnderstanding:true,reuseAcrossModesOrShufflingAddsNoEvidence:true,freshBrowserObserved:false,noLearnerStateOrSyncExecuted:true},externalReferences,objectiveCoverage,sharedObjectiveRecords,distinctAffectedCatalogueRecords:memberships.size,summedObjectiveMemberships:785,newDistinctCards:14,newObjectiveMemberships:42,sharedMembershipsCreateNoAdditionalGlobalCredit:true,catalogueProgress:{denominator:1878,priorDispositions:1121,newProposals:14,combinedPending:1135,remaining:743,byKind:catalogueByKind},supportProgress,bankProgress,remainingBankQuestions,remainingBankFeedback,preservedHolds,preservedRecentSemanticDeferrals,preservedCardDeferrals,unsupportedDesignBoundary,priorCardBoundary:design.priorCardBoundary,priorHoldsSourceBinding:{path:basePath,sha256:hashFile(basePath),holdRevision:sig(preservedHolds),earlierHoldsResolved:false},canonicalBoundary:base.canonicalBoundary,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,activePackageUnchanged:base.activePackageUnchanged,unchangedReleaseHashes:25};
assert.equal(Object.values(objectiveCoverage).reduce((n,v)=>n+v.census.length,0),785);assert.equal([...selectedIds].reduce((n,id)=>n+c.records.get(id).objectiveCodes.length,0),42);
let completedNegativeChecks;
function validate(value){assertSafeReviewExport(value);assert(!/"(?:acronym|expansion|meaning|example|frontText|backTitle|backBody|answerMain|answerCopy|correctOrder|componentId|valueId|authoredId|correctAnswer|selectedComponents|items|blanks)"\s*:/.test(JSON.stringify(value)));const{negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);}
validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const value=structuredClone(packet);mutate(value);assert.notDeepEqual(value,packet);assert.throws(()=>validate(value));negativeMutationChecks++;};
for(let i=0;i<sourceChecks.length;i++){
 for(const field of ['recordId','sourceRevision','authoredCardRevision','deliveredCardRevision','parentDeckRecordId','parentDeckRevision','existingPrimarySupportCandidate'])reject(p=>p.sourceChecks[i][field]='invented');
 reject(p=>p.sourceChecks[i].objectiveCodesObserved=['2.2']);reject(p=>p.sourceChecks[i].sourceCitations[0].line++);reject(p=>p.sourceChecks[i].sourceCitations[0].anchorRevision='stale');reject(p=>p.sourceChecks[i].sourceCitations[0].fileSha256='stale');
 for(let f=0;f<sourceChecks[i].faceBindings.length;f++)reject(p=>p.sourceChecks[i].faceBindings[f].sourceRevision='stale');
 for(let f=0;f<sourceChecks[i].renderedFaces.length;f++)for(const key of ['frontRevision','answerTitleRevision','answerBodyRevision','fullFaceRevision','deliveredTask'])reject(p=>p.sourceChecks[i].renderedFaces[f][key]='stale');
 reject(p=>p.sourceChecks[i].availableModes.push('invented'));
}
for(let i=0;i<14;i++){
 for(const[key,bad]of Object.entries({sourceRevision:'stale',deliveredCardRevision:'stale',parentDeckRecordId:'deck:wrong',trustedRevisionId:'invented',primaryConceptProposal:'invented',objectiveScopeProposal:['2.2'],contentQualification:'',familyLabelProposal:'independent',masteryWeight:1,newFamilyCredit:1,newQuestionCredit:1,newFeedbackCredit:1,humanApproved:true,published:true,canonicalApprovalTransferred:true,independentEvidence:true}))reject(p=>p.instructionalProposals[i][key]=bad);
 reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].weight=1);reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].conceptId='sy0701.objective.2.2');reject(p=>p.instructionalProposals[i].postMissUsefulnessProposal.approvedRemediation=true);
}
for(let i=0;i<3;i++){reject(p=>p.deferredSelectedRows[i].newCardContentProposalCredit=1);reject(p=>p.deferredSelectedRows[i].reason='');reject(p=>p.deferredSelectedRows[i].newQuestionCredit=1);}
for(const code of Object.keys(objectiveCoverage)){reject(p=>p.objectiveCoverage[code].denominator.newQuestionDispositions=14);reject(p=>p.objectiveCoverage[code].census.pop());reject(p=>p.objectiveCoverage[code].remainingRecordIds.pop());reject(p=>p.objectiveCoverage[code].denominator.newCardProposals++);}
for(const r of priorAssessmentComparisons)reject(p=>p.priorAssessmentComparisons.find(x=>x.recordId===r.recordId).approvalTransferred=true);
for(let i=0;i<13;i++)reject(p=>p.preservedRecentSemanticDeferrals[i].newQuestionCredit=1);
for(let i=0;i<2;i++)reject(p=>p.preservedCardDeferrals[i].newCardContentProposalCredit=1);
for(let i=0;i<23;i++){reject(p=>p.unsupportedDesignBoundary.rows[i].newQuestionCredit=1);reject(p=>p.unsupportedDesignBoundary.rows[i].newFeedbackCredit=1);reject(p=>p.unsupportedDesignBoundary.rows[i].designRowRevision='stale');}
for(const key of Object.keys(preservedHolds))reject(p=>p.preservedHolds[key]=null);
for(const key of ['q','options','correct','gradingKey','payload','learnerId','email','acronym','expansion','meaning','example','frontText','answerMain'])reject(p=>p[key]='forbidden');
reject(p=>p.instructionalProposals.push(p.instructionalProposals[0]));reject(p=>p.newDistinctCards=42);reject(p=>p.supportProgress.priorFullFlashcardDispositions=64);reject(p=>p.containerObservations[0].newContainerCredit=1);reject(p=>p.containerObservations[1].newContainerCredit=1);reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.authority.approvalInferred=true);reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.bankProgress.combinedFullFeedback=483);reject(p=>p.preservedHolds.privateBoundary.payloadReviewed=true);reject(p=>p.instructionalReconciliation.limitedLinksUpgraded=6);reject(p=>p.unsupportedDesignBoundary.helpersRegistered=true);reject(p=>p.emailProtocolPreflightComparison.approvalTransferred=true);reject(p=>p.deliveryObservations.threatDeckExampleFaces=11);reject(p=>p.productionAction=true);reject(p=>p.phase3Work=true);
completedNegativeChecks=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-cloud-threat-flashcards-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const loc=u=>u.provenance.path+':'+u.provenance.startLine;
const report=`# Phase 2B-5 — cloud/mobile/hardware and threat-protection flashcard proposals

**NOT READY.** 11 October 2026. Baseline **${packet.baselineCommit}**. Packet SHA-256 **${hashFile(packetPath)}**. One finite LOCAL/default-off/unwired/learner-invisible slice: this report, its draft packet and focused audit only.

## Authority and exact decisions

The master plan and Phase 1 audit were read in full earlier in this continuing session. Approved product decisions follow the master plan; historical implementation facts follow the audit, with current source verification below. No unresolved authority conflict requires changing behavior in this draft slice.

Review exactly the **17 inventory_only_unreviewed objective2.2 cards** selected from the preceding social-card packet: six cloud/mobile/hardware cards and eleven threat-intelligence/protection cards. Qualify **14 distinct card-content/family/support-link proposals** and defer **Side-Loading, DKIM and TAXII** with explicit zero credit. No card is rewritten. Earlier **Phishing and Tailgating holds remain zero credit**. No new question, feedback, deck, lesson or selector judgment is claimed.

**Every qualified row is a Codex draft pending owner approval.** Continuing question delegation cannot approve flashcards, canonical identities, roles, objective scopes, teaching publication, calibration, weights, family independence or activation. It permits preparing a reviewable packet; no approval is inferred or requested this turn. Existing supporting-node references remain zero-weight candidates, with primaryConceptProposal and objectiveScopeProposal null.

| Card | Decision | Authored entry | Narrow qualification / hold |
| --- | --- | --- | --- |
${sourceChecks.map(r=>'| '+r.termObserved+' | '+(selectedIds.has(r.recordId)?'Draft; owner pending':'Deferred; zero credit')+' | '+cardSourcePath+':'+r.sourceCitations[0].line+' | '+semantic[r.termObserved].meaning+' |').join('\n')}

All17 exact IDs, catalogue revisions, authored/delivered-card revisions, parent deck revisions, source-line/file fingerprints and rendered-face fingerprints are in the packet. Face values and answer-bearing source payloads are not exported. The finite draft cannot repair runtime content, approve an objective tag, or demonstrate a learner understood a term.

## Meaning, contrasts, family and support links

${sourceChecks.map(r=>'**'+r.termObserved+' — '+semantic[r.termObserved].family+'.** '+semantic[r.termObserved].meaning+'\n\n'+semantic[r.termObserved].contrasts.map(t=>'- '+t).join('\n')+'\n\n'+(selectedIds.has(r.recordId)?'Existing supporting-node candidate **'+r.existingPrimarySupportCandidate+'** is proposed only as an owner-pending, zero-weight instructional reference.':'No support-link or full-card proposal credit is promoted for this held row.')+' '+(semantic[r.termObserved].prior.length?'Compare prior question judgments **'+semantic[r.termObserved].prior.join(', ')+'** using their exact source, packet, immutable disposition and qualification hashes; no approval transfers.':'No separately reviewed matching question is asserted.')).join('\n\n')}

**Review inference:** the Side-Loading definition overstates source distrust as intrinsic to the installation route. Android documents legitimate developer website/private/enterprise distribution; that does not prove any particular download safe. The current malicious illustration cannot turn every off-store installation into an attack. [Android alternative distribution](https://developer.android.com/distribute/marketing-tools/alternative-distribution).

**Review inference:** DKIM's current authorization shorthand leaves the signer/author distinction ambiguous. DKIM binds a signing-domain responsibility claim and deliberately separates the signer from the purported author; its current card has no scenario resolving that boundary. Keep zero credit until reviewed wording addresses it. [RFC6376 abstract and section2.1](https://www.rfc-editor.org/rfc/rfc6376).

DMARC remains a qualified overview only. An aligned SPF or DKIM pass can satisfy authentication; neither a domain pass nor requested handling proves a safe message, a human sender or payment authorization. Receiver policy still decides handling. The current standard is RFC9989, which obsoletes RFC7489; no card version/configuration is approved here. Preserve m144/m616/m278/m288 and **p067's zero-credit combined-protocol preflight** through exact source/disposition hashes. [RFC9989 sections4.1,4.4 and5.4](https://datatracker.ietf.org/doc/html/rfc9989).

STIX describes structured CTI; representation is distinct from TAXII exchange. TAXII2.1 uses Intelligence Information in its expansion, while this unversioned card uses Indicator Information. **Review inference:** retaining that historical expansion without a version is ambiguous, so TAXII receives zero credit. TAXII2.1 supports HTTPS exchange and non-STIX content; compatibility/trust require separate evidence. Preserve the combined m185/m722/m423 family; these cards do not split it into assessed components. [OASIS STIX introduction](https://oasis-open.github.io/cti-documentation/stix/intro), [TAXII2.1 section1.6 and AppendixA](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html).

SCAP is a specification suite supporting interoperable security automation; the short card is qualified vocabulary rather than a scanner or proven compliance result. [NIST SCAP overview](https://csrc.nist.gov/projects/security-content-automation-protocol).

The VM escape comparison retains the actual isolation breach cue, not ordinary authorised guest/host communication. Jailbreaking/rooting remains one qualified broad restriction-bypass comparison, with no independent Android-rooting or complete sandbox-removal claim. Apple describes jailbreak security risks; AOSP documents several app-isolation layers, so neither off-store installation nor a single privilege label demonstrates that all protections disappear. [NIST escape definition](https://csrc.nist.gov/glossary/term/escape), [Apple modification guidance](https://support.apple.com/en-mide/guide/iphone/iph9385bb26a/27/ios/27), [AOSP sandbox](https://source.android.com/docs/security/app-sandbox).

For the combined WIDS/WIPS card, observation and attempted prevention are different capabilities. Sensor coverage and configuration constrain both; this label neither guarantees containment nor approves two independent skills. NIST discusses wireless detection and prevention separately in sections5.3.3–5.3.4. No RF work or containment is performed. [NIST SP800-94](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-94.pdf).

## Actual card-face behavior and provenance

Both decks use makeSet with setType acronym, at ${loc(authoringUnits[1])}; makeCard at ${loc(authoringUnits[0])} creates IDs and copies face fields. Flattening at ${loc(authoringUnits[2])} adds parent/set/chapter/objective metadata. App imports authored decks/cards directly at src/App.jsx:94; package.mjs imports them at16 and builds card/deck records at104–105. Exact flattened signatures equal active-package card revisions. Delivered raw-card and parent signatures are bound separately. No question editorial/snapshot/private override layer applies to these card imports. No second card variant or invented example is inferred.

Execute the extracted actual pure safe-mode, inequality-predicate and face expressions at **${loc(modeUnit)}**, **${loc(realAcronymUnit)}**, **${loc(faceUnit)}**. Check **40 available card/mode combinations**:

-17 definition-to-term faces, with existing definition on the back.
-13 term/expansion faces in acronym mode: two unequal-name attack cards (Physical Attack and VM Escape) plus all eleven protection cards. The Physical Attack title is not thereby a real abbreviation.
-Four equal-name attack cards fall back to definition-to-term tasks in acronym mode.
-Six supplied attack-example faces. The eleven protection cards have no examples; the chooser omits example mode, and safe-mode requests fall back to definition. No eleven extra example faces or new teaching are fabricated.

These counts include the three held cards as **source inspections**, not proposal credit. The card ID remains the same across modes, order/shuffle and self-ratings. Flip/reveal, acronym expansion, self-rated mastered status and completing a pass are not graded understanding, recovery, transfer or independent evidence. The audit invokes no React event handlers, learner storage, sync, analytics, rewards or real ratings. Current behavior remains unchanged.

Navigation/chooser/lab are source-bound at **${loc(navUnit)}**, **${loc(chooserUnit)}**, **${loc(labUnit)}**. Ordinary deck entry has no account/Pro gate in the inspected handler; related lesson opening retains account-then-Pro gates. Card faces have no inline GlossaryText. Seven selector revisions remain identical to the active package. Random/starred/saved/weak-topic reuse is source-bound only, without exercising actual learner-state flows or claiming a browser run.

Related-lesson selector output at **${loc(relatedUnit)}**:

${containerObservations.map(d=>'**'+d.recordId+'** — '+d.childRecordIds.length+' exact children; container credit0.\n\n'+d.relatedLessonLinksObserved.map(r=>'- '+r.recordId+' — '+r.sourceRevision+'; observed link, weight0, no approved remediation.').join('\n')).join('\n\n')}

Neither deck gains new disposition credit; these lesson links are observations only. Proposed card support links identify existing catalogue support-node candidates, not newly approved remediation or published teaching. No family is split/merged, and new family/mastery/independence credit remains zero.

## Exact prior/new/combined/remaining reconciliation

Reconcile **74 prior substantive packets**, including the11 previous social-card proposals, and separately bind the latest23-row unsupported-PBQ design (no substantive question/feedback arrays). The frozen triage is inventory only. Retain412 tracked question judgments plus42 older distinct judgments (30MCQ/12PBQ),22 duplicate references and seven context/support-only references without promoting limited links.

Inventory **239 instructional occurrences**, **231 distinct identities**, eight duplicate occurrences. Raw flashcard references64 include four limited pilot links; **60** are full current card dispositions. Two limited keyword guides also stay unreviewed. Five explanation identities overlap feedback, not the eight-kind support denominator. All17 new candidates are absent from every prior substantive proposal array. The new14 rows produce253 instructional occurrences /245 distinct identities, raw78 card references, with74 full-card dispositions and four limited links still excluded.

| Coverage | Prior pending | New | Combined pending / total | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Catalogue identities, overlapping content kinds |1121|14|1135/1878|743|
| Authored support units in eight kinds |220|14|234/834|600|
| Full flashcard content |60|14|74/313|239|
| Local-bank question judgments |454|0|454/483|29|
| Full feedback / complete question-feedback pairs |447|0|447/483|36|
| Local MCQ questions / complete pairs |395|0|395/395|0|
| Local PBQ question judgments |59|0|59/88|29|
| Local PBQ full feedback / complete pairs |52|0|52/88|36|

The834 support identities comprise flashcards, deck containers, glossary definitions, keyword guides, lessons, checks, sections and traps. Their instructional meaning overlaps; containers/children are not independent skills or additive learner coverage. The1878 catalogue is broader still. Neither denominator measures approved mastery.

| Kind | Total | Prior | New | Combined | Remaining |
| --- | ---: | ---: | ---: | ---: | ---: |
${catalogueByKind.map(r=>'| '+r.kind+' | '+r.total+' | '+r.prior+' | '+r.new+' | '+r.combined+' | '+r.remaining+' |').join('\n')}

| Objective membership observed | Broad total | Prior | New card proposals | Combined | Remaining local / private |
| --- | ---: | ---: | ---: | ---: | ---: |
${Object.entries(objectiveCoverage).map(([code,{denominator:d}])=>'| '+code+' | '+d.broadCandidates+' | '+d.allPacketPriorDispositions+' | '+d.newCardProposals+' | '+d.combinedPendingDispositions+' | '+d.remainingLocal+' / '+d.remainingPrivate+' |').join('\n')}

All five affected objective censuses are in the packet. The six attack cards inherit2.2/3.1/3.3 and the eleven protection cards inherit2.2/2.4/4.2; those are broad parent tags, not approved exact scope. The five censuses sum **785 memberships**, cover **${memberships.size} distinct catalogue identities**, and share **${sharedObjectiveRecords.length} identities** across objectives. New14 distinct proposals create42 observed memberships, not42 global reviews or skills. Objective2.2's remaining46 include five held cards: new Side-Loading/DKIM/TAXII plus earlier Phishing/Tailgating. All inherited scopes and primary-canonical proposals remain null; shared tags cannot transfer question/mastery credit.

## Preserved holds and unsupported-PBQ boundary

The preceding social-card packet SHA-256 remains **${hashFile(basePath)}**, with11 owner-pending proposals and two zero-credit definitions. Preserve its complete earlier holds: source ambiguity, KEV teaching limits, RTO/RPO/MTTR roles, hidden evidence, pilot feedback links, single-pair p014, p048/p211 recovery roles, seven older full-feedback gaps, recent grading/delivery qualifications and13 recent semantic deferrals. Exact immutable hashes and source revisions are carried forward; none is repaired or recredited by a card review.

Latest unsupported design SHA-256 **${hashFile(designPath)}** remains bound, with all23 exact source/design-row revisions and projection/slot/root-cause proof hashes. The4 HOTSPOT projections and19 offline slot fixtures remain design-only: **zero question/feedback credit**, null original trusted IDs, no registered grammar/adapter/runtime helper. The previously demonstrated bounded fixture totals remain unchanged (${design.fixtureTotals.slotValuePairings} slot/value pairings; ${design.fixtureTotals.wrongSlotValuePairings} wrong pairings; ${design.fixtureTotals.invalidFixtureInputsRejected} invalid inputs and ${design.fixtureTotals.projectionFailuresRejected} projection failures). This card audit preserves that proof by exact hash, not a claim to rerun it or approve all response Cartesian products.

Question gaps remain23 unsupported plus six supported semantic deferrals; feedback gaps remain those29 plus seven older question-only gaps. The four private p003/p017 question/feedback identities retain exact fingerprints/null trusted IDs, with unavailable semantics unreviewed. No private payload is fetched, exported, substituted by a local fallback or counted as covered.

## Validation and release boundary

The focused audit rejects **${negativeMutationChecks} packet mutations** for stale authored/face/deck/line revisions, wrong parent, definition holds receiving credit, invented examples, false scope/canonical approval, duplicate/shared credit, loss of prior holds, unsupported-PBQ credit, raw face/answer/private exports and false activation. Packet output must equal the source-rebuilt expected draft. This verifies provenance and finite logic; semantic judgments remain qualified human-review proposals, not algorithmically proven truth.

All25 protected release checksums match; frozen ledger **${hashFile(ledgerPath)}** and active package **${hashFile('docs/evidence/phase-2b5/mapping-package.json')}** remain unchanged. Active package:1878 records,435 concepts,2954 queued decisions,489 unresolved question mappings,seven existing primary question proposals. Every new trusted ID stays null, all evidence/link weights zero, owner/publication/activation approvals false.

Run node ${scriptPath}, all29 mapping tests plus deterministic package reproduction, git diff --check and the configured Vercel [skip deploy] hook. Stage/commit/push only these three artifacts with [skip deploy]; verify exact HEAD=origin/main=remote and full64-character SHA-256 values after push, preserving unrelated Android/generated files. This report contains no live-deployment claim.

**Phase2B-5 remains NOT READY.** No runtime, production, private database, browser, canonical approval, activation or Phase3 work occurs. Remaining content/feedback, owner teaching/mapping decisions and independent assessed families require separate work.
`;
const formattedReport=report.replace(/\n-(?=\d|Four|Six)/g,'\n- ');
if(process.argv.includes('--write'))writeFileSync(reportPath,formattedReport);assert.equal(readFileSync(reportPath,'utf8'),formattedReport);verifySourceBindings(sourceBindings);
console.log(JSON.stringify({status:'PASS_OFFLINE_CLOUD_THREAT_CARD_PROPOSALS_NOT_READY',priorPackets:inventory.length,candidates:17,newCardProposals:14,deferred:deferredSelectedRows.map(r=>r.recordId),sourceDerivedFaces:40,negativeMutationChecks,bankProgress,supportProgress,objectiveProgress:Object.fromEntries(Object.entries(objectiveCoverage).map(([code,v])=>[code,v.denominator])),distinctAffectedCatalogueRecords:memberships.size,sharedObjectiveRecords:sharedObjectiveRecords.length,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
