let raf = 0;

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smoothly scrolls the window to a Y offset. Reliable at any distance, cancels if the user scrolls. */
export function scrollToY(target: number, maxDuration = 1400) {
  cancelAnimationFrame(raf);
  const max = document.documentElement.scrollHeight - innerHeight;
  const to = Math.max(0, Math.min(target, max));
  const from = scrollY;
  const dist = to - from;
  if (reduced() || Math.abs(dist) < 4) { scrollTo(0, to); return; }
  const duration = Math.min(maxDuration, 450 + Math.abs(dist) * 0.25);
  const start = performance.now();
  const cancel = () => { cancelAnimationFrame(raf); cleanup(); };
  const cleanup = () => {
    removeEventListener("wheel", cancel); removeEventListener("touchstart", cancel); removeEventListener("keydown", cancel);
  };
  addEventListener("wheel", cancel, { passive: true });
  addEventListener("touchstart", cancel, { passive: true });
  addEventListener("keydown", cancel);
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    scrollTo(0, from + dist * ease(t));
    if (t < 1) raf = requestAnimationFrame(step); else cleanup();
  };
  raf = requestAnimationFrame(step);
}

export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + scrollY - offset;
  scrollToY(y);
}

export const NAV_OFFSET = 64;
