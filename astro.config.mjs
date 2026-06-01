import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://cloudzilla.dev',
  output: 'static',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    starlight({
      title: 'Cloudzilla',
      favicon: '/favicon.svg',
      customCss: ['./src/styles/global.css', './src/styles/starlight.css'],
      // The site is dark-only (the landing layout hardcodes the dark class).
      // Pin Starlight to dark before its own theme script runs so the docs
      // chrome and Shiki code blocks match, and hide the now-redundant toggle.
      head: [
        {
          tag: 'script',
          content:
            "try{localStorage.setItem('starlight-theme','dark')}catch(e){}document.documentElement.dataset.theme='dark';",
        },
      ],
      social: {
        github: 'https://github.com/mkappworks-dev/cloudzilla-app',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Configuration', slug: 'getting-started/configuration' },
            { label: 'Deployment', slug: 'getting-started/deployment' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Features', slug: 'concepts/features' },
            { label: 'Access Control', slug: 'concepts/access-control' },
            { label: 'Git Transport', slug: 'concepts/git-transport' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'API Reference (GitHub)', link: 'https://github.com/mkappworks-dev/cloudzilla-app/blob/main/docs/api-reference.md' },
          ],
        },
      ],
    }),
  ],
});
