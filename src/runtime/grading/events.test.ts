import { describe, expect, it } from 'vitest';
import { EventReader } from './events';

const frame = (json: object) => `\u001E${JSON.stringify(json)}\u001F`;

describe('EventReader', () => {
  it('separates program output from harness events', () => {
    const reader = new EventReader();
    reader.push(`hello\n${frame({ e: 'start', i: 0 })}world${frame({ e: 'done' })}`);
    expect(reader.stdout).toBe('hello\nworld');
    expect(reader.events).toEqual([{ e: 'start', i: 0 }, { e: 'done' }]);
  });

  it('reassembles frames split across chunks', () => {
    const reader = new EventReader();
    const text = `a${frame({ e: 'result', i: 2, passed: true, actual: '[1, 2]' })}b`;
    for (const char of text) reader.push(char);
    expect(reader.stdout).toBe('ab');
    expect(reader.events).toEqual([{ e: 'result', i: 2, passed: true, actual: '[1, 2]' }]);
  });

  it('keeps output printed without a trailing newline intact', () => {
    const reader = new EventReader();
    reader.push(`no newline${frame({ e: 'done' })}`);
    expect(reader.stdout).toBe('no newline');
  });

  it('drops a frame cut off mid-way without losing surrounding output', () => {
    const reader = new EventReader();
    reader.push('before\u001E{"e":"res');
    expect(reader.stdout).toBe('before');
    expect(reader.events).toEqual([]);
  });

  it('truncates very long output', () => {
    const reader = new EventReader();
    reader.push('x'.repeat(150_000));
    expect(reader.stdout.length).toBeLessThan(101_000);
    expect(reader.stdout).toMatch(/output truncated/);
  });
});
