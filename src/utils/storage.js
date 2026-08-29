const PREFIX = 'family_ledger_';

export const storage = {
  get: (key, fallback = null) => {
    try {
      const val = localStorage.getItem(PREFIX + key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch(e) { console.error('Storage error:', e); }
  },
  remove: (key) => localStorage.removeItem(PREFIX + key),
  clear: () => {
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
  },
};
