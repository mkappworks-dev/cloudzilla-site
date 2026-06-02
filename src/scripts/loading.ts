/* ============================================================
   Cloudzilla loading — boot-sequence ticker (TS island)
   Ported from the design handoff's Loading.html inline script.
   Cycles the mono status line every 1100ms, ending on a green
   "ready" state. Under reduced-motion, shows only the first line.

   In the real app, replace this canned sequence with actual
   boot/health signals (or poll until the destination is ready,
   then redirect).
   ============================================================ */
const el = document.getElementById('load-line');
if (el) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lines = [
    'connecting to PostgreSQL',
    'running migrations',
    'starting SSH server on :22',
    'starting HTTP server on :3000',
    'warming full-text search',
    'ready — listening on :3000',
  ];
  if (reduce) {
    el.textContent = lines[0];
  } else {
    let i = 0;
    const tick = () => {
      el.innerHTML =
        i === lines.length - 1
          ? '<span class="lc">ready</span> — listening on :3000'
          : lines[i];
      i++;
      if (i < lines.length) setTimeout(tick, 1100);
    };
    tick();
  }
}
