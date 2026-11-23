/**
 * localStorage that never throws: it can be full, blocked (privacy modes), or absent
 * (server prerendering). Reads fall back to null, writes report whether they stuck.
 */

export const STORAGE_KEYS = {
  solved: 'java_interviews_solved_v1',
  tabs: 'java_interviews_tabs_v1',
  activeLesson: 'java_interviews_active_lesson_v1',
  theme: 'java_interviews_theme_v1',
  fontSize: 'java_interviews_font_size_v1',
  sidebarOpen: 'java_interviews_sidebar_open_v1',
  collapsedSections: 'java_interviews_collapsed_sections_v1',
  welcomeSeen: 'java_interviews_welcome_seen_v1',
} as const;

export function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nothing to do: the value is unreachable either way.
  }
}

export function readJson(key: string): unknown {
  const raw = readItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** A tiny observable value, for module-level stores read with useSyncExternalStore. */
export function createSignal<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next: T) {
      if (Object.is(next, value)) return;
      value = next;
      for (const listener of listeners) listener();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
