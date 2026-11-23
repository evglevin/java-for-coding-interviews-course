import type { SectionData } from '../../types.ts';
import { deques } from './deques.ts';
import { minStack } from './min-stack.ts';
import { queues } from './queues.ts';
import { stacks } from './stacks.ts';

export const stacksAndQueues: SectionData = {
  id: 'stacks-queues',
  title: 'Stacks & Queues',
  lessons: [stacks, queues, deques, minStack],
};
