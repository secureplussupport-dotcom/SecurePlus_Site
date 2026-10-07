import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {SY0701_ACRONYM_CARDS} from '../src/data/sy0701AcronymFlashcards.js';
import {getSy0701DeepDiveProfile} from '../src/data/sy0701DeepDiveMap.js';
import {buildDeepDivePracticeQuestions} from '../src/lib/deepDiveStudy.js';
import {readLearningPilotBank,contentSignature} from './lib/read-learning-pilot-bank.mjs';
import {readGlossary,readStarterQuestions} from './lib/content-mapping/delivery-inventory.mjs';
const packetPath='docs/drafts/phase-2b5-pilot-teaching-draft-3.json',reportPath='docs/phase-2b5-pilot-teaching-review.md';
const evidencePath='docs/evidence/phase-2b5/pilot-teaching-validation.json';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const packet=JSON.parse(readFileSync(packetPath)),pkg=JSON.parse(readFileSync('docs/evidence/phase-2b5/mapping-package.json'));
const bank=readLearningPilotBank(),glossary=readGlossary(),starters=Object.values(readStarterQuestions().sets).flat();
const explanation=q=>({exp:q.exp,explanation:q.explanation,wrongFeedback:q.wrongFeedback,optionFeedback:q.optionFeedback,items:q.items,blanks:q.blanks,selectionFeedback:q.selectionFeedback});
const contentByRecord=new Map([
 ...SY0701_ACRONYM_CARDS.map(c=>['flashcard:'+c.id,c]),
 ...Object.entries(glossary.terms).map(([term,definition])=>['glossary:'+encodeURIComponent(term.toLowerCase()),{term,definition}]),
 ...bank.mcqs.map(q=>['explanation:mcq:'+q.id,explanation(q)]),...bank.pbqs.map(q=>['explanation:pbq:'+q.id,explanation(q)]),
 ...CONCEPT_DEEP_DIVES.flatMap(d=>d.sections.map((s,i)=>['section:'+d.id+':'+i,s]))
]);
function validateLink(link,source=contentByRecord){
 const r=pkg.records.find(r=>r.id===link.recordId);assert(r,'Unknown record');assert(source.has(link.recordId),'Unavailable local content');
 assert.equal(link.sourceSignature,r.sourceSignature,'Stale package signature');
 assert.equal(link.sourceSignature,contentSignature(source.get(link.recordId)),'Stale effective content');
 assert(['continuity.bia','recovery.mtd'].includes(link.conceptLinkProposal));
 assert.equal(link.mappingReviewStatus,'proposal_pending_editorial_gate');assert.equal(link.humanApproved,false);assert.equal(link.masteryWeight,0);
}
assert.equal(hash('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
assert.equal(contentSignature(bank),'sha256:b308564f2dbef0530c62ce288513aedf211b21d0199caa704d39b2a272540391');
assert.equal(packet.baselineCommit,'c9a73fb16d01f1e85710f5a4a29d60de4d28accb');
assert.equal(packet.status,'AUTHOR_REVIEWED_SUPPORT_ONLY_PENDING_LINK_GATE');
for(const key of ['humanApproved','published','activationAllowed','privatePayloadIncluded'])assert.equal(packet[key],false);
assert.equal(packet.masteryWeight,0);assert.equal(packet.reusedLinks.length,5);
for(const link of packet.reusedLinks)validateLink(link);
const sample=packet.reusedLinks[0];
assert.throws(()=>validateLink({...sample,sourceSignature:'sha256:'+'0'.repeat(64)}),/Stale package signature/);
assert.throws(()=>validateLink({...sample,recordId:'private:pbq:p017'}),/Unavailable local content/);
assert.throws(()=>validateLink({...sample,humanApproved:true}));
assert.throws(()=>validateLink({...sample,mappingReviewStatus:'approved'}));
const changed=new Map(contentByRecord);changed.set(sample.recordId,{...changed.get(sample.recordId),meaning:'Changed definition'});
assert.throws(()=>validateLink(sample,changed),/Stale effective content/);
const absent=new Map(contentByRecord);absent.delete(sample.recordId);assert.throws(()=>validateLink(sample,absent),/Unavailable local content/);
assert.equal(packet.drafts.length,3);assert.equal(new Set(packet.drafts.map(d=>d.id)).size,3);
for(const d of packet.drafts){
 assert.match(d.id,/^draft\.pilot3\.(mtd\.(card|section)|bia\.section)$/);
 assert.equal(d.contentSignature,contentSignature(d.content),'Stale draft revision');
 assert.equal(d.masteryWeight,0);assert.equal(d.humanApproved,false);assert.equal(d.published,false);
 assert.equal(d.mappingReviewStatus,'proposal_pending_editorial_gate');assert.deepEqual(d.objectiveCodesProposal,['5.2']);
 assert.equal(d.objectiveScopeProposal,d.primaryConceptLinkProposal==='recovery.mtd'?'supporting_context_not_explicit_bullet':'explicit_bia_bullet');
 assert(!pkg.records.some(r=>r.id===d.id),'Draft adopted into active package');
 if(d.kind==='flashcard'){assert.equal(d.content.acronym,'MTD');assert(d.content.meaning.length>40);}
 else {assert.equal(d.kind,'lesson_section');assert(d.content.body.length>=2&&d.content.body.every(s=>s.length>40));assert(d.content.table.rows.every(r=>r.length===d.content.table.columns.length));}
}
const example=packet.workedExampleCheck;
assert.equal(example.nonOverlapping,true);assert.equal(example.workaroundAvailable,false);
assert.equal(example.systemRestoreMinutes+example.reconciliationMinutes,example.totalInterruptionMinutes);
assert.equal(example.businessToleranceMinutes-example.totalInterruptionMinutes,example.remainingToleranceMinutes);
assert.equal(example.totalInterruptionMinutes,330);assert.equal(example.remainingToleranceMinutes,30);
const mtd=packet.drafts.find(d=>d.id==='draft.pilot3.mtd.section').content;
assert(mtd.body.join(' ').includes('five and a half hours')&&mtd.body.join(' ').includes('thirty minutes'));
// Search teaching fields separately: aliases/deck metadata do not establish teaching coverage.
const named={mtd:/\bMTD\b|maximum tolerable downtime/i,bia:/\bBIA\b|business impact analysis/i};
const broad=/downtime|business impact|critical (business|function|process)|continuity|tolerable/i;
const lessons=CONCEPT_DEEP_DIVES.map(d=>({d,profile:getSy0701DeepDiveProfile(d)}));
const census=Object.fromEntries(Object.entries(named).map(([concept,rx])=>[concept,{
 sections:lessons.flatMap(({d})=>d.sections.map((s,i)=>({id:`section:${d.id}:${i}`,s}))).filter(x=>rx.test(JSON.stringify(x.s))).map(x=>x.id),
 cards:SY0701_ACRONYM_CARDS.filter(c=>rx.test([c.acronym,c.expansion,c.meaning].join(' '))).map(c=>'flashcard:'+c.id),
 glossary:Object.entries(glossary.terms).filter(([term,definition])=>rx.test(JSON.stringify({term,definition}))).map(([term])=>'glossary:'+term.toLowerCase()),
 explanations:[...bank.mcqs,...bank.pbqs].filter(q=>rx.test(JSON.stringify(explanation(q)))).map(q=>q.id),
 lessonSupport:lessons.filter(({d,profile})=>rx.test(JSON.stringify({check:d.check,traps:d.traps,keywordGuide:profile.keywordGuide,practice:buildDeepDivePracticeQuestions(d).slice(0,3)}))).map(({d})=>d.id),
 starterExplanations:starters.filter(q=>rx.test(JSON.stringify(explanation(q)))).map(q=>q.id),
 metadataOnlyAliases:lessons.filter(({d})=>rx.test(JSON.stringify(d.aliases))).map(({d})=>d.id)
}]));
assert.deepEqual(census.mtd.sections,[]);assert.deepEqual(census.bia.sections,[]);assert.deepEqual(census.mtd.cards,[]);
assert.equal(census.bia.cards.length,1);assert(census.bia.glossary.includes('glossary:bia'));
assert(census.mtd.explanations.includes('m196'));assert(census.bia.explanations.includes('m086'));
const relatedSections=lessons.flatMap(({d})=>d.sections.map((s,i)=>({id:`section:${d.id}:${i}`,s}))).filter(x=>broad.test(JSON.stringify(x.s))).map(x=>x.id);
for(const root of ['src','api','server'])for(const p of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+p,'utf8').includes('phase-2b5-pilot-teaching-draft-3'),'Runtime draft import');
const manifest=JSON.parse(readFileSync('docs/evidence/phase-2b5/release-checksums.json'));for(const [p,h] of Object.entries(manifest.files))assert.equal(hash(p),h,p+' active file changed');
const evidence={status:'PASS_LOCAL_REUSE_BINDING_AND_DRAFT_CHECKS_NOT_APPROVAL',date:packet.date,baselineCommit:packet.baselineCommit,counts:{lessons:lessons.length,sections:lessons.reduce((n,{d})=>n+d.sections.length,0),cards:SY0701_ACRONYM_CARDS.length,glossary:Object.keys(glossary.terms).length,localBankExplanations:bank.mcqs.length+bank.pbqs.length,starterExplanations:starters.length,reusedLinks:5,newDrafts:3,eligibleEvidence:0},corpusSignature:contentSignature({lessons,cards:SY0701_ACRONYM_CARDS,glossary:glossary.terms,bank,starters}),namedTeachingCensus:census,relatedSectionCandidates:relatedSections,reusedBindings:packet.reusedLinks,draftBindings:packet.drafts.map(d=>({id:d.id,contentSignature:d.contentSignature})),checks:{stalePackageOrContent:'rejected',unavailablePrivateOrMissingSource:'rejected',fabricatedApproval:'rejected',workedExample:'330 minutes total; 30 minutes tolerance remains',activeArtifacts:'all release checksums unchanged'},limitations:['Named-term census plus bounded manual semantic review; no claim that absence of a keyword proves absence of all useful teaching.','Metadata aliases and inherited objectives do not establish dedicated teaching coverage.','Local effective source only; no browser, private-payload or live inspection.','Generated unused cards, public SEO pages and guest marketing demos are outside this bounded teaching slice.','All teaching links, primary/supporting roles and exact objective scope remain proposals.'],sha256:Object.fromEntries([packetPath,reportPath,'scripts/audit-pilot-teaching-drafts.mjs','docs/evidence/phase-2b5/mapping-package.json'].map(p=>[p,hash(p)]))};
const output=JSON.stringify(evidence,null,2)+'\n';
if(process.argv.includes('--write'))writeFileSync(evidencePath,output);else assert.equal(readFileSync(evidencePath,'utf8'),output,'Stale teaching evidence');
console.log(JSON.stringify({status:evidence.status,reusedLinks:5,newDrafts:3,eligibleEvidence:0,corpusSignature:evidence.corpusSignature,packetSha256:hash(packetPath)}));
