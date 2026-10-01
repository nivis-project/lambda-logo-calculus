import type { Storage } from '@trefoil/store';

const KEY = 'trefoil-studio-project';

export function browserStorage(): Storage {
  return {
    read() {
      try {
        return window.localStorage.getItem(KEY);
      } catch {
        return null;
      }
    },
    write(value) {
      try {
        window.localStorage.setItem(KEY, value);
      } catch {
        return;
      }
    },
  };
}
