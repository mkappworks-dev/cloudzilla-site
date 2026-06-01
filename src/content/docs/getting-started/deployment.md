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
