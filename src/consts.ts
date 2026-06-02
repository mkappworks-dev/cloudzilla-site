export const SITE = {
  name: 'Cloudzilla',
  tagline: 'A minimal, self-hosted Git forge',
  description: 'Single binary. No external runtime dependencies. Git hosting, pull requests, code review, issues, and more.',
  version: 'v0.3.0',
};

export const LINKS = {
  github: 'https://github.com/mkappworks-dev/cloudzilla-app',
  dockerPackage: 'https://github.com/mkappworks-dev/cloudzilla-app/pkgs/container/cloudzilla-app',
  docs: '/docs',
  changelog: '/changelog',
};

export const DOCKER_PULL = 'docker pull ghcr.io/mkappworks-dev/cloudzilla-app:v0.3.0';

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
    version: 'v0.3.0',
    date: 'MAY 20, 2026',
    codename: 'UI overhaul — flagship pages, insights, and a new design system.',
    tag: { label: 'Latest', tone: 'green' },
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
