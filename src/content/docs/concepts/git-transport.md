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
