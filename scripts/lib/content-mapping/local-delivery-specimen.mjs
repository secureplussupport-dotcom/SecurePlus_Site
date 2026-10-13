import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {contentSignature as sig} from '../read-learning-pilot-bank.mjs';
import {sourceUnit} from './delivery-inventory.mjs';
// Offline reviewer specimen only; callers must opt in, and no runtime imports are permitted.
const pins={
  "p003": {
    "local": "sha256:1fb2ff8469aad61d039f4fda6b7dce1921010dc3fc223096df8f74ffebd388ad",
    "published": "sha256:bfa663d1470b46e02d7a8b5d27267636c0f71659ea09f4a88c2c5f8a078889ef",
    "feedback": "sha256:1e99f493a798ba63f278eb134d88f37394ba0dcf3e3387c1e32061bc10cc0ec9"
  },
  "p032": {
    "local": "sha256:360f038e763e063f6696b7b5de2d7ba184396e5a36d3da468d44e964b064e2b9",
    "published": "sha256:bc6ef0f7f70ec9d153ff2231396e8239ab04da403a913f80160644d96f5a9389",
    "feedback": "sha256:d79d9e6a82b64592722ddf3b4a99b379a91401eaead2fc19162e5056de561af6"
  },
  "p074": {
    "local": "sha256:2d2eff06504f7ddd55298e030f9719f7098a38e401130fad04bdcce1e4d1d802",
    "published": "sha256:7ee473a2c651f593d2798fc93e0c6e590bde88bfca3594c89d30a3b191c2c842",
    "feedback": "sha256:b2eb0c617655af4592103cea339546f50cd8dc8d74c2dc0cd360c953d83ff2b9"
  },
  "p004": {
    "local": "sha256:024b18d1e37f4fa4d26b25d7cafe1bdda2d5c638b69b97e08a5bb54e1cd95921",
    "published": "sha256:109b8a1a5c3d15e77e2e99699d340f9dfb40c605754e2d23fc98a860a7436948",
    "feedback": "sha256:eaa0fd524513f431b6d84701714b27fef42827a3eae442890a56f89bfdb190a9"
  },
  "p011": {
    "local": "sha256:2d6de2893bfae0e4c259054634f73e305d432a46db6fca15b4d7d16ef292da5e",
    "published": "sha256:7d2d3463800b21c65930a70d0884dc2f155b20a6a22e79b110a2a36932a4f514",
    "feedback": "sha256:af50d88dd14a25607952e3f6d402393d0faee6680d375e8342178c243f12c772"
  },
  "p029": {
    "local": "sha256:9a3f36434c3e9aea527dec69350e17b1c5d3c861f09529f0b92d4c9d15023466",
    "published": "sha256:4302b539f791a242cf09fbdddb0fa052d1a37f9a60a1e5f54874dc753047c3d0",
    "feedback": "sha256:28867f8831569a36709e908912e5656e9126e2c50174ca9f73ae23df5e0b14c9"
  },
  "p041": {
    "local": "sha256:90c11d373871ab5573323c8c3205ef5a0207b074f4bfc04cb4ef885d57ce4703",
    "published": "sha256:41e116ba6f285dde1547a6683d231a4698517b72d576a4bf6d8a4b2e335e7547",
    "feedback": "sha256:d9bd692824b7457d0a7139e86a72ce3215e099d1b0c23fcacd15dde56ff28b4e"
  },
  "p043": {
    "local": "sha256:8ad231beed8f8c572bfb74c6e0edd653915b5b51295ab1e81e0eb6265fe8c077",
    "published": "sha256:a456da2d113fe701f3c318f9fcf954f22949b1a44f75d28dda63baf73b7303ba",
    "feedback": "sha256:86df2d021fbbb2b40d3158e353d143991d347eff1d2e15d80b803b524b271a48"
  },
  "p046": {
    "local": "sha256:d2629e7c14a26019362f3f2b6e93a6a29ae46300257897df44a7bc9d0531b5c0",
    "published": "sha256:f32e8f3daa1aa7f2d896946685a15146ecbcea91bbfb513de2b2a3babca51fdf",
    "feedback": "sha256:b446d0fe4dd2d34185ed9accf8fd3e0e6ff814ff6e0f3e540e20d5e9b9951605"
  },
  "p211": {
    "local": "sha256:bf0a42cc62da920122329a6253d9aaff8fd5f9a35038153d581650e132be81c3",
    "published": "sha256:62894e03c5f39c75b69713ef7c7ad5205ce73da9f42097744f159636f8758f91",
    "feedback": "sha256:9831b5fb55788f52cea2c225bbaa2f2a28c2ff60c9d7450b35dd28addecedd2a"
  }
};
const slices={
 p003:[{title:'Process records',lines:[0,1,2,3]},{title:'Connection records',lines:[5,6,7]}],
 p032:[{title:'Text response observation',lines:[0,1]},{title:'Markup response observation',lines:[3,4]},{title:'Script response and persistence observations',lines:[6,7,8]}],
 p074:[{title:'Reviewed access configuration',lines:[2,3,4,5,6,7,8,9]}],
};
const normalizeUnit=sourceUnit('src/App.jsx','const FILL_BLANK_SPELLING_VARIANTS =','function parseAcceptedAnswers(');
const matches=Function(normalizeUnit.code+';return isFillBlankAnswerCorrect;')();
export const NORMALIZER_SOURCE=normalizeUnit.provenance;
export const SPECIMEN_ENABLED_BY_DEFAULT=false;
const reviewModes=['practice_after_answer','exam_completed_expanded'];
const views=new WeakMap();
function retain(view){views.set(view,sig(view));return view;}
function source(q){assert(q&&Object.hasOwn(pins,q.id),'Explicit LOCAL source required');assert.equal(sig(q),pins[q.id].local,'LOCAL source drift or private substitution');return pins[q.id];}
function enabled(value){assert(typeof value==='boolean','Explicit boolean opt-in required');return value;}
export function evidenceSpecimen(q,mode,{enabled:optIn=false}={}){
 if(!enabled(optIn))return null;const pin=source(q);assert(['practice_before_answer','exam_before_answer','exam_completed_expanded'].includes(mode),'Evidence mode required');assert(mode!=='exam_completed_expanded'||q.id==='p211','Selected questions have pre-answer scope only');assert(slices[q.id]||q.id==='p211','Evidence candidate not selected');
 const panels=q.id==='p211'?[{title:'Reviewed service requirements',sourceField:'diagram',sourceLineIndices:[0,1,2,3],content:q.diagram}]:slices[q.id].map(s=>({title:s.title,sourceField:'answer',sourceLineIndices:s.lines,content:s.lines.map(index=>{const line=q.answer.split('\n')[index];assert(typeof line==='string'&&line.trim(),'Missing selected evidence line');return line;}).join('\n')}));
 assert(panels.every(p=>p.content?.trim()));
 return retain({recordId:'pbq:'+q.id,mode,sourceRevision:pin.local,reviewerProposed:true,ownerApproved:false,published:false,activationAllowed:false,newCredit:0,panels});
}
export function feedbackSpecimen(q,responses,mode,{enabled:optIn=false}={}){
 if(!enabled(optIn))return null;const pin=source(q);assert(reviewModes.includes(mode),'Post-answer expanded review required');assert(q.type==='SELECT & FILL'||q.id==='p211','Feedback candidate not selected');assert(responses&&typeof responses==='object'&&!Array.isArray(responses),'Response map required');
 const common={recordId:'explanation:pbq:'+q.id,mode,sourceRevision:pin.feedback,parentLocalRevision:pin.local,reviewerProposed:true,ownerApproved:false,activationAllowed:false,newCredit:0,newTrustedCredit:0,masteryWeight:0};
 if(q.id==='p211'){
  assert(Object.keys(responses).every(k=>k==='selected'),'Unknown response field');const selected=responses.selected;assert(selected===null||selected===undefined||Number.isInteger(selected)&&selected>=0&&selected<q.choices.length,'Invalid choice response');
  return retain({...common,precision:'coarse',wholeCorrect:selected===q.correct,requirements:evidenceSpecimen(q,'exam_completed_expanded',{enabled:true}).panels,options:q.choices.map((label,i)=>({label,selected:i===selected,correct:i===q.correct,rationale:q.optionFeedback[i].replace(/^(?:Correct|Incorrect)\.\s*/, '')}))});
 }
 assert(Object.keys(responses).every(id=>q.blanks.some(b=>b.id===id)),'Unknown blank identity');assert(Object.values(responses).every(v=>typeof v==='string'),'Text responses required');
 const parts=q.blanks.map(blank=>{const value=responses[blank.id]??'',offered=q.selectionOptions.includes(value),alias=(blank.acceptedAnswers||[]).includes(value)||(blank.aliases||[]).includes(value),recognised=[...q.selectionOptions,...blank.acceptedAnswers||[],...blank.aliases||[]].some(label=>matches(value,{answer:label})),correct=matches(value,blank);return{id:blank.id,prompt:blank.sentence,response:value===''?'Not answered':recognised?value:'Invalid selection',offeredInCurrentWorkspace:offered,acceptedAliasSyntheticOnly:alias&&!offered,correct,...(!correct?{correction:blank.answer}:{}),rationale:blank.explanation||blank.solution};});
 const definitions=q.selectionOptions.map(value=>({value,rationale:q.selectionFeedback[value],source:'selection_definition',offeredInCurrentWorkspace:true}));
 for(const blank of q.blanks)for(const value of [...blank.acceptedAnswers||[],...blank.aliases||[]])if(!q.selectionOptions.includes(value))definitions.push({value,rationale:blank.explanation||blank.solution,source:'accepted_alias_part_teaching',offeredInCurrentWorkspace:false});
 assert(parts.every(p=>p.rationale?.trim())&&definitions.every(d=>d.rationale?.trim()),'Complete source teaching required');
 const correctParts=parts.filter(p=>p.correct).length;
 return retain({...common,trustedRevisionId:null,precision:'legacy_partial_ratio_not_trusted_mastery',wholeCorrect:correctParts===parts.length,correctParts,partCount:parts.length,legacyRatio:correctParts/parts.length,main:q.explanation,parts,definitions});
}
const text=(tag,value,props={})=>React.createElement(tag,props,value);
export function renderSpecimen(view){
 assert(views.has(view)&&views.get(view)===sig(view),'Only unchanged source-bound specimen projections render');
 assert(view?.reviewerProposed===true&&view.ownerApproved===false&&view.activationAllowed===false&&view.newCredit===0,'Local reviewer projection required');
 const evidence=panels=>panels.map((p,i)=>React.createElement('section',{key:i,className:'pbq-evidence-card'},text('h3',p.title),text('pre',p.content,{className:'log-block pbq-evidence-preview'})));
 const children=view.panels?evidence(view.panels):view.parts?[text('p',view.main),...view.parts.map(p=>React.createElement('section',{key:p.id},text('p',p.prompt),text('strong',p.correct?'Correct':'Incorrect'),text('p',p.response),p.correction?text('p',p.correction):null,text('p',p.rationale))),...view.definitions.map((d,i)=>React.createElement('section',{key:'definition'+i},text('strong',d.value),text('p',d.rationale)))]:[...evidence(view.requirements),...view.options.map((o,i)=>React.createElement('section',{key:'option'+i},text('strong',o.correct?'Correct':'Incorrect'),text('p',o.label),text('p',o.rationale)))];
 return renderToStaticMarkup(React.createElement('article',{'data-local-specimen':true,'data-record-id':view.recordId},children.map((child,index)=>React.cloneElement(child,{key:child.key??'node-'+index}))));
}
