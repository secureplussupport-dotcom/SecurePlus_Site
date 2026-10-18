import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readLearningPilotBank,contentSignature} from './read-learning-pilot-bank.mjs';
import {QUESTION_MAPPINGS,CONTENT_MAPPINGS} from '../../src/data/learningMappings.js';
import {LEARNING_CONCEPTS,CONCEPT_RELATIONSHIPS} from '../../src/data/learningConcepts.js';
import {LEARNING_CONFIG,versions} from '../../src/lib/learningConfig.js';
import {compileRevision,gradeRevision,learnerRevision} from '../../server/adaptive/revision.mjs';
import {scheduleConceptReview} from '../../src/lib/reviewScheduler.js';
import {selectTrustedMcqRevisions} from '../../server/adaptive/session-plans.mjs';

// Local rehearsal only. No browser import, database, credential, publication or enrollment capability.
export function createLocalMcqCandidate({enabled=false,synthetic=false}={}) {
 assert.equal(typeof enabled,'boolean');assert.equal(typeof synthetic,'boolean');if(!enabled)return null;
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL_ENV&&!process.env.VERCEL,'Local candidate cannot run in production');
 const bank=readLearningPilotBank().mcqs,questions=new Map(bank.map(q=>[q.id,q]));
 const mappings=QUESTION_MAPPINGS.map(m=>{assert.equal(m.format,'mcq');assert.equal(contentSignature(questions.get(m.questionId)),m.questionRevision,'Effective MCQ mapping source changed');return structuredClone(m);});
 const fixture=JSON.parse(readFileSync(new URL('../fixtures/mcq-release-candidate.json',import.meta.url)));
 assert.equal(fixture.status,'SYNTHETIC_ALGORITHM_TEST_ONLY');assert(!fixture.published&&!fixture.humanApproved);
 if(synthetic)for(const row of fixture.rows){assert(!questions.has(row.question.id));questions.set(row.question.id,row.question);mappings.push({...mappings[0],questionId:row.question.id,questionRevision:contentSignature(row.question),primaryConceptId:row.conceptId,scenarioFamily:row.scenarioFamily,difficulty:row.question.difficulty,cognitiveSkill:'synthetic_algorithm_case',editorialStatus:'synthetic_test_only',provenance:'synthetic_fixture'});}
 const config={...structuredClone(LEARNING_CONFIG),configurationVersion:'mcq-local-rehearsal-v1',allowedReviewStatuses:[...LEARNING_CONFIG.allowedReviewStatuses,...(synthetic?['synthetic_test_only']:[])]};
 const revisions=new Map(mappings.map(m=>[m.questionId,compileRevision(questions.get(m.questionId),'mcq')]));
 const sourceBindings=mappings.map(m=>({questionId:m.questionId,sourceRevision:m.questionRevision,revisionId:revisions.get(m.questionId).revisionId,source:questions.has(m.questionId)&&bank.some(q=>q.id===m.questionId)?'effective_local_mcq':'synthetic_test_only'}));
 for(const m of mappings)m.questionRevision=revisions.get(m.questionId).revisionId;
 const coverage=LEARNING_CONCEPTS.map(c=>{const rows=mappings.filter(m=>m.primaryConceptId===c.id);return{conceptId:c.id,questionCount:rows.length,scenarioFamilies:new Set(rows.map(m=>m.scenarioFamily)).size,synthetic:rows.filter(m=>m.provenance==='synthetic_fixture').length};});
 return{mode:synthetic?'SYNTHETIC_ALGORITHM_TEST':'SOURCE_BOUND_LOCAL_REHEARSAL',config,mappings,concepts:LEARNING_CONCEPTS,contentMappings:CONTENT_MAPPINGS,relationships:CONCEPT_RELATIONSHIPS,questions,revisions,sourceBindings,coverage,effectiveBankMcqs:bank.length,sourceBoundMcqs:QUESTION_MAPPINGS.length,syntheticMcqs:synthetic?fixture.rows.length:0,humanApproved:false,activationAllowed:false,productionReady:false};
}
export function gradeLocalMcqAnswer(candidate,questionId,selectedIndex,{eventId,occurredAt,setIndex}){
 const revision=candidate.revisions.get(questionId),q=candidate.questions.get(questionId);assert(revision&&Number.isInteger(selectedIndex)&&selectedIndex>=0&&selectedIndex<q.opts.length,'Local mapped MCQ and valid choice required');
 const option=revision.components.find(c=>c.label===q.opts[selectedIndex]);assert(option);const selections=[{componentId:option.id,valueId:option.id}],result=gradeRevision(revision,selections);
 return{event:{eventId,kind:'answer',format:'mcq',questionId,questionRevision:revision.revisionId,correct:result.correct,occurredAt,setIndex,...versions(candidate.config)},selections,learner:learnerRevision(revision),score:result.score};
}
export function planLocalMcqSession(candidate,events,{now,setIndex,mode='normal',requestedCount=10,seed='mcq-local-release'}){
 const context={now,setIndex,setSize:requestedCount,mode:mode==='smart_review'?'smart_review':'normal',seed,config:candidate.config,mappings:candidate.mappings,concepts:candidate.concepts,contentMappings:candidate.contentMappings,relationships:candidate.relationships};
 const reviewPlan=scheduleConceptReview(events,context),catalogueMappings=candidate.mappings.map(m=>({revision_id:m.questionRevision,question_id:m.questionId,question_type:'mcq',concept_role:'primary',concept_id:m.primaryConceptId,scenario_family:m.scenarioFamily,difficulty:m.difficulty}));
 const bundle={config:candidate.config,activeRevisionIds:candidate.mappings.filter(m=>m.active!==false).map(m=>m.questionRevision),catalogue:{mappings:catalogueMappings}};
 const revisionIds=selectTrustedMcqRevisions({bundle,reviewPlan,evidence:events.map(e=>({question_id:e.questionId})),requestedCount,mode,seed});
 return{reviewPlan,revisionIds,actualCount:revisionIds.length,requestedCount,reasonCodes:revisionIds.length<requestedCount?['insufficient_approved_coverage']:[],humanApproved:false,activationAllowed:false};
}
