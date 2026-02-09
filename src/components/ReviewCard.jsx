import ReactMarkdown from 'react-markdown';

const ratingButtons = [
  { label: 'Again', rating: 0, className: 'bg-red-600 hover:bg-red-700 text-white' },
  { label: 'Hard', rating: 3, className: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { label: 'Good', rating: 4, className: 'bg-green-600 hover:bg-green-700 text-white' },
  { label: 'Easy', rating: 5, className: 'bg-blue-600 hover:bg-blue-700 text-white' },
];

export default function ReviewCard({ item, remaining, onRate, onExit }) {
  if (!item) {
    return (
      <section className="card text-center">
        <h2 className="text-xl font-semibold">You are done for today.</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No more due cards right now.</p>
        <button className="btn-secondary mt-4" onClick={onExit}>
          Back to Dashboard
        </button>
      </section>
    );
  }

  return (
    <section className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Due Review • {remaining} left
          </p>
          <h2 className="text-2xl font-semibold">{item.title}</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="badge">{item.category}</span>
            <span className="badge">{item.difficulty}</span>
            {item.tags.map((tag) => (
              <span className="badge" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <button className="btn-secondary" onClick={onExit}>
          Exit Study
        </button>
      </div>

      {item.url && (
        <a
          className="text-sm text-brand-600 underline hover:text-brand-700"
          href={item.url}
          target="_blank"
          rel="noreferrer"
        >
          Open reference link
        </a>
      )}

      <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <p className="mb-2 text-sm font-medium">Notes / Solution</p>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{item.notes || '_No notes yet_'}</ReactMarkdown>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">How well did you remember it?</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ratingButtons.map((btn) => (
            <button
              key={btn.rating}
              className={`btn ${btn.className}`}
              onClick={() => onRate(item.id, btn.rating)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
