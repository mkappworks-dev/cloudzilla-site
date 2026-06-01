---
title: Access Control
description: The permission model.
---

Cloudzilla uses a three-tier permission model: **instance**, **organization**, and
**repository**. Each tier grants `CanRead`, `CanWrite`, `CanManage`, and `IsOwner`
capabilities that compose downward.

Branch protection rules, deploy keys, and personal access tokens layer on top of repo
permissions. For the full role tables and invite-token flow, see the
[access-control docs on GitHub](https://github.com/mkappworks-dev/cloudzilla-app/blob/main/docs/access-control.md).
