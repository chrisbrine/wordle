// Local storage utilities
const STORAGE_KEYS = {
  GAME: 'currentGame',
  STATS: 'gameStats',
  BROWSER_ID: 'browserId'
};

export function getFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(STORAGE_KEYS[key]);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Storage error for ${key}:`, error);
    return defaultValue;
  }
}

export function setInStorage(key, value) {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Storage error for ${key}:`, error);
    return false;
  }
}