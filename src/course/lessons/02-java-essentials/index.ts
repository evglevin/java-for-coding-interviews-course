import type { SectionData } from '../../types.ts';
import { boxedIntegers } from './boxed-integers.ts';
import { characters } from './characters.ts';
import { integerOverflow } from './integer-overflow.ts';
import { records } from './records.ts';
import { stringsAndStringbuilder } from './strings-and-stringbuilder.ts';
import { switchExpressions } from './switch-expressions.ts';

export const javaEssentials: SectionData = {
  id: 'java-essentials',
  title: 'Java Essentials & Gotchas',
  lessons: [stringsAndStringbuilder, characters, boxedIntegers, integerOverflow, records, switchExpressions],
};
