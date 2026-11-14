import { getTranslations } from "next-intl/server";
import { ArrowDown, ArrowRight, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HeroVisual } from "@/components/hero/HeroVisual";

const d = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

export async function Hero() {
  const t = await getTranslations("hero");
  const tc = await getTranslations("common");
  const chips = t.raw("chips") as string[];

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[max(100svh,700px)] flex-col overflow-hidden">
      <div className="grid-bg grid-bg-animated absolute inset-0 -z-10" aria-hidden />
      <div className="absolute -top-40 -left-40 -z-10 h-[36rem] w-[36rem] rounded-full bg-[#1d3566]/40 blur-[140px]" aria-hidden />
      <div className="absolute top-1/3 right-[-10%] -z-10 h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[140px]" aria-hidden />

      <div className="absolute inset-0 -z-10">
        <HeroVisual label={t("sceneLabel")} taiwanLabel={t("taiwan")} />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(10_17_32/0.3)_0%,rgb(10_17_32/0.05)_45%,rgb(10_17_32/0.88)_100%)] lg:bg-[linear-gradient(90deg,rgb(10_17_32/0.92)_0%,rgb(10_17_32/0.45)_45%,transparent_70%)]"
        aria-hidden
      />

      <div className="container-x flex flex-1 flex-col pt-[calc(var(--header-h)+2.25rem)] pb-10 lg:justify-center lg:pt-[var(--header-h)]">
        <div className="max-w-[58rem]">
          <p
            className="hero-in fade-in-up inline-flex items-center gap-2.5 rounded-full border border-line bg-ink-950/50 py-1.5 pr-4 pl-2 font-label text-[0.72rem] font-semibold tracking-[0.08em] text-muted backdrop-blur-md"
            style={d(0)}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-pomelo/20">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-pomelo-bright" />
            </span>
            {t("badge")}
          </p>

          <p className="hero-in fade-in-up eyebrow mt-8" style={d(0.05)}>
            <span className="h-px w-6 bg-accent" aria-hidden />
            {t("eyebrow")}
          </p>

          <h1 id="hero-title" className="mt-5 text-[clamp(2.6rem,1.3rem+4.4vw,5.25rem)] leading-[1.02] font-medium tracking-[-0.035em]">
            <span className="line-mask">
              <span className="hero-in line-in" style={d(0.1)}>
                {t("titleLine1")}
              </span>
            </span>
            <span className="line-mask">
              <span className="hero-in line-in text-gradient" style={d(0.22)}>
                {t("titleLine2")}
              </span>
            </span>
          </h1>

          <p className="hero-in fade-in-up mt-7 max-w-xl text-lead text-muted" style={d(0.4)}>
            {t("description")}
          </p>

          <div className="hero-in fade-in-up mt-10 flex flex-col gap-3 sm:flex-row sm:items-center" style={d(0.55)}>
            <Link href="/services" className="btn btn-primary" data-magnetic>
              {tc("exploreServices")}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn btn-ghost" data-magnetic>
              <Mail aria-hidden className="h-4 w-4 text-accent" />
              {tc("contactPomelos")}
            </Link>
          </div>

          <ul className="hero-in fade-in-up mt-10 hidden flex-wrap gap-2 sm:flex" style={d(0.7)} aria-label={t("eyebrow")}>
            {chips.map((c) => (
              <li key={c} className="rounded-full border border-line bg-ink-950/40 px-3.5 py-1.5 text-xs text-muted backdrop-blur-md">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-x relative flex items-end justify-between pb-8">
        <a
          href="#intro"
          className="hero-in fade-in-up group hidden items-center gap-3 font-label text-xs font-semibold tracking-widest text-subtle uppercase sm:inline-flex"
          style={d(0.8)}
        >
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-scan bg-accent" />
          </span>
          {tc("scrollHint")}
          <ArrowDown aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>
    </section>
  );
}
