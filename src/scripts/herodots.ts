/* ============================================================
   Cloudzilla — hero reactive dot matrix (TS island)
   Ported from cloudzilla-bg.js, reduced to the finalized "dots"
   mode. A grid of dots brightens, grows, tints green, and gently
   repels around the cursor; a soft blurred ellipse is erased over
   the hero content so no dots sit behind the text/CTA.
   Skips entirely under prefers-reduced-motion.
   ============================================================ */
const GREEN: [number, number, number] = [74, 222, 128]; // --cz-primary #4ade80
const DOTGAP = 27;
const IDLE = 1600; // ms before the reaction fades out

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

function init() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero || reduce) return; // static (blank) background when reduced motion

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-fx';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);
  hero.classList.add('has-fx');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  function resize() {
    const r = hero!.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildClearCanvas();
  }
  resize();
  window.addEventListener('resize', resize);

  /* soft "no-go" oval, measured from the real hero content box */
  let clearShape: { cx: number; cy: number; rx: number; ry: number } | null = null;
  function computeClearShape() {
    const el = hero!.querySelector<HTMLElement>('.manifesto');
    if (!el) { clearShape = null; return; }
    const hr = hero!.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    clearShape = {
      cx: b.left - hr.left + b.width / 2,
      cy: b.top - hr.top + b.height / 2,
      rx: b.width * 0.5,
      ry: b.height * 0.48,
    };
  }
  computeClearShape(); buildClearCanvas();
  window.addEventListener('resize', () => { computeClearShape(); buildClearCanvas(); });
  window.addEventListener('load', () => { computeClearShape(); buildClearCanvas(); });
  setTimeout(() => { computeClearShape(); buildClearCanvas(); }, 600); // after webfonts settle

  const pointer = { x: W * 0.5, y: H * 0.4, mx: W * 0.5, my: H * 0.4, k: 0, lastMove: -1e9 };
  window.addEventListener('mousemove', (e) => {
    const r = hero!.getBoundingClientRect();
    pointer.mx = e.clientX - r.left;
    pointer.my = e.clientY - r.top;
    pointer.lastMove = performance.now ? performance.now() : Date.now();
  });

  const dotAlpha = 0.22; // finalized resting opacity

  function drawDots(now: number) {
    const R = Math.min(200, Math.max(W, H) * 0.26);
    const idle =
      now - pointer.lastMove > IDLE ||
      pointer.my < 0 || pointer.my > H || pointer.mx < 0 || pointer.mx > W;
    pointer.k += ((idle ? 0 : 1) - pointer.k) * 0.06;
    if (!idle) {
      pointer.x += (pointer.mx - pointer.x) * 0.12;
      pointer.y += (pointer.my - pointer.y) * 0.12;
    }
    const mx = pointer.x;
    const my = pointer.y;
    const k = pointer.k;
    const react = k > 0.01;
    const R2 = R * R;
    for (let y = DOTGAP; y < H; y += DOTGAP) {
      for (let x = DOTGAP; x < W; x += DOTGAP) {
        let r = 1.15;
        let a = dotAlpha;
        let px = x;
        let py = y;
        let green = false;
        let infl = 0;
        if (react) {
          const dx = x - mx;
          const dy = y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2);
            let f = 1 - d / R;
            f *= f; // ease-in falloff
            infl = f * k;
            r += infl * 2.4; // grow
            a += infl * 0.7; // brighten
            const push = infl * 9;
            const n = d > 0.001 ? 1 / d : 0;
            px = x + dx * n * push; // gently repel
            py = y + dy * n * push;
            green = true;
          }
        }
        if (green) {
          const t = Math.min(1, infl * 1.3);
          const gr = Math.round(255 + (GREEN[0] - 255) * t);
          const gg = Math.round(255 + (GREEN[1] - 255) * t);
          const gb = Math.round(255 + (GREEN[2] - 255) * t);
          ctx!.fillStyle = `rgba(${gr},${gg},${gb},${a})`;
        } else {
          ctx!.fillStyle = rgba([255, 255, 255], a);
        }
        ctx!.beginPath();
        ctx!.arc(px, py, r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
  }

  let clearCanvas: HTMLCanvasElement | null = null;
  function buildClearCanvas() {
    if (!clearShape) { clearCanvas = null; return; }
    const s = clearShape;
    const c = document.createElement('canvas');
    c.width = W * dpr;
    c.height = H * dpr;
    const cx = c.getContext('2d');
    if (!cx) { clearCanvas = null; return; }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.filter = 'blur(24px)';      // applied ONCE, not per frame
    cx.fillStyle = '#000';
    cx.beginPath();
    cx.ellipse(s.cx, s.cy, s.rx, s.ry, 0, 0, Math.PI * 2);
    cx.fill();
    clearCanvas = c;
  }

  function drawClearing() {
    if (!clearCanvas) return;
    ctx!.save();
    ctx!.globalCompositeOperation = 'destination-out';
    ctx!.drawImage(clearCanvas, 0, 0, W, H);
    ctx!.restore();
  }

  let visible = true;
  let raf = 0;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }, { threshold: 0 }).observe(hero!);
  }
  function frame(now: number) {
    if (!visible) { raf = 0; return; }
    raf = requestAnimationFrame(frame);
    ctx!.clearRect(0, 0, W, H);
    drawDots(now);
    drawClearing();
  }
  raf = requestAnimationFrame(frame);
}

function start() {
  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => void)
    | undefined;
  if (ric) ric(init, { timeout: 1000 });
  else setTimeout(init, 200);
}

if (document.readyState === 'complete') start();
else window.addEventListener('load', start, { once: true });
