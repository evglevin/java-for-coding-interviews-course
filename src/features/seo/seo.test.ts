import { describe, expect, it } from 'vitest';
import { LESSONS } from '@/course';
import { SITE_DESCRIPTION } from '@/site';
import { plainText } from './seo';

// Bing Webmaster Tools flags meta descriptions outside 25–160 characters.
const MIN = 25;
const MAX = 160;

describe('meta descriptions', () => {
  it('home page description fits search engine limits', () => {
    expect(SITE_DESCRIPTION.length).toBeGreaterThanOrEqual(MIN);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(MAX);
  });

  it.each(LESSONS.map((lesson) => [lesson.id, plainText(lesson.summary)]))(
    'lesson %s description fits search engine limits',
    (_id, description) => {
      expect(description.length).toBeGreaterThanOrEqual(MIN);
      expect(description.length).toBeLessThanOrEqual(MAX);
    },
  );
});
