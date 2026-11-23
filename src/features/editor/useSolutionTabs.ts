import { useCallback, useRef, useState } from 'react';
import type { Lesson } from '@/course/types';
import { loadLessonTabs, saveLessonTabs, useProgressGeneration, type SolutionTab } from '@/features/progress/progress';

export const MAX_TABS = 5;

/**
 * The open lesson's editor tabs. Reloads them when the lesson changes or progress is
 * replaced (import, reset); every change is saved.
 */
export function useSolutionTabs(lesson: Lesson) {
  const generation = useProgressGeneration();
  const load = useCallback(() => loadLessonTabs(lesson.id, lesson.starterCode), [lesson]);
  const [state, setState] = useState(() => ({ lessonId: lesson.id, generation, tabs: load(), activeId: 'tab-1' }));

  let current = state;
  if (state.lessonId !== lesson.id || state.generation !== generation) {
    const tabs = load();
    current = { lessonId: lesson.id, generation, tabs, activeId: tabs[0].id };
    setState(current);
  }
  // CodeMirror can report several edits before React re-renders; always build on the latest tabs.
  const latest = useRef(current);
  latest.current = current;

  const commit = useCallback((tabs: SolutionTab[], activeId = latest.current.activeId) => {
    const next = { ...latest.current, tabs, activeId };
    latest.current = next;
    setState(next);
    saveLessonTabs(next.lessonId, tabs);
  }, []);

  const activeTab = current.tabs.find((t) => t.id === current.activeId) ?? current.tabs[0];

  return {
    tabs: current.tabs,
    activeTab,
    /** Identifies the document in the editor: changes when the lesson or tab does. */
    documentKey: `${current.lessonId}:${activeTab.id}:${current.generation}`,
    select: useCallback((id: string) => {
      const { tabs } = latest.current;
      if (tabs.some((t) => t.id === id)) setState((latest.current = { ...latest.current, activeId: id }));
    }, []),
    add: useCallback(() => {
      const { tabs } = latest.current;
      if (tabs.length >= MAX_TABS) return;
      const ids = new Set(tabs.map((t) => t.id));
      let n = tabs.length + 1;
      while (ids.has(`tab-${n}`)) n++;
      const tab = { id: `tab-${n}`, name: `Solution ${n}`, code: lesson.starterCode };
      commit([...tabs, tab], tab.id);
    }, [commit, lesson.starterCode]),
    close: useCallback(
      (id: string) => {
        const { tabs, activeId } = latest.current;
        if (tabs.length <= 1) return;
        const next = tabs.filter((t) => t.id !== id);
        commit(next, activeId === id ? next[0].id : activeId);
      },
      [commit],
    ),
    /** The active tab's code changed. */
    change: useCallback(
      (code: string) => {
        const { tabs, activeId } = latest.current;
        commit(tabs.map((t) => (t.id === activeId ? { ...t, code } : t)));
      },
      [commit],
    ),
  };
}
