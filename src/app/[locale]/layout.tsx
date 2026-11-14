import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { routing, type Locale } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { localizedUrl } from "@/lib/metadata";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { INTRO_COOKIE, Preloader } from "@/components/motion/Preloader";
import { JsonLd } from "@/components/seo/JsonLd";
import "../globals.css";

export const viewport: Viewport = {
  themeColor: "#0A1120",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
    description: t("home.description"),
    applicationName: siteConfig.name,
    formatDetection: { telephone: false, email: false, address: false },
    robots: { index: true, follow: true },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Show the intro animation only once per browser session (session cookie set client-side).
  const introSeen = (await cookies()).get(INTRO_COOKIE)?.value === "1";
  const messages = await getMessages();
  const t = await getTranslations("nav");
  const tMeta = await getTranslations("meta");

  // Only ship the namespaces client components actually need.
  const clientMessages = {
    nav: messages.nav,
    common: messages.common,
    loader: messages.loader,
    error: messages.error,
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    slogan: siteConfig.tagline,
    description: tMeta("siteTagline"),
    url: localizedUrl("/", locale),
    email: siteConfig.email,
    address: { "@type": "PostalAddress", addressCountry: "TW" },
    areaServed: "Worldwide",
    knowsLanguage: ["en", "zh-TW"],
  };

  return (
    <html lang={locale} className={`${fontVariables}${introSeen ? " intro-seen" : ""}`} suppressHydrationWarning>
      <body className="relative">
        <JsonLd data={organization} />
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-accent px-5 py-3 font-semibold text-ink-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          {introSeen ? null : <Preloader />}
          <SmoothScroll />
          <CustomCursor />
          <Header />
          <main id="main" tabIndex={-1} className="relative outline-none">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
