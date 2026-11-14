import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { contactSchema, fieldErrors, type ContactResponse } from "@/lib/contact-schema";
import { env } from "@/lib/env";
import { isDuplicate, markSeen, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendContactEmail } from "@/lib/email";
import enMessages from "../../../../messages/en.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const DEDUPE_TTL_MS = 15 * 60 * 1000;

function json(body: ContactResponse, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function clientIp(req: NextRequest): string | undefined {
  if (env.trustCloudflareIp) {
    const cf = req.headers.get("cf-connecting-ip");
    if (cf) return cf.trim();
  }
  return req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

/** CSRF defence: only accept same-origin browser requests. */
function isSameOrigin(req: NextRequest): boolean {
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = req.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set<string>([req.nextUrl.host]);
  const forwardedHost = req.headers.get("x-forwarded-host");
  if (forwardedHost) allowed.add(forwardedHost);
  try {
    allowed.add(new URL(siteConfig.url).host);
  } catch {
    /* ignore */
  }
  return allowed.has(originHost);
}

async function readBody(req: NextRequest): Promise<string | null> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return null;
  if (!req.body) return null;

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF / origin + content type
    if (!isSameOrigin(req)) return json({ ok: false, error: "invalidRequest" }, 403);
    if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return json({ ok: false, error: "invalidRequest" }, 415);
    }

    // 2. Rate limiting (per IP and a global ceiling)
    const ip = clientIp(req);
    const perIp = rateLimit(`ip:${ip ?? "unknown"}`, 5, 10 * 60 * 1000);
    const global = rateLimit("global", 120, 60 * 60 * 1000);
    if (!perIp.ok || !global.ok) {
      return json({ ok: false, error: "rateLimited" }, 429, { "Retry-After": String(Math.max(perIp.retryAfter, global.retryAfter)) });
    }

    // 3. Size-limited body + safe JSON parse
    const raw = await readBody(req);
    if (raw === null) return json({ ok: false, error: "invalidRequest" }, 413);
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: "invalidRequest" }, 400);
    }

    // 4. Strict schema validation (unknown keys and non-string types are rejected,
    //    which also blocks operator-injection payloads such as {"$gt": ""}).
    const result = contactSchema.safeParse(payload);
    if (!result.success) {
      return json({ ok: false, error: "validation", fields: fieldErrors(result.error) }, 400);
    }
    const data = result.data;

    // 5. Honeypot: pretend success so bots learn nothing.
    if (data.website.length > 0) return json({ ok: true }, 200);

    // 6. Duplicate submission protection (same sender + same message, or replayed idempotency key)
    const idemHeader = req.headers.get("x-idempotency-key") ?? "";
    const idempotencyKey = /^[0-9a-f-]{36}$/i.test(idemHeader) ? idemHeader : randomUUID();
    const fingerprint = createHash("sha256")
      .update(`${data.email.toLowerCase()}\n${data.message.replace(/\s+/g, " ").toLowerCase()}`)
      .digest("hex");
    if (isDuplicate(`fp:${fingerprint}`, DEDUPE_TTL_MS) || isDuplicate(`id:${idempotencyKey}`, DEDUPE_TTL_MS)) {
      return json({ ok: true }, 200);
    }

    // 7. Bot verification (server-side, single-use token)
    const human = await verifyTurnstile(data.turnstileToken, ip, idempotencyKey);
    if (!human) return json({ ok: false, error: "turnstileFailed" }, 403);

    // 8. Deliver (plain text). Service label always in English for the internal inbox.
    const serviceLabel =
      data.service === "other" ? enMessages.contact.form.serviceOther : enMessages.services.items[data.service].title;
    const outcome = await sendContactEmail(data, serviceLabel, idempotencyKey);
    if (outcome === "failed") return json({ ok: false, error: "server" }, 502);

    markSeen(`fp:${fingerprint}`);
    markSeen(`id:${idempotencyKey}`);
    return json({ ok: true }, 200);
  } catch {
    // Never leak internals or stack traces.
    console.error("[contact] Unhandled error while processing submission");
    return json({ ok: false, error: "server" }, 500);
  }
}
