# Cloudzilla Marketing & Docs Site — Design

**Date:** 2026-06-01
**Status:** Approved (design)
**Location:** `cloudzilla-site/`

## Goal

Build a static marketing + documentation site for Cloudzilla — a minimal, self-hosted
Git forge — that drives visitors to the GitHub repo, the Docker package, and curated
documentation. Visual and tonal reference: [dokploy.com](https://dokploy.com) (landing)
and [docs.dokploy.com](https://docs.dokploy.com/docs/core) (docs).

## Decisions (locked)

| Decision        | Choice                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| Scope           | Landing page + hosted docs + changelog                                 |
| Stack           | Astro 4 + Starlight + Tailwind, `output: 'static'`                     |
| Hosting         | Host-agnostic static build; host chosen later (no SSR adapter)         |
| Docs content    | Curated, site-authored (not a wholesale mirror of app `docs/`)         |
| Visual direction| Match the app aesthetic (black theme, Geist fonts, cloud mark, tokens) |

## Outbound targets (must be wired throughout)

- GitHub repo: `https://github.com/mkappworks-dev/cloudzilla-app`
- Docker package: `https://github.com/mkappworks-dev/cloudzilla-app/pkgs/container/cloudzilla-app`
- Pull command: `docker pull ghcr.io/mkappworks-dev/cloudzilla-app:v0.3.0`

## Architecture

Static Astro site. Three surfaces:

1. **Landing** — hand-built Astro route at `/` for full design control.
2. **Docs** — Starlight at `/docs` (sidebar, search, prev/next, dark mode).
3. **Roadmap** (`/roadmap`) and **Changelog** (`/changelog`) — dedicated pages.

Tailwind reuses the app's shadcn-style HSL token system; **Geist** / **Geist Mono**
are self-hosted. The architecture diagram ships as a static SVG/image (no mermaid
runtime) to keep the landing page zero-JS by default.

### Project structure

```
cloudzilla-site/
  astro.config.mjs          # astro + starlight + tailwind integrations
  tailwind.config.mjs       # ported HSL tokens, Geist font families
  public/
    favicon.svg             # cloud mark (copied from app)
    fonts/                  # Geist + Geist Mono woff2
    screenshots/            # 2–3 captured from app mockups
    og-image.png            # social card
  src/
    styles/
      global.css            # tailwind base + dark-theme CSS vars
      starlight.css         # Starlight theme overrides to match brand
    components/landing/
      Nav.astro
      Hero.astro
      FeatureGrid.astro
      Architecture.astro
      InstallTabs.astro     # Docker / Local dev tabs, copy-to-clipboard
      Screenshots.astro
      RoadmapPreview.astro
      CTA.astro
      Footer.astro
      CopyButton.astro      # the only interactive island
    layouts/
      LandingLayout.astro
    pages/
      index.astro           # landing
      roadmap.astro
      changelog.astro
    content/
      docs/                 # Starlight MDX collection (curated)
    content.config.ts       # starlight docs collection schema
```

## Landing page sections

1. **Nav** — cloud logo + "Cloudzilla" wordmark, `v0.3.0` badge, links: Docs, Roadmap,
   Changelog, GitHub.
2. **Hero** — headline "A minimal, self-hosted Git forge"; subhead "Single binary.
   No external runtime dependencies."; primary CTA **Get started** (→ docs install),
   secondary **View on GitHub**; click-to-copy `docker pull ghcr.io/...:v0.3.0`.
3. **Feature grid** — the README's 12 feature categories as icon cards: Git hosting,
   Pull requests, Code review, Issues, Organizations, Access control, Authentication,
   Collaboration, Notifications, Webhooks, Search, Project management.
4. **Architecture + stack strip** — `Go · Templ · HTMX · Alpine · Tailwind · PostgreSQL`
   plus a static architecture diagram derived from the README mermaid.
5. **Quick start** — tabbed **Docker (recommended)** / **Local dev**, copyable commands
   sourced from the README.
6. **Screenshots** — 2–3 polished mockups (home, repo, PR).
7. **Roadmap preview** — M1 ✅ Complete / M2 Planned, link to full roadmap.
8. **CTA + Footer** — "Self-host Cloudzilla today", docker pull, links to GitHub,
   Docker package, Docs, Roadmap, Changelog, BSL 1.1 license note, "built with Astro".

## Docs content (curated)

Starlight sidebar:

- **Getting started**: Introduction, Installation (Docker + ghcr pull), Configuration,
  Deployment / Self-hosting.
- **Concepts**: Features overview, Access control (condensed), Git transport (HTTP/SSH).
- **Reference**: link out to GitHub for the full API reference and developer docs
  (these stay developer-side, not mirrored).

Content is authored fresh for end users, seeded from the app's `README.md` and the
user-facing subset of `docs/` (configuration, deployment). The 111 KB dev `ROADMAP.md`
(SQL migrations, phase specs) is **not** mirrored.

- **Roadmap page** renders the clean M1/M2 milestone view from the README.
- **Changelog page** is seeded from the app's `CHANGELOG.md`, maintained per release.

## Design tokens

Port the app's dark-theme HSL CSS variables from `tailwind/input.css` into the site's
`global.css` (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, etc.).
Pure-black base, white text, blue accent. Self-host Geist (sans) and Geist Mono.
Starlight theme overridden via `starlight.css` to consume the same tokens.

## Interactivity

Zero-JS by default. The only client-side islands:

- **CopyButton** — copy `docker pull` / quick-start commands to clipboard.
- **InstallTabs** — Docker / Local dev tab switch (CSS or tiny script).

Starlight provides its own search/nav JS within the docs surface only.

## Verification

- `astro build` completes with no errors or broken-link warnings.
- All internal routes (`/`, `/docs`, `/roadmap`, `/changelog`) and external links
  (GitHub, Docker package) resolve.
- Responsive at mobile and desktop breakpoints.
- Copy-to-clipboard works in-browser.
- Lighthouse ≥ 95 (performance/accessibility) on the static landing page.

## Out of scope

- SSR / dynamic features (live GitHub star counts, etc.).
- Automated changelog generation from release-please (manual seed for now).
- Hosting/CI wiring (host chosen later; build is portable).
- Mirroring developer-internal docs (API reference, htmx patterns) — linked, not hosted.
