import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-social-engineering-flashcards.mjs',packetPath='docs/drafts/phase-2b5-social-engineering-flashcards-proposals.json',reportPath='docs/phase-2b5-social-engineering-flashcards-review.md';
const basePath='docs/drafts/phase-2b5-residual-supported-pbqs-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'8139aef76416216e4572a3ef5e123241e06c67358fbc7c4ef88b337f39afcd54');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json','docs/drafts/phase-2b5-objective51-mcqs-proposals.json','docs/drafts/phase-2b5-objective53-55-assurance-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-proposals.json','docs/drafts/phase-2b5-final-local-mcqs-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-pbqs-proposals.json','docs/drafts/phase-2b5-older-pbq-feedback-proposals.json','docs/drafts/phase-2b5-objective24-48-33-pbqs-proposals.json','docs/drafts/phase-2b5-objective43-45-46-pbqs-proposals.json'];
for(const path of [...overlayPaths,basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
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
assert.equal(inventory.length,73);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);


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
const deck=SY0701_ACRONYM_SETS.find(s=>s.id==='social-engineering-attacks');
const suffixes=['bec-business-email-compromise','dumpster-diving-dumpster-diving','impersonation-impersonation-brand-impersonation','phishing-phishing','pretexting-pretexting','shoulder-surfing-shoulder-surfing','smishing-sms-phishing','spear-phishing-spear-phishing','tailgating-tailgating-piggybacking','typosquatting-typosquatting','vishing-voice-phishing','watering-hole-watering-hole-attack','whaling-whaling'];
const candidateRecordIds=suffixes.map(s=>'flashcard:sy0701-acronym-social-engineering-attacks-'+s);
const flat=SY0701_ACRONYM_CARDS.filter(r=>r.setId===deck.id).sort((a,b)=>a.id.localeCompare(b.id));
assert.deepEqual(flat.map(r=>'flashcard:'+r.id),candidateRecordIds);assert.equal(deck.cards.length,13);assert.equal(deck.chapterId,2);assert.deepEqual(deck.objectiveCodes,['2.2','2.4','5.3']);
for(const id of candidateRecordIds)assert(!c.previous.has(id));
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(kind=>[kind,rows.filter(r=>r.kind===kind).length]));

// Reconcile every instructional occurrence; old support links do not become full card reviews.
const instructionalOccurrences=inventory.flatMap(({path})=>(readJson(path).instructionalProposals||[]).map(row=>({recordId:row.recordId,kind:c.records.get(row.recordId).kind,priorPacketPath:path,sourceRevision:c.records.get(row.recordId).sourceSignature,priorDispositionRevision:sig(row),fullPriorDisposition:c.previous.has(row.recordId)})));
const uniqueInstructional=new Map(instructionalOccurrences.map(r=>[r.recordId,r]));
assert.equal(instructionalOccurrences.length,228);assert.equal(uniqueInstructional.size,220);
const limitedInstructionalReferences=[...uniqueInstructional.values()].filter(r=>!r.fullPriorDisposition);
assert.equal(limitedInstructionalReferences.length,6);assert.equal(limitedInstructionalReferences.filter(r=>r.kind==='flashcard').length,4);
assert(candidateRecordIds.every(id=>!uniqueInstructional.has(id)));
const instructionalReconciliation={occurrences:instructionalOccurrences,rawRows:228,distinctRecords:220,duplicateOccurrences:8,distinctByKind:counts([...uniqueInstructional.keys()].map(id=>c.records.get(id))),limitedInstructionalReferences,newCandidateAlreadyPresent:0,limitedLinksUpgraded:0};

const unit=(start,end)=>sourceUnit('src/App.jsx',start,end);
const modeUnit=unit('const flashcardSetType=','function FlashcardModeCipher('),realAcronymUnit=unit('const flashcardHasRealAcronym =','const randomFlashcardStorageKey ='),faceUnit=unit('  const isDividerCard=activeCard?.cardType','  const masteredCount=acronymSet.cards.filter('),labUnit=unit('function AcronymFlashcardLab(','function DeepDiveReadableBites('),navUnit=unit('function FlashcardsPage(','function ObjectivesPage('),chooserUnit=unit('function FlashcardModeChooser(','function AcronymFlashcardLab('),tokenUnit=unit('const tokenizeLearningText =','const buildCipherWeakFlashcardSet ='),relatedUnit=unit('const getFlashcardRelatedDeepDives =','const FlashcardSocialIcon =');
const units=[modeUnit,realAcronymUnit,faceUnit,labUnit,navUnit,chooserUnit,tokenUnit,relatedUnit];
const modes=Function(modeUnit.code+';return {getSafeFlashcardMode,flashcardSetType};')();
const hasRealAcronym=Function(realAcronymUnit.code+';return flashcardHasRealAcronym;')();
const realNames=['BEC','Impersonation','Smishing','Tailgating','Vishing','Watering Hole'];
assert.deepEqual(flat.filter(hasRealAcronym).map(r=>r.acronym),realNames);
assert(chooserUnit.code.includes('...(hasExample?[FLASHCARD_MODE_OPTIONS.example]:[])'));
const open=navUnit.code.slice(navUnit.code.indexOf('  const openSet='),navUnit.code.indexOf('  const startSomewhere='));
assert(open.length>0);assert(!open.includes('onRequireSignup')&&!open.includes('onUpgrade'));
for(const marker of ['onRate(activeCard.id,mastered)','nextRated.size>=studyCardCount','onClick={()=>rateCard(false)}','onClick={()=>rateCard(true)}','if(!user){','if(user.tier!=="pro"){'])assert(labUnit.code.includes(marker));
assert(!labUnit.code.includes('GlossaryText'));
const studyFaces=Function('activeCard','direction','setType','studyCards','acronymSet','flashcardHasRealAcronym',faceUnit.code+';return {frontPrompt,frontText,answerLabel,answerMain,answerCopy,testsAcronym,asksFromExample,studyCardCount,totalCardCount};');
const cardSourcePath='src/data/sy0701AcronymFlashcards.js',cardLines=readFileSync(cardSourcePath,'utf8').split('\n');
const sourceChecks=flat.map(card=>{
 const record=c.records.get('flashcard:'+card.id),raw=deck.cards.find(r=>r.id===card.id);
 assert.equal(sig(card),record.sourceSignature);assert.equal(record.precision,'support_only');assert.equal(record.trustedRevisionId,null);assert.equal(record.contentSha256,null);assert(raw.example&&raw.cardType==='attack');
 assert.equal(record.primaryConceptId?.startsWith('sy0701.term.'),true);
 assert.equal(c.pkg.concepts.find(n=>n.id===record.primaryConceptId)?.nodeKind,'supporting_concept');
 const lineIndices=cardLines.flatMap((line,i)=>line.trimStart().startsWith('['+JSON.stringify(raw.acronym)+',')?[i]:[]);assert.equal(lineIndices.length,1);
 const renderedFaces=['definition','acronym','example'].map(requestedMode=>{
  const direction=modes.getSafeFlashcardMode(requestedMode,true,modes.flashcardSetType(deck));assert.equal(direction,requestedMode);
  const face=studyFaces(raw,direction,'acronym',deck.cards,deck,hasRealAcronym);
  const tests=requestedMode==='acronym'&&realNames.includes(raw.acronym),example=requestedMode==='example';
  assert.equal(face.frontText,example?raw.example:tests?raw.acronym:raw.meaning);
  assert.equal(face.answerMain,example||tests?raw.expansion:raw.expansion+' ('+raw.acronym+')');
  assert.equal(face.answerCopy,example?'Exam meaning: '+raw.meaning:tests?'Definition: '+raw.meaning:'Acronym: '+raw.acronym+'. Definition: '+raw.meaning);
  assert.equal(face.studyCardCount,13);assert.equal(face.totalCardCount,13);
  return {requestedMode,deliveredTask:example?'example_to_attack_name':tests?'term_or_acronym_to_expansion_and_definition':'definition_to_term',frontRevision:sig(face.frontText),answerTitleRevision:sig(face.answerMain),answerBodyRevision:sig(face.answerCopy),fullFaceRevision:sig(face),sameAuthoredCardId:true,newIndependentEvidence:0};
 });
 return {recordId:record.id,kind:record.kind,termObserved:raw.acronym,sourceRevision:record.sourceSignature,deliveredCardRevision:sig(raw),parentDeckRecordId:'deck:'+deck.id,parentDeckRevision:sig(deck),publicationStatusObserved:record.publicationStatus,precisionObserved:record.precision,trustedRevisionObserved:null,objectiveCodesObserved:record.objectiveCodes,existingPrimarySupportCandidate:record.primaryConceptId,sourceCitations:[{path:cardSourcePath,line:lineIndices[0]+1,anchorRevision:sig(cardLines[lineIndices[0]])}],faceBindings:['acronym','expansion','meaning','example'].map(field=>({field,sourceRevision:sig(raw[field])})),renderedFaces,editorialPrecedence:'direct_authored_deck_and_flattened_catalogue_import_no_question_override_layer',contentInvented:false};
});
assert.equal(sourceChecks.flatMap(r=>r.renderedFaces).length,39);
const related=Function('CONCEPT_DEEP_DIVES','getSy0701DeepDiveProfile','STARRED_FLASHCARD_SET_ID',tokenUnit.code+relatedUnit.code+';return getFlashcardRelatedDeepDives;')(CONCEPT_DEEP_DIVES,getSy0701DeepDiveProfile,'__audit_starred__');
const relatedLessonLinksObserved=related(deck).map(d=>({recordId:'lesson:'+d.id,sourceRevision:sig({d,profile:getSy0701DeepDiveProfile(d)}),status:'selector_observation_only_not_semantic_approval_or_remediation',weight:0}));
for(const r of relatedLessonLinksObserved)assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);
const selectorBindings=readSelectors().filter(s=>['flashcard-navigation','flashcard-study-pass','next-flashcard-deck','random-flashcards','related-flashcard-lessons','starred-flashcards','weak-area-deck'].includes(s.id)).map(s=>({recordId:'intervention:'+s.id,sourceRevision:s.sourceSignature,limitation:s.selector.mappingDependencies}));
assert.equal(selectorBindings.length,7);for(const r of selectorBindings)assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);

const semantic={
 'BEC':{family:'business_email_deception_support',meaning:'The offered business-payment impersonation example supports BEC vocabulary. The term expansion alone does not teach how to evaluate a request.',contrasts:['A forged executive sender does not make the victim an executive; do not infer whaling from the sender title.','Spoofed email can support this scenario without establishing mailbox takeover, malware, a completed payment or stolen data.','BEC can overlap spear phishing, impersonation and pretext; these are not mutually exclusive skills.'],prior:['m124','m658','m646']},
 'Dumpster Diving':{family:'discarded_material_information_collection_support',meaning:'The supplied discarded-paper example distinguishes information collection from a live screen observation or electronic message lure.',contrasts:['Discarded sensitive material is the defining cue; ordinary lawful waste handling is not evidence of an attack.','The fictional discovery is not a measured intrusion, credential exploit, collection result or demonstrated secure disposal skill.'],prior:[]},
 'Impersonation':{family:'claimed_trusted_identity_support',meaning:'The claimed vendor role supports broad impersonation vocabulary. The merged person/brand title is retained as observed, not split into canonical skills.',contrasts:['Clothing and a clipboard are identity cues, not proof of vendor legitimacy or authorised server-room access.','This physical-person example does not independently teach brand-domain deception or BEC.','A fabricated story may accompany impersonation; claiming an identity and constructing a pretext are overlapping dimensions.'],prior:['m009','m124']},
 'Phishing':{defer:true,family:'phishing_umbrella_definition_held',meaning:'The mass-message example is consistent with bulk phishing, but broad in the definition can be read as excluding targeted variants.',contrasts:['Hold a bulk-only universal definition; targeted phishing remains within the broader phishing category.','The example does not supply a complete channel/targeting distinction or demonstrated detection skill.'],prior:['m046','m123','m608','m658']},
 'Pretexting':{family:'fabricated_story_support',meaning:'An invented audit rationale is the distinguishing teaching cue; recognise the story dimension rather than an acronym expansion.',contrasts:['A pretext can be delivered by phone, text, email or other interaction; it does not require one specific channel.','A claimed trusted role may accompany the story, so pretexting and impersonation are not exclusive.','No login, caller identity verification or successful recovery is measured.'],prior:['m009','m047']},
 'Shoulder Surfing':{family:'direct_sensitive_information_observation_support',meaning:'The stated nearby PIN observation supports the difference between watching information in use and searching discarded material.',contrasts:['The key cue is observation of sensitive content, not proximity alone.','This fictional PIN example establishes no real captured credential, authorised access or practised physical defence.'],prior:[]},
 'Smishing':{family:'SMS_deception_channel_support',meaning:'The SMS delivery premise distinguishes this vocabulary cue from a voice call; the example suggests a fraudulent request rather than a proven destination result.',contrasts:['Hold a URL or visual brand cue as proof of domain takeover, Unicode homograph, mistyping mechanism or malware.','Targeting and pretext can overlap the SMS channel; do not treat all text chat platforms as separately reviewed here.','The request does not prove payment data was supplied or recovered.'],prior:['m253','m659']},
 'Spear Phishing':{family:'deliberately_targeted_phishing_support',meaning:'Recipient-role tailoring supports targeted phishing vocabulary; a named individual is not required for every targeted group or organisation.',contrasts:['This remains phishing and can target selected groups as well as a specific person.','A finance role or spoofed authority does not by itself make the victim an executive or prove BEC payment success.','The recognisable example is not verified detection, message authentication or independent transfer.'],prior:['m658','m124','m046']},
 'Tailgating':{defer:true,family:'unauthorised_following_entry_definition_held',meaning:'The attacker example suggests unauthorised following entry, but the definition only requires following without credentials and can include legitimate escorted entry.',contrasts:['Unauthorised entry is the missing boundary; lack of individual badge use alone is insufficient.','The slash title does not prove a universal tailgating/piggybacking consent distinction or two separately assessable skills.','Preserve prior physical-entry/removable-device combined-question qualifications.'],prior:['m432','m036','m602']},
 'Typosquatting':{family:'mistyped_domain_collection_support',meaning:'Accept only the explicitly stated mistyping route as a narrow vocabulary proposal; the visually substituted character alone does not establish the mechanism.',contrasts:['Lookalike spelling can also support brand impersonation; a visual similarity is not proof of a typing mistake or a Unicode/IDN homograph.','The stored example is a stipulated collection story, not verified registration, captured credentials, resolver poisoning or a real contacted website.','Preserve earlier lookalike/mistyping feedback holds; this card does not repair those sources.'],prior:['m015','m253']},
 'Vishing':{family:'voice_deception_channel_support',meaning:'The telephone support-call example teaches the voice channel cue; the full term label is not proof of mechanism understanding.',contrasts:['A phone channel can coexist with an invented support story, impersonation and targeted recipients.','The request establishes no true helpdesk identity, disclosed password, account takeover or validated caller verification.'],prior:['m009','m609']},
 'Watering Hole':{family:'compromised_frequented_site_support',meaning:'The supplied routinely visited forum compromise is the teaching cue rather than a direct message campaign or a mistyped domain.',contrasts:['Audience or industry context does not prove executive targeting, an APT actor or a particular successful exploit.','Drive-by delivery may overlap; no browser, exploit, website or guarantee that every visitor is infected is verified.'],prior:['m251']},
 'Whaling':{family:'executive_victim_targeting_support',meaning:'The stated CEO victim supports executive-targeted phishing vocabulary; focus on the recipient rather than the impersonated sender.',contrasts:['Whaling is targeted phishing; senior-victim targeting can coexist with channel, pretext and business fraud.','A fake legal story need not involve payment, malware or a compromised executive mailbox.','A CEO sender impersonation to a non-executive victim alone is not whaling; no legal event or login is actually validated.'],prior:['m646','m124','m658']},
};
assert.deepEqual(Object.keys(semantic).sort(),flat.map(r=>r.acronym).sort());
const priorReference=id=>{const p=c.previous.get('mcq:'+id);assert(p);return {recordId:'mcq:'+id,sourceRevision:c.records.get('mcq:'+id).sourceSignature,priorPacketPath:p.path,priorDispositionRevision:sig(p.row),familyLabelObserved:p.row.familyLabelProposal,qualificationRevision:sig(p.row.contentQualification??null),approvalTransferred:false};};
const priorAssessmentComparisons=[...new Set(Object.values(semantic).flatMap(s=>s.prior))].sort().map(priorReference);
const selected=sourceChecks.filter(r=>!semantic[r.termObserved].defer),selectedIds=new Set(selected.map(r=>r.recordId));assert.equal(selected.length,11);
const instructionalProposals=selected.map(r=>({...r,status:'CODEX_CARD_PROPOSAL_PENDING_OWNER_APPROVAL',proposalType:'qualified_card_content_family_and_zero_weight_support_link',contentQualification:semantic[r.termObserved].meaning,comparisonTeaching:semantic[r.termObserved].contrasts,familyLabelProposal:semantic[r.termObserved].family,priorAssessmentRecordIds:semantic[r.termObserved].prior.map(id=>'mcq:'+id),primaryConceptProposal:null,secondaryConceptProposals:[],objectiveScopeProposal:null,conceptLinkProposals:[{conceptId:r.existingPrimarySupportCandidate,role:'instructional_support',weight:0,status:'candidate_reference_only_pending_owner_no_canonical_approval'}],familyRelation:'same_authored_card_across_modes_shuffle_and_reuse_not_new_evidence',postMissUsefulnessProposal:{status:'vocabulary_support_not_validated_recovery',approvedRemediation:false,rationale:'The source-bound meaning and contrasts may support a review proposal; actual learned distinction, timed recovery and transfer require separately approved teaching and assessed evidence.'},newCardContentProposalCredit:1,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0,masteryWeight:0,trustedRevisionId:null,humanApproved:false,published:false,independentEvidence:false,canonicalApprovalTransferred:false}));
const deferredSelectedRows=sourceChecks.filter(r=>!selectedIds.has(r.recordId)).map(r=>({...r,status:'ZERO_CREDIT_CARD_DEFINITION_DEFERRED',reason:semantic[r.termObserved].meaning,qualificationHolds:semantic[r.termObserved].contrasts,priorAssessmentRecordIds:semantic[r.termObserved].prior.map(id=>'mcq:'+id),newCardContentProposalCredit:0,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0,masteryWeight:0,canonicalApprovalTransferred:false}));
assert.deepEqual(deferredSelectedRows.map(r=>r.termObserved),['Phishing','Tailgating']);

const objectiveCoverage={};
for(const [code,total,priorCount]of [['2.2',134,63],['2.4',199,97],['5.3',98,35]]){
 const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes(code)),prior=broad.filter(r=>c.previous.has(r.id)),fresh=broad.filter(r=>selectedIds.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id));
 assert.equal(broad.length,total);assert.equal(prior.length,priorCount);assert.equal(fresh.length,11);assert(remaining.every(r=>!r.id.startsWith('private:')));
 objectiveCoverage[code]={denominator:{broadCandidates:total,allPacketPriorDispositions:prior.length,newCardProposals:11,newQuestionDispositions:0,newFeedbackDispositions:0,newDeckDispositions:0,combinedPendingDispositions:prior.length+11,remaining:remaining.length,remainingLocal:remaining.length,remainingPrivate:0,priorByKind:counts(prior),newByKind:counts(fresh),remainingByKind:counts(remaining)},census:broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_card_proposal_pending_owner':candidateRecordIds.includes(r.id)?'zero_credit_card_deferral':'inventory_only_unreviewed'})),remainingRecordIds:remaining.map(r=>r.id)};
}
const memberships=new Map();for(const [code,v]of Object.entries(objectiveCoverage))for(const r of v.census)memberships.set(r.recordId,[...(memberships.get(r.recordId)||[]),code]);
assert.equal(memberships.size,356);
const sharedObjectiveRecords=[...memberships].filter(([id,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));assert.equal(sharedObjectiveRecords.length,58);
for(const id of candidateRecordIds)assert.deepEqual(memberships.get(id),['2.2','2.4','5.3']);
const catalogueByKind=Object.keys(counts(c.pkg.records)).map(kind=>{const rs=c.pkg.records.filter(r=>r.kind===kind),prior=rs.filter(r=>c.previous.has(r.id)).length,fresh=rs.filter(r=>selectedIds.has(r.id)).length;return{kind,total:rs.length,prior,new:fresh,combined:prior+fresh,remaining:rs.length-prior-fresh};});
const supportKinds=['flashcard','deck_container','glossary_definition','keyword_guide','lesson','lesson_check','lesson_section','lesson_traps'];
const sum=key=>catalogueByKind.filter(r=>supportKinds.includes(r.kind)).reduce((n,r)=>n+r[key],0);
const supportProgress={kindScope:supportKinds,denominator:sum('total'),priorFullDispositions:sum('prior'),newQualifiedCardProposals:sum('new'),combinedPending:sum('combined'),remaining:sum('remaining'),limitedPriorReferencesStillUnreviewed:6,priorRawFlashcardReferences:53,priorFullFlashcardDispositions:49,newQuestionJudgments:0,newFeedbackJudgments:0,newDeckDispositions:0};
assert.deepEqual([supportProgress.denominator,supportProgress.priorFullDispositions,supportProgress.combinedPending,supportProgress.remaining],[834,209,220,614]);
const priorBank=c.ledger.rows.filter(r=>c.previous.has(r.recordId)),priorFeedback=c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId));assert.equal(priorBank.length,454);assert.equal(priorFeedback.length,447);
const bankProgress={denominator:483,priorQuestions:454,newQuestions:0,combinedQuestions:454,remainingQuestions:29,mcqQuestions:395,mcqDenominator:395,pbqQuestions:59,pbqDenominator:88,priorFullFeedback:447,newFullFeedback:0,combinedFullFeedback:447,remainingFullFeedback:36,completePairs:447,completeMcqPairs:395,completePbqPairs:52,olderQuestionOnlyFullFeedbackGaps:7};
assert.equal(base.bankProgress.completeQuestionFeedbackPairs,bankProgress.completePairs);
const remainingBankQuestions=base.remainingBankQuestions,remainingBankFeedback=base.remainingBankFeedback;
assert.equal(remainingBankQuestions.length,29);assert.equal(remainingBankFeedback.length,36);for(const r of [...remainingBankQuestions,...remainingBankFeedback])assert.equal(r.sourceRevision,c.records.get(r.recordId).sourceSignature);
const preservedRecentSemanticDeferrals=[...base.preservedRecentSemanticDeferrals,...base.deferredSelectedRows];assert.equal(preservedRecentSemanticDeferrals.length,13);
for(const r of preservedRecentSemanticDeferrals){assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);assert(!c.previous.has(r.recordId));}
const preservedKeys=['priorHolds','earliestHoldBindings','preservedKevTeachingHolds','pilotBoundary','preservedPilotFeedbackLinkReconciliation','privateBoundary','hiddenEvidenceReleaseHolds','preservedSinglePairHold','recoveryRoleBindings','preservedOlderFeedbackDeferrals','preservedRecentGradingDeliveryHolds','preservedPreviewObservation','separateAssessmentDenominator'];
const preservedHolds=Object.fromEntries(preservedKeys.map(k=>[k,base[k]]));
for(const id of ['private:pbq:p003','private:explanation:pbq:p003','private:pbq:p017','private:explanation:pbq:p017']){assert.equal(c.records.get(id).trustedRevisionId,null);assert(!c.previous.has(id)&&!selectedIds.has(id));}
const sourceBindings=[...new Map([...base.sourceBindings,...inventory.map(r=>({path:r.path,sha256:r.sha256})),...[basePath,scriptPath,cardSourcePath,'src/App.jsx','src/data/conceptDeepDives.js','src/data/sy0701DeepDiveMap.js','scripts/lib/content-mapping/package.mjs','scripts/lib/content-mapping/delivery-inventory.mjs'].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];verifySourceBindings(sourceBindings);
const packet={schemaVersion:1,status:'LOCAL_CODEX_FLASHCARD_PROPOSALS_NOT_READY',baselineCommit:'da981a94308befffeceffba49240b36210ee5cc8',selectionPolicy:'Exactly thirteen source-bound social-engineering cards; qualify eleven proposals and defer two ambiguous definitions; no new question judgments',authority:{masterPlanApprovedProduct:true,phase1AuditCurrentStateEvidence:true,documentsReadInFullEarlierInContinuingSession:true,unresolvedAuthorityConflicts:[],delegationApprovesQuestionProposalWorkOnly:true,flashcardAndCanonicalOwnerApprovalRequired:true,ownerApprovalRequestedThisTurn:false,approvalInferred:false},sourceBindings,triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),inventoryOnly:true,legacyTrackedPriorQuestions:412},allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences},instructionalReconciliation,candidateRecordIds,selectedRecordIds:[...selectedIds],sourceChecks,instructionalProposals,questionProposals:[],explanationProposals:[],deferredSelectedRows,priorAssessmentComparisons,deliverySourceBindings:units.map(u=>u.provenance),selectorBindings,containerObservation:{recordId:'deck:'+deck.id,sourceRevision:sig(deck),childRecordIds:deck.cards.map(r=>'flashcard:'+r.id),newContainerCredit:0,relatedLessonLinksObserved,approvedRemediation:false},deliveryObservations:{sourceOnly:true,sourceDerivedFaces:39,definitionFaces:13,exampleFaces:13,acronymModeActualTermExpansionFaces:6,acronymModeDefinitionFallbackFaces:7,ordinaryDeckRequiresAccount:false,ordinaryDeckRequiresPro:false,relatedLessonGate:'account_then_pro',selfRatingAndPassCompletionAreNotGradedUnderstanding:true,reuseAcrossModesOrShufflingAddsNoEvidence:true,freshBrowserObserved:false,noLearnerStateOrSyncExecuted:true},objectiveCoverage,sharedObjectiveRecords,distinctAffectedCatalogueRecords:356,summedObjectiveMemberships:431,newDistinctCards:11,newObjectiveMemberships:33,sharedMembershipsCreateNoAdditionalGlobalCredit:true,catalogueProgress:{denominator:1878,priorDispositions:1110,newProposals:11,combinedPending:1121,remaining:757,byKind:catalogueByKind},supportProgress,bankProgress,remainingBankQuestions,remainingBankFeedback,preservedHolds,preservedRecentSemanticDeferrals,priorHoldsSourceBinding:{path:basePath,sha256:hashFile(basePath),holdRevision:sig(preservedHolds),earlierHoldsResolved:false},canonicalBoundary:{newCanonicalIdentities:0,canonicalScopeRolesSkillsWeightsTeachingApproved:false,allInheritedObjectiveTagsAreObservationsOnly:true,ownerApprovedMappings:0,eligibleNewEvidence:0,approvedFamilyIndependence:0},humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newFamilyCredit:0,privatePayloadIncluded:false,learnerRuntimeObserved:false,activePackageUnchanged:{records:1878,conceptIdentities:435,reviewQueue:2954,unresolvedQuestionMappings:489,existingPrimaryQuestionProposals:7},unchangedReleaseHashes:25};
assert.equal(c.previous.size,1110);
let completedNegativeChecks;
function validate(value){assertSafeReviewExport(value);assert(!/"(?:acronym|expansion|meaning|example|frontText|backTitle|backBody|answerMain|answerCopy|correctOrder|componentId|valueId|authoredId|correctAnswer|selectedComponents|items|blanks)"\s*:/.test(JSON.stringify(value)));const {negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet);if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);}
validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const value=structuredClone(packet);mutate(value);assert.notDeepEqual(value,packet);assert.throws(()=>validate(value));negativeMutationChecks++;};
for(let i=0;i<13;i++){
 for(const field of ['recordId','sourceRevision','deliveredCardRevision','parentDeckRecordId','parentDeckRevision','existingPrimarySupportCandidate'])reject(p=>p.sourceChecks[i][field]='invented');
 reject(p=>p.sourceChecks[i].objectiveCodesObserved=['2.2']);reject(p=>p.sourceChecks[i].sourceCitations[0].line++);reject(p=>p.sourceChecks[i].sourceCitations[0].anchorRevision='stale');
 for(let f=0;f<4;f++)reject(p=>p.sourceChecks[i].faceBindings[f].sourceRevision='stale');
 for(let f=0;f<3;f++)for(const key of ['frontRevision','answerTitleRevision','answerBodyRevision','deliveredTask'])reject(p=>p.sourceChecks[i].renderedFaces[f][key]='stale');
}
for(let i=0;i<11;i++)for(const [key,bad]of Object.entries({sourceRevision:'stale',deliveredCardRevision:'stale',parentDeckRecordId:'deck:wrong',trustedRevisionId:'invented',primaryConceptProposal:'invented',objectiveScopeProposal:['2.2','2.4','5.3'],contentQualification:'',familyLabelProposal:'independent',masteryWeight:1,newFamilyCredit:1,humanApproved:true,published:true,canonicalApprovalTransferred:true}))reject(p=>p.instructionalProposals[i][key]=bad);
for(let i=0;i<11;i++){reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].weight=1);reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].conceptId='sy0701.objective.2.2');reject(p=>p.instructionalProposals[i].postMissUsefulnessProposal.approvedRemediation=true);}
for(let i=0;i<2;i++){reject(p=>p.deferredSelectedRows[i].newCardContentProposalCredit=1);reject(p=>p.deferredSelectedRows[i].reason='');}
for(const code of Object.keys(objectiveCoverage)){reject(p=>p.objectiveCoverage[code].denominator.newQuestionDispositions=11);reject(p=>p.objectiveCoverage[code].census.pop());reject(p=>p.objectiveCoverage[code].remainingRecordIds.pop());}
for(const r of priorAssessmentComparisons)reject(p=>p.priorAssessmentComparisons.find(x=>x.recordId===r.recordId).approvalTransferred=true);
for(let i=0;i<13;i++)reject(p=>p.preservedRecentSemanticDeferrals[i].newQuestionCredit=1);
for(const key of preservedKeys)reject(p=>p.preservedHolds[key]=null);
for(const key of ['q','options','correct','gradingKey','payload','learnerId','email','acronym','expansion','meaning','example','frontText','answerMain'])reject(p=>p[key]='forbidden');
reject(p=>p.instructionalProposals.push(p.instructionalProposals[0]));reject(p=>p.newDistinctCards=33);reject(p=>p.supportProgress.priorFullFlashcardDispositions=53);reject(p=>p.containerObservation.newContainerCredit=1);reject(p=>p.allPacketReconciliation.inventory.pop());reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);reject(p=>p.status='READY');reject(p=>p.authority.approvalInferred=true);reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.bankProgress.combinedFullFeedback=483);reject(p=>p.preservedHolds.privateBoundary.payloadReviewed=true);reject(p=>p.instructionalReconciliation.limitedLinksUpgraded=6);
completedNegativeChecks=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-social-engineering-flashcards-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const loc=u=>'src/App.jsx:'+u.provenance.startLine;
const report=`# Phase 2B-5 — social-engineering flashcard proposals

**NOT READY.** 11 October 2026. Baseline **${packet.baselineCommit}**. Packet SHA-256 **${hashFile(packetPath)}**. One finite LOCAL/default-off/unwired/learner-invisible slice: this report, the new draft packet and its focused audit only.

## Authority and decision

The master plan and Phase 1 audit were read in full earlier in this continuing session. The master plan supplies approved product decisions; the audit supplies verified historical implementation facts. Current source files and all substantive prior packets were rechecked. No unresolved authority conflict requires a behavioral change in this draft slice.

**These are Codex proposals pending owner approval.** The continuing delegation covers question-content/family proposal work, not flashcard or canonical-taxonomy approval. It permits preparing this reviewable local proposal; it cannot approve card content, concept identities, roles, objective scope, teaching publication, calibration, weights, independence or activation. No approval is inferred, and no approval request interrupts the slice.

Review all **13** exact social-engineering card identities, sorted from BEC through Whaling. Qualify **11 distinct card-content/family/support-link proposals**; defer **Phishing and Tailgating** with explicit zero credit. There are **zero new question judgments, feedback judgments or deck judgments**. A qualified draft card proposal is not an approved understanding or mastery outcome.

| Card | Decision | Authored entry | Narrow review and limitations |
| --- | --- | --- | --- |
${sourceChecks.map(r=>'| '+r.termObserved+' | '+(selectedIds.has(r.recordId)?'Codex proposal; owner pending':'Deferred; zero credit')+' | '+cardSourcePath+':'+r.sourceCitations[0].line+' | '+semantic[r.termObserved].meaning+' |').join('\n')}

Phishing's current definition uses broad alongside a mass-message example. **Our review inference** is that this risks teaching a bulk-only distinction: prior m046/m123 already hold that inference, and targeted phishing remains within phishing. NIST defines deceptive information solicitation without a bulk-recipient requirement; the MS-ISAC primer explicitly treats spear phishing as targeted phishing. These references support the distinction, not approval of this card. [NIST phishing glossary](https://csrc.nist.gov/glossary/term/phishing), [MS-ISAC spear-phishing primer](https://www.cisecurity.org/-/media/project/cisecurity/cisecurity/data/media/files/uploads/2017/03/Security-Primer-Spear-Phishing.pdf).

Tailgating's example supplies an attacker, but its current definition only describes following a credentialed person without personal credential use. **Our review inference** is that the missing unauthorised-entry condition also admits legitimate escorted entry. Hold the definition and the slash-title consent distinction; no universal tailgating/piggybacking awareness rule, precise numbered objective or independent physical-access skill is approved. Preserve m432's combined-entry/lure qualifications and m036/m602's controlled-vestibule limitations. No card is rewritten.

## Meaning, confusion and teaching-link proposals

${selected.map(r=>'**'+r.termObserved+' — '+semantic[r.termObserved].family+'.** '+semantic[r.termObserved].meaning+'\n\n'+semantic[r.termObserved].contrasts.map(t=>'- '+t).join('\n')+'\n\nExisting supporting-node candidate: **'+r.existingPrimarySupportCandidate+'**, proposed only as a zero-weight instructional reference pending owner approval. '+(semantic[r.termObserved].prior.length?'Compare prior question judgments **'+semantic[r.termObserved].prior.join(', ')+'**; exact source, packet and immutable disposition hashes are retained.':'No separately reviewed matching assessment is asserted for this card.')).join('\n\n')}

BEC need not imply takeover of a real business mailbox: the FBI describes spoofing and other deception routes. Its sender/victim distinction must remain separate from executive-targeted whaling. This is a vocabulary comparison, not a live fraud finding or a verified payment control. [FBI BEC explanation](https://www.fbi.gov/news/stories/business-e-mail-compromise-on-the-rise).

The MS-ISAC primer supports voice/SMS channel contrasts and whaling's senior-victim target. MITRE describes community-frequented site compromise as a watering-hole campaign; neither a site label nor visiting it demonstrates successful exploitation. [MS-ISAC primer](https://www.cisecurity.org/-/media/project/cisecurity/cisecurity/data/media/files/uploads/2017/03/Security-Primer-Spear-Phishing.pdf), [MITRE Drive-by Compromise](https://attack.mitre.org/techniques/T1189/).

These comparisons retain the prior channel, targeting, lookalike-domain, combined-answer, actor-attribution and feedback qualifications. Family labels are proposed content groupings with **zero new family credit**. No prior question family is split or merged, and none of these cards supplies an independently assessed post-miss variant. Existing lesson-link selector output below remains an observation; it is not semantic approval of those lessons or a new teaching-link disposition.

## Exact prior/new/combined/remaining counts

Reconcile **73 prior substantive packets**. The frozen triage is inventory only. Its current overlay has412 tracked question judgments;42 older distinct question judgments (30 MCQs,12 PBQs) bring all-bank coverage to454. Preserve **22 duplicate references** and **seven support/link-only references**, without converting those links to full current feedback or instructional review.

Independently inventory **228 instructional row occurrences**, **220 distinct identities**, **eight duplicate occurrences**. These include **53 card references**, but only **49** currently have substantive full card dispositions; four pilot-linked cards and two keyword guides remain limited support references with no newly inferred full-content review. Five explanation identities in the instructional arrays overlap feedback and do not enlarge the support-unit denominator. All13 current candidates are absent from every prior substantive proposal array.

| Coverage | Prior pending | New | Combined pending / total | Remaining |
| --- | ---: | ---: | ---: | ---: |
| All catalogue dispositions, overlapping content kinds |1110|11 card proposals|1121/1878|757|
| Authored support units in the eight kinds below |209|11 card proposals|220/834|614|
| Flashcard full content dispositions/proposals |49|11|60/313|253|
| Local-bank question judgments |454|0|454/483|29|
| Local-bank full feedback / complete pairs |447|0|447/483|36|
| Local PBQ question judgments |59|0|59/88|29|
| Local PBQ full feedback / complete pairs |52|0|52/88|36|
| Older question-only full-feedback gaps |7|0 closed|7 gaps|7|

The834 support-unit denominator comprises flashcards, decks, glossary definitions, keyword guides, lessons, lesson checks, lesson sections and lesson traps. It counts distinct catalogue identities; lessons/checks/sections and decks/cards overlap instructional meaning and cannot be summed as independent skills. The1878 census additionally includes private metadata, separate starter and guest assessments, selector definitions, public pages and other teaching. Neither denominator is approved learner coverage. The483 bank denominator excludes two private alternatives, nine starters and two guest demos.

| Catalogue kind | Total | Prior | New | Combined pending | Remaining |
| --- | ---: | ---: | ---: | ---: | ---: |
${catalogueByKind.map(r=>'| '+r.kind+' | '+r.total+' | '+r.prior+' | '+r.new+' | '+r.combined+' | '+r.remaining+' |').join('\n')}

The remaining29 bank questions are23 unsupported-grammar rows and six supported deferrals: **LOCAL p003,p009,p032,p047,p068,p074**. The36 feedback gaps are those29 plus seven older question-only gaps: **p004,p211,p011,p029,p046,p041,p043**. Existing395/395 MCQ judgments and full feedback remain pending approval. Exact remaining identities, revisions and statuses are preserved from the residual-PBQ packet; a card proposal cannot close any of these holes.

| Inherited objective catalogue | Broad records | Prior pending | New card proposals | Combined pending | Remaining local / private | Remaining cards |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
${Object.entries(objectiveCoverage).map(([code,v])=>'| '+code+' | '+v.denominator.broadCandidates+' | '+v.denominator.allPacketPriorDispositions+' | 11 | '+v.denominator.combinedPendingDispositions+' | '+v.denominator.remainingLocal+' / 0 | '+v.denominator.remainingByKind.flashcard+' |').join('\n')}

**2.2:**63/134 prior;11 new proposals;74/134 combined;60 remain, including19 cards. **2.4:**97/199 prior;108/199 combined;91 remain, including42 cards. **5.3:**35/98 prior;46/98 combined;52 remain, including37 cards. The packet includes all census identities, revisions, kinds, statuses and remaining IDs, plus prior/new/remaining kind counts for each objective.

These three inherited catalogues contain **431 summed memberships,356 distinct identities,58 shared identities**. All13 candidates inherit all three tags, giving39 candidate memberships; the11 qualified proposals give33 new memberships but **only11 global proposals**. Both deferrals remain in all three denominators. Shared tags are observations rather than precise approved scope. Every proposed objectiveScopeProposal stays null, including context tags; no card inherits separate 2.4 or5.3 mastery credit.

## Actual source precedence and front/back delivery

App imports the authored deck and flattened card catalogue directly at src/App.jsx:94. The package imports the same data at scripts/lib/content-mapping/package.mjs:16 and creates card/deck records at lines104–105. Flattening at ${cardSourcePath}:720 adds set/chapter/objective metadata; the delivered deck card retains its original face fields. All13 flattened source signatures exactly match the active package, with separately bound delivered-card and parent-deck revisions. No MCQ/PBQ editorial override is applied to these direct card imports. This is current local source evidence, not a database-wide or deployed-browser observation.

Each authored entry binds its exact line/hash. Four source-face fields per card are hashed separately without exporting the authored faces. The audit executes the actual extracted pure face expressions at **${loc(faceUnit)}**, safe-mode expressions at **${loc(modeUnit)}**, and real-acronym predicate at **${loc(realAcronymUnit)}**. It checks **39 mode/card combinations**, with front, answer title/body and full-face fingerprints:

- Definition mode:13 definition-to-term faces.
- Example mode:13 supplied example-to-attack-name faces, all with the existing definition on the back. No example is invented.
- Acronym mode:six actual term/expansion faces (BEC,Impersonation,Smishing,Tailgating,Vishing,Watering Hole); seven equal-name/expansion cards fall back to definition-to-term faces. The slash titles and expanded Watering Hole name satisfy the existing inequality predicate but are not thereby real abbreviations or independent skills.

No word expansion, source reading, flip, example reveal, self-rating or pass completion is treated as understanding/mastery. The actual code reuses activeCard.id across modes and ratings. Shuffle/reuse does not add authored content or independent evidence. This slice does not change that behavior or claim an actual learner response.

Navigation, mode chooser and study-pass sources are bound at **${loc(navUnit)}**, **${loc(chooserUnit)}**, **${loc(labUnit)}**. Ordinary deck entry has no account/Pro gate in the inspected openSet handler; lesson opening retains account-then-Pro gates. The card-face expressions use plain face fields without inline GlossaryText. Seven selector revisions remain identical to the active package. Actual React callbacks, sync, storage, rewards, analytics and learner handlers are never invoked. Random/saved/starred/weak-topic definitions are source-bound observations, not newly exercised learner-state flows.

The source-only related-lesson selector at **${loc(relatedUnit)}** produces:

${relatedLessonLinksObserved.map(r=>'- '+r.recordId+' — '+r.sourceRevision+'; selector observation only, weight0, no approved remediation.').join('\n')}

The deck remains a bound container observation with13 children and **zero new review credit**. This avoids silently adding a fourteenth proposal or approving shared deck scope. No new lesson/selector disposition or canonical identifier is created.

## Preserved boundaries and validation

The last residual-PBQ packet is SHA-256 **${hashFile(basePath)}**. Its source bindings and immutable prior-hold objects are carried forward: earliest ambiguities, KEV teaching limits, RTO/RPO/MTTR roles, private-source boundaries, pilot feedback links, p014's single keyed decision, p048/p211 recovery roles, hidden-evidence holds, seven older full-feedback gaps and recent grading/delivery qualifications. All **13 recent semantic deferrals** remain zero credit. No pilot role/weight/teaching publication or existing approval transfers to these cards.

Private p003/p017 question and feedback identities retain their source fingerprints and null trusted IDs; no payload is fetched, compared, exported or replaced by a local fallback. Existing unavailable/private scopes and unsupported PBQ delivery holes remain unresolved. No grammar, learner UI, question, card, lesson, database, flag, scheduler or runtime module changes.

The active package remains **1878 records,435 concept identities,2954 queued decisions,489 unresolved question mappings,seven existing primary question proposals**. Frozen ledger SHA-256 **${hashFile(ledgerPath)}** and active package SHA-256 **${hashFile('docs/evidence/phase-2b5/mapping-package.json')}** remain exact. All **25 protected release files** match their saved checksums. New trusted IDs are null, links/weights stay zero, and human/publication/activation/independence approvals stay false.

The focused audit rejects **${negativeMutationChecks} mutations**, covering stale card/face/deck/line revisions, wrong parent/deck, invented content or identities, duplicated records, shared-objective transfer, link-only credit promotion, lost deferrals/holds, raw-face/answer/private export and false activation. Every export is compared with the source-rebuilt expected packet. Run node ${scriptPath}, npm run audit:content-mapping (29 mapping tests plus deterministic package reproduction), and git diff --check before the task-only [skip deploy] commit/push. Confirm the configured Vercel skip hook, exact HEAD=origin/main=remote and all three file SHA-256 values after push.

**Phase 2B-5 remains NOT READY.** No fresh browser, learner-runtime, private database or production validation is claimed. Owner approval, canonical mappings/calibration, independent assessment families, remaining content/feedback and deployment decisions remain separate work.
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report);verifySourceBindings(sourceBindings);
console.log(JSON.stringify({status:'PASS_OFFLINE_SOCIAL_ENGINEERING_CARD_PROPOSALS_NOT_READY',priorPackets:73,candidates:13,newCardProposals:11,deferred:deferredSelectedRows.map(r=>r.recordId),sourceDerivedFaces:39,negativeMutationChecks,bankProgress,supportProgress,objectiveProgress:Object.fromEntries(Object.entries(objectiveCoverage).map(([code,v])=>[code,v.denominator])),unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
