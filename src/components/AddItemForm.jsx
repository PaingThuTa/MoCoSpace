import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const initialForm = {
  title: '',
  category: 'LeetCode',
  difficulty: 'Medium',
  tags: '',
  notes: '',
  url: '',
};

export default function AddItemForm({ onSave, editingItem, onCancelEdit }) {
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!editingItem) {
      setForm(initialForm);
      return;
    }

    setForm({
      title: editingItem.title,
      category: editingItem.category,
      difficulty: editingItem.difficulty,
      tags: editingItem.tags.join(', '),
      notes: editingItem.notes,
      url: editingItem.url || '',
    });
  }, [editingItem]);

  const tagsCount = useMemo(
    () =>
      form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean).length,
    [form.tags]
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;

    onSave({
      ...form,
      title: form.title.trim(),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    if (!editingItem) {
      setForm(initialForm);
      setPreview(false);
    }
  }

  function updateField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <section className="card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
        {editingItem && (
          <button className="btn-secondary" onClick={onCancelEdit}>
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="input"
          placeholder="Title / Problem Name"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          required
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="input"
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
          >
            <option>LeetCode</option>
            <option>Web Dev</option>
            <option>Custom</option>
          </select>

          <select
            className="input"
            value={form.difficulty}
            onChange={(event) => updateField('difficulty', event.target.value)}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <input
          className="input"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(event) => updateField('tags', event.target.value)}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">{tagsCount} tag(s)</p>

        <input
          className="input"
          type="url"
          placeholder="Reference URL (optional)"
          value={form.url}
          onChange={(event) => updateField('url', event.target.value)}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Notes / Solution (Markdown supported)</label>
            <button type="button" className="btn-secondary" onClick={() => setPreview((s) => !s)}>
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {preview ? (
            <div className="prose prose-sm min-h-28 max-w-none rounded-lg border border-slate-200 p-3 dark:prose-invert dark:border-slate-700">
              <ReactMarkdown>{form.notes || '_Nothing to preview yet_'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="input min-h-28"
              placeholder="Write notes, key insights, or your solution..."
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
            />
          )}
        </div>

        <button className="btn-primary w-full" type="submit">
          {editingItem ? 'Update Item' : 'Add Item'}
        </button>
      </form>
    </section>
  );
}
