import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {LEARNING_CONCEPTS} from '../src/data/learningConcepts.js';
import {QUESTION_MAPPINGS} from '../src/data/learningMappings.js';
const path='docs/phase-2b5-pilot-owner-decision-packet.md';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const pinned={
 'docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json':'de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c',
 'docs/evidence/phase-2b5/mapping-package.json':'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97',
 'docs/drafts/phase-2b5-pilot-batch-1.json':'91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda',
 'src/data/learningConcepts.js':'90dfc8eda4cd0c5231fc7e35e66516e818bfc6720331eef6c0125f340c9085ac',
 'src/data/learningMappings.js':'ff0ce6342b951dde794cc5ca3bb8d37122fa3037f6dad9fe942fe88961689c7d',
 'docs/drafts/phase-2b5-pilot-batch-1-review.md':'fd63463a94aeb4879ec3fe0983a835d9fd99ba2bc482acf1e9a5b03aaf18c91e',
 'docs/phase-2b5-objective52-pilot-mapping-review.md':'e92e52e2e4a282aabcbbe8fc9856c5eca9f0264cbe00fc189591712de02e8934',
 'docs/drafts/phase-2b5-pilot-batch-1-family-decision.md':'f52a03d0c01659b282346b4d0a9056e493427564350ed7bb633e206c1df4d0dd',
 'docs/secureplus-rebrand-master-plan.md':'2a5c20f1a1584b4117a0b44f6446db04e265a34cf1870910d5cd8be00752e19c',
 'docs/phase-1-product-loop-audit.md':'5d1a2ad1180e96d428e8b77f97841b1eb2c11659235c8450ba40d80ba78b5c10'
};
for(const [p,h] of Object.entries(pinned))assert.equal(hash(p),h,p+' reviewed source changed');
const proposals=JSON.parse(readFileSync(Object.keys(pinned)[0])),batch=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-batch-1.json'));
const ids=['C-ID-RTO','C-ID-RPO','C-ID-MTD','C-ID-MTTR','C-ID-BIA','C-ROLE','C-CURRENT-D','C-CURRENT-SKILL','C-CURRENT-SCOPE','C-CANONICAL-SCOPE','C-COARSE-P048','C-COARSE-P211','C-TEACHING-LINKS','C-TEACHING-WITHHOLD','C-TEACHING-SCOPE-HOLD',...['T','D'].flatMap(k=>['RTO','RPO','MTD','MTTR','BIA'].map(c=>k+'-'+c)),'S-COMMON','S-MTD'];
// Documentation consistency check only; this has no approval ingestion or mutation path.
function validatePacket(doc){
 assert(!/^- \[[xX]\]/m.test(doc),'Agent-filled consent');
 assert.deepEqual([...doc.matchAll(/^- \[ \] \*\*([^*]+)\*\*/gm)].map(m=>m[1]).sort(),[...ids].sort(),'Missing/extra decision');
 for(const [p,h] of Object.entries(pinned))assert(doc.includes('['+p.split('/').at(-1)+']')&&doc.includes('`'+h+'`'),'Missing source fingerprint');
 for(const c of LEARNING_CONCEPTS)assert(doc.includes('`'+c.id+'`, '+c.name+':'),'Canonical ID/name drift');
 for(const q of QUESTION_MAPPINGS.filter(q=>q.format==='mcq'))assert(doc.includes(`| ${q.questionId} | \`${q.primaryConceptId}\` | ${q.difficulty} | ${q.cognitiveSkill} |`),'Current label drift');
 for(const c of ['rto','rpo','mtd','mttr','bia']){
  const qs=batch.questions.filter(q=>q.id.startsWith('draft.pilot1.'+c+'.'));
  const pairs=qs.map(q=>q.id.replace('draft.pilot1.','')+' '+q.difficulty+'/'+q.cognitiveSkill).join(', ');assert(doc.includes(pairs),'Batch1 label drift');
  assert(doc.includes(qs.map(q=>q.id.replace('draft.pilot1.','')).join(', ')+' primary=`'+qs[0].primaryConceptProposal+'`, secondary=[]'),'Batch1 role drift');
 }
 for(const [i,r] of proposals.instructionalProposals.entries()){
  const locator=r.recordId+(r.subunit?' / '+r.subunit.term:'');
  const links=r.conceptLinkProposals.map(c=>'`'+c+'`').join(', ')||'none';
  assert(doc.includes(`| T${String(i+1).padStart(2,'0')} | \`${locator}\` | ${links} | \`${r.roleProposal}\` |`),'Teaching row drift');
 }
 for(const boundary of ['None of these publish/activate anything','only a separate local record','objectiveCodesProposal=null','Authorizes recording a **hold**, not approved scope','NOT READY; no live changes'])assert(doc.includes(boundary),'Missing boundary');
}
const doc=readFileSync(path,'utf8');validatePacket(doc);
assert.throws(()=>validatePacket(doc.replace('- [ ] **C-ROLE**','- [x] **C-ROLE**')),/consent/);
assert.throws(()=>validatePacket(doc.replace('- [ ] **S-MTD**','- [ ] **UNKNOWN**')),/decision/);
assert.throws(()=>validatePacket(doc.replace(pinned['docs/evidence/phase-2b5/mapping-package.json'],'0'.repeat(64))),/fingerprint/);
assert.throws(()=>validatePacket(doc.replace('| T06 |','| T99 |')),/Teaching row/);
for(const p of [proposals,batch])for(const k of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(p[k],false);
for(const q of [...proposals.questionProposals,...batch.questions]){assert.equal(q.humanApproved,false);assert.equal(q.masteryWeight,0);assert.deepEqual(q.secondaryConceptProposals,[]);}
assert.equal(proposals.instructionalProposals.length,19);
for(const r of proposals.instructionalProposals){assert.equal(r.humanApproved,false);assert.equal(r.masteryWeight,0);assert.equal(r.objectiveCodesProposal,null);}
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [p,h] of Object.entries(manifest.files))assert.equal(hash(p),h,p+' active file changed');
console.log(JSON.stringify({status:'PASS_PENDING_OWNER_DECISIONS_NOT_CONSENT',choices:ids.length,teachingUnits:19,approvedDecisions:0,activeManifestFilesUnchanged:Object.keys(manifest.files).length,packetSha256:hash(path)}));
