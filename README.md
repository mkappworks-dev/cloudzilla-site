# cloudzilla-site

The marketing and documentation site for [Cloudzilla](https://github.com/mkappworks-dev/cloudzilla-app) — a minimal, self-hosted Git forge. Single binary, no external runtime dependencies.

Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), shipped as a fully static site to [cloudzilla.dev](https://cloudzilla.dev).

## What's here

- **Landing page** (`/`) — hero, feature grid, architecture diagram, quickstart, screenshot carousel, roadmap, and CTA.
- **Docs** (`/docs`) — a standalone single-page self-host guide (install, configuration, Git access, backups, upgrading).
- **Changelog** (`/changelog`) — rendered from [`src/changelog.md`](src/changelog.md).
- **Status pages** — `403`, `404`, `500`, `loading`, and `maintenance` variants intended to be served by the app.

## Prerequisites

- [Bun](https://bun.sh) (this project uses Bun as its package manager)

## Getting started

```sh
bun install      # install dependencies
bun run dev      # start the dev server at http://localhost:4321
```

## Scripts

| Command           | Description                                 |
| ----------------- | ------------------------------------------- |
| `bun run dev`     | Start the local dev server with hot reload. |
| `bun run build`   | Build the static site to `./dist`.          |
| `bun run preview` | Preview the production build locally.       |

## Project structure

```text
src/
├── pages/        # Routes — index, docs, changelog, and status pages
├── layouts/      # Shared page shells (LandingLayout)
├── components/   # Landing and docs UI components
├── scripts/      # Client-side islands (interactions, carousel, docs search)
├── styles/       # Global tokens + landing/docs/status CSS
├── consts.ts     # Site metadata, links, stack, and screenshot data
└── changelog.md  # Source for the /changelog page
public/           # Static assets (favicon, screenshots)
```

Editing site copy, links, or the version badge? Most of it lives in [`src/consts.ts`](src/consts.ts).

## Notes

- The docs live in the bespoke single-page guide at [`src/pages/docs.astro`](src/pages/docs.astro). Starlight was trialed early on and then retired in favor of this standalone guide.
- Keep the deployment commands in the docs and quickstart in sync with the app's real defaults (ports `8080`/`2222`, `CZ_*` config keys, and the `cloudzilla-cli migrate` step).

## License

This site's source is licensed under the [MIT License](LICENSE). The Cloudzilla application itself is licensed separately under BSL 1.1.
