import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit,readSelectors} from './lib/content-mapping/delivery-inventory.mjs';

const scriptPath='scripts/audit-objective33-mcqs.mjs',packetPath='docs/drafts/phase-2b5-objective33-mcqs-proposals.json',reportPath='docs/phase-2b5-objective33-mcqs-review.md';
const basePath='docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json',firstPath='docs/drafts/phase-2b5-objective23-fastlane-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'2938e216c5489b905b313530b809e5647f1adc445897da571b9388a45094213e');
const c=readReviewTriage(),base=readJson(basePath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
// Only substantive arrays overlay the frozen inventory; inspection references earn no credit.
for(const path of [firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json',basePath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals]){
  assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const ranked=c.ledger.rows.filter(r=>r.kind==='mcq'&&r.objectiveCodesObserved.includes('3.3')&&!c.previous.has(r.recordId)).sort((a,b)=>b.priorityScore-a.priorityScore||a.recordId.localeCompare(b.recordId,'en'));
const selected=ranked.slice(0,8),deferred=ranked.slice(8),ids=["m064", "m193", "m198", "m389", "m606", "m019", "m242", "m059"];
assert.equal(ranked.length,8);assert.deepEqual(selected.map(r=>r.questionId),ids);assert.deepEqual(selected.map(r=>r.priorityScore),[35,35,35,35,30,25,25,10]);
const meanings=[
  "Choose static fictitious field replacement for the supplied realistic test-copy requirement; no vault alone does not exclude every tokenisation design or prove anonymity.",
  "Recognise the highest-harm classification label under the expressly supplied company scheme; whole numbered comparative scope remains held.",
  "Choose identifier substitution with restricted additional mapping over exposing original values to analysts; one pseudonymisation strategy, not irreversible anonymity.",
  "Choose the stipulated realistic synthetic test data without real identities over production copies, read-only access or short retention; privacy and utility still require assessment.",
  "Recognise confidentiality as the primary property of the supplied storage encryption, conditional on protected keys; whole numbered comparative scope remains held.",
  "Recognise the supplied recoverable vault-mapping design as tokenisation; near-duplicate m648, with whole numbered naming scope held.",
  "Recognise the RED sharing boundary for individual recipients; not government verification or a formal classification scheme, with whole numbered scope held.",
  "Recognise actively processed CPU/memory data as the in-use state; duplicate transit/motion distractors and whole numbered definition scope remain held."
];
const holds=[
  "HOLD fictitious replacement of names/identifiers as complete anonymisation, absence of a vault as absence of linkage, or every tokenisation scheme as requiring a lookup vault. Remaining fields and repeated surrogate values may permit linkage or re-identification. Static masking meets the stated replacement need, but the unqualified tokenisation option includes designs beyond the vault-based wrong-feedback contrast; format-preserving or irreversible constructions may overlap. Encryption and masking can be combined; encryption by itself is not fictitious test data, and ordinary hashes of low-entropy names permit guessing rather than universally proving hash reversibility. The current test-copy premise replaces the authored researcher-sharing scenario and removes its absolute non-recovery claim. No actual patient data, transformation, privacy analysis, research suitability or legal outcome is tested.",
  "HOLD this company classification order as universal, Restricted as equivalent to Top Secret, all highest-harm data as governed by national-security labels, or a label as enforced handling. The current premise explicitly defines the company ordering, replacing authored collapsed Internal/Confidential and Restricted/Top Secret choices and mandatory-control claims. Select the supplied highest tier rather than importing another scheme. No actual disclosure-impact assessment, encryption requirement, need-to-know permission or approval workflow is established. Naming one supplied tier does not independently compare classification strategies across organisations; retain 3.3 context and hold whole numbered scope without forcing another code. Authored domain 5 becomes effective domain 3; observed easy is uncalibrated.",
  "HOLD substituted direct identifiers as ensuring analysts cannot re-identify customers, restricted mapping as proven access enforcement, tokens as universally harmless or pseudonymisation as irreversible anonymisation. Transaction patterns and other quasi-identifiers can remain linkable even without analyst access to the mapping. The current keyed option removes the authored anonymisation/pseudonymisation conflation and specifies protected additional information. Giving analysts keys to the unchanged encrypted data, passwords to the unchanged file or access to fewer users does not hide the stated identifiers from those readers; these controls can coexist with replacement. This is one strategy choice, not independently scored token generation, vault authorisation, anonymity or compliance. Authored domain 5 becomes effective domain 3; stem change is organisation spelling, while choices and meaning change. No transaction dataset, analyst, mapping, linkage attack or transformation is tested.",
  "HOLD a synthetic-data label as proving no real-person information, no model memorisation, statistical suitability or automatic removal of privacy duties. The option expressly supplies no real customer identities; that premise is not a verified property of a generator. Models trained on production records can leak attributes or reconstruct records even without copying a named identity. Use validated non-identifying data when it meets test needs; utility, relationships and privacy require their own assessment. Current synthetic-data selection replaces authored masking/anonymisation of production data and its regulatory-scope shortcut. Masking, pseudonymisation and fully synthetic generation are not interchangeable guarantees. Read-only permissions limit changes rather than exposure, and short retention does not prevent exposure during access. No customer records, generator, test utility, privacy attack or legal outcome is tested.",
  "HOLD AES-256 or all-storage-block wording as proving a secure encryption mode, key custody, integrity, authenticity, non-repudiation, availability or protection of an unlocked compromised endpoint. The stem supplies storage encryption and asks for its primary CIA property, not a deployed configuration. Encryption modes may add authentication, but bare AES key length does not establish it; lack of stated authentication is not proof that every encrypted system has none. Non-repudiation is distinct from ordinary message authentication, and unavailable/lost keys can obstruct recovery. Current main adds the protected-key and endpoint limits; three authored fallback corrections become answer-specific. Imported QB1 question 6, medium to effective easy, uncalibrated. Hold whole 3.3 comparative-strategy scope for naming the supplied primary property; correlate m075/m212/m208 without imported assessment of their independent premises. No disk, AES mode, key, malware, tag, signature or recovery operation is tested.",
  "HOLD all tokens as vault-backed, mathematically unrelated or incapable of cryptographic recovery, all masking as non-production-only, or a secure vault label as verified protection. This particular random-surrogate separate-mapping design is recognised; retrieval follows its protected mapping rather than decrypting these surrogate values, while encryption can protect the vault and other token designs may be cryptographic. An ordinary digest alone does not implement the supplied mapping, but hashes can coexist with stored lookup data and guessing remains possible. Masking can obscure or substitute fields and overlap with tokenisation; the explicit recoverable reference relation disambiguates this scenario. The source removes authored universal mathematical-relation and non-production claims. Strong near-duplicate of m648, same provisional family, no new independence. Hold whole numbered scope for design naming, retaining 3.3 context. No payment record, token, mapping request, vault permissions or compliance outcome is tested.",
  "HOLD TLP as a formal data classification, encryption requirement, proof of government verification or content accuracy, and label recognition as enforcement of a sharing boundary. FIRST v2.0 RED is limited to individual recipients; in a meeting the recipient group is those present, and wider sharing requires source permission. The supplied report has no special meeting context. Current main corrects authored AMBER versus AMBER+STRICT boundaries: AMBER includes need-to-know organisation and clients, STRICT limits internally; additional source restrictions still apply. GREEN is community rather than public release, and CLEAR permits public sharing subject to applicable release rules. Only the RED decision is assessed, not four independent colour skills or implemented access control. Authored domain 2 becomes effective domain 3; option differences are spelling. Hold whole 3.3 comparative scope with context only; no report content, recipient identity, permission request, forwarding or verification is tested.",
  "HOLD in-use data as universally plaintext, impossible to protect, or memory residency as proving a specific protection boundary. Current main qualifies conventional plaintext processing and specialised protection, removing authored must-decrypt/hardest-to-protect claims. At-rest data may be encrypted or unencrypted; database storage is at rest while values being processed are in use, so one object can pass through states. Transit is broader than network-only examples. Retained wrong feedback compresses TLS/IPsec into guaranteed transport encryption: IPsec can use non-confidentiality services, and trusted peer/implementation assumptions remain. Transit and motion distractors are synonymous here, not distinct evidence or independent comparisons. Hold whole numbered comparative-strategy scope for pure state naming, keep 3.3 context and correlate m606/m075/m314/m418 without importing their scenarios. Medium becomes effective easy, uncalibrated. No memory, processor, enclave, encrypted computation or transport is tested."
];
const mainTeaching=[
  "Static replacement produces the requested fictitious test fields; assess other fields and linkage, and do not infer that every token design needs a vault.",
  "Apply the highest tier defined by this company, with organisation-specific handling rather than universal national-security equivalence.",
  "Protect additional identifying information while substituting identifiers; linkage can remain and this is not irreversible anonymity.",
  "Use the stipulated synthetic data when it meets test needs; a generator label alone does not establish privacy or utility.",
  "Storage encryption primarily conceals content from parties without keys; plaintext access and endpoint compromise remain limits.",
  "This vault-backed reference design recovers originals through a mapping; other token constructions and protection of the vault remain separate.",
  "RED confines further sharing to the recipient boundary; colour guidance is not verification, encryption or a formal classification.",
  "In-use describes active processing; conventional plaintext exposure and specialised protections are distinct from this state label."
];
const contrasts=[
  [
    "Encryption alone retains recoverable original values rather than producing fictitious fields; format-preserving transformations can overlap with other designs.",
    "The correction excludes vault-backed tokenisation, while the unqualified option still permits vaultless variants; retain this precise category-overlap hold.",
    "An ordinary name digest loses realistic name format and low-entropy names can be guessed; this does not prove every hash construction reversible."
  ],
  [
    "Public is the supplied release tier rather than the highest business-harm tier.",
    "Internal is below the explicitly defined strictest tier in this particular scheme.",
    "Confidential still needs protection but is not the top tier under the supplied ordering."
  ],
  [
    "Giving analysts the key to unchanged ciphertext exposes the original identifying fields on decryption.",
    "A password restricts file opening rather than concealing identifying fields from permitted readers.",
    "Limiting the unchanged data to fewer readers still exposes the identifiers to those readers."
  ],
  [
    "A production copy introduces another exposure location instead of eliminating real identities.",
    "Read-only production access restricts modification but still permits disclosure to readers.",
    "A promised short lifetime does not remove disclosure risk during the period of access."
  ],
  [
    "Evidence of origin/actions is different from hiding stored contents; encryption alone does not establish non-repudiation.",
    "Undetected-modification protection needs a suitable integrity/authentication construction, not a key-length label alone.",
    "Encryption alone does not assure availability; key loss and recovery design can affect access."
  ],
  [
    "This mapping-based recovery differs from decrypting these surrogate values with a key; vault encryption and cryptographic tokens can coexist.",
    "A digest by itself is not the separate recoverable reference mapping specified; this does not prohibit hash-indexed lookup designs.",
    "Masking overlaps in obscuring/substituting values, but the expressly recoverable vault relation identifies this reference model."
  ],
  [
    "Public sharing uses CLEAR under current TLP, subject to source restrictions and applicable release rules.",
    "AMBER+STRICT describes organisation-only need-to-know sharing; RED is limited to the individual recipient boundary.",
    "Sharing labels do not establish verification by a government agency or the accuracy of the content."
  ],
  [
    "Stored values are at rest; encryption is a protection choice rather than an inherent guarantee from the state name.",
    "Moving data is in transit; the retained network/TLS/IPsec shorthand needs confidentiality and trust/configuration qualifications.",
    "Motion and transit are synonyms in these options, not CPU processing or separately assessed state knowledge."
  ]
];
const preciseHolds=[
  "vaultless_token_variants_and_masking_not_anonymity",
  "whole_numbered_company_label_recognition_scope",
  "direct_identifier_replacement_not_verified_nonidentifiability",
  "synthetic_label_not_verified_privacy_or_utility",
  "whole_numbered_CIA_property_and_unstated_mode_scope",
  "whole_numbered_vault_design_naming_and_token_variants",
  "whole_numbered_TLP_recognition_not_formal_classification",
  "whole_numbered_state_definition_and_transport_encryption_shorthand"
];
const roles=[
  "test_copy_transformation_choice",
  "company_classification_label_recognition",
  "restricted_identifier_mapping_strategy_choice",
  "nonidentifying_synthetic_test_data_choice",
  "storage_encryption_primary_property_recognition",
  "vault_reference_design_recognition",
  "individual_recipient_sharing_label_recognition",
  "active_processing_state_recognition"
];
const families=[
  "fictitious_test_field_replacement_choice",
  "company_defined_highest_harm_tier_recognition",
  "analyst_identifier_substitution_strategy_choice",
  "nonidentifying_test_data_exposure_choice",
  "storage_encryption_primary_CIA_property_recognition",
  "vault-reference-tokenization-recognition",
  "TLP_RED_recipient_boundary_recognition",
  "active_processing_data_state_recognition"
];
const scopes=[
  {
    "assessedCodes": [
      "3.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_strategy_comparison_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.3"
    ],
    "status": "held_whole_numbered_classification_property_design_sharing_or_state_naming_scope"
  },
  {
    "assessedCodes": [
      "3.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_strategy_comparison_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [
      "3.3"
    ],
    "contextCodes": [],
    "status": "inferred_narrow_strategy_comparison_pending_owner_not_whole_objective"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.3"
    ],
    "status": "held_whole_numbered_classification_property_design_sharing_or_state_naming_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.3"
    ],
    "status": "held_whole_numbered_classification_property_design_sharing_or_state_naming_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.3"
    ],
    "status": "held_whole_numbered_classification_property_design_sharing_or_state_naming_scope"
  },
  {
    "assessedCodes": [],
    "contextCodes": [
      "3.3"
    ],
    "status": "held_whole_numbered_classification_property_design_sharing_or_state_naming_scope"
  }
];
const units=[sourceUnit('src/App.jsx','function MCQPractice(','function UpgradeModal('),sourceUnit('src/App.jsx','function shuffleMcqOptions(','function playAnswerSound('),sourceUnit('src/App.jsx','function getWrongOptionFeedback(','function MCQFeedbackVerdict(')];
assert.deepEqual(units.map(u=>u.provenance),base.deliveryBindings);assert.equal(readSelectors().find(r=>r.id==='practice-launch').sourceSignature,base.practiceSelectorBinding);
const shuffle=Function('Math',units[1].code+';return shuffleMcqOptions;')({floor:Math.floor,random:()=>0}),wrong=Function(units[2].code+';return getWrongOptionFeedback;')();
assert.equal(selected.filter(r=>r.flags.stemChanged).length,4);assert.equal(selected.filter(r=>r.flags.optionsChanged).length,6);assert.deepEqual(selected.filter(r=>r.flags.importedSource).map(r=>r.questionId),['m606']);
const questionProposals=selected.map((row,i)=>{
  const s=c.questions.get(row.recordId),q=s.q,shuffled=shuffle(q);assert.notEqual(row.revisions.preEditorialSnapshotMerged,row.revisions.localEffective);
  assert.equal(shuffled.opts[shuffled.correct],q.opts[q.correct]);assert.deepEqual([...shuffled.opts].sort(),[...q.opts].sort());
  for(const [j,t]of shuffled.opts.entries())if(j!==shuffled.correct)assert.equal(wrong(shuffled,j),q.wrongFeedback[q.opts.indexOf(t)]);
  assert.equal(q.correct,s.preQuestion.correct);
  assert.equal(s.snapshots.length,0);assert.equal(s.captures.length,0);assert(s.authored);assert.equal(row.revisions.authored,row.revisions.preEditorialSnapshotMerged);assert.equal(q.correct,s.authored.correct);

  return{recordId:row.recordId,questionId:q.id,kind:'mcq',sourceRevision:row.revisions.localEffective,publishedRecordSignature:row.revisions.publishedCatalogue,revisions:row.revisions,sourcePriority:row.priorityScore,triageFlags:row.flags,capturedOverrideBindings:row.capturedOverrides,snapshotReplayChecked:false,sourceLayerDisposition:'authored_equals_preeditorial_but_differs_from_effective',difficultyObserved:q.difficulty,difficultyDisposition:'source_label_uncalibrated',assessedUnderstanding:meanings[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],skillRoleProposal:roles[i],numberOfKeyedDecisions:1,primaryConceptProposal:null,secondaryConceptProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,familyLabelProposal:families[i],familyStatus:'provisional_comparison_no_independence_approval',optionShuffleProbe:{derivedRevision:sig(shuffled),fixedRandomness:0,decisionPreserved:true,feedbackRemapChecked:true,newFamilyCredit:0}};
});
assert.equal(questionProposals.filter(r=>r.snapshotReplayChecked).length,0);assert.equal(questionProposals.filter(r=>r.revisions.authored===null).length,0);
const explanationProposals=questionProposals.map((parent,i)=>{
  const s=c.questions.get(parent.recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(indices.length,3);assert.equal(Object.keys(q.wrongFeedback).filter(j=>Number(j)!==q.correct).length,3);
  return{recordId:'explanation:'+parent.recordId,kind:'explanation_bundle',parentId:parent.recordId,sourceRevision:s.feedback.sourceSignature,parentLocalRevision:parent.sourceRevision,parentPublishedRevision:parent.publishedRecordSignature,mainCorrectionRevision:sig(q.exp),wrongFeedbackRevision:sig(q.wrongFeedback),mainTeachingUnderstanding:mainTeaching[i],contentQualification:holds[i],objectiveScopeProposal:scopes[i],withheldPreciseContrast:preciseHolds[i],roleProposal:'conditional_parent_feedback_not_assessed_secondary',deliveryGate:base.feedbackGate,distractorCorrections:indices.map((j,k)=>{assert.equal(wrong(q,j),q.wrongFeedback[j]);return{choiceRevision:sig(q.opts[j]),correctionRevision:sig(q.wrongFeedback[j]),teachingRationale:contrasts[i][k],assessedSecondary:false,weight:0};}),primaryConceptProposal:null,secondaryConceptProposals:[],conceptLinkProposals:[],trustedRevisionId:null,masteryWeight:0,newFamilyCredit:0,humanApproved:false,published:false,independentEvidence:false,approvedRemediation:false,learnerObservedRecovery:false};
});
const selectedIds=new Set([...questionProposals,...explanationProposals].map(r=>r.recordId)),broad=c.pkg.records.filter(r=>r.objectiveCodes.includes('3.3')),old=broad.filter(r=>c.previous.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)),counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(k=>[k,rows.filter(r=>r.kind===k).length]));
assert.equal(broad.length,164);assert.equal(old.length,18);assert.deepEqual(counts(old),{glossary_definition:18});assert.equal(selectedIds.size,16);assert.equal(remaining.length,130);assert.equal(broad.filter(r=>r.kind==='mcq').length,8);assert.equal(remaining.filter(r=>r.kind==='mcq').length,0);assert.deepEqual(remaining.filter(r=>r.kind==='pbq').map(r=>r.id),['pbq:p041','pbq:p074']);assert.equal(remaining.filter(r=>r.kind==='explanation_bundle').length,2);
const census=broad.map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_agent_disposition_pending_owner':'inventory_only_deferred'}));
const bankRows=c.ledger.rows,priorQuestions=bankRows.filter(r=>c.previous.has(r.recordId)),priorFeedback=bankRows.filter(r=>c.previous.has('explanation:'+r.recordId));
assert.equal(priorQuestions.length,237);assert.equal(priorFeedback.length,237);
const bankProgress={denominator:483,mcqDenominator:395,pbqDenominator:88,priorQuestions:237,newQuestions:8,combinedQuestions:245,remainingQuestions:238,combinedMcqs:229,remainingMcqs:166,combinedLocalPbqs:16,remainingLocalPbqs:72,pairedFeedbackCombined:245,pairedFeedbackRemaining:238};
assert.equal(priorQuestions.filter(r=>r.kind==='mcq').length + 8,bankProgress.combinedMcqs);assert.equal(priorQuestions.filter(r=>r.kind==='pbq').length,16);
const priorHolds={sourcePacketPath:basePath,sha256:hashFile(basePath),inheritedHolds:base.priorHolds,objective32FinalHeldDispositions:base.explanationProposals.filter(r=>r.withheldPreciseContrast).map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,withheldPreciseContrast:r.withheldPreciseContrast,contentQualification:r.contentQualification,objectiveScopeProposal:r.objectiveScopeProposal}))};
assert.equal(priorHolds.objective32FinalHeldDispositions.length,8);assert.equal(priorHolds.inheritedHolds.objective32PriorityHeldDispositions.length,6);
// The complete prior hold chain stays source-bound; each contrast has a removal probe below.
const prior18=old.map(r=>({recordId:r.id,sourceRevision:r.sourceSignature,priorPacketPath:c.previous.get(r.id).path,priorDispositionRevision:sig(c.previous.get(r.id).row),status:'prior_substantive_reference_no_new_credit'}));
const comparisonSpecs=[
  {
    "ids": [
      "mcq:m064",
      "mcq:m198",
      "mcq:m389",
      "mcq:m019",
      "mcq:m648"
    ],
    "meaning": "Fictitious field replacement, protected identifier mapping and stipulated non-identifying synthetic test data have different retention/recovery assumptions but overlap as data-exposure decisions. m064/m389 are strongly correlated test-data selection despite different source derivation and options; m198 depends on protected mapping and residual linkage. m019/m648 are near-duplicate vault-reference naming in one provisional family. Token/masking labels do not prove anonymity or independence; no additional substantive credit for comparison references."
  },
  {
    "ids": [
      "mcq:m606",
      "mcq:m059",
      "mcq:m075",
      "mcq:m212",
      "mcq:m208",
      "mcq:m314",
      "mcq:m418"
    ],
    "meaning": "Storage-confidentiality recognition correlates with prior offline FDE choice but supplies neither its powered-off state nor tested key protection. In-use state naming does not verify protected processing. AEAD/authenticated origin and channel properties are separate; bare encryption need not supply integrity or origin, and IPsec need not provide confidentiality. Retain all prior key, nonce/tag, trusted-peer, IPsec/PFS and endpoint holds without independent role or family credit."
  },
  {
    "ids": [
      "mcq:m193",
      "mcq:m242"
    ],
    "meaning": "A company-defined highest-harm tier and TLP recipient sharing boundaries are different schemes. TLP is not a formal classification or assurance of accuracy; neither label implements handling controls. Naming stimuli do not establish broad comparison, legal compliance, authority or evidence independence."
  }
];
const comparisons=comparisonSpecs.map(g=>({recordIds:g.ids,comparisonUnderstanding:g.meaning,revisions:g.ids.map(id=>{const r=c.records.get(id),p=c.previous.get(id);assert(r);return{recordId:id,sourceRevision:r.sourceSignature,localRevision:r.localRevisionSignature??null,priorPacketPath:p?.path??null,priorDispositionRevision:p?sig(p.row):null,status:selectedIds.has(id)?'current_substantive_disposition':p?'prior_disposition_reference_only':'inspection_only_no_new_credit'};}),newFamilyCredit:0,independenceApproved:false}));
const priorBatchComparisons=base.questionProposals.map(r=>{assert.equal(r.publishedRecordSignature,c.records.get(r.recordId).sourceSignature);return{recordId:r.recordId,sourceRevision:r.sourceRevision,publishedRecordSignature:r.publishedRecordSignature,feedbackRevision:c.records.get('explanation:'+r.recordId).sourceSignature,priorDecisionRevision:sig(r),status:'prior_substantive_reference_no_new_credit'};});
const packet={schemaVersion:1,status:'LOCAL_AGENT_REVIEW_NOT_READY',baselineCommit:'88be4f7b64e19c269fb454deb3f5cc5b50971f7c',sourceBindings:[...base.sourceBindings,{path:basePath,sha256:hashFile(basePath)},{path:'docs/phase-2b5-objective32-final-mcqs-review.md',sha256:hashFile('docs/phase-2b5-objective32-final-mcqs-review.md')},{path:scriptPath,sha256:hashFile(scriptPath)}],triageLedgerBinding:{path:ledgerPath,sha256:hashFile(ledgerPath),rebuiltFromCurrentSourceAndMatched:true,inventoryOnly:true,baselinePriorQuestions:125,substantiveOverlayPackets:[firstPath,'docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json',basePath].map(path=>({path,sha256:hashFile(path)})),currentPriorQuestions:237},bankSignature:c.ledger.bankSignature,selectionPolicy:'All 8 undispositioned objective 3.3 MCQs by existing triage priority then record ID; structural cues do not prove correctness or semantic error',selectedQuestionRecordIds:ids.map(id=>'mcq:'+id),selectedFeedbackRecordIds:ids.map(id=>'explanation:mcq:'+id),deferredObjective33QuestionRecordIds:deferred.map(r=>r.recordId),questionProposals,explanationProposals,instructionalProposals:[],comparisonGroups:comparisons,priorBatchComparisons,priorObjective33Dispositions:prior18,priorHolds,objective33Census:census,objective33Denominator:{broadCandidates:164,priorAgentDispositions:18,newAgentDispositions:16,combinedAgentDispositions:34,remaining:130,remainingByKind:counts(remaining)},remainingObjective33RecordIds:remaining.map(r=>r.id),bankProgress,separateAssessmentDenominator:{privateVariants:2,starterAssessments:9,guestDemoAssessments:2},deliveryBindings:base.deliveryBindings,practiceSelectorBinding:base.practiceSelectorBinding,feedbackGate:base.feedbackGate,tooltipDeliveryObserved:false,scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved:false,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,activeUnresolvedMappingsUnchanged:489,unchangedReleaseHashes:25};

function validate(value){
  assertSafeReviewExport(value);verifySourceBindings(value.sourceBindings);assert.deepEqual(value.sourceBindings,packet.sourceBindings);
  assert.deepEqual(value.selectedQuestionRecordIds,selected.map(r=>r.recordId));assert.deepEqual(value.selectedFeedbackRecordIds,selected.map(r=>'explanation:'+r.recordId));assert.deepEqual(value.deferredObjective33QuestionRecordIds,deferred.map(r=>r.recordId));
  assert.equal(new Set([...value.questionProposals,...value.explanationProposals].map(r=>r.recordId)).size,16);assert.equal(value.questionProposals.length,8);assert.equal(value.explanationProposals.length,8);
  for(const [i,r]of value.questionProposals.entries()){
    const s=c.questions.get(selected[i].recordId);assert.equal(r.recordId,selected[i].recordId);assert(!c.previous.has(r.recordId));assert.deepEqual(r.revisions,s.row.revisions);assert.equal(r.sourceRevision,s.record.localRevisionSignature);assert.equal(r.publishedRecordSignature,s.record.sourceSignature);
    assert.deepEqual(r.capturedOverrideBindings,s.row.capturedOverrides);assert.equal(r.snapshotReplayChecked,s.snapshots.length>0);assert.deepEqual(r.triageFlags,s.row.flags);assert.equal(r.sourcePriority,s.row.priorityScore);assert.equal(r.difficultyObserved,s.q.difficulty);assert.equal(r.difficultyDisposition,'source_label_uncalibrated');assert.equal(r.familyStatus,'provisional_comparison_no_independence_approval');assert.equal(r.sourceLayerDisposition,'authored_equals_preeditorial_but_differs_from_effective');assert.equal(r.assessedUnderstanding,meanings[i]);assert.equal(r.contentQualification,holds[i]);assert.deepEqual(r.objectiveScopeProposal,scopes[i]);assert.equal(r.skillRoleProposal,roles[i]);assert.equal(r.numberOfKeyedDecisions,1);assert.equal(r.familyLabelProposal,families[i]);
    assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);for(const f of ['masteryWeight','newFamilyCredit'])assert.equal(r[f],0);for(const f of ['humanApproved','published','independentEvidence'])assert.equal(r[f],false);
  }
  for(const [i,r]of value.explanationProposals.entries()){
    const s=c.questions.get(selected[i].recordId),q=s.q,indices=q.opts.map((_,j)=>j).filter(j=>j!==q.correct);assert.equal(r.recordId,'explanation:'+s.row.recordId);assert.equal(r.parentId,s.row.recordId);assert.equal(r.sourceRevision,s.feedback.sourceSignature);assert.equal(r.parentLocalRevision,s.row.revisions.localEffective);assert.equal(r.parentPublishedRevision,s.record.sourceSignature);assert.equal(r.mainCorrectionRevision,sig(q.exp));assert.equal(r.wrongFeedbackRevision,sig(q.wrongFeedback));assert.equal(r.mainTeachingUnderstanding,mainTeaching[i]);assert.equal(r.contentQualification,holds[i]);assert.deepEqual(r.objectiveScopeProposal,scopes[i]);assert.equal(r.withheldPreciseContrast,preciseHolds[i]);assert.equal(r.deliveryGate,base.feedbackGate);
    assert.equal(r.distractorCorrections.length,3);for(const [k,d]of r.distractorCorrections.entries()){assert.equal(d.choiceRevision,sig(q.opts[indices[k]]));assert.equal(d.correctionRevision,sig(q.wrongFeedback[indices[k]]));assert.equal(d.teachingRationale,contrasts[i][k]);assert.equal(d.assessedSecondary,false);assert.equal(d.weight,0);}
    assert.equal(r.trustedRevisionId,null);assert.equal(r.primaryConceptProposal,null);assert.deepEqual(r.secondaryConceptProposals,[]);assert.deepEqual(r.conceptLinkProposals,[]);for(const f of ['masteryWeight','newFamilyCredit'])assert.equal(r[f],0);for(const f of ['humanApproved','published','independentEvidence','approvedRemediation','learnerObservedRecovery'])assert.equal(r[f],false);
  }
  assert.deepEqual(value.objective33Census,census);assert.deepEqual(value.remainingObjective33RecordIds,remaining.map(r=>r.id));assert.deepEqual(value.objective33Denominator,packet.objective33Denominator);assert.deepEqual(value.bankProgress,bankProgress);assert.deepEqual(value.separateAssessmentDenominator,packet.separateAssessmentDenominator);
  assert.deepEqual(value.priorObjective33Dispositions,prior18);assert.deepEqual(value.priorHolds,priorHolds);assert.deepEqual(value.comparisonGroups,comparisons);assert.deepEqual(value.priorBatchComparisons,priorBatchComparisons);assert.deepEqual(value.triageLedgerBinding,packet.triageLedgerBinding);assert.deepEqual(value.deliveryBindings,base.deliveryBindings);assert.equal(value.practiceSelectorBinding,base.practiceSelectorBinding);assert.equal(value.feedbackGate,base.feedbackGate);
  for(const f of ['activationAllowed','humanApproved','published','eligibleEvidence','scopeSkillDifficultyCanonicalFamilyWeightEvidenceTeachingPublicationApproved','tooltipDeliveryObserved'])assert.equal(value[f],false);assert.equal(value.masteryWeight,0);assert.equal(value.unchangedReleaseHashes,25);assert.equal(value.activeUnresolvedMappingsUnchanged, 489);
}
validate(packet);
let negativeMutationChecks=0;
const reject=mutate=>{const copy=structuredClone(packet);mutate(copy);assert.notDeepEqual(copy,packet,'Negative mutation must actually change the packet');assert.throws(()=>validate(copy));negativeMutationChecks++;};
for(let i=0;i<8;i++){
  reject(p=>p.questionProposals[i].sourceRevision=p.questionProposals[i].revisions.preEditorialSnapshotMerged);
  reject(p=>p.questionProposals[i].trustedRevisionId=p.questionProposals[i].revisions.trustedCompilerObserved);
  reject(p=>p.questionProposals[i].contentQualification='');
  reject(p=>p.questionProposals[i].revisions.authored=null);
  reject(p=>p.questionProposals[i].snapshotReplayChecked=!p.questionProposals[i].snapshotReplayChecked);
  reject(p=>p.questionProposals[i].capturedOverrideBindings=[{captureIdentityRevision:'invented'}]);
  reject(p=>p.questionProposals[i].numberOfKeyedDecisions=2);
  reject(p=>p.questionProposals[i].sourcePriority=0);reject(p=>p.questionProposals[i].familyLabelProposal='independent_new_family');reject(p=>p.explanationProposals[i].contentQualification='');reject(p=>p.questionProposals[i].triageFlags.optionsChanged=!p.questionProposals[i].triageFlags.optionsChanged);
  reject(p=>p.explanationProposals[i].parentLocalRevision=p.questionProposals[(i+1)%8].sourceRevision);
  reject(p=>p.explanationProposals[i].sourceRevision=p.explanationProposals[(i+1)%8].sourceRevision);
  for(let k=0;k<3;k++)reject(p=>p.explanationProposals[i].distractorCorrections[k].correctionRevision='stale');
}
for(const [i,h]of preciseHolds.entries())if(h)reject(p=>p.explanationProposals[i].withheldPreciseContrast=null);for(const i of [1,4,5,6,7])reject(p=>p.questionProposals[i].objectiveScopeProposal.assessedCodes=['3.3']);
// Each inherited contrast is independently removable in a negative probe; the full chain stays bound.
const holdPaths=[];
function findHolds(value,path=[]){for(const [key,child]of Object.entries(value)){const next=[...path,key];if(key==='withheldPreciseContrast'&&child)holdPaths.push(next);else if(child&&typeof child==='object')findHolds(child,next);}}
findHolds(priorHolds);
for(const path of holdPaths)reject(p=>{let target=p.priorHolds;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=null;});
for(const field of ['m305WholeScopeHold','m046HeldContrast','m432WholeNumberedScopeHeld'])reject(p=>{const old=p.priorHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.inheritedHolds.earlierHolds.objective23Holds;if(field==='m305WholeScopeHold')old[field]=null;else old.priorHolds[field]=null;});
reject(p=>p.questionProposals[0].newFamilyCredit=1);reject(p=>p.questionProposals[0].humanApproved=true);reject(p=>p.questionProposals[0].primaryConceptProposal='invented');reject(p=>p.questionProposals[0].independentEvidence=true);
reject(p=>p.explanationProposals[0].deliveryGate='free_before_submission_all_options');reject(p=>p.explanationProposals[0].approvedRemediation=true);reject(p=>p.explanationProposals[0].distractorCorrections[0].assessedSecondary=true);reject(p=>p.explanationProposals[0].masteryWeight=1);
reject(p=>p.selectedQuestionRecordIds[7]=selected[0].recordId);reject(p=>p.questionProposals.pop());reject(p=>p.explanationProposals[1]=p.explanationProposals[0]);reject(p=>p.deferredObjective33QuestionRecordIds.push(selected[0].recordId));
reject(p=>p.objective33Census.pop());reject(p=>p.objective33Census.push(p.objective33Census[0]));reject(p=>p.objective33Census.find(r=>r.recordId===remaining[0].id).status='new_agent_disposition_pending_owner');reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.separateAssessmentDenominator.privateVariants=0);
reject(p=>p.priorObjective33Dispositions.pop());reject(p=>p.priorBatchComparisons.pop());reject(p=>p.questionProposals[0].objectiveScopeProposal={assessedCodes:['3.3','2.4'],contextCodes:[],status:'approved'});reject(p=>p.questionProposals[7].skillRoleProposal='observed_memory_protection');reject(p=>p.sourceBindings[0].sha256='stale');reject(p=>p.activationAllowed=true);for(const f of ['q','opts','correct','payload','learnerId'])reject(p=>p[f]='forbidden');
packet.negativeMutationChecks=negativeMutationChecks;
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(packet,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),packet,'Packet/source disposition drift');
const report=[
  '# Phase 2B-5 — objective 3.3 MCQs and paired feedback',
  '**NOT READY.** Local draft review only. Baseline **'+packet.baselineCommit+'**. Packet SHA-256 **'+hashFile(packetPath)+'**. A pending agent judgment means the current source has been read and its limits recorded; it does not mean owner approval, learner scoring or production activation. Only this packet, report and focused audit change.',
  '## Exact selection and counts',
  '**Eight** current undispositioned effective MCQs, in priority-descending then record-ID order: **'+ids.join(', ')+'**. Scores are **35, 35, 35, 35, 30, 25, 25, 10**. Each has a complete authored source, effective source and three current answer-specific corrections. None is omitted or deferred. Triage sorts the work; it is not semantic review credit.',
  'Objective 3.3 broad source-tag union: **164 records; 18 prior + 16 new = 34 pending agent dispositions; 130 remain**. The prior eighteen are glossary definitions, not previously judged MCQs. New work is **eight questions + eight paired feedback bundles**. All eight tagged MCQs and their feedback now have pending judgments, including holds. Remaining: **two PBQs (p041, p074), two paired feedback bundles and 126 support/instructional records**.',
  '| Remaining kind | Count |\n| --- | ---: |\n'+Object.entries(counts(remaining)).map(([k,n])=>'| '+k+' | '+n+' |').join('\n'),
  'Bank: **237 prior + 8 new = 245/483 questions** and 245 paired feedback pending owner. These comprise **229/395 MCQs + 16/88 local PBQs**. **238 questions and 238 paired feedback remain: 166 MCQs + 72 local PBQs**. The broad objective census includes support records; these are not extra reviewed questions. Two private variants, nine starter assessments and two guest demos retain their separate denominator. Comparison references, shuffles and machine inventories earn no additional review credit.',
  '## What each question can establish',
  questionProposals.map(r=>'**'+r.questionId+' — priority '+r.sourcePriority+'.** '+r.assessedUnderstanding+'\n\n'+r.contentQualification).join('\n\n'),
  '## Source changes and every correction',
  'All eight authored revisions equal their preeditorial revisions and differ from effective editorial revisions. No selected row has a captured override or published snapshot; zero captured-snapshot replays are claimed. m606 is imported **QB1 question 6**, still an authored input. All keyed positions remain the same; this does not mean the decision has the same meaning as before.',
  'Four stem-change flags: m064 replaces researcher sharing with a fictitious test-copy requirement; m193 supplies a specific company classification order; m198 changes organisation spelling while replacing the actual options/meaning; m389 replaces production masking with stipulated synthetic data. Six option-change flags: m064/m193/m198/m389/m019/m242. m064/m019/m242 include tokenization/organization spelling changes; m193 separates formerly combined classification labels, m198 distinguishes restricted identifier mapping from giving readers originals, and m389 chooses synthetic rather than transformed production data.',
  'm193/m198/m389 move from authored domain 5 to effective domain 3; m242 moves from domain 2 to domain 3. Four authored rows had no wrong-feedback bundle: m193/m198/m389/m242 now have three current corrections each. m606 replaces three generic fallback corrections with specific CIA contrasts. m064/m019 retain revised answer-specific contrasts; m059 retains its prior wrong-feedback wording while its main explanation changes. m606/m059 change medium to effective easy; all eight observed difficulty labels remain uncalibrated.',
  'The authored m064 irreversible-identity guarantee, m193 national-security/company equivalence and mandatory controls, m198 anonymisation/pseudonymisation conflation, m389 regulatory-scope shortcut, m606 unconditional unauthorised-read prevention, m019 universal token mathematics and non-production masking, m242 reversed AMBER/STRICT boundaries, and m059 universal plaintext/hardest-to-protect wording are superseded. The holds above record remaining category, privacy, configuration and scope limits rather than treating editorial changes as approval.',
  explanationProposals.map((r,i)=>'**'+ids[i]+' main teaching:** '+r.mainTeachingUnderstanding+'\n\nThree selected-wrong contrasts, in effective option-index order: '+r.distractorCorrections.map((d,k)=>(k+1)+'. '+d.teachingRationale).join(' ')).join('\n\n'),
  '**24 current wrong corrections** bind choice, correction, main, full bundle and both parent local/published revisions. Eight precise holds remain: m064 vaultless-token/masking overlap; m193 company-tier scope; m198 residual identifiability; m389 synthetic privacy/utility; m606 CIA/mode scope; m019 token-variant/design-naming scope; m242 TLP/formal-classification scope; m059 state/transport shorthand. Five whole numbered naming scopes (m193/m606/m019/m242/m059) retain 3.3 context without an assessed code. The other three narrow strategy-comparison proposals are inferred pending owner, not approved entire-objective competence. No forced alternate code, canonical concept, assessed secondary component, independence, weight, approved remediation or learner recovery.',
  'All eight actual fixed-randomness pure shuffles preserve keyed choice, choice multiset and selected-wrong correction remapping. Existing MCQPractice/shuffle/wrong-feedback source units and practice-selector signatures match the prior bindings. Main feedback is submitted-Pro gated; wrong feedback depends on the selected wrong choice. No browser entitlement, tooltip, disabled-option, pool/set/guest delivery or learner outcome is observed. No patient/customer/payment dataset, generator, analyst, vault, classification workflow, laptop, CPU/RAM, encryption key, transport, TLP report or sharing action executes.',
  '## Family comparisons and primary references',
  comparisons.map(g=>g.recordIds.join(', ')+': '+g.comparisonUnderstanding).join('\n\n'),
  'm019 uses prior m648 provisional vault-reference family; it is a near-duplicate, not new independent evidence. m064/m389 strongly correlate as test-data exposure choices, but source replacement versus synthetic generation remains a meaningful distinction and no canonical family merge is approved. m198 also concerns identity exposure but supplies a recoverable restricted mapping. m606 shares confidentiality teaching with m075 while asking for a property instead of selecting its powered-off stolen-device control. Data-state names, company tiers and TLP labels stay distinct; no vague Data Protection topic bucket supplies a family decision.',
  '[CompTIA SY0-701 v7 §3.3](https://lecbyo.files.cmp.optimizely.com/download/cf25ec24b8a511ef9ecbb69c0f9687be) covers comparisons of data protection concepts/strategies, including classifications, states and methods. Naming one supplied label or property may teach a prerequisite; it does not establish the entire numbered comparison scope. Our limited scope judgments remain inferred pending owner, with no active source-tag change.',
  '[NIST SP800-188](https://csrc.nist.gov/pubs/sp/800/188/final) discusses identifier and quasi-identifier treatment, synthetic generation, disclosure risk and measurable re-identification assessment; simple masking is not necessarily adequate de-identification. This supports the residual-linkage qualifications, rather than certifying the supplied fictional example or determining legal duties.',
  '[NIST synthetic-data reconstruction research](https://pages.nist.gov/privacy_collaborative_research_cycle/pages/red_team.html) describes leakage through overfitting and remaining identifying features. Our m389 inference is that the expressly supplied no-real-identities option fits the requirement, while a generator name alone is not a tested privacy guarantee. No research dataset is downloaded or attacked.',
  '[PCI SSC Tokenization Product Security Guidelines](https://listings.pcisecuritystandards.org/documents/Tokenization_Product_Security_Guidelines.pdf) distinguishes cryptographic and non-cryptographic reversible tokens, including key-based constructions without stored PAN mappings. Our m064/m019 inference is that a vault-backed explanation cannot exclude every token variant; the specific mapping premise in m019 still distinguishes its design. This is a mechanism reference, not current compliance certification or universal terminology.',
  '[NIST SP800-111 §3.2](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-111.pdf) distinguishes storage protection from authenticated-session/endpoint compromise. This supports m606/m075 key and plaintext-access limits; it does not validate an AES mode, full metadata coverage, integrity, device configuration or recovery. Preserve earlier AEAD/origin/IPsec qualifications.',
  '[FIRST TLP v2.0 §§1 and 3](https://www.first.org/tlp/) defines recipient sharing boundaries, need-to-know AMBER/client sharing, internal-only STRICT, and source permission for wider sharing. It expressly distinguishes TLP from formal classification and encryption handling. Our m242 scope inference therefore keeps report-label recognition separate from applied data classification or verified content. No independent colour skills or sharing authorisation is granted.',
  '## Preserved gates and remaining work',
  'All fourteen prior 3.2 precise holds remain: eight final and six priority, including ZTNA/alternative reach, MAC policy, AH/GRE taxonomy, guest efficiency, failure safety, WAF insider path, router definitions, DMZ isolation, DHCP naming, host-key/Telnet, port lookup, API boundary and conditional IPsec. The complete source-bound chain also preserves eleven 3.1 holds, objective2.5/2.4/2.3/2.2, actor/supplier, crypto/PKI/PFS, channels, Unicode, PBQ grammar/grading, delivery and targeting qualifications. New judgments clear none.',
  '3.3 remains **130/164** unreviewed records: p041/p074, two feedback and 126 support records. 3.2 remains **137/220**: five PBQs, five feedback and 127 support; 3.1 remains 121/220: four PBQs, four feedback and 113 support. 2.5 remains 36/66 support; 2.4 remains 108/199; 2.3 remains 102/162; 2.2 remains 73/134. Support census is inventory, not substantive review or completed phase coverage.',
  'Private p017 remains **sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42**, unavailable/unreviewed with null trusted identity. No private variant is inferred from local content. Active package remains **1878 records / 435 identities; 489 unresolved mappings; 2954 review decisions; seven existing primary proposals**, SHA-256 **056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97**. All 25 protected release hashes remain unchanged. Thirty-six unsupported local PBQ grammars, protected private review, remaining bank/support coverage and owner decisions remain gates.',
  '**NOT READY.** Local/offline/default-off/unwired/learner-invisible. Scope, canonical concepts/roles/families, independence, difficulty, weights, evidence/calibration and useful teaching still require owner approval. No runtime, private processing, live write, migration, activation, shadow write, cohort, deployment or Phase3 change.',
  '## Validation',
  'Run node '+scriptPath+' and npm run audit:content-mapping. The focused audit recomputes the exact eight/empty deferral, 164-record census, 18 + 16 objective and 237 + 8 bank counts, source provenance, 24 correction bindings and eight shuffle/remap probes. **'+negativeMutationChecks+' rejected mutations** cover source/trusted substitution, false authored/capture/replay/priority/flags/family, erased qualifications and every inherited precise hold, stale/swapped corrections, corrupt census/counts, unsupported scope/role/weight/evidence/remediation, forbidden payload export and activation. Full mapping suite: all 29 tests and deterministic package verification; 25 release hashes unchanged. Task-only **[skip deploy]** commit/push. Live/browser/private content is not checked.'
].join('\n\n')+'\n';
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report/source binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE33_MCQS_NOT_READY',reviewedIds:ids,deferredIds:deferred.map(r=>r.questionId),newDispositions:16,bankProgress,objective33:packet.objective33Denominator,snapshotReplays:0,wrongCorrections:24,shuffleProbes:8,preciseHolds:preciseHolds.filter(Boolean).length,negativeMutationChecks,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
