"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/content";
import { scrollToId, NAV_OFFSET } from "@/lib/scroll";

const POSE_FOR: Record<string, string> = { about: "think" };
const setPose = (id: string | null) => window.dispatchEvent(new CustomEvent("character-pose", { detail: id ? (POSE_FOR[id] ?? null) : null }));

export function Nav() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // sections that aren't in the nav highlight their closest parent item
    const map: Record<string, string> = { growth: "home", process: "skills", personal: "skills" };
    const ids = [...NAV.map((n) => n.id), ...Object.keys(map)];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(map[e.target.id] ?? e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // let the body scroll-lock release before scrolling
    requestAnimationFrame(() => {
      id === "home" ? scrollToId("home") : scrollToId(id, NAV_OFFSET);
      history.replaceState(null, "", `#${id}`);
    });
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled || open ? "bg-cream/85 backdrop-blur-md border-b border-clay/50" : "border-b border-transparent"}`}>
      <nav aria-label="Primary" className="wrap flex h-16 items-center justify-between">
        <a href="#home" onClick={go("home")} aria-label="Mital Chikhaliya — back to top" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-sm font-semibold text-cream transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:bg-terra">MC</span>
          <span className="hidden text-sm font-medium tracking-wide sm:block">Mital Chikhaliya</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={go(n.id)} aria-current={active === n.id ? "true" : undefined}
                onPointerEnter={(e) => e.pointerType === "mouse" && setPose(n.id)} onPointerLeave={() => setPose(null)} onFocus={() => setPose(n.id)} onBlur={() => setPose(null)}
                className={`relative rounded-full px-4 py-2 text-sm transition-colors ${active === n.id ? "text-ink" : "text-ink-soft hover:text-ink"}`}>
                {n.label}
                {active === n.id && <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded bg-terra" />}
              </a>
            </li>
          ))}
        </ul>

        <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-clay md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden bg-cream md:hidden">
            <ul className="wrap flex flex-col pt-6">
              {NAV.map((n, i) => (
                <motion.li key={n.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.05 }} className="border-b border-clay/60">
                  <a href={`#${n.id}`} onClick={go(n.id)} className="flex items-baseline justify-between py-5 font-display text-3xl">
                    <span className={active === n.id ? "text-terra" : ""}>{n.label}</span>
                    <span className="text-xs text-ink-soft">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
