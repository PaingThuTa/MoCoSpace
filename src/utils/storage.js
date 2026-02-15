export const STORAGE_KEY = 'mocospace:v1';

export const defaultData = {
  items: [],
  reviewLog: [],
  settings: {
    darkMode: false,
  },
};

export function normalizeData(data = {}) {
  return {
    ...defaultData,
    ...data,
    items: Array.isArray(data.items) ? data.items : defaultData.items,
    reviewLog: Array.isArray(data.reviewLog) ? data.reviewLog : defaultData.reviewLog,
    settings: {
      ...defaultData.settings,
      ...(data.settings || {}),
      darkMode: Boolean(data?.settings?.darkMode),
    },
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return normalizeData(parsed);
  } catch {
    return defaultData;
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mocospace-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format.');
        }
        resolve(normalizeData(parsed));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
