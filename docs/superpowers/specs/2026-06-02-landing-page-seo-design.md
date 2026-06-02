# Landing Page SEO Optimization — Design

**Date:** 2026-06-02
**Branch:** `seo/landing-page` (off `main`)
**Scope:** Comprehensive on-page/technical SEO for the Cloudzilla marketing site.

## Goal

Make the Cloudzilla landing site fully discoverable and correctly previewed by
search engines and social/chat unfurlers. The site is a static Astro build
(`output: 'static'`, `site: 'https://cloudzilla.dev'`). All pages render through
a single layout, `src/layouts/LandingLayout.astro`, which already owns the
`<head>`. This work centralizes SEO there rather than introducing a new
abstraction or third-party integration.

## Current state (baseline)

`LandingLayout.astro` `<head>` today contains:

- `<title>` (dynamic), `<meta name="description">`
- `og:title`, `og:description`, `og:type`
- `twitter:card` = `summary_large_image`
- favicon, `viewport`, `lang="en"`, charset

`@astrojs/sitemap` is configured and generates `sitemap-index.xml` +
`sitemap-0.xml` at build.

### Gaps

1. **No canonical URL** — risks duplicate-content ambiguity.
2. **`twitter:card` = `summary_large_image` but no `og:image`** — social/chat
   shares render a blank card.
3. No `og:url`, `og:site_name`, `og:locale`.
4. No `twitter:title` / `twitter:description` / `twitter:image`.
5. No `robots.txt`.
6. No structured data (JSON-LD).
7. Status/utility pages (403, 404, 500, loading, maintenance) are indexable.
8. Homepage relies on the default description rather than an explicit,
   search-intent-tuned one.
9. No `theme-color`.

## Approach

**Centralize SEO in `LandingLayout.astro`, props-driven.** Considered and
rejected: a dedicated `<Seo>` component (extra indirection when one layout
already owns the head) and an `astro-seo` integration (new dependency, less
control). The chosen approach fits the existing architecture and adds no
runtime dependency.

## Components

### 1. `LandingLayout.astro` head enrichment (shared, all pages)

New optional props on the layout:

- `image?: string` — OG/Twitter image path; defaults to the site OG card (`/og.png`).
- `noindex?: boolean` — when true, emit `<meta name="robots" content="noindex,follow">`.

Computed in frontmatter:

- `canonical = new URL(Astro.url.pathname, Astro.site)` →
  `<link rel="canonical" href={canonical}>` and `og:url`.
- Absolute image URL = `new URL(image, Astro.site)` (OG/Twitter require absolute URLs).

New tags emitted:

- `<link rel="canonical">`
- `og:url`, `og:site_name` = `Cloudzilla`, `og:locale` = `en_US`,
  `og:image` (+ `og:image:width` 1200, `og:image:height` 630, `og:image:alt`)
- `twitter:title`, `twitter:description`, `twitter:image`
- `<meta name="theme-color">` matching the dark background token
- `<meta name="robots" content="noindex,follow">` only when `noindex` is set

Existing tags (`title`, `description`, `og:title/description/type`,
`twitter:card`) are preserved.

### 2. Per-page metadata

- **`index.astro`** — pass an explicit, keyword-tuned `description` targeting
  search intent ("self-hosted Git forge", "single binary Git hosting",
  "open-source GitHub alternative"). Keep the brand title (layout default).
- **`docs.astro`, `changelog.astro`** — pass meaningful `title` + `description`.
- **`403.astro`, `404.astro`, `500.astro`, `loading.astro`, `maintenance.astro`** —
  pass `noindex`.

### 3. `public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /403
Disallow: /500
Disallow: /loading
Disallow: /maintenance

Sitemap: https://cloudzilla.dev/sitemap-index.xml
```

(404 is conventionally omitted from Disallow; it is `noindex` via meta instead.)

### 4. JSON-LD structured data (homepage only)

Inline `<script type="application/ld+json">` rendered from the homepage,
containing:

- **`SoftwareApplication`** — `name`, `description`, `applicationCategory`:
  `DeveloperApplication`, `operatingSystem`: `Linux, Docker`, `offers` (price 0,
  USD), `license` (MIT), `url`, `sameAs`: the GitHub repo.
- **`WebSite`** / **`Organization`** — `name`, `url`, `logo` (favicon), `sameAs`.

Sourced from `src/consts.ts` (`SITE`, `LINKS`) to avoid duplication. Homepage
only, since these entities describe the product/brand and the home document.

### 5. OG social image — `public/og.png` (1200×630)

A branded dark card: Cloudzilla layered-circles logo + wordmark + tagline
("A minimal, self-hosted Git forge") + the `single binary · no dependencies`
line, using the site's existing color tokens and Geist fonts. Authored as a
standalone 1200×630 HTML document, rendered and screenshotted via the
Playwright browser tool, saved to `public/og.png`. No new site dependency; a
real raster PNG that all crawlers support.

### 6. Sitemap config (`astro.config.mjs`)

Extend the `sitemap()` integration with a `filter` that excludes status/utility
routes (`/403`, `/500`, `/loading`, `/maintenance`) from the generated sitemap,
keeping it to indexable marketing/docs pages.

## Data flow

```
src/consts.ts (SITE, LINKS)
        │
        ├─► LandingLayout.astro frontmatter ──► <head> meta + canonical + OG/Twitter
        │                                         (image/noindex via props)
        │
        ├─► index.astro ──► JSON-LD + explicit description
        │
Astro.site + Astro.url.pathname ──► canonical / og:url / absolute image URL
```

## Error handling / edge cases

- **Absolute URLs:** all OG/Twitter image and URL values resolved through
  `new URL(..., Astro.site)` so they are absolute even on nested routes.
- **Missing `Astro.site`:** already set in `astro.config.mjs`; build is the only
  context, so no runtime fallback needed.
- **noindex correctness:** status pages use `noindex,follow` (don't index, still
  follow links) and are kept out of the sitemap; only `/403`, `/500`, `/loading`,
  `/maintenance` are disallowed in `robots.txt` (404 handled by meta only).

## Testing / verification

1. `bun run build` completes without errors.
2. `dist/index.html` contains: `rel="canonical"`, `og:image`, `og:url`,
   `twitter:image`, and a parseable `application/ld+json` block.
3. `dist/robots.txt` exists with the `Sitemap:` line.
4. `dist/sitemap-0.xml` excludes status routes.
5. A status page (e.g. `dist/500.html`) contains `noindex`.
6. `public/og.png` is 1200×630.

## Out of scope

- Content rewriting / copywriting beyond the homepage meta description.
- Performance/Core-Web-Vitals tuning, analytics, i18n/hreflang.
- Per-release OG image automation.
```
