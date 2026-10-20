// Preserve legacy stored values while exposing two MCQ levels everywhere.
export function normalizeMcqDifficulty(value) {
  const level = String(value || '').trim().toLowerCase();
  return { easy: 'core', medium: 'applied', hard: 'applied' }[level] || level;
}

export const MCQ_DIFFICULTIES = ['core', 'applied'];
