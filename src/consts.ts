export const SITE = {
  name: 'Cloudzilla',
  tagline: 'A minimal, self-hosted Git forge',
  description: 'Single binary. No external runtime dependencies. Git hosting, pull requests, code review, issues, and more.',
  version: 'v0.6.0',
  ogImage: '/og.png',
};

export const LINKS = {
  github: 'https://github.com/mkappworks-dev/cloudzilla-app',
  dockerPackage: 'https://github.com/mkappworks-dev/cloudzilla-app/pkgs/container/cloudzilla-app',
  docs: '/docs',
  changelog: '/changelog',
};

export const DOCKER_PULL = 'docker pull ghcr.io/mkappworks-dev/cloudzilla-app:v0.6.0';

export const STACK = ['Go', 'Templ', 'HTMX', 'Alpine.js', 'Tailwind CSS', 'PostgreSQL'];

// Carousel screenshots. `url` drives the faux browser-chrome address bar.
export const SHOTS = [
  { src: '/screenshots/home.png', alt: 'Cloudzilla dashboard', title: 'Dashboard', desc: 'Repositories, activity, and what needs your attention.', url: 'cloudzilla.dev/acme', label: 'Dashboard' },
  { src: '/screenshots/repo.png', alt: 'Repository view', title: 'Repository', desc: 'Code browser, branches, releases, and language breakdown.', url: 'cloudzilla.dev/acme/forge', label: 'Repository' },
  { src: '/screenshots/pr.png', alt: 'Pull request', title: 'Pull request', desc: 'Conversation, reviewers, passing checks, and linked issues.', url: 'cloudzilla.dev/acme/forge/pulls/214', label: 'Pull request' },
  { src: '/screenshots/diff.png', alt: 'Diff view', title: 'Diff view', desc: 'Unified or split, file tree, and hide-whitespace.', url: 'cloudzilla.dev/acme/forge/pulls/214/files', label: 'Diff' },
  { src: '/screenshots/issue.png', alt: 'Issue', title: 'Issues', desc: 'Labels, assignees, priority, and milestone progress.', url: 'cloudzilla.dev/acme/forge/issues/87', label: 'Issues' },
  { src: '/screenshots/board.png', alt: 'Project board', title: 'Project boards', desc: 'Kanban columns linked to their issues and PRs.', url: 'cloudzilla.dev/acme/forge/projects/2', label: 'Boards' },
  { src: '/screenshots/discussions.png', alt: 'Discussions', title: 'Discussions', desc: 'Q&A, ideas, and announcements with reactions.', url: 'cloudzilla.dev/acme/forge/discussions', label: 'Discussions' },
  { src: '/screenshots/releases.png', alt: 'Releases', title: 'Releases', desc: 'Tag, package, and ship — drafts, pre-releases, latest.', url: 'cloudzilla.dev/acme/forge/releases', label: 'Releases' },
];

// Curated release notes for the changelog feed, mirroring the release-please
// history in changelog.md. Update per release as new versions ship.
export interface ChangelogGroup {
  kind: 'added' | 'improved' | 'fixed';
  items: string[]; // may contain inline <b> / <span class="mono"> markup
}
export interface ChangelogEntry {
  version: string;
  date: string;
  codename: string;
  tag: { label: string; tone: 'green' | 'gray' };
  groups: ChangelogGroup[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.6.0',
    date: 'OCT 8, 2026',
    codename: 'Operate it for real — mirrors, admin tools, metrics, and rate limits.',
    tag: { label: 'Latest', tone: 'green' },
    groups: [
      {
        kind: 'added',
        items: [
          '<b>Pull mirrors</b> — scheduled sync from another Git host, a read-only guard, and credentials sealed with <span class="mono">security.secret_key</span>.',
          '<b>Edit, rename, and delete files</b> straight from the code browser, plus a file tree that stays on blob pages.',
          '<b>Syntax highlighting</b> with per-user code themes, and a create-a-fork page with owner, name, and default-branch options.',
          '<b>Password reset</b> by email with a CLI fallback, a <span class="mono">reset-2fa</span> command for locked-out operators, and reset links issued from the admin user page.',
          '<b>Admin user management</b> — suspend accounts everywhere they sign in.',
          '<b>Avatar uploads</b> on local disk or any S3-compatible storage.',
          '<b>Close issues from closing keywords</b> in commits and pull requests.',
          '<b>Prometheus metrics</b> on a separate listener, plus <span class="mono">/healthz</span> and <span class="mono">/readyz</span> probes and a Docker <span class="mono">HEALTHCHECK</span>.',
          '<b>API rate limits</b> per user and per IP, configurable per resource.',
          'A <b>Checks</b> tab of commit statuses replaces the Actions mockup.',
        ],
      },
      {
        kind: 'fixed',
        items: [
          'Private repositories now answer pages, code search, and Git requests exactly like a missing repo.',
          'Webhooks refuse private addresses at dial time; SSH refuses a key already registered as a deploy key (and vice versa).',
          'Required status checks are evaluated against, and merge, the head commit that passed.',
          'Code browser: annotated tags, nested file-tree filter, escaped refs and paths, and branch switching for refs like <span class="mono">feature/x</span>.',
          'Settings forms show save errors instead of a stale success toast; the footer shows the real build version.',
        ],
      },
    ],
  },
  {
    version: 'v0.5.0',
    date: 'OCT 4, 2026',
    codename: 'Import, seed, and faster pull requests — on PostgreSQL 18.',
    tag: { label: 'alpha', tone: 'gray' },
    groups: [
      {
        kind: 'added',
        items: [
          '<b>Import a repository</b> from another Git host.',
          '<span class="mono">cloudzilla-cli seed</span> fills a dev instance with test data.',
          'Show/hide password toggle on sign-in and sign-up; admin pages linked from the user menu; command-palette items replace the home shortcuts panel.',
        ],
      },
      {
        kind: 'improved',
        items: [
          '<b>Breaking:</b> Docker Compose now runs <b>PostgreSQL 18</b>. Dump the database, remove the <span class="mono">postgres_data</span> volume, and restore — see the upgrade notes in the docs.',
          'Pull requests diff from their merge base, skip the unused diff on the Conversation tab, and stop writing merged trees on page views.',
          'Pushes walk only the commits they add; embedded assets are cached and gzipped, and mermaid loads on demand.',
        ],
      },
      {
        kind: 'fixed',
        items: [
          'Web commits keep existing entries intact and cap path and upload sizes; <span class="mono">.git</span> paths are refused.',
          'Merged trees keep submodules and mode changes; tree entries sort in Git order.',
          'Toasts show after <span class="mono">HX-Redirect</span> and <span class="mono">HX-Refresh</span> responses; left-side PR line comments land on the right line.',
        ],
      },
    ],
  },
  {
    version: 'v0.4.0',
    date: 'OCT 1, 2026',
    codename: 'Security hardening — accounts, auth, and Git pushes.',
    tag: { label: 'alpha', tone: 'gray' },
    groups: [
      {
        kind: 'added',
        items: [
          '<b>Email verification</b> at sign-up, with Google sign-in linked to verified addresses and connect / disconnect from account settings.',
          '<b>Organizations own their repositories</b>; repository transfers must be accepted by the recipient.',
          'Deleted accounts hand their content to a ghost user; commit author email is private by default.',
          'New UI for gists, the dashboard, profiles, and organizations (overhaul phases 7–9).',
        ],
      },
      {
        kind: 'fixed',
        items: [
          'PAT and OAuth-app token scopes are enforced; TOTP is required on API, LDAP, SAML, and Google sign-in.',
          'Branch protection is enforced before receive-pack writes the ref; unreachable, missing, or stale pushes are refused.',
          'Thin packs and delete-only pushes are accepted over HTTP and SSH.',
          'Private issues and repositories no longer leak through search, notifications, pinned lists, or the API.',
        ],
      },
    ],
  },
  {
    version: 'v0.3.0',
    date: 'MAY 20, 2026',
    codename: 'UI overhaul — flagship pages, insights, and a new design system.',
    tag: { label: 'alpha', tone: 'gray' },
    groups: [
      {
        kind: 'added',
        items: [
          '<b>Full UI overhaul</b> — flagship repository, issue, and pull-request pages rebuilt, with PR sub-views, account navigation, and a redesigned milestone view.',
          '<b>Repository Insights</b> — commits, contributors, pulse, and a dependency graph.',
          '<b>Code browser &amp; project boards</b> redesigned, alongside refreshed tracker, Actions, and review-request views.',
          'Profile, organizations, wiki, releases, discussions, and settings pages polished.',
          'Publish step to promote <b>draft releases</b> to published.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'New <b>design-system foundation</b> — every page ported and the shared component library expanded.',
          'Hardened the GitHub Actions CI workflows.',
        ],
      },
    ],
  },
  {
    version: 'v0.2.0',
    date: 'MAY 12, 2026',
    codename: 'First public alpha — the core forge.',
    tag: { label: 'alpha', tone: 'gray' },
    groups: [
      {
        kind: 'added',
        items: [
          '<b>Git hosting</b> over smart HTTP + SSH — pure Go via <span class="mono">go-git</span>, with no <span class="mono">git</span> executable on the box.',
          '<b>Code browser</b> — tree, blob, blame, commit history, and syntax-highlighted diffs.',
          '<b>Pull requests</b> — fast-forward, three-way, and squash merges, draft PRs, and auto-merge.',
          '<b>Code review</b> — inline line comments, one-click suggestions, and <span class="mono">CODEOWNERS</span> auto-assign.',
          '<b>Issues</b> — labels, assignees, milestones, reactions, pinning, locking, templates, and private issues.',
          '<b>Organizations</b> — orgs, collaborators, three-tier permissions, and protected branches.',
          '<b>Authentication</b> — Google OAuth, TOTP 2FA, LDAP / SAML SSO, personal access tokens, and deploy keys.',
          '<b>Notifications</b> — in-app feed plus SMTP email digests, per-repo watch levels, and an activity feed.',
          '<b>Webhooks</b> with HMAC signing, retry / backoff, and redelivery.',
          'Full-text search, explore / trending, project boards, wikis, gists, profile READMEs, topics, stars, and forks.',
          'Single static binary, shipped as a <b>Docker image</b>; <b>PostgreSQL</b> is the only runtime dependency.',
        ],
      },
      {
        kind: 'improved',
        items: [
          'Migrated rendering to <b>templ</b> type-safe components across every page.',
          'Standardized on <b>PostgreSQL</b> — removed SQLite, consolidated migrations, and moved stores to sqlx.',
        ],
      },
      {
        kind: 'fixed',
        items: [
          'Implemented the full git pack protocol for HTTP and SSH transport.',
          'Hardened project-board data isolation and reaction ownership checks.',
          'CSRF tokens now included in hand-rolled <span class="mono">fetch()</span> calls, plus numerous security-review fixes across phases.',
        ],
      },
    ],
  },
];
