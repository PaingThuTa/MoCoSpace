import { BookOpen, CalendarClock, Flame, Trophy } from 'lucide-react';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="rounded-lg bg-brand-100 p-2 text-brand-700 dark:bg-brand-700/20 dark:text-brand-100">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard({ stats, onStudyNow, dueCount }) {
  return (
    <section className="space-y-4">
      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">MoCoSpace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Build mastery with consistent spaced repetition.
          </p>
        </div>
        <button className="btn-primary" onClick={onStudyNow} disabled={dueCount === 0}>
          <BookOpen size={16} /> Study Now ({dueCount})
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Items" value={stats.totalItems} />
        <StatCard icon={CalendarClock} label="Due Today" value={stats.dueToday} />
        <StatCard icon={Flame} label="Streak" value={`${stats.streak} day${stats.streak === 1 ? '' : 's'}`} />
        <StatCard icon={Trophy} label="Mastered" value={stats.mastered} />
      </div>
    </section>
  );
}
