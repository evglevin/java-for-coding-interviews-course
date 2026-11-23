import type { ReactNode } from 'react';
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router';
import { TooltipProvider } from '@/components/ui/tooltip';
import { THEME_BOOT_SCRIPT } from '@/features/preferences/preferences';
import { SITE_HEAD } from '@/features/seo/seo';
import { FIRST_LESSON } from '@/course';
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
    links: [{ rel: 'stylesheet', href: appCss }, ...SITE_HEAD.links],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: IOS_VIEWPORT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <TooltipProvider delayDuration={400}>{children}</TooltipProvider>
        <Scripts />
      </body>
    </html>
  );
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
