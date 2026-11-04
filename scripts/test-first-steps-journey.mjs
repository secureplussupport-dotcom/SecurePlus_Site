import fs from 'node:fs';
import test from 'node:test';import assert from 'node:assert/strict';
import {firstStepsEligible,onboardingSteps} from '../src/lib/firstSteps.js';
import {diagnosticRecommendations} from '../src/lib/firstStepsRecommendations.js';
import {recordStudyActivity,readStudyProgress,mergeFirstStepsProgress} from '../src/lib/studyProgress.js';
import {meaningfulDailyStreak} from '../src/lib/dailyStreak.js';
const user={id:'journey-test',authProvider:'supabase',accountCreatedAt:'2026-11-04T02:00:00Z'};
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
const row={mcq_completed:true,lesson_completed:true,deck_completed:true,completed_at:'2026-11-04T06:00:00Z',celebration_seen_at:null,reward_day:'2026-11-04'};
test('new accounts qualify; guests and existing accounts do not get a new tour',()=>{
 assert(firstStepsEligible(user));assert(!firstStepsEligible({...user,accountCreatedAt:'2026-11-03T23:59:59Z'}));assert(!firstStepsEligible({...user,authProvider:'guest'}));assert(!firstStepsEligible({authProvider:'supabase'}));
});
test('opening a deck is not completing it, and legacy open flags cannot finish the tour',()=>{
 const db=storage();recordStudyActivity(user,{type:'deck-open'},db);assert(!onboardingSteps(readStudyProgress(user,db)).steps[2].done);
 assert(!onboardingSteps({steps:{flashcards:true}}).steps[2].done);
 recordStudyActivity(user,{type:'deck-complete'},db);assert(onboardingSteps(readStudyProgress(user,db)).steps[2].done);
});
test('any lesson and any complete deck qualify alongside a completed MCQ set',()=>{
 const db=storage();for(const type of ['lesson-complete','deck-complete','mcq-set'])recordStudyActivity(user,{type,lessonId:'chosen-lesson',deckId:'chosen-deck'},db);
 const state=readStudyProgress(user,db);assert(onboardingSteps(state).allDone);assert(!state.firstStepsCompletion?.completedAt,'wait for durable completion before celebrating');
});
test('completion and acknowledgement survive reloads and stale responses',()=>{
 const db=storage();mergeFirstStepsProgress(user,row,db);assert(onboardingSteps(readStudyProgress(user,db)).allDone);
 const seen={...row,celebration_seen_at:'2026-11-04T06:01:00Z'};mergeFirstStepsProgress(user,seen,db);
 mergeFirstStepsProgress(user,{mcq_completed:false,lesson_completed:false,deck_completed:false},db);
 const reloaded=readStudyProgress(user,db);assert.equal(reloaded.firstStepsCompletion.completedAt,row.completed_at);assert.equal(reloaded.firstStepsCompletion.celebrationSeenAt,seen.celebration_seen_at);assert(onboardingSteps(reloaded).allDone);assert.equal(reloaded.firstStepsCompletion.ackSynced,true);
});
test('completion earns one dated streak day even after repeated sync or an already meaningful day',()=>{
 const db=storage();mergeFirstStepsProgress(user,row,db);mergeFirstStepsProgress(user,row,db);
 let state=readStudyProgress(user,db);let streak=meaningfulDailyStreak({days:state.days,today:'2026-11-04'});assert.equal(streak.streak,1);assert(streak.reasons.includes('First 3 steps completed'));
 state.days['2026-11-04'].sections=['lesson:1'];streak=meaningfulDailyStreak({days:state.days,today:'2026-11-04'});assert.equal(streak.streak,1);
 state.days['2026-11-03']={cards:Array.from({length:10},(_,i)=>String(i))};assert.equal(meaningfulDailyStreak({days:state.days,today:'2026-11-04'}).streak,2);
 assert.equal(meaningfulDailyStreak({days:state.days,today:'2026-11-05'}).streak,2,'sync must not invent another day');
});
test('diagnostic recommendations use exact tags, preserve choice, and give no badges without evidence',()=>{
 const sets=[{id:'matched',cards:[{concept_tags:['risk.bia-rto-rpo']}]},{id:'other',cards:[{concept_tags:['iam.mfa']}]}];
 const result=diagnosticRecommendations(['risk.bia-rto-rpo'],sets);assert.deepEqual([...result.deckIds],['matched']);assert(result.lessonIds.has('risk-resilience-governance'));assert.equal(sets.length,2);
 assert.equal(diagnosticRecommendations(null,sets).lessonIds.size,0);
 const empty=diagnosticRecommendations([],sets);assert.equal(empty.deckIds.size,0);assert.equal(empty.lessonIds.size,0);
 const unknown=diagnosticRecommendations(['unknown.tag'],sets);assert.equal(unknown.deckIds.size,0);assert.equal(unknown.lessonIds.size,0);
});

test('every concept in the real 30-question diagnostic has a lesson and flashcard recommendation',()=>{
 const questions=JSON.parse(fs.readFileSync('server/mcq-engine/beginner-diagnostic-bank.json','utf8'));
 assert.equal(questions.length,30);
 for(const tag of new Set(questions.map(q=>q.concept_tag))){const result=diagnosticRecommendations([tag]);assert(result.lessonIds.size>0,tag);assert(result.deckIds.size>0,tag);}
});
