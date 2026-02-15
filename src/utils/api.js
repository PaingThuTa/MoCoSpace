import { normalizeData } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function fetchDataFromApi() {
  const response = await fetch(getApiUrl('/api/data'));
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`);
  }

  const payload = await response.json();
  return normalizeData(payload?.data || payload);
}

export async function saveDataToApi(data) {
  const response = await fetch(getApiUrl('/api/data'), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(normalizeData(data)),
  });

  if (!response.ok) {
    throw new Error(`Failed to save data: ${response.status}`);
  }

  const payload = await response.json();
  return normalizeData(payload?.data || payload);
}
