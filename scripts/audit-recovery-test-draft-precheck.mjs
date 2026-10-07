import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
const reportPath='docs/phase-2b5-recovery-test-draft-precheck.md',report=readFileSync(reportPath,'utf8'),hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const pinned={
 'docs/drafts/phase-2b5-pilot-batch-1.json':'91e83b7afbc56901bc1a37ae426763024456d8d90ae486c2d2833ff076826bda',
 'docs/drafts/phase-2b5-pilot-batch-4.json':'7be45316dda58c45685e06c9d2062a58b6dfda6b56b898d7050ff2b28412714e',
 'docs/drafts/phase-2b5-pilot-pbq-draft-2.json':'94adaf1c9ca90370636bc3c8c20a6e51156964a4f1871905d23a88cbe9d5ae02',
 'docs/drafts/phase-2b5-pilot-teaching-draft-3.json':'84757c5c7bec067e5baee182487525f3f843aa9e709af257b307be0c1655a921',
 'docs/drafts/phase-2b5-cross-objective34-census.json':'2613a81bfc9a9720a90f5225d1265df3f538f5bcf543e29c9a4a2dc9b224b782',
 'docs/phase-2b5-cross-objective34-review.md':'42c8e48fe777fd8730cd8e10207a4f54465b321771ceb72ec00625969fd41f13',
 'docs/evidence/phase-2b5/mapping-package.json':'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97',
 'docs/phase-2b5-pilot-owner-decision-packet.md':'01f96e9c4edff2ef61d25c296fb96c585ad1a00db0709f47c0d261b7fbb5d953'
};
for(const [f,h] of Object.entries(pinned)){assert.equal(hash(f),h,f+' comparison drift');assert(report.includes(h));}
const bank=readLearningPilotBank(),all=[...bank.mcqs,...bank.pbqs],byId=new Map(all.map(q=>[q.id,q])),census=JSON.parse(readFileSync('docs/drafts/phase-2b5-cross-objective34-census.json')),pkg=JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json'));
assert.equal(contentSignature(bank),'sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391');
const unmatched=all.filter(q=>q.objective!=='3.4'&&!census.candidates.some(r=>r.questionId===q.id));assert.equal(unmatched.length,369);
// ponytail: second screen is broad triage, not proof of complete semantic coverage.
const screen=/\b(?:test\w*|exercis\w*|validat\w*|verif\w*|measur\w*|criterion|criteria|success\w*|fail\w*|accept\w*|result\w*|outcome\w*|service|system|transaction\w*|health|boot\w*|uptime|downtime|elapsed|time|durat\w*)\b/i;
const selected=unmatched.filter(q=>screen.test([q.q,q.title,q.scenario,q.question,q.diagram,q.logData,q.currentConfig].filter(Boolean).join(' '))).map(q=>q.id).sort();
assert.equal(selected.length,113);assert.equal(contentSignature(selected),'sha256:615b4b7f0599ff7669f49aeace166655814f4cf3351758a46eca4c77cc3c5d0b');assert(report.includes(contentSignature(selected)));
const inspected=['m020','m080','m100','m115','m238','m244','m262','m416','m628','p020','p027','p064','p086','p094'];
for(const id of inspected){assert(selected.includes(id));const q=byId.get(id),r=pkg.records.find(r=>r.questionId===id&&!r.id.startsWith('private:'));assert.equal(contentSignature(q),r.localRevisionSignature);assert(report.includes(`| ${id} | ${q.objective} | \`${contentSignature(q)}\` | \`${r.sourceSignature}\` |`),id+' report source drift');}
const one=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-batch-1.json')),four=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-batch-4.json')),worksheet=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-pbq-draft-2.json')),teaching=JSON.parse(readFileSync('docs/drafts/phase-2b5-pilot-teaching-draft-3.json'));
assert.equal(one.questions.length+four.questions.length,21);assert.equal(worksheet.exercises.flatMap(e=>e.parts).length,6);assert.equal(teaching.drafts.length,3);
const q=id=>one.questions.find(q=>q.id==='draft.pilot1.'+id);
function checkMeasuredService(item){assert.match(item.stem,/checkout becomes usable after 45 minutes/);assert.match(item.stem,/resume within 30 minutes/);assert.equal(item.correctOption,2);assert.equal(item.options[item.correctOption],'It was missed because checkout became usable 15 minutes after the 30-minute deadline.');assert.equal(45-30,15);assert(20<=60);}
checkMeasuredService(q('rto.01'));assert.throws(()=>checkMeasuredService({...q('rto.01'),correctOption:0}));assert.throws(()=>checkMeasuredService({...q('rto.01'),stem:q('rto.01').stem.replace('45 minutes','25 minutes')}));
assert.match(q('rto.02').stem,/until users can complete a transaction/);assert.match(q('rto.02').stem,/15 minutes.*20 minutes.*10 minutes.*cannot overlap/s);assert.equal(15+20+10,45);assert(45>40);assert.equal(q('rto.02').correctOption,0);assert(q('rto.02').options[0].includes('45 minutes and misses'));
assert.match(q('rpo.03').stem,/Restore testing confirms.*10:55.*No transaction logs/s);assert.equal(14*60-(10*60+55),185);assert(185>15);assert.equal(q('rpo.03').correctOption,2);assert(q('rpo.03').options[2].includes('185-minute window'));
assert.match(q('mttr.03').stem,/validated transaction.*starts only.*server boots.*no comparable/s);assert.equal(q('mttr.03').correctOption,1);assert(q('mttr.03').options[1].includes('different clock boundaries'));
const exercise=worksheet.exercises[0];assert.match(exercise.scenario,/10:00.*09:50.*10:50/s);assert.equal(650-600,50);assert(50>45);assert.equal(600-590,10);assert(10<=15);assert.equal(exercise.parts.find(p=>p.id==='rto').comparisonDraftId,q('rto.01').id);assert.equal(exercise.parts.find(p=>p.id==='rto').scenarioFamilyProposal,q('rto.01').scenarioFamilyProposal);
const chain=four.questions.find(q=>q.id==='draft.pilot4.rpo.01');assert.match(chain.stem,/12:20-12:30 block is missing.*every intervening log block.*no later base snapshot/s);assert.equal(765-740,25);assert(25>15);assert.equal(chain.correctOption,1);assert.equal(chain.options[1],'12:20, giving a 25-minute window that misses the RPO.');
assert(report.includes('NO_NEW_DRAFT_EXISTING_REASONING_FOUND'));assert(report.includes('New questions=0; new families=0; eligible evidence=0.'));assert(report.includes('NOT READY'));assert(report.includes('Not a personal human review'));
assert.equal(pkg.privateRevisionProcessing.sourceSignature,'sha256:c1ed8cd5e1a8953d431a71e5377ab68bf92e9a61f756060134d8bc05d2a3dc42');
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [f,h] of Object.entries(manifest.files))assert.equal(hash(f),h,f+' active artifact drift');
for(const root of ['src','api','server'])for(const f of readdirSync(root,{recursive:true}).filter(f=>/\.(jsx?|mjs)$/.test(f)))assert(!readFileSync(root+'/'+f,'utf8').includes('recovery-test-draft-precheck'),'Runtime imported precheck');
console.log(JSON.stringify({status:'PASS_NO_NEW_DRAFT_EXISTING_REASONING_FOUND_NOT_READY',reportSha256:hash(reportPath),auditSha256:hash('scripts/audit-recovery-test-draft-precheck.mjs'),unmatched:369,secondScreen:113,fullyInspectedImplicitCandidates:14,priorMcqs:21,worksheetRows:6,teachingOnly:3,newQuestions:0,newFamilyCredit:0,eligibleEvidence:0}));
