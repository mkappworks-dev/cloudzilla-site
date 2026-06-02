/* ============================================================
   Cloudzilla landing — interactions (TS island)
   Ported from the design handoff's cloudzilla.js.
   Copy buttons · quickstart tabs · screenshot carousel ·
   scroll reveal · nav scroll-spy. Every wiring guards on the
   presence of its DOM, so this is safe to load on any page.
   ============================================================ */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- copy to clipboard ---------- */
function wireCopy() {
  document.querySelectorAll<HTMLElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy') ?? '';
      const done = () => {
        const label = btn.querySelector<HTMLElement>('[data-copy-label]');
        const original = btn.getAttribute('data-orig') ?? (label ? label.textContent ?? '' : '');
        btn.classList.add('copied');
        if (label) {
          btn.setAttribute('data-orig', original);
          label.textContent = 'Copied';
        }
        setTimeout(() => {
          btn.classList.remove('copied');
          if (label) label.textContent = original;
        }, 1600);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        done();
      }
    });
  });
}

/* ---------- quickstart tabs (sync intro, step rail, code panel) ---------- */
function wireTabs() {
  document.querySelectorAll<HTMLElement>('[data-tabset]').forEach((set) => {
    const tabs = set.querySelectorAll<HTMLElement>('.qs-tab');
    const panels = set.querySelectorAll<HTMLElement>('.qs-panel');
    const scope = set.closest('section') ?? set.closest('.qs-layout');
    const swaps = scope ? scope.querySelectorAll<HTMLElement>('[data-steps]') : [];
    const syncSteps = (name: string) => {
      swaps.forEach((s) => {
        // toggle `hidden` explicitly: the step lists use display:flex which
        // would otherwise override the hidden attribute (handoff bug note).
        (s as HTMLElement).hidden = s.dataset.steps !== name;
      });
    };
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const name = tab.dataset.tab ?? '';
        tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === name));
        syncSteps(name);
      });
    });
  });
}

/* ---------- screenshot carousel ---------- */
function wireCarousel() {
  const stage = document.querySelector<HTMLElement>('.shots');
  if (!stage) return;
  const imgs = stage.querySelectorAll<HTMLImageElement>('.shot-frame img');
  const tabs = stage.querySelectorAll<HTMLElement>('.shot-tab');
  const capEl = stage.querySelector<HTMLElement>('.shot-cap');
  const urlEl = document.getElementById('browser-url');
  const caps = Array.from(imgs).map((im) => ({ t: im.dataset.title, d: im.dataset.desc, u: im.dataset.url }));
  let idx = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const go = (n: number) => {
    idx = (n + imgs.length) % imgs.length;
    imgs.forEach((im, k) => im.classList.toggle('is-active', k === idx));
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === idx)));
    if (capEl) capEl.innerHTML = `<b>${caps[idx].t}</b> — ${caps[idx].d}`;
    if (urlEl && caps[idx].u) urlEl.textContent = caps[idx].u as string;
  };
  const auto = () => {
    if (reduce) return;
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(idx + 1), 5200);
  };
  stage.querySelector('.shot-prev')?.addEventListener('click', () => { go(idx - 1); auto(); });
  stage.querySelector('.shot-next')?.addEventListener('click', () => { go(idx + 1); auto(); });
  tabs.forEach((t, k) => t.addEventListener('click', () => { go(k); auto(); }));
  stage.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
  stage.addEventListener('mouseleave', auto);
  go(0);
  auto();
}

/* ---------- scroll reveal ---------- */
function wireReveal() {
  const els = document.querySelectorAll<HTMLElement>('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- nav scroll-spy ---------- */
function wireNavSpy() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href*="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map: Record<string, HTMLAnchorElement> = {};
  const sections: HTMLElement[] = [];
  links.forEach((a) => {
    const id = (a.getAttribute('href') ?? '').split('#')[1];
    if (!id) return;
    const sec = document.getElementById(id);
    if (sec) {
      map[id] = a;
      sections.push(sec);
    }
  });
  if (!sections.length) return;
  const ratios: Record<string, number> = {};
  const refresh = () => {
    let bestId: string | null = null;
    let best = 0;
    sections.forEach((s) => {
      const v = ratios[s.id] || 0;
      if (v > best) { best = v; bestId = s.id; }
    });
    links.forEach((a) => a.classList.remove('active'));
    if (bestId && map[bestId]) map[bestId].classList.add('active');
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { ratios[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      refresh();
    },
    { rootMargin: '-42% 0px -52% 0px', threshold: [0, 0.2, 0.5, 1] },
  );
  sections.forEach((s) => io.observe(s));
}

function init() {
  wireCopy();
  wireTabs();
  wireCarousel();
  wireReveal();
  wireNavSpy();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
