import "server-only";
import { z } from "zod";

/**
 * Server-side environment, validated once at startup. Secrets are only ever read here
 * (never in client components, never prefixed with NEXT_PUBLIC_).
 */
const isProd = process.env.NODE_ENV === "production";

// Cloudflare's official always-pass TEST keys — used only outside production.
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
const TURNSTILE_TEST_SECRET = "1x0000000000000000000000000000000AA";

const schema = z.object({
  TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.string().min(3).optional(), // e.g. "Website <noreply@yourdomain.com>"
  /** Set to "true" only when the app is behind Cloudflare, so cf-connecting-ip can be trusted. */
  TRUST_CLOUDFLARE_IP: z.enum(["true", "false"]).optional(),
  /** Comma-separated hostnames Turnstile tokens must be issued for (production). */
  TURNSTILE_ALLOWED_HOSTNAMES: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Log variable NAMES only — never values.
  console.error("[env] Invalid environment variables:", parsed.error.issues.map((i) => i.path.join(".")).join(", "));
  throw new Error("Invalid environment configuration");
}
const raw = parsed.data;

export const env = {
  isProd,
  turnstileSiteKey: raw.TURNSTILE_SITE_KEY ?? (isProd ? undefined : TURNSTILE_TEST_SITE_KEY),
  turnstileSecretKey: raw.TURNSTILE_SECRET_KEY ?? (isProd ? undefined : TURNSTILE_TEST_SECRET),
  resendApiKey: raw.RESEND_API_KEY,
  contactTo: raw.CONTACT_TO_EMAIL,
  contactFrom: raw.CONTACT_FROM_EMAIL,
  trustCloudflareIp: raw.TRUST_CLOUDFLARE_IP === "true",
  turnstileHostnames: (raw.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
};
