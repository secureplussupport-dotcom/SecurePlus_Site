import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {contentSignature} from '../read-learning-pilot-bank.mjs';

const APP='src/App.jsx';
const fileHash=source=>createHash('sha256').update(source).digest('hex');
const byId=(a,b)=>a.id<b.id?-1:a.id>b.id?1:0;

// Explicit boundaries fail closed when a reviewed source unit moves/disappears.
// Code is used in memory only; exported provenance contains locations and hashes.
export function sourceUnit(path,start=null,end=null) {
  const source=readFileSync(path,'utf8');
  const a=start===null?0:source.indexOf(start);
  if(a<0||(start!==null&&source.indexOf(start,a+start.length)!==-1))throw new Error(`Missing or ambiguous source anchor: ${path} ${start}`);
  const b=end===null?source.length:source.indexOf(end,a+(start?.length||0));
  if(b<0)throw new Error(`Missing source boundary: ${path} ${end}`);
  const code=source.slice(a,b);
  return {code,provenance:{path,anchor:start||'whole module',endAnchor:end,startLine:source.slice(0,a).split('\n').length,endLine:source.slice(0,b).split('\n').length,sourceSignature:contentSignature(code)}};
}
const appUnit=(start,end)=>[APP,start,end];
const moduleUnit=path=>[path];

export function readGlossary() {
  const declaration=sourceUnit(APP,'const ACRONYM_GLOSSARY_TERMS =','const ACRONYM_TERMS_SORTED =');
  const terms=Function(`"use strict";${declaration.code};return GLOSSARY_TERMS;`)();
  const format=sourceUnit(APP,'function parseInlineFormats(','function GlossaryText(');
  const matcher=sourceUnit(APP,'  const terms=Object.keys(GLOSSARY_TERMS).sort','  const getEntry=term=>');
  // Same formatting split, longest-first alternatives, token boundary and case
  // normalization as the renderer. Separate per-term regexes could double-count
  // overlapping phrases if the glossary gains a shorter alias.
  const matchTerms=Function('GLOSSARY_TERMS',`"use strict";${format.code};${matcher.code};return value=>[...new Set(parseInlineFormats(value).flatMap(segment=>[...segment.text.matchAll(pattern)].map(match=>normalize(match[2]))))].sort();`)(terms);
  const definitionLocations=Object.fromEntries(Object.keys(terms).map(term=>{const at=declaration.code.indexOf(JSON.stringify(term)+':');if(at<0)throw new Error(`Missing glossary definition location: ${term}`);return [term,{path:APP,line:declaration.provenance.startLine+declaration.code.slice(0,at).split('\n').length-1}];}));
  return {terms,matchTerms,definitionLocations,sourceUnits:[declaration.provenance,format.provenance,matcher.provenance]};
}

export function readStarterQuestions() {
  const unit=sourceUnit(APP,'const ATHENA_STARTER_QUESTION_SETS=','function getAthenaDiagnosticQuestions(');
  const sets=Function(`"use strict";${unit.code};return ATHENA_STARTER_QUESTION_SETS;`)();
  return {sets,provenance:unit.provenance};
}

// One row per delivered selection capability. Helpers and call sites are bound
// as separate source units; user-specific selections are never materialized.
const spec=(id,units,inputs,targetKinds,determinism,dependencies,deliveryMarkers,detail)=>({id,units,inputs,targetKinds,determinism,dependencies,deliveryMarkers,detail});
export const SELECTOR_SPECS=[
  spec('weak-area-deck',[appUnit('const tokenizeLearningText =','const buildCipherStarterFlashcardSet =')],['weak chapter','weak topics','authored cards'],['flashcard'],'Stable for fixed input order; scores topic/term/token overlap and takes at most 18.',['src/data/sy0701AcronymFlashcards.js'],['const primaryWeakFlashcardSet=primaryWeakAction?buildCipherWeakFlashcardSet(','return buildCipherWeakFlashcardSet(weakContext)||buildCipherStarterFlashcardSet();'],'Broad topic matching and chapter fallback; no adaptive canonical concept map is consulted.'),
  spec('starter-deck',[appUnit('const buildCipherStarterFlashcardSet =','const getFlashcardRelatedDeepDives =')],['priority topic list','authored cards'],['flashcard'],'Stable source ordering; priority-topic slices followed by source-order fallback, at most 18.',['src/data/sy0701AcronymFlashcards.js'],['return buildCipherWeakFlashcardSet(weakContext)||buildCipherStarterFlashcardSet();'],'Default Pro assistant deck when no supplied/weak-area deck exists.'),
  spec('daily-challenges',[appUnit('const DAILY_CHALLENGES =','function getNextRelatedPBQ('),appUnit('function DailyChallenge(','function GuestCompletionMoment('),appUnit('function LandingDailyChallengeWidget(','function AuthView(')],['local calendar weekday','hardcoded question IDs','effective banks'],['mcq','pbq'],'Weekday chooses a fixed ID list; missing IDs are filtered; MCQ options are randomized.',['src/App.jsx'],['const challenge = getTodayChallenge();','const challenge=getTodayChallenge();'],'Daily challenge and landing widget use the same authored selector; actual learner results are excluded.'),
  spec('deep-dive-recommendations',[moduleUnit('src/lib/deepDiveRecommendations.js')],['missed question content and objective/topic metadata','limit','lesson profiles'],['lesson'],'Stable for fixed ordered input and source data; score, evidence count and study order break ties; first miss domain controls fallback.',['src/data/conceptDeepDives.js','src/data/conceptDeepDivesStudyGuide.js','src/data/conceptDeepDivesPrinterGuide.js','src/data/sy0701DeepDiveMap.js'],['const primaryLessonPath=getDeepDiveRecommendations(','const sessionLessonPath=getDeepDiveRecommendations(','const lessonPath=getDeepDiveRecommendations('],'Objective/topic hints and lexical overlap can use explanations and options internally. Export no matched private text or learner instances; these are legacy recommendations, not approved mastery links.'),
  spec('related-flashcard-lessons',[appUnit('const getFlashcardRelatedDeepDives =','const FlashcardSocialIcon ='),appUnit('const tokenizeLearningText =','const buildCipherWeakFlashcardSet =')],['selected deck metadata/cards','lesson aliases/profiles'],['lesson'],'Stable score/source-order ranking; at most three; starred collection returns none.',['src/data/conceptDeepDives.js','src/data/sy0701DeepDiveMap.js','src/data/sy0701AcronymFlashcards.js'],['const relatedDeepDives=useMemo(()=>getFlashcardRelatedDeepDives('],'Terms, objective overlap and domain matching; no canonical adaptive mapping dependence.'),
  spec('smart-review',[appUnit('function getAttemptDate(','function buildDiagnosticQuestions(')],['MCQ bank and concept tags','attempt chronology','direct concept neighbors','starred IDs','focus topics/chapter','count','mode','current time'],['mcq'],'Smart ranking is stable for fixed now and history; random mode uses Math.random. Available same-tag alternatives, original missed MCQs, then direct-neighbor MCQs precede diversity-filled results.',['src/App.jsx','src/lib/mcqConceptReview.js','src/data/sy0701ConceptWeb.js','src/data/mcqConceptTagAssignments.json'],['const pool=buildMcqPracticePool(','const pool=rankQuestionsBySm2('],'Latest missed MCQ tags and one-hop concept links reserve available repair questions. The original missed MCQ remains in the next set while its latest answer is wrong, subject to set capacity; existing SM-2 timing and topic/chapter signals fill the remainder. No learner history is read by the inventory.'),
  spec('next-related-pbq',[appUnit('function getNextRelatedPBQ(','// ═')],['current PBQ','successful attempt IDs','effective PBQ bank order'],['pbq'],'First unsolved same chapter/type, then same chapter, then cyclic bank successor; deterministic for fixed inputs.',['src/App.jsx'],['getNextRelatedPBQ(activePbq,attempts,livePbqBank)'],'Next-question behavior is coarse legacy chapter/type matching, not concept mastery or independently proven novelty.'),
  spec('next-flashcard-deck',[appUnit('const getNextFlashcardSet =','async function saveFlashcardReviewAuthIntent(')],['current deck ID','authored deck order'],['deck_container'],'Cyclic source-order successor; unknown deck returns first deck.',['src/data/sy0701AcronymFlashcards.js'],['const recommendedSet=useMemo(()=>getNextFlashcardSet('],'Continue-studying recommendation is ordered navigation, not personalized mastery.'),
  spec('random-flashcards',[appUnit('const RANDOM_FLASHCARD_COUNTS =','async function saveFlashcardReviewAuthIntent('),appUnit('const buildRandomFlashcardSet =','const readSavedRandomFlashcardSets =')],['count and mode','term/acronym toggles','optional source cards','saved IDs/order'],['flashcard','deck_container'],'Random unless preserveOrder is supplied; source order preserved on saved-deck hydration; generated color can depend on Date.now.',['src/data/sy0701AcronymFlashcards.js'],['const built=buildRandomFlashcardSet(','const [savedRandomSets,setSavedRandomSets]=useState(()=>readSavedRandomFlashcardSets(user))'],'Selection, dividers and saved-ID hydration reuse authored cards. Saved user deck contents are excluded.'),
  spec('starred-flashcards',[appUnit('const getStarredFlashcards =','const RANDOM_FLASHCARD_COUNTS =')],['starred card IDs','authored card bank'],['flashcard','deck_container'],'Filters in authored card order; deterministic for fixed selected IDs.',['src/data/sy0701AcronymFlashcards.js'],['const starredFlashcards=useMemo(()=>getStarredFlashcards(','const starredFlashcardSet=useMemo(()=>buildStarredFlashcardSet('],'Selection algorithm included; personal selections are not catalogue revisions and are not queried.'),
  spec('diagnostic',[appUnit('function buildDiagnosticQuestions(','function getReviewSummary('),appUnit('function DiagnosticQuiz(','function PasswordUpdateView(')],['effective MCQs','chapter order','concise fallback sets'],['mcq','starter_question'],'Stable easiest concise per-chapter choice and fallback; displayed answer options randomized.',['src/App.jsx'],['const questions=useMemo(()=>buildDiagnosticQuestions(),[])'],'Five-question diagnostic; weak chapter action is based on that diagnostic, not validated adaptive mastery.'),
  spec('signup-diagnostic',[appUnit('const ATHENA_STARTER_QUESTION_SETS=','function AthenaSignupJourney(')],['declared experience level','authored starter sets'],['starter_question'],'Fixed per-experience set and source order.',['src/App.jsx'],['const diagnosticQuestions=useMemo(()=>getAthenaDiagnosticQuestions(','<AthenaSignupJourney'],'Separate authored signup diagnostic revisions; also fallbacks for the general diagnostic.'),
  spec('practice-launch',[appUnit('function MCQPractice(','function UpgradeModal(')],['bank and filters','guest/account status','missed/starred IDs','chapter review request','session results'],['mcq','lesson'],'Filters and Smart Review inputs are deterministic for fixed state/time; option shuffling and random practice are not.',['src/App.jsx','src/lib/deepDiveRecommendations.js'],['<MCQPractice '],'Normal, missed, starred and focused chapter launchers, result recommendations and replay/resume paths use existing question/lesson sources.'),
  spec('exam-selection',[appUnit('function ExamMode(','function CipherRewardToast(')],['effective banks','requested MCQ/PBQ counts','access state','exam results'],['mcq','pbq'],'Math.random samples non-enrichment content; PBQs precede MCQs; review filtering uses local exam results.',['src/App.jsx'],['<ExamMode '],'Exam sampling, incorrect/flagged review and weakest-topic summary reuse bank revisions. Payment/voucher operations are not executed by this audit.'),
  spec('pbq-catalogue-selection',[appUnit('function PBQBank(','function PBQSim(')],['bank','chapter/type/missed/starred filters','attempts','tier','visible count'],['pbq'],'Stable progress/source-order list with free preview priority; random practice favors unseen then missed, with random enrichment downweighting.',['src/App.jsx'],['<PBQBank '],'Includes filtered browsing and random-practice selection. Unlock state is a runtime input, not exported learner data.'),
  spec('weak-area-actions',[appUnit('  const latestMcqAttempts=getLatestMcqAttempts(attempts);\n  const mcqHistories=', '  const readinessEncouragement=getReadinessEncouragement(readinessProfile);')],['latest MCQ outcomes','chapter/topic aggregates','bank'],['mcq','lesson','flashcard'],'Stable weighted miss/repeated-miss/accuracy ranking for fixed history and bank order.',['src/App.jsx','src/lib/deepDiveRecommendations.js'],['const primaryWeakAction=weakChapterActions[0];'],'Dashboard chooses a weak chapter, then offers review, lessons and a deck. Broad signals are not canonical concept mappings.'),
  spec('cipher-study-routing',[appUnit('function buildCipherAssistantContext(','function normalizeMascotPlacement('),appUnit('  const effectiveAssistantFlashcardSet=useMemo(', '  const handleAdminProModeChange=')],['current view','attempt-derived weak chapter/topics','tier','supplied assistant deck'],['mcq','flashcard'],'Preset choices and stable weak-chapter scoring; explicit supplied deck takes precedence over weak/starter fallback.',['src/App.jsx','src/data/sy0701AcronymFlashcards.js'],['<CipherAssistantDock '],'Preset study guidance routes to Smart Review or flashcards; it is not an independent adaptive model or new instructional content.'),
  spec('lesson-navigation',[appUnit('function ConceptDeepDivesPage(','function FlashcardsPage(')],['query/domain','lesson selection','tier','lesson profile','local study step'],['lesson','lesson_section','lesson_check','deck_container'],'Study-order sorting, fixed section/check order, first three generated checks and first overlapping-objective deck are deterministic.',['src/lib/deepDiveStudy.js','src/data/sy0701DeepDiveMap.js','src/data/conceptDeepDives.js','src/data/sy0701AcronymFlashcards.js'],['<ConceptDeepDivesPage '],'Includes free-preview gating, lesson search, guided steps and related flashcard end action. Other lesson end actions delegate to separately inventoried selectors.'),
  spec('lesson-related-pbq',[appUnit('  const handleAddDeepDiveWeakTopicToReview=','  const handleGuestPbqPreview=')],['lesson chapter','effective PBQ bank','tier/unlocked IDs'],['pbq','mcq'],'First accessible same-chapter PBQ, then same-chapter candidate, then free preview; inaccessible result routes to access UI.',['src/App.jsx'],['onTryRelatedPbq={handleTryRelatedDeepDivePbq}'],'Lesson-to-PBQ and chapter-review actions use coarse domain links, not exact concept diagnosis.'),
  spec('flashcard-navigation',[appUnit('function FlashcardsPage(','function ObjectivesPage(')],['chapter filter','requested/saved/shared/assistant deck IDs','mode','authored cards'],['flashcard','deck_container'],'Fixed catalogue order for browsing; shared/saved IDs resolve to current authored cards; random generation delegated.',['src/data/sy0701AcronymFlashcards.js'],['<FlashcardsPage '],'Includes three mobile quick sets, saved/shared deck restoration and explicit deck/mode choice. Stored learner instances are excluded.'),
  spec('flashcard-study-pass',[appUnit('function AcronymFlashcardLab(','function DeepDiveReadableBites(')],['deck','mode','card order','local pass progress'],['flashcard','lesson','deck_container'],'Default/source or saved order; example mode filters cards; shuffle is random; completion/next-deck navigation is deterministic for fixed state.',['src/data/sy0701AcronymFlashcards.js'],['<AcronymFlashcardLab '],'Term/acronym/example presentation, pass navigation and related lesson/deck actions reuse authored content. Self-rating is not trusted mastery evidence.'),
  spec('glossary-delivery',[appUnit('function parseInlineFormats(','function PBQProseText('),appUnit('const ACRONYM_TERMS_SORTED =','function stripPbqHintsForExam(')],['rendered text','glossary definitions'],['glossary_definition'],'Case-insensitive longest-first boundary matching within inline formatting segments; deterministic for exact text.',['src/App.jsx'],['<GlossaryText '],'Definitions are conditional inline support; corpus matches do not prove a browser tooltip was opened.'),
  spec('guest-feature-teaching',[appUnit('function GuestFeaturePreview(','function GuestFeatureShowcaseCard('),appUnit('function GuestFeatureShowcaseCard(','function GuestDashboardGate('),appUnit('function GuestDashboardGate(','function GuestLockedPage(')],['hardcoded feature type','in-view state','local flip/choice/sequence/focus state'],['guest_demo_flashcard','guest_demo_mcq','guest_demo_explanation','guest_demo_feedback','guest_demo_pbq','guest_demo_hint','guest_demo_review_path','guest_demo_lesson_prompt'],'Fixed authored branches selected by feature ID; local interactions reveal content. MFA auto-flip depends on time/reduced-motion preference. No adaptive selection or learner history.',['src/App.jsx'],['<GuestDashboardGate ','<GuestFeatureShowcaseCard ','<GuestFeaturePreview type={feature.id}'],'Reachable default guest landing demos are separately authored teaching surfaces. The timed-exam clock branch is explicitly excluded as noninstructional illustration; this is distinct from navigation to a real PBQ.'),
  spec('guest-feature-review-topic',[appUnit('  if(type==="review"){','  const lessons=[')],['selected synthetic topic','fixed authored path dictionary'],['guest_demo_review_path'],'User-selected dictionary lookup; default PKI topic; displayed percentages/miss signals and queue labels are hardcoded, not learner measurements.',['src/App.jsx'],['<GuestFeaturePreview type={feature.id}'],'Three illustrative review paths teach priorities but provide no verified personalization or mastery evidence.'),
  spec('guest-feature-lesson-topic',[appUnit('  const lessons=[','function GuestFeatureShowcaseCard(')],['selected preview title','fixed authored prompt list'],['guest_demo_lesson_prompt'],'Fixed title lookup with first-prompt fallback; content changes only with explicit topic selection.',['src/App.jsx'],['<GuestFeaturePreview type={feature.id}'],'Three standalone teaching prompts are distinct from the Deep Dive lesson catalogue; no canonical objective mapping is approved.'),
  spec('guest-pbq-preview',[appUnit('  const handleGuestPbqPreview=','  const handleAchievementSessionComplete=')],['live/local bank','fixed free-preview ID'],['pbq'],'Find the fixed preview in live bank, then local bank, otherwise null.',['src/App.jsx'],['onPreviewPbq={handleGuestPbqPreview}'],'Single free-preview routing is not adaptive recommendation.'),
];

export function readSelectors() {
  const app=readFileSync(APP,'utf8');
  return SELECTOR_SPECS.map(spec=>{
    const units=spec.units.map(args=>sourceUnit(...args));
    const deliveryEvidence=spec.deliveryMarkers.map(marker=>{
      const offsets=[...app.matchAll(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))].map(m=>m.index);
      if(!offsets.length)throw new Error(`Missing selector delivery marker: ${spec.id} ${marker}`);
      return {path:APP,marker,lines:offsets.map(i=>app.slice(0,i).split('\n').length)};
    });
    const dependencies=[...new Set(spec.dependencies)].sort().map(path=>({path,sha256:fileHash(readFileSync(path))}));
    const sourceUnits=units.map(x=>x.provenance);
    return {id:spec.id,sourceSignature:contentSignature({sourceUnits,dependencies}),selector:{inputs:spec.inputs,targetKinds:spec.targetKinds,determinism:spec.determinism,mappingDependencies:spec.detail,sourceUnits,dependencies,deliveryEvidence,inclusionRationale:'Delivered source-level selection capability; included even when it only chooses existing content. No learner-specific output is exported.'}};
  }).sort(byId);
}

export const DELIVERY_SOURCE_PATHS=[APP,'src/lib/deepDiveRecommendations.js','src/lib/deepDiveStudy.js','src/data/sy0701AcronymFlashcards.js','src/data/sy0701DeepDiveMap.js','src/data/conceptDeepDives.js','src/data/conceptDeepDivesStudyGuide.js','src/data/conceptDeepDivesPrinterGuide.js'];
export function verifyDeliveryInventory(pkg,{readSource=path=>readFileSync(path)}={}) {
  const guard=JSON.parse(readFileSync('docs/evidence/phase-2b5/delivery-surface-review.json'));
  for(const path of DELIVERY_SOURCE_PATHS)if(guard.sources[path]!==fileHash(readSource(path)))throw new Error(`Delivery source drift: review selector/glossary completeness for ${path}`);
  const {terms}=readGlossary();
  const entries=[...pkg.records,...pkg.exclusions].filter(r=>r.kind==='glossary_definition');
  if(entries.length!==Object.keys(terms).length)throw new Error('Incomplete glossary census');
  for(const [term,definition] of Object.entries(terms)){
    const found=entries.filter(r=>r.term===term);
    if(found.length!==1||found[0].definitionSignature!==contentSignature(definition))throw new Error(`Glossary revision mismatch: ${term}`);
  }
  const expected=readSelectors(),actual=pkg.records.filter(r=>r.kind==='intervention_selector');
  if(JSON.stringify(expected.map(s=>s.id).sort())!==JSON.stringify(guard.selectorIds))throw new Error('Selector scope changed without delivery-surface review');
  if(expected.length!==actual.length)throw new Error('Incomplete selector census');
  for(const item of expected){const r=actual.find(r=>r.id===`intervention:${item.id}`);if(!r||r.sourceSignature!==item.sourceSignature||contentSignature(r.selector)!==contentSignature(item.selector))throw new Error(`Selector revision mismatch: ${item.id}`);}
  for(const path of DELIVERY_SOURCE_PATHS)if(!pkg.sources.some(s=>s.path===path&&s.sha256===fileHash(readFileSync(path))))throw new Error(`Delivery source absent from manifest: ${path}`);
  const ids=new Set(pkg.records.map(r=>r.id));
  for(const r of entries)for(const link of r.usageReferences||[])if(!ids.has(link.recordId)||pkg.records.find(x=>x.id===link.recordId).sourceSignature!==link.sourceSignature)throw new Error(`Invalid glossary usage reference: ${r.id}`);
  return true;
}
