import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {canonicalPayload,validateStableSelections} from '../../../src/lib/learningPersistenceContracts.js';
import {contentSignature as sig} from '../read-learning-pilot-bank.mjs';
import {hashFile,readJson,feedbackBundle} from './review-triage.mjs';
import {sourceUnit} from './delivery-inventory.mjs';
import {compileRevision,gradeRevision} from '../../../server/adaptive/revision.mjs';

export const PBQ_FEEDBACK_EXCEPTION_VERSION='local-pbq-feedback-exceptions-v1';
export const PBQ_FEEDBACK_EXCEPTIONS_ENABLED_BY_DEFAULT=false;
const pins={
  "p009": {
    "parent": "sha256:e6eb2a20642c61aff248a8f6241d9176826f32aa62ef7cd1a67d2a9f07329425",
    "feedback": "sha256:b8b31199600a1c8d8b26bb41feebca2d0e01ba6028bf6262a2a7bd6c366c0a47",
    "local": "sha256:2baf1a3715f1f79dc84cada0073394db19a85badd6d2cd79db2e9cd3b2b5bd25",
    "authored": "sha256:6a9d5a935e1b3adc19301e80d5285155edc379b0589fdf79ede64f104f0cad7f",
    "preEditorial": "sha256:6a9d5a935e1b3adc19301e80d5285155edc379b0589fdf79ede64f104f0cad7f",
    "snapshots": 0,
    "captures": 0
  },
  "p022": {
    "parent": "sha256:9c565befe591d2a27b7df83a77b49ae5398086e7cef654afc2a1efab43050442",
    "feedback": "sha256:a627dc4ed31d613ebf1870ee5af58d5200473c8186d33f99b01fc6d73ad7ac15",
    "local": "sha256:326e74855bc0c77ae2ae2dadae25a8d1a640585916f35b1e4d457a3faea79e6d",
    "authored": "sha256:4fe497916a8cc087453f77b1cc63c190a79e1dc1a532320291f7029a25ad319b",
    "preEditorial": "sha256:4fe497916a8cc087453f77b1cc63c190a79e1dc1a532320291f7029a25ad319b",
    "snapshots": 0,
    "captures": 0
  }
};
const dependencies={
  "scripts/audit-supported-six-pbq-gaps.mjs": "b645fce618a3133965bf28b17a7d39b3a27f5bd2ba442b59e53460702c89f536",
  "docs/drafts/phase-2b5-hotspot-pbq-remediation-proposals.json": "3fcf3a327e936706e0161e8d296dd137434f94cbe32dd85ebeba8b9319a207c7",
  "server/adaptive/revision.mjs": "a2fc241dd45a60fe4e9898f8133187402ef07d9e0a5e2f721f4ad6ba33b73451",
  "src/lib/learningPersistenceContracts.js": "8832cf2cda566cea5a95a9a284215ca710ba12f9198447042261c66622c7a8c2",
  "scripts/lib/content-mapping/review-triage.mjs": "319a822746d02c2da113b62b63ebbe0dffc2fb0da529f6551242fa9704dec088",
  "scripts/lib/content-mapping/local-pbq-feedback-proof.mjs": "999809de3ecf705d0eaf9369eb944c3f950ea1d2cb9378154e89025f0f4bce2c"
};
for(const [path,expected]of Object.entries(dependencies))assert.equal(hashFile(path),expected,'Exception dependency drift');
dependencies.compiler=hashFile(fileURLToPath(import.meta.url));
const recipeUnit=sourceUnit('scripts/audit-supported-six-pbq-gaps.mjs','function casePlanCandidate(','const orderCandidate=');
const casePlanCandidate=Function('assert',recipeUnit.code+';return casePlanCandidate;')(assert);
const feedbackUnit=sourceUnit('src/App.jsx','function ensureFeedbackLead(','function inferPbqObjective(');
const {pbqFeedbackBody,ensureFeedbackLead}=Function(feedbackUnit.code+';return {pbqFeedbackBody,ensureFeedbackLead};')();
dependencies.feedbackBody=feedbackUnit.provenance.sourceSignature;
assert.equal(dependencies.feedbackBody,'sha256:fb9318cba431a4dfae01ccf09b056a77f1af41d1960d0201795c7b05779ddd8f');
const hotspotPacket=readJson('docs/drafts/phase-2b5-hotspot-pbq-remediation-proposals.json'),draft=hotspotPacket.editorialDrafts.find(r=>r.recordId==='pbq:p022');
assert.equal(sig(draft),'sha256:edb8cf1e388b57e8482b08dcffa641479b84995d1264dd9f3c62520bd1efec79');
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
// Bound JSON data before hashing: reject accessors, non-JSON values, cycles/depth and oversized trees.
function jsonCopy(value){
  let nodes=0;
  function visit(v,depth){
    assert(depth<=24&&++nodes<=12000,'Bounded JSON tree required');
    if(v!==null&&typeof v==='object'){
      assert(plain(v)||Array.isArray(v)&&Object.getPrototypeOf(v)===Array.prototype,'Plain JSON data required');
      if(Array.isArray(v))assert(v.length<=1000&&Object.keys(v).length===v.length&&Array.from({length:v.length},(_,i)=>Object.hasOwn(v,i)).every(Boolean),'Dense JSON array required');
      const descriptors=Object.getOwnPropertyDescriptors(v);
      for(const key of Reflect.ownKeys(descriptors)){
        if(Array.isArray(v)&&key==='length')continue;
        const d=descriptors[key];assert(typeof key==='string'&&d.enumerable&&Object.hasOwn(d,'value'),'JSON data properties required');visit(d.value,depth+1);
      }
    }else assert(v===null||typeof v==='boolean'||typeof v==='string'&&v.length<=20000||typeof v==='number'&&Number.isFinite(v),'JSON scalar required');
  }
  visit(value,0);const text=canonicalPayload(value);assert(text.length<=200000,'Bounded JSON payload required');return JSON.parse(text);
}
function optIn(options,allowed=['enabled']){
  const o=jsonCopy(options);assert(plain(o)&&Object.keys(o).every(k=>allowed.includes(k)),'Unknown proof option');
  assert(o.enabled===undefined||typeof o.enabled==='boolean','Explicit boolean opt-in required');return o.enabled===true?o:null;
}

function bound(id,published,options){
  const o=optIn(options,['enabled','mode','variant']);if(!o)return null;
  assert(['current_source','offline_candidate'].includes(o.variant),'Explicit source/candidate variant required');
  assert(['practice_before_answer','exam_before_answer','practice_after_answer','exam_completed_review'].includes(o.mode),'Explicit feedback lifecycle mode required');
  const q=jsonCopy(published);assert(plain(q)&&q.id===id,'Exact exception parent required');assert.equal(sig(q),pins[id].parent,'Pinned original parent required');assert.equal(sig(feedbackBundle(q)),pins[id].feedback,'Pinned original feedback required');return{q,o};
}
function selectedBefore(selections,revision,mode){
  const input=jsonCopy(selections);assert(Array.isArray(input),'Selection array required');
  const selected=input.length?validateStableSelections(input,revision):[];
  return{selected,before:mode.endsWith('before_answer')};
}
function header(id,candidate,o,correct){
  return{version:PBQ_FEEDBACK_EXCEPTION_VERSION,questionId:id,mode:o.mode,variant:o.variant,parentRevision:pins[id].parent,feedbackRevision:pins[id].feedback,projectedParentRevision:sig(candidate),projectedFeedbackRevision:sig(feedbackBundle(candidate)),proofRevision:sig({version:PBQ_FEEDBACK_EXCEPTION_VERSION,dependencies,original:pins[id],projected:sig(candidate)}),context:Object.fromEntries(['title','scenario','question','diagram'].filter(k=>candidate[k]).map(k=>[k,candidate[k]])),main:candidate.explanation,correct,score:correct?1:0,evidencePrecision:'coarse',eligibleEvidence:false,currentSourceFeedbackQualified:false,currentHoldResolved:false,newCredit:0};
}
/** p009 only: source/candidate instructions remain distinct; six keyed positions are whole/coarse. */
export function orderingFeedbackException(published,selections,options={}){
  const b=bound('p009',published,options);if(!b)return null;const {q,o}=b;
  const candidate=o.variant==='offline_candidate'?casePlanCandidate({q,pub:q}):q;
  if(o.variant==='offline_candidate')assert.equal(sig(candidate),'sha256:812e3d558ac3ceed53503b5190fc09d41cbf5b6d6c7340f7fadc72e3cd785d61');
  const revision=compileRevision(candidate,'pbq'),{selected,before}=selectedBefore(selections,revision,o.mode);if(before)return null;
  const result=gradeRevision(revision,selected),positions=revision.components.filter(c=>c.kind==='position').sort((a,b)=>a.position-b.position);
  const correctOrder=positions.map((position,i)=>{const item=q.items.find(item=>item.id===q.correctOrder[i]),value=revision.components.find(c=>c.kind==='item'&&c.authoredId===item.id);return{position:i+1,positionId:position.id,itemId:value.id,label:item.label,solution:item.explanation};});
  const parts=correctOrder.map(p=>{const value=revision.components.find(c=>c.id===selected.find(s=>s.componentId===p.positionId).valueId);return{position:p.position,positionId:p.positionId,selectedItemId:value.id,selectedLabel:value.label,correctItemId:p.itemId,correctLabel:p.label,solution:p.solution,correct:value.id===p.itemId};});
  assert.equal(parts.every(p=>p.correct),result.correct);
  return{...header('p009',candidate,o,result.correct),instructionStatus:o.variant==='offline_candidate'?'fictional_prerequisites_draft_not_approved':'grouped_instruction_ambiguous_hold',parts,correctOrder};
}
/** p022 only: the corrected diagram/three wrong-option bodies remain the exact prior offline draft. */
export function hotspotFeedbackException(published,selections,options={}){
  const b=bound('p022',published,options);if(!b)return null;const {q,o}=b,candidate=jsonCopy(q);
  assert.equal(q.type,'HOTSPOT');assert.deepEqual(q.choices,q.options);assert.equal(q.hotspots.length,q.choices.length);assert.equal(new Set(q.hotspots.map(h=>h.id)).size,q.hotspots.length);assert(q.hotspots.every(h=>typeof h.correct==='boolean'));assert.deepEqual(q.hotspots.flatMap((h,i)=>h.correct?[i]:[]),[q.correct]);
  if(o.variant==='offline_candidate'){
    for(const op of draft.operations){let target=candidate;const keys=op.fieldPath.split('.');for(const key of keys.slice(0,-1))target=target[key];const key=keys.at(-1);assert.equal(sig(target[key]),op.beforeRevision,'Draft field authority mismatch');if(op.operation==='remove')delete target[key];else{assert.equal(op.operation,'replace');target[key]=op.replacementText;}}
    candidate.optionFeedback=Object.fromEntries(candidate.choices.map((_,i)=>[i,ensureFeedbackLead(i===candidate.correct?candidate.explanation:candidate.wrongFeedback[i],i===candidate.correct)]));
    assert.equal(sig(candidate),'sha256:4a67cab0757185992e8706723eecf315dfa3d88909cb62cd2044bd90cf73a931');assert.equal(sig(feedbackBundle(candidate)),'sha256:39478e693e46644311e29be528ef4d8df4dd3105702683d6e8f86330ba4dcae8');
  }
  // Omission is a local grading diagnostic only; original hotspots and source remain held.
  const gradingSource=jsonCopy(candidate);delete gradingSource.hotspots;const revision=compileRevision(gradingSource,'pbq'),{selected,before}=selectedBefore(selections,revision,o.mode);if(before)return null;
  const result=gradeRevision(revision,selected),values=candidate.choices.map((label,i)=>{const value=revision.components.find(c=>c.kind==='option'&&c.label===label);return{id:value.id,label,correct:i===q.correct,selected:selected[0].valueId===value.id,solution:pbqFeedbackBody(candidate.optionFeedback[i])};});
  return{...header('p022',candidate,o,result.correct),feedbackStatus:o.variant==='offline_candidate'?'corrected_labels_and_application_code_draft_not_approved':'IAM_correction_and_diagram_choice_mismatch_hold',labelAssociationsMatchChoices:o.variant==='offline_candidate',options:values};
}
