import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The docs now live in the bespoke single-page guide at /docs
// (src/pages/docs.astro). Starlight was retired along with its markdown
// content collection; sitemap is kept standalone for the marketing site.
// Tailwind v4 is wired in as a Vite plugin; the @astrojs/tailwind
// integration was for the v3 line and is no longer used.
export default defineConfig({
  site: 'https://cloudzilla.dev',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) =>
        !['/403', '/500', '/loading', '/maintenance'].some((p) =>
          page === `https://cloudzilla.dev${p}/` || page === `https://cloudzilla.dev${p}`,
        ),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
