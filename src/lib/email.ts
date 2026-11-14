import "server-only";
import { env } from "./env";
import type { ContactData } from "./contact-schema";

/** Remove CR/LF so user input can never inject headers into a subject line. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 200);

/**
 * Sends the enquiry as PLAIN TEXT via the Resend HTTP API (no SMTP header handling,
 * no HTML → nothing for a mail client to render or execute).
 * Swap this function to use another provider; keep the plain-text approach.
 */
export async function sendContactEmail(data: ContactData, serviceLabel: string, idempotencyKey: string): Promise<"sent" | "logged" | "failed"> {
  const text = [
    `New consultation request (${data.locale})`,
    "",
    `Name:            ${data.name}`,
    `Email:           ${data.email}`,
    `Company:         ${data.company || "-"}`,
    `Country:         ${data.country}`,
    `Service:         ${serviceLabel}`,
    "",
    "Message:",
    data.message,
  ].join("\n");

  if (!env.resendApiKey || !env.contactTo || !env.contactFrom) {
    if (env.isProd) {
      console.error("[email] Email delivery is not configured (RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL)");
      return "failed";
    }
    // Development only: log a redacted summary instead of sending.
    console.info("[email:dev] Contact submission received", {
      service: data.service,
      locale: data.locale,
      messageLength: data.message.length,
    });
    return "logged";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: env.contactFrom,
        to: [env.contactTo],
        reply_to: data.email,
        subject: oneLine(`[pomelos.com.tw] ${serviceLabel} — ${data.company || data.name} (${data.country})`),
        text,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[email] Provider responded with status ${res.status}`);
      return "failed";
    }
    return "sent";
  } catch {
    console.error("[email] Provider request failed");
    return "failed";
  }
}
