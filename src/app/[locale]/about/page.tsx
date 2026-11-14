import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Compass, Gem, Leaf, MessageSquareText, Quote, Scale, Sprout, UserCheck, Workflow } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { pad2 } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { RevealImage } from "@/components/ui/RevealImage";
import { CtaBand } from "@/components/sections/CtaBand";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "about");
}

const principleIcons = [UserCheck, Workflow, MessageSquareText, Scale];
const philosophyIcons = [Gem, Leaf, Compass];

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const { about, home } = await getMessages();
  const tc = await getTranslations("common");

  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={about.hero.title}
        description={about.hero.description}
        image={{ key: "taipei", alt: about.story.imageAlt }}
      />

      {/* Story: East meets West */}
      <section aria-labelledby="story-title" className="section-y relative border-t border-line">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading id="story-title" index="01" eyebrow={about.story.eyebrow} title={about.story.title} />
              <div data-reveal className="mt-10 flex items-center gap-4" aria-hidden>
                <span className="rounded-full border border-line bg-ink-900 px-4 py-2 font-label text-sm font-semibold">{about.story.east}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-pomelo-bright via-accent to-brand" />
                <span className="rounded-full border border-line bg-ink-900 px-4 py-2 font-label text-sm font-semibold">{about.story.west}</span>
              </div>
            </div>
          </div>
          <div className="space-y-6 lg:col-span-7">
            {about.story.paragraphs.map((p, i) => (
              <p key={i} data-reveal className={i === 0 ? "text-lead text-fg/90" : "text-lg leading-relaxed text-muted"}>
                {p}
              </p>
            ))}

            <figure data-reveal className="glass glow-border glow-border-always relative mt-10 rounded-[var(--radius-panel)] p-8 sm:p-10">
              <Quote aria-hidden className="h-8 w-8 text-pomelo-bright" />
              <blockquote className="mt-5 font-display text-xl leading-relaxed font-medium text-fg sm:text-2xl">“{about.story.quote}”</blockquote>
              <figcaption className="mt-6 font-label text-sm font-semibold text-muted">— {about.story.quoteCaption}</figcaption>
            </figure>

            <p data-reveal className="pt-4 font-display text-2xl font-medium text-gradient sm:text-3xl">
              {about.story.closing}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & vision — both quoted from the original About page */}
      <section aria-label={`${about.mission.title} / ${about.vision.title}`} className="relative pb-24">
        <div className="container-x grid gap-5 md:grid-cols-2">
          {[about.mission, about.vision].map((block, i) => {
            const Icon = i === 0 ? Gem : Sprout;
            return (
              <TiltCard key={block.title} max={4}>
                <div data-reveal className="glass glow-border spotlight h-full rounded-[var(--radius-panel)] p-8 sm:p-10">
                  <div className="flex items-center gap-3">
                    <Icon aria-hidden className="h-5 w-5 text-accent" />
                    <p className="font-label text-xs font-bold tracking-widest text-accent uppercase">{block.title}</p>
                  </div>
                  <p className="mt-6 font-display text-2xl leading-snug font-medium sm:text-[1.75rem]">{block.text}</p>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* Philosophy */}
      <section aria-labelledby="philosophy-title" className="section-y relative bg-ink-900/60">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="container-x relative grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading id="philosophy-title" index="02" eyebrow={about.philosophy.eyebrow} title={about.philosophy.title} />
            <ul className="mt-10 space-y-4">
              {about.philosophy.items.map((item, i) => {
                const Icon = philosophyIcons[i] ?? Gem;
                return (
                  <li key={item.title} data-reveal className="flex gap-5 rounded-[var(--radius-card)] border border-line bg-ink-950/70 p-6">
                    <Icon aria-hidden className="mt-1 h-6 w-6 shrink-0 text-accent" />
                    <div>
                      <h3 className="text-lg font-medium">{item.title}</h3>
                      <p className="mt-1.5 leading-relaxed text-muted">{item.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <RevealImage image="quality" alt="" parallax className="aspect-[4/5] rounded-[var(--radius-panel)] border border-line" />
        </div>
      </section>

      {/* Principles — the four statements from the original "About Pomelos..." */}
      <section aria-labelledby="principles-title" className="section-y relative">
        <div className="container-x">
          <SectionHeading id="principles-title" index="03" eyebrow={about.principles.eyebrow} title={about.principles.title} />
          <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-2">
            {about.principles.items.map((p, i) => {
              const Icon = principleIcons[i] ?? UserCheck;
              return (
                <li key={p.title} data-reveal className="spotlight group bg-ink-950 p-8 transition-colors hover:bg-ink-900 sm:p-10">
                  <div className="flex items-center justify-between">
                    <Icon aria-hidden className="h-6 w-6 text-accent transition-transform duration-500 group-hover:scale-110" />
                    <span className="font-label text-xs font-semibold text-subtle">{pad2(i + 1)}</span>
                  </div>
                  <h3 className="mt-7 text-h3 font-medium">{p.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{p.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Working with international clients */}
      <section aria-labelledby="clients-title" className="section-y relative bg-ink-900/60">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading id="clients-title" index="04" eyebrow={about.clients.eyebrow} title={about.clients.title} description={about.clients.description} />
          </div>
          <ol className="relative space-y-4 lg:col-span-7">
            {about.clients.steps.map((step, i) => (
              <li key={i} data-reveal className="glass flex items-start gap-5 rounded-[var(--radius-card)] p-6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/30 font-label text-xs font-bold text-accent">{pad2(i + 1)}</span>
                <p className="pt-1.5 leading-relaxed text-fg/90">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What can you expect from us? */}
      <section aria-labelledby="expect-title" className="section-y relative">
        <div className="container-x text-center">
          <p data-reveal className="eyebrow justify-center">{about.expect.eyebrow}</p>
          <h2 id="expect-title" data-reveal className="mx-auto mt-6 max-w-4xl text-h2 font-medium">
            {about.expect.title}
          </h2>
        </div>
      </section>

      <CtaBand eyebrow={home.cta.eyebrow} title={home.cta.title} description={home.cta.description} cta={tc("contactPomelos")} />
    </>
  );
}
