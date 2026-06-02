# Landing Page SEO + Lighthouse Health — Design

**Date:** 2026-06-02
**Branch:** `seo/landing-page` (off `main`)
**Scope:** Comprehensive SEO, plus the Performance / Accessibility / Content
Lighthouse findings surfaced for the Cloudzilla marketing site.

## Goal

Raise the Cloudzilla landing site's search discoverability, social/chat preview
correctness, and Lighthouse scores (Performance, Accessibility, SEO). The site
is a static Astro build (`output: 'static'`, `site: 'https://cloudzilla.dev'`);
all pages render through one layout, `src/layouts/LandingLayout.astro`, which
owns the `<head>`. SEO `<head>` work is centralized there; the other workstreams
touch specific components, styles, and scripts.

## Workstreams

| # | Area | Lighthouse signal |
|---|------|-------------------|
| A | On-page / technical SEO | SEO category, social previews |
| B | Heading hierarchy | Accessibility: heading order |
| C | Color contrast | Accessibility: contrast |
| D | LCP / Speed Index | Performance: LCP render delay, Speed Index |
| E | Image delivery | Performance: image sizing |
| F | Descriptive link text | Content best practices — **flagged, see below** |

---

## A. On-page / technical SEO

### Baseline

`LandingLayout.astro` `<head>` has: dynamic `<title>`, `description`, `og:title`,
`og:description`, `og:type`, `twitter:card=summary_large_image`, favicon,
viewport, `lang="en"`. `@astrojs/sitemap` generates `sitemap-index.xml`.

### Gaps → changes

- **No canonical** → compute `new URL(Astro.url.pathname, Astro.site)` and emit
  `<link rel="canonical">` + `og:url`.
- **`twitter:card=summary_large_image` but no `og:image`** (blank social card) →
  add `og:image` (+ width 1200 / height 630 / alt), `twitter:image`.
- Add `og:site_name=Cloudzilla`, `og:locale=en_US`, `twitter:title`,
  `twitter:description`, `theme-color` (dark bg `#000`).
- **Approach:** centralize in `LandingLayout.astro` (props-driven). Rejected:
  a `<Seo>` component (one layout already owns the head) and `astro-seo`
  (new dependency, less control).
- New layout props: `image?: string` (defaults to `/og.png`), `noindex?: boolean`
  (emits `<meta name="robots" content="noindex,follow">`). All image/URL values
  resolved absolute via `new URL(value, Astro.site)`.

### Per-page metadata

- `index.astro` — explicit keyword-tuned `description` ("self-hosted Git forge",
  "single binary Git hosting", "open-source GitHub alternative").
- `docs.astro`, `changelog.astro` — meaningful `title` + `description`.
- `403/404/500/loading/maintenance` — `noindex`.

### `public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /403
Disallow: /500
Disallow: /loading
Disallow: /maintenance

Sitemap: https://cloudzilla.dev/sitemap-index.xml
```

### JSON-LD (homepage only)

Inline `<script type="application/ld+json">` with a `@graph`:
`SoftwareApplication` (name, description, `applicationCategory:
DeveloperApplication`, `operatingSystem: "Linux, Docker"`, `offers` price 0 USD,
license → the product's BSL 1.1 LICENSE in its repo, url, `sameAs` GitHub) +
`WebSite`/`Organization` (name, url, logo, `sameAs`). Sourced from
`src/consts.ts` (`SITE`, `LINKS`).

### Sitemap

Add a `filter` to the `sitemap()` integration excluding `/403`, `/500`,
`/loading`, `/maintenance`.

---

## B. Heading hierarchy (Accessibility: heading order)

Section titles are `h2`, but card titles jump to `h4` (skip `h3`) and the footer
uses `h5`. `RoadmapPreview` already uses `h3` correctly — the others should match.

| File | Current | Change |
|------|---------|--------|
| `components/landing/FeatureGrid.astro` | `h4` ×9 | → `h3` |
| `components/landing/Architecture.astro` | `h4` ×3 | → `h3` |
| `components/landing/Quickstart.astro` | `h4` ×6 | → `h3` |
| `components/landing/Footer.astro` | `h5` ×3 | → `h3` |

**Constraint:** verify the CSS targets these by **class**, not tag. Where a
selector keys off the tag (e.g. `.footer-col h5`), update the selector so visual
styling is unchanged — this is a semantic-only change, not a visual one.

---

## C. Color contrast (Accessibility, WCAG AA 4.5:1)

`--cz-faint: 0 0% 46%` (`landing.css:18`) ≈ 4.0:1 on `#000` — fails AA for normal
text. It drives `.pill.gray` (the flagged `span.pill.gray`) and status-page dim
text.

- Raise `--cz-faint` to ≥ `0 0% 55%` (≈ 4.6:1) — fixes `.pill.gray` and status
  text in one token change.
- Investigate the `div.cz` failure: identify the specific low-contrast text node
  (likely another `--cz-faint`/small muted usage) and lift it to ≥4.5:1.
- Re-check that raised tokens don't regress the intended visual hierarchy.

---

## D. LCP / Speed Index (Performance)

LCP element is `h1.hero-h1` with ~7,820 ms **render delay** despite a 127 ms
critical path. Fonts are ruled out (`@fontsource-variable/geist` ships
`font-display: swap`). Cause: main-thread contention from `herodots.ts`, which
runs an unbounded `requestAnimationFrame` loop that redraws the full dot grid and
applies `ctx.filter = 'blur(24px)'` **every frame** (per-frame canvas blur is a
known paint killer).

Changes to `src/scripts/herodots.ts`:

- **Defer start** off the critical path: begin after `window.load` and/or
  `requestIdleCallback`, so first paint/LCP isn't starved.
- **Pause when off-screen:** wrap the rAF loop in an `IntersectionObserver` on
  `.hero`; stop drawing when the hero isn't visible (saves battery/CPU too).
- **Remove the per-frame blur:** precompute the soft "clear" ellipse once into an
  offscreen canvas (or use a cached radial-gradient mask) instead of
  `ctx.filter='blur(24px)'` on every frame.
- Already correctly skips entirely under `prefers-reduced-motion` — keep that.

Font fast-path (`LandingLayout.astro`):

- Preload the two Geist variable woff2 (`<link rel="preload" as="font"
  type="font/woff2" crossorigin>`) to remove the CSS-discovered font request from
  the chain. Confirm the hashed filenames at build and reference the built paths.

---

## E. Image delivery (Performance, ~32 KiB)

`public/screenshots/home.png` is 1440×900 but displayed at ~1230×769, and the
`<img>` tags in `Screenshots.astro` lack intrinsic dimensions.

- Add explicit `width`/`height` to the carousel `<img>` elements (prevents
  layout shift, lets the browser reserve space).
- Resize the screenshot source assets to their displayed dimensions (or provide a
  `srcset`/responsive variant). Prefer Astro's `<Image>`/`astro:assets` if the
  carousel can keep its absolute-positioned cross-fade; otherwise resize the
  source PNGs in `public/screenshots/` and keep the existing `<img>` markup.
- Re-export at the smaller size to capture the ~32 KiB saving without visible
  quality loss at display size.

---

## F. Descriptive link text — FLAGGED, not actionable as-is

Lighthouse reported a non-descriptive "Learn more" link →
`docs.astro.build/reference/cli-reference`. **This link does not exist anywhere
in the source or built `dist/`** (the only `astro.build` reference is README
prose; the site never links to Astro's docs). It likely came from a different
audited page or a stale/cached deploy. **Action:** confirm the audited URL before
adding any fix; do not fabricate a change for a link absent from the code. If a
real generic-text link is later identified, give it descriptive text and (if
external) `rel="noopener"`.

---

## OG social image — `public/og.png` (1200×630)

A branded dark card: Cloudzilla layered-circles logo + wordmark + tagline
("A minimal, self-hosted Git forge") + the `single binary · no dependencies`
line, using the site's color tokens and Geist fonts. Authored as a standalone
1200×630 HTML document, rendered and screenshotted via the Playwright browser
tool, saved to `public/og.png`. No new site dependency; a real raster PNG.

## Data flow (SEO head)

```
src/consts.ts (SITE, LINKS)
      ├─► LandingLayout.astro ──► <head> meta + canonical + OG/Twitter + preloads
      │                            (image/noindex via props)
      ├─► index.astro ──► JSON-LD + explicit description
Astro.site + Astro.url.pathname ──► canonical / og:url / absolute image URLs
```

## Testing / verification

1. `bun run build` completes without errors or broken-link warnings.
2. `dist/index.html` contains `rel="canonical"`, `og:image`, `og:url`,
   `twitter:image`, font `rel="preload"`, and a parseable `application/ld+json`.
3. `dist/robots.txt` exists with the `Sitemap:` line; `dist/sitemap-0.xml`
   excludes status routes; `dist/500.html` contains `noindex`.
4. Heading order on the homepage is sequential (`h1 → h2 → h3`, no skips); footer
   styling visually unchanged.
5. `--cz-faint`-driven text (incl. `.pill.gray`) measures ≥4.5:1 on `#000`.
6. `herodots` starts after load, pauses off-screen, and no `ctx.filter` runs per
   frame; hero still animates on pointer move.
7. `public/og.png` is 1200×630; screenshot assets re-exported smaller with
   `width`/`height` on the `<img>`.
8. Re-run Lighthouse: Performance LCP/Speed-Index improved, no contrast or
   heading-order failures, SEO category clean.

## Out of scope

- Copywriting beyond the homepage meta description.
- Analytics, i18n/hreflang, per-release OG automation.
- Workstream F until the audited URL is confirmed.
```
