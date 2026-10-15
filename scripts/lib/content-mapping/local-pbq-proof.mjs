import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {canonicalPayload,validateStableSelections} from '../../../src/lib/learningPersistenceContracts.js';
import {compileRevision} from '../../../server/adaptive/revision.mjs';
import {compileSelectFillV2,NORMALIZER_BINDING} from './select-fill-v2.mjs';
import {contentSignature as sig} from '../read-learning-pilot-bank.mjs';
import {sourceUnit} from './delivery-inventory.mjs';

// Offline proof only. No trusted registration, persistence, runtime caller or current-source repair.
export const LOCAL_PBQ_PROOF_VERSION='local-pbq-proof-v1';
export const LOCAL_PBQ_PROOF_ENABLED_BY_DEFAULT=false;
const pins={
  "pbq:p007": {
    "published": "sha256:f21627a72d012a0bfae327a109509b6ee2986d94233bc8d67760a467bb053444",
    "local": "sha256:381dd90e40d617e80ac0aeaaa34e41e85601d95e6c43d21da8e307041eab89f9",
    "authored": "sha256:23c0572341acdc1ac710f3d100735a073dfa8810627e57cb435719a61ba734c7",
    "preEditorial": "sha256:23c0572341acdc1ac710f3d100735a073dfa8810627e57cb435719a61ba734c7",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p012": {
    "published": "sha256:a5fc0571a956742690726a044e2fb2030510c353caf7c619c6c6a7faf6063d0b",
    "local": "sha256:51e56b33b6c062cab28814cb27f2c2e24680df38ece3b0e3ddc99f6e40910c19",
    "authored": "sha256:adc9b9cdce2af89e8b727409a9027f2aef9ae5b049d305e6c11d9244ccc1cac3",
    "preEditorial": "sha256:adc9b9cdce2af89e8b727409a9027f2aef9ae5b049d305e6c11d9244ccc1cac3",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p019": {
    "published": "sha256:2fe067e03fe2c1a05ec1c0dc7b38abc711b27e086a80a37dfa5fb0124066b741",
    "local": "sha256:d987b9f07b30ad674654b1d0e0856427beac40fc213f03bc27fcb407779c8006",
    "authored": "sha256:ec59fd8124c07bbd84441f2415e1bfd94abb54aa74a0cf2ad160e3274d29d8d3",
    "preEditorial": "sha256:ec59fd8124c07bbd84441f2415e1bfd94abb54aa74a0cf2ad160e3274d29d8d3",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p030": {
    "published": "sha256:9c29b7815b77b884e18ec61a03586618572e0056a570c4d42be4fe011571f88c",
    "local": "sha256:eec144ddaf46d82b65631d0dc2ae3c827f184405d17f6e9d1e7d5f60c1096b48",
    "authored": "sha256:823c245050166b33cb460339ce46c9f30865d89bcb0ebf64e30d4fa5cb7a7266",
    "preEditorial": "sha256:6f6fa414d7abe285de5b2133af6e77bc08b9d2f6141414284cd698295c58bd51",
    "origin": "authored_local",
    "snapshots": 1,
    "captures": 1,
    "captureBinding": "sha256:6cc8c837611a0fd9d945a11ce29e8616d3827318d3cc50ba90bf7192e55d3511"
  },
  "pbq:p035": {
    "published": "sha256:2523717bcd158f80e260ae7d0f26fe4f2bf8969226956ec6030da13119352b81",
    "local": "sha256:a7e6637d0afd081bd108bb3b7e02e4ef24c84812afd1c7bb5f1117cff5678287",
    "authored": "sha256:340394fa245c7ef157392972dfece7beb1c9a5d73b0921bdf542ce4ba7a15468",
    "preEditorial": "sha256:340394fa245c7ef157392972dfece7beb1c9a5d73b0921bdf542ce4ba7a15468",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p056": {
    "published": "sha256:3e52fdd7c63a5f25d1f3709512ace5ed5529d4ff4471a9b0865aa8589d351611",
    "local": "sha256:5aba08d9de3bbca166f34f88901771c28e41aee7a6f5b778c1b7b9d43b7008f6",
    "authored": "sha256:a36f314454215f08b2a9cd385f37633b5f936ddc6b4676856596a05e8a572352",
    "preEditorial": "sha256:a36f314454215f08b2a9cd385f37633b5f936ddc6b4676856596a05e8a572352",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p061": {
    "published": "sha256:c1aab7f74cb26a56f5f03b87d9217dabecdcfb502660aded33d29899a8991504",
    "local": "sha256:74f9c003097f08f0760ab4d038cb688ded81490fb62c41a97159ed931247497d",
    "authored": "sha256:53aaaf55b28e8e625ca271b3c924575de5d8a8991323219c507c2a5203b9c050",
    "preEditorial": "sha256:53aaaf55b28e8e625ca271b3c924575de5d8a8991323219c507c2a5203b9c050",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p067": {
    "published": "sha256:f3914be7e6b493cc65b446bbbda91ccd74c49ad3272298a67389d29d36304852",
    "local": "sha256:939395909b42f8831e1ce03f8a372e63d21aabb86d808c043f61dc720df0a565",
    "authored": "sha256:6ca0eb31f405bad6238434921b139422ce5d77f1a591697f4504432c5f3cf619",
    "preEditorial": "sha256:6ca0eb31f405bad6238434921b139422ce5d77f1a591697f4504432c5f3cf619",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p073": {
    "published": "sha256:9af9f242835314be6353f8f0ea925925e2cafdea2fa03d070e9bc8d37107870f",
    "local": "sha256:317b018966acbc729e607b300cd053a1dc2d0a42586b9047e441eba582a359f6",
    "authored": "sha256:af635387b43d47c3f8f70e48c2eacafb8fdf2a8d6911c079009f811a3caf0e09",
    "preEditorial": "sha256:af635387b43d47c3f8f70e48c2eacafb8fdf2a8d6911c079009f811a3caf0e09",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p077": {
    "published": "sha256:9e07e58f1b321662775d7f35b0e8bbefd5c0a31758a91791bae54af4af8883ae",
    "local": "sha256:d9d2fe093b7ed46cbfd8cfc45978e415555c169cdea8ce056b9a414abe737072",
    "authored": "sha256:eb9abd7a7a6ae5e13c22fa2a4208bb4e4c7a1518a4b97f57506bacead52da8c3",
    "preEditorial": "sha256:eb9abd7a7a6ae5e13c22fa2a4208bb4e4c7a1518a4b97f57506bacead52da8c3",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p079": {
    "published": "sha256:479c56850aedec2203f0d1e70950ece92e20d500565800c8a0200d552436d140",
    "local": "sha256:2b022f2ad9d4f6524c3deae828f9128e040f024baec2104e3731e68f3ff78d44",
    "authored": "sha256:de7c61252d21b94e1e8a89b54b7a973e28e0fc8588be4bec48adce5286fdc3ed",
    "preEditorial": "sha256:de7c61252d21b94e1e8a89b54b7a973e28e0fc8588be4bec48adce5286fdc3ed",
    "origin": "authored_local",
    "snapshots": 0,
    "captures": 0,
    "captureBinding": "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
  },
  "pbq:p223": {
    "published": "sha256:77ac1d7fa1590f4e51beaa5fd93d60a0c3fb47f4067a7f6b245f1b32ee36e179",
    "local": "sha256:06a1cfd2a732e42705bf69cf72a2c6ca96705e7731a3eea7ec8cfdc9a319905c",
    "authored": null,
    "preEditorial": "sha256:7d33c056fcb20992d710d8d974784864485780bd9c736ae962e57df1ddd91272",
    "origin": "captured_snapshot",
    "snapshots": 1,
    "captures": 1,
    "captureBinding": "sha256:2dd78ba1531b8fceb8d71f906b8e82542c8074eb7ca3b4bbc0033adaae936bff"
  }
};
export const LOCAL_PBQ_PROOF_RECORD_IDS=Object.freeze(Object.keys(pins));
const dependencies={
  native:sourceUnit('server/adaptive/revision.mjs').provenance.sourceSignature,
  slots:sourceUnit('scripts/lib/content-mapping/select-fill-v2.mjs').provenance.sourceSignature,
  normalizer:NORMALIZER_BINDING.sourceSignature,
  compiler:sourceUnit(fileURLToPath(import.meta.url)).provenance.sourceSignature,
};
assert.equal(dependencies.native,'sha256:6f0ec815c9076aeca61734954e883c976d947013d39245a8c9d99e5da921bd56');
assert.equal(dependencies.slots,'sha256:c3cbeb26683292f8dcd1a894283033c01f060642e06f1fbf5268123b386030aa');
assert.equal(dependencies.normalizer,'sha256:be3f3f9a1df49816ec74798b6eab47cee63a799f8529568eed1a538d3899f339');
assert.equal(sourceUnit('src/App.jsx','const FILL_BLANK_SPELLING_VARIANTS =','function parseAcceptedAnswers(').provenance.sourceSignature,dependencies.normalizer);
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

/** compileOfflinePbq(recordId, published, {enabled:false}) -> null or internal JSON proof.
 * Only twelve exact LOCAL publication fingerprints are accepted. The internal model has a key;
 * pass only learnerOfflinePbq output to a learner. No original payload or hypothetical UUID is retained.
 */
export function compileOfflinePbq(recordId,published,options={}){
  if(!optIn(options))return null;
  assert(typeof recordId==='string'&&Object.hasOwn(pins,recordId),'Outside pinned LOCAL proof scope');
  const source=jsonCopy(published),authority=pins[recordId];assert(plain(source)&&source.id===recordId.slice(4),'LOCAL source identity required');
  assert.equal(sig(source),authority.published,'Pinned publication source required');
  const projected=jsonCopy(source),omitted=[];
  function omit(field){omitted.push({field,sourceRevision:sig(source[field])});delete projected[field];}
  let answerMode,display,components,grading,slotOrder=[],valueOrder,slotHints=[];
  if(source.type==='HOTSPOT'){
    assert(source.diagram?.trim()&&Array.isArray(source.hotspots)&&source.hotspots.length===source.choices.length,'Bound hotspot metadata required');
    assert(source.hotspots.every(h=>typeof h.id==='string'&&h.id&&typeof h.correct==='boolean'),'Invalid hotspot identity/flag');
    assert.equal(new Set(source.hotspots.map(h=>h.id)).size,source.hotspots.length);
    assert.deepEqual(source.hotspots.flatMap((h,i)=>h.correct?[i]:[]),[source.correct]);
    omit('hotspots');const native=compileRevision(projected,'pbq');assert.equal(native.gradingKey.answerMode,'single_choice');
    answerMode='single_choice';display=native.semantic.display;
    components=native.components.map(({id,kind,label})=>({id,kind,label}));
    grading=native.gradingKey.expected.map(({componentId,valueId})=>({componentId,acceptedValueIds:[valueId]}));
    valueOrder=source.choices.map(label=>components.find(c=>c.label===label).id);
  }else{
    assert.equal(source.type,'SELECT & FILL');
    if(Object.hasOwn(source,'hint')){assert.equal(typeof source.hint,'string');omit('hint');}
    if(source.id==='p223'){assert.deepEqual(source.acronyms,[]);assert.equal(source.beyondTextbook,false);omit('acronyms');omit('beyondTextbook');}
    const slots=compileSelectFillV2(projected,sig(projected));answerMode='reusable_slot_values';display=slots.model.display;
    components=[...slots.model.slots.map(({id,sentence})=>({id,kind:'slot',sentence})),...slots.model.values.map(({id,label})=>({id,kind:'value',label}))];
    grading=slots.model.slots.map(({id,acceptedValueIds})=>({componentId:id,acceptedValueIds}));
    slotOrder=source.blanks.map(b=>slots.model.slots.find(s=>s.authoredId===b.id).id);
    valueOrder=source.selectionOptions.map(label=>slots.model.values.find(v=>v.label===label).id);
    slotHints=source.blanks.filter(b=>b.hint).map(b=>({componentId:slots.model.slots.find(s=>s.authoredId===b.id).id,text:b.hint}));
  }
  components.sort((a,b)=>a.id.localeCompare(b.id));grading.sort((a,b)=>a.componentId.localeCompare(b.componentId));
  const model=jsonCopy({version:LOCAL_PBQ_PROOF_VERSION,recordId,questionId:source.id,authority,dependencies,projectedSourceRevision:sig(projected),metadataOmissions:omitted,answerMode,display,components,grading,slotOrder,valueOrder,slotHints});
  return{version:LOCAL_PBQ_PROOF_VERSION,recordId,sourceRevision:authority.published,modelRevision:sig(model),model,trustedRevisionId:null,eligibleEvidence:false,newCredit:0};
}
function checked(proof,published){
  const supplied=jsonCopy(proof);assert(plain(supplied),'Proof object required');
  const authoritative=compileOfflinePbq(supplied.recordId,published,{enabled:true});
  assert(canonicalPayload(supplied)===canonicalPayload(authoritative),'Source-bound proof integrity mismatch');return authoritative.model;
}
/** Stateless whole/coarse grading: JSON round trips work when the exact original LOCAL source is supplied. */
export function gradeOfflinePbq(proof,selections,published,options={}){
  if(!optIn(options))return null;const model=checked(proof,published);
  const selected=validateStableSelections(jsonCopy(selections),{questionType:'pbq',components:model.components});
  if(model.answerMode==='single_choice'){
    assert(selected.length===1&&selected[0].componentId===selected[0].valueId&&model.components.some(c=>c.id===selected[0].valueId&&c.kind==='option'),'One option self-selection required');
  }else{
    assert.equal(selected.length,model.slotOrder.length,'One value per slot required');
    assert(selected.every(s=>model.components.some(c=>c.id===s.componentId&&c.kind==='slot')&&model.components.some(c=>c.id===s.valueId&&c.kind==='value')),'Slot/value roles required');
  }
  const correct=selected.every(s=>model.grading.find(g=>g.componentId===s.componentId)?.acceptedValueIds.includes(s.valueId)===true);
  return{correct,score:correct?1:0,evidencePrecision:'coarse',eligibleEvidence:false,trustedRevisionId:null,newCredit:0};
}
/** Public allowlist, source order by default. Practice may carry source slot hints; exam never does.
 * Top-level selector hints are retained as omitted-field provenance, matching their absent current UI.
 */
export function learnerOfflinePbq(proof,published,options={}){
  const o=optIn(options,['enabled','mode','displayOrder']);if(!o)return null;
  assert(['practice_before_answer','exam_before_answer'].includes(o.mode),'Explicit pre-answer mode required');
  const model=checked(proof,published),order=o.displayOrder??model.valueOrder;
  assert(Array.isArray(order)&&order.length===model.valueOrder.length&&new Set(order).size===order.length&&order.every(id=>model.valueOrder.includes(id)),'Value display permutation required');
  const slots=model.slotOrder.map(id=>{const c=model.components.find(c=>c.id===id),hint=model.slotHints.find(h=>h.componentId===id)?.text;return{id,kind:'slot',sentence:c.sentence,...(o.mode==='practice_before_answer'&&hint?{hint}:{})};});
  const values=order.map(id=>{const c=model.components.find(c=>c.id===id);return{id,kind:c.kind,label:c.label};});
  return{version:LOCAL_PBQ_PROOF_VERSION,modelRevision:sig(model),questionId:model.questionId,answerMode:model.answerMode,mode:o.mode,eligibleEvidence:false,...jsonCopy(model.display),slots,values};
}
