import type { ReactNode } from 'react';
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router';
import { Analytics } from '@vercel/analytics/react';
import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import { TooltipProvider } from '@/components/ui/tooltip';
import { THEME_BOOT_SCRIPT } from '@/features/preferences/preferences';
import { RESUME_LESSON_BOOT_SCRIPT } from '@/features/progress/progress';
import { SITE_HEAD } from '@/features/seo/seo';
import { FIRST_LESSON } from '@/course';
import { SITE_URL } from '@/site';
import appCss from '../styles.css?url';

/**
 * iOS Safari zooms into inputs under 16px, like the code editor. maximum-scale stops that
 * there and still allows pinch zoom (on Android it would block zoom, so it's iOS only).
 */
const IOS_VIEWPORT_SCRIPT = `if(/iPhone|iPad|iPod/.test(navigator.userAgent)){document.querySelector('meta[name="viewport"]')?.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1')}`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#161618', media: '(prefers-color-scheme: dark)' },
      { name: 'theme-color', content: '#f3f4f6', media: '(prefers-color-scheme: light)' },
      ...SITE_HEAD.meta,
    ],
    links: [
      { rel: 'preload', href: geistLatin, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: appCss },
      ...SITE_HEAD.links,
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: RESUME_LESSON_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: IOS_VIEWPORT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <TooltipProvider delayDuration={400}>{children}</TooltipProvider>
        <SiteAnalytics />
        <Scripts />
      </body>
    </html>
  );
}

function SiteAnalytics() {
  if (!import.meta.env.PROD || typeof window === 'undefined') return null;
  const { hostname, origin } = window.location;
  return origin === SITE_URL || hostname.endsWith('.vercel.app') ? <Analytics /> : null;
}

function NotFound() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-prose">There’s no lesson at this address.</p>
      <Link
        to="/lessons/$lessonId"
        params={{ lessonId: FIRST_LESSON.id }}
        className="text-brand underline-offset-4 hover:underline"
      >
        Go to the first lesson
      </Link>
    </main>
  );
}
