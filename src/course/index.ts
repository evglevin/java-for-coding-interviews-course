/** The course: sections in order, each with its lessons in order. */

import type { Lesson, Section, SectionData } from './types.ts';
import { sorting } from './lessons/01-sorting/index.ts';

const COURSE: SectionData[] = [sorting];

export const SECTIONS: Section[] = COURSE.map((section, i) => ({
  id: section.id,
  number: i + 1,
  title: section.title,
  lessonIds: section.lessons.map((l) => l.id),
}));

export const LESSONS: Lesson[] = COURSE.flatMap((section) =>
  section.lessons.map((lesson, i) => ({ ...lesson, sectionId: section.id, positionInSection: i + 1 }))
).map((lesson, index) => ({ ...lesson, index }));

const lessonsById = new Map(LESSONS.map((l) => [l.id, l]));
const sectionsById = new Map(SECTIONS.map((s) => [s.id, s]));

export const FIRST_LESSON = LESSONS[0];

export function findLesson(id: string): Lesson | undefined {
  return lessonsById.get(id);
}

export function getSection(id: string): Section {
  const section = sectionsById.get(id);
  if (!section) throw new Error(`Unknown section: ${id}`);
  return section;
}

export function lessonsInSection(sectionId: string): Lesson[] {
  return getSection(sectionId).lessonIds.map((id) => lessonsById.get(id)!);
}
