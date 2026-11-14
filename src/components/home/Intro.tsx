import { getMessages, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Counter } from "@/components/ui/Counter";

export async function Intro() {
  const t = await getTranslations("home.intro");
  const { home } = await getMessages();

  return (
    <section id="intro" aria-labelledby="intro-title" className="section-y relative">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <SectionHeading id="intro-title" index="01" eyebrow={t("eyebrow")} title={t("title")} />
          <div className="mt-10 space-y-4">
            {home.intro.questions.map((q) => (
              <p
                key={q}
                data-reveal
                className="relative rounded-2xl border border-line bg-ink-900/60 py-5 pr-5 pl-12 text-lg leading-relaxed text-fg/90 before:absolute before:top-5 before:left-5 before:font-display before:text-xl before:text-accent before:content-['?']"
              >
                {q}
              </p>
            ))}
          </div>
          <p data-reveal className="mt-8 text-lead text-muted">
            {t("answer")}
          </p>
        </div>

        <div className="lg:col-span-5 lg:pt-24">
          <p data-reveal="fade" className="eyebrow mb-6">
            <span className="h-px w-6 bg-accent" aria-hidden />
            {home.stats.eyebrow}
          </p>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line">
            {home.stats.items.map((s) => (
              <div key={s.label} data-reveal="scale" className="spotlight flex flex-col justify-between gap-6 bg-ink-900 p-6 sm:p-8">
                <dt className="order-2 text-sm leading-snug text-muted">{s.label}</dt>
                <dd className="order-1 font-display text-5xl font-medium tracking-tight text-fg sm:text-6xl">
                  <Counter value={s.value} />
                  <span className="text-pomelo-bright">.</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
