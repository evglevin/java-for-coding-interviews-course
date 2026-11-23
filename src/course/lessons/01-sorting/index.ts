import type { SectionData } from '../../types.ts';
import { comparatorChaining } from './comparator-chaining.ts';
import { customComparator } from './custom-comparator.ts';
import { sortAscending } from './sort-ascending.ts';
import { sortDescending } from './sort-descending.ts';
import { sortedCopy } from './sorted-copy.ts';

export const sorting: SectionData = {
  id: 'sorting',
  title: 'Sorting',
  lessons: [sortAscending, sortDescending, customComparator, comparatorChaining, sortedCopy],
};
