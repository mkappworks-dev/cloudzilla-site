export const SITE = {
  name: 'Cloudzilla',
  tagline: 'A minimal, self-hosted Git forge',
  description: 'Single binary. No external runtime dependencies. Git hosting, pull requests, code review, issues, and more.',
  version: 'v0.3.0',
};

export const LINKS = {
  github: 'https://github.com/mkappworks-dev/cloudzilla-app',
  dockerPackage: 'https://github.com/mkappworks-dev/cloudzilla-app/pkgs/container/cloudzilla-app',
  docs: '/getting-started/introduction',
  roadmap: '/roadmap',
  changelog: '/changelog',
};

export const DOCKER_PULL = 'docker pull ghcr.io/mkappworks-dev/cloudzilla-app:v0.3.0';

export const STACK = ['Go', 'Templ', 'HTMX', 'Alpine.js', 'Tailwind CSS', 'PostgreSQL'];

export const FEATURES = [
  { title: 'Git hosting', body: 'HTTP + SSH smart protocol, branch/tag management, code browser with blame, commit history and diffs.' },
  { title: 'Pull requests', body: 'Fast-forward / merge / squash strategies, diff view, draft PRs, auto-merge, conflict detection.' },
  { title: 'Code review', body: 'Approve / request changes, inline line comments, one-click suggestions, CODEOWNERS auto-assign.' },
  { title: 'Issues', body: 'Open/close workflow, labels, assignees, milestones, pinning, locking, private issues, templates.' },
  { title: 'Organizations', body: 'Shared namespaces with owner/member roles, org profile pages, member management.' },
  { title: 'Access control', body: 'Three-tier permissions (instance/org/repo), branch protection, deploy keys, access tokens.' },
  { title: 'Authentication', body: 'JWT cookies, Google OAuth, TOTP 2FA with recovery codes, LDAP/SAML SSO, invitations.' },
  { title: 'Collaboration', body: 'Wikis, discussions, gists, profile READMEs, topics, stars, forks, reactions, @mentions.' },
  { title: 'Notifications', body: 'In-app notifications with unread badge, email (SMTP), watching and subscriptions.' },
  { title: 'Webhooks', body: 'Push/issues/PR events, HMAC-SHA256 signing, retry with backoff, delivery logs.' },
  { title: 'Search', body: 'Full-text search across repos, issues, PRs, and users (PostgreSQL tsvector + GIN).' },
  { title: 'Project management', body: 'Kanban boards, milestones with progress tracking, activity feed.' },
];
