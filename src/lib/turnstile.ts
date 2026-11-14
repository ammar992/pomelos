import "server-only";
import { env } from "./env";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteverifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  action?: string;
};

/**
 * Server-side Cloudflare Turnstile verification. Tokens are single-use and expire after
 * 300s; we also bind them to the expected action and (in production) hostname.
 */
export async function verifyTurnstile(token: string, ip: string | undefined, idempotencyKey: string): Promise<boolean> {
  if (!env.turnstileSecretKey) {
    console.error("[turnstile] TURNSTILE_SECRET_KEY is not configured");
    return false;
  }

  const body = new URLSearchParams({ secret: env.turnstileSecretKey, response: token, idempotency_key: idempotencyKey });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as SiteverifyResponse;
    if (!data.success) return false;

    if (env.isProd) {
      if (data.action !== "contact") return false;
      if (env.turnstileHostnames.length && !env.turnstileHostnames.includes((data.hostname ?? "").toLowerCase())) return false;
    }
    return true;
  } catch {
    console.error("[turnstile] verification request failed");
    return false;
  }
}
