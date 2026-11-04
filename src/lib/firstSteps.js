// Your first 3 steps: the dashboard card shown to new learners until all
// three are done, then it disappears and is replaced by normal dashboard
// content. It must never trap an experienced learner:
// - A step is done if it was recorded after this feature shipped OR if
//   existing evidence already proves it (see computeFirstSteps inputs).
// - Lesson completion is the only non-repeatable step (the Mark complete
//   button is disabled once a lesson is complete), so existing lesson
//   completions are essential evidence, not optional.
// - MCQ sets and flashcard decks are repeatable, so a recorded step is
//   enough for those even when older evidence is unavailable.

export const FIRST_STEP_IDS = Object.freeze(['mcq-set', 'lesson', 'deck']);

export function computeFirstSteps({ record = {}, hasMcqAttempt = false, hasLessonCompletion = false, hasDeckActivity = false } = {}) {
  const steps = [
    { id: 'mcq-set', title: 'Complete your first MCQ set', done: Boolean(record['mcq-set'] || hasMcqAttempt), action: 'mcq' },
    { id: 'lesson', title: 'Complete your first lesson', done: Boolean(record.lesson || hasLessonCompletion), action: 'deep-dives' },
    { id: 'deck', title: 'Complete your first flashcard deck', done: Boolean(record.deck || hasDeckActivity), action: 'flashcards' },
  ];
  const doneCount = steps.filter((step) => step.done).length;
  return {
    steps,
    doneCount,
    total: steps.length,
    allDone: doneCount === steps.length,
    nextStep: steps.find((step) => !step.done) || null,
  };
}

export function recordFirstStep(record = {}, stepId) {
  if (!FIRST_STEP_IDS.includes(stepId)) return record;
  if (record[stepId]) return record;
  return { ...record, [stepId]: true };
}

export const FIRST_STEPS_LAUNCH_AT='2026-11-04T00:00:00Z';
export function firstStepsEligible(user){
 const created=Date.parse(user?.accountCreatedAt||user?.joined||'');
 return Boolean(user&&user.authProvider!=='guest'&&Number.isFinite(created)&&created>=Date.parse(FIRST_STEPS_LAUNCH_AT));
}
export function onboardingSteps(state={}){
 return computeFirstSteps({record:{'mcq-set':state.steps?.mcq,lesson:state.steps?.lesson,deck:state.journeyDeckCompleted===true}});
}
