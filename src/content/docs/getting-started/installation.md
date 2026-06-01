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
