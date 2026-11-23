import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { LESSONS } from './src/course/index.ts';
import { SITE_URL } from './src/site.ts';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      // A static site: every page is rendered to HTML at build time, and nothing runs on a server.
      prerender: { enabled: true, crawlLinks: false, failOnError: true },
      pages: [{ path: '/' }, ...LESSONS.map((lesson) => ({ path: `/lessons/${lesson.id}` }))],
      sitemap: { enabled: true, host: SITE_URL },
    }),
    viteReact(),
  ],
  worker: { format: 'es' },
});
