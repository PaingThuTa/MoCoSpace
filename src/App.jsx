import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Moon, Sun, Upload } from 'lucide-react';
import AddItemForm from './components/AddItemForm';
import Dashboard from './components/Dashboard';
import FilterBar from './components/FilterBar';
import ItemList, { sortItems } from './components/ItemList';
import ReviewCard from './components/ReviewCard';
import Statistics from './components/Statistics';
import { fetchDataFromApi, saveDataToApi } from './utils/api';
import { calculateNextReview, DEFAULT_EASINESS, isDue, toDateKey } from './utils/spacedRepetition';
import { defaultData, exportData, importData, loadData, saveData } from './utils/storage';

function computeStreak(reviewLog) {
  if (reviewLog.length === 0) return 0;

  const uniqueDays = new Set(reviewLog.map((entry) => toDateKey(entry.reviewedAt)));
  let streak = 0;
  const cursor = new Date();

  while (uniqueDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function createNewItem(formData) {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  return {
    id: crypto.randomUUID(),
    title: formData.title,
    category: formData.category,
    difficulty: formData.difficulty,
    tags: formData.tags,
    notes: formData.notes,
    url: formData.url,
    easinessFactor: DEFAULT_EASINESS,
    repetition: 0,
    interval: 1,
    nextReviewDate: tomorrow.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastReviewedAt: null,
  };
}

export default function App() {
  const [data, setData] = useState(defaultData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingItemId, setEditingItemId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    tag: 'all',
    due: 'all',
    sortBy: 'next_review',
  });
  const [studyQueue, setStudyQueue] = useState([]);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function hydrateData() {
      const cachedData = loadData();

      try {
        const remoteData = await fetchDataFromApi();
        if (!mounted) return;
        setData(remoteData);
        saveData(remoteData);
      } catch {
        if (!mounted) return;
        setData(cachedData);
        setSyncError('Backend unavailable. Using cached local data.');
      } finally {
        if (mounted) setIsHydrated(true);
      }
    }

    hydrateData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [data.settings.darkMode]);

  useEffect(() => {
    if (!isHydrated) return;

    let cancelled = false;
    saveData(data);

    saveDataToApi(data)
      .then(() => {
        if (!cancelled) setSyncError('');
      })
      .catch(() => {
        if (!cancelled) setSyncError('Sync failed. Changes are only saved locally right now.');
      });

    return () => {
      cancelled = true;
    };
  }, [data, isHydrated]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const items = data.items || [];
  const reviewLog = data.reviewLog || [];

  const dueItems = useMemo(
    () => items.filter((item) => isDue(item.nextReviewDate)).sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate)),
    [items]
  );

  const reviewedToday = useMemo(
    () => reviewLog.filter((entry) => toDateKey(entry.reviewedAt) === toDateKey(new Date())).length,
    [reviewLog]
  );

  const availableTags = useMemo(
    () => [...new Set(items.flatMap((item) => item.tags || []))].sort((a, b) => a.localeCompare(b)),
    [items]
  );

  const stats = useMemo(() => {
    const mastered = items.filter((item) => item.interval >= 30).length;
    return {
      totalItems: items.length,
      dueToday: dueItems.length,
      reviewedToday,
      streak: computeStreak(reviewLog),
      mastered,
    };
  }, [items, dueItems.length, reviewLog, reviewedToday]);

  const editingItem = useMemo(() => items.find((item) => item.id === editingItemId) || null, [items, editingItemId]);

  const filteredItems = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (filters.category !== 'all' && item.category !== filters.category) return false;
      if (filters.difficulty !== 'all' && item.difficulty !== filters.difficulty) return false;
      if (filters.tag !== 'all' && !item.tags.includes(filters.tag)) return false;

      const due = isDue(item.nextReviewDate);
      if (filters.due === 'due' && !due) return false;
      if (filters.due === 'not_due' && due) return false;

      if (!searchTerm) return true;
      const haystack = `${item.title} ${item.notes} ${(item.tags || []).join(' ')}`.toLowerCase();
      return haystack.includes(searchTerm);
    });

    return sortItems(filtered, filters.sortBy);
  }, [items, filters]);

  function updateData(updater) {
    setData((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      return {
        ...defaultData,
        ...next,
        settings: { ...defaultData.settings, ...(next.settings || {}) },
      };
    });
  }

  function handleSaveItem(formData) {
    if (editingItem) {
      updateData((previous) => ({
        ...previous,
        items: previous.items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : item
        ),
      }));
      setEditingItemId(null);
      setToast('Item updated.');
      return;
    }

    updateData((previous) => ({
      ...previous,
      items: [createNewItem(formData), ...previous.items],
    }));
    setToast('Item added and scheduled for tomorrow.');
  }

  function handleDeleteItem(itemId) {
    updateData((previous) => ({
      ...previous,
      items: previous.items.filter((item) => item.id !== itemId),
      reviewLog: previous.reviewLog.filter((entry) => entry.itemId !== itemId),
    }));

    setStudyQueue((queue) => queue.filter((id) => id !== itemId));
    if (editingItemId === itemId) setEditingItemId(null);
    setToast('Item deleted.');
  }

  function startStudySession() {
    const queue = dueItems.map((item) => item.id);
    setStudyQueue(queue);
    setActiveTab('study');
  }

  function handleRateItem(itemId, rating) {
    updateData((previous) => {
      const now = new Date();
      return {
        ...previous,
        items: previous.items.map((item) => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            ...calculateNextReview(item, rating, now),
            updatedAt: now.toISOString(),
          };
        }),
        reviewLog: [
          ...previous.reviewLog,
          {
            id: crypto.randomUUID(),
            itemId,
            rating,
            reviewedAt: now.toISOString(),
          },
        ],
      };
    });

    setStudyQueue((queue) => queue.filter((id) => id !== itemId));
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importData(file);
      setData(imported);
      setEditingItemId(null);
      setStudyQueue([]);
      setActiveTab('dashboard');
      setToast('Data imported successfully.');
    } catch {
      setToast('Import failed: invalid JSON file.');
    } finally {
      event.target.value = '';
    }
  }

  function toggleDarkMode() {
    updateData((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        darkMode: !previous.settings.darkMode,
      },
    }));
  }

  const currentStudyItem = useMemo(() => {
    const currentId = studyQueue[0];
    if (!currentId) return null;
    return items.find((item) => item.id === currentId) || null;
  }, [studyQueue, items]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-brand-100 p-4 text-slate-900 dark:from-brand-950 dark:to-brand-900 dark:text-slate-100 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'manage', label: 'Manage Items' },
              { id: 'stats', label: 'Statistics' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn ${
                  activeTab === tab.id ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => exportData(data)}>
              <Download size={16} /> Export
            </button>
            <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Import
            </button>
            <button className="btn-secondary" onClick={toggleDarkMode}>
              {data.settings.darkMode ? <Sun size={16} /> : <Moon size={16} />} Theme
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="application/json"
              onChange={handleImport}
            />
          </div>
        </header>

        {toast && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200">
            {toast}
          </div>
        )}
        {syncError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            {syncError}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <Dashboard stats={stats} dueCount={dueItems.length} onStudyNow={startStudySession} />
            <AddItemForm onSave={handleSaveItem} editingItem={editingItem} onCancelEdit={() => setEditingItemId(null)} />
          </>
        )}

        {activeTab === 'study' && (
          <ReviewCard
            item={currentStudyItem}
            remaining={studyQueue.length}
            onRate={handleRateItem}
            onExit={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'manage' && (
          <div className="space-y-4">
            <AddItemForm onSave={handleSaveItem} editingItem={editingItem} onCancelEdit={() => setEditingItemId(null)} />
            <FilterBar filters={filters} onChange={setFilters} availableTags={availableTags} />
            <ItemList
              items={filteredItems}
              onEdit={(item) => {
                setEditingItemId(item.id);
                setActiveTab('manage');
              }}
              onDelete={handleDeleteItem}
              isDue={isDue}
            />
          </div>
        )}

        {activeTab === 'stats' && <Statistics reviewLog={reviewLog} reviewedToday={reviewedToday} />}
      </div>
    </div>
  );
}
