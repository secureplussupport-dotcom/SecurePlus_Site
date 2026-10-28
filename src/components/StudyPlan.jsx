import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ArrowRight, CalendarDays, Check, Clock3, Target, X} from 'lucide-react';
import {buildStudyPlan, dateKey, focusOfDay, studyPreferences} from '../lib/studyPlan.js';
import {readStudyProgress, saveStudyPreferences, STUDY_PROGRESS_EVENT, updateStudyProgress} from '../lib/studyProgress.js';
import {meaningfulDailyStreak} from '../lib/dailyStreak.js';
import {progressOwner} from '../lib/liveRefresh.js';
import {useLiveSnapshot} from '../lib/useLiveSnapshot.js';
import {mcqEngineEnabled, mcqEngineRequest} from '../lib/mcqEngineClient.js';
import {CONCEPT_DEEP_DIVES} from '../data/conceptDeepDives.js';
import {getSy0701DeepDiveProfile, sortDeepDivesBySy0701} from '../data/sy0701DeepDiveMap.js';
import {SY0701_ACRONYM_SETS} from '../data/sy0701AcronymFlashcards.js';
import {SY0701_DOMAINS} from '../data/sy0701Domains.js';
import './StudyPlan.css';

const lessons=sortDeepDivesBySy0701(CONCEPT_DEEP_DIVES).map(lesson=>({id:lesson.id,title:lesson.title,minutes:lesson.minutes,domainId:getSy0701DeepDiveProfile(lesson).domainId}));
const loadState=()=>mcqEngineRequest('state');
const domainName=id=>SY0701_DOMAINS.find(d=>d.id===Number(id))?.shortName;
export function useStudyPlan(user,attempts,readiness){
 const owner=progressOwner(user);
 const [dismissed,setDismissed]=useState(null);
 const [revision,setRevision]=useState(0);
 const [storageError,setStorageError]=useState(false);
 useEffect(()=>{const changed=()=>setRevision(n=>n+1);window.addEventListener(STUDY_PROGRESS_EVENT,changed);window.addEventListener('storage',changed);return()=>{window.removeEventListener(STUDY_PROGRESS_EVENT,changed);window.removeEventListener('storage',changed);};},[]);
 const state=useMemo(()=>readStudyProgress(user),[owner,revision]);
 const live=useLiveSnapshot({owner,load:loadState,enabled:Boolean(user)&&user.authProvider==='supabase'&&mcqEngineEnabled,revision:attempts});
 const preferences=useMemo(()=>studyPreferences(state.preferences||{}),[state.preferences]);
 const plan=useMemo(()=>readiness.status==='ready'?buildStudyPlan({preferences,mastery:readiness.concepts,completedLessons:state.completedLessons,lessons,decks:SY0701_ACRONYM_SETS,previous:state.plan}):state.plan,[preferences,readiness.status,readiness.concepts,state.completedLessons,state.plan]);
 useEffect(()=>{if(user&&plan&&plan!==state.plan&&!updateStudyProgress(user,current=>({...current,preferences:current.preferences||preferences,plan})))setStorageError(true);},[owner,plan]);
 const accountAge=Date.now()-Date.parse(user?.accountCreatedAt||user?.joined);
 const initialSetup=!state.popupDone&&accountAge>=0&&accountAge<86400000;
 const save=useCallback(input=>saveStudyPreferences(user,input,{initialSetup}),[owner,initialSetup]);
 const week=plan?.weeks.find(w=>w.start<=dateKey()&&w.end>dateKey())||plan?.weeks.find(w=>w.start>dateKey())||plan?.weeks.at(-1);
 const focus=focusOfDay({retests:live.value?.failed||[],mastery:readiness.concepts,lessons,completedLessons:state.completedLessons,catalogue:readiness.concepts||[],primary:week?.primary});
 const streak=meaningfulDailyStreak({attempts,days:state.days,today:dateKey()});
 return{state,preferences,plan,focus,streak,save,storageError,ready:readiness.status==='ready',focusReady:readiness.status==='ready'&&(user?.authProvider!=='supabase'||live.status==='ready'),retryFocus:live.refresh,retestsReady:live.status==='ready',dismiss:()=>setDismissed(owner),showPopup:Boolean(user)&&user.authProvider==='supabase'&&dismissed!==owner&&!state.popupDone&&accountAge>=0&&accountAge<86400000,stepsDone:Object.values(state.steps).every(Boolean)};
}

function GoalFields({value,onChange,step=null}){
 const set=patch=>onChange({...value,...patch});
 return <>{(step===null||step===0)&&<fieldset><legend><CalendarDays size={19}/> Your exam timeline</legend><label>Planning around<select value={value.targetKind} onChange={e=>set({targetKind:e.target.value,targetMonth:value.targetMonth||value.targetDate.slice(0,7)})}><option value="target-date">Target date (not booked)</option><option value="booked">Booked exam date</option><option value="target-month">Target month (not booked)</option></select></label>{value.targetKind==='target-month'?<label>Target month<input type="month" required value={value.targetMonth||value.targetDate.slice(0,7)} onChange={e=>set({targetMonth:e.target.value})}/><small>Target = the last day of this month. This is not a booking.</small></label>:<label>{value.targetKind==='booked'?'Booked date':'Target date'}<input type="date" required value={value.targetDate} onChange={e=>set({targetDate:e.target.value})}/></label>}</fieldset>}{(step===null||step===1)&&<fieldset><legend><Clock3 size={19}/> Daily commitment</legend><div className="sp-choices">{[20,30,60].map(n=><button type="button" key={n} aria-pressed={Number(value.dailyMinutes)===n} onClick={()=>set({dailyMinutes:n})}>{n}<small>min</small></button>)}</div><label>Or choose your own minutes<input type="number" min="1" max="1440" required value={value.dailyMinutes} onChange={e=>set({dailyMinutes:e.target.value})}/></label></fieldset>}</>;
}
export function StudyGoalPopup({study}){
 const dialog=useRef(null),[step,setStep]=useState(0),[value,setValue]=useState(study.preferences),[error,setError]=useState('');
 useEffect(()=>{const opener=document.activeElement;dialog.current?.showModal();return()=>{dialog.current?.close();if(opener?.isConnected)opener.focus();};},[]);
 const finish=input=>{try{if(!study.save(input)){study.dismiss();return;}study.dismiss();}catch(e){setError(e.message);}};
 return <dialog ref={dialog} className="sp-dialog" onCancel={e=>{e.preventDefault();finish({});}} aria-labelledby="sp-goal-title"><div className="sp-dialog-top"><span>YOUR PLAN · {step+1} / 2</span><button type="button" aria-label="Skip study goals" onClick={()=>finish({})}><X size={22}/></button></div><h2 id="sp-goal-title">Make room for progress.</h2><p>Two choices. Editable later.</p><form onSubmit={e=>{e.preventDefault();if(step===0){try{setValue(studyPreferences(value));setStep(1);}catch(e){setError(e.message);}}else finish(value);}}><GoalFields value={value} onChange={setValue} step={step}/>{error&&<p role="alert">{error}</p>}<div className="sp-actions"><button type="button" className="btn btn-ghost" onClick={()=>finish({})}>Skip · use 6 weeks, 20 min/day</button><button className="btn btn-primary" type="submit">{step===0?'Continue':'Save my plan'}<ArrowRight size={18}/></button></div></form><small>Saved on this device. Edit anytime in Study Plan.</small></dialog>;
}
export function StudyPlanWidget({study,onNavigate,onOpenLesson}){
 if(!study.stepsDone)return <section className="sp-start"><header><span>YOUR FIRST 3 STEPS</span><h2>A little of each.</h2></header><div className="sp-step-grid">{[['mcq','Finish an MCQ set','mcq'],['lesson','Complete a lesson','deep-dives'],['flashcards','Rate a full deck','flashcards']].map(([key,title,view],i)=><button type="button" key={key} onClick={()=>onNavigate(view)}><strong>{study.state.steps[key]?<Check aria-label="Completed"/>:`0${i+1}`}</strong><span>{title}</span><ArrowRight size={18}/></button>)}</div></section>;
 return <section className="sp-widget"><span>FOCUS OF THE DAY</span><h2>{study.focus.title}</h2>{!study.focusReady&&<p role="status">Waiting for your latest retest signals. <button className="btn btn-outline" onClick={study.retryFocus}>Refresh focus</button></p>}{study.focus.concept&&<p>#{study.focus.concept}</p>}<div className="sp-actions"><button className="btn btn-primary" disabled={!study.focusReady} onClick={()=>study.focus.lessonId?onOpenLesson?.(study.focus.lessonId):onNavigate(study.focus.view)}>Continue<ArrowRight size={18}/></button><button className="btn btn-outline" onClick={()=>onNavigate('study-plan')}>View study plan</button></div></section>;
}
export function StudyPlanPage({study,onNavigate,onOpenLesson,onOpenDeck}){
 const [value,setValue]=useState(study.preferences),[notice,setNotice]=useState('');
 useEffect(()=>setValue(study.preferences),[study.preferences]);
 return <main className="sp-page"><header><span>YOUR NEXT WEEKS / SY0-701</span><h1>Study plan.</h1><p>{study.storageError?"Browser storage is unavailable. Changes will not survive a reload.":"Study plan, lesson progress and card activity are saved on this device."}</p></header><section className="sp-focus"><div><Target size={25}/><span>FOCUS OF THE DAY</span></div><h2>{study.focus.title}</h2>{study.focus.concept&&<strong>#{study.focus.concept}</strong>}{!study.retestsReady&&<p>Retest status is loading or unavailable. <button className="btn btn-outline" onClick={study.retryFocus}>Refresh focus</button></p>}<button className="btn btn-primary" disabled={!study.focusReady} onClick={()=>study.focus.lessonId?onOpenLesson(study.focus.lessonId):onNavigate(study.focus.view)}>Continue<ArrowRight size={18}/></button></section><details className="sp-editor"><summary>Edit timeline & daily commitment</summary><form onSubmit={e=>{e.preventDefault();try{setNotice(study.save(value)?'Plan saved. Future weeks updated.':'Unable to save on this device.');}catch(e){setNotice(e.message);}}}><GoalFields value={value} onChange={setValue}/><button className="btn btn-primary" type="submit">Update plan</button><p role="status">{notice}</p></form></details>{study.preferences.targetDate<=dateKey()&&<p role="status">Your target date has arrived or passed. Choose a new target to plan future weeks.</p>}{study.plan?.compressed&&<p>Under two weeks: prioritise due retests and weakest concepts. Unscheduled lessons remain available.</p>}{!study.ready&&<p role="status">Loading mastery. Your saved plan stays in place until it is available.</p>}<div className="sp-weeks">{study.plan?.weeks.map(week=><article key={`${week.index}-${week.start}`}><header><strong>WEEK {week.index}</strong><span>{week.start} → {week.end} (exam day excluded)</span></header><h2>{domainName(week.primary)}</h2><p>Secondary · {domainName(week.secondary)}</p><div className="sp-week-target"><strong>{week.mcqTarget}</strong><span>MCQs this week<br/><small>{week.budgetMinutes} min total · includes lessons & flashcards</small></span></div><ol>{week.lessons.map(lesson=><li key={lesson.id}><button onClick={()=>onOpenLesson(lesson.id)}>{study.state.completedLessons.includes(lesson.id)&&<Check size={16}/>} {lesson.title}<ArrowRight size={16}/></button></li>)}</ol>{week.deck&&<button className="btn btn-outline" onClick={()=>onOpenDeck?.(week.deck.id)}>Flashcards · {week.deck.title}</button>}</article>)}</div>{study.plan?.remainingLessons>0&&<p>{study.plan.remainingLessons} lessons remain outside this schedule. Increase your time or extend your target to include more.</p>}{study.plan?.rollingHorizon&&<p>Showing the next 52 weeks. Extend the plan as you progress.</p>}</main>;
}
