# Landing Page SEO + Lighthouse Health Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add complete on-page/technical SEO to the Cloudzilla marketing site and fix the Performance, Accessibility, and Content Lighthouse findings, on branch `seo/landing-page`.

**Architecture:** Static Astro build (`output: 'static'`, `site: 'https://cloudzilla.dev'`). Every page renders through `src/layouts/LandingLayout.astro`, which owns the `<head>` — SEO tags are centralized there, props-driven. Other fixes touch specific components (`headings`), tokens (`landing.css`), and one script (`herodots.ts`). No new runtime dependencies.

**Tech Stack:** Astro 4, Tailwind, `@astrojs/sitemap`, `@fontsource-variable/geist`. Package manager: **bun**. There is no unit-test framework; verification is `bun run build` + assertions against the built `dist/` output.

**Spec:** `docs/superpowers/specs/2026-06-02-landing-page-seo-design.md`

---

## File Structure

- `src/layouts/LandingLayout.astro` — **modify**: enrich `<head>` (canonical, OG/Twitter, theme-color, font preload); add `image` + `noindex` props.
- `src/consts.ts` — **modify**: add `ogImage` constant.
- `src/pages/index.astro` — **modify**: explicit description + JSON-LD.
- `src/pages/{403,404,500,loading,maintenance}.astro` — **modify**: pass `noindex`.
- `public/robots.txt` — **create**.
- `public/og.png` — **create** (1200×630 branded card).
- `astro.config.mjs` — **modify**: sitemap `filter`.
- `src/components/landing/{FeatureGrid,Architecture,Quickstart,Footer}.astro` — **modify**: heading levels.
- `src/styles/landing.css` — **modify**: heading-selector follow-ups + `--cz-faint` contrast.
- `src/scripts/herodots.ts` — **modify**: defer start, pause off-screen, drop per-frame blur.
- `src/components/landing/Screenshots.astro` — **modify**: `loading="lazy"` + corrected dimensions.
- `public/screenshots/*.png` — **modify**: re-export at display size.

Tasks are ordered low-risk → higher-risk (canvas rework last). Each task is one atomic commit.

---

## Task 1: SEO `<head>` enrichment in LandingLayout

**Files:**
- Modify: `src/consts.ts`
- Modify: `src/layouts/LandingLayout.astro`

- [ ] **Step 1: Add OG image constant to consts**

In `src/consts.ts`, add to the `SITE` object (after `version`):

```ts
export const SITE = {
  name: 'Cloudzilla',
  tagline: 'A minimal, self-hosted Git forge',
  description: 'Single binary. No external runtime dependencies. Git hosting, pull requests, code review, issues, and more.',
  version: 'v0.3.0',
  ogImage: '/og.png',
};
```

- [ ] **Step 2: Replace the LandingLayout frontmatter + `<head>`**

Replace the frontmatter block and the `<head>` element in `src/layouts/LandingLayout.astro` with:

```astro
---
import '../styles/global.css';
import '../styles/landing.css';
import geistSans from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import geistMono from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url';
import { SITE } from '../consts';

interface Props { title?: string; description?: string; image?: string; noindex?: boolean; }
const { title = SITE.name, description = SITE.description, image = SITE.ogImage, noindex = false } = Astro.props;
const fullTitle = title === SITE.name ? `${SITE.name} — ${SITE.tagline}` : `${title} · ${SITE.name}`;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImageURL = new URL(image, Astro.site);
---
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={canonical} />
    {noindex && <meta name="robots" content="noindex,follow" />}

    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <meta name="theme-color" content="#000000" />

    <link rel="preload" href={geistSans} as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href={geistMono} as="font" type="font/woff2" crossorigin="anonymous" />

    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical} />
    <meta property="og:site_name" content={SITE.name} />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content={ogImageURL} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={`${SITE.name} — ${SITE.tagline}`} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageURL} />
  </head>
```

Leave the `<body>` and the rest of the file unchanged.

- [ ] **Step 3: Build and verify the tags render**

Run: `bun run build`
Expected: build completes, no errors.

Run: `grep -oE 'rel="canonical"|og:url|og:image"|twitter:image|theme-color|rel="preload"' dist/index.html | sort -u`
Expected: all six strings present. (Note: `Astro.site` makes canonical/OG URLs absolute, e.g. `https://cloudzilla.dev/`.)

- [ ] **Step 4: Verify the font preload resolves to a real built asset**

Run: `grep -oE 'href="[^"]*\.woff2"' dist/index.html | head`
Expected: two `preload` hrefs pointing at hashed `/_astro/*.woff2` files that exist in `dist/_astro/`.

- [ ] **Step 5: Commit**

```bash
git add src/consts.ts src/layouts/LandingLayout.astro
git commit -m "feat(seo): enrich head with canonical, OG/Twitter, theme-color, font preload"
```

---

## Task 2: Homepage description + JSON-LD structured data

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Add an explicit description and JSON-LD to the homepage**

In `src/pages/index.astro`, replace the frontmatter closing and the `<LandingLayout>` opening tag. Add to the frontmatter (after the existing imports):

```astro
import { SITE, LINKS } from '../consts';

const description =
  'Cloudzilla is a minimal, self-hosted Git forge — a single binary with no external runtime dependencies. Self-host Git hosting, pull requests, code review, and issues as an open-source GitHub alternative.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: SITE.name,
      description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Linux, Docker',
      url: 'https://cloudzilla.dev/',
      sameAs: [LINKS.github],
      license: 'https://opensource.org/licenses/MIT',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebSite',
      name: SITE.name,
      url: 'https://cloudzilla.dev/',
      sameAs: [LINKS.github],
    },
  ],
};
```

Change the layout open tag from `<LandingLayout>` to:

```astro
<LandingLayout description={description}>
```

And immediately inside the layout (as the first child, before `<Nav />`), add:

```astro
  <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} is:inline />
```

- [ ] **Step 2: Build and verify**

Run: `bun run build`
Expected: build succeeds.

Run: `grep -c 'application/ld+json' dist/index.html` → Expected: `1`
Run: `node -e "const m=require('fs').readFileSync('dist/index.html','utf8').match(/ld\+json[^>]*>(.*?)<\/script>/s); JSON.parse(m[1]); console.log('valid JSON-LD')"`
Expected: prints `valid JSON-LD` (parses without throwing).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(seo): add homepage description and JSON-LD structured data"
```

---

## Task 3: robots.txt

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Disallow: /403
Disallow: /500
Disallow: /loading
Disallow: /maintenance

Sitemap: https://cloudzilla.dev/sitemap-index.xml
```

- [ ] **Step 2: Build and verify it ships verbatim**

Run: `bun run build && cat dist/robots.txt`
Expected: identical content, including the `Sitemap:` line.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat(seo): add robots.txt pointing to sitemap"
```

---

## Task 4: noindex on status pages + sitemap filter

**Files:**
- Modify: `src/pages/403.astro`, `src/pages/404.astro`, `src/pages/500.astro`, `src/pages/loading.astro`, `src/pages/maintenance.astro`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add `noindex` to each status page's layout tag**

In each of the five files, add `noindex` to the `<LandingLayout ...>` opening tag. Examples (match each file's existing attributes, just append `noindex`):

- `404.astro`: `<LandingLayout title="Page not found" description="The page you were looking for doesn't resolve." noindex>`
- `500.astro`: `<LandingLayout title="Server error" description="The server hit an unexpected error." noindex>`
- `403.astro`, `loading.astro`, `maintenance.astro`: likewise append `noindex` to their existing `<LandingLayout ...>` tags.

- [ ] **Step 2: Add the sitemap filter**

Replace `sitemap(),` in `astro.config.mjs` with:

```js
    sitemap({
      filter: (page) =>
        !['/403', '/500', '/loading', '/maintenance'].some((p) =>
          page === `https://cloudzilla.dev${p}/` || page === `https://cloudzilla.dev${p}`,
        ),
    }),
```

- [ ] **Step 3: Build and verify**

Run: `bun run build`
Expected: build succeeds.

Run: `grep -l 'noindex' dist/404.html dist/500.html dist/403/index.html dist/loading/index.html dist/maintenance/index.html 2>/dev/null; grep -c 'noindex' dist/404.html`
Expected: `noindex` present in each status page (path may be `dist/500.html` or `dist/500/index.html` depending on build — confirm the actual emitted path).

Run: `grep -oE '/(403|500|loading|maintenance)' dist/sitemap-0.xml | sort -u`
Expected: **no output** (status routes excluded from sitemap).

- [ ] **Step 4: Commit**

```bash
git add src/pages/403.astro src/pages/404.astro src/pages/500.astro src/pages/loading.astro src/pages/maintenance.astro astro.config.mjs
git commit -m "feat(seo): noindex status pages and exclude them from sitemap"
```

---

## Task 5: Generate the OG social image (public/og.png)

**Files:**
- Create: `/tmp/og-card.html` (scratch, not committed)
- Create: `public/og.png`

This uses the Playwright browser MCP tools (`browser_navigate`, `browser_resize`, `browser_take_screenshot`). No site dependency is added.

- [ ] **Step 1: Write the 1200×630 card HTML to `/tmp/og-card.html`**

A self-contained dark card matching the brand. Body is exactly 1200×630, dark background `#000`, the layered-circles logo + wordmark, the tagline, and the manifesto line, in Geist (fallback to system sans if Geist isn't installed in the headless browser):

```html
<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  body { background:#000; color:#ededed; font-family:'Geist',system-ui,-apple-system,sans-serif;
         display:flex; flex-direction:column; justify-content:center; padding:96px;
         background-image:radial-gradient(ellipse at 30% 0%, rgba(74,222,128,.10), transparent 60%); }
  .brand { display:flex; align-items:center; gap:20px; margin-bottom:40px; }
  .brand svg { width:64px; height:64px; color:#ffffff; }
  .brand span { font-size:40px; font-weight:600; letter-spacing:-.02em; }
  h1 { font-size:76px; font-weight:600; line-height:1.05; letter-spacing:-.03em; max-width:900px; }
  p { margin-top:32px; font-size:30px; color:#8f8f8f; font-family:'Geist Mono',ui-monospace,monospace; }
  b { color:#4ade80; font-weight:500; }
</style></head><body>
  <div class="brand">
    <svg viewBox="11 9 44 44" fill="currentColor"><circle cx="22" cy="36" r="9"/><circle cx="32" cy="28" r="11"/><circle cx="44" cy="36" r="9"/><rect x="22" y="36" width="22" height="9" rx="4.5"/></svg>
    <span>cloudzilla</span>
  </div>
  <h1>A minimal, self-hosted Git forge.</h1>
  <p><b>Single binary.</b> No external runtime dependencies.</p>
</body></html>
```

- [ ] **Step 2: Render and screenshot at 1200×630**

Using the Playwright MCP tools:
1. `browser_resize` → width 1200, height 630.
2. `browser_navigate` → `file:///tmp/og-card.html`.
3. `browser_take_screenshot` → save the raw PNG, then move/copy it to `public/og.png`.

If saving directly to `public/og.png` isn't possible, save to a temp path and `cp` it into `public/og.png`.

- [ ] **Step 3: Verify dimensions**

Run: `node -e "const b=require('fs').readFileSync('public/og.png'); console.log('w',b.readUInt32BE(16),'h',b.readUInt32BE(20))"`
Expected: `w 1200 h 630`.

Run: `bun run build && ls -la dist/og.png`
Expected: `dist/og.png` exists (copied from `public/`).

- [ ] **Step 4: Commit**

```bash
git add public/og.png
git commit -m "feat(seo): add 1200x630 branded OG social image"
```

---

## Task 6: Fix heading hierarchy (Accessibility: heading order)

**Files:**
- Modify: `src/components/landing/FeatureGrid.astro` (`h4`→`h3`, 9 occurrences)
- Modify: `src/components/landing/Architecture.astro` (`h4`→`h3`, 3 occurrences)
- Modify: `src/components/landing/Quickstart.astro` (`h4`→`h3`, 6 occurrences)
- Modify: `src/components/landing/Footer.astro` (`h5`→`h3`, 3 occurrences)
- Modify: `src/styles/landing.css` (update any tag-keyed selectors)

- [ ] **Step 1: Check which selectors are tag-keyed before editing**

Run: `grep -nE '\b(h4|h5)\b' src/styles/landing.css`
Note any selector like `.footer-col h5 { ... }` or `.feature h4 { ... }` — these must be updated in lockstep so visuals don't change. Class-only selectors (e.g. `.feat-title`) need no CSS edit.

- [ ] **Step 2: Demote the headings (semantic only)**

In each component, change the heading tags. Preserve all classes and attributes — only the tag name changes:
- `FeatureGrid.astro`: every card `<h4 ...>…</h4>` → `<h3 ...>…</h3>`.
- `Architecture.astro`: every `<h4 ...>` → `<h3 ...>`.
- `Quickstart.astro`: every `<h4 ...>` → `<h3 ...>`.
- `Footer.astro`: the three column `<h5>…</h5>` → `<h3>…</h3>`.

- [ ] **Step 3: Update CSS selectors found in Step 1**

For each tag-keyed selector noted in Step 1, change `h4`→`h3` / `h5`→`h3` in the selector so the same elements keep their styling. (If Step 1 found none, skip.)

- [ ] **Step 4: Build and verify order is sequential**

Run: `bun run build`
Expected: build succeeds.

Run: `grep -oE '<h[1-6]' dist/index.html | sort | uniq -c`
Expected: only `h1`, `h2`, `h3` appear — **no `h4` or `h5`** on the homepage.

Manually confirm the footer columns and feature cards look visually unchanged (open `bun run preview`).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/FeatureGrid.astro src/components/landing/Architecture.astro src/components/landing/Quickstart.astro src/components/landing/Footer.astro src/styles/landing.css
git commit -m "fix(a11y): correct heading hierarchy to sequential h1-h3"
```

---

## Task 7: Fix color contrast (Accessibility: WCAG AA)

**Files:**
- Modify: `src/styles/landing.css:18`

- [ ] **Step 1: Raise the faint token**

In `src/styles/landing.css`, change:

```css
  --cz-faint: 0 0% 46%;
```

to:

```css
  --cz-faint: 0 0% 58%;
```

`#000` background → `0 0% 58%` (≈ `#949494`) yields ≈6.8:1, clearing the 4.5:1 AA threshold for `.pill.gray` (the flagged `span.pill.gray`) and the status-page dim text, with margin to spare even on the slightly-lighter `--cz-card` (`4%`) backgrounds.

- [ ] **Step 2: Build and visually confirm the `div.cz` finding is cleared**

Run: `bun run build && bun run preview`
The Lighthouse `div.cz` failure is the container of the low-contrast `.pill.gray`; raising `--cz-faint` resolves it. Open the page and confirm the "Future" pill and any faint labels are now legibly brighter without looking out of place. If a *distinct* low-contrast text node remains after this change, identify its color token in `landing.css` and lift it to ≥4.5:1 as well.

- [ ] **Step 3: Commit**

```bash
git add src/styles/landing.css
git commit -m "fix(a11y): raise --cz-faint to meet WCAG AA contrast (4.5:1)"
```

---

## Task 8: Hero canvas performance (LCP / Speed Index)

**Files:**
- Modify: `src/scripts/herodots.ts`

The current `init()` starts immediately on `DOMContentLoaded`, runs an unbounded rAF loop, and calls `ctx.filter = 'blur(24px)'` every frame. Three changes: defer start, pause off-screen, and precompute the blur once.

- [ ] **Step 1: Defer the start off the critical path**

Replace the bottom-of-file bootstrap:

```ts
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

with a load+idle deferred start:

```ts
function start() {
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => void)
    | undefined;
  if (ric) ric(init, { timeout: 1000 });
  else setTimeout(init, 200);
}

if (document.readyState === 'complete') start();
else window.addEventListener('load', start, { once: true });
```

- [ ] **Step 2: Precompute the soft "clear" ellipse once instead of per-frame blur**

In `herodots.ts`, replace the per-frame `drawClearing()` (which sets `ctx.filter = 'blur(24px)'` every call) so the blurred ellipse is rendered once into an offscreen canvas and then composited with `destination-out` each frame. Add an offscreen builder and rewrite `drawClearing`:

```ts
  let clearCanvas: HTMLCanvasElement | null = null;
  function buildClearCanvas() {
    if (!clearShape) { clearCanvas = null; return; }
    const s = clearShape;
    const c = document.createElement('canvas');
    c.width = W * dpr;
    c.height = H * dpr;
    const cx = c.getContext('2d');
    if (!cx) { clearCanvas = null; return; }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.filter = 'blur(24px)';      // applied ONCE, not per frame
    cx.fillStyle = '#000';
    cx.beginPath();
    cx.ellipse(s.cx, s.cy, s.rx, s.ry, 0, 0, Math.PI * 2);
    cx.fill();
    clearCanvas = c;
  }

  function drawClearing() {
    if (!clearCanvas) return;
    ctx!.save();
    ctx!.globalCompositeOperation = 'destination-out';
    ctx!.drawImage(clearCanvas, 0, 0, W, H);
    ctx!.restore();
  }
```

Call `buildClearCanvas()` wherever `computeClearShape()` is called (after each `computeClearShape()` in `init`, in the `resize`/`load`/`setTimeout` handlers, since the shape depends on layout). Concretely, after each existing `computeClearShape()` invocation add a `buildClearCanvas()` call, e.g.:

```ts
  computeClearShape(); buildClearCanvas();
  window.addEventListener('resize', () => { computeClearShape(); buildClearCanvas(); });
  window.addEventListener('load', () => { computeClearShape(); buildClearCanvas(); });
  setTimeout(() => { computeClearShape(); buildClearCanvas(); }, 600);
```

(Replace the existing `computeClearShape()` / listener lines accordingly. Also call `buildClearCanvas()` at the end of `resize()` since the canvas size changed.)

- [ ] **Step 3: Pause the rAF loop when the hero is off-screen**

Replace the frame loop:

```ts
  function frame(now: number) {
    requestAnimationFrame(frame);
    ctx!.clearRect(0, 0, W, H);
    drawDots(now);
    drawClearing();
  }
  requestAnimationFrame(frame);
```

with a visibility-gated loop:

```ts
  let visible = true;
  let raf = 0;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }, { threshold: 0 }).observe(hero!);
  }
  function frame(now: number) {
    if (!visible) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
    ctx!.clearRect(0, 0, W, H);
    drawDots(now);
    drawClearing();
  }
  raf = requestAnimationFrame(frame);
```

- [ ] **Step 4: Build and verify no per-frame blur remains**

Run: `bun run build`
Expected: build succeeds (TypeScript compiles).

Run: `grep -n "ctx!.filter = 'blur" src/scripts/herodots.ts`
Expected: **no output** (the only `filter='blur'` now lives on the offscreen `cx`, built once).

Run: `bun run preview`, open the homepage, move the cursor over the hero — dots should still brighten/repel and the text area stays clear. Scroll away and back — animation pauses and resumes.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/herodots.ts
git commit -m "perf: defer hero canvas, pause off-screen, drop per-frame blur"
```

---

## Task 9: Image delivery (Performance, ~32 KiB)

**Files:**
- Modify: `src/components/landing/Screenshots.astro`
- Modify: `public/screenshots/*.png` (re-export smaller)

The carousel `<img>` tags already declare `width="1440" height="900"`, but the PNGs are served larger than their ~1230×769 display size and all eight load eagerly even though the section is below the fold.

- [ ] **Step 1: Lazy-load and async-decode the carousel images**

In `src/components/landing/Screenshots.astro`, in the `{SHOTS.map((s, i) => (` `<img ... />` block (around line 25), add `loading="lazy"` and `decoding="async"` attributes to the `<img>`. Keep the existing `class`, `src`, `alt`, `data-*`, `width`, `height`. (The carousel cross-fades with `opacity`; lazy-loading the eight below-the-fold frames defers their bytes off the initial load.)

- [ ] **Step 2: Re-export the screenshots at display size**

Re-export each `public/screenshots/*.png` (`home, repo, pr, diff, issue, board, discussions, releases`) at **1232×770** (matches the ~1230×769 display box, rounded up). Use whatever image tool is available, e.g. with `sips` (macOS, no install):

```bash
cd /Users/mk/Downloads/app/Cloudzilla/cloudzilla-site
for f in public/screenshots/*.png; do sips -z 770 1232 "$f" >/dev/null; done
```

Then update the `<img>` dimensions in `Screenshots.astro` to match the new intrinsic size: `width="1232" height="770"`.

- [ ] **Step 3: Verify the size reduction**

Run: `node -e "const b=require('fs').readFileSync('public/screenshots/home.png'); console.log('w',b.readUInt32BE(16),'h',b.readUInt32BE(20))"`
Expected: `w 1232 h 770`.

Run: `bun run build`
Expected: build succeeds; `dist/screenshots/home.png` is smaller than before (was ~117 KiB; expect a reduction).

Run: `grep -o 'loading="lazy"' dist/index.html | head -1`
Expected: `loading="lazy"` present.

- [ ] **Step 4: Commit**

```bash
git add src/components/landing/Screenshots.astro public/screenshots
git commit -m "perf: lazy-load and right-size carousel screenshots"
```

---

## Task 10: Full-site verification pass

**Files:** none (verification only)

- [ ] **Step 1: Clean build**

Run: `rm -rf dist && bun run build`
Expected: completes with no errors or broken-link warnings.

- [ ] **Step 2: Assert the SEO surface on the built homepage**

Run:

```bash
for s in 'rel="canonical"' 'og:image' 'og:url' 'twitter:image' 'application/ld+json' 'rel="preload"' 'theme-color'; do
  printf '%-22s ' "$s"; grep -c "$s" dist/index.html;
done
```

Expected: every line ends in a count ≥ 1.

- [ ] **Step 3: Assert crawl/index controls**

Run: `cat dist/robots.txt | grep Sitemap`
Expected: the `Sitemap:` line.

Run: `grep -oE '<h[1-6]' dist/index.html | sort -u`
Expected: `<h1 <h2 <h3` only.

Run: `grep -c noindex dist/404.html`
Expected: ≥ 1.

- [ ] **Step 4: Manual Lighthouse re-run (human)**

Re-run Lighthouse on a local `bun run preview` (or the deployed branch). Confirm: LCP / Speed Index improved, no contrast or heading-order failures, SEO category clean. Note the new scores in the PR description.

- [ ] **Step 5: Confirm working tree is clean and branch is ready**

Run: `git status` → Expected: clean. `git log --oneline main..seo/landing-page` → Expected: the ~9 feature commits above plus the two spec commits.

---

## Deferred (not in this plan)

- **Workstream F** ("Learn more" → `docs.astro.build/reference/cli-reference`): the link is absent from source and `dist/`. Do **not** implement a fix until the audited URL is confirmed; if a real generic-text link surfaces, give it descriptive text (and `rel="noopener"` if external) as a follow-up commit.

## Self-Review Notes

- **Spec coverage:** A (Tasks 1–5), B (Task 6), C (Task 7), D (Task 8), E (Task 9), F (explicitly deferred), OG image (Task 5), verification (Task 10). All spec sections mapped.
- **Type/name consistency:** `image`/`noindex` props (Task 1) reused in Task 4; `SITE.ogImage` defined Task 1, consumed Task 1; `buildClearCanvas`/`clearCanvas`/`drawClearing` consistent within Task 8.
- **No placeholders:** every code step shows full content; verification commands have expected output.
