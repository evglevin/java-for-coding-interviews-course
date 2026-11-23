/** Page metadata for TanStack Router's `head()`: titles, descriptions, social cards, JSON-LD. */

import { LESSONS, SECTIONS, getSection } from '@/course';
import type { Lesson } from '@/course/types';
import { AUTHOR, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/site';

const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
const OG_IMAGE_ALT = `${SITE_NAME}: an interactive Java crash course with lessons you run in the browser`;
export const HOME_TITLE = `${SITE_NAME}: Interactive Java Course`;

type HeadMeta = { title?: string; name?: string; property?: string; content?: string; charSet?: string };
type HeadLink = { rel: string; href: string; type?: string; sizes?: string };
type HeadScript = { type: string; children: string };

export interface PageHead {
  meta: HeadMeta[];
  links: HeadLink[];
  scripts: HeadScript[];
}

/** Strips the inline markup (`code`, **bold**, *emphasis*) for plain-text metadata. */
export function plainText(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function lessonUrl(lessonId: string): string {
  return `${SITE_URL}/lessons/${encodeURIComponent(lessonId)}`;
}

function pageHead(page: {
  title: string;
  description: string;
  url: string;
  type: 'website' | 'article';
  jsonLd: object;
}): PageHead {
  return {
    meta: [
      { title: page.title },
      { name: 'description', content: page.description },
      { property: 'og:type', content: page.type },
      { property: 'og:title', content: page.title },
      { property: 'og:description', content: page.description },
      { property: 'og:url', content: page.url },
      { name: 'twitter:title', content: page.title },
      { name: 'twitter:description', content: page.description },
    ],
    links: [{ rel: 'canonical', href: page.url }],
    scripts: [{ type: 'application/ld+json', children: JSON.stringify(page.jsonLd) }],
  };
}

/** Tags shared by every page; page-specific ones come from homeHead/lessonHead. */
export const SITE_HEAD = {
  meta: [
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: AUTHOR },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:image', content: OG_IMAGE_URL },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: OG_IMAGE_ALT },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: OG_IMAGE_URL },
    { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
  ],
  links: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
} satisfies Omit<PageHead, 'scripts'>;

export function homeHead(): PageHead {
  return pageHead({
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: `${SITE_URL}/`,
      image: OG_IMAGE_URL,
      inLanguage: 'en',
      isAccessibleForFree: true,
      provider: { '@type': 'Person', name: AUTHOR },
      hasPart: SECTIONS.map((section) => ({ '@type': 'CreativeWork', name: section.title })),
      numberOfLessons: LESSONS.length,
    },
  });
}

export function lessonHead(lesson: Lesson): PageHead {
  const section = getSection(lesson.sectionId);
  const title = `${lesson.title} in Java: ${SITE_NAME}`;
  const description = plainText(lesson.summary);
  const url = lessonUrl(lesson.id);
  return pageHead({
    title,
    description,
    url,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LearningResource',
          name: lesson.title,
          headline: title,
          description,
          url,
          image: OG_IMAGE_URL,
          inLanguage: 'en',
          isAccessibleForFree: true,
          learningResourceType: 'Interactive programming lesson',
          educationalUse: 'Coding interview preparation',
          teaches: `${section.title} in Java`,
          position: lesson.index + 1,
          isPartOf: { '@type': 'Course', name: SITE_NAME, url: `${SITE_URL}/` },
          author: { '@type': 'Person', name: AUTHOR },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: section.title, item: lessonUrl(section.lessonIds[0]) },
            { '@type': 'ListItem', position: 3, name: lesson.title, item: url },
          ],
        },
      ],
    },
  });
}
