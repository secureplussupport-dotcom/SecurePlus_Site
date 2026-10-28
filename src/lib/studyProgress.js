import {studyPreferences} from './studyPlan.js';
import {progressOwner}from'./liveRefresh.js';
export const STUDY_PROGRESS_EVENT='secureplus-study-progress';
export const studyStorageKey=user=>`secureplus-study:v1:${progressOwner(user)}`;
const browserStorage=()=>{try{return globalThis.localStorage;}catch{return null;}};
const empty=()=>({version:1,preferences:null,popupDone:false,plan:null,days:{},steps:{mcq:false,lesson:false,flashcards:false},completedLessons:[],resume:null});
export function readStudyProgress(user,storage=browserStorage()){
 try{const value=JSON.parse(storage?.getItem(studyStorageKey(user))||'null');return value?.version===1?{...empty(),...value,days:value.days&&typeof value.days==='object'&&!Array.isArray(value.days)?value.days:{},completedLessons:Array.isArray(value.completedLessons)?value.completedLessons.filter(id=>typeof id==='string'):[],steps:{mcq:value.steps?.mcq===true,lesson:value.steps?.lesson===true,flashcards:value.steps?.flashcards===true}}:empty();}catch{return empty();}
}
export function updateStudyProgress(user,update,storage=browserStorage()){
 try{const next=update(readStudyProgress(user,storage));storage.setItem(studyStorageKey(user),JSON.stringify(next));globalThis.window?.dispatchEvent(new Event(STUDY_PROGRESS_EVENT));return true;}catch{return false;}
}
export function recordStudyActivity(user,{type,id,lessonId,deckId,index=0,order=[],title='',at=new Date().toISOString()},storage=browserStorage()){
 if(!user||user.authProvider==='guest')return false;
 const time=new Date(at);if(!Number.isFinite(time.getTime()))return false;
 const date=`${time.getFullYear()}-${String(time.getMonth()+1).padStart(2,'0')}-${String(time.getDate()).padStart(2,'0')}`;
 return updateStudyProgress(user,state=>{
  const days={...state.days},entry={sections:Array.isArray(days[date]?.sections)?days[date].sections:[],cards:Array.isArray(days[date]?.cards)?days[date].cards:[],challenge:days[date]?.challenge===true,mcqsBaseline:days[date]?.mcqsBaseline||0,cardsBaseline:days[date]?.cardsBaseline||0},steps={...state.steps};
  if(type==='lesson-section')entry.sections=[...new Set([...entry.sections,id])];
  if(type==='card-rated')entry.cards=[...new Set([...entry.cards,id])];
  if(type==='daily-challenge')entry.challenge=true;
  if(type==='mcq-set')steps.mcq=true;
  if(type==='deck-complete'||type==='deck-open')steps.flashcards=true;
  const completedLessons=type==='lesson-complete'?[...new Set([...state.completedLessons,lessonId])]:state.completedLessons;
  if(type==='lesson-complete')steps.lesson=true;
  if(['lesson-section','card-rated','daily-challenge'].includes(type))days[date]=entry;
  const resume=type==='deck-resume'?{setId:deckId,title,index,order,updatedAt:at}:state.resume;
  return{...state,days,steps,completedLessons,resume};
 },storage);
}

export function saveStudyPreferences(user,input,{initialSetup=false,storage=browserStorage()}={}){
 const preferences=studyPreferences(input);
 return updateStudyProgress(user,current=>({...current,preferences,popupDone:true,plan:initialSetup?null:current.plan}),storage);
}

// Carry over explicit dated activity and completed onboarding steps from PR #2.
// Its numeric streak seed and section-open counts cannot prove completed days.
export function importLegacyStudyProgress(user,{steps={},days={}}={},storage=browserStorage()){
 const current=readStudyProgress(user,storage);if(current.legacyImported)return true;
 return updateStudyProgress(user,state=>{
  const mergedDays={...state.days};
  for(const [date,entry]of Object.entries(days||{})){
   if(!entry||!/^\d{4}-\d{2}-\d{2}$/.test(date))continue;
   const existing=mergedDays[date]||{};
   mergedDays[date]={...existing,mcqsBaseline:Math.max(0,Number(entry.mcq)||0),cardsBaseline:Math.max(0,Number(entry.flashcards)||0),challenge:Boolean(existing.challenge||entry.dailyChallenge)};
  }
  return{...state,legacyImported:true,days:mergedDays,steps:{mcq:state.steps.mcq||Boolean(steps?.['mcq-set']),lesson:state.steps.lesson||Boolean(steps?.lesson),flashcards:state.steps.flashcards||Boolean(steps?.deck)}};
 },storage);
}
