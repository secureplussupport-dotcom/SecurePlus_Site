import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readGlossary} from './lib/content-mapping/delivery-inventory.mjs';
import {contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {SY0701_ACRONYM_CARDS} from '../src/data/sy0701AcronymFlashcards.js';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
const path='docs/drafts/phase-2b5-mttr-glossary-replacement-proposal.md',doc=readFileSync(path,'utf8');
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const current={term:'MTTR',definition:readGlossary().terms.MTTR};
const card=SY0701_ACRONYM_CARDS.find(c=>c.acronym==='MTTR'),table=CONCEPT_DEEP_DIVES.find(d=>d.id==='resilience-assets-physical').sections[1];
for(const [value,expected] of [[current,'sha256:09b9dd6eebf37a22c75b8c89f22c7dacf5a61fe36252cd6835d09f27b5785220'],[current.definition,'sha256:769ae53401583ed797b74089d262347de92f3d3ffdceade00eece4416de53594'],[card,'sha256:e0df2c38a13edc4d27a6835abc6e470a8c74880a68577a320d99b33a516ccbd7'],[table,'sha256:b0cee02c7ac294cb5e4d5912bb3acb90f2c147f4055f4fbe04d7dbfcd454ac3b']]){assert.equal(contentSignature(value),expected,'Current comparison drift');assert(doc.includes(expected));}
const fences=[...doc.matchAll(/```json\n([\s\S]*?)\n```/g)];assert.equal(fences.length,1);
const candidate=JSON.parse(fences[0][1]);
assert.deepEqual(candidate,{fullName:'Mean Time to Repair / Recover',definition:'Average elapsed time from service failure to verified restoration of acceptable service, calculated across completed repairs using the same start and end points.'},'Candidate changed: revise review binding');
assert(!/respond/i.test(JSON.stringify(candidate)),'Repair/respond conflation');
assert(!doc.includes('- [x]'));for(const s of ['LOCAL DRAFT ONLY','not approved, published or integrated','objective 5.2, repair/recover definition support','T06 stays withheld with scope null','NOT READY'])assert(doc.includes(s),'Missing boundary');
const pins={
 'docs/evidence/phase-2b5/mapping-package.json':'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97',
 'docs/drafts/phase-2b5-objective52-pilot-mapping-proposals.json':'de062252046dffcfde6de11ce7e328cf72bbec142be180c300c0ecc3f003f25c',
 'docs/drafts/phase-2b5-instructional-unit-scope-proposals.json':'18d9b7fc2114672c02d14eeeff23db5a36a2f5528b36c005262be50fdf9f09fb',
 'docs/phase-2b5-pilot-owner-decision-packet.md':'01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953'
};
for(const [f,h] of Object.entries(pins)){assert.equal(hash(f),h,f+' changed');assert(doc.includes(h));}
const scope=JSON.parse(readFileSync('docs/drafts/phase-2b5-instructional-unit-scope-proposals.json')).units.find(u=>u.unitId==='T06');assert.equal(scope.objectiveCodesProposal,null);assert.deepEqual(scope.conceptLinkProposals,[]);assert.equal(scope.humanApproved,false);
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [f,h] of Object.entries(manifest.files))assert.equal(hash(f),h,f+' active artifact changed');
const delivery=JSON.parse(readFileSync('docs/evidence/phase-2b5/delivery-surface-review.json'));for(const [f,h] of Object.entries(delivery.sources))assert.equal(hash(f),h,f+' delivery source changed');
console.log(JSON.stringify({status:'PASS_LOCAL_REPLACEMENT_PROPOSAL_NOT_APPROVAL',artifactSha256:hash(path),candidateParentRevision:contentSignature({term:'MTTR',definition:candidate}),currentGlossaryUnchanged:true,scopeApproved:false,eligibleEvidence:0,activeFilesUnchanged:25}));
