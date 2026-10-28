import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMeaningfulDay, recordMeaningfulActivity, computeMeaningfulStreak } from '../src/lib/meaningfulStudy.js';

const day = (over) => ({ mcq: 0, lessonSections: 0, flashcards: 0, dailyChallenge: false, ...over });

test('each qualifying activity alone qualifies a day', () => {
  assert.equal(evaluateMeaningfulDay(day({ mcq: 10 })).qualified, true);
  assert.equal(evaluateMeaningfulDay(day({ mcq: 9 })).qualified, false);
  assert.equal(evaluateMeaningfulDay(day({ lessonSections: 1 })).qualified, true);
  assert.equal(evaluateMeaningfulDay(day({ flashcards: 10 })).qualified, true);
  assert.equal(evaluateMeaningfulDay(day({ flashcards: 9 })).qualified, false);
  assert.equal(evaluateMeaningfulDay(day({ dailyChallenge: true })).qualified, true);
  assert.equal(evaluateMeaningfulDay(day()).qualified, false);
});

test('recording accumulates counts without overwriting other activities', () => {
  let days = recordMeaningfulActivity({}, '2026-10-28', { mcq: 6 });
  days = recordMeaningfulActivity(days, '2026-10-28', { mcq: 4, flashcards: 3 });
  assert.deepEqual(days['2026-10-28'], { mcq: 10, lessonSections: 0, flashcards: 3, dailyChallenge: false });
  assert.equal(evaluateMeaningfulDay(days['2026-10-28']).qualified, true);
});

test('streak counts consecutive qualified days and breaks on a gap', () => {
  const days = {
    '2026-10-26': day({ mcq: 10 }),
    '2026-10-27': day({ lessonSections: 1 }),
    '2026-10-28': day({ flashcards: 10 }),
  };
  assert.equal(computeMeaningfulStreak({ days, today: '2026-10-28', yesterday: '2026-10-27' }).streak, 3);
  const gapped = { '2026-10-26': day({ mcq: 10 }), '2026-10-28': day({ mcq: 10 }) };
  assert.equal(computeMeaningfulStreak({ days: gapped, today: '2026-10-28', yesterday: '2026-10-27' }).streak, 1);
});

test('streak stays active when today is not yet qualified but yesterday was', () => {
  const days = { '2026-10-27': day({ mcq: 10 }) };
  const result = computeMeaningfulStreak({ days, today: '2026-10-28', yesterday: '2026-10-27' });
  assert.equal(result.streak, 1);
  assert.equal(result.completedToday, false);
});

test('streak expires when the last qualified day is older than yesterday', () => {
  const days = { '2026-10-26': day({ mcq: 10 }) };
  assert.equal(computeMeaningfulStreak({ days, today: '2026-10-28', yesterday: '2026-10-27' }).streak, 0);
});

test('seed streak joins a log run without double-counting its last day', () => {
  // Seed: 20-day challenge streak ending 2026-10-27. Log: 28th only (gap on 27th in log,
  // but seed covers 27th) — actually seed last date is 27th, log run starts 28th, so total 21.
  const seed = { streak: 20, lastQualifiedDate: '2026-10-27', best: 20 };
  const days = { '2026-10-28': day({ mcq: 10 }) };
  assert.equal(computeMeaningfulStreak({ days, seed, today: '2026-10-28', yesterday: '2026-10-27' }).streak, 21);
  // Seed date also in the log: log 27th + 28th, seed 20 ending 27th => 21 unique days, not 22.
  const overlap = { '2026-10-27': day({ mcq: 10 }), '2026-10-28': day({ mcq: 10 }) };
  assert.equal(computeMeaningfulStreak({ days: overlap, seed, today: '2026-10-28', yesterday: '2026-10-27' }).streak, 21);
  // Gap between seed and log run: seed ending 25th, log 28th only => seed does not join.
  const gappedSeed = { streak: 20, lastQualifiedDate: '2026-10-25', best: 20 };
  assert.equal(computeMeaningfulStreak({ days, seed: gappedSeed, today: '2026-10-28', yesterday: '2026-10-27' }).streak, 1);
  // Seed alone, no log days, active yesterday.
  assert.equal(computeMeaningfulStreak({ days: {}, seed, today: '2026-10-28', yesterday: '2026-10-27' }).streak, 20);
});

test('no backfill: empty log with no seed is zero, even with a long history elsewhere', () => {
  assert.equal(computeMeaningfulStreak({ days: {}, today: '2026-10-28', yesterday: '2026-10-27' }).streak, 0);
});
