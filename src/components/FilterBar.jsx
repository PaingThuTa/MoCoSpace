import { Search } from 'lucide-react';

export default function FilterBar({ filters, onChange, availableTags }) {
  function setFilter(key, value) {
    onChange((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <section className="card space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        <input
          className="input pl-9"
          placeholder="Search by title, notes, or tags"
          value={filters.search}
          onChange={(event) => setFilter('search', event.target.value)}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <select className="input" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
          <option value="all">All Categories</option>
          <option value="LeetCode">LeetCode</option>
          <option value="Web Dev">Web Dev</option>
          <option value="Custom">Custom</option>
        </select>

        <select
          className="input"
          value={filters.difficulty}
          onChange={(e) => setFilter('difficulty', e.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select className="input" value={filters.tag} onChange={(e) => setFilter('tag', e.target.value)}>
          <option value="all">All Tags</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <select className="input" value={filters.due} onChange={(e) => setFilter('due', e.target.value)}>
          <option value="all">All Status</option>
          <option value="due">Due</option>
          <option value="not_due">Not Due</option>
        </select>

        <select className="input" value={filters.sortBy} onChange={(e) => setFilter('sortBy', e.target.value)}>
          <option value="next_review">Sort: Next Review</option>
          <option value="difficulty">Sort: Difficulty</option>
          <option value="date_added">Sort: Date Added</option>
        </select>
      </div>
    </section>
  );
}
