export const DEFAULT_EASINESS = 2.5;
export const MIN_EASINESS = 1.3;

export const RATING_LABELS = {
  0: 'Again',
  3: 'Hard',
  4: 'Good',
  5: 'Easy',
};

export function toDateKey(date = new Date()) {
  return new Date(date).toISOString().split('T')[0];
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isDue(nextReviewDate, now = new Date()) {
  if (!nextReviewDate) return true;
  return toDateKey(nextReviewDate) <= toDateKey(now);
}

export function calculateNextReview(item, rating, reviewDate = new Date()) {
  const currentInterval = Math.max(1, item.interval || 1);
  const currentEF = Math.max(MIN_EASINESS, item.easinessFactor || DEFAULT_EASINESS);

  let repetition = item.repetition || 0;
  let interval = currentInterval;

  if (rating === 0) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    if (rating === 3) interval = Math.max(1, Math.round(currentInterval * 1.2));
    if (rating === 4) interval = Math.max(1, Math.round(currentInterval * currentEF));
    if (rating === 5) interval = Math.max(1, Math.round(currentInterval * currentEF * 1.3));
  }

  const delta = 5 - rating;
  const nextEF = Math.max(
    MIN_EASINESS,
    currentEF + (0.1 - delta * (0.08 + delta * 0.02))
  );

  return {
    easinessFactor: Number(nextEF.toFixed(2)),
    repetition,
    interval,
    lastReviewedAt: reviewDate.toISOString(),
    nextReviewDate: addDays(reviewDate, interval).toISOString(),
  };
}
