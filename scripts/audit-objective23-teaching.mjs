import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {readReviewTriage,hashFile,readJson,verifySourceBindings,assertSafeReviewExport} from './lib/content-mapping/review-triage.mjs';
import {contentSignature as sig} from './lib/read-learning-pilot-bank.mjs';
import {sourceUnit} from './lib/content-mapping/delivery-inventory.mjs';
const scriptPath='scripts/audit-objective23-teaching.mjs',packetPath='docs/drafts/phase-2b5-objective23-teaching-proposals.json',reportPath='docs/phase-2b5-objective23-teaching-review.md';
const basePath='docs/drafts/phase-2b5-social-engineering-flashcards-proposals.json',ledgerPath='docs/phase-2b5-question-review-ledger.json';
assert.equal(hashFile(basePath),'4858dd3d7960e4c2251805f770f4e0f827dabd93f68d8c904bd4f678cf315806');
const cardBasePath='docs/drafts/phase-2b5-cloud-threat-flashcards-proposals.json';
assert.equal(hashFile(cardBasePath),'eeb50ee864f56653d605c143d569dcfb3316ac47c2212fc2999b667bc5774d24');
const latestPath='docs/drafts/phase-2b5-objective22-glossary-proposals.json';
assert.equal(hashFile(latestPath),'33fd6f659c580ba51154c0cf4cbbb5aa3d60c0e0e2c5caa2661e8858986fb585');
const teachingBasePath='docs/drafts/phase-2b5-objective22-teaching-proposals.json';
assert.equal(hashFile(teachingBasePath),'173f2b3b1c86acfd2db1d457e498c4fd104a80a534660e957c1fb2e417c47cfe');
const applicationBasePath='docs/drafts/phase-2b5-application-software-flashcards-proposals.json';
assert.equal(hashFile(applicationBasePath),'ec82cab1c0703ef41097012f70dfed8dcb6c640e8615a9dd4661fd32eee06cd3');
const networkBasePath='docs/drafts/phase-2b5-network-wireless-flashcards-proposals.json';
assert.equal(hashFile(networkBasePath),'a262a9dc240ac06de49ace8a4719c6f3792e6b8816a0e7e6258621e21257e50c');
const newestPath='docs/drafts/phase-2b5-objective23-glossary-proposals.json';
assert.equal(hashFile(newestPath),'2409a2739f9505e1d5635d6b8f8c3e1f8cee2b6cc79508aa1d7079040f497e8a');
const c=readReviewTriage(),base=readJson(newestPath);
verifySourceBindings(base.sourceBindings);assert.deepEqual(readJson(ledgerPath),c.ledger);
const overlayPaths=['docs/drafts/phase-2b5-objective23-fastlane-proposals.json','docs/drafts/phase-2b5-objective23-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-second-mcqs-proposals.json','docs/drafts/phase-2b5-objective24-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective25-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective31-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-priority-mcqs-proposals.json','docs/drafts/phase-2b5-objective32-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective33-mcqs-proposals.json','docs/drafts/phase-2b5-objective41-mcqs-proposals.json','docs/drafts/phase-2b5-objective43-mcqs-proposals.json','docs/drafts/phase-2b5-objective48-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-mcqs-proposals.json','docs/drafts/phase-2b5-objective46-final-mcqs-proposals.json','docs/drafts/phase-2b5-objective45-mcqs-proposals.json','docs/drafts/phase-2b5-objective54-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-risk-mcqs-proposals.json','docs/drafts/phase-2b5-objective52-pilot-feedback-proposals.json','docs/drafts/phase-2b5-objective51-mcqs-proposals.json','docs/drafts/phase-2b5-objective53-55-assurance-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-proposals.json','docs/drafts/phase-2b5-final-local-mcqs-proposals.json','docs/drafts/phase-2b5-objective44-49-operations-pbqs-proposals.json','docs/drafts/phase-2b5-older-pbq-feedback-proposals.json','docs/drafts/phase-2b5-objective24-48-33-pbqs-proposals.json','docs/drafts/phase-2b5-objective43-45-46-pbqs-proposals.json','docs/drafts/phase-2b5-residual-supported-pbqs-proposals.json'];
for(const path of [...overlayPaths,basePath,cardBasePath,latestPath,teachingBasePath,applicationBasePath,networkBasePath,newestPath])for(const row of [...readJson(path).questionProposals,...readJson(path).explanationProposals,...(path===basePath||path===cardBasePath||path===latestPath||path===teachingBasePath||path===applicationBasePath||path===networkBasePath||path===newestPath?readJson(path).instructionalProposals:[])]){
 assert(!c.previous.has(row.recordId));assert.equal(row.publishedRecordSignature??row.sourceRevision,c.records.get(row.recordId).sourceSignature);c.previous.set(row.recordId,{path,row});
}
const legacyPrevious=new Map(c.previous);assert.equal(c.ledger.rows.filter(r=>legacyPrevious.has(r.recordId)).length,412);


// Inventory every substantive packet, including older dictionary-bound question-only judgments.
const inventory=[],olderQuestions=[],duplicateReferences=[],supportOnlyReferences=[];
for(const name of readdirSync('docs/drafts').filter(n=>n.startsWith('phase-2b5-')&&n.endsWith('.json')).sort()){
 const path='docs/drafts/'+name;if(path===packetPath)continue;const p=readJson(path);
 const arrays=['questionProposals','explanationProposals','instructionalProposals'];if(!arrays.some(k=>Array.isArray(p[k])))continue;
 const bindings=Array.isArray(p.sourceBindings)?p.sourceBindings:Object.entries(p.sourceBindings||{}).map(([path,sha256])=>({path,sha256}));verifySourceBindings(bindings);
 const rows=arrays.flatMap(k=>p[k]||[]);inventory.push({path,sha256:hashFile(path),substantiveRows:rows.length});
 for(const row of rows){
  const r=c.records.get(row.recordId);assert(r,'Missing prior record: '+row.recordId);assert.equal(row.publishedRecordSignature??row.sourceRevision,r.sourceSignature,'Prior source drift: '+row.recordId);
  const reference={recordId:row.recordId,kind:r.kind,sourceRevision:row.sourceRevision,publishedRecordSignature:r.sourceSignature,priorPacketPath:path,priorDispositionRevision:sig(row)};
  if(c.previous.has(row.recordId)){if(c.previous.get(row.recordId).path!==path)duplicateReferences.push(reference);continue;}
  if((p.questionProposals||[]).includes(row)){assert.equal(row.sourceRevision,r.localRevisionSignature);c.previous.set(row.recordId,{path,row});olderQuestions.push(reference);}
  else supportOnlyReferences.push({...reference,status:'link_or_context_only_not_full_current_feedback_or_unit_review'});
 }
}
assert.equal(inventory.length,80);assert.equal(olderQuestions.length,42);assert.equal(olderQuestions.filter(r=>r.kind==='mcq').length,30);assert.equal(olderQuestions.filter(r=>r.kind==='pbq').length,12);


assert.deepEqual(inventory.filter(r=>r.path!==newestPath),base.allPacketReconciliation.inventory);
assert.equal(duplicateReferences.length,22);assert.equal(supportOnlyReferences.length,7);
import {CONCEPT_DEEP_DIVES} from '../src/data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile,SY0701_BLUEPRINT} from '../src/data/sy0701DeepDiveMap.js';
import {LESSON_REVIEW} from '../src/data/sy0701LessonReview.js';
import {buildDeepDivePracticeQuestions,buildDeepDiveFlashcards} from '../src/lib/deepDiveStudy.js';
import {getDeepDiveRecommendations} from '../src/lib/deepDiveRecommendations.js';
import {SY0701_ACRONYM_SETS} from '../src/data/sy0701AcronymFlashcards.js';
import {readSelectors} from './lib/content-mapping/delivery-inventory.mjs';
assert.equal(c.previous.size,1195);
const slugs=['secure-software-applications','software-memory-concurrency'];
const groups=slugs.map(slug=>{
 const d=CONCEPT_DEEP_DIVES.find(d=>d.id===slug),profile=getSy0701DeepDiveProfile(d),generated=buildDeepDivePracticeQuestions(d);
 assert.equal(CONCEPT_DEEP_DIVES.filter(d=>d.id===slug).length,1);
 assert.deepEqual(profile.objectiveCodes,slug===slugs[0]?['2.3','4.1']:['2.3','2.5']);
 assert.equal(d.sections.length,3);assert.equal(d.traps.length,3);
 assert.deepEqual(profile.beyondSections,slug===slugs[0]?[]:[2]);assert.equal(profile.includesBeyondTextbook,slug===slugs[1]);
 assert.equal(generated.length,6);assert.equal(generated.slice(0,3).length,3);
 const values=new Map([['lesson:'+slug,{d,profile}],['keywords:'+slug,profile.keywordGuide],['traps:'+slug,d.traps],['check:'+slug,d.check],...generated.slice(0,3).map(q=>['practice:'+q.id,q]),...d.sections.map((s,i)=>['section:'+slug+':'+i,s])]);
 return{slug,d,profile,generated,values};
});
const values=new Map(groups.flatMap(g=>[...g.values])),candidateRecordIds=[...values.keys()].sort();assert.equal(values.size,20);
const censusSelection=base.objectiveCoverage['2.3'].census.filter(r=>r.status==='inventory_only_unreviewed'&&slugs.some(s=>r.recordId===`lesson:${s}`||r.recordId===`keywords:${s}`||r.recordId===`traps:${s}`||r.recordId===`check:${s}`||r.recordId.startsWith(`practice:${s}:practice-keyword-`)||r.recordId.startsWith(`section:${s}:`)));
assert.deepEqual(censusSelection.map(r=>r.recordId),candidateRecordIds);
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.kind))].sort().map(kind=>[kind,rows.filter(r=>r.kind===kind).length]));
assert.deepEqual(counts(censusSelection),{keyword_guide:2,lesson:2,lesson_check:8,lesson_section:6,lesson_traps:2});
for(const[id,value]of values){const r=c.records.get(id);assert.equal(sig(value),r.sourceSignature,'Delivered revision: '+id);assert.equal(censusSelection.find(a=>a.recordId===id).sourceRevision,r.sourceSignature);assert.equal(r.trustedRevisionId,null);assert(!c.previous.has(id));const slug=slugs.find(s=>id.includes(s));assert.equal(r.parentId??null,r.kind==='lesson'?null:'lesson:'+slug);}
const unit=(a,b)=>sourceUnit('src/App.jsx',a,b),lessonUnit=unit('function ConceptDeepDivesPage(','function FlashcardsPage('),bitesUnit=unit('function DeepDiveReadableBites(','function ConceptDeepDivesPage('),splitUnit=unit('function splitReadableSentences(','function expectedExamSeconds('),actionsUnit=unit('  const handleAddDeepDiveWeakTopicToReview=','  const handleGuestPbqPreview='),submitUnit=unit('  const submitPracticeAnswer=()=>{','  const savePracticeBest='),app=readFileSync('src/App.jsx','utf8'),lesson=lessonUnit.code;
for(const marker of ['!isPro&&id!==freePreviewDive?.id','if(isLockedDeepDive(openLessonRequest.lessonId))','if(isLockedDeepDive(id))','buildDeepDivePracticeQuestions(selectedDive).slice(0,3)','selectedDive.sections.map','setComparisonIndex(0)','activeSection.table.rows.map','activeComparisonRow.slice(1)','selectedProfile.keywordGuide.map','selectedDive.traps.map','setIsAnswerVisible(false)','Reveal model answer','practiceChoice===activePracticeQuestion.answer','secureplus-deep-dives-practice','secureplus-deep-dives-read','Math.max(Number(practiceBestScores[selectedDive.id])||0,percent)','activePracticeQuestion.options.filter(option=>option!==activePracticeQuestion.answer)','chapterId:selectedProfile.domainId','Mark complete'])assert(lesson.includes(marker),'Delivery drift: '+marker);
assert(app.includes('const FREE_DEEP_DIVE_PREVIEW_ID="web-social-dns-attacks";'));assert(!app.includes('buildDeepDiveFlashcards'));assert(app.includes('user={guestUser} onAddWeakTopicToReview={goToSignup}'));
assert(bitesUnit.code.includes('<GlossaryText text={item.first}')&&bitesUnit.code.includes('<GlossaryText text={item.rest}')&&bitesUnit.code.includes('Show supporting detail'));
assert(actionsUnit.code.includes('handleStartChapterReview(chapterId,{count:10')&&actionsUnit.code.includes('String(question.ch)===chapterKey&&accessible(question)'));
const feedbackCode=lesson.slice(lesson.indexOf('{practiceSubmitted&&('),lesson.indexOf('<div className="deep-dive-practice-actions">'));assert(feedbackCode.includes('activePracticeQuestion.explanation')&&feedbackCode.includes('optionFeedback')&&!feedbackCode.includes('isPro'));
const split=Function(splitUnit.code+';return splitReadableSentences;')(),submitPrefix=submitUnit.code.slice(submitUnit.code.indexOf('    if('),submitUnit.code.indexOf('    setPracticeResults')),grade=Function('activePracticeQuestion','practiceChoice','practiceSubmitted',submitPrefix+'return correct;');
// Execute only existing pure submit guards/equality; React, storage, telemetry and sound never run.
const practiceGradeProbes=groups.flatMap(g=>g.generated.slice(0,3).map(q=>{
 const results=q.options.map(o=>grade(q,o,false));assert.equal(results.filter(v=>v===true).length,1);assert.equal(results.filter(v=>v===false).length,q.options.length-1);
 assert.equal(grade(q,'',false),undefined);assert.equal(grade(q,q.answer,true),undefined);assert.equal(grade(null,q.answer,false),undefined);assert.equal(grade(q,'unknown-option',false),false);
 assert.equal(q.optionFeedback[q.answer],q.explanation);assert.equal(Object.keys(q.optionFeedback).length,g.profile.keywordGuide.length);assert(q.options.every(o=>q.optionFeedback[o]));
 return{recordId:'practice:'+q.id,parentRecordId:'lesson:'+g.slug,sourceRevision:sig(q),acceptedChoices:1,rejectedChoices:q.options.length-1,offeredChoiceCount:q.options.length,feedbackEntryCount:Object.keys(q.optionFeedback).length,feedbackBundleRevision:sig({explanation:q.explanation,optionFeedback:q.optionFeedback}),allOfferedFeedbackPresent:true,emptySubmissionBlocked:true,repeatSubmissionBlocked:true,absentQuestionBlocked:true,unknownChoiceRejectedByEquality:true,trustedScore:null,independentEvidence:false};
}));assert.deepEqual(practiceGradeProbes.map(p=>p.offeredChoiceCount),[3,3,3,3,3,3]);
const paragraphDelivery=groups.flatMap(g=>g.d.sections.flatMap((s,i)=>(s.body||[]).map((paragraph,j)=>{const sentences=split(paragraph);return{recordId:`section:${g.slug}:${i}`,fieldPath:`body[${j}]`,sourceRevision:sig(paragraph),firstVisibleRevision:sig(sentences[0]),collapsedDetailRevision:sig(sentences.slice(1).join(' ')),sentenceCount:sentences.length,delivery:'first_sentence_then_native_details',freshBrowserObserved:false};})));
const excludedHelpers=groups.flatMap(g=>[...g.generated.slice(3).map(q=>({recordId:'practice:'+q.id,sourceRevision:sig(q),status:'not_delivered'})),...buildDeepDiveFlashcards(g.d).map(card=>({recordId:'unused-card:'+card.id,sourceRevision:sig(card),status:'not_delivered'}))]);assert.equal(excludedHelpers.length,29);for(const r of excludedHelpers)assert(c.pkg.exclusions.some(e=>e.id===r.recordId&&e.sourceSignature===r.sourceRevision));
const selectorBindings=readSelectors().filter(s=>['deep-dive-recommendations','lesson-navigation','lesson-related-pbq'].includes(s.id)).map(s=>({recordId:'intervention:'+s.id,sourceRevision:s.sourceSignature,limitation:s.selector.mappingDependencies}));assert.equal(selectorBindings.length,3);for(const s of selectorBindings)assert.equal(s.sourceRevision,c.records.get(s.recordId).sourceSignature);
const lessonInspection=groups.map(g=>({recordId:'lesson:'+g.slug,sourceRevision:sig({d:g.d,profile:g.profile}),authoredLessonRevision:sig(g.d),profileRevision:sig(g.profile),authoredTitle:g.d.title,displayedTitle:g.profile.title,authoredSummaryRevision:sig(g.d.summary),displayedSummaryRevision:sig(g.profile.plainSummary),authoredSummaryReplacedInHeader:true,reviewNoteRevision:sig(LESSON_REVIEW[g.slug]),reviewNoteIsNotOverlayOrApproval:true,canonicalDomainObserved:g.profile.domainId,objectiveCodesObserved:g.profile.objectiveCodes,studyOrderObserved:g.profile.studyOrder,difficultyObserved:g.d.difficulty,difficultyCalibrated:false,guidedSteps:g.d.sections.length+3,keywordCount:g.profile.keywordGuide.length,bodyParagraphCounts:g.d.sections.map(s=>s.body?.length??0),comparisonRowsBySection:g.d.sections.map(s=>s.table?.rows.length??0),initialKeywordAndComparisonIndex:0,beyondSectionIndexes:g.profile.beyondSections,accessGate:'Pro_required_guest_free_access_prompt',sourcesDisclosureRequired:true,generatedQuestionCount:g.generated.length,displayedGeneratedCheckIds:g.generated.slice(0,3).map(q=>'practice:'+q.id),excludedComparisonChecks:3,excludedHelperCards:buildDeepDiveFlashcards(g.d).length,modelCheckIsRevealOnly:true,revealResetsOnStepOrLessonChange:true,feedbackAfterSubmissionOnly:true,additionalProFeedbackGateWithinAccessibleLesson:false,completionIsDeviceSelfMarkNotMastery:true,bestPercentageIsDeviceMaximumRecallScore:true,relatedDeckIdObserved:SY0701_ACRONYM_SETS.find(s=>s.objectiveCodes.some(code=>g.profile.objectiveCodes.includes(code))).id,relatedDeckAndPbqReviewedHere:false,chapterReviewCount:10,endActionsUseCoarseCanonicalDomain:true,guestReviewGoesToSignup:true,freshBrowserObserved:false,learnerHandlersExecuted:false}));
const literalUnits=[sourceUnit('src/data/conceptDeepDivesStudyGuide.js','  {\n    id: "secure-software-applications",','  {\n    id: "governance-change-vendors",'),sourceUnit('src/data/conceptDeepDivesPrinterGuide.js','  {\n    id: "software-memory-concurrency",','  {\n    id: "api-session-browser-security",')];
const profileUnits=groups.map((g,i)=>sourceUnit('src/data/sy0701DeepDiveMap.js',`  "${g.slug}": profile(`,i===0?'  "software-memory-concurrency": profile(':'  "api-session-browser-security": profile('));
const citation=(g,anchor,path=null)=>{
 const u=path==='src/data/sy0701DeepDiveMap.js'?profileUnits[slugs.indexOf(g.slug)]:literalUnits[slugs.indexOf(g.slug)];path=u.provenance.path;const within=u.code.indexOf(anchor);assert(within>=0,'Citation: '+anchor);const line=u.provenance.startLine+u.code.slice(0,within).split('\n').length-1;assert(readFileSync(path,'utf8').split('\n')[line-1].includes(anchor));return{path,line,anchorRevision:sig(anchor),fileSha256:hashFile(path),parentUnitRevision:u.provenance.sourceSignature};
};
const sourceChecks=candidateRecordIds.map(recordId=>{
 const g=groups.find(g=>g.values.has(recordId)),r=c.records.get(recordId),value=values.get(recordId),isPractice=recordId.startsWith('practice:'),isSection=recordId.startsWith('section:'),sectionIndex=isSection?Number(recordId.split(':').at(-1)):null;
 const anchor=recordId.startsWith('lesson:')?`id: "${g.slug}"`:recordId.startsWith('keywords:')?`"${g.slug}": profile(`:recordId.startsWith('traps:')?'    traps: [':recordId.startsWith('check:')?'    check: {':isSection?`title: "${value.title}"`:`"${g.slug}": profile(`;
 const sourceCitations=[citation(g,anchor,recordId.startsWith('keywords:')||isPractice?'src/data/sy0701DeepDiveMap.js':'src/data/conceptDeepDives.js')];
 if(isPractice)sourceCitations.push({...sourceUnit('src/lib/deepDiveStudy.js','  const keywordQuestions =','  const comparisonQuestions =').provenance,fileSha256:hashFile('src/lib/deepDiveStudy.js')});
 const subunitValues=isSection?[...(value.body||[]).map((v,i)=>({fieldPath:`body[${i}]`,sourceRevision:sig(v)})),...(value.table?.rows||[]).map((v,i)=>({fieldPath:`table.rows[${i}]`,sourceRevision:sig(v)}))]:r.kind==='keyword_guide'?value.map((v,i)=>({fieldPath:`keywordGuide[${i}]`,sourceRevision:sig(v)})):r.kind==='lesson_traps'?value.map((v,i)=>({fieldPath:`traps[${i}]`,sourceRevision:sig(v)})):r.kind==='lesson_check'?isPractice?[{fieldPath:'entire_generated_check',sourceRevision:sig(value)},{fieldPath:'feedback_bundle',sourceRevision:sig({explanation:value.explanation,optionFeedback:value.optionFeedback})}]:[{fieldPath:'reveal_prompt',sourceRevision:sig(value.question)},{fieldPath:'revealed_response',sourceRevision:sig(value.answer)}]:[{fieldPath:'authored_lesson',sourceRevision:sig(g.d)},{fieldPath:'effective_profile',sourceRevision:sig(g.profile)}];
 return{recordId,kind:r.kind,parentRecordId:r.parentId??null,sourceRevision:sig(value),publishedRecordSignature:r.sourceSignature,objectiveCodesObserved:r.objectiveCodes,precisionObserved:r.precision,sectionIndexObserved:sectionIndex,scopeObserved:r.scope??null,sourceCitations,subunits:subunitValues,trustedRevisionObserved:null,sourcePrecedence:isPractice?'local_profile_guide_then_helper_then_first_three_display_only':r.kind==='keyword_guide'?'local_profile_examKeywords_then_SY0701_KEYWORD_DEFINITIONS':'unique_local_lesson_literal_no_question_override;profile_replaces_header;review_note_not_overlay'};
});
const software=slugs[0],memory=slugs[1],semantics=new Map();
const add=(id,meaning,limits,names=[],held=false)=>semantics.set(id,{meaning,limits,names,held});
const guideLinks=[['injection','xss','secure-baseline'],['buffer-overflow','hardening']];
const links=names=>names.map(name=>{const conceptId='sy0701.term.'+name;assert.equal(c.pkg.concepts.find(n=>n.id===conceptId)?.nodeKind,'supporting_concept');return{conceptId,role:'instructional_support_only',weight:0,status:'candidate_pending_owner_no_canonical_approval'};});
const commonLimits='Bounded partial content proposal only. Parent objective unions, Applied labels, reviewed badges and vetted-reference UI copy are not precise child scope, calibrated difficulty or owner approval. No independent assessment family, trusted score, intervention completion or mastery evidence.';
add('lesson:'+software,'Partial navigation container for interpreter confusion, browser/file/request boundaries and secure development.',[
 'Effective profile title and summary replace the authored header; the phrase control that prevents it is an instructional promise, not a verified universal defense.',
 'API object/property/function authorization, session lifetime/replay and authentication are not substantively taught here. Safe APIs means construction APIs, not proof of secure HTTP API access.',
 'No child, linked card or glossary is approved by association; candidate support is conditional on opening the relevant step and details.'
],['injection','xss','secure-baseline']);
add('keywords:'+software,'Three useful vocabulary definitions distinguish interpreter execution, browser script execution and maintained configuration.',[
 'Injection is a broad category and XSS is a specific browser context; offered terms are not mutually exclusive vulnerability families.',
 'Secure baseline vocabulary is accurate but not a developed baseline establishment/verification lesson. Whole-guide references do not reveal an assessed response mapping.'
],guideLinks[0]);
add('traps:'+software,'Useful warnings separate validation from safe construction/output, file location from interpreter execution, and sandbox restriction from complete safety.',[
 'Escaping and encoding depend on the actual interpreter/output context; a single generic encoding rule is insufficient.',
 'No sandbox policy, bypass resistance, least-privilege configuration or repaired application is demonstrated.'
],['injection','xss']);
add('check:'+software,'A reveal-only example correctly separates concatenated SQL syntax from a safely bound data value.',[
 'The check accepts no response and grades nothing. A main reveal is not a trusted assessment or independent family.',
 'Prepared statements separate bound values from query structure; table/column identifiers and dynamic fragments need other safe construction. Changing a legitimate bound value may change results without injection.',
 'Useful SQL teaching does not fix the two separately held glossary entries.'
],['injection']);
add('section:'+software+':0','Seven reachable comparison rows orient learners to interpreter, browser, path, memory, XML and request boundaries.',[
 'The default shows row0 only. All rows are source-reachable through controls, not observed learner visits.',
 'The buffer row mixes root-cause controls with ASLR/DEP exploit mitigations; interpret it alongside the memory lesson distinction, not as interchangeable complete fixes.',
 'XML injection is broad parser/data behavior, not a canonical equivalence with XXE or XPath injection. SQL, shell and LDAP safe APIs have different grammars.',
 'SSRF includes unintended server-originated destinations/protocols; mere user influence is not necessarily a vulnerability. URL parsing, redirects and egress policy matter.',
 'CSRF shorthand needs credential eligibility and unwanted request intent; it is not XSS, object authorization or universal login/session coverage. SameSite and origin checks need applicable premises.'
],['injection','xss','buffer-overflow']);
add('section:'+software+':1','Explain structural validation, exact output context and controlled file selection, with layered supporting controls.',[
 'Output contexts and the stronger opaque-file-identifier approach are initially collapsed; first-sentence exposure alone does not deliver them.',
 'Canonicalization alone can leave traversal/symlink/TOCTOU issues; enforce the intended boundary on the resource actually accessed. HTML/URL/JS/CSS contexts require their own safe sinks or encoding.',
 'WAF, CSP, sandboxing and monitoring depend on configuration/visibility and do not justify leaving a known injection path.'
],['injection','xss']);
add('section:'+software+':2','Explain design threat modeling, complementary review/testing methods and protection of development/release provenance.',[
 'Peer review and SAST/DAST/SCA distinctions, dependency maintenance and signing/build trust are initially collapsed.',
 'No single technique proves absence of flaws. A signature establishes limited origin/integrity under signer/build trust, not harmlessness.',
 'NIST SSDF publication abstract supports lifecycle integration; its entire PDF controls and a specific compliant SDLC are not audited.'
]);
add('lesson:'+memory,'Partial navigation container separating memory bounds, arithmetic, pointers, concurrency and resource budgets.',[
 'Preserve all three held generated practice rows and the limited race guide entry; the stronger section teaching does not repair a derived clue/feedback bundle.',
 'Section2 is visibly labelled Beyond the textbook and remains optional enrichment, not approved precise exam scope.',
 'The broader profile/header, inherited objectives2.3/2.5 and completion badge do not approve every child or the held Buffer Overflow/Race Condition cards.'
],['buffer-overflow','race-condition','hardening']);
add('keywords:'+memory,'Partial vocabulary guide: useful buffer-bounds and hardening meanings, with an insufficient race-definition entry.',[
 'The race entry describes unsafe ordering/time without shared state, concurrent/interfering access or synchronization premises. Ordinary sequential ordering mistakes can fit that wording.',
 'Qualify the guide as a partial container for the two useful meanings only; no race-entry content approval or generated practice/feedback approval transfers.',
 'Buffer writing beyond allocated space does not imply every overflow produces code execution, and hardening is distinct from root-cause memory/concurrency repair.'
],guideLinks[1]);
add('traps:'+memory,'Useful distinctions separate timing/synchronization from a particular crash, arithmetic failure from buffer bounds, and exploit mitigation from root-cause repair.',[
 'Race effects depend on shared-state interleaving and can include many outcomes; null dereference is neither necessary nor sufficient.',
 'ASLR/DEP reduce selected exploitation paths; neither supplies correct bounds or atomicity. Integer overflow can contribute to an out-of-bounds access without being identical.'
],['buffer-overflow','race-condition']);
add('check:'+memory,'A reveal-only resource-swap sequence supports a TOCTOU classification with invalidated check/use binding.',[
 'An intervening path/resource change is stated; ordinary slow execution without interference is not enough. Bind the permission check and use to the same resource.',
 'No learner response or grading occurs. This authored reveal example is teaching context, not a trusted assessment or independently calibrated scenario.',
 'A better TOCTOU example does not repair the held race card or keyword-generated feedback.'
],['race-condition']);
add('section:'+memory+':0','Six reachable rows distinguish failed bounds, integer representation, valid references, concurrent state, lifecycle release and resource budgets.',[
 'The Broken assumption column names the intended invariant in positive form; learners must read that invariant as violated, not confuse it with the flaw itself.',
 'Code execution is a possible contextual outcome, not every buffer overflow. Null dereference usually crashes but its impact is contextual.',
 'Resource exhaustion is broader than a memory leak; uncontrolled CPU, handles, queues or bandwidth need separate limits. Failure classification is not unique incident attribution.',
 'Undisplayed comparison helpers reuse positive invariant clues; they gain no delivery/content credit and are not rewritten here.'
],['buffer-overflow','race-condition']);
add('section:'+memory+':1','Explain shared-state concurrency, invalidated TOCTOU checks and binding check/use with applicable atomicity and synchronization.',[
 'The first paragraph initially teaches concurrency/shared state; TOCTOU and multiple possible consequences are collapsed.',
 'The second paragraph first names binding; the warning against another pathname check, realistic parallel tests and ineffective delays is collapsed.',
 'Safe handles, locks or transactions are conditional mechanisms; they must cover the actual resource and relevant concurrent actors, with failures handled. Naming them proves no repaired program.'
],['race-condition']);
add('section:'+memory+':2','Optional enrichment layers safer memory/arithmetic/resource handling, complementary tests and exploitation mitigations.',[
 'This delivered section is explicitly Beyond the textbook. No generated comparison exercise is created from it and no precise objective approval is inferred.',
 'Testing and ASLR/NX/canary/control-flow distinctions start in the second paragraph; most mitigation detail is collapsed. Distinguish deployment-dependent mitigation from bug repair.',
 'Bounds/arithmetic checks precede allocation/copying; quotas/timeouts/backpressure address resource budgets. No fuzzing, sanitizer, concurrency test, compiler mitigation or real exploit runs.'
],['buffer-overflow','hardening']);
for(const g of groups)for(let i=0;i<3;i++){
 const held=g.slug===memory;
 add(`practice:${g.slug}:practice-keyword-${i}`,held?'The complete generated check/feedback unit repeats an incomplete race definition.':'Derived recognition from the same three-entry keyword guide, with the entire offered feedback set inspected.',held?[
  'ZERO CREDIT for this whole unit: all three offered feedback sets include the race entry without shared-state/concurrent-interference premises. Its own race clue also omits them.',
  'The other definitions remain useful vocabulary, but qualifying a whole feedback-bearing check would silently approve the insufficient entry. Strengthen the source guide and regenerate/re-review all affected checks.',
  'Useful memory sections cannot overwrite this exact generated revision. Local equality success and repeated definitions supply no independent assessment or mastery.'
 ]:[
  'Every offered choice has a feedback entry; after submission the selected definition and alternative definitions repeat guide material rather than authored misconception feedback.',
  'Broad injection and browser-specific XSS are related, not independent mutually exclusive families. This is vocabulary recognition under offered choices, not comprehensive vulnerability discrimination.',
  'Whole-guide context only; no selected term, answer-linked mapping, indexed choice, canonical assessed role, trusted score or independent family is exported.'
 ],held?[]:guideLinks[0],held);
}
assert.equal(semantics.size,20);
const selectedIds=new Set(sourceChecks.filter(r=>!semantics.get(r.recordId).held).map(r=>r.recordId));assert.equal(selectedIds.size,17);
const instructionalProposals=sourceChecks.filter(r=>selectedIds.has(r.recordId)).map(r=>{
 const g=groups.find(g=>g.values.has(r.recordId)),s=semantics.get(r.recordId),practice=r.recordId.startsWith('practice:');
 return{...r,status:'CODEX_TEACHING_PROPOSAL_PENDING_OWNER_APPROVAL',proposalType:'bounded_content_and_candidate_support_links',teachingUnderstanding:s.meaning,contentQualification:commonLimits,qualificationHolds:s.limits,roleProposal:null,deliveryRoleObserved:r.kind==='lesson'?'navigation_container':r.recordId.startsWith('check:')?'model_response_reveal_only':practice?'same_guide_derived_recognition':'partial_instruction',objectiveScopeProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],assessedCanonicalRoleProposals:[],conceptLinkProposals:links(s.names),newTeachingContentProposalCredit:1,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0,masteryWeight:0,trustedRevisionId:null,humanApproved:false,published:false,independentEvidence:false,canonicalApprovalTransferred:false,deliveryGate:r.recordId.startsWith('check:')?'accessible_lesson_check_step_then_reveal':practice?'accessible_lesson_practice_choice_then_submit_for_feedback':'existing_access_gate_then_corresponding_guided_step',...(practice?{guideContextReference:{recordId:'keywords:'+g.slug,sourceRevision:sig(g.profile.keywordGuide)},familyRelation:'same_whole_keyword_guide_not_independent',feedbackBundleRevision:practiceGradeProbes.find(p=>p.recordId===r.recordId).feedbackBundleRevision}:{}),postMissUsefulnessProposal:{status:'conditional_support_not_validated_recovery',approvedRemediation:false,weight:0}};
});
const deferredSelectedRows=sourceChecks.filter(r=>!selectedIds.has(r.recordId)).map(r=>({...r,status:'ZERO_CREDIT_TEACHING_AND_FEEDBACK_DEFERRED',reason:semantics.get(r.recordId).meaning,qualificationHolds:semantics.get(r.recordId).limits,roleProposal:null,objectiveScopeProposal:null,primaryConceptProposal:null,secondaryConceptProposals:[],assessedCanonicalRoleProposals:[],conceptLinkProposals:[],newTeachingContentProposalCredit:0,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0,masteryWeight:0,trustedRevisionId:null,humanApproved:false,published:false,independentEvidence:false,canonicalApprovalTransferred:false}));
assert.deepEqual(deferredSelectedRows.map(r=>r.recordId),[0,1,2].map(i=>`practice:${memory}:practice-keyword-${i}`));
const preservedHolds=base.preservedHolds,preservedRecentSemanticDeferrals=base.preservedRecentSemanticDeferrals,preservedCardDeferrals=base.preservedCardDeferrals,preservedGlossaryDeferrals=[...base.preservedGlossaryDeferrals,...base.deferredSelectedRows],preservedTeachingDeferrals=base.preservedTeachingDeferrals;
assert.equal(preservedCardDeferrals.length,10);assert.equal(preservedGlossaryDeferrals.length,4);assert.equal(preservedTeachingDeferrals.length,2);
for(const rows of [preservedRecentSemanticDeferrals,preservedCardDeferrals,preservedGlossaryDeferrals,preservedTeachingDeferrals])for(const r of rows){assert.equal(r.publishedRecordSignature??r.sourceRevision,c.records.get(r.recordId).sourceSignature);assert(!c.previous.has(r.recordId)&&!selectedIds.has(r.recordId));}
for(const r of base.unsupportedDesignBoundary.rows){assert.equal(r.newQuestionCredit,0);assert.equal(r.newFeedbackCredit,0);assert(!c.previous.has(r.recordId)&&!selectedIds.has(r.recordId));}
for(const recordId of ['private:pbq:p003','private:explanation:pbq:p003','private:pbq:p017','private:explanation:pbq:p017']){assert.equal(c.records.get(recordId).trustedRevisionId,null);assert(!c.previous.has(recordId)&&!selectedIds.has(recordId));}
const priorCensus=new Map(base.catalogueCensus.map(r=>[r.recordId,r]));
const heldIds=new Set([...preservedRecentSemanticDeferrals,...preservedCardDeferrals,...preservedGlossaryDeferrals,...preservedTeachingDeferrals,...deferredSelectedRows,...base.unsupportedDesignBoundary.rows].map(r=>r.recordId));
const censusRow=r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,status:c.previous.has(r.id)?'prior_agent_disposition_pending_owner':selectedIds.has(r.id)?'new_teaching_proposal_pending_owner':heldIds.has(r.id)||priorCensus.get(r.id)?.status.startsWith('zero_credit')?'zero_credit_prior_or_selected_hold':'inventory_only_unreviewed'});
const affectedCodes=[...new Set([...Object.keys(base.objectiveCoverage),...sourceChecks.flatMap(r=>r.objectiveCodesObserved)])].sort(),objectiveCoverage={};
for(const code of affectedCodes){const broad=c.pkg.records.filter(r=>r.objectiveCodes.includes(code)),prior=broad.filter(r=>c.previous.has(r.id)),fresh=broad.filter(r=>selectedIds.has(r.id)),remaining=broad.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id));assert.equal(prior.length,base.objectiveCoverage[code]?.denominator.combinedPendingDispositions??base.catalogueCensus.filter(r=>c.previous.has(r.recordId)&&c.records.get(r.recordId).objectiveCodes.includes(code)).length);
 objectiveCoverage[code]={denominator:{broadCandidates:broad.length,allPacketPriorDispositions:prior.length,newTeachingProposals:fresh.length,newQuestionDispositions:0,newFeedbackDispositions:0,newCardDispositions:0,newDeckDispositions:0,combinedPendingDispositions:prior.length+fresh.length,remaining:remaining.length,remainingLocal:remaining.filter(r=>!r.id.startsWith('private:')).length,remainingPrivate:remaining.filter(r=>r.id.startsWith('private:')).length,priorByKind:counts(prior),newByKind:counts(fresh),remainingByKind:counts(remaining)},census:broad.map(censusRow),remainingRecordIds:remaining.map(r=>r.id)};
}
assert.deepEqual([objectiveCoverage['2.3'].denominator.broadCandidates,objectiveCoverage['2.3'].denominator.allPacketPriorDispositions,objectiveCoverage['2.3'].denominator.newTeachingProposals,objectiveCoverage['2.3'].denominator.remaining],[162,105,17,40]);
const memberships=new Map();for(const[code,v]of Object.entries(objectiveCoverage))for(const r of v.census)memberships.set(r.recordId,[...(memberships.get(r.recordId)||[]),code]);for(const r of sourceChecks)assert.deepEqual([...memberships.get(r.recordId)].sort(),[...r.objectiveCodesObserved].sort());
const sharedObjectiveRecords=[...memberships].filter(([recordId,codes])=>codes.length>1).map(([recordId,objectiveCodesObserved])=>({recordId,objectiveCodesObserved}));
const catalogueByKind=Object.keys(counts(c.pkg.records)).map(kind=>{const rs=c.pkg.records.filter(r=>r.kind===kind),prior=rs.filter(r=>c.previous.has(r.id)).length,fresh=rs.filter(r=>selectedIds.has(r.id)).length;return{kind,total:rs.length,prior,new:fresh,combined:prior+fresh,remaining:rs.length-prior-fresh};});
const supportKinds=base.supportProgress.kindScope,sum=key=>catalogueByKind.filter(r=>supportKinds.includes(r.kind)).reduce((n,r)=>n+r[key],0);
const supportProgress={kindScope:supportKinds,denominator:sum('total'),priorFullDispositions:sum('prior'),newQualifiedTeachingProposals:sum('new'),combinedPending:sum('combined'),remaining:sum('remaining'),limitedPriorReferencesStillUnreviewed:6,newQuestionJudgments:0,newFeedbackJudgments:0,newCardJudgments:0,newDeckJudgments:0};assert.deepEqual([supportProgress.denominator,supportProgress.priorFullDispositions,supportProgress.combinedPending,supportProgress.remaining],[834,294,311,523]);
assert.deepEqual(catalogueByKind.find(r=>r.kind==='glossary_definition'),{kind:'glossary_definition',total:162,prior:93,new:0,combined:93,remaining:69});assert.deepEqual(catalogueByKind.find(r=>r.kind==='flashcard'),{kind:'flashcard',total:313,prior:95,new:0,combined:95,remaining:218});assert.deepEqual(catalogueByKind.find(r=>r.kind==='deck_container'),{kind:'deck_container',total:29,prior:6,new:0,combined:6,remaining:23});
const bankProgress=base.bankProgress;assert.equal(c.ledger.rows.filter(r=>c.previous.has(r.recordId)).length,454);assert.equal(c.ledger.rows.filter(r=>c.previous.has('explanation:'+r.recordId)).length,447);assert.equal(bankProgress.completePairs,447);
const catalogueCensus=c.pkg.records.map(censusRow),remainingCatalogueRecordIds=c.pkg.records.filter(r=>!c.previous.has(r.id)&&!selectedIds.has(r.id)).map(r=>r.id);assert.equal(remainingCatalogueRecordIds.length,666);assert.equal(new Set(catalogueCensus.map(r=>r.recordId)).size,1878);
const instructionalOccurrences=inventory.flatMap(({path})=>(readJson(path).instructionalProposals||[]).map(row=>({recordId:row.recordId,kind:c.records.get(row.recordId).kind,priorPacketPath:path,sourceRevision:c.records.get(row.recordId).sourceSignature,priorDispositionRevision:sig(row),fullPriorDisposition:c.previous.has(row.recordId)})));
const distinctInstructional=new Map(instructionalOccurrences.map(r=>[r.recordId,r]));assert.equal(instructionalOccurrences.length,313);assert.equal(distinctInstructional.size,305);const limitedInstructionalReferences=[...distinctInstructional.values()].filter(r=>!r.fullPriorDisposition);assert.equal(limitedInstructionalReferences.length,6);assert(candidateRecordIds.every(id=>!distinctInstructional.has(id)));
const instructionalReconciliation={occurrences:instructionalOccurrences,rawPriorRows:313,distinctPriorRecords:305,duplicatePriorOccurrences:8,limitedInstructionalReferences,newQualifiedRows:17,combinedRawRows:330,combinedDistinctRecords:322,limitedLinksUpgraded:0,newCandidateAlreadyPresent:0};
const priorGlossaryDispositions=c.pkg.records.filter(r=>r.kind==='glossary_definition'&&c.previous.has(r.id)).map(r=>({recordId:r.id,sourceRevision:r.sourceSignature,definitionRevision:r.definitionSignature,priorPacketPath:c.previous.get(r.id).path,priorDispositionRevision:sig(c.previous.get(r.id).row),approvalTransferred:false}));assert.equal(priorGlossaryDispositions.length,93);
const overlapCodes=['2.3','2.5','4.1'];
const priorOverlapReferences=c.pkg.records.filter(r=>r.objectiveCodes.some(code=>overlapCodes.includes(code))&&c.previous.has(r.id)).map(r=>({recordId:r.id,kind:r.kind,sourceRevision:r.sourceSignature,objectiveCodesObserved:r.objectiveCodes,priorPacketPath:c.previous.get(r.id).path,priorDispositionRevision:sig(c.previous.get(r.id).row),relation:'broad_metadata_overlap_reference_only_not_new_equivalence',ownerApprovalTransferred:false,newGlobalCredit:0}));
const detailedComparisons=[['m012',software,0,'Query syntax/data distinction supports conditional rereading; the reveal is not the same assessment or observed recovery.'],['m053',memory,0,'Buffer bounds differ from query/browser execution; possible code execution is not inevitable. Preserve prior feedback qualifiers and card hold.'],['m287',memory,2,'Optional enrichment distinguishes root-cause prevention from exploit mitigation; neither card repair nor calibrated transfer is demonstrated.'],['m612',memory,1,'Shared-state synchronization is actually taught in the section. The same broad topic does not repair its incomplete generated guide/feedback or held race card.'],['m248',memory,1,'An intervening resource swap supplies TOCTOU premises. The reveal shares that instructional motif and is not a new independent evidence family.'],['m165',memory,2,'Optional DEP/NX versus ASLR discussion is contextual support; no runtime/compiler mitigation or new question/feedback approval.'],['m723',software,0,'CSRF request intent/credential eligibility differs from SQL interpreter syntax and XSS; the short table is limited support, not session/authentication coverage.'],['m052',software,0,'Negative comparison: authenticated object access needs server-side authorization, which these two selected lessons do not develop. The API lesson remains inventory-only.']].map(([id,slug,index,limitation])=>{
 const q=c.questions.get('mcq:'+id);assert(q);const prior=c.previous.get(q.record.id),fb=c.previous.get(q.feedback.id);assert(prior&&fb);
 return{questionRecordId:q.record.id,sourceRevision:q.record.sourceSignature,localRevision:sig(q.q),feedbackRecordId:q.feedback.id,feedbackRevision:q.feedback.sourceSignature,priorPacketPath:prior.path,priorDispositionRevision:sig(prior.row),priorFeedbackPacketPath:fb.path,priorFeedbackDispositionRevision:sig(fb.row),lessonRecordId:'lesson:'+slug,lessonRevision:sig(values.get('lesson:'+slug)),sectionRecordId:`section:${slug}:${index}`,sectionRevision:sig(values.get(`section:${slug}:${index}`)),limitation,rankedLessons:getDeepDiveRecommendations([q.q],{limit:2}).map(l=>({lessonId:l.id,score:l.score,evidenceCount:l.evidenceCount})),route:'existing_MCQ_miss_selector_rank_not_guaranteed_target',approvedRemediation:false,newQuestionCredit:0,newFeedbackCredit:0,newFamilyCredit:0,learnerObservedRecovery:false};
});
assert.equal((app.match(/getDeepDiveRecommendations\(/g)||[]).length,3);assert(app.includes('primaryWeakAction?.missedQuestions||[],{limit:2}')&&app.includes('sessionMissedQuestions,{limit:2}')&&app.includes('sessionMissedQuestions.filter(question=>question.ch===item.chapter.id)'));
const apiDive=CONCEPT_DEEP_DIVES.find(d=>d.id==='api-session-browser-security'),apiProfile=getSy0701DeepDiveProfile(apiDive);
assert.equal(sig({d:apiDive,profile:apiProfile}),c.records.get('lesson:'+apiDive.id).sourceSignature);assert(!c.previous.has('lesson:'+apiDive.id)&&!selectedIds.has('lesson:'+apiDive.id));
const apiContextBoundary={recordId:'lesson:'+apiDive.id,sourceRevision:c.records.get('lesson:'+apiDive.id).sourceSignature,sourceUnit:sourceUnit('src/data/conceptDeepDivesPrinterGuide.js','  {\n    id: "api-session-browser-security",','  {\n    id: "dns-time-management-security",').provenance,status:'inventory_only_context_comparison_not_selected',observation:'Separate API lesson distinguishes authentication from object/property/function permissions and session tokens from CSRF/replay/browser controls. Its useful teaching cannot be transferred to these two selected lessons.',newTeachingContentProposalCredit:0,ownerApprovalTransferred:false,accessOrServerControlsExecuted:false};
const independentHoldBindings=[...preservedCardDeferrals.filter(r=>r.recordId.includes('buffer-overflow')||r.recordId.includes('race-condition')),...preservedGlossaryDeferrals.filter(r=>['glossary:sqli','glossary:sql%20injection'].includes(r.recordId))].map(r=>({recordId:r.recordId,sourceRevision:r.sourceRevision,definitionRevision:r.definitionRevision??null,heldDispositionRevision:sig(r),reason:r.reason,holdsResolved:false,accuracyApprovalTransferred:false,newContentCredit:0}));assert.equal(independentHoldBindings.length,4);
assert.deepEqual(independentHoldBindings.map(r=>r.sourceRevision),['sha256:9d5a25c4a672c2474e7547e10bff010dc08a57ba35c7e023968b7daf7bc5b2ba','sha256:632899030c6679af1d00bc90dd7d3f915546ac327e7317d1834d5f3904de600a','sha256:909f227de99d25202e56848a2ba7f3543e8e3f96bde902dcd5d7c2468dfa7110','sha256:87b715a70e29d6d69c740fda8937ddef73413a2ee2758c3952f69d511231605f']);
const externalReferences=[
 {url:SY0701_BLUEPRINT.sourceUrl,status:'official_v7_scope_verified_in_continuing_session',claimScope:'Observed2.3 vulnerabilities,2.5 mitigations and4.1 hardening are broad inherited context; no precise child-scope approval.'},
 {url:'https://owasp.org/www-project-top-ten/',status:'2025_release_label_verified_project_index_only',claimScope:'Current project page confirms2025; not complete review of that edition or every taxonomy mapping.'},
 {url:'https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html',status:'introduction_forms_and_prepared_statement_sections_verified',claimScope:'Interpreter-specific code/data separation; no tested application or universal safe API.'},
 {url:'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',status:'prepared_statement_code_data_distinction_verified_in_continuing_session',claimScope:'Bound data differs from executable query structure; dynamic identifiers/fragments require separate construction.'},
 {url:'https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html',status:'safe_sink_context_sections_verified_in_continuing_session',claimScope:'Output context and safe sinks; no executed payload or arbitrary markup certification.'},
 {url:'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html',status:'context_cases_verified_in_continuing_session',claimScope:'Unintended server-originated interaction, parser/destination/egress premises; not all influenced requests malicious.'},
 {url:'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',status:'SameSite_limitations_verified_in_continuing_session',claimScope:'Credential eligibility and action intent; browser/session/authentication/object permissions remain distinct.'},
 {url:'https://cwe.mitre.org/data/definitions/787.html',status:'primary_search_index_description_verified_direct_body_reopens_failed',claimScope:'Writes outside intended buffer; indexed description and consequences only, no full mapping-note review.'},
 {url:'https://cwe.mitre.org/data/definitions/190.html',status:'description_consequences_verified',claimScope:'Arithmetic representation overflow/wraparound can lead to wrong allocation or memory access, not synonymous with buffer overflow.'},
 {url:'https://cwe.mitre.org/data/definitions/362.html',status:'description_extended_description_and_examples_verified',claimScope:'Concurrent shared-resource timing/ordering and synchronization; ordinary sequential ordering is insufficient.'},
 {url:'https://cwe.mitre.org/data/definitions/367.html',status:'description_check_use_resource_change_verified',claimScope:'Resource change invalidates prior check; not every race is TOCTOU and not every symlink issue is TOCTOU.'},
 {url:'https://cwe.mitre.org/data/definitions/400.html',status:'description_consequences_and_mitigation_overview_verified',claimScope:'Control allocation/maintenance of limited resources; not only memory leaks and not proof of actual quotas.'},
 {url:'https://learn.microsoft.com/en-us/defender-endpoint/exploit-protection-reference',status:'DEP_ASLR_sections_verified_in_continuing_session',claimScope:'Page execution protection versus address randomization; mitigations depend on implementation and do not repair underlying bugs.'},
 {url:'https://csrc.nist.gov/pubs/sp/800/218/final',status:'publication_version1_1_and_abstract_verified_only',claimScope:'High-level secure development integrated into lifecycle; complete PDF and individual SSDF control compliance not reviewed.'},
 {url:'https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/',status:'object_permission_checks_verified',claimScope:'Authentication does not prove permission for object/action; random IDs not permission enforcement. Context comparison only.'},
 {url:'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',status:'primary_index_introduction_binding_verified',claimScope:'Session identity binds authentication and appropriate access controls; not a replacement for authorization or CSRF defenses. Context comparison only.'}
].map(r=>({...r,verifiedAt:'2026-10-12',primarySource:true,approvalTransferred:false}));
const protectedHashes=readJson('docs/evidence/phase-2b5/release-checksums.json').files;assert.equal(Object.keys(protectedHashes).length,25);verifySourceBindings(Object.entries(protectedHashes).map(([path,sha256])=>({path,sha256})));
assert.equal(hashFile(ledgerPath),'e0ceeec3c5cc8adb94b36175954a8cefaebcb4f29f4c66aa38c400f65de3bb12');assert.equal(hashFile('docs/evidence/phase-2b5/mapping-package.json'),'056c891376cbeaf273e8f8b5c740699ac645c85476b852d8bd8ee0c3c659de97');
const sourceBindings=[...new Map([...base.sourceBindings,...inventory.map(r=>({path:r.path,sha256:r.sha256})),...[newestPath,'docs/phase-2b5-objective23-glossary-review.md','scripts/audit-objective23-glossary.mjs',scriptPath,'src/App.jsx','src/data/conceptDeepDives.js','src/data/conceptDeepDivesStudyGuide.js','src/data/conceptDeepDivesPrinterGuide.js','src/data/sy0701DeepDiveMap.js','src/data/sy0701LessonReview.js','src/lib/deepDiveStudy.js','src/lib/deepDiveRecommendations.js'].map(path=>({path,sha256:hashFile(path)}))].map(b=>[b.path,b])).values()];verifySourceBindings(sourceBindings);
const packet={schemaVersion:1,status:'LOCAL_CODEX_TEACHING_PROPOSALS_NOT_READY',baselineCommit:'79075744cf7a9ade107269a6bbec81175f9322e2',selectionPolicy:'Exactly20 latest objective2.3 inventory-only software teaching identities;17 bounded drafts and3 incomplete memory-feedback checks deferred at zero credit',authority:base.authority,sourceBindings,triageLedgerBinding:base.triageLedgerBinding,allPacketReconciliation:{inventory,olderQuestions,duplicateReferences,supportOnlyReferences},instructionalReconciliation,priorGlossaryDispositions,candidateRecordIds,selectedRecordIds:[...selectedIds],sourceChecks,instructionalProposals,questionProposals:[],explanationProposals:[],deferredSelectedRows,lessonInspection,paragraphDelivery,practiceGradeProbes,excludedHelpers,authoredSourceUnits:[...literalUnits,...profileUnits].map(u=>u.provenance),deliverySourceUnits:[lessonUnit,bitesUnit,splitUnit,actionsUnit,submitUnit].map(u=>u.provenance),selectorBindings,priorOverlapReferences,detailedComparisons,apiContextBoundary,independentHoldBindings,externalReferences,objectiveCoverage,sharedObjectiveRecords,distinctAffectedCatalogueRecords:memberships.size,summedObjectiveMemberships:Object.values(objectiveCoverage).reduce((n,v)=>n+v.census.length,0),newDistinctTeachingProposals:17,newObjectiveMemberships:instructionalProposals.reduce((n,r)=>n+r.objectiveCodesObserved.length,0),sharedMembershipsCreateNoAdditionalGlobalCredit:true,catalogueProgress:{denominator:1878,priorDispositions:1195,newProposals:17,combinedPending:1212,remaining:666,byKind:catalogueByKind},catalogueCensus,remainingCatalogueRecordIds,supportProgress,bankProgress,remainingBankQuestions:base.remainingBankQuestions,remainingBankFeedback:base.remainingBankFeedback,preservedHolds,preservedRecentSemanticDeferrals,preservedCardDeferrals,preservedGlossaryDeferrals,preservedTeachingDeferrals,unsupportedDesignBoundary:base.unsupportedDesignBoundary,priorCardBoundary:base.priorCardBoundary,priorGlossaryLineage:base.priorGlossaryLineage,priorTeachingBoundary:base.priorTeachingBoundary,priorApplicationBoundary:base.priorApplicationBoundary,priorNetworkBoundary:base.priorNetworkBoundary,priorGlossaryBoundary:{packetPath:newestPath,sha256:hashFile(newestPath),definitionLineageRevision:sig(base.definitionLineage),separateSQLInjectionHold:base.crossSourceDifferences.separateSQLInjectionHold,heldRowsRevision:sig(base.deferredSelectedRows),holdsResolved:false},canonicalBoundary:base.canonicalBoundary,activePackageUnchanged:base.activePackageUnchanged,humanApproved:false,published:false,activationAllowed:false,masteryWeight:0,newFamilyCredit:0,privatePayloadIncluded:false,privatePayloadFetched:false,learnerRuntimeObserved:false,productionAction:false,phase3Work:false,unchangedReleaseHashes:25};
assert.equal(packet.newObjectiveMemberships,34);assert.equal(packet.catalogueProgress.combinedPending,c.previous.size+selectedIds.size);
let completedNegativeChecks;
function validate(value){assertSafeReviewExport(value);assert(!/"(?:fullName|definition|frontText|answerMain|answerCopy|correctOrder|componentId|valueId|correctAnswer|items|blanks)"\s*:/.test(JSON.stringify(value)));const{negativeMutationChecks,...actual}=value;assert.deepEqual(actual,packet,'Source,parent,feedback,delivery,credit,hold or approval drift');if(negativeMutationChecks!==undefined)assert.equal(negativeMutationChecks,completedNegativeChecks);assert.deepEqual(actual.candidateRecordIds,censusSelection.map(r=>r.recordId));assert.equal(new Set(actual.selectedRecordIds).size,17);for(const r of actual.instructionalProposals){assert.equal(r.roleProposal,null);assert.equal(r.objectiveScopeProposal,null);assert.equal(r.trustedRevisionId,null);assert.equal(r.masteryWeight,0);assert.equal(r.humanApproved,false);assert.equal(r.independentEvidence,false);assert(!semantics.get(r.recordId).held);}}
validate(packet);let negativeMutationChecks=0;
const reject=mutate=>{const p=structuredClone(packet);mutate(p);assert.notDeepEqual(p,packet);assert.throws(()=>validate(p));negativeMutationChecks++;};
for(let i=0;i<sourceChecks.length;i++){
 for(const key of ['recordId','parentRecordId','sourceRevision','publishedRecordSignature','precisionObserved','sourcePrecedence'])reject(p=>p.sourceChecks[i][key]='stale_or_wrong');
 reject(p=>p.sourceChecks[i].sourceCitations[0].line++);reject(p=>p.sourceChecks[i].sourceCitations[0].fileSha256='stale');reject(p=>p.sourceChecks[i].subunits.pop());for(let j=0;j<sourceChecks[i].subunits.length;j++)reject(p=>p.sourceChecks[i].subunits[j].sourceRevision='stale');
}
for(let i=0;i<instructionalProposals.length;i++){
 for(const[key,bad]of Object.entries({sourceRevision:'stale',parentRecordId:'lesson:wrong',teachingUnderstanding:'all_objectives_recovery_approved',contentQualification:'',qualificationHolds:[],roleProposal:'trusted_assessment',objectiveScopeProposal:['2.3'],primaryConceptProposal:'invented',assessedCanonicalRoleProposals:['invented'],newQuestionCredit:1,newFeedbackCredit:1,newFamilyCredit:1,masteryWeight:1,trustedRevisionId:'invented',humanApproved:true,published:true,independentEvidence:true,canonicalApprovalTransferred:true,deliveryGate:'always_visible'}))reject(p=>p.instructionalProposals[i][key]=bad);
 if(instructionalProposals[i].conceptLinkProposals.length){reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].weight=1);reject(p=>p.instructionalProposals[i].conceptLinkProposals[0].conceptId='invented');}reject(p=>p.instructionalProposals[i].postMissUsefulnessProposal.approvedRemediation=true);
}
for(let i=0;i<3;i++){reject(p=>p.deferredSelectedRows[i].newTeachingContentProposalCredit=1);reject(p=>p.deferredSelectedRows[i].reason='');reject(p=>p.deferredSelectedRows[i].qualificationHolds=[]);reject(p=>p.selectedRecordIds.push(p.deferredSelectedRows[i].recordId));}
for(let i=0;i<6;i++)for(const[key,bad]of Object.entries({sourceRevision:'stale',parentRecordId:'lesson:wrong',offeredChoiceCount:1,feedbackEntryCount:0,feedbackBundleRevision:'stale',allOfferedFeedbackPresent:false,trustedScore:1,independentEvidence:true}))reject(p=>p.practiceGradeProbes[i][key]=bad);
for(let i=0;i<paragraphDelivery.length;i++){reject(p=>p.paragraphDelivery[i].firstVisibleRevision='stale');reject(p=>p.paragraphDelivery[i].collapsedDetailRevision='stale');reject(p=>p.paragraphDelivery[i].delivery='all_initially_visible');}
for(let i=0;i<2;i++)for(const[key,bad]of Object.entries({sourceRevision:'stale',canonicalDomainObserved:1,comparisonRowsBySection:[],displayedGeneratedCheckIds:[],modelCheckIsRevealOnly:false,feedbackAfterSubmissionOnly:false,additionalProFeedbackGateWithinAccessibleLesson:true,accessGate:'always_free',freshBrowserObserved:true,learnerHandlersExecuted:true,reviewNoteIsNotOverlayOrApproval:false,beyondSectionIndexes:[0]}))reject(p=>p.lessonInspection[i][key]=bad);
for(const code of affectedCodes){reject(p=>p.objectiveCoverage[code].census.pop());reject(p=>p.objectiveCoverage[code].denominator.newTeachingProposals++);reject(p=>p.objectiveCoverage[code].denominator.newQuestionDispositions=1);}
for(const key of Object.keys(preservedHolds))reject(p=>p.preservedHolds[key]=null);
for(const key of ['preservedRecentSemanticDeferrals','preservedCardDeferrals','preservedGlossaryDeferrals','preservedTeachingDeferrals'])for(let i=0;i<packet[key].length;i++)reject(p=>p[key][i].sourceRevision='stale');
for(let i=0;i<4;i++){reject(p=>p.independentHoldBindings[i].holdsResolved=true);reject(p=>p.independentHoldBindings[i].newContentCredit=1);reject(p=>p.independentHoldBindings[i].accuracyApprovalTransferred=true);}
for(let i=0;i<23;i++)reject(p=>p.unsupportedDesignBoundary.rows[i].newQuestionCredit=1);
for(let i=0;i<inventory.length;i++)reject(p=>p.allPacketReconciliation.inventory[i].sha256='stale');
for(const key of ['q','options','correct','gradingKey','payload','learnerId','email','definition','answerMain','correctOrder'])reject(p=>p[key]='forbidden');
for(const[key,bad]of Object.entries({activationAllowed:true,humanApproved:true,published:true,status:'READY',privatePayloadFetched:true,learnerRuntimeObserved:true,productionAction:true,phase3Work:true,newFamilyCredit:1}))reject(p=>p[key]=bad);
reject(p=>p.sourceChecks.pop());reject(p=>p.instructionalProposals.push(p.instructionalProposals[0]));reject(p=>p.candidateRecordIds.push(p.candidateRecordIds[0]));reject(p=>p.catalogueProgress.newProposals=20);reject(p=>p.supportProgress.combinedPending++);reject(p=>p.bankProgress.combinedQuestions=483);reject(p=>p.bankProgress.combinedFullFeedback=483);reject(p=>p.instructionalReconciliation.limitedLinksUpgraded=6);reject(p=>p.excludedHelpers.pop());reject(p=>p.priorGlossaryBoundary.holdsResolved=true);reject(p=>p.authority.approvalInferred=true);reject(p=>p.apiContextBoundary.newTeachingContentProposalCredit=1);reject(p=>p.catalogueCensus.pop());reject(p=>p.remainingCatalogueRecordIds.pop());reject(p=>p.newObjectiveMemberships=17);
completedNegativeChecks=negativeMutationChecks;const exported={...packet,negativeMutationChecks};validate(exported);verifySourceBindings(sourceBindings);
for(const root of ['src','api','server'])for(const path of readdirSync(root,{recursive:true}).filter(p=>/\.(jsx?|mjs)$/.test(p)))assert(!readFileSync(root+'/'+path,'utf8').includes('phase-2b5-objective23-teaching-proposals'),'Runtime proposal import');
if(process.argv.includes('--write'))writeFileSync(packetPath,JSON.stringify(exported,null,2)+'\n');validate(readJson(packetPath));assert.deepEqual(readJson(packetPath),exported);
const loc=u=>u.provenance.path+':'+u.provenance.startLine;
const report=`# Phase 2B-5 — objective2.3 software teaching review

**NOT READY.** 12 October 2026. Baseline **${packet.baselineCommit}**. Packet SHA-256 **${hashFile(packetPath)}**. One finite LOCAL/default-off/unwired/learner-invisible slice. Only this report, the draft packet and focused audit change.

## Authority and exact selection

The master plan and Phase1 audit were read in full earlier in this continuing session; their unchanged hashes stay bound. The master plan controls approved product decisions. The audit is historical current-state evidence, checked against present source. No unresolved product conflict requires changing behavior in this review.

The latest glossary packet ${newestPath}, SHA-256 ${hashFile(newestPath)}, objectiveCoverage['2.3'].census contains exactly20 still inventory-only identities for lesson:secure-software-applications and lesson:software-memory-concurrency. The audit stops if identities, revisions, parent relationships, or selection change. Each lesson contributes its container, keyword guide, trap set, main reveal, three actually displayed generated checks and all three sections:10+10. No undisplayed comparison helper or neighbouring API lesson substitutes for a selected row.

Qualify **17 bounded teaching-content and candidate-support-link Codex PROPOSALS pending owner approval**. **All three memory practice checks remain zero credit** because their complete offered feedback bundles repeat the insufficient race definition; the race check's clue is itself incomplete. The memory keyword guide and lesson are expressly partial containers. Their credit does not approve the deficient entry or any held child. All primary/role/precise-scope/trusted revision proposals remain null; assessed roles empty; mastery/evidence/family weights0. New question, PBQ, feedback-bundle and independent assessment-family judgments:0.

| Exact identity | Decision | Source location | Whole-row source revision |
| --- | --- | --- | --- |
${sourceChecks.map(r=>`| ${r.recordId} | ${selectedIds.has(r.recordId)?'Bounded draft; owner pending':'Deferred; zero credit'} | ${r.sourceCitations[0].path}:${r.sourceCitations[0].line} | ${r.sourceRevision} |`).join('\n')}

Source checks also bind every paragraph, all13 comparison rows, all6 guide entries, all6 traps, main reveal prompt/response fingerprints, generated checks and complete feedback fingerprints. Raw prompts, clues, options, keys, responses, learner data and private payloads are omitted. Exact-revision inspection is not publication or canonical approval.

## Effective source and actual offered delivery

Authored software lesson: **${loc(literalUnits[0])}**. Authored memory lesson: **${loc(literalUnits[1])}**. They enter CONCEPT_DEEP_DIVES through the study/printer guide spreads; exactly one effective ID exists for each. Profiles at **${profileUnits.map(loc).join(' and ')}** replace authored titles/summaries in the header. Keyword definitions feed the existing helper. LESSON_REVIEW supplies badge/note metadata, not a content overlay or new human approval. Question snapshots/editorial overrides do not replace these teaching literals.

Both profiles use domain2: software order9 with observed2.3/4.1; memory order10 with2.3/2.5. Applied difficulty is an instructional label, not assessment calibration. Software has no beyond sections; memory section2 is explicitly **Beyond the textbook**, optional and not required by the objective wording according to the current renderer. Profile scope unions and source-reference labels do not establish every child's exact numbered scope.

Source inspection and existing pure helper/guard probes only. No browser, React state, learner handler, storage write, entitlement account, telemetry, migration or server control executes. Renderer **${loc(lessonUnit)}**, readable bites **${loc(bitesUnit)}**, sentence helper **${loc(splitUnit)}**, submit guard/equality **${loc(submitUnit)}**, end callbacks **${loc(actionsUnit)}** are source-bound.

**Both lessons currently require Pro** for guest/free access; web-social-dns-attacks remains the single preview. Direct opens and incoming recommendations check this same rule, while matching ranks are tier-blind. Future Phase3 free-Domain1/access decisions stay separate and unchanged.

Each lesson offers six guided steps, three selectable keywords, three sections, three traps and one reveal. Software comparison table has7 rows; memory6. One selected row displays at a time, initialized/reset to0. All rows are reachable from source controls; learner exposure is unobserved. Eight body paragraphs yield ${paragraphDelivery.map(p=>p.sentenceCount).join('/')} sentences. Only the first sentence starts visible; supporting sentences require native details. Exact-context output rules, safe file selection, SAST/DAST/SCA, signing/dependency qualifications, TOCTOU/interleaving consequences and mitigation limits can be collapsed. The packet fingerprints first and remaining delivery separately.

Body first/rest use GlossaryText; keyword meanings, table cells, traps, model responses and practice feedback are plain text. No blanket glossary route or recursive tooltip inference. Source references require their own disclosure. Reviewed/vetted UI text is not evidence that every derived feedback definition is complete.

The two main checks **only reveal model responses** and accept no entered answer or grade; reveal resets on lesson/step changes. Six generated practice checks are the first three guide entries per lesson, with three offered choices and three feedback entries each. Feedback appears only after submission: main definition immediately, other definitions behind details, without another Pro gate inside an accessible lesson. All18 offered feedback entries were inspected; their repetition is definition recall rather than specific misconception feedback.

Pure existing guard/equality probes:6 checks,18 offered-choice evaluations,24 empty/repeated/missing/unknown-choice evaluations. Exactly one offered choice compares equal per check. These probes prove local equality behavior, not semantic completeness or learner mastery. Local best percentages preserve a device maximum; self-mark complete and retries establish neither independent evidence nor demonstrated remediation.

Exclude **29 helper outputs** already inventoried as not delivered: six undisplayed comparison checks,12 software helper cards and11 memory helper cards. App does not import those generated cards. Comparison generation takes only its first three outputs and excludes beyond-section exercises; no missing helper is invented. Positive memory-invariant clues in undisplayed comparisons are not granted content credit.

End actions select ten coarse-domain MCQs, a chapter/access-filtered PBQ and the first overlapping-objective authored deck (${lessonInspection.map(g=>g.relatedDeckIdObserved).join(', ')}). Guest review routes to signup. Those selectors/destinations receive no new semantic dispositions, exact-remediation approval or observed recovery.

## Bounded meaning and deferrals

${sourceChecks.map(r=>'**'+r.recordId+'.** '+semantics.get(r.recordId).meaning+'\n\n'+semantics.get(r.recordId).limits.map(t=>'- '+t).join('\n')).join('\n\n')}

**Review inference:** [CWE362](https://cwe.mitre.org/data/definitions/362.html) requires concurrent shared-resource timing/ordering and synchronization context. The current short guide entry cannot distinguish a race from ordinary unsafe sequential order. Because every memory check repeats that entry in its offered feedback, all three complete check/feedback units are deferred; simply holding the one race clue would miss the other feedback routes. Strengthen the source guide, regenerate and re-review affected units before credit. The accurate surrounding section does not rewrite their exact revisions.

[CWE367](https://cwe.mitre.org/data/definitions/367.html) supports invalidated check/use binding. [CWE190](https://cwe.mitre.org/data/definitions/190.html) separates integer representation failure, and [CWE400](https://cwe.mitre.org/data/definitions/400.html) covers limited-resource control. [CWE787](https://cwe.mitre.org/data/definitions/787.html) was verified through its primary search-index description/consequence excerpt; repeated direct body opens failed, so no full mapping-note review is claimed. Bounds failures have contextual outcomes. [Microsoft exploit-protection reference](https://learn.microsoft.com/en-us/defender-endpoint/exploit-protection-reference) distinguishes DEP page-execution permissions from ASLR address randomization; neither repairs bounds or synchronization.

[OWASP injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html) supports interpreter-specific safe construction, and [SQL injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) separates query structure from bound data. Ordinary parameter changes can alter legitimate results without code/data confusion. No SQL or shell exploit executes. [OWASP DOM prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html), [SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) and [CSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) supply conditional sink, destination and request-intent premises; no universal defense is inferred. The supplied [Top10 project index](https://owasp.org/www-project-top-ten/) confirms the2025 label only; a whole edition/taxonomy review is not claimed. [NIST800-218](https://csrc.nist.gov/pubs/sp/800/218/final) was checked at publication/version1.1 and abstract level, not its full PDF or a compliant implementation.

The adjacent **lesson:api-session-browser-security** is a source-bound comparison only and stays inventory-only. [OWASP BOLA](https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/) distinguishes authenticated identity from permission for a specific object/action; unpredictable IDs do not replace authorization. [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) links session identity to authentication/access controls. Session validity, CSRF request intent and API object permissions differ. Neither selected lesson gains this absent teaching by proximity, safe-API vocabulary or topic overlap.

## Prior comparisons, preserved holds and accounting

All80 substantive prior packets are bound and inspected through disposition arrays:42 older dictionary-bound question judgments (30MCQ/12PBQ) augment412 newer judgments;22 duplicate references and7 support-only references add no credit. Instructional lineage has313 prior occurrences,305 distinct identities and8 duplicate occurrences; six limited references remain excluded from full support coverage. Add17 distinct rows:330 occurrences/322 distinct instructional identities. Five explanation-context identities remain outside the eight-kind support denominator. Partial containers, guides and sections overlap; counts are reviewed identities, not independent lessons or assessments.

${priorOverlapReferences.length} prior records have broad metadata overlap with2.3/2.5/4.1. Every source/disposition reference is bound without new equivalence. Pure current recommendation ranks can select another lesson and are matching scores/evidenceCount, not learner frequency, trusted concepts or proof of recovery.

| Prior record, unchanged question and feedback revisions bound | Teaching comparison | Limit |
| --- | --- | --- |
${detailedComparisons.map(r=>`| ${r.questionRecordId} | ${r.sectionRecordId} | ${r.limitation} |`).join('\n')}

**Four independent holds remain exact and unresolved:**

| Held identity | Source revision | Held-row fingerprint |
| --- | --- | --- |
${independentHoldBindings.map(r=>`| ${r.recordId} | ${r.sourceRevision} | ${r.heldDispositionRevision} |`).join('\n')}

A clearer lesson does not fix held Buffer Overflow/Race Condition cards or either distinct SQLi/SQL injection glossary entry. Preserve all10 earlier card deferrals, four glossary deferrals, two earlier teaching deferrals,13 recent question semantic deferrals, seven question-only feedback gaps,23 unsupported PBQ design-only rows and every hidden-evidence/KEV/pilot/recovery/single-pair/grading/delivery boundary. New three memory deferrals are separate. p003/p017 private question/feedback variants remain unavailable/unreviewed with null trusted revisions; no fetch/substitution/private export occurs.

| Global measure | Prior | New | Combined pending | Remaining |
| --- | ---: | ---: | ---: | ---: |
| Eight support kinds /834 |294|17|311|523|
| Entire catalogue /1878 |1195|17|1212|666|
| Local questions /483 |454|0|454|29|
| Full feedback /483 |447|0|447|36|
| Complete question/feedback pairs /483 |447|0|447|36|

Cards95/313, decks6/29 and glossary93/162 stay unchanged. MCQ questions/pairs395/395; PBQ questions59/88 and pairs52/88. Teaching containers12/32, guides12/32, traps12/32, sections38/106 and lesson checks43/128. Lesson checks add **5**, specifically two ungraded reveals plus three derived software checks; three memory checks add0. No new bank assessments or trusted families.

The17 qualified identities create **34 overlapping observed objective memberships**, not34 global units. Objective2.3:105+17=122/162;40 remain, including the three new holds and all prior holds. Objective2.5 adds7;4.1 adds10. Every other existing objective retains its exact prior tally.

| Observed objective | Broad denominator | Prior | New teaching | Combined pending | Remaining local/private |
| --- | ---: | ---: | ---: | ---: | --- |
${Object.entries(objectiveCoverage).map(([code,v])=>{const d=v.denominator;return`| ${code} | ${d.broadCandidates} | ${d.allPacketPriorDispositions} | ${d.newTeachingProposals} | ${d.combinedPendingDispositions} | ${d.remainingLocal}/${d.remainingPrivate} |`;}).join('\n')}

Full exact-revision censuses cover ${Object.keys(objectiveCoverage).length} objectives,${packet.summedObjectiveMemberships} memberships,${packet.distinctAffectedCatalogueRecords} distinct records and${sharedObjectiveRecords.length} shared records. The global catalogue census binds all1878 identities and every remaining666; shared membership never duplicates global credit.

Exact remaining40 under objective2.3:

${objectiveCoverage['2.3'].remainingRecordIds.map(id=>'- '+id).join('\n')}

## Verification and readiness

Run \`node ${scriptPath}\` and \`npm run audit:content-mapping\`. The focused audit rebuilds selected rows/parents, displayed/hidden detail, every offered feedback entry, actual local guard/equality behavior, exclusions, prior packets, counts and exact holds. **${negativeMutationChecks} adverse packet mutations** reject stale/misparented/missing sections, feedback drift, lost qualifiers, hidden-detail inflation, duplicate credit, forbidden answer/key exports and invented approval/trust/activation. All29 mapping checks verify the deterministic active package. All25 release SHA-256 bindings and the question ledger remain unchanged. Task-only commit/push uses **[skip deploy]** and verifies HEAD=origin/main=remote plus three full file SHA-256 values.

These are draft review artifacts, not published teaching or learner activation. Owner/canonical/scope/role/grammar decisions, private-source review, content diversity/calibration, demonstrated remediation, operational release and rollback gates remain open. No runtime, production, deployment, live shadow/cohort, migration, Phase3 or entitlement change. **Phase2B-5 NOT READY.**
`;
if(process.argv.includes('--write'))writeFileSync(reportPath,report);assert.equal(readFileSync(reportPath,'utf8'),report,'Report binding drift');
console.log(JSON.stringify({status:'PASS_OFFLINE_OBJECTIVE23_TEACHING_NOT_READY',priorPackets:inventory.length,selectedCandidates:20,newQualifiedTeachingProposals:17,zeroCreditRows:deferredSelectedRows.map(r=>r.recordId),practiceGradeProbes:practiceGradeProbes.length,excludedHelpers:excludedHelpers.length,negativeMutationChecks,supportProgress,objective23:objectiveCoverage['2.3'].denominator,unchangedReleaseHashes:25,sha256:Object.fromEntries([packetPath,reportPath,scriptPath].map(path=>[path,hashFile(path)]))}));
