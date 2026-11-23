import type { SectionData } from '../../types.ts';
import { floorAndCeiling } from './floor-and-ceiling.ts';
import { rangeViews } from './range-views.ts';
import { treemapBasics } from './treemap-basics.ts';
import { treesetBasics } from './treeset-basics.ts';

export const treeMapsAndSets: SectionData = {
  id: 'treemap-treeset',
  title: 'TreeMap & TreeSet',
  lessons: [treemapBasics, floorAndCeiling, treesetBasics, rangeViews],
};
