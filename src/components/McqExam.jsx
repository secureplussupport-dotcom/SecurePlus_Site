import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, ChevronRight, Clock3, Flag, HelpCircle, ListChecks, RotateCcw, X } from 'lucide-react';
import { useQuestionPacing } from '../lib/useQuestionPacing.js';
import { McqSetResults } from './McqSetResults.jsx';
import { advanceConceptStreak, buildMcqResultSummary } from '../lib/mcqResultSummary.js';
import { examConceptTag, examTiming, formatExamTime } from '../lib/mcqExam.js';
import { mcqEngineEnabled, mcqEngineRequest, recordStandaloneMcq } from '../lib/mcqEngineClient.js';
import './McqExam.css';

const freshQuestions = questions => questions.map(question => ({ ...question, engineAnswerEventId: crypto.randomUUID() }));
export const examThemeVars = t => ({ '--exam-text': t.text, '--exam-muted': t.textSec, '--exam-surface': t.surface, '--exam-panel': t.panel, '--exam-border': t.border, '--exam-accent': t.accent, '--exam-green': t.green, '--exam-red': t.red, '--exam-amber': t.amber });

export function ExamModeGuide({ t, onClose }) {
  const dialog = useRef(null);
  const [step, setStep] = useState(0);
  const [flagged, setFlagged] = useState(false);
  const slides = [
    { title: 'Set your challenge.', body: 'Choose your question count. The clock scales with it: 60 seconds per question. Free accounts can choose 10, 20 or 30; Pro can choose any count up to 90.' },
    { title: 'A fresh mix. No hints.', body: 'Heavyweight concepts are sampled more often than Standard, then Niche. Concept repetition is capped. Smart Review, custom filters and clickable definitions stay off during the exam.' },
    { title: 'Keep moving. Come back.', body: 'Use the answer map to jump between questions. Flag anything uncertain and cross out weak options with Strike, a right-click or a long press. Try flagging the sample question below.' },
    { title: 'One submit. A clearer picture.', body: 'Nothing is marked until you submit. Your report shows accuracy, domains and time—not a pass or fail. Review every answer with definitions restored, or retake the same exam.' },
  ];
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="mcq-exam-guide" style={examThemeVars(t)} aria-labelledby="exam-guide-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="exam-guide-top"><span><HelpCircle size={16}/> EXAM FIELD GUIDE</span><button type="button" className="btn btn-ghost" onClick={onClose}>Skip guide <X size={15}/></button></div>
    <div className="exam-guide-visual" aria-label={`Guide illustration ${step + 1}`}>
      {step === 0 && <><span className="exam-guide-orbit"><Clock3 size={40}/></span><div className="exam-guide-counts"><span>10<small>10 min</small></span><span>20<small>20 min</small></span><span>90<small>90 min · Pro</small></span></div></>}
      {step === 1 && <div className="exam-guide-weights">{[['Heavyweight',3],['Standard',2],['Niche',1]].map(([label,weight])=><div key={label}><span>{label}</span><div>{Array.from({length:weight},(_,i)=><i key={i}/>)}</div><strong>{weight}×</strong></div>)}</div>}
      {step === 2 && <div className="exam-guide-demo"><div className="exam-guide-map">{[1,2,3,4,5].map(n=><span key={n} className={n===3&&flagged?'flagged':''}>{n===3&&flagged?<Flag size={16}/>:n}</span>)}</div><button className="btn btn-outline" onClick={()=>setFlagged(value=>!value)}><Flag size={16}/>{flagged?'Flagged—find it later':'Flag sample question 3'}</button></div>}
      {step === 3 && <div className="exam-guide-finish"><ListChecks size={44}/><span>Answer → Submit → Understand</span><small>Definitions return in answer review.</small></div>}
    </div>
    <div className="exam-guide-copy" key={step}><span>STEP {step+1} OF 4</span><h2 id="exam-guide-title">{slides[step].title}</h2><p>{slides[step].body}</p></div>
    <div className="exam-guide-footer"><button className="btn btn-ghost" disabled={step===0} onClick={()=>setStep(step-1)}><ArrowLeft size={15}/>Back</button><nav aria-label="Exam guide steps">{slides.map((_,i)=><button key={i} aria-label={`Guide step ${i+1}`} aria-current={i===step?'step':undefined} onClick={()=>setStep(i)}/>)}</nav><button className="btn btn-primary" onClick={()=>step===3?onClose():setStep(step+1)}>{step===3?'Ready to begin':'Next'}<ArrowRight size={15}/></button></div>
  </dialog>;
}

function ExamConfirmation({ action, unanswered, flags, onCancel, onConfirm, t }) {
  const dialog=useRef(null);
  useEffect(()=>{dialog.current?.showModal();},[]);
  return <dialog ref={dialog} className="mcq-exam-guide mcq-exam-confirm" style={examThemeVars(t)} aria-labelledby="exam-confirm-title" onCancel={event=>{event.preventDefault();onCancel();}}>
    <h2 id="exam-confirm-title">{action==='retake'?'A fresh run at the same exam?':'Ready to submit?'}</h2>
    <p>{action==='retake'?'Your answers will clear and the clock will restart. You’ll answer the same questions again.':`${unanswered} unanswered · ${flags} flagged. Unanswered questions count as incorrect. You can review everything after submission.`}</p>
    <div className="exam-guide-footer"><button className="btn btn-ghost" autoFocus onClick={onCancel}>Keep reviewing</button><button className="btn btn-primary" onClick={onConfirm}>{action==='retake'?'Retake exam':'Submit exam'}</button></div>
  </dialog>;
}

export function McqExam({ initialQuestions, user, chapters, t, onSave, onReturn, onOpenDeepDive, onSessionComplete, onFocusModeChange, isVisible, renderDefinitions, initialStreaks = {}, onLocalStreaks, savedState=null, onPersist }) {
  const [questions, setQuestions] = useState(()=>savedState?.questions||freshQuestions(initialQuestions));
  const [answers, setAnswers] = useState(savedState?.answers||{});
  const [eliminated, setEliminated] = useState({});
  const [flagged, setFlagged] = useState(savedState?.flagged||{});
  const [qi, setQi] = useState(savedState?.qi||0);
  const [startedAt, setStartedAt] = useState(savedState?.startedAt||Date.now());
  const [now, setNow] = useState(Date.now);
  const [finishedAt, setFinishedAt] = useState(null);
  const [view, setView] = useState('taking');
  const [confirmAction,setConfirmAction]=useState(null);
  const [rows, setRows] = useState([]);
  const [marking, setMarking] = useState(false);
  const [submissionLocked, setSubmissionLocked] = useState(false);
  const [error, setError] = useState('');
  const [progressError, setProgressError] = useState(false);
  const [engineState, setEngineState] = useState(null);
  const [localStreaks, setLocalStreaks] = useState(initialStreaks);
  const inFlight = useRef(false);
  const submissionTime = useRef(null);
  const submissionPacing = useRef(null);
  const pressTimer = useRef(null);
  const longPressed = useRef(false);
  const cloudProgress = user?.authProvider === 'supabase' && mcqEngineEnabled;
  const q = questions[qi];
  const pacing=useQuestionPacing(q?.id,isVisible&&view==='taking'&&!submissionLocked,savedState?.pacingMs||{});
  useEffect(()=>{if(view==='taking')onPersist?.({exam:true,questions,answers,flagged,qi,startedAt,pacingMs:pacing.snapshot(),sessionContext:{engineSessionId:questions[0]?.engineAllocationId,createdAt:savedState?.sessionContext?.createdAt||new Date(startedAt).toISOString()},done:false,updatedAt:new Date().toISOString()});else if(view==='report')onPersist?.(null);},[answers,flagged,qi,questions,view,startedAt]);
  const timing = examTiming(startedAt, finishedAt??submissionTime.current, questions.length, now);
  const answeredCount = Object.keys(answers).length;
  useEffect(()=>{
    if(view!=='taking'||marking)return;
    const id=setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(id);
  },[view,marking]);
  useEffect(()=>{
    onFocusModeChange?.(isVisible&&view==='taking');
    return()=>onFocusModeChange?.(false);
  },[isVisible,view,onFocusModeChange]);
  useEffect(()=>()=>clearTimeout(pressTimer.current),[]);
  const refreshProgress = async()=>{
    if(!cloudProgress)return;
    try{setEngineState(await mcqEngineRequest('state'));setProgressError(false);}catch{setProgressError(true);}
  };
  const goTo = index => {if(!marking){clearTimeout(pressTimer.current);longPressed.current=false;setQi(index);}};
  const select = index => {
    if(marking||submissionLocked||view!=='taking')return;
    if(longPressed.current){longPressed.current=false;return;}
    setAnswers(previous=>({...previous,[qi]:index}));
    setEliminated(previous=>({...previous,[qi]:{...previous[qi],[index]:false}}));
  };
  const strike = index => {
    if(marking||submissionLocked||view!=='taking')return;
    const current=eliminated[qi]||{};
    if(!current[index]&&Object.values(current).filter(Boolean).length>=q.opts.length-1)return;
    setEliminated(previous=>({...previous,[qi]:{...previous[qi],[index]:!current[index]}}));
    if(!current[index]&&answers[qi]===index)setAnswers(previous=>{const next={...previous};delete next[qi];return next;});
  };
  const submit = async(confirmed=false)=>{
    if(inFlight.current||view!=='taking')return;
    const unanswered=questions.length-answeredCount;
    const flags=Object.values(flagged).filter(Boolean).length;
    if((unanswered||flags)&&!confirmed){setConfirmAction('submit');return;}
    setConfirmAction(null);
    submissionPacing.current??=pacing.snapshot();
    inFlight.current=true;setSubmissionLocked(true);setMarking(true);setError('');const finish=submissionTime.current??Date.now();submissionTime.current=finish;
    try{
      const completed=[];
      for(let index=0;index<questions.length;index++){
        const question=questions[index];const selected=answers[index];
        const elapsedMs=submissionPacing.current[question.id]==null?null:Math.min(86400000,submissionPacing.current[question.id]);
        const evaluation=cloudProgress&&selected!=null?await recordStandaloneMcq(question,selected,elapsedMs,"exam"):null;
        if(evaluation){question.correct=question.optionIds?.indexOf(evaluation.correct_option_id) ?? question.correct;question.exp=evaluation.explanation;question.wrongFeedback={...(question.wrongFeedback||{}),[selected]:evaluation.selected_feedback};}
        completed.push({qid:question.id,elapsedMs:evaluation?.elapsed_ms??elapsedMs,correct:selected!=null&&(evaluation?evaluation.is_correct:selected===question.correct),selected,
          title:question.q.slice(0,80),ch:question.ch,topic:question.topic,conceptTag:evaluation?.concept_tag||examConceptTag(question),
          mcq:true,exam:true,readinessSource:"exam",createdAt:new Date(finish+index).toISOString()});
      }
      let streaks=localStreaks;
      completed.forEach(row=>{if(row.selected!=null)streaks=advanceConceptStreak(streaks,row.conceptTag,row.correct);});
      setLocalStreaks(streaks);onLocalStreaks?.(streaks);
      completed.forEach(row=>onSave?.(row));
      if(cloudProgress&&questions[0]?.engineAllocationId){
        await mcqEngineRequest('complete',{session_id:questions[0].engineAllocationId});
        const review=await mcqEngineRequest('exam-review',{session_id:questions[0].engineAllocationId});
        setQuestions(previous=>previous.map(q=>{const row=review.questions.find(r=>r.id===q.id);return row?{...q,correct:row.correct,exp:row.explanation,wrongFeedback:Object.fromEntries(row.feedback.map((text,i)=>[i,text]))}:q;}));
      }
      setRows(completed);setFinishedAt(finish);await refreshProgress();
      onSessionComplete?.({session_type:'exam',score:Math.round(completed.filter(r=>r.correct).length/completed.length*100),duration_seconds:examTiming(startedAt,finish,questions.length).elapsed,questions_count:questions.length,chapter_id:null});
      setView('report');
    }catch(err){setError(`${err.message} Your answers are kept for this submission. Retry to finish marking.`);}finally{inFlight.current=false;setMarking(false);setNow(Date.now());}
  };
  const retake = ()=>{
    setConfirmAction(null);
    setQuestions(previous=>freshQuestions(previous));setAnswers({});setEliminated({});setFlagged({});setRows([]);setQi(0);
    pacing.reset({});submissionPacing.current=null;submissionTime.current=null;setStartedAt(Date.now());setNow(Date.now());setFinishedAt(null);setError('');setSubmissionLocked(false);setView('taking');
    window.scrollTo({top:0,behavior:'instant'});
  };
  if(view==='report')return <McqSetResults questions={questions} results={rows} correct={rows.filter(row=>row.correct).length} total={questions.length} t={t}
    summary={buildMcqResultSummary({questions,results:rows,chapters,engineState:cloudProgress?engineState:{concept_streaks:Object.entries(localStreaks).map(([concept_tag,wrong_streak])=>({concept_tag,wrong_streak}))},progressAvailable:!progressError})}
    onStart={onReturn} onReview={()=>{setQi(0);setView('review');window.scrollTo({top:0,behavior:'instant'});}}
    onOpenLesson={onOpenDeepDive} progressError={progressError} onRetryProgress={refreshProgress}
    exam={{elapsed:timing.elapsed,permitted:timing.permitted}}/>;
  const reviewing=view==='review';
  const row=rows[qi];
  return <div className="mcq-exam-screen" style={examThemeVars(t)}>
    {confirmAction&&<ExamConfirmation action={confirmAction} unanswered={questions.length-answeredCount} flags={Object.values(flagged).filter(Boolean).length} onCancel={()=>setConfirmAction(null)} onConfirm={()=>confirmAction==='retake'?retake():submit(true)} t={t}/>}
    <div className="top-progress" aria-hidden="true"><span style={{width:`${(qi+1)/questions.length*100}%`}}/></div>
    {reviewing&&<div className="mcq-exam-review-tools"><span><BookOpenCheck size={18}/> Answer review · definitions restored</span><button className="btn btn-outline" onClick={()=>setConfirmAction('retake')}><RotateCcw size={16}/>Retake exam</button><button className="btn btn-ghost" onClick={()=>setView('report')}>Back to report <ChevronRight size={16}/></button></div>}
    <header className="card mcq-exam-toolbar">
      <div className={`exam-timer ${timing.overtime?'is-overtime':''}`} aria-label={reviewing?'Time taken':timing.overtime?'Overtime':'Time remaining'}><Clock3 size={20}/><span><small>{reviewing?'TIME TAKEN':timing.overtime?'OVERTIME':'TIME LEFT'}</small>{reviewing?formatExamTime(timing.elapsed):`${timing.remaining<0?'+':''}${formatExamTime(Math.abs(timing.remaining))}`}</span></div>
      <span className="mcq-exam-position">Question {qi+1} of {questions.length} · {answeredCount} answered</span>
      {!reviewing&&<><button className={`btn ${flagged[qi]?'btn-primary':'btn-ghost'}`} disabled={marking} onClick={()=>setFlagged(previous=>({...previous,[qi]:!previous[qi]}))}><Flag size={15}/>{flagged[qi]?'Flagged':'Flag for review'}</button><button className="btn btn-primary" disabled={marking} onClick={()=>submit()}>{marking?'Marking exam…':'Submit exam'}</button></>}
    </header>
    {error&&<p className="mcq-exam-error" role="alert">{error}</p>}
    <div className="exam-layout">
      <main>
        <nav className="mcq-exam-question-controls" aria-label="Exam question navigation"><button className="btn btn-ghost" disabled={qi===0||marking} onClick={()=>goTo(qi-1)}>← Previous</button><button className="btn btn-ghost" disabled={qi===questions.length-1||marking} onClick={()=>goTo(qi+1)}>Next →</button></nav>
        <div className="card question-card mcq-exam-stem">
          {flagged[qi]&&<div className="exam-flag-ribbon"><span>Review</span></div>}
          <div className="mcq-exam-badges"><span className="chip">Ch.{q.ch}</span><span className="chip">MCQ</span>{flagged[qi]&&<span className="chip">Flagged for review</span>}</div>
          <div className="question-text">{reviewing?renderDefinitions(q.q):q.q}</div>
        </div>
        {!reviewing&&<p className="mcq-exam-strike-tip">Right-click, long-press, or use Strike to cross out an option.</p>}
        <div className="mcq-exam-options">{q.opts.map((option,index)=>{
          const struck=Boolean(eliminated[qi]?.[index]);
          const selected=answers[qi]===index;
          return <div key={index} className={`opt ${selected?'sel':''} ${!reviewing&&struck?'eliminated':''} ${reviewing?(index===q.correct?'ok':selected?'bad':''):''}`}
            onContextMenu={event=>{event.preventDefault();strike(index);}}>
            {reviewing?<div className="mcq-exam-reviewed-option"><span className="opt-ltr">{String.fromCharCode(65+index)}</span><span>{renderDefinitions(option)}</span><small>{index===q.correct?'Correct answer':selected?'Your answer':''}</small></div>:<>
              <button type="button" className="mcq-exam-option-choice" disabled={marking||submissionLocked} aria-pressed={selected} onClick={()=>select(index)}
                onPointerDown={event=>{if(event.pointerType==='touch'||event.pointerType==='pen'){longPressed.current=false;pressTimer.current=setTimeout(()=>{longPressed.current=true;strike(index);},520);}}}
                onPointerUp={()=>clearTimeout(pressTimer.current)} onPointerCancel={()=>clearTimeout(pressTimer.current)} onPointerLeave={()=>clearTimeout(pressTimer.current)}>
                <span className="opt-ltr">{String.fromCharCode(65+index)}</span><span>{option}</span>
              </button>
              <button type="button" className="btn btn-ghost mcq-exam-strike" disabled={marking||submissionLocked||(!struck&&Object.values(eliminated[qi]||{}).filter(Boolean).length>=q.opts.length-1)} aria-label={`${struck?'Undo elimination for':'Eliminate'} option ${String.fromCharCode(65+index)}`} onClick={()=>strike(index)}>{struck?'Undo':'Strike'}</button>
            </>}
          </div>;
        })}</div>
        {reviewing&&<section className="card mcq-exam-feedback" aria-label="Answer explanation"><strong className={row.correct?'correct':'incorrect'}>{row.selected==null?'Not answered.':row.correct?'Correct.':'Incorrect.'}</strong><p>{renderDefinitions(q.exp||'Review the correct answer above.')}</p>{row.selected!=null&&!row.correct&&q.wrongFeedback?.[row.selected]&&<p><strong>Why your choice missed: </strong>{renderDefinitions(q.wrongFeedback[row.selected])}</p>}</section>}
      </main>
      <aside className="card exam-map"><div className="label">Answer map</div><div className="exam-map-grid">{questions.map((question,index)=><button key={question.id} className={`btn exam-map-btn ${qi===index?'active':answers[index]!=null?'answered':'unanswered'} ${flagged[index]?'flagged':''}`} disabled={marking} aria-label={`Question ${index+1}, ${answers[index]!=null?'answered':'unanswered'}${flagged[index]?', flagged':''}`} aria-current={qi===index?'step':undefined} onClick={()=>goTo(index)}>{index+1}</button>)}</div><p className="mcq-exam-map-note">Bold numbers are unanswered. Amber outlines mark flagged questions.{!reviewing&&' Your answers stay unmarked until submission.'}</p></aside>
    </div>
  </div>;
}
