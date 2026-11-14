import createIntlMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, defaultLocale, isLocale, routing } from "@/i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

const isDev = process.env.NODE_ENV !== "production";
const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

/**
 * Builds a strict, nonce-based Content-Security-Policy.
 * - Scripts: only those carrying this request's nonce (Next.js applies it to its own
 *   scripts automatically) plus anything they load ('strict-dynamic'). No 'unsafe-inline',
 *   no 'unsafe-eval' in production.
 * - Styles: 'unsafe-inline' is required for inline `style` attributes written by
 *   Framer Motion / GSAP / React Three Fiber at runtime. Style injection is far lower risk
 *   than script injection, and no user input is ever rendered into styles.
 */
function buildCsp(nonce: string): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      TURNSTILE_ORIGIN,
      ...(isDev ? ["'unsafe-eval'"] : []), // React Fast Refresh needs eval in development only
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", TURNSTILE_ORIGIN, ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-src": [TURNSTILE_ORIGIN],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "media-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const policy = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");

  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

function hasLocalePrefix(pathname: string): boolean {
  return routing.locales.some(
    (locale) => locale !== defaultLocale && (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)),
  );
}

export default function proxy(request: NextRequest) {
  // 1. HTTPS enforcement (most hosts/CDNs do this too; this is defence in depth).
  const isLocalHost = ["localhost", "127.0.0.1", "[::1]"].includes(request.nextUrl.hostname);
  if (!isDev && !isLocalHost && request.headers.get("x-forwarded-proto") === "http") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  // 2. Honour an explicit language choice stored in the cookie.
  //    English is the default; we never redirect based on Accept-Language.
  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  const isDocument = (request.headers.get("sec-fetch-dest") ?? "document") === "document";
  if (
    isDocument &&
    request.method === "GET" &&
    isLocale(preferred) &&
    preferred !== defaultLocale &&
    !hasLocalePrefix(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    // Path is taken from the incoming URL of *this* origin only — no open redirect possible.
    url.pathname = `/${preferred}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
    return NextResponse.redirect(url, 307);
  }

  // 3. Per-request CSP nonce.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads the CSP from the request to attach the nonce to its own scripts.
  requestHeaders.set("Content-Security-Policy", csp);

  const response = handleI18nRouting(new NextRequest(request, { headers: requestHeaders }));
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  // Run on all pages; skip API routes, Next internals and static files.
  matcher: ["/((?!api|_next|_vercel|.well-known|.*\\..*).*)"],
};
