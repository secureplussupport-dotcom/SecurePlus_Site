// Archived 2026-10-22. Retain implementations and historical data for recovery.
export const CIPHER_COINS_ACTIVE = false;
export const MASCOT_MANAGER_ACTIVE = false;
// Temporarily archived 2026-11-04. Preserve implementations and learner history.
export const STUDY_PLAN_ACTIVE = false;
export const DAILY_CHALLENGE_ACTIVE = false;
export const PBQ_PRACTICE_ACTIVE = false;
export const ARCHIVED_PUBLIC_PATHS = Object.freeze([
 '/security-plus-study-plan/',
 '/security-plus-daily-challenge/',
 '/security-plus-pbq-practice/',
]);
export const isArchivedView = view => ['coins', 'referrals', 'mascot-admin'].includes(view)
 ||(view==='study-plan'&&!STUDY_PLAN_ACTIVE)
 ||(view==='daily'&&!DAILY_CHALLENGE_ACTIVE)
 ||(view==='pbq'&&!PBQ_PRACTICE_ACTIVE);
