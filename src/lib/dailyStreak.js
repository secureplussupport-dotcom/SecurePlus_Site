export function getActiveDailyStreak(data, today, yesterday) {
  const source = data && typeof data === "object" ? data : {};
  const lastCompletedDate = String(source.lastCompletedDate || "");
  const savedStreak = Math.max(0, Number(source.streak) || 0);
  const streakIsActive = lastCompletedDate === today || lastCompletedDate === yesterday;

  return {
    streak: streakIsActive ? savedStreak : 0,
    best: Math.max(0, Number(source.best) || 0),
    lastCompletedDate,
    completedToday: lastCompletedDate === today,
    expired: Boolean(savedStreak && !streakIsActive),
  };
}
