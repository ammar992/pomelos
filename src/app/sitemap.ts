import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/i18n/routing";
import { localizedUrl, pagePaths } from "@/lib/metadata";

// Multilingual sitemap: every URL lists its language alternates (hreflang) + x-default.
export default function sitemap(): MetadataRoute.Sitemap {
  const priorities: Record<string, number> = { "/": 1, "/services": 0.9, "/about": 0.8, "/contact": 0.8 };
  return Object.values(pagePaths).flatMap((path) =>
    locales.map((locale) => ({
      url: localizedUrl(path, locale),
      changeFrequency: "monthly" as const,
      priority: priorities[path] ?? 0.3,
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map((l) => [l, localizedUrl(path, l)])),
          "x-default": localizedUrl(path, defaultLocale),
        },
      },
    })),
  );
}
