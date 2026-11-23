import { describe, expect, it } from 'vitest';
import { LESSONS } from '@/course';
import { decodeProgress, encodeProgress } from './progressLink';

const [first, second] = LESSONS;

describe('progress links', () => {
  it('round-trips solved lessons and edited code', async () => {
    const progress = {
      solved: [first.id],
      tabs: {
        [first.id]: [
          { id: 'tab-1', name: 'Solution 1', code: 'class Solution { /* mine */ }' },
          { id: 'tab-7', name: 'Solution 2', code: first.starterCode },
        ],
      },
    };
    const decoded = await decodeProgress(await encodeProgress(progress));
    expect(decoded).toEqual({
      status: 'valid',
      progress: {
        solved: [first.id],
        tabs: {
          [first.id]: [
            { id: 'tab-1', name: 'Solution 1', code: 'class Solution { /* mine */ }' },
            { id: 'tab-2', name: 'Solution 2', code: first.starterCode },
          ],
        },
      },
    });
  });

  it('leaves out lessons still at their starter code and lessons it doesn’t know', async () => {
    const data = await encodeProgress({
      solved: ['no-such-lesson', second.id],
      tabs: {
        [second.id]: [{ id: 'tab-1', name: 'Solution 1', code: second.starterCode }],
        'no-such-lesson': [{ id: 'tab-1', name: 'Solution 1', code: 'x' }],
      },
    });
    expect(await decodeProgress(data)).toEqual({ status: 'valid', progress: { solved: [second.id], tabs: {} } });
  });

  it('rejects truncated or corrupted links', async () => {
    const data = await encodeProgress({ solved: [first.id], tabs: {} });
    expect(await decodeProgress(data.slice(0, data.length / 2))).toEqual({ status: 'invalid' });
    expect(await decodeProgress('not-base64-!!')).toEqual({ status: 'invalid' });
  });
});
