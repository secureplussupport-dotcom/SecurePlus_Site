import { normalizeMcqDifficulty } from './mcqDifficulty.js';
// Accumulate viewing time across revisits; callers pause for feedback and hidden pages.
export function createQuestionPacing(initial = {}, now = () => performance.now()) {
  const times = { ...initial };
  let active = null;
  let since = now();
  const flush = () => {
    const tick = now();
    if (active) times[active] = (times[active] || 0) + Math.max(0, tick - since);
    since = tick;
  };
  return {
    switchTo(id) { flush(); active = id || null; if (active && times[active] == null) times[active] = 0; },
    snapshot() { flush(); return Object.fromEntries(Object.entries(times).map(([id, ms]) => [id, Math.round(ms)])); },
  };
}

export function pacingSummary(questions, results) {
  const rows = questions.map((question, index) => ({ number: index + 1, id: question.id, elapsedMs: results[index]?.elapsedMs ?? null, targetMs:normalizeMcqDifficulty(question.difficulty)==='core'?45000:75000, difficulty:normalizeMcqDifficulty(question.difficulty) }));
  const measured = rows.filter(row => Number.isInteger(row.elapsedMs) && row.elapsedMs >= 0);
  return { rows, measured: measured.length, averageMs: measured.length ? Math.round(measured.reduce((sum, row) => sum + row.elapsedMs, 0) / measured.length) : null };
}
export const formatQuestionPace = ms => ms == null ? 'Not recorded' : ms < 1000 ? '<1s' : `${Math.floor(ms / 60000)}m ${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}s`;
