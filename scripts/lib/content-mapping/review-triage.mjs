import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature as sig} from '../read-learning-pilot-bank.mjs';
import {readAuthoredInputs,readAuthoredBank} from '../read-authored-bank.mjs';
import {publicationPipeline} from './publication.mjs';
import {compileRevision} from '../../../server/adaptive/revision.mjs';
import {PUBLISHED_CONTENT_SNAPSHOT} from '../../../src/data/sy0701PublishedSnapshot.js';

export const hashFile=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
export const readJson=path=>JSON.parse(readFileSync(path));
export const feedbackBundle=q=>({exp:q.exp,explanation:q.explanation,wrongFeedback:q.wrongFeedback,optionFeedback:q.optionFeedback,items:q.items,blanks:q.blanks,selectionFeedback:q.selectionFeedback});
export function verifySourceBindings(bindings){for(const b of bindings)assert.equal(hashFile(b.path),b.sha256,'Bound source drift: '+b.path);}
export function assertSafeReviewExport(value){assert(!/"(?:q|question|scenario|prompt|clue|opts|options|answer|correct|gradingKey|expected|wrongFeedback|optionFeedback|selectionFeedback|explanation|exp|payload|learnerId|email)"\s*:/.test(JSON.stringify(value)),'No stems, choices, keys, private payload or learner export');}
const priorPath='docs/drafts/phase-2b5-objective22-final-mcqs-proposals.json';
const packagePath='docs/evidence/phase-2b5/mapping-package.json';

// Inventory cues set review priority only; neither their presence nor absence clears semantics.
export function triageFlags(q,authored,pre,imported,captures,record,prior) {
  const change=field=>authored!==null&&sig(authored[field]??null)!==sig(q[field]??null);
  const wrongIndices=q.opts?.map((_,i)=>i).filter(i=>i!==q.correct)||[];
  const flags={capturedOverride:captures.length>0,snapshotOnlySource:authored===null,importedSource:imported,
    effectiveEditorialChanged:sig(q)!==sig(pre),stemChanged:change('q'),optionsChanged:change('opts'),
    possibleMultiSkillCue:/\b(?:which two|which pair|pair of|followed by)\b/i.test(q.q||q.question||''),
    priorQualificationHold:!!prior?.row.contentQualification&&/HOLD|held|unresolved/i.test(prior.row.contentQualification),
    unsupportedPbqGrading:record.kind==='pbq'&&record.trustedRevisionId===null,
    feedbackChanged:change('wrongFeedback')||change('exp')||change('explanation'),
    missingOrFallbackWrongFeedback:record.kind==='mcq'&&wrongIndices.some(i=>!q.wrongFeedback?.[i]||/this option does not best (?:satisfy|match)|the stronger answer is/i.test(q.wrongFeedback[i])),
    feedbackSemanticReviewPending:prior===undefined};
  return {flags,priorityScore:100*Number(flags.capturedOverride)+25*Number(flags.snapshotOnlySource)+40*Number(flags.possibleMultiSkillCue)+20*Number(flags.importedSource)+15*Number(flags.optionsChanged)+10*Number(flags.stemChanged)+5*Number(flags.effectiveEditorialChanged)+5*Number(flags.feedbackChanged)+50*Number(flags.unsupportedPbqGrading)+30*Number(flags.missingOrFallbackWrongFeedback)};
}

export function readReviewTriage() {
  assert.equal(hashFile(priorPath),'45b802ac854c4436957037c8019ee618e64cce0476d210fdc7c190b8afc9eea9');
  assert.equal(hashFile(packagePath),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
  const prior=readJson(priorPath),pkg=readJson(packagePath),records=new Map(pkg.records.map(r=>[r.id,r]));
  const bindings=[...prior.sourceBindings,{path:priorPath,sha256:hashFile(priorPath)}];
  verifySourceBindings(bindings);verifySourceBindings(pkg.sources);
  const previous=new Map(),priorPackets=bindings.filter(b=>b.path.startsWith('docs/drafts/'));
  assert.equal(priorPackets.length,40);assert.equal(new Set(priorPackets.map(b=>b.path)).size,40);
  for(const b of priorPackets){const p=readJson(b.path);for(const row of [...p.questionProposals||[],...p.explanationProposals||[],...p.instructionalProposals||[]])previous.set(row.recordId,{path:b.path,row});}
  for(const [id,p]of previous)if(records.has(id))assert.equal(p.row.publishedRecordSignature??p.row.sourceRevision,records.get(id).sourceSignature,'Prior disposition revision drift: '+id);
  const bank=readLearningPilotBank(),raw=readAuthoredInputs(),pre=readAuthoredBank(),proof=readJson('docs/evidence/phase-2b5/private-catalogue-read.json'),reconciliation=readJson('docs/evidence/phase-2b5/private-reconciliation.json');
  assert.equal(sig(bank),prior.bankSignature);
  const safe=proof.overrides.filter(r=>reconciliation.overrides.some(x=>x.id===r.question_id&&x.kind===r.question_kind&&x.capturedSignatureMatches&&x.payloadMatches)),published=publicationPipeline(bank).overrides(safe);
  const questions=new Map(),rows=[];
  for(const kind of ['mcq','pbq'])for(const q of bank[kind+'s']) {
    const id=kind+':'+q.id,r=records.get(id),pub=published[kind+'s'].find(p=>p.id===q.id),authored=[...raw.authored[kind],...raw.imported[kind]].find(a=>a.id===q.id)??null,preQuestion=pre[kind+'s'].find(a=>a.id===q.id),captures=safe.filter(s=>s.question_id===q.id&&s.question_kind===kind),snapshots=PUBLISHED_CONTENT_SNAPSHOT.filter(s=>s.question_id===q.id&&s.question_kind===kind);
    assert(r&&pub&&preQuestion);assert.equal(sig(q),r.localRevisionSignature);assert.equal(sig(pub),r.sourceSignature);
    const {_baseOrder,_adminOrder,...semantics}=pub;assert.equal(sig(semantics),sig(q));
    let compiled=null;try{compiled=compileRevision(pub,kind);}catch(error){assert.equal(r.trustedRevisionId,null);assert(r.revisionLimitation);}
    assert.equal(compiled?.revisionId??null,r.trustedRevisionId);assert.equal(compiled?.contentSha256??null,r.contentSha256);
    const feedback=records.get('explanation:'+id);assert.equal(sig(feedbackBundle(q)),feedback.sourceSignature);assert.equal(sig(feedbackBundle(pub)),feedback.sourceSignature);assert.equal(feedback.trustedRevisionId,null);
    const priorRow=previous.get(id),risk=triageFlags(q,authored,preQuestion,raw.imported[kind].some(a=>a.id===q.id),captures,r,priorRow);
    const sameStem=pkg.records.filter(a=>!a.id.startsWith('private:')&&a.id!==id&&a.duplicateStemSignature===r.duplicateStemSignature).map(a=>a.id);
    const sameReviewedFamily=priorRow?.row.familyLabelProposal? [...previous].filter(([other,p])=>other!==id&&['mcq','pbq'].includes(records.get(other)?.kind)&&p.row.familyLabelProposal===priorRow.row.familyLabelProposal).map(([other])=>other).sort():[];
    // shortcut: topic buckets are broad comparison candidates; replace only with separately reviewed family decisions.
    const sameTopic=bank[kind+'s'].filter(a=>a.id!==q.id&&a.topic&&a.topic===q.topic).map(a=>kind+':'+a.id).sort();
    const row={recordId:id,questionId:q.id,kind,objectiveCodesObserved:r.objectiveCodes,
      revisions:{localEffective:r.localRevisionSignature,publishedCatalogue:r.sourceSignature,trustedCompilerObserved:r.trustedRevisionId,trustedContentSha256Observed:r.contentSha256,authored:authored?sig(authored):null,preEditorialSnapshotMerged:sig(preQuestion),feedbackBundle:feedback.sourceSignature},
      delivery:{publicationStatusObserved:r.publicationStatus,status:'static_bank_available_conditional_pool_and_entitlement_not_browser_verified',privateVariantPrecedence:kind==='pbq'&&proof.pbqs.some(p=>p.id===q.id)?'newer_private_variant_separate_local_fallback':'none_observed'},
      priorSubstantiveDisposition:{status:priorRow?'agent_disposition_pending_owner':'not_found_in_bound_disposition_arrays',packetPath:priorRow?.path??null,feedbackDispositionStatus:previous.has('explanation:'+id)?'agent_disposition_pending_owner':'not_found_in_bound_disposition_arrays'},
      capturedOverrides:captures.map((s,i)=>({captureIdentityRevision:sig(s),capturedAt:s.updated_at,payloadFingerprint:s.payload_sha256,snapshotRevision:snapshots[i]?sig(snapshots[i]):null})),
      ...risk,duplicateFamilyCandidates:{exactStemIds:sameStem,priorProvisionalFamilyIds:sameReviewedFamily,topicBucketIds:sameTopic,status:'comparison_only_no_independence_or_semantic_equivalence_approval'},
      inventoryOnly:true,newSubstantiveDispositions:0,humanApproved:false,masteryWeight:0,eligibleEvidence:false};
    rows.push(row);questions.set(id,{q,pub,authored,preQuestion,record:r,feedback,snapshots,captures,row});
  }
  rows.sort((a,b)=>a.recordId.localeCompare(b.recordId,'en'));assert.equal(rows.length,483);assert.equal(new Set(rows.map(r=>r.recordId)).size,483);assert.equal(rows.filter(r=>r.kind==='mcq').length,395);assert.equal(rows.filter(r=>r.kind==='pbq').length,88);
  assert.deepEqual(rows.map(r=>r.recordId),pkg.records.filter(r=>['mcq','pbq'].includes(r.kind)&&!r.id.startsWith('private:')).map(r=>r.id));
  const separateAssessments=pkg.records.filter(r=>r.id.startsWith('private:pbq:')||['starter_question','guest_demo_mcq','guest_demo_pbq'].includes(r.kind)).map(r=>({recordId:r.id,kind:r.kind,objectiveCodesObserved:r.objectiveCodes,publishedCatalogueRevision:r.sourceSignature,localEffectiveRevision:r.id.startsWith('private:')?null:r.sourceSignature,trustedRevisionObserved:r.trustedRevisionId,deliveryStatus:r.publicationStatus,evidenceScope:r.evidenceScope,priorSubstantiveDisposition:previous.has(r.id)?'agent_disposition_pending_owner':'not_found_in_bound_disposition_arrays',inventoryOnly:true,newSubstantiveDispositions:0,privatePayloadReviewed:false,eligibleEvidence:false}));
  assert.equal(separateAssessments.length,13);assert.equal(separateAssessments.filter(r=>r.recordId.startsWith('private:')).length,2);assert.equal(separateAssessments.filter(r=>r.kind==='starter_question').length,9);assert.equal(separateAssessments.filter(r=>r.kind.startsWith('guest_demo_')).length,2);
  const manifest=readJson('docs/evidence/phase-2b5/release-checksums.json');assert.equal(Object.keys(manifest.files).length,25);for(const [path,sha]of Object.entries(manifest.files))assert.equal(hashFile(path),sha,'Active release changed: '+path);
  const ledger={schemaVersion:1,status:'LOCAL_TRIAGE_INVENTORY_ONLY_NOT_READY',baselineCommit:'52e784ac7d5ceef177cda089f2723b6834d56bbf',scope:'483 local bank assessments;13 separately identified alternative/start/demo assessments;feedback revisions bound but not added to question denominator',
    sourceBindings:[{path:packagePath,sha256:hashFile(packagePath)},{path:priorPath,sha256:hashFile(priorPath)},{path:'scripts/lib/content-mapping/review-triage.mjs',sha256:hashFile('scripts/lib/content-mapping/review-triage.mjs')}],priorBoundPackets:40,bankSignature:sig(bank),
    denominator:{effectiveMcqs:395,localPbqs:88,localBankAssessments:483,privatePbqVariants:2,starterAssessments:9,guestDemoAssessments:2,separateAssessmentRows:13,priorLocalBankQuestionDispositions:rows.filter(r=>r.priorSubstantiveDisposition.packetPath).length,priorLocalBankFeedbackDispositions:rows.filter(r=>r.priorSubstantiveDisposition.feedbackDispositionStatus==='agent_disposition_pending_owner').length},
    riskPolicy:'Deterministic structural cues and source changes prioritize reading;false cues do not prove correctness,scope,family novelty or feedback quality. Previously unreviewed semantic errors remain unresolved.',
    priorityWeights:{capturedOverride:100,snapshotOnlySource:25,possibleMultiSkillCue:40,importedSource:20,optionsChanged:15,stemChanged:10,effectiveEditorialChanged:5,feedbackChanged:5,unsupportedPbqGrading:50,missingOrFallbackWrongFeedback:30},
    rows,separateAssessments,newSubstantiveDispositions:0,humanApproved:false,activationAllowed:false,masteryWeight:0,eligibleEvidence:false,unchangedReleaseHashes:25};
  assertSafeReviewExport(ledger);return {ledger,questions,records,previous,bank,prior,pkg};
}
