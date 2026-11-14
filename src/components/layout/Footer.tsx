import { getTranslations } from "next-intl/server";
import { ArrowUp, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { serviceSlugs, siteConfig } from "@/config/site";
import { images } from "@/config/images";
import { Logo } from "./Logo";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tServices = await getTranslations("services.items");
  const tCommon = await getTranslations("common");
  const year = new Date().getFullYear();

  const linkClass = "text-sm text-muted transition-colors hover:text-accent";
  const credits = Object.values(images);

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-950">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute -bottom-48 left-1/2 h-96 w-[60rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]"
        aria-hidden
      />

      <div className="container-x relative pt-20 pb-10">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-line pb-14 md:flex-row md:items-end">
          <div className="max-w-xl">
            <Logo size="md" />
            <p className="mt-6 text-lead text-muted">{t("tagline")}</p>
          </div>
          <Link href="/contact" className="btn btn-primary">
            {tCommon("contactPomelos")}
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-14 md:grid-cols-4 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <h2 className="mb-5 font-label text-xs tracking-widest text-subtle uppercase">{t("company")}</h2>
            <ul className="space-y-3">
              <li><Link className={linkClass} href="/">{tNav("home")}</Link></li>
              <li><Link className={linkClass} href="/about">{tNav("about")}</Link></li>
              <li><Link className={linkClass} href="/services">{tNav("services")}</Link></li>
              <li><Link className={linkClass} href="/contact">{tNav("contact")}</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-4">
            <h2 className="mb-5 font-label text-xs tracking-widest text-subtle uppercase">{t("servicesTitle")}</h2>
            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {serviceSlugs.map((slug) => (
                <li key={slug}>
                  <Link className={linkClass} href={`/services#${slug}`}>
                    {tServices(`${slug}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-5 font-label text-xs tracking-widest text-subtle uppercase">{t("legal")}</h2>
            <ul className="space-y-3">
              <li><Link className={linkClass} href="/privacy">{t("privacy")}</Link></li>
              <li><Link className={linkClass} href="/terms">{t("terms")}</Link></li>
              <li><Link className={linkClass} href="/cookies">{t("cookies")}</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-4">
            <h2 className="mb-5 font-label text-xs tracking-widest text-subtle uppercase">{t("contactTitle")}</h2>
            <ul className="space-y-4">
              <li>
                <a className={`${linkClass} inline-flex items-center gap-3 break-all`} href={`mailto:${siteConfig.email}`}>
                  <Mail aria-hidden className="h-4 w-4 shrink-0 text-accent" />
                  {siteConfig.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-sm text-muted">
                <MapPin aria-hidden className="h-4 w-4 shrink-0 text-accent" />
                {t("location")}
              </li>
            </ul>
          </div>
        </div>

        <p className="border-t border-line pt-6 text-[0.7rem] leading-relaxed text-subtle">
          {t("credits")}{" "}
          {credits.map((c, i) => (
            <span key={c.src}>
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-muted hover:underline">
                {c.credit}
              </a>
              {i < credits.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>

        <div className="mt-6 flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="text-xs text-subtle">{t("rights", { year: String(year) })}</p>
          <a href="#main" className="inline-flex items-center gap-2 text-xs text-muted transition-colors hover:text-accent">
            {t("backToTop")}
            <ArrowUp aria-hidden className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
