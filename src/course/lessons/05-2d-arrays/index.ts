import type { SectionData } from '../../types.ts';
import { creatingGrids } from './creating-grids.ts';
import { gridNeighbors } from './grid-neighbors.ts';
import { jaggedArrays } from './jagged-arrays.ts';
import { transposeAndRotate } from './transpose-and-rotate.ts';

export const twoDArrays: SectionData = {
  id: '2d-arrays',
  title: '2D Arrays',
  lessons: [creatingGrids, gridNeighbors, jaggedArrays, transposeAndRotate],
};
