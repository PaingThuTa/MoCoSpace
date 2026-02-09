import { Pencil, Trash2, ExternalLink } from 'lucide-react';

const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };

export function sortItems(items, sortBy) {
  const list = [...items];
  if (sortBy === 'difficulty') {
    list.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
  } else if (sortBy === 'date_added') {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else {
    list.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));
  }
  return list;
}

export default function ItemList({ items, onEdit, onDelete, isDue }) {
  if (items.length === 0) {
    return (
      <section className="card text-center text-sm text-slate-500 dark:text-slate-400">
        No items match the current filters.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {items.map((item) => {
        const due = isDue(item.nextReviewDate);
        return (
          <article key={item.id} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="badge">{item.category}</span>
                  <span className="badge">{item.difficulty}</span>
                  <span className={`badge ${due ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200' : ''}`}>
                    {due ? 'Due now' : `Due ${new Date(item.nextReviewDate).toLocaleDateString()}`}
                  </span>
                  {item.tags.map((tag) => (
                    <span className="badge" key={tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-brand-600 underline"
                  >
                    Open Link <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button className="btn-secondary" onClick={() => onEdit(item)}>
                  <Pencil size={16} /> Edit
                </button>
                <button className="btn-danger" onClick={() => onDelete(item.id)}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
