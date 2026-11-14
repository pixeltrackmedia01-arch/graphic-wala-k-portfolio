import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, knowledgeAsText } from "@/lib/knowledge";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 8;
const MAX_CHARS = 500;

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, configured: false, error: "not_configured" });

  if (!rateLimit(`chat:${clientIp(req)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const messages: Msg[] = raw
    .filter((m): m is Msg => !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0)
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const base = (process.env.ANTHROPIC_API_URL || "https://api.anthropic.com").replace(/\/$/, "");
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(`${base}/v1/messages`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 500, temperature: 0.2, system: SYSTEM_PROMPT + knowledgeAsText(), messages }),
    });
    if (!res.ok) {
      console.error("chat upstream error", res.status);
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const reply = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
    if (!reply) return NextResponse.json({ error: "upstream" }, { status: 502 });
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("chat request failed", (e as Error).name);
    return NextResponse.json({ error: (e as Error).name === "AbortError" ? "timeout" : "upstream" }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
