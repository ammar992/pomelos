# Pomelos: Sourcing & Sales in Taiwan

The redesigned website for **Pomelos**, a Taiwan-based B2B sourcing and sales business. It helps business owners around the globe source quality products in Taiwan, from sourcing materials and manufacturing to final delivery and after-sales service.

All business content comes from the original site (pomelos.com.tw). It has been rewritten for clarity without changing its meaning. No clients, statistics, certifications, phone numbers or addresses were invented. The only contact channel is the original one: **Business@pomelos.com.tw**.

## Stack
Next.js 16 (App Router, Server Components) · React 19 · TypeScript · Tailwind CSS v4 · next-intl · Three.js + React Three Fiber + Drei · GSAP/ScrollTrigger · Framer Motion · Lenis · Lucide · Zod

## Getting started
```bash
cp .env.example .env.local   # optional in development
npm install
npm run dev                  # http://localhost:3000
```
In development, the contact form uses Cloudflare's always-pass Turnstile **test keys**. It logs a redacted summary instead of sending email.

| Script | Purpose |
|---|---|
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` · `npm run lint` | TypeScript and ESLint |
| `npm run i18n:check` | Fails if the `zh-TW` keys drift from `en` |
| `npm run globe:generate` | Rebuilds the land-dot data (Natural Earth, public domain) used by the globe and the world map |
| `npm run audit:prod` | `npm audit` for runtime dependencies |

## Structure
```
messages/                  en.json, zh-TW.json: ALL user-facing copy (type-checked keys)
src/config/site.ts         Brand, email, service list (single source of truth)
src/config/images.ts       Photography + Unsplash credits (shown in the footer)
src/proxy.ts               CSP nonce, HTTPS redirect, locale cookie redirect, i18n routing
src/app/[locale]/          Home, About, Services, Contact, Privacy, Terms, Cookies, 404
src/app/api/contact/       Contact form endpoint
src/components/three/      3D globe hero (Taiwan highlight, trade routes, ships, cargo)
src/components/home/       Homepage sections (incl. the SVG Taiwan-to-world route map)
src/components/motion/     Lenis + GSAP reveal controller, cursor, intro animation
src/lib/                   Zod schema, env validation, rate limiting, Turnstile, email
docs/SECURITY_CHECKLIST.md Production security checklist
```

## Brand
The original Pomelos lockup is kept: a red pill (`#CB0505`) with a cream outline, reading "Pomelos." over "Sourcing & Sales" (`src/components/layout/Logo.tsx`). It sits on a deep-navy and blue palette (tokens in `src/app/globals.css`). The fonts are Space Grotesk (headings), Inter (body) and Manrope (labels), plus Noto Sans TC for Chinese.

## Internationalisation
- English is the default at `/`; Traditional Chinese (Taiwan) is at `/zh-TW/...`. The language is never auto-detected from the browser.
- The header switcher (flags) keeps the current page and stores the choice in the `NEXT_LOCALE` cookie.
- Every page emits a localized title and description, Open Graph locale, canonical URL and `hreflang` alternates (+ `x-default`). `sitemap.xml` lists both languages.

## Images
The photos come from Unsplash (free for commercial use) and are credited in the footer. Replace them with Pomelos's own photos of real products, suppliers and shipments when available. Add new ones in `src/config/images.ts`.

## Security
See [`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md). Treat it as a baseline, not a guarantee: commission independent testing before launch.
