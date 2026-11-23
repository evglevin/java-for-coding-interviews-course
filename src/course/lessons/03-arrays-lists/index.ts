import type { SectionData } from '../../types.ts';
import { arrayList } from './arraylist.ts';
import { arrays } from './arrays.ts';
import { convertingArraysAndLists } from './converting-arrays-and-lists.ts';
import { copyingAndSlicing } from './copying-and-slicing.ts';
import { removingFromLists } from './removing-from-lists.ts';
import { streams } from './streams.ts';

export const arraysAndLists: SectionData = {
  id: 'arrays-lists',
  title: 'Arrays & Lists',
  lessons: [arrays, arrayList, removingFromLists, convertingArraysAndLists, copyingAndSlicing, streams],
};
