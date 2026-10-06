import {readFileSync} from 'node:fs';
import {sourceUnit} from './delivery-inventory.mjs';
import {contentSignature} from '../read-learning-pilot-bank.mjs';

const APP='src/App.jsx';
const byId=(a,b)=>a.id<b.id?-1:a.id>b.id?1:0;
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');

// Restrict sub-unit searches to the intended JSX branch. Source text stays in
// memory; exports contain only hashes, positions and editorial metadata.
function within(parent,start,end) {
 const a=parent.code.indexOf(start),b=parent.code.indexOf(end,a+start.length);
 if(a<0||b<0||parent.code.indexOf(start,a+start.length)!==-1)throw new Error('Missing or ambiguous guest-demo sub-surface');
 const code=parent.code.slice(a,b);
 return {code,provenance:{path:APP,anchor:start,endAnchor:end,startLine:parent.provenance.startLine+parent.code.slice(0,a).split('\n').length-1,endLine:parent.provenance.startLine+parent.code.slice(0,b).split('\n').length-1,sourceSignature:contentSignature(code)}};
}
function reachability() {
 const app=readFileSync(APP,'utf8');
 return ['<GuestDashboardGate ','{showcaseFeatures.map(','<GuestFeatureShowcaseCard ','<GuestFeaturePreview type={feature.id}'].map(marker=>{
  const locations=[...app.matchAll(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))];
  if(!locations.length)throw new Error('Guest demo reachability boundary missing');
  return {path:APP,marker,lines:locations.map(m=>app.slice(0,m.index).split('\n').length)};
 });
}
export function readGuestPreview() {
 const unit=(start,end)=>sourceUnit(APP,start,end);
 const branches={
  flashcards:unit('  if(type==="flashcards"){','  if(type==="mcq"){'),
  mcq:unit('  if(type==="mcq"){','  if(type==="explanations"){'),
  explanations:unit('  if(type==="explanations"){','  if(type==="pbq"){'),
  pbq:unit('  if(type==="pbq"){','  if(type==="exam"){'),
  exam:unit('  if(type==="exam"){','  if(type==="review"){'),
  review:unit('  if(type==="review"){','  const lessons=['),
  deep:unit('  const lessons=[','function GuestFeatureShowcaseCard('),
 };
 const chain=reachability();
 const records=[];
 const add=(suffix,kind,units,extra={},value=null)=>{
  const sourceUnits=units.map(u=>u.provenance);
  const sourceSignature=value===null?contentSignature({id:suffix,sourceUnits}):contentSignature({id:suffix,value});
  records.push({id:'guest-demo:'+suffix,kind,source:APP+':GuestFeaturePreview',sourceSignature,sourceUnits,scope:'marketing_teaching_demo',publicationStatus:'active_guest_demo',evidenceScope:'local_source_reachable_default_guest_gate',semanticMappingStatus:'unresolved_marketing_teaching_demo',trustedRevisionId:null,precision:'support_only',weight:0,primaryConceptId:null,secondaryConceptIds:[],candidateConceptIds:[],reachability:chain,linkedSelectorIds:['intervention:guest-feature-teaching'],rationale:'Separately authored reachable marketing teaching/assessment demo. Exact source is bound; content and grading values are withheld. Semantic/objective mapping and adaptive inclusion require editorial review.',...extra});
 };
 const definition=within(branches.flashcards,'                <div className="guest-flip-definition">','              </div>\n            </div>');
 add('flashcard:mfa','guest_demo_flashcard',[branches.flashcards,definition],{contentType:'flashcard'});
 add('mcq:access-control','guest_demo_mcq',[branches.mcq],{contentType:'mcq',precision:'direct'});
 const mcqFeedback=within(branches.mcq,'        <div className={`guest-demo-feedback','      </div>\n    );');
 add('mcq:feedback','guest_demo_feedback',[mcqFeedback],{parentId:'guest-demo:mcq:access-control',contentType:'feedback_bundle'});
 const solution=within(branches.explanations,'        <button\n          className={`guest-explanation-card correct','        <button\n          className={`guest-explanation-card wrong');
 const distractor=within(branches.explanations,'        <button\n          className={`guest-explanation-card wrong','      </div>\n    );');
 add('mcq:solution-explanation','guest_demo_explanation',[solution],{parentId:'guest-demo:mcq:access-control',contentType:'explanation',instructionalRole:'solution'});
 add('mcq:distractor-explanation','guest_demo_explanation',[distractor],{parentId:'guest-demo:mcq:access-control',contentType:'explanation',instructionalRole:'distractor'});
 add('pbq:incident-response-ordering','guest_demo_pbq',[branches.pbq],{contentType:'ordering_pbq',precision:'coarse'});
 const pbqFeedback=within(branches.pbq,'        <div className={`guest-demo-feedback','        {pbqSlots.some(Boolean)');
 add('pbq:feedback','guest_demo_feedback',[pbqFeedback],{parentId:'guest-demo:pbq:incident-response-ordering',contentType:'feedback_bundle'});
 const hint=within(branches.pbq,'            const isHint=','            return (');
 const hintDisplay=within(branches.pbq,'                className={isHint?', '                type="button"');
 add('pbq:hint','guest_demo_hint',[hint,hintDisplay],{parentId:'guest-demo:pbq:incident-response-ordering',contentType:'guided_hint',rationale:'Visible next-step hint depends on the internal sequence comparison. Review assistance and novelty before attributing any performance; no sequence/key values are exported.'});
 const reviewData=within(branches.review,'    const reviewPaths={','    const activePath=');
 const paths=Function(`"use strict";${reviewData.code};return reviewPaths;`)();
 for(const [topic,value] of Object.entries(paths))add('review-path:'+slug(topic),'guest_demo_review_path',[reviewData],{topic,contentType:'fixed_review_path',syntheticSignals:true,linkedSelectorIds:['intervention:guest-feature-teaching','intervention:guest-feature-review-topic'],rationale:'Hardcoded illustrative path and synthetic progress/miss signals. It is not generated from learner history or the adaptive runtime; semantic/objective scope remains unresolved.'},value);
 const lessonData=within(branches.deep,'  const lessons=[','  const activeLesson=');
 const lessons=Function(`"use strict";${lessonData.code};return lessons;`)();
 for(const lesson of lessons)add('lesson-prompt:'+slug(lesson.title),'guest_demo_lesson_prompt',[lessonData],{topic:lesson.title,contentType:'teaching_prompt',linkedSelectorIds:['intervention:guest-feature-teaching','intervention:guest-feature-lesson-topic']},lesson);
 const exclusions=[{id:'guest-demo:exam-timer',kind:'guest_demo_exclusion',status:'marketing_noninstructional_illustration',source:APP+':GuestFeaturePreview',sourceSignature:branches.exam.provenance.sourceSignature,sourceUnits:[branches.exam.provenance],reachability:chain,reason:'Clock/pause/progress illustration with a synthetic question number; no independently authored question, subject teaching or assessment. Excluded from adaptive learning-content mapping.'}];
 return {records:records.sort(byId),exclusions};
}

export function verifyGuestPreview(pkg) {
 const expected=readGuestPreview();
 const actual=pkg.records.filter(r=>r.scope==='marketing_teaching_demo');
 if(actual.length!==expected.records.length)throw new Error('Incomplete GuestFeaturePreview teaching census');
 const byId=new Map(pkg.records.map(r=>[r.id,r]));
 for(const item of expected.records){
  const r=byId.get(item.id);
  if(!r||r.sourceSignature!==item.sourceSignature||contentSignature(r.sourceUnits)!==contentSignature(item.sourceUnits))throw new Error('GuestFeaturePreview revision/source-unit mismatch: '+item.id);
  for(const key of ['kind','contentType','parentId','instructionalRole','topic','syntheticSignals'])if(r[key]!==item[key])throw new Error('GuestFeaturePreview metadata mismatch: '+item.id);
  if(contentSignature(r.reachability)!==contentSignature(item.reachability))throw new Error('GuestFeaturePreview reachability mismatch');
  if(r.parentId&&!byId.has(r.parentId))throw new Error('GuestFeaturePreview parent reference missing');
  for(const id of item.linkedSelectorIds)if(!byId.has(id)||!r.linkedSelectorIds.includes(id))throw new Error('GuestFeaturePreview selector binding missing');
  if(r.weight!==0||r.trustedRevisionId!==null||r.primaryConceptId!==null||r.secondaryConceptIds.length||r.candidateConceptIds.length||r.semanticMappingStatus!=='unresolved_marketing_teaching_demo')throw new Error('GuestFeaturePreview adaptive inclusion is unapproved');
 }
 for(const expectedRow of expected.exclusions){const r=pkg.exclusions.find(x=>x.id===expectedRow.id);if(!r||contentSignature(r)!==contentSignature(expectedRow))throw new Error('GuestFeaturePreview exclusion revision mismatch');}
 const sourceUnits=pkg.records.filter(r=>r.kind==='intervention_selector').flatMap(r=>r.selector.sourceUnits);
 if(!sourceUnits.some(u=>u.anchor==='function GuestFeaturePreview('))throw new Error('GuestFeaturePreview selector source-unit coverage missing');
 return true;
}
