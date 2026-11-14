import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { serviceSlugs, siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/metadata";
import { serviceOptions } from "@/lib/contact-schema";
import { env } from "@/lib/env";
import { pad2 } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "contact");
}

type Service = (typeof serviceOptions)[number];
const isService = (v: unknown): v is Service => typeof v === "string" && (serviceOptions as readonly string[]).includes(v);

export default async function ContactPage({ params, searchParams }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const messages = await getMessages();
  const { contact, services } = messages;
  const t = await getTranslations("contact.aside");
  const tc = await getTranslations("common");

  // `?service=` pre-selects a service. Only allow-listed slugs are accepted.
  const requested = (await searchParams).service;
  const defaultService = isService(requested) ? requested : undefined;

  const serviceList = [
    ...serviceSlugs.map((slug) => ({ value: slug as Service, label: services.items[slug].title })),
    { value: "other" as Service, label: contact.form.serviceOther },
  ];

  return (
    <>
      <PageHero eyebrow={contact.hero.eyebrow} title={contact.hero.title} description={contact.hero.description} compact />

      <section className="relative pb-24 sm:pb-32">
        <div className="container-x grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="glass glow-border glow-border-always relative rounded-[var(--radius-panel)] p-6 sm:p-10 lg:col-span-8">
            {/* Only the contact namespace is sent to the client for the form. */}
            <NextIntlClientProvider messages={{ contact: messages.contact }}>
              <ContactForm siteKey={env.turnstileSiteKey ?? null} services={serviceList} defaultService={defaultService} />
            </NextIntlClientProvider>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:col-span-4">
            <div data-reveal className="relative overflow-hidden rounded-[var(--radius-panel)] border border-pomelo/40 bg-[linear-gradient(140deg,rgb(203_5_5/0.2),rgb(14_23_41/0.9)_60%)] p-7">
              <p className="font-label text-xs font-bold tracking-widest text-cream/80 uppercase">{tc("freeConsultation")}</p>
              <h2 className="mt-3 font-display text-xl font-medium">{t("emailTitle")}</h2>
              <p className="mt-1 text-sm text-muted">{t("emailText")}</p>
              <a href={`mailto:${siteConfig.email}`} className="mt-5 inline-flex items-center gap-2.5 font-medium break-all text-fg transition-colors hover:text-accent">
                <Mail aria-hidden className="h-4 w-4 shrink-0 text-pomelo-bright" />
                {siteConfig.email}
              </a>
            </div>

            <div data-reveal className="rounded-[var(--radius-panel)] border border-line bg-ink-900/70 p-7">
              <h2 className="font-display text-lg font-medium">{t("responseTitle")}</h2>
              <ol className="mt-5 space-y-4">
                {contact.aside.steps.map((s, i) => (
                  <li key={s} className="flex gap-4 text-sm leading-relaxed text-muted">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent/30 font-label text-[0.7rem] font-bold text-accent">
                      {pad2(i + 1)}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex items-center gap-2 border-t border-line pt-5 text-sm text-fg/90">
                <Clock aria-hidden className="h-4 w-4 text-gold" />
                {t("promise")}
              </p>
            </div>

            <p data-reveal className="px-2 text-xs leading-relaxed text-subtle">
              {t.rich("privacy", {
                link: (chunks) => (
                  <Link href="/privacy" className="text-accent underline underline-offset-4">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
