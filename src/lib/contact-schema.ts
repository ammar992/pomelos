import { z } from "zod";
import { serviceSlugs } from "@/config/site";
import { locales } from "@/i18n/routing";

/**
 * Contact form schema — the SERVER is the authority (src/app/api/contact/route.ts).
 * The client runs the same schema only for instant feedback.
 * Error messages are translation keys under `contact.errors`.
 */

export const serviceOptions = [...serviceSlugs, "other"] as const;

// Disallow ASCII control characters (except tab/newline in the free-text message).
const NO_CONTROL_SINGLE = /^[^\u0000-\u001F\u007F]*$/;
const NO_CONTROL_MULTI = /^[^\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]*$/;

export const LIMITS = { name: 100, email: 254, company: 120, country: 80, message: 4000, messageMin: 20 } as const;

export const contactSchema = z
  .strictObject({
    name: z
      .string("nameRequired")
      .trim()
      .min(1, "nameRequired")
      .max(LIMITS.name, "nameTooLong")
      .regex(NO_CONTROL_SINGLE, "nameRequired"),
    email: z
      .string("emailInvalid")
      .trim()
      .max(LIMITS.email, "emailTooLong")
      .pipe(z.email("emailInvalid")),
    company: z
      .string("companyTooLong")
      .trim()
      .max(LIMITS.company, "companyTooLong")
      .regex(NO_CONTROL_SINGLE, "companyTooLong")
      .default(""),
    country: z
      .string("countryRequired")
      .trim()
      .min(2, "countryRequired")
      .max(LIMITS.country, "countryTooLong")
      .regex(NO_CONTROL_SINGLE, "countryRequired"),
    service: z.enum(serviceOptions, "serviceInvalid"),
    message: z
      .string("messageTooShort")
      .trim()
      .min(LIMITS.messageMin, "messageTooShort")
      .max(LIMITS.message, "messageTooLong")
      .regex(NO_CONTROL_MULTI, "messageTooLong"),
    consent: z.literal(true, "consentRequired"),
    /** Honeypot — must be empty. Checked separately so bots get a silent "success". */
    website: z.string().max(200).default(""),
    turnstileToken: z.string("turnstileRequired").min(1, "turnstileRequired").max(2048, "turnstileRequired"),
    locale: z.enum(locales),
  });

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

const ERROR_KEYS = new Set([
  "nameRequired", "nameTooLong", "emailInvalid", "emailTooLong", "companyTooLong", "countryRequired", "countryTooLong",
  "serviceInvalid", "messageTooShort", "messageTooLong", "consentRequired", "turnstileRequired",
]);
const FIELDS = new Set(["name", "email", "company", "country", "service", "message", "consent", "turnstileToken"]);

/**
 * Field → error key map from a ZodError (first issue per field). Only known field names and
 * translation keys are returned; anything else (unknown keys, tampered `locale`, …) collapses
 * to `form: "invalidRequest"` so no library-internal wording ever reaches the client.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (FIELDS.has(field) && ERROR_KEYS.has(issue.message)) {
      out[field] ??= issue.message;
    } else {
      out.form = "invalidRequest";
    }
  }
  return out;
}

/** Response contract shared by the API route and the client. */
export type ContactResponse =
  | { ok: true }
  | {
      ok: false;
      error: "validation" | "turnstileFailed" | "rateLimited" | "invalidRequest" | "server";
      fields?: Record<string, string>;
    };
