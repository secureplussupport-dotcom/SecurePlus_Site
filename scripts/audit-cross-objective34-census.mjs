import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {compileRevision} from '../server/adaptive/revision.mjs';

const path='docs/drafts/phase-2b5-cross-objective34-census.json',p=JSON.parse(readFileSync(path)),hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
for(const [f,h] of Object.entries(p.sourceBindings))assert.equal(hash(f),h,f+' source drift');
assert.equal(p.sourceBindings['docs/evidence/phase-2b5/mapping-package.json'],'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.equal(p.sourceBindings['docs/drafts/phase-2b5-objective34-semantic-proposals.json'],'ceb33e92b12cde3c0a2c19f6d089f7b88f6cacf3263c86efc491f8b5b88cdaa2');
assert.equal(p.sourceBindings['docs/phase-2b5-pilot-owner-decision-packet.md'],'01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953');
assert.equal(p.baselineCommit,'080bb3cb63c1689f07c9bfb65548d4730716bb06');assert.equal(p.status,'LOCAL_CROSS_OBJECTIVE_CENSUS_NOT_READY');
for(const k of ['humanApproved','published','activationAllowed'])assert.equal(p[k],false);for(const k of ['masteryWeight','newFamilyCredit'])assert.equal(p[k],0);
const bank=readLearningPilotBank(),all=[...bank.mcqs,...bank.pbqs],qById=new Map(all.map(q=>[q.id,q])),pkg=JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json'));
assert.equal(contentSignature(bank),p.bankSignature);assert.equal(p.bankSignature,'sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391');
const strings=v=>typeof v==='string'?[v]:Array.isArray(v)?v.flatMap(strings):v&&typeof v==='object'?Object.values(v).flatMap(strings):[];
assert.deepEqual(p.search.rules.map(r=>r.id),['recovery','availability','sites','exercises','functional_paraphrases']);assert(p.search.rules.every(r=>r.flags==='i'));
// ponytail: broad regexes select candidates only; unselected text still needs semantic review before a bank-wide gap claim.
const hits=q=>p.search.rules.filter(r=>new RegExp(r.pattern,r.flags).test(strings(q).join('\n'))).map(r=>r.id);
const other=all.filter(q=>q.objective!==p.search.excludedObjective),selected=other.filter(q=>hits(q).length).map(q=>q.id).sort();
assert.equal(p.search.excludedObjective,'3.4');assert.deepEqual(p.search.excludedReviewedQuestionIds,all.filter(q=>q.objective==='3.4').map(q=>q.id).sort());
assert.equal(all.length,p.search.bankCount);assert.equal(other.length,p.search.screenedOtherObjectiveCount);assert.equal(selected.length,p.search.retainedCount);assert.equal(other.length-selected.length,p.search.unmatchedCount);assert.equal(p.search.completeSemanticCoverageClaim,false);
assert.equal(selected.length,111);assert.equal(other.length,480);assert.equal(p.search.unmatchedCount,369);
function validateRows(rows){
 assert.deepEqual(rows.map(r=>r.questionId).sort(),selected,'Missing or duplicate candidate');
 for(const r of rows){const q=qById.get(r.questionId),record=pkg.records.find(x=>x.id===r.recordId);assert(q&&record&&!r.recordId.startsWith('private:'));
  assert.equal(r.localRevision,contentSignature(q),'Stale local revision');assert.equal(r.localRevision,record.localRevisionSignature);assert.equal(r.capturedPublishedRevision,record.sourceSignature);assert.equal(r.capturedTrustedRevisionId,record.trustedRevisionId);assert.equal(r.capturedPrecision,record.precision);
  assert.equal(r.originalObjective,q.objective,'Original objective changed');assert.deepEqual(record.objectiveCodes,[r.originalObjective]);assert.equal(r.difficultyObserved,q.difficulty);assert.equal(r.formatObserved,record.questionFormat);assert.equal(r.kind,record.kind);
  assert(Object.hasOwn(p.classificationDefinitions,r.classification));assert(r.assessedArea.length>5&&r.rationale.length>50);
  for(const k of ['objectiveReassignmentProposal','primaryConceptProposal'])assert.equal(r[k],null);assert.deepEqual(r.secondaryConceptProposals,[]);assert.equal(r.humanApproved,false);for(const k of ['masteryWeight','newFamilyCredit'])assert.equal(r[k],0,'No live/component/family credit');
 }
 assert.deepEqual(rows.filter(r=>r.classification==='direct_3_4_reasoning').map(r=>r.questionId).sort(),['m068','m088','m352','m630','m708','p041','p043','p048']);
 assert.deepEqual(rows.filter(r=>r.classification==='contextual_mention').map(r=>r.questionId).sort(),['m002','m011','m018','m022','m032','m086','m091','m095','m118','m154','m168','m169','m196','m635','m639','m645','p004','p025','p060']);
}
validateRows(p.candidates);
for(const [id,patch] of [['m088',{localRevision:'sha256:'+'0'.repeat(64)}],['m088',{originalObjective:'3.4'}],['m653',{classification:'direct_3_4_reasoning'}],['p041',{masteryWeight:1}],['p043',{capturedTrustedRevisionId:'invented'}],['p048',{primaryConceptProposal:'recovery.rto'}]])assert.throws(()=>validateRows(p.candidates.map(r=>r.questionId===id?{...r,...patch}:r)));
assert.throws(()=>validateRows(p.candidates.slice(1)));
assert.deepEqual(hits({stem:'A battery keeps service running at an alternate facility.'}),['functional_paraphrases']);assert(hits({options:['Platform diversity'],feedback:'Retain backups before restoring.'}).length>=2);
for(const id of ['p041','p043'])assert.throws(()=>compileRevision(qById.get(id),'pbq'));assert.equal(compileRevision(qById.get('p048'),'pbq').revisionId,p.candidates.find(r=>r.questionId==='p048').capturedTrustedRevisionId);
assert.equal(p.privateBoundary.questionId,'p017');assert.equal(p.privateBoundary.selectedSourceRevision,pkg.privateRevisionProcessing.sourceSignature);assert.equal(p.privateBoundary.selectedSourceRevision,'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42');assert.equal(p.privateBoundary.trustedRevisionId,null);for(const k of ['payloadAvailable','sourceReadRefreshed','localFallbackMaySubstitute'])assert.equal(p.privateBoundary[k],false);
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [f,h] of Object.entries(manifest.files))assert.equal(hash(f),h,f+' active artifact changed');
for(const root of ['src','api','server'])for(const f of readdirSync(root,{recursive:true}).filter(f=>/\.(jsx?|mjs)$/.test(f)))assert(!readFileSync(root+'/'+f,'utf8').includes('phase-2b5-cross-objective34-census'),'Runtime imported census');
console.log(JSON.stringify({status:'PASS_LOCAL_CROSS_OBJECTIVE_CENSUS_NOT_READY',packetSha256:hash(path),screened:480,retained:111,unmatched:369,mcqs:92,pbqs:19,classificationCounts:Object.fromEntries(Object.keys(p.classificationDefinitions).map(k=>[k,p.candidates.filter(r=>r.classification===k).length])),coarseDirectPbqs:3,unsupportedDirectPbqGrammars:2,eligibleEvidence:0,newQuestions:0,newFamilyCredit:0}));
