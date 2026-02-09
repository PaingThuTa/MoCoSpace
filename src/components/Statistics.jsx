import { toDateKey } from '../utils/spacedRepetition';

function buildLastNDays(days) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - i - 1));
    return toDateKey(d);
  });
}

export default function Statistics({ reviewLog, reviewedToday }) {
  const days = buildLastNDays(14);

  const counts = days.map((date) => {
    const value = reviewLog.filter((entry) => toDateKey(entry.reviewedAt) === date).length;
    return { date, value };
  });

  const maxCount = Math.max(1, ...counts.map((c) => c.value));

  return (
    <section className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Statistics</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">Reviewed today: {reviewedToday}</span>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:grid-cols-14">
        {counts.map(({ date, value }) => {
          const intensity = value / maxCount;
          const bgClass =
            value === 0
              ? 'bg-slate-200 dark:bg-slate-700'
              : intensity < 0.35
              ? 'bg-brand-100 dark:bg-brand-900/40'
              : intensity < 0.7
              ? 'bg-brand-400 dark:bg-brand-600'
              : 'bg-brand-600';

          return (
            <div
              key={date}
              title={`${date}: ${value} reviews`}
              className={`h-8 rounded ${bgClass}`}
              aria-label={`${date}: ${value} reviews`}
            />
          );
        })}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">14-day review heatmap</p>
    </section>
  );
}
