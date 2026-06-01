---
title: Introduction
description: What Cloudzilla is and why it exists.
---

Cloudzilla is a minimal, self-hosted Git forge that ships as a **single binary** with
**no external runtime dependencies** beyond PostgreSQL.

One Go process serves the web UI, the HTTP git smart protocol, and an SSH server — no
`git` executable required on the host. It provides git hosting, pull requests, code review,
issues, organizations, wikis, discussions, gists, search, and instance administration.

:::caution[Alpha]
Cloudzilla is under active development. APIs and features may change. Not recommended for
production use yet.
:::

## Next steps

- [Installation](/getting-started/installation) — run it with Docker.
- [Configuration](/getting-started/configuration) — environment variables and config file.
- [Deployment](/getting-started/deployment) — production notes.
