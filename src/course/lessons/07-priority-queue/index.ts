import type { SectionData } from '../../types.ts';
import { customPriority } from './custom-priority.ts';
import { maxHeap } from './max-heap.ts';
import { mergeKSorted } from './merge-k-sorted.ts';
import { priorityQueueBasics } from './priority-queue-basics.ts';
import { runningMedian } from './running-median.ts';
import { topK } from './top-k.ts';

export const priorityQueues: SectionData = {
  id: 'priority-queue',
  title: 'PriorityQueue',
  lessons: [priorityQueueBasics, maxHeap, customPriority, topK, mergeKSorted, runningMedian],
};
