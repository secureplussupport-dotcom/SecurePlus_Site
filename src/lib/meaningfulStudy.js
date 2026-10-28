// Meaningful-day streak: a day counts toward the study streak when the
// learner did any one of these, not only when they finished Daily Challenge.
//   - 10+ MCQ answers
//   - 1+ lesson section opened
//   - 10+ flashcards rated
//   - Daily Challenge completed
//
// This replaces the old Daily-Challenge-only streak on the dashboard. The
// Daily Challenge streak itself (used for coins/bonuses) is separate and
// untouched; completing Daily Challenge simply also qualifies a day here.
//
// No backfill: a streak is computed only from days recorded in the activity
// log after this feature ships, plus one explicit seed (see below). Past
// lesson/flashcard days without a recorded date are never invented. The one
// exception is a provable seed: if a learner already had an active Daily
// Challenge streak when the activity log was first created, that streak is
// carried over once, because every day in it was a qualifying day. The seed
// is stored in the log so it is applied exactly once, never recomputed.

export const MEANINGFUL_THRESHOLDS = Object.freeze({
  mcqAnswers: 10, lessonSections: 1, flashcardsRated: 10,
});

export function evaluateMeaningfulDay(day = {}) {
  const mcq = Number(day.mcq) || 0;
  const lessonSections = Number(day.lessonSections) || 0;
  const flashcards = Number(day.flashcards) || 0;
  const dailyChallenge = Boolean(day.dailyChallenge);
  const reasons = [];
  if (mcq >= MEANINGFUL_THRESHOLDS.mcqAnswers) reasons.push(`${mcq} MCQs answered`);
  if (lessonSections >= MEANINGFUL_THRESHOLDS.lessonSections) reasons.push(`${lessonSections} lesson section${lessonSections === 1 ? '' : 's'} opened`);
  if (flashcards >= MEANINGFUL_THRESHOLDS.flashcardsRated) reasons.push(`${flashcards} flashcards rated`);
  if (dailyChallenge) reasons.push('Daily Challenge completed');
  return {
    qualified: reasons.length > 0,
    reasons,
    counts: { mcq, lessonSections, flashcards, dailyChallenge },
  };
}

export function recordMeaningfulActivity(days = {}, dateKey, activity = {}) {
  const previous = days[dateKey] || { mcq: 0, lessonSections: 0, flashcards: 0, dailyChallenge: false };
  return {
    ...days,
    [dateKey]: {
      mcq: (Number(previous.mcq) || 0) + (Number(activity.mcq) || 0),
      lessonSections: (Number(previous.lessonSections) || 0) + (Number(activity.lessonSections) || 0),
      flashcards: (Number(previous.flashcards) || 0) + (Number(activity.flashcards) || 0),
      dailyChallenge: Boolean(previous.dailyChallenge || activity.dailyChallenge),
    },
  };
}

function previousDateKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function qualifiedDates(days = {}) {
  return new Set(Object.entries(days).filter(([, day]) => evaluateMeaningfulDay(day).qualified).map(([date]) => date));
}

// Seed shape: { streak, lastQualifiedDate, best } — or null.
// The seed represents consecutive qualifying days ending at lastQualifiedDate
// (the pre-existing Daily Challenge streak). It is only added when the
// activity log run touches it, so it can never double-count a logged day.
export function computeMeaningfulStreak({ days = {}, seed = null, today, yesterday } = {}) {
  const qualified = qualifiedDates(days);
  const todayInfo = evaluateMeaningfulDay(days[today] || {});
  const lastQualified = [...qualified].sort().at(-1) || null;
  const lastDate = lastQualified || (seed && (seed.lastQualifiedDate === today || seed.lastQualifiedDate === yesterday) ? seed.lastQualifiedDate : null);
  if (!lastDate) {
    return { streak: 0, best: 0, lastQualifiedDate: null, completedToday: false, qualifiedToday: false, reasonsToday: [], countsToday: todayInfo.counts };
  }
  if (lastDate !== today && lastDate !== yesterday) {
    return { streak: 0, best: 0, lastQualifiedDate: lastDate, completedToday: false, qualifiedToday: todayInfo.qualified, reasonsToday: todayInfo.reasons, countsToday: todayInfo.counts };
  }
  // Count consecutive qualified log days backwards from lastDate.
  let run = 0;
  let cursor = lastDate;
  while (qualified.has(cursor)) {
    run++;
    cursor = previousDateKey(cursor);
  }
  // cursor is now the first missing log date. Two seed cases, no double count:
  // - cursor is the seed's last date: the seed streak runs into the log run.
  // - the seed's last date is inside the log run: the run already counts
  //   that day once, so only the seed days before it are added.
  let streak = run;
  if (seed && seed.streak > 0) {
    if (cursor === seed.lastQualifiedDate) streak = run + seed.streak;
    else {
      // Only add seed days before the seed date when the log run actually
      // reaches that date (a gap between run and seed date breaks the chain).
      let walk = lastDate;
      let passedSeed = false;
      while (qualified.has(walk)) {
        if (walk === seed.lastQualifiedDate) { passedSeed = true; break; }
        walk = previousDateKey(walk);
      }
      if (passedSeed) streak = run + Math.max(0, seed.streak - 1);
    }
  }
  const best = Math.max(streak, Number(seed?.best) || 0);
  return {
    streak, best, lastQualifiedDate: lastDate,
    completedToday: todayInfo.qualified, qualifiedToday: todayInfo.qualified,
    reasonsToday: todayInfo.reasons, countsToday: todayInfo.counts,
  };
}
