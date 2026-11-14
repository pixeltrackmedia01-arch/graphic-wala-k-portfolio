import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { KNOWLEDGE } from "@/lib/knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  // honeypot: bots fill hidden "website" field. Pretend success without sending.
  if (typeof b.website === "string" && b.website.trim()) return NextResponse.json({ ok: true });

  const name = String(b.name ?? "").trim().slice(0, 100);
  const email = String(b.email ?? "").trim().slice(0, 200);
  const message = String(b.message ?? "").trim().slice(0, 2000);
  if (!name || !EMAIL_RE.test(email) || message.length < 5) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: false, configured: false, error: "not_configured" });

  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const to = process.env.CONTACT_TO_EMAIL || KNOWLEDGE.profile.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
  try {
    const res = await fetch(`${(process.env.RESEND_API_URL || "https://api.resend.com").replace(/\/$/, "")}/emails`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from, to: [to], reply_to: email,
        subject: `Portfolio message from ${name.replace(/[\r\n]/g, " ")}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>${esc(name)}</strong> &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
      }),
    });
    if (!res.ok) { console.error("contact upstream error", res.status); return NextResponse.json({ error: "upstream" }, { status: 502 }); }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
