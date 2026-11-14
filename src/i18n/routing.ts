import { defineRouting } from "next-intl/routing";

export const locales = ["en", "zh-TW"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Cookie that stores the visitor's explicit language choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English lives at `/`, Traditional Chinese at `/zh-TW/...`.
  localePrefix: "as-needed",
  // English is always the default. We do NOT auto-redirect based on the
  // Accept-Language header; only an explicit choice (cookie) is honoured — see src/proxy.ts.
  localeDetection: false,
  alternateLinks: false, // hreflang is emitted via page metadata instead
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
});

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
