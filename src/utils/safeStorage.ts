// Safe storage utility that never throws and falls back to in-memory store
const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // ignore
    }
    return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
  },

  setItem: (key: string, value: string): void => {
    memoryStore[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // ignore
    }
  },

  removeItem: (key: string): void => {
    delete memoryStore[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  },

  clear: (): void => {
    for (const k in memoryStore) {
      delete memoryStore[k];
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // ignore
    }
  }
};
