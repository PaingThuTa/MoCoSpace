export const STORAGE_KEY = 'mocospace:v1';

export const defaultData = {
  items: [],
  reviewLog: [],
  settings: {
    darkMode: false,
  },
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return {
      ...defaultData,
      ...parsed,
      settings: {
        ...defaultData.settings,
        ...(parsed.settings || {}),
      },
    };
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
        resolve({
          ...defaultData,
          ...parsed,
          settings: {
            ...defaultData.settings,
            ...(parsed.settings || {}),
          },
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
