import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

/** localStorage stand-in that can be told to refuse writes, like a full or blocked store. */
class MemoryStorage {
  data = new Map<string, string>();
  refuse = new Set<string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.refuse.has(key)) throw new DOMException('Quota exceeded', 'QuotaExceededError');
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

const storage = new MemoryStorage();
let progress: typeof import('./progress');

beforeAll(async () => {
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('window', { addEventListener() {} });
  vi.stubGlobal('document', { addEventListener() {}, visibilityState: 'visible' });
  progress = await import('./progress');
});

beforeEach(() => {
  progress.clearProgress();
  storage.refuse.clear();
});

const tabs = (code: string) => [{ id: 'tab-1', name: 'Solution 1', code }];

describe('progress', () => {
  it('falls back to the starter code for a lesson with no saved tabs', () => {
    expect(progress.loadLessonTabs('sort-ascending', 'starter')).toEqual(tabs('starter'));
  });

  it('keeps saved tabs and solved lessons', () => {
    progress.saveLessonTabs('sort-ascending', tabs('mine'));
    progress.markSolved('sort-ascending');
    expect(progress.loadLessonTabs('sort-ascending', 'starter')).toEqual(tabs('mine'));
    expect(progress.loadProgress().solved).toEqual(['sort-ascending']);
  });

  it('replaces everything when storage accepts the new progress', () => {
    progress.saveLessonTabs('a', tabs('old'));
    expect(progress.replaceProgress({ solved: ['b'], tabs: { b: tabs('new') } })).toBe('saved');
    expect(progress.loadProgress()).toEqual({ solved: ['b'], tabs: { b: tabs('new') } });
  });

  it('leaves the old progress intact when storage refuses the new code', () => {
    progress.saveLessonTabs('a', tabs('old'));
    storage.refuse.add('java_interviews_tabs_v1');
    expect(progress.replaceProgress({ solved: ['b'], tabs: { b: tabs('new') } })).toBe('unchanged');
    expect(progress.loadLessonTabs('a', 'starter')).toEqual(tabs('old'));
  });

  it('puts the old code back when storage refuses the new solved list', () => {
    progress.saveLessonTabs('a', tabs('old'));
    storage.refuse.add('java_interviews_solved_v1');
    expect(progress.replaceProgress({ solved: ['b'], tabs: { b: tabs('new') } })).toBe('unchanged');
    expect(JSON.parse(storage.getItem('java_interviews_tabs_v1')!)).toEqual({ a: tabs('old') });
  });

  it('clears solved lessons and code', () => {
    progress.saveLessonTabs('a', tabs('mine'));
    progress.markSolved('a');
    progress.clearProgress();
    expect(progress.loadProgress()).toEqual({ solved: [], tabs: {} });
  });

  it('reports whether a lesson was newly solved', () => {
    expect(progress.markSolved('a')).toBe(true);
    expect(progress.markSolved('a')).toBe(false);
    expect(progress.getSolvedIds().has('a')).toBe(true);
  });

  it('detects when all course lessons are solved, ignoring unknown ids', () => {
    const courseLessons = ['a', 'b', 'c'];
    expect(progress.areAllLessonsSolved(new Set(), [])).toBe(false);
    expect(progress.areAllLessonsSolved(new Set(['a', 'b', 'stale-lesson']), courseLessons)).toBe(false);
    expect(progress.areAllLessonsSolved(new Set(['a', 'b', 'c']), courseLessons)).toBe(true);
    expect(progress.areAllLessonsSolved(new Set(['a', 'b', 'c', 'stale-lesson']), courseLessons)).toBe(true);
  });
});
