import { useEffect, useState } from 'react';

const colors = { Retest: '#fbbf24', Remediation: '#fb7185', Discovery: '#60a5fa' };
const pill = { display: 'inline-block', padding: '4px 7px', margin: '3px 4px 3px 0', borderRadius: 6, background: '#253247', overflowWrap: 'anywhere', fontSize: 12 };
function Tags({ values }) {
  return values?.length ? values.map(tag => <span key={tag} style={pill}>#{tag}</span>) : <span style={{ color: '#94a3b8', fontSize: 12 }}>None</span>;
}

export function McqEngineInspector() {
  const [inspection, setInspection] = useState({ mastery: [], failed: [], questions: [] });
  const [currentId, setCurrentId] = useState(null);
  const [setNumber, setSetNumber] = useState(0);
  useEffect(() => {
    const inspect = event => {
      setInspection(previous => ({ ...previous, ...event.detail.inspection }));
      if (event.detail.operation === 'generate') {
        setSetNumber(value => value + 1);
        requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      }
    };
    const focus = event => setCurrentId(event.detail.id);
    window.addEventListener('mcq-preview-inspection', inspect);
    window.addEventListener('mcq-preview-question', focus);
    return () => {
      window.removeEventListener('mcq-preview-inspection', inspect);
      window.removeEventListener('mcq-preview-question', focus);
    };
  }, []);
  const questions = inspection.questions || [];
  const current = questions.find(q => q.id === currentId);
  const weak = [...inspection.mastery].filter(row => row.score < 80).sort((a, b) => a.score - b.score || a.concept_tag.localeCompare(b.concept_tag));
  const scores = new Map(inspection.mastery.map(row => [row.concept_tag, row.score]));
  return <aside className="mcq-preview-inspector" aria-label="MCQ engine inspection" style={{ maxHeight: 'calc(100vh - 24px)', overflowY: 'auto' }}>
    <h2 style={{ fontSize: 20, marginBottom: 8 }}>Inside this preview</h2>
    <p style={{ fontSize: 12, color: '#aebdd0', marginBottom: 14 }}>Tags, deck allocation and scores from the actual local engine.</p>
    <button type="button" className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={() => window.dispatchEvent(new Event('mcq-preview-new-set'))}>Start another set</button>
    <section aria-label="Current question tags" style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 14, marginBottom: 8 }}>Current question {current?.id || '—'}</h3>
      {current ? <>
        <strong style={{ ...pill, color: colors[current.deck] }}>{current.deck}</strong>
        <p style={{ fontSize: 12, marginTop: 8 }}>Scored primary tag · {scores.get(current.primaryTag) ?? 50}/100</p>
        <Tags values={[current.primaryTag].filter(Boolean)} />
        <p style={{ fontSize: 12, marginTop: 8 }}>Secondary tags</p><Tags values={current.secondaryTags} />
        <p style={{ fontSize: 12, marginTop: 8 }}>Distractor tags · no mastery score</p><Tags values={current.distractorTags} />
      </> : <p style={{ fontSize: 12, color: '#94a3b8' }}>Start or resume a set to inspect its questions.</p>}
    </section>
    <section aria-label="Current weak concept tags" aria-live="polite" style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 14, marginBottom: 8 }}>Weak concepts ({weak.length})</h3>
      <p style={{ fontSize: 12, color: '#aebdd0', marginBottom: 8 }}>Encountered tags scoring below 80.</p>
      {weak.length ? <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{weak.map(row => <li key={row.concept_tag} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #334155' }}>
        <span style={{ fontSize: 12, overflowWrap: 'anywhere' }}>#{row.concept_tag}</span><strong>{row.score}/100</strong>
      </li>)}</ul> : <p style={{ fontSize: 12, color: '#94a3b8' }}>No weak concepts recorded yet. Answer a question to update this list.</p>}
    </section>
    <section aria-label="Question deck allocation">
      <h3 style={{ fontSize: 14, marginBottom: 8 }}>Set {setNumber || '—'} · {questions.length} questions</h3>
      <div style={{ marginBottom: 8 }}>{Object.keys(colors).map(deck => <span key={deck} style={{ ...pill, color: colors[deck] }}>{deck}: {questions.filter(q => q.deck === deck).length}</span>)}</div>
      <div style={{ maxHeight: 280, overflow: 'auto' }}>{questions.map((q, index) => <div key={q.id} style={{ padding: '8px', border: `1px solid ${q.id === currentId ? '#93c5fd' : '#334155'}`, borderRadius: 7, marginBottom: 5, background: q.id === currentId ? '#243953' : 'transparent' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12 }}><strong>{index + 1}. {q.id}</strong><span style={{ color: colors[q.deck] }}>{q.deck}</span></div>
        <div style={{ fontSize: 11, color: '#aebdd0', overflowWrap: 'anywhere', marginTop: 4 }}>#{q.primaryTag}</div>
      </div>)}</div>
      <p style={{ fontSize: 12, color: '#aebdd0', marginTop: 8 }}>Retests become eligible after 30 subsequent MCQ answers. Labels describe how this set was selected.</p>
    </section>
  </aside>;
}
