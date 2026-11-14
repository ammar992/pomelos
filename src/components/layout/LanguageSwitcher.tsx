"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/routing";
import { Flag } from "@/components/icons/Flags";
import { cn } from "@/lib/utils";

/** Persist the explicit choice so it survives new visits (read by src/proxy.ts). */
export function rememberLocale(locale: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

const shortCode: Record<Locale, string> = { en: "EN", "zh-TW": "繁中" };

/** Dropdown variant for the desktop header. Links (not buttons) so it works without JS. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={`${t("languageSwitcher")}: ${t(`languages.${locale}`)}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 text-sm text-fg transition-colors hover:border-accent/50 hover:bg-accent/5"
      >
        <Flag locale={locale} />
        <span className="font-label text-xs tracking-wider">{shortCode[locale]}</span>
        <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 text-muted transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={menuId}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="glass absolute right-0 mt-2 w-48 origin-top-right overflow-hidden rounded-2xl p-1.5 shadow-2xl shadow-black/50"
          >
            {locales.map((l) => {
              const active = l === locale;
              return (
                <li key={l}>
                  <Link
                    href={pathname}
                    locale={l}
                    lang={l}
                    hrefLang={l}
                    aria-current={active ? "true" : undefined}
                    onClick={() => {
                      rememberLocale(l);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active ? "bg-accent/10 text-fg" : "text-muted hover:bg-white/5 hover:text-fg",
                    )}
                  >
                    <Flag locale={l} />
                    <span className="flex-1">{t(`languages.${l}`)}</span>
                    {active && <Check aria-hidden className="h-4 w-4 text-accent" />}
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Segmented variant for the mobile menu: both options always visible, large touch targets. */
export function LanguageToggle({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div role="group" aria-label={t("languageSwitcher")} className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white/[0.02] p-1.5">
      {locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={pathname}
            locale={l}
            lang={l}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              rememberLocale(l);
              onNavigate?.();
            }}
            className={cn(
              "flex min-h-12 items-center justify-center gap-2.5 rounded-xl text-sm font-medium transition-colors",
              active ? "bg-accent/12 text-fg ring-1 ring-accent/40" : "text-muted hover:text-fg",
            )}
          >
            <Flag locale={l} />
            {t(`languages.${l}`)}
          </Link>
        );
      })}
    </div>
  );
}
