/* ============================================================
   Cloudzilla docs — interactions (TS island)
   Ported from the design handoff's cloudzilla-docs.js.
   Scroll-spy for the section nav, the mobile section-nav toggle,
   and the ⌘K command palette. Copy buttons are wired separately
   by interactions.ts (loaded for every page via LandingLayout).
   ============================================================ */
import { LINKS } from '../consts';

interface CmdkItem {
  title: string;
  ctx: string;
  icon: 'section' | 'heading' | 'page' | 'link';
  group: string;
  hash?: string;
  href?: string;
  external?: boolean;
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- scroll-spy across the section nav ---------- */
function wireSpy() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.docs-section[id]'));
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const navLinks: Record<string, HTMLAnchorElement> = {};
  document.querySelectorAll<HTMLAnchorElement>(".dn-link[href^='#']").forEach((a) => {
    navLinks[(a.getAttribute('href') ?? '').slice(1)] = a;
  });

  const mbNow = document.querySelector<HTMLElement>('[data-mb-now]');
  const ratios: Record<string, number> = {};

  const refresh = () => {
    let bestId: string | null = null;
    let best = -1;
    sections.forEach((s) => {
      const v = ratios[s.id] || 0;
      if (v > best) { best = v; bestId = s.id; }
    });
    if (!bestId) return;
    Object.keys(navLinks).forEach((id) => navLinks[id].classList.toggle('active', id === bestId));
    if (mbNow && navLinks[bestId]) mbNow.textContent = navLinks[bestId].textContent;
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { ratios[(e.target as HTMLElement).id] = e.isIntersecting ? e.intersectionRatio : 0; });
      refresh();
    },
    { rootMargin: '-12% 0px -68% 0px', threshold: [0, 0.25, 0.6, 1] },
  );
  sections.forEach((s) => io.observe(s));
}

/* ---------- mobile section-nav toggle ---------- */
function wireMobileNav() {
  const nav = document.querySelector<HTMLElement>('.docs-nav');
  const bar = document.querySelector<HTMLElement>('.docs-mobile-bar');
  if (!nav || !bar) return;
  bar.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll<HTMLAnchorElement>('.dn-link').forEach((a) => {
    a.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 860px)').matches) nav.classList.remove('open');
    });
  });
}

/* ---------- command palette (⌘K) ---------- */
function wireCmdk() {
  const root = document.getElementById('cmdk');
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>('.cmdk-input');
  const results = root.querySelector<HTMLElement>('.cmdk-results');
  const scrim = root.querySelector<HTMLElement>('.cmdk-scrim');
  if (!input || !results || !scrim) return;

  const ICONS: Record<CmdkItem['icon'], string> = {
    section: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    heading: '<path d="M6 4v16M18 4v16M6 12h12"/>',
    page: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  };

  const slug = (s: string) => s.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');

  /* map each in-page section to its sidebar category (the .dn-group label),
     so palette results group the same way the sidebar does. */
  const sectionCategory: Record<string, string> = {};
  document.querySelectorAll<HTMLElement>('.docs-nav .dn-group').forEach((g) => {
    const label = (g.querySelector('.dn-label')?.textContent ?? '').trim();
    g.querySelectorAll<HTMLAnchorElement>(".dn-link[href^='#']").forEach((a) => {
      const id = (a.getAttribute('href') ?? '').slice(1);
      if (id) sectionCategory[id] = label;
    });
  });

  /* build the index from the live page. ctx is a breadcrumb: a section
     shows its category, a heading shows its parent section. */
  const index: CmdkItem[] = [];
  document.querySelectorAll<HTMLElement>('.docs-section[id]').forEach((sec) => {
    const h2 = sec.querySelector('h2');
    const secTitle = h2 ? (h2.textContent ?? '').trim() : sec.id;
    const category = sectionCategory[sec.id] || 'Documentation';
    index.push({ title: secTitle, ctx: category, icon: 'section', hash: '#' + sec.id, group: category });
    sec.querySelectorAll<HTMLElement>('h3').forEach((h3) => {
      if (!h3.id) h3.id = sec.id + '-' + slug(h3.textContent ?? '');
      index.push({ title: (h3.textContent ?? '').trim(), ctx: secTitle, icon: 'heading', hash: '#' + h3.id, group: category });
    });
  });
  /* a few static destinations */
  index.push({ title: 'Changelog', ctx: 'Release notes', icon: 'page', href: LINKS.changelog, group: 'Elsewhere' });
  index.push({ title: 'Landing page', ctx: 'Overview & features', icon: 'page', href: '/', group: 'Elsewhere' });
  index.push({ title: 'GitHub repository', ctx: 'github.com/mkappworks-dev', icon: 'link', href: LINKS.github, external: true, group: 'Elsewhere' });

  let active = 0;
  let current: CmdkItem[] = [];

  const score = (item: CmdkItem, q: string) => {
    const t = item.title.toLowerCase();
    const c = item.ctx.toLowerCase();
    const i = t.indexOf(q);
    if (i === 0) return 100;
    if (i > 0) return 70 - i;
    if (c.indexOf(q) >= 0) return 40;
    const ok = q.split(/\s+/).every((tok) => (t + ' ' + c).indexOf(tok) >= 0);
    return ok ? 20 : -1;
  };

  const esc = (s: string) => s.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m] as string));

  const highlight = (text: string, q: string) => {
    if (!q) return esc(text);
    const i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  };

  const render = (raw: string) => {
    const q = (raw || '').trim().toLowerCase();
    // Searching → flat, relevance-ranked, no dividers. Browsing (empty
    // query) → grouped by sidebar category in document order.
    const grouped = !q;
    const list = q
      ? index
          .map((it) => ({ it, s: score(it, q) }))
          .filter((r) => r.s >= 0)
          .sort((a, b) => b.s - a.s)
          .map((r) => r.it)
      : index.slice();
    current = list;
    active = 0;

    if (!list.length) {
      results.innerHTML = '<div class="cmdk-empty">No matches for <span class="ce-q">"' + esc(q) + '"</span></div>';
      return;
    }
    let html = '';
    let lastGroup: string | null = null;
    list.forEach((it, n) => {
      if (grouped && it.group !== lastGroup) { html += '<div class="cmdk-group-label">' + esc(it.group) + '</div>'; lastGroup = it.group; }
      // A section's breadcrumb is its category — redundant under the category
      // divider, so drop it while browsing. Keep it for headings/destinations
      // (and for everything in flat search mode, where there's no divider).
      const showCtx = !(grouped && it.icon === 'section');
      const ctxHtml = showCtx ? '<span class="ck-ctx">' + esc(it.ctx) + (it.external ? ' ↗' : '') + '</span>' : '';
      html +=
        '<div class="cmdk-item' + (n === 0 ? ' active' : '') + '" role="option" data-i="' + n + '">' +
        '<span class="ck-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[it.icon] + '</svg></span>' +
        '<span class="ck-text"><span class="ck-title">' + highlight(it.title, q) + '</span>' + ctxHtml + '</span>' +
        '<span class="ck-enter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10l-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg></span>' +
        '</div>';
    });
    results.innerHTML = html;
  };

  const setActive = (n: number) => {
    const items = results.querySelectorAll<HTMLElement>('.cmdk-item');
    if (!items.length) return;
    active = (n + items.length) % items.length;
    items.forEach((el, k) => el.classList.toggle('active', k === active));
    items[active].scrollIntoView({ block: 'nearest' });
  };

  const close = () => {
    root.hidden = true;
    document.documentElement.style.overflow = '';
  };

  const choose = (n: number) => {
    const it = current[n];
    if (!it) return;
    close();
    if (it.href) { window.location.href = it.href; return; }
    if (it.hash) {
      const el = document.querySelector(it.hash);
      if (el) {
        history.replaceState(null, '', it.hash);
        el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      }
    }
  };

  const open = () => {
    root.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    input.value = '';
    render('');
    requestAnimationFrame(() => input.focus());
  };
  const toggle = () => (root.hidden ? open() : close());

  /* events */
  document.querySelectorAll<HTMLElement>('[data-cmdk-open]').forEach((b) => b.addEventListener('click', open));
  scrim.addEventListener('click', close);
  input.addEventListener('input', () => render(input.value));
  results.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('.cmdk-item');
    if (item) choose(parseInt(item.dataset.i ?? '0', 10));
  });
  results.addEventListener('mousemove', (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('.cmdk-item');
    if (item) setActive(parseInt(item.dataset.i ?? '0', 10));
  });

  document.addEventListener('keydown', (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); toggle(); return; }
    if (root.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
  });
}

function init() {
  wireSpy();
  wireMobileNav();
  wireCmdk();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
