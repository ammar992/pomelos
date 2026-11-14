"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/Logo";

export const INTRO_COOKIE = "pml_intro";

/**
 * First-visit intro. Pure CSS animation so it plays before hydration and dismisses itself
 * even if JS fails. The server only renders it when the session cookie is absent (see the
 * locale layout), so repeat page loads in the same session skip it. Decorative (aria-hidden)
 * and it never blocks the page underneath from rendering, so it does not delay LCP.
 */
export function Preloader() {
  const t = useTranslations("loader");
  const steps = t.raw("steps") as string[];
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    // Session cookie (no Max-Age): forgotten when the browser closes.
    document.cookie = `${INTRO_COOKIE}=1; Path=/; SameSite=Lax${secure}`;
    const timer = window.setTimeout(() => setMounted(false), 1700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="preloader fixed inset-0 z-[100] grid place-items-center bg-ink-950" aria-hidden="true">
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="relative flex w-[min(20rem,80vw)] flex-col items-center">
        <div className="preloader-logo">
          <Logo size="lg" />
        </div>
        <p className="mt-8 font-label text-[0.7rem] font-semibold tracking-[0.2em] text-accent uppercase">{t("label")}</p>
        <div className="mt-4 h-px w-full overflow-hidden bg-line">
          <div className="preloader-bar h-full w-full origin-left bg-gradient-to-r from-brand to-accent" />
        </div>
        <ol className="mt-4 flex w-full justify-between font-label text-[0.68rem] text-muted">
          {steps.map((s, i) => (
            <li key={s} className="preloader-step flex items-center gap-1.5" style={{ animationDelay: `${0.1 + i * 0.2}s` }}>
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {s}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
