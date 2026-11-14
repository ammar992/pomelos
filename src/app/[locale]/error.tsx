"use client";

import { useTranslations } from "next-intl";
import { RefreshCcw } from "lucide-react";

// Route-level error boundary. Shows only the opaque digest — never error.message or a stack trace.
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  return (
    <section className="flex min-h-[80svh] items-center pt-[var(--header-h)]">
      <div className="container-x text-center">
        <p className="eyebrow justify-center">Error</p>
        <h1 className="mt-4 text-h2 font-medium">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-lg text-muted">{t("description")}</p>
        {error.digest ? <p className="mt-3 font-label text-xs text-subtle">{t("reference", { digest: error.digest })}</p> : null}
        <button type="button" onClick={reset} className="btn btn-primary mt-8">
          <RefreshCcw aria-hidden className="h-4 w-4" />
          {t("retry")}
        </button>
      </div>
    </section>
  );
}
