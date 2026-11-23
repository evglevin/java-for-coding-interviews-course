import type { SectionData } from '../../types.ts';
import { sortAscending } from './sort-ascending.ts';

export const sorting: SectionData = {
  id: 'sorting',
  title: 'Sorting',
  lessons: [sortAscending],
};
