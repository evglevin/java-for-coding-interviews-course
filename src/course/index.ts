/** The course: sections in order, each with its lessons in order. */

import type { Lesson, Section, SectionData } from './types.ts';
import { sorting } from './lessons/01-sorting/index.ts';
import { javaEssentials } from './lessons/02-java-essentials/index.ts';
import { arraysAndLists } from './lessons/03-arrays-lists/index.ts';
import { stacksAndQueues } from './lessons/04-stacks-queues/index.ts';
import { twoDArrays } from './lessons/05-2d-arrays/index.ts';
import { hashMapsAndSets } from './lessons/06-hashmap-hashset/index.ts';
import { priorityQueues } from './lessons/07-priority-queue/index.ts';
import { treeMapsAndSets } from './lessons/08-treemap-treeset/index.ts';

const COURSE: SectionData[] = [
  sorting,
  javaEssentials,
  arraysAndLists,
  stacksAndQueues,
  twoDArrays,
  hashMapsAndSets,
  priorityQueues,
  treeMapsAndSets,
];

export const SECTIONS: Section[] = COURSE.map((section, i) => ({
  id: section.id,
  number: i + 1,
  title: section.title,
  lessonIds: section.lessons.map((l) => l.id),
}));

export const LESSONS: Lesson[] = COURSE.flatMap((section) =>
  section.lessons.map((lesson, i) => ({ ...lesson, sectionId: section.id, positionInSection: i + 1 })),
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
