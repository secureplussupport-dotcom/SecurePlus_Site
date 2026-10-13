import assert from 'node:assert/strict';
import {contentSignature as sig} from '../read-learning-pilot-bank.mjs';
import {canonicalPayload,validateStableSelections} from '../../../src/lib/learningPersistenceContracts.js';
import {sourceUnit} from './delivery-inventory.mjs';

// Local diagnostic grammar only: no trusted UUID, catalogue registration or runtime caller.
export const SELECT_FILL_V2='offline-select-fill-v2';
const unit=sourceUnit('src/App.jsx','const FILL_BLANK_SPELLING_VARIANTS =','function parseAcceptedAnswers(');
export const NORMALIZER_BINDING=unit.provenance;
const {normalizeFillBlankAnswer:normalize,isFillBlankAnswerCorrect:matches}=Function(unit.code+';return {normalizeFillBlankAnswer,isFillBlankAnswerCorrect};')();
const displayFields=['ch','cat','difficulty','title','emoji','scenario','question','objective','syllabusDomain','q','topic','logData','currentConfig','codeBlock','codeLanguage','diagram'];
const allowed=new Set(['id','type','blanks','selectionOptions','selectionFeedback','legacySelectionType','items','targets','correctMapping','exp','explanation','editorialReviewed','is_pro','_baseOrder','_adminOrder',...displayFields]);
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const fields=(x,keys)=>{assert(plain(x),'Plain object required');assert(Object.keys(x).every(k=>keys.includes(k)),'Unknown field');};
const text=x=>assert(typeof x==='string'&&x.trim()&&x.length<=20000,'Nonempty bounded text required');
const list=x=>assert(Array.isArray(x)&&x.length>0&&x.length<=100,'Bounded nonempty array required');
const ids=xs=>{assert(xs.every(x=>typeof x.id==='string'&&/^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$/.test(x.id)),'Invalid authored ID');assert.equal(new Set(xs.map(x=>x.id)).size,xs.length,'Duplicate authored ID');};
const stable=(questionId,kind,identity)=>kind+':'+sig([SELECT_FILL_V2,questionId,kind,identity]).slice(7,47);
const copy=x=>JSON.parse(JSON.stringify(x));

export function compileSelectFillV2(published,sourceRevision){
 fields(published,[...allowed]);assert.equal(sig(published),sourceRevision,'Actual published source binding required');
 assert(/^p\d{3,6}$/.test(published.id)&&published.type==='SELECT & FILL','Local selector PBQ required');
 list(published.blanks);list(published.selectionOptions);assert(published.selectionOptions.length>=2,'At least two selectable values required');
 ids(published.blanks);
 const labels=published.selectionOptions;labels.forEach(label=>{text(label);assert(normalize(label),'Empty normalized label');});
 assert.equal(new Set(labels.map(normalize)).size,labels.length,'Ambiguous normalized labels');
 const values=labels.map(label=>({id:stable(published.id,'value',label),kind:'value',label})).sort((a,b)=>a.id.localeCompare(b.id));
 const slots=published.blanks.map(blank=>{
  fields(blank,['id','sentence','answer','acceptedAnswers','aliases','hint','explanation','solution']);text(blank.sentence);text(blank.answer);
  for(const field of ['acceptedAnswers','aliases'])if(Object.hasOwn(blank,field)){assert(Array.isArray(blank[field])&&blank[field].length<=100,'Invalid aliases');blank[field].forEach(text);}
  for(const field of ['hint','explanation','solution'])if(Object.hasOwn(blank,field))assert(typeof blank[field]==='string','Invalid slot teaching');
  const accepted=[blank.answer,...blank.acceptedAnswers||[],...blank.aliases||[]];assert(accepted.every(v=>normalize(v)),'Empty normalized accepted value');
  const acceptedValueIds=values.filter(value=>matches(value.label,blank)).map(value=>value.id).sort();assert(acceptedValueIds.length,'Expected value must be selectable');
  return{id:stable(published.id,'slot',blank.id),kind:'slot',authoredId:blank.id,sentence:blank.sentence,acceptedValueIds};
 }).sort((a,b)=>a.id.localeCompare(b.id));
 const legacyKeys=['items','targets','correctMapping'],present=legacyKeys.filter(key=>Object.hasOwn(published,key));
 if(present.length){
  assert.equal(present.length,3,'Incomplete retained conversion');assert.equal(published.legacySelectionType,'DRAG & DROP','Unsupported mixed grammar');
  list(published.items);list(published.targets);ids(published.items);ids(published.targets);
  fields(published.correctMapping,published.items.map(item=>item.id));assert.equal(Object.keys(published.correctMapping).length,published.items.length,'Incomplete retained key');
  assert.equal(published.items.length,published.blanks.length,'Retained slot cardinality mismatch');
  published.targets.forEach(target=>{fields(target,['id','label','droppable']);text(target.label);assert(target.droppable===undefined||typeof target.droppable==='boolean','Invalid target role');});
  for(const item of published.items){
   fields(item,['id','label','explanation','solution']);text(item.label);
   for(const field of ['explanation','solution'])if(Object.hasOwn(item,field))assert(typeof item[field]==='string','Invalid retained teaching');
   const target=published.targets.find(t=>t.id===published.correctMapping[item.id]&&t.droppable!==false),blank=published.blanks.find(b=>b.id===item.id);
   assert(target&&blank,'Missing retained identity/target');
   assert.equal(blank.sentence,item.label.includes('___')?item.label:item.label+' → ___','Retained prompt mismatch');
   assert.equal(normalize(blank.answer),normalize(target.label),'Retained answer mismatch');
   if(item.explanation||item.solution)assert.equal(blank.explanation||blank.solution,item.explanation||item.solution,'Retained teaching mismatch');
  }
 }else assert(published.legacySelectionType===undefined||['FILL BLANK','SELECT & FILL'].includes(published.legacySelectionType),'Missing retained conversion');
 if(Object.hasOwn(published,'selectionFeedback')){
  assert(plain(published.selectionFeedback),'Invalid selector teaching');
  for(const[label,teaching]of Object.entries(published.selectionFeedback)){assert(labels.includes(label),'Unknown feedback value');assert(typeof teaching==='string','Invalid selector teaching');}
 }
 for(const field of ['exp','explanation'])if(Object.hasOwn(published,field))assert(typeof published[field]==='string','Invalid full teaching');
 for(const field of ['editorialReviewed','is_pro'])if(Object.hasOwn(published,field))assert(typeof published[field]==='boolean','Invalid publication flag');
 for(const field of ['_baseOrder','_adminOrder'])if(Object.hasOwn(published,field))assert(Number.isSafeInteger(published[field])&&published[field]>=0,'Invalid publication order');
 const display=Object.fromEntries(displayFields.filter(k=>Object.hasOwn(published,k)).map(k=>[k,published[k]]));
 assert(Object.values(display).every(x=>typeof x==='string'),'Invalid display field');
 const model={grammarVersion:SELECT_FILL_V2,normalizerRevision:unit.provenance.sourceSignature,sourceRevision,questionId:published.id,answerMode:'reusable_slot_values',display,slots,values};
 const diagnosticRevision=sig(model);
 return{diagnosticRevision,sourceRevision,questionId:published.id,questionType:'pbq',eligibleEvidence:false,trustedRevisionId:null,model,originalPublished:copy(published)};
}
function validated(revision,expectedSourceRevision){
 assert.equal(revision.sourceRevision,expectedSourceRevision,'Pinned source authority required');
 const compiled=compileSelectFillV2(revision.originalPublished,expectedSourceRevision);
 assert.equal(canonicalPayload(revision),canonicalPayload(compiled),'Diagnostic revision integrity mismatch');
 return compiled;
}
export function gradeSelectFillV2(revision,selections,expectedSourceRevision){
 const r=validated(revision,expectedSourceRevision),{slots,values}=r.model;
 const selected=validateStableSelections(selections,{questionType:'pbq',components:[...slots,...values]});
 assert.equal(selected.length,slots.length,'One selection per slot required');
 assert(selected.every(s=>slots.some(slot=>slot.id===s.componentId)&&values.some(value=>value.id===s.valueId)),'Slot/value roles required');
 const correct=selected.every(s=>slots.find(slot=>slot.id===s.componentId).acceptedValueIds.includes(s.valueId));
 return{correct,diagnosticScore:correct?1:0,evidencePrecision:'coarse',eligibleEvidence:false,trustedRevisionId:null};
}
export function learnerSelectFillV2(revision,expectedSourceRevision,valueOrder=null){
 const r=validated(revision,expectedSourceRevision),{slots,values}=r.model,order=valueOrder??values.map(v=>v.id);
 assert(Array.isArray(order)&&order.length===values.length&&new Set(order).size===values.length&&order.every(id=>values.some(v=>v.id===id)),'Invalid display permutation');
 return{diagnosticRevision:r.diagnosticRevision,questionId:r.questionId,answerMode:'reusable_slot_values',eligibleEvidence:false,...copy(r.model.display),slots:slots.map(({id,sentence})=>({id,sentence})),values:order.map(id=>({id,label:values.find(v=>v.id===id).label}))};
}
