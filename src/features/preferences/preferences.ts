/**
 * Per-browser UI preferences. Server-rendered HTML uses the defaults; the browser swaps
 * in saved values right after hydration (useSyncExternalStore's server snapshot), so
 * markup always matches during hydration. The theme is also applied before first paint
 * by THEME_BOOT_SCRIPT, so there is no flash.
 */

import { useSyncExternalStore } from 'react';
import { createSignal, readItem, readJson, STORAGE_KEYS, writeItem } from '@/lib/storage';

export type Theme = 'dark' | 'light';

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 22;
const FONT_SIZE_DEFAULT = 14;

export interface Preferences {
  theme: Theme;
  fontSize: number;
  sidebarOpen: boolean;
  collapsedSections: ReadonlySet<string>;
  welcomeSeen: boolean;
}

const DEFAULTS: Preferences = {
  theme: 'dark',
  fontSize: FONT_SIZE_DEFAULT,
  sidebarOpen: true,
  collapsedSections: new Set(),
  // Prerendered HTML never shows the welcome dialog; the browser decides after hydration.
  welcomeSeen: true,
};

function load(): Preferences {
  const fontSize = Number(readItem(STORAGE_KEYS.fontSize) ?? FONT_SIZE_DEFAULT);
  const collapsed = readJson(STORAGE_KEYS.collapsedSections);
  return {
    theme: readItem(STORAGE_KEYS.theme) === 'light' ? 'light' : 'dark',
    fontSize: Number.isFinite(fontSize) && fontSize >= FONT_SIZE_MIN && fontSize <= FONT_SIZE_MAX ? fontSize : FONT_SIZE_DEFAULT,
    sidebarOpen: readItem(STORAGE_KEYS.sidebarOpen) !== 'false',
    collapsedSections: new Set(Array.isArray(collapsed) ? collapsed.filter((id) => typeof id === 'string') : []),
    welcomeSeen: readItem(STORAGE_KEYS.welcomeSeen) === 'true',
  };
}

const store = createSignal<Preferences>(typeof window === 'undefined' ? DEFAULTS : load());

export function usePreferences(): Preferences {
  return useSyncExternalStore(store.subscribe, store.get, () => DEFAULTS);
}

function update(patch: Partial<Preferences>) {
  store.set({ ...store.get(), ...patch });
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  writeItem(STORAGE_KEYS.theme, theme);
  update({ theme });
}

export function setFontSize(fontSize: number) {
  const clamped = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, fontSize));
  writeItem(STORAGE_KEYS.fontSize, String(clamped));
  update({ fontSize: clamped });
}

export function setSidebarOpen(sidebarOpen: boolean) {
  writeItem(STORAGE_KEYS.sidebarOpen, String(sidebarOpen));
  update({ sidebarOpen });
}

export function setSectionCollapsed(sectionId: string, collapsed: boolean) {
  const current = store.get().collapsedSections;
  if (current.has(sectionId) === collapsed) return;
  const next = new Set(current);
  if (collapsed) next.add(sectionId);
  else next.delete(sectionId);
  writeItem(STORAGE_KEYS.collapsedSections, JSON.stringify([...next]));
  update({ collapsedSections: next });
}

export function markWelcomeSeen() {
  writeItem(STORAGE_KEYS.welcomeSeen, 'true');
  update({ welcomeSeen: true });
}

/** Inlined into <head>: applies the saved theme before the first paint. */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEYS.theme,
)});document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();`;
