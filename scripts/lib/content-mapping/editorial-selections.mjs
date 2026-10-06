import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

export const RECORD_PATH='docs/phase-2b5-editorial-review-record.md';
const RECORD_SHA='943b06eb101db5d1616cf0cd5289b798c0ce984700993b8561e8537cf2988ec0';
const BASELINE_SHA='2704b7fb7ccf4ecf2042edc4ac1f0015abd9ed4d12059dee5e664562be9c7ad5';
const sha=value=>createHash('sha256').update(value).digest('hex');
const requireThat=(ok,message)=>{if(!ok)throw new Error('Editorial selection: '+message);};
// These four revisions belong to the immutable package the human reviewed.
// A changed decision record or revision needs a deliberate new review binding.
const PAIRS=[
 {questionId:'p003',selectedRecordId:'pbq:p003',nonselectedRecordId:'private:pbq:p003',selectedSourceSignature:'sha256:bfa663d1470b46e02d7a8b5d27267636c0f71659ea09f4a88c2c5f8a078889ef',nonselectedSourceSignature:'sha256:f2eb1e715fa9fcda87ada668d7d17dfdf6b44840328d5ffeb460e3a342e502f2',objective:'4.9'},
 {questionId:'p017',selectedRecordId:'private:pbq:p017',nonselectedRecordId:'pbq:p017',selectedSourceSignature:'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42',nonselectedSourceSignature:'sha256:01e6ca9f28f585eeff75d84f3023a55abb04d60aea972ba2f754892defa6ceed',objective:'5.2'},
];
export function readEditorialSelections(records,text=readFileSync(RECORD_PATH,'utf8')) {
 requireThat(sha(text)===RECORD_SHA,'decision record changed; rebind the human review');
 requireThat(text.includes('Package SHA-256: `'+BASELINE_SHA+'`'),'stale baseline package');
 const decisions=PAIRS.map(pair=>{
  const section=text.split('### `'+pair.questionId+'`')[1]?.split('\n### ')[0];
  const source=pair.selectedRecordId.startsWith('private:')?'private Supabase revision':'local fallback';
  requireThat(section?.includes('- Selected revision: '+source+'.'),'contradictory source choice');
  requireThat(section.includes('same skill but are related, materially different assessments rather than duplicates.'),'comparison not recorded');
  return {...pair,id:'source-selection:'+pair.questionId,comparison:'same_skill_materially_different',independentFamilyApproved:false,semanticApproved:false,publicationChangeApproved:false};
 });
 const result={recordPath:RECORD_PATH,recordSha256:RECORD_SHA,baselineCommit:'967365f33737950c6057a1130a896f5b6a86e162',baselinePackageSha256:BASELINE_SHA,decisionCommit:'4f17b410a67308e2868c119b67e32a88d504cea8',scope:'Source choice and pair comparison only; not effective publication, semantic mapping or activation approval.',decisions};
 validateEditorialSelections(result,records);
 const local=records.find(r=>r.id==='pbq:p003');
 requireThat(text.includes('Selected trusted revision ID: `'+local.trustedRevisionId+'`')&&text.includes('Selected content SHA-256: `'+local.contentSha256+'`'),'selected local trusted revision drift');
 return result;
}
export function validateEditorialSelections(value,records) {
 requireThat(value.baselinePackageSha256===BASELINE_SHA&&value.recordSha256===RECORD_SHA,'stale baseline or decision hash');
 requireThat(value.recordPath===RECORD_PATH&&value.baselineCommit==='967365f33737950c6057a1130a896f5b6a86e162'&&value.decisionCommit==='4f17b410a67308e2868c119b67e32a88d504cea8','invalid decision provenance');
 requireThat(value.decisions?.length===PAIRS.length,'missing/duplicate decisions');
 const topKeys=['recordPath','recordSha256','baselineCommit','baselinePackageSha256','decisionCommit','scope','decisions'];
 requireThat(Object.keys(value).every(k=>topKeys.includes(k)),'unapproved export field');
 for(const pair of PAIRS){
  const d=value.decisions.find(x=>x.questionId===pair.questionId);
  requireThat(d&&value.decisions.filter(x=>x.questionId===pair.questionId).length===1,'missing/duplicate choice');
  const allowed=[...Object.keys(pair),'id','comparison','independentFamilyApproved','semanticApproved','publicationChangeApproved'];
  requireThat(Object.keys(d).every(k=>allowed.includes(k)),'unapproved semantic/export field');
  for(const [key,expected] of Object.entries(pair))requireThat(d[key]===expected,'contradictory choice or source signature');
  requireThat(d.id==='source-selection:'+pair.questionId&&d.comparison==='same_skill_materially_different','invalid decision identity/comparison');
  requireThat(d.independentFamilyApproved===false&&d.semanticApproved===false&&d.publicationChangeApproved===false,'unapproved semantic/publication decision');
  for(const [id,signature] of [[d.selectedRecordId,d.selectedSourceSignature],[d.nonselectedRecordId,d.nonselectedSourceSignature]]){
   const r=records.find(x=>x.id===id);
   requireThat(r&&r.questionId===pair.questionId&&r.sourceSignature===signature&&r.objectiveCodes.includes(pair.objective),'missing or stale selected/nonselected revision');
  }
 }
 return true;
}

export function readPrivateProcessing(evidence=JSON.parse(readFileSync('docs/evidence/phase-2b5/private-p017-processing.json'))) {
 const allowed=['questionId','projectId','method','observedAt','sourceSignature','appQuestionSignature','matchesSelectedCapturedRevision','appQuestionShape','choicesShape','compilerStatus','trustedRevisionId','contentSha256','blocker','readOnly','privatePayloadExported','learnerRecordsRead'];
 requireThat(Object.keys(evidence).every(k=>allowed.includes(k)),'private evidence export field');
 requireThat(evidence.questionId==='p017'&&evidence.readOnly===true&&evidence.privatePayloadExported===false&&evidence.learnerRecordsRead===false,'private evidence boundary');
 requireThat(/^sha256:[a-f0-9]{64}$/.test(evidence.sourceSignature)&&/^sha256:[a-f0-9]{64}$/.test(evidence.appQuestionSignature),'private evidence fingerprint');
 requireThat(evidence.compilerStatus==='not_compiled_secure_handoff_unavailable'&&evidence.trustedRevisionId===null&&evidence.contentSha256===null,'unverified private compilation');
 return {...evidence,matchesSelectedCapturedRevision:evidence.sourceSignature===PAIRS[1].selectedSourceSignature,selectionStatus:evidence.sourceSignature===PAIRS[1].selectedSourceSignature?'historical_choice_fingerprint_confirmed':'new_revision_pending_human_review'};
}
