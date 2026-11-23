/**
 * The learner's progress in this browser: which lessons are solved, and the code in each
 * lesson's editor tabs. Code changes on every keystroke, so tabs are kept in memory and
 * written to storage on a short debounce (and when the page is hidden).
 */

import { useSyncExternalStore } from 'react';
import { createSignal, readItem, readJson, removeItem, STORAGE_KEYS, writeItem } from '@/lib/storage';

export interface SolutionTab {
  id: string;
  name: string;
  code: string;
}

/** Solved lesson ids and editor tabs by lesson id. */
export interface ProgressSnapshot {
  solved: string[];
  tabs: Record<string, SolutionTab[]>;
}

const TABS_WRITE_DELAY_MS = 400;
const EMPTY: ReadonlySet<string> = new Set();

const isBrowser = typeof window !== 'undefined';

// ---- Solved lessons ---------------------------------------------------------------------

function loadSolved(): ReadonlySet<string> {
  const ids = readJson(STORAGE_KEYS.solved);
  return new Set(Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : []);
}

const solved = createSignal<ReadonlySet<string>>(isBrowser ? loadSolved() : EMPTY);

export function getSolvedIds(): ReadonlySet<string> {
  return solved.get();
}

export function useSolvedIds(): ReadonlySet<string> {
  return useSyncExternalStore(solved.subscribe, solved.get, () => EMPTY);
}

/** Marks a lesson solved. Returns true if it wasn't already solved. */
export function markSolved(lessonId: string): boolean {
  const current = solved.get();
  if (current.has(lessonId)) return false;
  const next = new Set(current).add(lessonId);
  writeItem(STORAGE_KEYS.solved, JSON.stringify([...next]));
  solved.set(next);
  return true;
}

export function areAllLessonsSolved(solvedIds: ReadonlySet<string>, lessonIds: readonly string[]): boolean {
  return lessonIds.length > 0 && lessonIds.every((id) => solvedIds.has(id));
}

// ---- Editor tabs ------------------------------------------------------------------------

let tabsCache: Record<string, SolutionTab[]> | null = null;
let tabsWriteTimer: ReturnType<typeof setTimeout> | null = null;
/** In-memory tabs differ from storage. */
let tabsDirty = false;

function tabsMap(): Record<string, SolutionTab[]> {
  if (!tabsCache) {
    const parsed = readJson(STORAGE_KEYS.tabs);
    tabsCache = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, SolutionTab[]>) : {};
  }
  return tabsCache;
}

function flushTabs(): void {
  if (tabsWriteTimer !== null) {
    clearTimeout(tabsWriteTimer);
    tabsWriteTimer = null;
  }
  // A refused write stays dirty, so the next edit or page hide retries it.
  if (tabsDirty && writeItem(STORAGE_KEYS.tabs, JSON.stringify(tabsMap()))) tabsDirty = false;
}

if (isBrowser) {
  window.addEventListener('pagehide', flushTabs);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushTabs();
  });
}

export function defaultTabs(starterCode: string): SolutionTab[] {
  return [{ id: 'tab-1', name: 'Solution 1', code: starterCode }];
}

export function loadLessonTabs(lessonId: string, starterCode: string): SolutionTab[] {
  if (!isBrowser) return defaultTabs(starterCode);
  const saved = tabsMap()[lessonId];
  return Array.isArray(saved) && saved.length > 0 ? saved : defaultTabs(starterCode);
}

export function saveLessonTabs(lessonId: string, tabs: SolutionTab[]): void {
  tabsMap()[lessonId] = tabs;
  tabsDirty = true;
  tabsWriteTimer ??= setTimeout(flushTabs, TABS_WRITE_DELAY_MS);
}

// ---- Whole-progress operations ----------------------------------------------------------

/** Bumped when progress is replaced or cleared, so open editors reload their tabs. */
const generation = createSignal(0);

export function useProgressGeneration(): number {
  return useSyncExternalStore(generation.subscribe, generation.get, () => 0);
}

export function loadProgress(): ProgressSnapshot {
  return { solved: [...solved.get()], tabs: { ...tabsMap() } };
}

/**
 * Replaces this browser's progress, all or nothing:
 * - `saved`: both parts were written.
 * - `unchanged`: storage refused, and the old progress is intact.
 * - `partial`: storage refused the solved list and then refused restoring the old code,
 *   so it holds the new code with the old solved list. Saving again fixes it.
 */
export function replaceProgress(progress: ProgressSnapshot): 'saved' | 'unchanged' | 'partial' {
  // Persist pending edits first, so a refused write below can't lose them.
  flushTabs();
  const previousTabs = readItem(STORAGE_KEYS.tabs);
  // Overwrite rather than remove-then-write: a refused setItem keeps the old value.
  if (!writeItem(STORAGE_KEYS.tabs, JSON.stringify(progress.tabs))) return 'unchanged';
  const nextSolved = new Set(progress.solved);
  if (!writeItem(STORAGE_KEYS.solved, JSON.stringify([...nextSolved]))) {
    // Put the old code back so new code never pairs with the old solved list.
    if (previousTabs === null) removeItem(STORAGE_KEYS.tabs);
    else if (!writeItem(STORAGE_KEYS.tabs, previousTabs)) return 'partial';
    return 'unchanged';
  }
  tabsCache = { ...progress.tabs };
  tabsDirty = false;
  solved.set(nextSolved);
  generation.set(generation.get() + 1);
  return 'saved';
}

export function clearProgress(): void {
  if (tabsWriteTimer !== null) clearTimeout(tabsWriteTimer);
  tabsWriteTimer = null;
  tabsCache = {};
  tabsDirty = false;
  removeItem(STORAGE_KEYS.solved);
  removeItem(STORAGE_KEYS.tabs);
  solved.set(new Set());
  generation.set(generation.get() + 1);
}

// ---- Last opened lesson -----------------------------------------------------------------

export function loadActiveLessonId(): string | null {
  return readItem(STORAGE_KEYS.activeLesson);
}

export function saveActiveLessonId(lessonId: string): void {
  writeItem(STORAGE_KEYS.activeLesson, lessonId);
}
