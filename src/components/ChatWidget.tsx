"use client";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ExternalLink, Mail, MessageCircle, Phone, RotateCcw, Send, X } from "lucide-react";
import { KNOWLEDGE, QUICK_ANSWERS, SUGGESTIONS } from "@/lib/knowledge";

type Msg = { id: number; role: "user" | "assistant"; content: string; note?: string };
type Mode = "chat" | "contact";
type Sent = "idle" | "sending" | "sent" | "error" | "fallback";

const GREETING = "Hi! 👋 Welcome to Mital's portfolio.\nHave a question about my experience, skills or marketing projects? Feel free to ask me!";
const WA_NUMBER = "918141482284";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
  const [sent, setSent] = useState<Sent>("idle");
  const [formError, setFormError] = useState("");
  const idRef = useRef(1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (msgs.length || loading) logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => { logRef.current?.scrollTo({ top: 0 }); }, [open, mode]);
  useEffect(() => { if (open && mode === "chat") setTimeout(() => inputRef.current?.focus(), 250); }, [open, mode]);
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); launcherRef.current?.focus(); } };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const push = useCallback((m: Omit<Msg, "id">) => setMsgs((p) => [...p, { ...m, id: idRef.current++ }]), []);

  const ask = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const history = [...msgs.filter((m) => !m.note), { id: 0, role: "user" as const, content: q }].map(({ role, content }) => ({ role, content }));
    push({ role: "user", content: q });
    setInput("");
    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: history }), signal: ctrl.signal });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reply) push({ role: "assistant", content: data.reply });
      else if (data.error === "not_configured") {
        const quick = QUICK_ANSWERS[q];
        push(quick
          ? { role: "assistant", content: quick, note: "Quick answer from Mital's resume — the live AI assistant isn't connected yet." }
          : { role: "assistant", content: "The AI assistant isn't connected yet, so I can't answer free-form questions right now. Please pick one of the suggested questions, or use “Contact Mital” to reach her directly.", note: "AI service not configured" });
      } else if (data.error === "rate_limited") push({ role: "assistant", content: "You're sending questions a little fast — please wait a moment and try again.", note: "Rate limited" });
      else if (data.error === "timeout") push({ role: "assistant", content: "That took too long to answer. Please try again.", note: "Timed out" });
      else push({ role: "assistant", content: "Sorry, I couldn't get an answer just now. Please try again, or use “Contact Mital”.", note: "Service error" });
    } catch (e) {
      if ((e as Error).name !== "AbortError") push({ role: "assistant", content: "Network problem — please check your connection and try again.", note: "Network error" });
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }, [loading, msgs, push]);

  const clear = () => { abortRef.current?.abort(); setMsgs([]); setLoading(false); setInput(""); };

  const mailtoHref = () => {
    const body = `${form.message}\n\n— ${form.name}${form.email ? ` (${form.email})` : ""}`;
    return `mailto:${KNOWLEDGE.profile.email}?subject=${encodeURIComponent(`Portfolio enquiry from ${form.name || "a visitor"}`)}&body=${encodeURIComponent(body)}`;
  };
  const waHref = () => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi Mital, I'm ${form.name || "a visitor"} (from your portfolio).\n${form.message}`)}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSent("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) setSent("sent");
      else if (data.error === "not_configured") setSent("fallback");
      else if (data.error === "invalid") { setSent("error"); setFormError("Please enter your name, a valid email and a short message."); }
      else if (data.error === "rate_limited") { setSent("error"); setFormError("Too many messages — please try again in a few minutes."); }
      else { setSent("error"); setFormError("The message couldn't be sent. Please try again or use email / WhatsApp below."); }
    } catch { setSent("error"); setFormError("Network problem — your message was not sent."); }
  };

  const fieldCls = "w-full rounded-xl border border-clay bg-paper px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-ink-soft/60 focus:border-terra";

  return (
    <div className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog" aria-label="Resume assistant" aria-modal="false"
            initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: "bottom left" }}
            className="absolute bottom-16 left-0 flex h-[min(34rem,calc(100svh-7rem))] w-[min(23.5rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-clay bg-cream shadow-2xl shadow-brown/25"
          >
            <header className="flex items-center gap-2 border-b border-clay/70 bg-paper px-4 py-3">
              {mode === "contact" ? (
                <button type="button" onClick={() => { setMode("chat"); setSent("idle"); }} className="-ml-1 grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-sand hover:text-ink" aria-label="Back to resume assistant"><ArrowLeft size={18} /></button>
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-xs font-semibold text-cream">MC</span>
              )}
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold">{mode === "chat" ? "Resume Assistant" : "Contact Mital"}</p>
                <p className="truncate text-[0.7rem] text-ink-soft">{mode === "chat" ? "Answers from Mital's resume" : "Send a direct message"}</p>
              </div>
              {mode === "chat" && (
                <button type="button" onClick={clear} disabled={!msgs.length} className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-sand hover:text-ink disabled:opacity-30" aria-label="Clear conversation" title="Clear conversation"><RotateCcw size={16} /></button>
              )}
              <button type="button" onClick={() => { setOpen(false); launcherRef.current?.focus(); }} className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-sand hover:text-ink" aria-label="Close chat"><X size={18} /></button>
            </header>

            {mode === "chat" && (
              <div className="flex items-center justify-between gap-3 border-b border-clay/60 bg-sand/50 px-4 py-2">
                <p className="text-[0.72rem] leading-tight text-ink-soft">Prefer to talk to Mital directly?</p>
                <button type="button" onClick={() => { setMode("contact"); setSent("idle"); }} className="shrink-0 rounded-full bg-terra px-3.5 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-terra-deep">Contact Mital</button>
              </div>
            )}

            {mode === "chat" ? (
              <>
                <div ref={logRef} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  <Bubble role="assistant" content={GREETING} />
                  {!msgs.length && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} type="button" onClick={() => ask(s)} className="rounded-2xl border border-clay bg-paper px-3 py-2 text-left text-[0.8rem] leading-snug transition-all hover:-translate-y-0.5 hover:border-terra hover:text-terra-deep">{s}</button>
                      ))}
                    </div>
                  )}
                  {msgs.map((m) => <Bubble key={m.id} role={m.role} content={m.content} note={m.note} />)}
                  {loading && (
                    <div className="flex" aria-label="Assistant is typing" role="status">
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-clay/70 bg-paper px-4 py-3">
                        {[0, 1, 2].map((i) => <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-brown" style={{ animationDelay: `${i * 0.15}s` }} />)}
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex items-center gap-2 border-t border-clay/70 bg-paper p-3">
                  <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Ask about Mital's experience…" aria-label="Your question" className="min-w-0 flex-1 rounded-full border border-clay bg-cream px-4 py-2.5 text-sm outline-none placeholder:text-ink-soft/60 focus:border-terra" />
                  <button type="submit" disabled={!input.trim() || loading} aria-label="Send question" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-cream transition-colors hover:bg-terra disabled:opacity-40"><Send size={16} /></button>
                </form>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {sent === "sent" ? (
                  <div className="rounded-2xl border border-terra/40 bg-paper p-5 text-sm leading-relaxed" role="status">
                    <p className="font-semibold">Message sent ✓</p>
                    <p className="mt-1 text-ink-soft">Thanks, {form.name.split(" ")[0] || "there"} — Mital will reply to {form.email}.</p>
                    <button type="button" onClick={() => { setForm({ name: "", email: "", message: "", website: "" }); setSent("idle"); setMode("chat"); }} className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream hover:bg-terra">Back to assistant</button>
                  </div>
                ) : (
                  <form onSubmit={submit} className="space-y-3" noValidate>
                    <label className="block text-xs font-semibold text-ink-soft">Name
                      <input className={`${fieldCls} mt-1 font-normal`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} autoComplete="name" />
                    </label>
                    <label className="block text-xs font-semibold text-ink-soft">Email
                      <input type="email" className={`${fieldCls} mt-1 font-normal`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={200} autoComplete="email" />
                    </label>
                    <label className="block text-xs font-semibold text-ink-soft">Message
                      <textarea className={`${fieldCls} mt-1 min-h-28 resize-none font-normal`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={2000} />
                    </label>
                    <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                    {formError && <p className="text-xs font-medium text-terra-deep" role="alert">{formError}</p>}
                    <button type="submit" disabled={sent === "sending" || !form.name.trim() || !form.email.trim() || form.message.trim().length < 5} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-semibold text-cream transition-colors hover:bg-terra disabled:opacity-50">
                      <Send size={15} />{sent === "sending" ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                )}

                {(sent === "fallback" || sent === "error") && (
                  <div className="mt-4 rounded-2xl border border-clay bg-paper p-4 text-xs leading-relaxed" role="status">
                    <p className="font-semibold">{sent === "fallback" ? "Direct sending isn't set up yet — nothing has been sent." : "Prefer another way?"}</p>
                    <p className="mt-1 text-ink-soft">Your message is filled in below. It is only sent once you press send in your email app or WhatsApp.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={mailtoHref()} className="inline-flex items-center gap-1.5 rounded-full bg-terra px-3.5 py-2 font-semibold text-paper hover:bg-terra-deep"><Mail size={14} />Open email app</a>
                      <a href={waHref()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-ink/30 px-3.5 py-2 font-semibold hover:bg-sand"><MessageCircle size={14} />WhatsApp<ExternalLink size={12} /></a>
                    </div>
                  </div>
                )}

                <div className="mt-5 space-y-1.5 border-t border-clay/70 pt-4 text-xs text-ink-soft">
                  <a href={`mailto:${KNOWLEDGE.profile.email}`} className="flex items-center gap-2 hover:text-terra-deep"><Mail size={14} />{KNOWLEDGE.profile.email}</a>
                  <a href="tel:+918141482284" className="flex items-center gap-2 hover:text-terra-deep"><Phone size={14} />{KNOWLEDGE.profile.phone}</a>
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcherRef} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close resume assistant" : "Open resume assistant chat"}
        initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
        className="grid h-12 w-12 place-items-center rounded-full border border-clay bg-paper sm:h-14 sm:w-14 text-ink shadow-xl shadow-brown/25 transition-colors hover:bg-ink hover:text-cream"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  );
}

function Bubble({ role, content, note }: { role: "user" | "assistant"; content: string; note?: string }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-[0.86rem] leading-relaxed ${mine ? "rounded-br-md bg-ink text-cream" : "rounded-bl-md border border-clay/70 bg-paper"}`}>
        {content}
        {note && <p className="mt-1.5 border-t border-clay/60 pt-1.5 text-[0.68rem] italic text-ink-soft">{note}</p>}
      </div>
    </div>
  );
}
