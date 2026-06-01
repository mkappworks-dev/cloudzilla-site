# Cloudzilla Marketing & Docs Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Astro + Starlight site (`cloudzilla-site/`) with a marketing landing page, curated docs, a roadmap page, and a changelog — matching the app's dark/Geist aesthetic and driving traffic to GitHub and the Docker package.

**Architecture:** Static Astro 4 site (`output: 'static'`, no SSR adapter). Hand-built landing route at `/`; Starlight powers `/docs`; dedicated `/roadmap` and `/changelog` pages. Tailwind reuses the app's shadcn HSL token system; Geist/Geist Mono are self-hosted via `@fontsource-variable`. Zero JS by default — the only client island is a copy-to-clipboard button.

**Tech Stack:** Astro 4, @astrojs/starlight, @astrojs/tailwind, Tailwind CSS, @fontsource-variable/geist(+mono), TypeScript.

**Verification note:** This is a static content site, so "tests" are build integrity, presence/grep checks, and a final headless-browser pass — not unit tests. Each task ends by running `npm run build` (must succeed with no broken-link warnings) and committing.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `astro.config.mjs` | Register tailwind + starlight integrations, sidebar config |
| `tailwind.config.mjs` | HSL token → utility mapping, Geist font families |
| `package.json` | Dependencies + scripts |
| `src/styles/global.css` | `@tailwind` layers + dark-theme CSS vars + `grid-bg` utility |
| `src/styles/starlight.css` | Starlight theme overrides → app tokens |
| `public/favicon.svg` | Cloud mark (copied from app) |
| `public/screenshots/*.png` | Captured mockup images |
| `src/consts.ts` | Shared constants (URLs, version, feature list) |
| `src/layouts/LandingLayout.astro` | `<head>`, fonts, dark `<html>`, slots Nav/Footer |
| `src/components/landing/*.astro` | Nav, Hero, FeatureGrid, Architecture, InstallTabs, Screenshots, RoadmapPreview, CTA, Footer, CopyButton |
| `src/pages/index.astro` | Landing page composition |
| `src/pages/roadmap.astro` | Visual M1/M2 roadmap |
| `src/pages/changelog.astro` | Changelog page |
| `src/content/docs/**` | Starlight MDX docs |
| `src/content.config.ts` | Starlight docs collection |

---

## Task 1: Install dependencies and configure Astro

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Create: `tailwind.config.mjs`

- [ ] **Step 1: Install integrations and fonts**

Run from `cloudzilla-site/`:

```bash
npm install
npx astro add starlight tailwind --yes
npm install @fontsource-variable/geist @fontsource-variable/geist-mono
```

`astro add` rewrites `astro.config.mjs` and adds `@astrojs/tailwind`, `@astrojs/starlight`, `tailwindcss`. Accept its prompts (the `--yes` flag).

- [ ] **Step 2: Replace `astro.config.mjs`**

```js
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
```

- [ ] **Step 3: Create `tailwind.config.mjs`** (ports the app's token map + Geist)

```js
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        border: { DEFAULT: 'hsl(var(--border))', strong: 'hsl(var(--border-strong))' },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        success: { DEFAULT: 'hsl(var(--success))', foreground: 'hsl(var(--success-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      fontFamily: {
        sans: ['Geist Variable', ...defaultTheme.fontFamily.sans],
        mono: ['Geist Mono Variable', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Verify build runs**

Run: `npm run build`
Expected: build succeeds (Starlight may warn about missing doc pages — that's fine until Task 11; there must be no config/syntax errors).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add starlight + tailwind integrations and token config"
```

---

## Task 2: Design tokens, fonts, and global styles

**Files:**
- Create: `src/styles/global.css`
- Create: `src/styles/starlight.css`

- [ ] **Step 1: Create `src/styles/global.css`** (dark tokens ported from the app + hero grid utility)

```css
@import '@fontsource-variable/geist';
@import '@fontsource-variable/geist-mono';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 0%;
    --foreground: 0 0% 93%;
    --card: 0 0% 4%;
    --card-foreground: 0 0% 93%;
    --popover: 0 0% 6%;
    --popover-foreground: 0 0% 93%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 0%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 93%;
    --muted: 0 0% 10%;
    --muted-foreground: 0 0% 71%;
    --accent: 0 0% 10%;
    --accent-foreground: 0 0% 98%;
    --success: 142 71% 56%;
    --success-foreground: 0 0% 0%;
    --warning: 48 96% 60%;
    --border: 0 0% 100% / 0.10;
    --border-strong: 0 0% 100% / 0.18;
    --input: 0 0% 100% / 0.10;
    --ring: 222 100% 71%;
    --radius: 0.375rem;
  }

  html { color-scheme: dark; scroll-behavior: smooth; }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-feature-settings: "ss01", "cv11";
  }

  :focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { transition: none !important; animation: none !important; }
  }
}

@layer utilities {
  .grid-bg {
    background-image:
      linear-gradient(hsl(var(--border)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask-image: radial-gradient(ellipse at top, black 20%, transparent 70%);
    mask-image: radial-gradient(ellipse at top, black 20%, transparent 70%);
  }
}
```

- [ ] **Step 2: Create `src/styles/starlight.css`** (maps Starlight's vars to the brand)

```css
/* Bridge Starlight's design tokens to Cloudzilla's palette. */
:root {
  --sl-font: 'Geist Variable', sans-serif;
  --sl-font-mono: 'Geist Mono Variable', monospace;
}
:root[data-theme='dark'] {
  --sl-color-accent-low: #11233f;
  --sl-color-accent: #2b6fff;
  --sl-color-accent-high: #b8ccff;
  --sl-color-white: #ededed;
  --sl-color-gray-1: #e6e6e6;
  --sl-color-gray-2: #b4b4b4;
  --sl-color-gray-3: #8c8c8c;
  --sl-color-gray-4: #2b2b2b;
  --sl-color-gray-5: #181818;
  --sl-color-gray-6: #0a0a0a;
  --sl-color-black: #000000;
}
```

- [ ] **Step 3: Force the dark theme default in Starlight**

Starlight respects system preference by default. To match the app's always-dark look, set the default in `astro.config.mjs` Starlight options by adding `head` is unnecessary; instead rely on `data-theme`. Add this to `starlight.css` so light mode still reads on-brand if a user toggles it (no extra config needed). No code change beyond Step 2 — verify visually in Task 11.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds; CSS compiles with no unknown-utility errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add dark design tokens, Geist fonts, and Starlight theme bridge"
```

---

## Task 3: Brand assets and screenshots

**Files:**
- Create: `public/favicon.svg`
- Create: `public/screenshots/{home,repo,pr}.png`

- [ ] **Step 1: Copy the cloud mark**

```bash
cp ../cloudzilla-app/cmd/server/frontend/static/favicon.svg public/favicon.svg
```

- [ ] **Step 2: Capture mockup screenshots**

Use a headless browser to render three mockups to PNG at 1440×900. With the Playwright MCP (or `npx playwright`), open each local file and screenshot:

- `../cloudzilla-app/mockups/home.html` → `public/screenshots/home.png`
- `../cloudzilla-app/mockups/repo.html` → `public/screenshots/repo.png`
- `../cloudzilla-app/mockups/pr.html` → `public/screenshots/pr.png`

CLI fallback if Playwright is installed:

```bash
npx playwright screenshot --viewport-size=1440,900 "file://$(cd ../cloudzilla-app && pwd)/mockups/home.html" public/screenshots/home.png
npx playwright screenshot --viewport-size=1440,900 "file://$(cd ../cloudzilla-app && pwd)/mockups/repo.html" public/screenshots/repo.png
npx playwright screenshot --viewport-size=1440,900 "file://$(cd ../cloudzilla-app && pwd)/mockups/pr.html" public/screenshots/pr.png
```

- [ ] **Step 3: Verify assets exist**

Run: `ls -la public/favicon.svg public/screenshots/`
Expected: favicon.svg plus three non-empty PNGs.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "assets: add cloud favicon and mockup screenshots"
```

---

## Task 4: Shared constants

**Files:**
- Create: `src/consts.ts`

- [ ] **Step 1: Create `src/consts.ts`**

```ts
export const SITE = {
  name: 'Cloudzilla',
  tagline: 'A minimal, self-hosted Git forge',
  description: 'Single binary. No external runtime dependencies. Git hosting, pull requests, code review, issues, and more.',
  version: 'v0.3.0',
};

export const LINKS = {
  github: 'https://github.com/mkappworks-dev/cloudzilla-app',
  dockerPackage: 'https://github.com/mkappworks-dev/cloudzilla-app/pkgs/container/cloudzilla-app',
  docs: '/docs/getting-started/introduction',
  roadmap: '/roadmap',
  changelog: '/changelog',
};

export const DOCKER_PULL = 'docker pull ghcr.io/mkappworks-dev/cloudzilla-app:v0.3.0';

export const STACK = ['Go', 'Templ', 'HTMX', 'Alpine.js', 'Tailwind CSS', 'PostgreSQL'];

export const FEATURES = [
  { title: 'Git hosting', body: 'HTTP + SSH smart protocol, branch/tag management, code browser with blame, commit history and diffs.' },
  { title: 'Pull requests', body: 'Fast-forward / merge / squash strategies, diff view, draft PRs, auto-merge, conflict detection.' },
  { title: 'Code review', body: 'Approve / request changes, inline line comments, one-click suggestions, CODEOWNERS auto-assign.' },
  { title: 'Issues', body: 'Open/close workflow, labels, assignees, milestones, pinning, locking, private issues, templates.' },
  { title: 'Organizations', body: 'Shared namespaces with owner/member roles, org profile pages, member management.' },
  { title: 'Access control', body: 'Three-tier permissions (instance/org/repo), branch protection, deploy keys, access tokens.' },
  { title: 'Authentication', body: 'JWT cookies, Google OAuth, TOTP 2FA with recovery codes, LDAP/SAML SSO, invitations.' },
  { title: 'Collaboration', body: 'Wikis, discussions, gists, profile READMEs, topics, stars, forks, reactions, @mentions.' },
  { title: 'Notifications', body: 'In-app notifications with unread badge, email (SMTP), watching and subscriptions.' },
  { title: 'Webhooks', body: 'Push/issues/PR events, HMAC-SHA256 signing, retry with backoff, delivery logs.' },
  { title: 'Search', body: 'Full-text search across repos, issues, PRs, and users (PostgreSQL tsvector + GIN).' },
  { title: 'Project management', body: 'Kanban boards, milestones with progress tracking, activity feed.' },
];
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add shared site constants"
```

---

## Task 5: Landing layout

**Files:**
- Create: `src/layouts/LandingLayout.astro`

- [ ] **Step 1: Create `src/layouts/LandingLayout.astro`**

```astro
---
import '../styles/global.css';
import { SITE } from '../consts';
interface Props { title?: string; description?: string; }
const { title = SITE.name, description = SITE.description } = Astro.props;
const fullTitle = title === SITE.name ? `${SITE.name} — ${SITE.tagline}` : `${title} · ${SITE.name}`;
---
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body class="min-h-screen">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background">Skip to content</a>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add landing layout"
```

---

## Task 6: CopyButton island

**Files:**
- Create: `src/components/landing/CopyButton.astro`

- [ ] **Step 1: Create `src/components/landing/CopyButton.astro`** (the only client-side JS)

```astro
---
interface Props { text: string; label?: string; class?: string; }
const { text, label, class: cls = '' } = Astro.props;
---
<button
  type="button"
  data-copy={text}
  class={`copy-btn inline-flex items-center gap-2 font-mono text-sm ${cls}`}
  aria-label="Copy to clipboard"
>
  <span class="select-all">{label ?? text}</span>
  <span class="copy-icon text-muted-foreground" aria-hidden="true">⧉</span>
  <span class="copy-done hidden text-success" aria-hidden="true">✓</span>
</button>
<script>
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        btn.querySelector('.copy-icon')?.classList.add('hidden');
        btn.querySelector('.copy-done')?.classList.remove('hidden');
        setTimeout(() => {
          btn.querySelector('.copy-done')?.classList.add('hidden');
          btn.querySelector('.copy-icon')?.classList.remove('hidden');
        }, 1500);
      } catch (err) {
        console.error('Clipboard write failed', err);
      }
    });
  });
</script>
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add copy-to-clipboard island"
```

---

## Task 7: Nav and Footer

**Files:**
- Create: `src/components/landing/Nav.astro`
- Create: `src/components/landing/Footer.astro`

- [ ] **Step 1: Create `src/components/landing/Nav.astro`**

```astro
---
import { SITE, LINKS } from '../../consts';
---
<header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
  <nav class="container flex h-14 items-center justify-between">
    <a href="/" class="flex items-center gap-2 font-semibold">
      <img src="/favicon.svg" alt="" width="24" height="24" class="rounded" />
      <span>{SITE.name}</span>
      <span class="ml-1 rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{SITE.version}</span>
    </a>
    <div class="flex items-center gap-5 text-sm text-muted-foreground">
      <a href={LINKS.docs} class="hover:text-foreground">Docs</a>
      <a href={LINKS.roadmap} class="hover:text-foreground">Roadmap</a>
      <a href={LINKS.changelog} class="hover:text-foreground">Changelog</a>
      <a href={LINKS.github} class="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted">GitHub ↗</a>
    </div>
  </nav>
</header>
```

- [ ] **Step 2: Create `src/components/landing/Footer.astro`**

```astro
---
import { SITE, LINKS } from '../../consts';
---
<footer class="border-t border-border">
  <div class="container grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
    <div class="space-y-2">
      <div class="flex items-center gap-2 font-semibold">
        <img src="/favicon.svg" alt="" width="20" height="20" class="rounded" />
        {SITE.name}
      </div>
      <p class="text-sm text-muted-foreground">{SITE.tagline}.</p>
    </div>
    <div class="space-y-2 text-sm">
      <p class="font-medium">Product</p>
      <a href={LINKS.docs} class="block text-muted-foreground hover:text-foreground">Docs</a>
      <a href={LINKS.roadmap} class="block text-muted-foreground hover:text-foreground">Roadmap</a>
      <a href={LINKS.changelog} class="block text-muted-foreground hover:text-foreground">Changelog</a>
    </div>
    <div class="space-y-2 text-sm">
      <p class="font-medium">Source</p>
      <a href={LINKS.github} class="block text-muted-foreground hover:text-foreground">GitHub ↗</a>
      <a href={LINKS.dockerPackage} class="block text-muted-foreground hover:text-foreground">Docker package ↗</a>
    </div>
    <div class="space-y-2 text-sm">
      <p class="font-medium">License</p>
      <p class="text-muted-foreground">Business Source License 1.1</p>
      <p class="text-muted-foreground">Built with Astro &amp; Starlight</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add nav and footer"
```

---

## Task 8: Hero

**Files:**
- Create: `src/components/landing/Hero.astro`

- [ ] **Step 1: Create `src/components/landing/Hero.astro`**

```astro
---
import { SITE, LINKS, DOCKER_PULL } from '../../consts';
import CopyButton from './CopyButton.astro';
---
<section class="relative overflow-hidden">
  <div class="grid-bg absolute inset-0 -z-10" aria-hidden="true"></div>
  <div class="container flex flex-col items-center py-24 text-center md:py-32">
    <a href={LINKS.github} class="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
      <span class="h-1.5 w-1.5 rounded-full bg-success"></span> Alpha · {SITE.version} · open source
    </a>
    <h1 class="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">{SITE.tagline}</h1>
    <p class="mt-5 max-w-xl text-lg text-muted-foreground">Single binary. No external runtime dependencies. Self-host Git hosting, pull requests, code review, issues, and more.</p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <a href={LINKS.docs} class="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90">Get started</a>
      <a href={LINKS.github} class="rounded-md border border-border px-5 py-2.5 font-medium hover:bg-muted">View on GitHub ↗</a>
    </div>
    <div class="mt-6">
      <CopyButton text={DOCKER_PULL} class="rounded-md border border-border bg-card px-4 py-2 text-muted-foreground hover:text-foreground" />
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add hero section"
```

---

## Task 9: FeatureGrid, Architecture, InstallTabs, Screenshots, RoadmapPreview, CTA

**Files:**
- Create: `src/components/landing/FeatureGrid.astro`
- Create: `src/components/landing/Architecture.astro`
- Create: `src/components/landing/InstallTabs.astro`
- Create: `src/components/landing/Screenshots.astro`
- Create: `src/components/landing/RoadmapPreview.astro`
- Create: `src/components/landing/CTA.astro`

- [ ] **Step 1: Create `src/components/landing/FeatureGrid.astro`**

```astro
---
import { FEATURES } from '../../consts';
---
<section class="container py-20">
  <h2 class="text-center text-3xl font-bold tracking-tight">Everything a forge needs</h2>
  <p class="mx-auto mt-3 max-w-xl text-center text-muted-foreground">50+ features across identity, git hosting, collaboration, and instance management.</p>
  <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {FEATURES.map((f) => (
      <div class="rounded-lg border border-border bg-card p-5">
        <h3 class="font-semibold">{f.title}</h3>
        <p class="mt-2 text-sm text-muted-foreground">{f.body}</p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Create `src/components/landing/Architecture.astro`**

```astro
---
import { STACK } from '../../consts';
---
<section class="border-y border-border bg-card/40">
  <div class="container py-16 text-center">
    <p class="font-mono text-xs uppercase tracking-wider text-muted-foreground">Built with</p>
    <div class="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      {STACK.map((s) => (
        <span class="font-mono text-sm text-foreground">{s}</span>
      ))}
    </div>
    <p class="mx-auto mt-8 max-w-2xl text-muted-foreground">
      One Go binary serves the web UI, the HTTP git smart protocol, and an SSH server — no git
      executable required. Templ renders type-safe HTML; HTMX and Alpine handle the small amount of
      client behavior. PostgreSQL is the only external dependency.
    </p>
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/landing/InstallTabs.astro`** (CSS-only tabs via radio inputs — no JS)

```astro
---
import CopyButton from './CopyButton.astro';
const docker = `make docker-build\nmake docker-run\n\n# Run migrations\ndocker exec -it cloudzilla-app-cloudzilla-1 /app/cloudzilla-cli migrate\n\n# Open http://localhost:8080 — redirects to /setup`;
const local = `go mod tidy\nmake setup-tailwind\ndocker compose up -d postgres\nmake migrate\nmake dev   # http://localhost:8080`;
---
<section class="container py-20">
  <h2 class="text-center text-3xl font-bold tracking-tight">Up and running in minutes</h2>
  <div class="mx-auto mt-10 max-w-2xl">
    <div class="install-tabs rounded-lg border border-border bg-card">
      <div class="flex border-b border-border">
        <input type="radio" name="install" id="tab-docker" class="peer/docker hidden" checked />
        <label for="tab-docker" class="cursor-pointer px-4 py-2 text-sm text-muted-foreground peer-checked/docker:text-foreground">Docker (recommended)</label>
        <input type="radio" name="install" id="tab-local" class="peer/local hidden" />
        <label for="tab-local" class="cursor-pointer px-4 py-2 text-sm text-muted-foreground peer-checked/local:text-foreground">Local dev</label>
        <div class="panel-docker hidden p-4 [#tab-docker:checked~&]:block">
          <pre class="overflow-x-auto font-mono text-sm text-foreground"><code>{docker}</code></pre>
        </div>
        <div class="panel-local hidden p-4 [#tab-local:checked~&]:block">
          <pre class="overflow-x-auto font-mono text-sm text-foreground"><code>{local}</code></pre>
        </div>
      </div>
    </div>
    <p class="mt-4 text-center text-sm text-muted-foreground">Full guide in the <a href="/docs/getting-started/installation" class="text-foreground underline">installation docs</a>.</p>
  </div>
</section>
```

> Note: the `[#tab-docker:checked~&]:block` arbitrary variant requires the panels to be siblings of the radios. If the Tailwind arbitrary selector proves brittle, fall back to a 6-line `<script>` toggle in this component (still acceptable — it is component-local). Verify rendering in Task 14.

- [ ] **Step 4: Create `src/components/landing/Screenshots.astro`**

```astro
---
const shots = [
  { src: '/screenshots/home.png', alt: 'Cloudzilla dashboard' },
  { src: '/screenshots/repo.png', alt: 'Repository code browser' },
  { src: '/screenshots/pr.png', alt: 'Pull request view' },
];
---
<section class="container py-20">
  <h2 class="text-center text-3xl font-bold tracking-tight">A familiar, fast interface</h2>
  <div class="mt-10 grid gap-6 md:grid-cols-3">
    {shots.map((s) => (
      <figure class="overflow-hidden rounded-lg border border-border bg-card">
        <img src={s.src} alt={s.alt} loading="lazy" class="w-full" />
      </figure>
    ))}
  </div>
</section>
```

- [ ] **Step 5: Create `src/components/landing/RoadmapPreview.astro`**

```astro
---
import { LINKS } from '../../consts';
---
<section class="container py-20">
  <h2 class="text-center text-3xl font-bold tracking-tight">Roadmap</h2>
  <div class="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
    <div class="rounded-lg border border-border bg-card p-6">
      <p class="font-mono text-xs uppercase tracking-wider text-success">Complete</p>
      <h3 class="mt-2 text-lg font-semibold">M1 — Core Platform</h3>
      <p class="mt-2 text-sm text-muted-foreground">Identity, git hosting, issues, PRs, code review, orgs, wikis, discussions, gists, and search. 50+ features across 60+ migrations.</p>
    </div>
    <div class="rounded-lg border border-border bg-card p-6">
      <p class="font-mono text-xs uppercase tracking-wider text-muted-foreground">Planned</p>
      <h3 class="mt-2 text-lg font-semibold">M2 — Advanced Infrastructure</h3>
      <p class="mt-2 text-sm text-muted-foreground">Container registry, Git LFS, CI/CD pipelines, clustering, and a GraphQL API.</p>
    </div>
  </div>
  <p class="mt-8 text-center"><a href={LINKS.roadmap} class="text-foreground underline">See the full roadmap →</a></p>
</section>
```

- [ ] **Step 6: Create `src/components/landing/CTA.astro`**

```astro
---
import { LINKS, DOCKER_PULL } from '../../consts';
import CopyButton from './CopyButton.astro';
---
<section class="border-t border-border">
  <div class="container flex flex-col items-center py-20 text-center">
    <h2 class="text-3xl font-bold tracking-tight">Self-host Cloudzilla today</h2>
    <p class="mt-3 max-w-md text-muted-foreground">One binary, one Postgres. Pull the image and you're running.</p>
    <div class="mt-6"><CopyButton text={DOCKER_PULL} class="rounded-md border border-border bg-card px-4 py-2 text-muted-foreground hover:text-foreground" /></div>
    <div class="mt-6 flex gap-3">
      <a href={LINKS.github} class="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90">Star on GitHub</a>
      <a href={LINKS.dockerPackage} class="rounded-md border border-border px-5 py-2.5 font-medium hover:bg-muted">Docker package ↗</a>
    </div>
  </div>
</section>
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: succeeds (docs pages still pending — Starlight link warnings to `/docs/...` are acceptable until Task 11).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add landing page section components"
```

---

## Task 10: Assemble the landing page

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import LandingLayout from '../layouts/LandingLayout.astro';
import Nav from '../components/landing/Nav.astro';
import Hero from '../components/landing/Hero.astro';
import FeatureGrid from '../components/landing/FeatureGrid.astro';
import Architecture from '../components/landing/Architecture.astro';
import InstallTabs from '../components/landing/InstallTabs.astro';
import Screenshots from '../components/landing/Screenshots.astro';
import RoadmapPreview from '../components/landing/RoadmapPreview.astro';
import CTA from '../components/landing/CTA.astro';
import Footer from '../components/landing/Footer.astro';
---
<LandingLayout>
  <Nav />
  <main id="main">
    <Hero />
    <FeatureGrid />
    <Architecture />
    <InstallTabs />
    <Screenshots />
    <RoadmapPreview />
    <CTA />
  </main>
  <Footer />
</LandingLayout>
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run build && npm run preview &` then `curl -s localhost:4321 | grep -c "self-hosted Git forge"`
Expected: ≥ 1 (kill the preview server afterward with `kill %1`).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: assemble landing page"
```

---

## Task 11: Docs content (Starlight)

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/docs/getting-started/introduction.md`
- Create: `src/content/docs/getting-started/installation.md`
- Create: `src/content/docs/getting-started/configuration.md`
- Create: `src/content/docs/getting-started/deployment.md`
- Create: `src/content/docs/concepts/features.md`
- Create: `src/content/docs/concepts/access-control.md`
- Create: `src/content/docs/concepts/git-transport.md`

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
```

- [ ] **Step 2: Create `getting-started/introduction.md`**

```md
---
title: Introduction
description: What Cloudzilla is and why it exists.
---

Cloudzilla is a minimal, self-hosted Git forge that ships as a **single binary** with
**no external runtime dependencies** beyond PostgreSQL.

One Go process serves the web UI, the HTTP git smart protocol, and an SSH server — no
`git` executable required on the host. It provides git hosting, pull requests, code review,
issues, organizations, wikis, discussions, gists, search, and instance administration.

> **Alpha:** Cloudzilla is under active development. APIs and features may change. Not
> recommended for production use yet.

## Next steps

- [Installation](/docs/getting-started/installation) — run it with Docker.
- [Configuration](/docs/getting-started/configuration) — environment variables and config file.
- [Deployment](/docs/getting-started/deployment) — production notes.
```

- [ ] **Step 3: Create `getting-started/installation.md`**

```md
---
title: Installation
description: Run Cloudzilla with Docker.
---

## Pull the image

```bash
docker pull ghcr.io/mkappworks-dev/cloudzilla-app:v0.3.0
```

The published image lives in the
[GitHub Container Registry](https://github.com/mkappworks-dev/cloudzilla-app/pkgs/container/cloudzilla-app).

## Run with Docker Compose

```bash
make docker-build
make docker-run

# Run migrations
docker exec -it cloudzilla-app-cloudzilla-1 /app/cloudzilla-cli migrate
```

Open `http://localhost:8080` — the first visit redirects to `/setup` to create your
superadmin account. All data persists in Docker named volumes (`cloudzilla_data`,
`postgres_data`).

Set `CZ_AUTH_JWT_SECRET` in `docker-compose.yml` before exposing the instance publicly.
```

- [ ] **Step 4: Create `getting-started/configuration.md`**

```md
---
title: Configuration
description: Environment variables and configuration file.
---

Cloudzilla reads configuration from `config.yaml` and environment variables (env wins).

| Variable | Purpose |
| --- | --- |
| `CZ_DATABASE_DSN` | PostgreSQL connection string |
| `CZ_AUTH_JWT_SECRET` | Secret used to sign JWT session cookies |
| `CZ_GIT_REPOS_ROOT` | Directory where bare git repositories are stored |
| `CZ_GIT_SSH_HOST_KEY` | Path to the SSH host key for the git SSH server |

For the full reference, see the
[configuration docs on GitHub](https://github.com/mkappworks-dev/cloudzilla-app/blob/main/docs/configuration.md).
```

- [ ] **Step 5: Create `getting-started/deployment.md`**

```md
---
title: Deployment
description: Production deployment notes.
---

Cloudzilla deploys as a single container plus a PostgreSQL database.

1. Provision PostgreSQL 14+.
2. Set `CZ_DATABASE_DSN`, `CZ_AUTH_JWT_SECRET`, and `CZ_GIT_REPOS_ROOT`.
3. Run `cloudzilla-cli migrate` once to apply migrations.
4. Persist `CZ_GIT_REPOS_ROOT` and the Postgres data directory on durable volumes.

See the [deployment docs on GitHub](https://github.com/mkappworks-dev/cloudzilla-app/blob/main/docs/deployment.md)
for env-var overrides and bootstrap details.
```

- [ ] **Step 6: Create `concepts/features.md`**

```md
---
title: Features
description: A tour of what Cloudzilla can do.
---

- **Git hosting** — HTTP + SSH smart protocol, branch/tag management, code browser with blame.
- **Pull requests** — fast-forward / merge / squash, diff view, draft PRs, auto-merge.
- **Code review** — approvals, inline comments, one-click suggestions, CODEOWNERS.
- **Issues** — labels, assignees, milestones, pinning, locking, templates.
- **Organizations** — shared namespaces with owner/member roles.
- **Access control** — three-tier permissions, branch protection, deploy keys, tokens.
- **Authentication** — JWT cookies, Google OAuth, TOTP 2FA, LDAP/SAML SSO.
- **Collaboration** — wikis, discussions, gists, stars, forks, reactions, @mentions.
- **Notifications** — in-app + email (SMTP), watching and subscriptions.
- **Webhooks** — HMAC-SHA256 signed, retry with backoff, delivery logs.
- **Search** — full-text across repos, issues, PRs, users.
- **Project management** — Kanban boards, milestones, activity feed.
```

- [ ] **Step 7: Create `concepts/access-control.md`**

```md
---
title: Access Control
description: The permission model.
---

Cloudzilla uses a three-tier permission model: **instance**, **organization**, and
**repository**. Each tier grants `CanRead`, `CanWrite`, `CanManage`, and `IsOwner`
capabilities that compose downward.

Branch protection rules, deploy keys, and personal access tokens layer on top of repo
permissions. For the full role tables and invite-token flow, see the
[access-control docs on GitHub](https://github.com/mkappworks-dev/cloudzilla-app/blob/main/docs/access-control.md).
```

- [ ] **Step 8: Create `concepts/git-transport.md`**

```md
---
title: Git Transport
description: How Cloudzilla serves git over HTTP and SSH.
---

Cloudzilla implements the git smart protocol over **HTTP** and runs an **SSH** server
(`gliderlabs/ssh`) — both in pure Go, with no `git` binary on the host. SSH authentication
uses public keys stored against user accounts.

Permission checks (`CanRead` / `CanWrite`) run on every fetch and push. See the
[git-transport docs on GitHub](https://github.com/mkappworks-dev/cloudzilla-app/blob/main/docs/git-transport.md)
for endpoint and auth details.
```

- [ ] **Step 9: Verify docs build and routes resolve**

Run: `npm run build`
Expected: succeeds with **no** "broken link" warnings for `/docs/...` paths (every sidebar slug now has a file).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "docs: add curated Starlight documentation"
```

---

## Task 12: Roadmap page

**Files:**
- Create: `src/pages/roadmap.astro`

- [ ] **Step 1: Create `src/pages/roadmap.astro`**

```astro
---
import LandingLayout from '../layouts/LandingLayout.astro';
import Nav from '../components/landing/Nav.astro';
import Footer from '../components/landing/Footer.astro';

const m1 = ['Identity & authentication', 'Git hosting (HTTP + SSH)', 'Issues & pull requests', 'Code review & suggestions', 'Organizations & teams', 'Wikis, discussions, gists', 'Search & project boards'];
const m2 = ['Container registry', 'Git LFS', 'CI/CD pipelines', 'Clustering', 'GraphQL API'];
---
<LandingLayout title="Roadmap">
  <Nav />
  <main id="main" class="container py-20">
    <h1 class="text-4xl font-bold tracking-tight">Roadmap</h1>
    <p class="mt-3 max-w-2xl text-muted-foreground">Cloudzilla is built in phases grouped into milestones. M1 is complete; M2 is planned.</p>
    <div class="mt-12 space-y-10">
      <section>
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-semibold">M1 — Core Platform</h2>
          <span class="rounded-full bg-success/15 px-2 py-0.5 font-mono text-xs text-success">Complete</span>
        </div>
        <ul class="mt-4 grid gap-2 sm:grid-cols-2">
          {m1.map((i) => <li class="rounded-md border border-border bg-card px-4 py-2 text-sm">✓ {i}</li>)}
        </ul>
      </section>
      <section>
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-semibold">M2 — Advanced Infrastructure</h2>
          <span class="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">Planned</span>
        </div>
        <ul class="mt-4 grid gap-2 sm:grid-cols-2">
          {m2.map((i) => <li class="rounded-md border border-border bg-card px-4 py-2 text-sm text-muted-foreground">○ {i}</li>)}
        </ul>
      </section>
    </div>
    <p class="mt-12 text-sm text-muted-foreground">Full phase-by-phase detail lives in the <a href="https://github.com/mkappworks-dev/cloudzilla-app/blob/main/docs/ROADMAP.md" class="text-foreground underline">ROADMAP on GitHub</a>.</p>
  </main>
  <Footer />
</LandingLayout>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: succeeds; `/roadmap/index.html` emitted in `dist/`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add roadmap page"
```

---

## Task 13: Changelog page

**Files:**
- Create: `src/pages/changelog.astro`
- Create: `src/content/changelog.md`

- [ ] **Step 1: Seed `src/content/changelog.md`** from the app's CHANGELOG

```bash
cp ../cloudzilla-app/CHANGELOG.md src/content/changelog.md
```

- [ ] **Step 2: Create `src/pages/changelog.astro`** (renders the markdown body)

```astro
---
import LandingLayout from '../layouts/LandingLayout.astro';
import Nav from '../components/landing/Nav.astro';
import Footer from '../components/landing/Footer.astro';
import { marked } from 'marked';
import fs from 'node:fs';

const raw = fs.readFileSync(new URL('../content/changelog.md', import.meta.url), 'utf-8');
const html = marked.parse(raw);
---
<LandingLayout title="Changelog">
  <Nav />
  <main id="main" class="container py-20">
    <h1 class="text-4xl font-bold tracking-tight">Changelog</h1>
    <article class="prose prose-invert mt-8 max-w-3xl" set:html={html}></article>
  </main>
  <Footer />
</LandingLayout>
```

- [ ] **Step 3: Install marked and the typography plugin**

```bash
npm install marked
npm install -D @tailwindcss/typography
```

Then add the plugin to `tailwind.config.mjs`: change `plugins: []` to `plugins: [require('@tailwindcss/typography')]` and add `import typography from '@tailwindcss/typography';` at the top, using `plugins: [typography]` (ESM form, since the config is `.mjs`).

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds; `/changelog/index.html` emitted, prose styles applied.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add changelog page"
```

---

## Task 14: Final verification pass

**Files:** none (verification + fixes only)

- [ ] **Step 1: Clean build with no warnings**

Run: `rm -rf dist && npm run build`
Expected: completes; **zero** broken-link warnings. If any appear, fix the offending `href`/slug and rebuild.

- [ ] **Step 2: Link + route audit**

Run: `npm run preview &` (serves `dist/` on :4321), then:

```bash
for p in / /roadmap /changelog /docs/getting-started/introduction /docs/getting-started/installation; do
  echo -n "$p -> "; curl -s -o /dev/null -w "%{http_code}\n" "localhost:4321$p"
done
kill %1
```

Expected: every route returns `200`.

- [ ] **Step 3: Headless visual + interaction check**

With the Playwright MCP (preferred) or `npx playwright`, load `localhost:4321/`, confirm:
- Hero headline renders on a black background with the grid backdrop.
- The Docker pull command copy button changes ⧉ → ✓ on click.
- The InstallTabs panels switch between Docker and Local dev.
- The three screenshots load.
Capture `localhost:4321/` and `localhost:4321/docs/getting-started/introduction` to confirm the Starlight theme matches (dark, Geist).

If InstallTabs does not switch via the CSS arbitrary variant, replace its toggle with a component-local `<script>` (see Task 9 Step 3 note), rebuild, recheck.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "test: verify build, routes, and interactions"
```

---

## Self-Review Notes

- **Spec coverage:** Landing sections (Tasks 5–10), curated docs (Task 11), roadmap (Task 12), changelog (Task 13), tokens/fonts/aesthetic (Tasks 1–2), assets/screenshots (Task 3), outbound links via `consts.ts` surfaced in Nav/Hero/InstallTabs/CTA/Footer (Tasks 4, 7–10), host-agnostic static build (Task 1), verification incl. Lighthouse-grade static output + interaction checks (Task 14). All spec sections map to a task.
- **Known risk:** the JS-free InstallTabs uses a Tailwind arbitrary variant; Task 9 and Task 14 both carry an explicit script fallback so the task can still complete.
- **Type consistency:** `consts.ts` exports (`SITE`, `LINKS`, `DOCKER_PULL`, `STACK`, `FEATURES`) are referenced with the same names/shapes in every consuming component.
```
