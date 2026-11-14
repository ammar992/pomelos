"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { cn, pad2 } from "@/lib/utils";
import { Logo } from "./Logo";
import { LanguageSwitcher, LanguageToggle } from "./LanguageSwitcher";

const navItems = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/contact", key: "contact" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Glass background after scrolling; hide on scroll down, reveal on scroll up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 320 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 320) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // Lock scroll + Escape to close while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("lenis:stop"));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.dispatchEvent(new CustomEvent("lenis:start"));
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden && !open && "-translate-y-full",
        )}
      >
        <div
          className={cn(
            "transition-[background-color,border-color,backdrop-filter] duration-500",
            scrolled || open
              ? "border-b border-line bg-ink-950/70 backdrop-blur-xl backdrop-saturate-150"
              : "border-b border-transparent",
          )}
        >
          <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-4">
            <Link href="/" className="relative z-10 rounded-lg" aria-label={`${siteConfig.name}, ${t("home")}`}>
              <Logo size="sm" />
            </Link>

            <nav aria-label={t("primary")} className="hidden lg:block">
              <ul className="flex items-center gap-1 rounded-full border border-line bg-white/[0.025] p-1 backdrop-blur-md">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.key} className="relative">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                          active ? "text-fg" : "text-muted hover:text-fg",
                        )}
                      >
                        {t(item.key)}
                      </Link>
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute inset-0 rounded-full border border-accent/25 bg-accent/[0.08]"
                          aria-hidden
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher className="hidden sm:block" />
              <Link href="/contact" className="btn btn-primary hidden !min-h-10 !px-4 !py-2 text-sm md:inline-flex">
                {t("cta")}
                <ArrowUpRight aria-hidden className="h-4 w-4" />
              </Link>
              <button
                ref={menuButton}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? t("closeMenu") : t("openMenu")}
                className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-white/[0.03] text-fg transition-colors hover:border-accent/50 lg:hidden"
              >
                {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("primary")}
            initial={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 2.5rem) 2.25rem)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "circle(150% at calc(100% - 2.5rem) 2.25rem)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "circle(0% at calc(100% - 2.5rem) 2.25rem)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink-950 pt-[var(--header-h)] lg:hidden"
            data-lenis-prevent
          >
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <div
              className="pointer-events-none absolute -top-40 right-[-30%] h-[28rem] w-[28rem] rounded-full bg-brand/20 blur-[120px]"
              aria-hidden
            />
            <nav aria-label={t("primary")} className="container-x relative flex flex-1 flex-col justify-between gap-10 py-8">
              <div>
                <p className="eyebrow mb-6">{t("menuEyebrow")}</p>
                <ul className="space-y-1">
                  {navItems.map((item, i) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <motion.li
                        key={item.key}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={() => setOpen(false)}
                          className="group flex items-baseline gap-4 border-b border-line py-4"
                        >
                          <span className="font-label text-xs text-subtle">{pad2(i + 1)}</span>
                          <span
                            className={cn(
                              "font-display text-[2.1rem] leading-none font-medium tracking-tight transition-colors sm:text-5xl",
                              active ? "text-accent" : "text-fg group-hover:text-accent",
                            )}
                          >
                            {t(item.key)}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-5"
              >
                <div>
                  <p className="mb-3 font-label text-xs tracking-widest text-subtle uppercase">{t("language")}</p>
                  <LanguageToggle onNavigate={() => setOpen(false)} />
                </div>
                <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                  {t("cta")}
                  <ArrowUpRight aria-hidden className="h-4 w-4" />
                </Link>
                <a href={`mailto:${siteConfig.email}`} className="block text-center text-sm text-muted">
                  {siteConfig.email}
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
