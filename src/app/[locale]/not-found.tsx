import { getTranslations } from "next-intl/server";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tm = await getTranslations("meta.notFound");

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-[var(--header-h)]">
      <title>{tm("title")}</title>
      <meta name="robots" content="noindex" />
      <div className="grid-bg grid-bg-animated absolute inset-0 -z-10" aria-hidden />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <div className="absolute inset-0 rounded-full bg-brand/15 blur-[120px]" />
        <div className="absolute inset-[15%] animate-spin-slow rounded-full border border-dashed border-accent/20" />
        <div className="absolute inset-[32%] rounded-full border border-pomelo/30" />
      </div>
      <div className="container-x text-center">
        <p className="font-label text-sm tracking-[0.3em] text-pomelo-bright">{t("code")}</p>
        <p className="mt-6 font-display text-[clamp(6rem,22vw,14rem)] leading-none font-semibold tracking-tighter text-gradient" aria-hidden>
          {t("code")}
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl text-h2 font-medium">{t("title")}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lead text-muted">{t("description")}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            {t("home")}
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            <MessagesSquare aria-hidden className="h-4 w-4 text-accent" />
            {t("contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
