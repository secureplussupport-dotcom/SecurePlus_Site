import {useCallback,useEffect,useMemo,useState} from 'react';
import {supabase} from './supabaseClient.js';
import {firstStepsEligible,onboardingSteps} from './firstSteps.js';
import {diagnosticRecommendations} from './firstStepsRecommendations.js';
import {readStudyProgress,mergeFirstStepsProgress,updateStudyProgress,STUDY_PROGRESS_EVENT} from './studyProgress.js';
import {progressOwner} from './liveRefresh.js';
import {useLiveSnapshot} from './useLiveSnapshot.js';
import {mcqEngineEnabled,mcqEngineRequest} from './mcqEngineClient.js';

const loadDiagnostic=()=>mcqEngineRequest('state');
export function useFirstStepsJourney(user){
 const owner=progressOwner(user),eligible=firstStepsEligible(user),cloud=user?.authProvider==='supabase';
 const [revision,setRevision]=useState(0);
 useEffect(()=>{const change=()=>setRevision(v=>v+1);window.addEventListener(STUDY_PROGRESS_EVENT,change);window.addEventListener('storage',change);return()=>{window.removeEventListener(STUDY_PROGRESS_EVENT,change);window.removeEventListener('storage',change);};},[]);
 const local=useMemo(()=>readStudyProgress(user),[owner,revision]);
 const sync=useCallback(async(acknowledge=false)=>{
  const state=readStudyProgress(user);
  let row;
  if(cloud){
   const response=await supabase.rpc('sync_first_steps',{p_mcq:state.steps.mcq,p_lesson:state.steps.lesson,p_deck:state.journeyDeckCompleted===true,p_acknowledge:acknowledge||Boolean(state.firstStepsCompletion?.celebrationSeenAt),p_timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'});
   if(response.error)throw response.error;
   row=response.data;
  }else{
   const done=onboardingSteps(state).allDone,completedAt=state.firstStepsCompletion?.completedAt||(done?new Date().toISOString():null);
   const time=new Date(completedAt||Date.now());
   const rewardDay=completedAt?`${time.getFullYear()}-${String(time.getMonth()+1).padStart(2,'0')}-${String(time.getDate()).padStart(2,'0')}`:null;
   row={eligible:true,mcq_completed:state.steps.mcq,lesson_completed:state.steps.lesson,deck_completed:state.journeyDeckCompleted===true,completed_at:completedAt,reward_day:rewardDay,celebration_seen_at:state.firstStepsCompletion?.celebrationSeenAt||(completedAt&&acknowledge?new Date().toISOString():null)};
  }
  if(row?.eligible&&!mergeFirstStepsProgress(user,row))throw new Error('Unable to save on this device.');
  return row;
 },[owner,cloud]);
 const load=useCallback(()=>sync(false),[sync]);
 const flagKey=[local.steps.mcq,local.steps.lesson,local.journeyDeckCompleted===true].join(':');
 const live=useLiveSnapshot({owner,load,enabled:eligible&&!local.firstStepsCompletion?.ackSynced,revision:flagKey,pollInterval:0});
 const completedAt=local.firstStepsCompletion?.completedAt;
 const enabled=eligible&&live.value?.eligible!==false;
 const active=enabled&&!completedAt;
 const diagnostic=useLiveSnapshot({owner,load:loadDiagnostic,enabled:active&&cloud&&mcqEngineEnabled,revision:local.steps.mcq,pollInterval:0});
 const recommendations=useMemo(()=>diagnosticRecommendations(diagnostic.value?.diagnostic_weak_tags||[]),[diagnostic.value]);
 const acknowledge=useCallback(async()=>{
  updateStudyProgress(user,state=>({...state,firstStepsCompletion:{...state.firstStepsCompletion,celebrationSeenAt:state.firstStepsCompletion?.celebrationSeenAt||new Date().toISOString()}}));
  try{await sync(true);await live.refresh();}catch{/* Completion is already durable; the next online refresh retries this dismissal. */}
 },[owner,sync,live.refresh]);
 return{enabled,active,steps:onboardingSteps(local),recommendations,status:live.status,error:live.error,retry:live.refresh,
  celebrate:enabled&&Boolean(completedAt)&&!local.firstStepsCompletion?.celebrationSeenAt,
  acknowledge};
}
