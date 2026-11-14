# Production Security Checklist

What the application already does, and what has to be configured at deployment.
None of this makes the site "completely secure". Commission an **independent penetration test** of the deployed site before launch and after major changes.

## 1. Implemented in the application

| Area | Control | Where |
|---|---|---|
| CSP | Per-request nonce, `'strict-dynamic'`, no `unsafe-inline`/`unsafe-eval` for scripts in production, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests` | `src/proxy.ts` |
| CSP trade-off | `style-src 'unsafe-inline'`, needed for runtime `style` attributes (Framer Motion, GSAP, R3F). No user input is rendered into styles | `src/proxy.ts` |
| Headers | HSTS (2y, preload), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`, COOP, CORP, no `X-Powered-By` | `next.config.ts` |
| HTTPS | 308 redirect when `x-forwarded-proto=http` (plus HSTS) | `src/proxy.ts` |
| XSS | React escaping only; **no `dangerouslySetInnerHTML` anywhere**; JSON-LD rendered as a text child with `<` escaped; no user content rendered as HTML; plain-text emails | `src/components/seo/JsonLd.tsx`, `src/lib/email.ts` |
| Open redirects | No redirect parameters exist. The locale redirect only re-prefixes the current path, and the cookie value is allow-listed | `src/proxy.ts` |
| Input validation | Zod `strictObject`: unknown keys rejected, types enforced (blocks NoSQL operator payloads such as `{"$gt":""}`), length limits, control-character filtering, enum allow-lists | `src/lib/contact-schema.ts` |
| Contact API | Same-origin check (`Origin` + `Sec-Fetch-Site`) = CSRF defence; `application/json` only; 16 KB body cap; per-IP + global rate limits; honeypot; duplicate/idempotency protection; server-side Turnstile verification (action + hostname bound); generic error codes; no stack traces | `src/app/api/contact/route.ts` |
| Secrets | Only read in `server-only` modules, validated at startup, never `NEXT_PUBLIC_` | `src/lib/env.ts` |
| Errors | Error boundaries show only the opaque digest; logs contain no PII | `src/app/**/error.tsx` |
| Cookies | Only `NEXT_LOCALE` (language, 1 year) and `pml_intro` (session-only intro flag), both `SameSite=Lax` and `Secure` on HTTPS. No auth or tracking cookies | `src/i18n/routing.ts`, `src/components/motion/Preloader.tsx` |
| Data minimisation | No analytics or trackers; the form only asks for what is needed to reply (no phone or address) | — |
| Disclosure | `/.well-known/security.txt` (RFC 9116) | `public/.well-known/security.txt` |

## 2. Configure before launch

### Environment
- [ ] Set every variable from `.env.example` in the hosting provider's secret store (never in git).
- [ ] `NEXT_PUBLIC_SITE_URL` = real production origin.
- [ ] Real Turnstile site and secret keys; `TURNSTILE_ALLOWED_HOSTNAMES` = production hostnames.
- [ ] Resend (or swap `src/lib/email.ts` to your provider) with a verified sending domain: SPF, DKIM and DMARC records.
- [ ] Confirm `src/config/site.ts` (email, URL) and renew `Expires` in `public/.well-known/security.txt`.
- [ ] Fill in the `[placeholders]` in the legal pages (hosting/email providers, retention period, jurisdiction, date) and have them reviewed.

### Cloudflare
- [ ] Proxy DNS through Cloudflare (orange cloud). SSL/TLS mode **Full (strict)**, minimum TLS 1.2, "Always Use HTTPS" on.
- [ ] Set `TRUST_CLOUDFLARE_IP=true` **only** if the origin is reachable exclusively via Cloudflare (lock the origin to Cloudflare IPs or use Cloudflare Tunnel / Authenticated Origin Pulls).
- [ ] WAF: enable Cloudflare Managed Ruleset + OWASP Core Ruleset.
- [ ] Rate-limiting rule: `POST /api/contact`, e.g. 5 requests / 10 min per IP → block. The in-app limiter is per-instance; this is the shared layer.
- [ ] Bot Fight Mode / Super Bot Fight Mode on; DDoS protection is on by default. Review the sensitivity.
- [ ] Do **not** enable features that inject inline scripts (Rocket Loader, email obfuscation, Zaraz). They would be blocked by the CSP.
- [ ] Submit the domain to the HSTS preload list only after confirming every subdomain serves HTTPS.

### Hosting
- [ ] Node.js 22 LTS runtime; production build (`npm run build && npm start` or platform equivalent).
- [ ] Restrict who can change environment variables and deploy (MFA on hosting, registrar, Cloudflare, GitHub).
- [ ] Enable GitHub branch protection on `main` (required CI, reviews), secret scanning and push protection.

## 3. Ongoing

- [ ] Dependabot PRs (weekly, `.github/dependabot.yml`) reviewed and merged promptly.
- [ ] CI runs `npm audit --omit=dev --audit-level=high` on every PR.
- [ ] Verify headers after each deploy: <https://securityheaders.com>, <https://observatory.mozilla.org>.
- [ ] Re-check CSP in the browser console after adding any third-party script.
- [ ] Rotate Turnstile/Resend keys if exposure is suspected; renew `security.txt` before `Expires`.
- [ ] Annual independent penetration test and after significant changes.

## 4. If authentication is added later
Use a vetted library (e.g. Auth.js), `HttpOnly; Secure; SameSite=Lax` session cookies with the `__Host-` prefix, server-side authorisation checks on every route handler and server action, MFA for admin users, and account-lockout/rate limits on login. Extend the CSRF origin check to all state-changing routes.
