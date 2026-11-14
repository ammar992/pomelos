import { getMessages, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pad2 } from "@/lib/utils";

/** Vertical timeline whose progress line draws as you scroll. */
export async function HowWeWork() {
  const t = await getTranslations("home.how");
  const { home } = await getMessages();

  return (
    <section aria-labelledby="how-title" className="section-y relative">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading id="how-title" index="05" eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          </div>
        </div>
        <ol className="relative lg:col-span-7">
          <div className="absolute top-2 bottom-2 left-[1.45rem] w-px bg-line" aria-hidden>
            <div className="h-full w-full bg-gradient-to-b from-pomelo-bright via-accent to-brand" data-draw />
          </div>
          {home.how.steps.map((step, i) => (
            <li key={step.title} data-reveal className="relative flex gap-6 pb-10 last:pb-0">
              <span className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line-strong bg-ink-950 font-label text-sm font-bold text-accent shadow-[0_0_30px_-8px_rgb(255_90_82/0.6)]">
                {pad2(i + 1)}
              </span>
              <div className="glass flex-1 rounded-[var(--radius-card)] p-6 transition-colors hover:border-accent/40">
                <h3 className="text-h3 font-medium">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
