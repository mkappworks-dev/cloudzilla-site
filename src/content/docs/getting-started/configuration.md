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
