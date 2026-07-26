import { getActiveDailyStreak } from "../src/lib/dailyStreak.js";

const today = "2026-07-25";
const yesterday = "2026-07-24";
const failures = [];
const requireValue = (condition, message) => {
  if (!condition) failures.push(message);
};

const completedToday = getActiveDailyStreak(
  { streak: 7, best: 9, lastCompletedDate: today },
  today,
  yesterday,
);
requireValue(completedToday.streak === 7, "Today's streak should remain active.");
requireValue(completedToday.completedToday, "Today's completion should be marked complete.");
requireValue(!completedToday.expired, "Today's streak should not be expired.");

const completedYesterday = getActiveDailyStreak(
  { streak: 6, best: 9, lastCompletedDate: yesterday },
  today,
  yesterday,
);
requireValue(completedYesterday.streak === 6, "Yesterday's streak should remain active until today is missed.");
requireValue(!completedYesterday.completedToday, "Yesterday's streak should not mark today complete.");

const missedDay = getActiveDailyStreak(
  { streak: 6, best: 9, lastCompletedDate: "2026-07-23" },
  today,
  yesterday,
);
requireValue(missedDay.streak === 0, "A streak must reset after a missed day.");
requireValue(missedDay.best === 9, "Resetting the current streak must preserve the best streak.");
requireValue(missedDay.expired, "A stale saved streak should be marked for persistence.");

if (failures.length) {
  console.error(`Engagement audit failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Engagement audit passed.");
console.log("- Daily Challenge streak remains active for today or yesterday");
console.log("- Missing a full day resets the current streak while preserving the best streak");
