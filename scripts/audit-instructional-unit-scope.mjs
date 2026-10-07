import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {SY0701_ACRONYM_CARDS,SY0701_ACRONYM_SETS} from '../src/data/sy0701AcronymFlashcards.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';
import {readGlossary} from './lib/content-mapping/delivery-inventory.mjs';
const path='docs/drafts/phase-2b5-instructional-unit-scope-proposals.json',p=JSON.parse(readFileSync(path));
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const pins={
 'docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json':'de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c',
 'docs/evidence/phase-2b5/mapping-package.json':'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97',
 'docs/phase-2b5-pilot-owner-decision-packet.md':'01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953',
 'docs/evidence/phase-2b5/delivery-surface-review.json':'c57fea32997f551560a2846433b108131a3844e3c713f620f4b7ed51ae14207a'
};
assert.deepEqual(p.sourceBindings,pins);for(const [f,h] of Object.entries(pins))assert.equal(hash(f),h,f+' changed');
const base=JSON.parse(readFileSync(Object.keys(pins)[0])),pkg=JSON.parse(readFileSync(Object.keys(pins)[1]));
const guard=JSON.parse(readFileSync('docs/evidence/phase-2b5/delivery-surface-review.json'));
assert.deepEqual(p.deliverySourceBindings,guard.sources);for(const [f,h] of Object.entries(guard.sources))assert.equal(hash(f),h,f+' delivery changed');
assert.equal(p.baselineCommit,'63c3c63d7d5e6030c1f6257d7d4b6fc924718586');assert.equal(p.status,'LOCAL_UNIT_SCOPE_PROPOSALS_NOT_READY');
for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(p[k],false);assert.equal(p.masteryWeight,0);
const bank=readLearningPilotBank(),g=readGlossary();
const exp=q=>({exp:q.exp,explanation:q.explanation,wrongFeedback:q.wrongFeedback,optionFeedback:q.optionFeedback,items:q.items,blanks:q.blanks,selectionFeedback:q.selectionFeedback});
const sources=new Map([...SY0701_ACRONYM_CARDS.map(c=>['flashcard:'+c.id,c]),...bank.mcqs.map(q=>['explanation:mcq:'+q.id,exp(q)]),...Object.entries(g.terms).map(([term,definition])=>['glossary:'+encodeURIComponent(term.toLowerCase()),{term,definition}]),...CONCEPT_DEEP_DIVES.flatMap(d=>[['keywords:'+d.id,getSy0701DeepDiveProfile(d).keywordGuide],...d.sections.map((s,i)=>['section:'+d.id+':'+i,s])])]);
assert.equal(p.units.length,19);assert.equal(new Set(p.units.map(u=>u.unitId)).size,19);
const app=readFileSync('src/App.jsx','utf8');
for(const b of p.deliveryBindings){const a=app.indexOf(b.startAnchor),end=app.indexOf(b.endAnchor,a+b.startAnchor.length);assert(a>=0&&end>a);assert.equal(b.sourceRevision,contentSignature(app.slice(a,end)));assert.equal(b.startLine,app.slice(0,a).split('\n').length);assert.equal(b.endLine,app.slice(0,end).split('\n').length);}
function validateUnit(u,i){
 const original=base.instructionalProposals[i],parent=sources.get(original.recordId);assert(parent);
 assert.equal(u.unitId,'T'+String(i+1).padStart(2,'0'));assert.equal(u.recordId,original.recordId);assert.equal(u.parentRevision,contentSignature(parent));assert.equal(u.parentRevision,pkg.records.find(r=>r.id===u.recordId).sourceSignature);
 assert.deepEqual(u.subunit,original.subunit);const value=u.subunit?parent.find(k=>k.term===u.subunit.term):parent;assert(value);
 assert.equal(u.unitRevision,contentSignature(value));assert.equal(contentSignature(u.reviewedText),u.unitRevision);if(u.subunit)assert.equal(u.unitRevision,u.subunit.sourceRevision);
 assert.equal(u.priorScopeProposal,null);assert.deepEqual(u.objectiveCodesObserved,original.objectiveCodesObserved);assert.deepEqual(u.conceptLinkProposals,original.conceptLinkProposals);assert.equal(u.roleProposal,original.roleProposal);
 assert.deepEqual(u.objectiveCodesProposal,i===5?null:i===10?['5.2','3.4']:['5.2'],'Unjustified or inherited scope');
 assert.equal(u.scopeKind,i===5?'withheld_definition_boundary':i===11?'supporting_context_not_explicit_bullet':'explicit_objective_support');
 assert(u.scopeRationale.length>100);assert.equal(u.humanApproved,false);assert.equal(u.masteryWeight,0);assert.equal(u.reviewStatus,'agent_scope_proposal_pending_owner_and_independent_gate');
 assert.equal(u.delivery.level,'source_reachable_conditionally');for(const k of ['browserObserved','learnerExposureVerified','selectedForDeliveryVerified'])assert.equal(u.delivery[k],false,'No exposure observation');
 assert.equal(u.delivery.sourceBindingId,u.recordId.startsWith('flashcard:')?'cards':u.recordId.startsWith('glossary:')?'glossary':u.recordId.startsWith('explanation:')?'practice-feedback':'lesson');assert(u.delivery.conditions.length>100);
 if(u.subunit){const index=parent.findIndex(k=>k.term===u.subunit.term);assert.equal(u.delivery.keywordIndex,index);assert.equal(u.delivery.generatedPracticeFirstThreeIncludesTerm,index<3);assert(u.delivery.conditions.includes(index===0?'where this RTO definition is the initial tab':'initial tab is another term'));}
 if(u.recordId.startsWith('flashcard:')){assert(SY0701_ACRONYM_SETS.find(s=>s.id==='risk-governance-business').cards.some(c=>c.id===value.id));assert.equal(value.example,undefined);}
}
p.units.forEach(validateUnit);
for(const [index,patch] of [[0,{objectiveCodesProposal:['5.1','5.2','5.3','5.4']}],[5,{objectiveCodesProposal:['5.2']}],[11,{scopeKind:'explicit_objective_support'}],[14,{subunit:null}],[16,{delivery:{...p.units[16].delivery,conditions:p.units[16].delivery.conditions.replace('where this RTO definition is the initial tab','then select RTO; initial tab is another term')}}],[0,{humanApproved:true}],[0,{masteryWeight:1}],[0,{parentRevision:'sha256:'+'0'.repeat(64)}],[0,{delivery:{...p.units[0].delivery,browserObserved:true}}]])assert.throws(()=>validateUnit({...p.units[index],...patch},index));
assert.match(p.units[10].reviewedText.exp,/Three-hour versioned backups.*four-hour RPO.*Replication/);
assert.deepEqual(p.units[13].reviewedText.table.rows.map(r=>r[0]),['RTO','RPO','MTTR','MTBF']);
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [f,h] of Object.entries(manifest.files))assert.equal(hash(f),h,f+' active file changed');
console.log(JSON.stringify({status:'PASS_LOCAL_UNIT_SCOPE_PROPOSALS_NOT_APPROVAL',units:19,proposed:18,withheld:1,code34Units:1,browserObservedUnits:0,eligibleEvidence:0,activeFilesUnchanged:Object.keys(manifest.files).length,packetSha256:hash(path)}));
