import {createLocalMcqCandidate,gradeLocalMcqAnswer,planLocalMcqSession} from './lib/mcq-release-candidate.mjs';
import {contentSignature} from './lib/read-learning-pilot-bank.mjs';
const candidate=createLocalMcqCandidate({enabled:process.argv.includes('--enabled'),synthetic:process.argv.includes('--synthetic')});
if(!candidate){console.log(JSON.stringify({status:'DISABLED',activationAllowed:false}));process.exit(0);}
const now=Date.parse('2026-10-18T00:00:00Z'),initial=planLocalMcqSession(candidate,[],{now,setIndex:0});
const q=candidate.questions.get('m032'),miss=gradeLocalMcqAnswer(candidate,q.id,(q.correct+1)%q.opts.length,{eventId:'local-miss',occurredAt:now,setIndex:0}),next=planLocalMcqSession(candidate,[miss.event],{now:now+86400000,setIndex:1});
console.log(JSON.stringify({status:'LOCAL_MCQ_ALGORITHM_REHEARSAL',mode:candidate.mode,effectiveBankMcqs:candidate.effectiveBankMcqs,sourceBoundMcqs:candidate.sourceBoundMcqs,syntheticTestMcqs:candidate.syntheticMcqs,coverage:candidate.coverage,sourceBindings:candidate.sourceBindings,initialCount:initial.actualCount,afterMissCount:next.actualCount,transferTask:next.reviewPlan.tasks.find(t=>t.kind==='transfer')?.status,relatedReview:next.reviewPlan.recommendations.map(r=>({conceptId:r.conceptId,role:r.role})),deterministicPlanRevision:contentSignature(next),humanApproved:false,productionReady:false,activationAllowed:false}));
