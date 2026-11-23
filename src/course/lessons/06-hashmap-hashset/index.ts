import type { SectionData } from '../../types.ts';
import { compositeKeys } from './composite-keys.ts';
import { counting } from './counting.ts';
import { grouping } from './grouping.ts';
import { hashmapBasics } from './hashmap-basics.ts';
import { hashsetBasics } from './hashset-basics.ts';
import { iteratingMaps } from './iterating-maps.ts';
import { setOperations } from './set-operations.ts';

export const hashMapsAndSets: SectionData = {
  id: 'hashmap-hashset',
  title: 'HashMap & HashSet',
  lessons: [hashmapBasics, counting, grouping, iteratingMaps, hashsetBasics, setOperations, compositeKeys],
};
