import { useEffect, useRef } from 'react';
import './McqSetResults.css';
import { pacingSummary, formatQuestionPace } from '../lib/mcqPacing.js';
import { formatExamTime } from '../lib/mcqExam.js';
import { ArrowRight, BookOpenCheck, ChevronDown, RotateCcw, Target, Trophy, X, Clock3 } from 'lucide-react';

export function McqSetResults({ correct, total, summary, t, onStart, onReview, onOpenLesson, guestPrompt, progressError, onRetryProgress, starting, startError, exam = null, questions = [], results = [] }) {
  const heading = useRef(null);
  const repeatFocusCount=summary.nextFocus.filter(item=>item.reason!=='lowest-mastery').length;
  const pacing=pacingSummary(questions,results);
  const percent = total ? Math.round(correct / total * 100) : 0;
  const color = exam ? t.accent : percent >= 80 ? t.green : percent >= 50 ? t.amber : t.red;
  const colors = [t.accent, t.red, t.purple || '#8b5cf6', t.green, t.amber];
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest('.mcq-set-results')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, []);
  const openLesson = item => onOpenLesson?.(item.lesson.id, { source: 'mcq_set_result', conceptTag: item.tag });
  return <div className="mcq-results-screen mcq-set-results" style={{ '--result-color': color, '--result-text': t.text, '--result-muted': t.textSec, '--result-border': t.border, '--result-surface': t.surface, '--result-accent': t.accent, '--result-green': t.green, '--result-red': t.red, '--result-amber': t.amber }}>
    <section className="mcq-result-moment" aria-label={exam?"MCQ exam report":"MCQ set results"}>
      <div className="practice-result-kicker">{exam?'Exam complete':'Practice complete'}</div>
      <div className="mcq-animated-score" data-empty={percent === 0} role="img" aria-label={`${percent} percent. ${correct} of ${total} correct.`}>
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle className="mcq-score-track" cx="90" cy="90" r="78"/>
          <circle className="mcq-score-sweep" cx="90" cy="90" r="78" pathLength="100" strokeDasharray="100" style={{ strokeDashoffset: 100 - percent }}/>
        </svg>
        <div><strong>{percent}<span>%</span></strong><small>{correct} / {total} correct</small></div>
      </div>
      <h2 ref={heading} tabIndex={-1}>{exam ? 'Your exam, mapped.' : percent >= 80 ? 'Strong work.' : percent >= 50 ? 'Good progress.' : 'A useful first pass.'}</h2>
      <p>{exam ? 'One timed run. A clearer picture of what to revisit. This is an accuracy snapshot, not a pass or fail.' : percent >= 80 ? 'You are showing solid recall across this set. Keep the momentum by spacing the next review.' : percent >= 50 ? 'You have a good base. Review your misses, then try a focused set while the ideas are fresh.' : 'Mistakes are useful data. Review the missed concepts now and they will become easier to recognise next time.'}</p>
      {exam&&<div className={`mcq-exam-time-result ${exam.elapsed>exam.permitted?'is-overtime':''}`}><span>Time taken</span><strong>{formatExamTime(exam.elapsed)}</strong><span>/ {formatExamTime(exam.permitted)} permitted</span>{exam.elapsed>exam.permitted&&<b>Overtime</b>}</div>}
      {pacing.measured>0&&<div className="mcq-result-pace"><Clock3 size={15}/><span>Average pace</span><strong>{formatQuestionPace(pacing.averageMs)}</strong><span>per question</span>{pacing.measured<questions.length&&<small>({pacing.measured} of {questions.length} recorded)</small>}</div>}
      <div className="mcq-result-actions">
        {exam?<>
          <button className="btn btn-primary" onClick={onReview}><RotateCcw size={16}/> Review your answers</button>
          <button className="btn btn-outline" onClick={onStart}>Start another exam <ArrowRight size={17}/></button>
        </>:<>
          <button className="btn btn-primary" disabled={starting} onClick={onStart}>{starting ? 'Preparing set…' : 'Start another set'} <ArrowRight size={17}/></button>
          <button className="btn btn-outline" onClick={onReview}><RotateCcw size={16}/> Review your answers</button>
        </>}
      </div>
      {startError && <p role="alert">{startError}</p>}
    </section>

    <section className="mcq-domain-map" aria-labelledby="mcq-domain-heading">
      <div className="mcq-result-section-heading"><span>YOUR SET, MAPPED</span><h3 id="mcq-domain-heading">Where your answers landed</h3></div>
      <div className="mcq-domain-branches" style={{ '--domain-count': summary.domains.length }}>
        {summary.domains.map((domain, index) => <article key={domain.chapter.id} className="mcq-domain-node" style={{ '--domain-color': colors[Number(domain.chapter.id) - 1], '--domain-ink': `color-mix(in srgb,${colors[Number(domain.chapter.id) - 1]} 65%,${t.text})`, animationDelay: `${index * 50}ms` }}>
          <div className="mcq-domain-id">DOMAIN {domain.chapter.id}</div>
          <strong className="mcq-domain-percent">{domain.percent}<span>%</span></strong>
          <h4>{domain.chapter.title}</h4>
          <div className="mcq-domain-bar" aria-hidden="true"><span style={{ transform: `scaleX(${domain.percent / 100})` }}/></div>
          <small>{domain.correct} of {domain.total} correct</small>
        </article>)}
      </div>
    </section>

    {summary.strongest && <section className="mcq-strongest-signal">
      <span className="mcq-signal-icon"><Trophy size={21}/></span>
      <div><h3>Strongest signal</h3><strong>{summary.strongest.chapter.title}</strong><p>{summary.strongest.correct} of {summary.strongest.total} correct · {summary.strongest.percent}% in this set</p></div>
    </section>}

    <section className={`mcq-next-focus ${summary.nextFocus.length ? 'has-focus' : ''}`} aria-labelledby="mcq-focus-heading">
      <div className="mcq-focus-intro">
        <div className="mcq-focus-heading"><span><Target size={19}/></span><h3 id="mcq-focus-heading">YOUR NEXT FOCUS</h3></div>
        {summary.nextFocus.length ? <>
          <h4>{repeatFocusCount?'Break the repeat.':'Start with the gaps.'}<br/><em>Build the recall.</em></h4>
          <p>{repeatFocusCount===summary.nextFocus.length?'Two misses in a row, with no correct answer in between. Revisit the idea before your next set.':repeatFocusCount?'Repeat misses come first. Your lowest-mastery weak topics fill the remaining spot.':'Your weak topics with the lowest mastery scores come first. Revisit the ideas before your next set.'}</p>
          <div className="mcq-focus-pattern" role="img" aria-label={repeatFocusCount?"Two consecutive misses. Next step: a Concept Deep Dive.":"Weak topic. Revisit the lesson, then practise."}>
            <span><i>{repeatFocusCount?<X size={15}/>:<Target size={16}/>}</i><small>{repeatFocusCount?'Miss':'Weak topic'}</small></span><b aria-hidden="true"/>
            <span><i>{repeatFocusCount?<X size={15}/>:<BookOpenCheck size={16}/>}</i><small>{repeatFocusCount?'Miss':'Revisit'}</small></span><b aria-hidden="true"/>
            <span className="mcq-focus-pattern-next"><i>{repeatFocusCount?<BookOpenCheck size={18}/>:<RotateCcw size={17}/>}</i><small>{repeatFocusCount?'Revisit':'Practise'}</small></span>
          </div>
        </> : <><h4>{summary.weakPoints.length ? 'Make the next answer click.' : 'Give your recall a little space.'}</h4><p>{summary.weakPoints.length ? 'Review your answers and explore the weak points below. Repeat misses and weak topics with recorded mastery scores can appear here as your next focus.' : 'No weak points from this set need a lesson right now. Return for another set to check what sticks.'}</p></>}
      </div>
      {summary.nextFocus.length>0&&<div className="mcq-focus-links">{summary.nextFocus.map((item,index) => <button key={item.tag} className="mcq-focus-link" style={{'--focus-tint':index%2?t.green:t.accent,'--focus-delay':`${Math.min(index,4)*45}ms`}} onClick={() => openLesson(item)} aria-label={`Open Deep Dive for ${item.tag}: ${item.lesson.title}`}>
        <span className="mcq-focus-card-top"><span className="mcq-focus-book"><BookOpenCheck size={19}/></span><small>CONCEPT DEEP DIVE</small><span className="mcq-focus-card-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span></span>
        <span className="mcq-focus-tag">#{item.tag}</span>
        <span className="mcq-focus-reason">{item.reason==='lowest-mastery'?`${item.score}/100 mastery · Lowest mastery`:'Two consecutive misses'}</span>
        <span className="mcq-focus-lesson-title">{item.lesson.title}</span>
        <span className="mcq-focus-card-footer"><span>Open Deep Dive</span><i><ArrowRight size={17}/></i></span>
      </button>)}</div>}
      {progressError && <p className="mcq-progress-error" role="status">Mastery and repeat-miss history could not be refreshed. <button onClick={onRetryProgress}>Retry progress</button></p>}
    </section>

    <details className="mcq-weak-points">
      <summary><span><BookOpenCheck size={18}/> Know your weak points</span><ChevronDown size={18}/></summary>
      <div className="mcq-weak-content">
        <p>Missed in this set. Concepts above 80 mastery points are excluded.</p>
        {progressError ? <div className="mcq-weak-empty">Refresh progress to see which missed concepts are still at or below 80 mastery points.</div> : summary.weakPoints.length ? <ul>{summary.weakPoints.map(item => <li key={item.tag}>
          <div><strong>#{item.tag}</strong><small>{item.count} missed{item.score !== null ? ` · ${item.score}/100 mastery` : ' · Mastery unavailable'}</small></div>
          {item.lesson && <button className="btn btn-outline" onClick={() => openLesson(item)}>Open lesson <ArrowRight size={15}/></button>}
        </li>)}</ul> : <div className="mcq-weak-empty">No weak points to revisit from this set.</div>}
      </div>
    </details>
    {questions.length>0&&<details className="mcq-weak-points mcq-pacing-details">
      <summary><span><Clock3 size={18}/> Pacing by question</span><ChevronDown size={18}/></summary>
      <div className="mcq-weak-content"><p>Time viewing each question before marking, including revisits. Explanations and time with this page hidden are excluded. Pacing does not affect mastery or question selection.</p>
        <ol className="mcq-pacing-list">{pacing.rows.map(row=><li key={row.id} style={row.elapsedMs>row.targetMs?{borderLeft:"3px solid var(--result-amber)",paddingLeft:12}:undefined}><span>Question {row.number}<small> · {row.difficulty} · target {row.targetMs/1000}s</small></span><strong>{formatQuestionPace(row.elapsedMs)}</strong>{row.elapsedMs>row.targetMs&&<small>Take a moment to review the reasoning, then practise recalling the key clue.</small>}</li>)}</ol>
      </div>
    </details>}
    {guestPrompt && <div className="mcq-result-guest-save">{guestPrompt}</div>}
  </div>;
}
