import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readLearningPilotBank,contentSignature} from '../read-learning-pilot-bank.mjs';
import {readAuthoredInputs} from '../read-authored-bank.mjs';
import {readGlossary,readSelectors,readStarterQuestions,DELIVERY_SOURCE_PATHS} from './delivery-inventory.mjs';
import {readGuestPreview} from './guest-preview.mjs';
import {readEditorialSelections,readPrivateProcessing} from './editorial-selections.mjs';
import {publicationPipeline} from './publication.mjs';
import {compileRevision} from '../../../server/adaptive/revision.mjs';
import {PUBLISHED_CONTENT_SNAPSHOT,isSnapshotDisabled} from '../../../src/data/sy0701PublishedSnapshot.js';
import {RETIRED_MCQ_REVIEW} from '../../../src/data/sy0701EditorialReview.js';
import {RETIRED_PBQ_REVIEW} from '../../../src/data/sy0701PbqReview.js';
import {LEARNING_CONCEPTS} from '../../../src/data/learningConcepts.js';
import {QUESTION_MAPPINGS,CONTENT_MAPPINGS} from '../../../src/data/learningMappings.js';
import {CONCEPT_DEEP_DIVES} from '../../../src/data/conceptDeepDives.js';
import {SY0701_ACRONYM_CARDS,SY0701_ACRONYM_SETS} from '../../../src/data/sy0701AcronymFlashcards.js';
import {SY0701_OBJECTIVES,SY0701_DOMAINS,getSy0701DeepDiveProfile} from '../../../src/data/sy0701DeepDiveMap.js';
import {buildDeepDivePracticeQuestions,buildDeepDiveFlashcards} from '../../../src/lib/deepDiveStudy.js';

export const VERSION='sy0701-full-catalogue-editorial-draft-v1';
export const digest=value=>createHash('sha256').update(value).digest('hex');
const slug=value=>String(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const unique=x=>[...new Set(x)].sort();
const sorted=x=>x.sort((a,b)=>a.id.localeCompare(b.id,'en'));
const group=(rows,key)=>Object.fromEntries(unique(rows.map(key)).map(k=>[k,rows.filter(r=>key(r)===k).length]));
export const SOURCE_PATHS=[...new Set([
  'package.json','src/App.jsx', ...readdirSync('src/data').filter(x=>x.endsWith('.js')).map(x=>'src/data/'+x),
  ...DELIVERY_SOURCE_PATHS, 'scripts/lib/content-mapping/guest-preview.mjs','scripts/lib/content-mapping/delivery-inventory.mjs','docs/evidence/phase-2b5/delivery-surface-review.json','src/lib/deepDiveStudy.js','server/adaptive/revision.mjs','src/lib/learningPersistenceContracts.js',
  'scripts/lib/read-authored-bank.mjs','scripts/lib/read-learning-pilot-bank.mjs',
  'scripts/lib/content-mapping/publication.mjs','scripts/lib/content-mapping/package.mjs',
  'scripts/lib/content-mapping/editorial-selections.mjs','docs/phase-2b5-editorial-review-record.md','docs/evidence/phase-2b5/private-p017-processing.json',
  'scripts/build-content-mapping.mjs','scripts/audit-content-mapping.mjs','scripts/reconcile-content-catalogue.mjs',
  ...readdirSync('public').filter(x=>{try{return readdirSync('public/'+x).includes('index.html')}catch{return false}}).map(x=>'public/'+x+'/index.html'),
])].sort();

export function buildPackage() {
  const proof=JSON.parse(readFileSync('docs/evidence/phase-2b5/private-catalogue-read.json'));
  const reconciliation=JSON.parse(readFileSync('docs/evidence/phase-2b5/private-reconciliation.json'));
  const base=readLearningPilotBank(),pipeline=publicationPipeline(base);
  // Only byte-reconciled captured records can be reconstructed. Unknown upserts
  // stay unavailable; they must never be silently replaced by a local payload.
  const safeOverrides=proof.overrides.filter(row=>reconciliation.overrides.some(x=>x.id===row.question_id&&x.kind===row.question_kind&&x.capturedSignatureMatches&&x.payloadMatches));
  const published=pipeline.overrides(safeOverrides);
  const concepts=LEARNING_CONCEPTS.map(c=>({...c,nodeKind:'mastery_concept',status:'existing_pending_human',source:'src/data/learningConcepts.js'}));
  for(const [code,name] of Object.entries(SY0701_OBJECTIVES))concepts.push({id:`sy0701.objective.${code}`,name,nodeKind:'topic',objectiveCodes:[code],status:'proposed_pending_human',source:'src/data/sy0701DeepDiveMap.js'});
  const terms=new Map();
  const addTerm=(name,objectives,source)=>{
    const pilot=LEARNING_CONCEPTS.find(c=>[c.name,...c.aliases].some(x=>x.toLowerCase()===String(name).toLowerCase()));
    if(pilot)return pilot.id;
    const id=`sy0701.term.${slug(name)}`;
    if(!terms.has(id))terms.set(id,{id,name,nodeKind:'supporting_concept',objectiveCodes:[],status:'proposed_pending_human',source:[]});
    const term=terms.get(id);term.objectiveCodes=unique([...term.objectiveCodes,...objectives]);term.source=unique([...term.source,source]);return id;
  };
  for(const c of SY0701_ACRONYM_CARDS)addTerm(c.acronym,c.objectiveCodes,'src/data/sy0701AcronymFlashcards.js');
  for(const d of CONCEPT_DEEP_DIVES){const p=getSy0701DeepDiveProfile(d);for(const k of p.keywordGuide)addTerm(k.term,p.objectiveCodes,'src/data/sy0701DeepDiveMap.js');}
  const glossary=readGlossary();
  for(const term of Object.keys(glossary.terms))addTerm(term,[],'src/App.jsx:GLOSSARY_TERMS');
  concepts.push(...terms.values());
  const rows=[],exclusions=[],issues=[],usageSources=[];
  const strings=value=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(strings):value&&typeof value==='object'?Object.values(value).flatMap(strings):[];
  const issue=(priority,id,reason,decision)=>issues.push({id:`${id}:${reason}`,priority,recordId:id,reason,decision,status:'open'});
  function row(id,kind,source,value,objectives=[],extra={}) {
    const codes=unique(objectives.filter(Boolean));
    const r={id,kind,source,sourceSignature:contentSignature(value),publicationStatus:'active',evidenceScope:'local_effective_source',objectiveCodes:codes,domainIds:unique(codes.map(c=>c.split('.')[0])),mappingVersion:VERSION,reviewStatus:'pending',trustedRevisionId:null,contentSha256:null,confidence:'low',precision:['pbq','lesson_check'].includes(kind)?'coarse':'support_only',primaryRole:'primary',secondaryRole:'secondary',weightPolicy:'proposal_only_no_runtime_effect',primaryConceptId:null,secondaryConceptIds:[],candidateConceptIds:codes.filter(c=>SY0701_OBJECTIVES[c]).map(c=>`sy0701.objective.${c}`),weight:0,scenarioFamily:null,novelty:'unreviewed',rationale:'Objective metadata supplies support-only topic candidates; it does not identify the concept being tested.',...extra};
    if(!codes.length)issue('P1',id,'missing_objective','Assign the exact SY0-701 objective or explicitly mark outside exam scope.');
    for(const c of codes)if(!SY0701_OBJECTIVES[c])issue('P0',id,'invalid_objective','Resolve the unknown objective code against the approved syllabus.');
    r.persistenceContentKind=({flashcard:'flashcard',lesson:'lesson',lesson_section:'lesson_section',lesson_check:'lesson_check'})[kind]||null;
    rows.push(r);
    if(['mcq','pbq','lesson','flashcard','starter_question'].includes(kind)&&!id.startsWith('private:'))usageSources.push({record:r,matches:new Set(strings(value).flatMap(glossary.matchTerms))});
    return r;
  }
  const addTerms=(r,text)=>{
    const corpus=String(text).toLowerCase();
    const matched=concepts.filter(c=>c.nodeKind!=='topic'&&[c.name,...(c.aliases||[])].some(term=>{
      const escaped=term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      return term.length>=3&&new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`,'i').test(corpus);
    })).map(c=>c.id);
    r.candidateConceptIds=unique([...r.candidateConceptIds,...matched]);
    if(matched.length)r.rationale+=' Literal terms from the stem or instructional text are candidates only; no answer choices or grading key selected these candidates.';
  };
  for(const kind of ['mcq','pbq'])for(const q of published[kind+'s']) {
    // Ordering metadata is presentation-only. Bind the reviewed local revision
    // separately from the exact published object signature.
    const local=base[kind+'s'].find(x=>x.id===q.id);
    const r=row(`${kind}:${q.id}`,kind,'src/App.jsx + editorial publication pipeline',q,[q.objective],{questionId:q.id,localRevisionSignature:contentSignature(local),precision:kind==='pbq'?'coarse':'direct',questionFormat:kind==='mcq'?'MCQ':q.type,domainIds:[String(q.ch)],evidenceScope:'local_source_and_authenticated_override_fingerprints',duplicateStemSignature:contentSignature(String(q.q||[q.scenario,q.question].join(' ')).toLowerCase().replace(/\s+/g,' ').trim())});
    try{const revision=compileRevision(q,kind);r.trustedRevisionId=revision.revisionId;r.contentSha256=revision.contentSha256;}
    catch{r.revisionLimitation='Current trusted compiler rejects this grammar or fields; no runtime revision invented.';issue('P1',r.id,'unsupported_revision','Review compiler support separately; keep this revision unavailable to adaptive ingestion.');}
    addTerms(r,q.q||[q.title,q.scenario,q.question].join(' '));
    const pilot=kind==='mcq'?QUESTION_MAPPINGS.find(m=>m.questionId===q.id):undefined;
    if(pilot&&pilot.questionRevision===contentSignature(local))Object.assign(r,{primaryConceptId:pilot.primaryConceptId,secondaryConceptIds:pilot.secondaryConceptIds,confidence:'medium',reviewStatus:'agent_reviewed_pending_human',scenarioFamily:pilot.scenarioFamily,novelty:'existing_pilot_family_not_independently_approved',weight:kind==='mcq'?1:0,rationale:'Existing MCQ-only pilot editorial mapping matches its exact source revision; it is not human approval.'});
    else {if(pilot)issue('P0',r.id,'stale_mapping','Re-review the changed source revision; do not reuse its previous mapping.');issue('P1',r.id,'concept_and_family_review','Read the effective question in the secured source view, choose primary/secondary canonical concepts, resolve candidates, and assign a justified family and novelty decision.');}
    if(proof.pbqs.some(p=>p.id===q.id)&&kind==='pbq'){r.publicationStatus='active_local_fallback';issue('P0',r.id,'private_variant','Keep fallback and private revisions separate; review the later private publication before claiming complete mapping.');}
    row(`explanation:${kind}:${q.id}`,'explanation_bundle',r.source,{exp:q.exp,explanation:q.explanation,wrongFeedback:q.wrongFeedback,optionFeedback:q.optionFeedback,items:q.items,blanks:q.blanks,selectionFeedback:q.selectionFeedback},[q.objective],{parentId:r.id,candidateConceptIds:unique([...r.candidateConceptIds,...[r.primaryConceptId,...r.secondaryConceptIds].filter(Boolean)]),rationale:'One explanation bundle per question; no option-indexed feedback is exported because that can reveal the key.'});
  }
  for(const p of proof.pbqs) {
    const r=row(`private:pbq:${p.id}`,'pbq','public.pbqs metadata SELECT',p,[p.objective],{questionId:p.id,publicationStatus:'private_active_revision',evidenceScope:'authenticated_metadata_only_semantics_unreviewed',sourceSignature:`sha256:${p.payload_sha256}`,domainIds:[String(p.domain)],precision:'coarse',questionFormat:p.type,rationale:'A later private publication wins for eligible callers. Only metadata/fingerprints were inspected; semantic mapping and trusted revision compilation remain unresolved.'});
    row(`private:explanation:pbq:${p.id}`,'explanation_bundle','public.pbqs metadata SELECT',p,[p.objective],{parentId:r.id,publicationStatus:'private_active_revision',evidenceScope:'authenticated_metadata_only_semantics_unreviewed',sourceSignature:`sha256:${p.payload_sha256}`,rationale:'Parent private payload fingerprint only; the explanation bundle is not independently extracted or semantically reviewed.'});
    issue('P0',r.id,'private_source_review','Review the exact private payload inside an approved secured environment; map the revision and compile its ID without adding grading content to review exports.');
  }
  for(const p of proof.overrides.filter(x=>!safeOverrides.includes(x))) {
    row(`private:override:${p.question_kind}:${p.question_id}`,'private_override','public.question_overrides metadata SELECT',p,[],{sourceSignature:`sha256:${p.payload_sha256}`,publicationStatus:p.status==='active'?'private_active_revision':'draft',evidenceScope:'authenticated_metadata_only_semantics_unreviewed'});
    issue('P0',`private:override:${p.question_kind}:${p.question_id}`,'unreconciled_override','Resolve the private revision before publishing a complete effective-bank census.');
  }
  for(const c of SY0701_ACRONYM_CARDS){const concept=addTerm(c.acronym,c.objectiveCodes,'src/data/sy0701AcronymFlashcards.js');const r=row(`flashcard:${c.id}`,'flashcard','src/data/sy0701AcronymFlashcards.js',c,c.objectiveCodes,{primaryConceptId:concept,confidence:'medium',rationale:'Card subject identifies a support concept; inherited deck objectives need card-level review. Reading a card is not mastery evidence.'});const pilot=CONTENT_MAPPINGS.find(m=>m.contentId===c.id);if(pilot)r.primaryConceptId=pilot.conceptIds[0];}
  for(const set of SY0701_ACRONYM_SETS)row(`deck:${set.id}`,'deck_container','src/data/sy0701AcronymFlashcards.js',set,set.objectiveCodes,{rationale:'Container overlaps its cards; never add its count to unique instructional-item coverage.'});
  for(const d of CONCEPT_DEEP_DIVES){const p=getSy0701DeepDiveProfile(d),objectives=p.objectiveCodes;
    const lesson=row(`lesson:${d.id}`,'lesson','src/data/conceptDeepDives.js and imported guides',{d,profile:p},objectives);addTerms(lesson,[d.title,d.summary,...d.aliases].join(' '));
    d.sections.forEach((s,i)=>{const r=row(`section:${d.id}:${i}`,'lesson_section','src/data/conceptDeepDives.js and imported guides',s,objectives,{parentId:lesson.id,scope:p.beyondSections.includes(i)?'beyond_textbook':'exam',rationale:'Section inherits lesson objectives; exact section-level objectives and concept roles need editorial review.'});addTerms(r,JSON.stringify(s));if(d.id==='resilience-assets-physical'&&i===1){r.secondaryConceptIds=['recovery.rto','recovery.rpo','recovery.mttr'];r.confidence='medium';}});
    row(`keywords:${d.id}`,'keyword_guide','src/data/sy0701DeepDiveMap.js',p.keywordGuide,objectives,{parentId:lesson.id,candidateConceptIds:unique(p.keywordGuide.map(k=>addTerm(k.term,objectives,'src/data/sy0701DeepDiveMap.js')))});
    row(`traps:${d.id}`,'lesson_traps','src/data/conceptDeepDives.js and imported guides',d.traps,objectives,{parentId:lesson.id});
    if(d.check)row(`check:${d.id}`,'lesson_check','src/data/conceptDeepDives.js and imported guides',d.check,objectives,{parentId:lesson.id,rationale:'Self-check has no trusted adaptive revision; model answer is withheld from artifacts.'});
    buildDeepDivePracticeQuestions(d).forEach((q,i)=>{if(i<3)row(`practice:${q.id}`,'lesson_check','src/lib/deepDiveStudy.js',q,objectives,{parentId:lesson.id,rationale:'Displayed generated check; support-only lesson topic candidates. Correct-answer term is deliberately not exported as a mapping.'});else exclusions.push({id:`practice:${q.id}`,kind:'lesson_check',status:'not_delivered',reason:'App displays only the first three generated practice questions.',sourceSignature:contentSignature(q)});});
    for(const c of buildDeepDiveFlashcards(d))exclusions.push({id:`unused-card:${c.id}`,kind:'flashcard',status:'not_delivered',reason:'Helper output is not imported by the app.',sourceSignature:contentSignature(c)});
  }
  for(const path of SOURCE_PATHS.filter(p=>p.startsWith('public/')))row(`page:${path}`,'public_learning_page',path,readFileSync(path,'utf8'),[],{rationale:'Public instructional/SEO page recorded separately. No adaptive content-kind adapter or reviewed semantic mapping exists.'});
  const starters=readStarterQuestions();
  for(const [level,questions] of Object.entries(starters.sets))for(const q of questions){
    const r=row(`starter:${q.id}`,'starter_question','src/App.jsx:ATHENA_STARTER_QUESTION_SETS',q,[],{contentId:q.id,domainIds:[String(q.ch)],experienceLevel:level,definitionSource:starters.provenance,precision:'direct',rationale:'Delivered signup diagnostic and general-diagnostic fallback; separate from the 395-question MCQ bank. No existing trusted grammar accepts this identity. Objective/concept/family mapping remains unresolved.'});
    addTerms(r,q.q);issue('P1',r.id,'starter_semantic_review','Map the exact standalone starter revision, objective and family; define an approved identity adapter before adaptive use.');
    row(`explanation:starter:${q.id}`,'explanation_bundle',r.source,{exp:q.exp,wrongFeedback:q.wrongFeedback},[],{parentId:r.id,domainIds:[String(q.ch)],rationale:'Starter explanation bundle; answer and feedback values are withheld from review exports.'});
  }
  for(const [term,definition] of Object.entries(glossary.terms)){
    const refs=usageSources.filter(item=>item.matches.has(term)).map(({record:r})=>({recordId:r.id,sourceSignature:r.sourceSignature})).sort((a,b)=>a.recordId.localeCompare(b.recordId,'en'));
    const objectiveCodes=unique(usageSources.filter(item=>item.matches.has(term)).flatMap(({record:r})=>r.objectiveCodes));
    const r=row(`glossary:${encodeURIComponent(term.toLowerCase())}`,'glossary_definition','src/App.jsx:GLOSSARY_TERMS',{term,definition},objectiveCodes,{term,definitionSource:glossary.definitionLocations[term],definitionSignature:contentSignature(definition),primaryConceptId:addTerm(term,[],'src/App.jsx:GLOSSARY_TERMS'),confidence:'low',publicationStatus:'available_conditional',sourceUnits:glossary.sourceUnits,usageReferences:refs,usageStatus:refs.length?'observed_local_source_reference':'no_local_reference_observed',objectiveProvenance:'Union of referencing source tags; broad candidates, not a reviewed definition-to-objective mapping.',rationale:'Separately authored inline definition. All definitions are retained because current-corpus absence cannot prove unused across private/live inputs. Lexical source linkage does not prove tooltip delivery or mastery.'});
    if(!refs.length)issue('P1',r.id,'glossary_usage_unconfirmed','Confirm delivery against private/runtime text before retiring this definition; no local source reference was observed.');
  }
  const guest=readGuestPreview();
  for(const item of guest.records){row(item.id,item.kind,item.source,item,[],item);issue('P1',item.id,'guest_demo_editorial_scope','Review this exact marketing teaching revision, objective/concept scope and learner claims. Keep it outside adaptive evidence until separately approved.');}
  exclusions.push(...guest.exclusions);
  for(const item of readSelectors())row(`intervention:${item.id}`,'intervention_selector',item.selector.sourceUnits.map(s=>s.path).join(' + '),item,[],{sourceSignature:item.sourceSignature,selector:item.selector,rationale:item.selector.inclusionRationale});
  exclusions.push({id:'selector:unwired-adaptive-model',kind:'selector_exclusion',status:'not_delivered',reason:'src/lib/reviewScheduler.js and server/adaptive selectors remain unwired. Their tests do not establish current learner delivery.'},{id:'selector:admin-and-account-actions',kind:'selector_exclusion',status:'outside_learning_selection',reason:'Admin editing, access/payment decisions, cosmetic preferences and account actions are not learning-content selectors. Entitlement inputs are documented on the delivered selectors that use them.'},{id:'selector:learner-instance-outputs',kind:'selector_exclusion',status:'unavailable_not_queried',reason:'Saved, starred and personalized selection instances depend on learner records. Algorithms are inventoried; actual learner inputs/outputs are not read.'});
  const editorialSelections=readEditorialSelections(rows);
  const privateRevisionProcessing=readPrivateProcessing();
  for(const d of editorialSelections.decisions){
    for(const id of [d.selectedRecordId,d.nonselectedRecordId])rows.find(r=>r.id===id).editorialSourceSelection={decisionId:d.id,selectedForFutureCanonicalMapping:id===d.selectedRecordId,changesPublication:false};
    const pending=issues.find(i=>i.recordId==='pbq:'+d.questionId&&i.reason==='private_variant');
    pending.reason='source_selection_followup';pending.id=pending.recordId+':'+pending.reason;
    pending.priority=d.questionId==='p003'?'P0':'P1';
    pending.decision=d.questionId==='p003'?'Local p003 is selected for future canonical mapping, but the newer private publication still wins for eligible live callers. Resolve this delivery/selection divergence only through a separately authorized publication decision.':'Local p017 is not selected for future canonical mapping, but remains a delivered fallback. Retain its census, explanation and unresolved semantics; decide future fallback handling separately.';
  }
  const authored=readAuthoredInputs();
  for(const kind of ['mcq','pbq'])for(const [layer,items] of Object.entries({authored:authored.authored[kind],imported:authored.imported[kind]}))for(const q of items){const active=published[kind+'s'].some(x=>x.id===q.id);const retired=(kind==='mcq'?RETIRED_MCQ_REVIEW:RETIRED_PBQ_REVIEW)[q.id];exclusions.push({id:`${layer}:${kind}:${q.id}`,kind,status:retired?'retired':isSnapshotDisabled(q.id,kind)?'disabled':authored.excluded[kind].includes(q.id)?'low_quality_excluded':active?'superseded_source_layer':'unavailable',reason:retired?'Editorial retirement':isSnapshotDisabled(q.id,kind)?'Published disable':active?'Use final effective revision, not this raw layer.':'Not present in effective local bank',sourceSignature:contentSignature(q)});}
  for(const p of PUBLISHED_CONTENT_SNAPSHOT)exclusions.push({id:`snapshot:${p.question_kind}:${p.question_id}`,kind:p.question_kind,status:p.action==='disable'?'disabled':'superseded_source_layer',reason:'Captured payload merges before editorial corrections; current matching override does not reapply payload.',sourceSignature:contentSignature(p)});
  exclusions.push({id:'learner-private-content',kind:'external_scope',status:'unavailable_not_queried',reason:'User-created decks, saved selections and learner records are outside this authored-content census.'},{id:'external-unpublished-drafts',kind:'external_scope',status:'unavailable',reason:'No evidence of completeness for unpublished local editor state, storage objects, or external authoring systems.'});
  for(const r of rows.filter(r=>['mcq','pbq'].includes(r.kind)&&r.primaryConceptId))issue('P1',r.id,'pilot_human_review','Confirm or reject the existing pilot mapping against this exact revision; agent review is not human approval.');
  // Add a decision for every instructional proposal, including support-only ones.
  for(const r of rows.filter(r=>!['mcq','pbq','private_override'].includes(r.kind)))issue('P2',r.id,'instructional_mapping_review','Confirm exact revision, concept scope, objective specificity, role and usefulness after a miss; do not treat exposure as mastery.');
  for(const c of concepts.filter(c=>c.status==='proposed_pending_human'))issue('P1',c.id,'taxonomy_review','Confirm stable canonical identity, merge synonyms, split overloaded terms, and decide whether a support node warrants a separately assessed mastery concept.');
  for(const finding of detectCatalogueIssues(rows,concepts))issue(finding.priority,finding.recordId,finding.reason,finding.decision);
  const matrices={byKind:group(rows,r=>r.kind),byConfidence:group(rows,r=>r.confidence),byEvidenceScope:group(rows,r=>r.evidenceScope),byNovelty:group(rows,r=>r.novelty),byFamily:group(rows,r=>r.scenarioFamily||'unassigned'),byObjective:{},byDomain:{},byConcept:{}};
  for(const code of Object.keys(SY0701_OBJECTIVES))matrices.byObjective[code]={rows:rows.filter(r=>r.objectiveCodes.includes(code)).length,mcqs:rows.filter(r=>r.kind==='mcq'&&r.objectiveCodes.includes(code)).length,confirmedConceptMappings:rows.filter(r=>r.kind==='mcq'&&r.primaryConceptId&&r.objectiveCodes.includes(code)).length};
  const mcqCount=rows.filter(r=>r.kind==='mcq').length;
  for(const d of SY0701_DOMAINS){const count=rows.filter(r=>r.kind==='mcq'&&r.domainIds.includes(String(d.id))).length;matrices.byDomain[d.id]={mcqs:count,bankPercent:Number((count/mcqCount*100).toFixed(2)),blueprintWeight:d.weight,deltaPercentagePoints:Number((count/mcqCount*100-d.weight).toFixed(2))};}
  for(const c of concepts){const direct=rows.filter(r=>r.kind==='mcq'&&r.primaryConceptId===c.id);const support=rows.filter(r=>!['mcq','pbq'].includes(r.kind)&&(r.primaryConceptId===c.id||r.secondaryConceptIds.includes(c.id)));const families=unique(direct.map(r=>r.scenarioFamily).filter(Boolean));matrices.byConcept[c.id]={directMcqs:direct.length,supportRecords:support.length,candidateRecords:rows.filter(r=>r.candidateConceptIds.includes(c.id)).length,reviewedFamilyCount:families.length,humanApprovedFamilyCount:0};if(c.nodeKind==='mastery_concept'&&families.length<3)issue('P1',c.id,'independent_family_shortage','Commission or approve at least three genuinely independent scenario families before post-miss transfer claims.');if(!support.length)issue('P2',c.id,'missing_mapped_intervention','Find or author an exact mapped instructional intervention; candidate mentions are not sufficient.');if(!direct.length)issue('P2',c.id,'no_direct_assessment','Review the assessment gap; support concepts need not become mastery nodes.');}
  for(const r of rows)r.proposedConceptLinks=[...(r.primaryConceptId?[{conceptId:r.primaryConceptId,role:'primary',weight:r.weight}]:[]),...r.secondaryConceptIds.map(conceptId=>({conceptId,role:'secondary',weight:0})),...r.candidateConceptIds.filter(id=>id!==r.primaryConceptId&&!r.secondaryConceptIds.includes(id)).map(conceptId=>({conceptId,role:'unresolved_candidate',weight:0}))];
  return {schemaVersion:1,mappingVersion:VERSION,adaptiveScope:{eligibleQuestionKinds:['mcq'],effectiveMcqs:mcqCount,mappedMcqs:rows.filter(r=>r.kind==='mcq'&&r.primaryConceptId).length,unmappedMcqs:rows.filter(r=>r.kind==='mcq'&&!r.primaryConceptId).length,pbqsExcluded:true,syntheticFixturesIncluded:false,approvedForActivation:false},verdict:'NOT READY',activationAllowed:false,humanApproved:false,scope:'Source-level delivery census plus authenticated catalogue fingerprints. No browser-session or private semantic completeness claim.',editorialSelections,privateRevisionProcessing,sources:SOURCE_PATHS.map(path=>({path,sha256:digest(readFileSync(path))})),counts:{sourceSelections:editorialSelections.decisions.length,reconciledSourceSelectionAspects:editorialSelections.decisions.length*2,records:rows.length,mcqs:mcqCount,localPbqs:published.pbqs.length,guestDemoRecords:rows.filter(r=>r.scope==='marketing_teaching_demo').length,guestDemoAssessments:rows.filter(r=>['guest_demo_mcq','guest_demo_pbq'].includes(r.kind)).length,starterQuestions:rows.filter(r=>r.kind==='starter_question').length,glossaryDefinitions:rows.filter(r=>r.kind==='glossary_definition').length,glossaryWithLocalReferences:rows.filter(r=>r.kind==='glossary_definition'&&r.usageReferences.length).length,deliveredSelectors:rows.filter(r=>r.kind==='intervention_selector').length,privatePbqVariants:proof.pbqs.length,primaryQuestionProposals:rows.filter(r=>['mcq','pbq'].includes(r.kind)&&r.primaryConceptId).length,unresolvedQuestionMappings:rows.filter(r=>['mcq','pbq','starter_question','guest_demo_mcq','guest_demo_pbq'].includes(r.kind)&&!r.primaryConceptId).length,concepts:concepts.length,exclusions:exclusions.length,reviewQueue:issues.length},concepts:sorted(concepts),records:sorted(rows),exclusions:sorted(exclusions),matrices,reviewQueue:issues.sort((a,b)=>a.priority.localeCompare(b.priority)||a.id.localeCompare(b.id,'en'))};
}

// Pure checks also accept adversarial fixture catalogues, so a clean current
// bank cannot conceal a detector that never fires.
export function detectCatalogueIssues(rows,concepts,mappings=QUESTION_MAPPINGS) {
  const out=[];
  const add=(priority,recordId,reason,decision)=>out.push({priority,recordId,reason,decision});
  const byStem=new Map(),byId=new Map();
  const conceptIds=new Set(concepts.map(c=>c.id));
  for(const r of rows){
    byId.set(r.id,(byId.get(r.id)||0)+1);
    if(r.duplicateStemSignature)byStem.set(r.duplicateStemSignature,[...(byStem.get(r.duplicateStemSignature)||[]),r.id]);
    for(const id of [r.primaryConceptId,...r.secondaryConceptIds,...r.candidateConceptIds].filter(Boolean))if(!conceptIds.has(id))add('P0',r.id,'orphan_concept_reference','Repair the missing canonical concept reference.');
    if(r.objectiveCodes.length&&r.domainIds.some(d=>!r.objectiveCodes.some(o=>o.startsWith(d+'.'))))add('P0',r.id,'domain_conflict','Resolve conflicting domain and objective metadata.');
  }
  for(const [id,count] of byId)if(count>1)add('P0',id,'duplicate_identity','Resolve duplicate catalogue record identities.');
  for(const ids of byStem.values())if(ids.length>1)for(const id of ids)add('P1',id,'duplicate_stem','Review duplicate/near-duplicate family membership; exact stem match must not count as independent novelty.');
  for(const m of mappings)if(!rows.some(r=>r.questionId===m.questionId&&r.localRevisionSignature===m.questionRevision))add('P0',m.questionId,'orphan_or_stale_mapping','Remove or re-review the mapping; it has no exact active local revision.');
  for(const c of concepts)if(!rows.some(r=>r.primaryConceptId===c.id||r.secondaryConceptIds.includes(c.id)||r.candidateConceptIds.includes(c.id)))add('P2',c.id,'orphan_concept','Find exact supporting content or remove the unused proposed node.');
  return out;
}
