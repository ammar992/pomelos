import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

export type PageKey = "home" | "about" | "services" | "contact" | "privacy" | "terms" | "cookies";

export const pagePaths: Record<PageKey, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
};

/** Absolute URL for a path in a given locale (English unprefixed, others prefixed). */
export function localizedUrl(path: string, locale: Locale): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const suffix = path === "/" ? "" : path;
  return `${siteConfig.url}${prefix}${suffix}` || siteConfig.url;
}

const ogLocale: Record<Locale, string> = { en: "en_US", "zh-TW": "zh_TW" };

export async function buildMetadata(locale: Locale, page: PageKey): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t(`${page}.title`);
  const description = t(`${page}.description`);
  const path = pagePaths[page];
  const url = localizedUrl(path, locale);

  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, localizedUrl(path, l)]));
  languages["x-default"] = localizedUrl(path, defaultLocale);

  return {
    title: page === "home" ? { absolute: `${siteConfig.name} | ${title}` } : title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title: `${title} | ${siteConfig.name}`,
      description,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}
