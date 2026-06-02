import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// The docs now live in the bespoke single-page guide at /docs
// (src/pages/docs.astro). Starlight was retired along with its markdown
// content collection; sitemap is kept standalone for the marketing site.
export default defineConfig({
  site: 'https://cloudzilla.dev',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
});
