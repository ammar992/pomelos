import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { serviceSlugs, siteConfig } from "@/config/site";
import { buildMetadata, localizedUrl } from "@/lib/metadata";
import { cn, pad2 } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { ServiceIndex } from "@/components/services/ServiceIndex";
import { serviceIcons, serviceImages } from "@/components/services/serviceIcons";
import { RevealImage } from "@/components/ui/RevealImage";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata({ params }: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "services");
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const { services, servicesPage } = await getMessages();
  const tc = await getTranslations("common");
  const labels = services.labels;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: serviceSlugs.map((slug, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: services.items[slug].title,
        description: services.items[slug].short,
        url: `${localizedUrl("/services", locale as Locale)}#${slug}`,
        provider: { "@type": "Organization", name: siteConfig.name },
        areaServed: "Worldwide",
      },
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <PageHero
        eyebrow={servicesPage.eyebrow}
        title={servicesPage.title}
        description={servicesPage.description}
        image={{ key: "harbour", alt: services.items["sales-support"].imageAlt }}
      />

      <div className="container-x relative border-t border-line pt-10 lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-20">
        <aside className="sticky top-[var(--header-h)] z-20 -mx-4 border-b border-line bg-ink-950/85 px-4 py-3 backdrop-blur-xl lg:top-32 lg:col-span-3 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <ServiceIndex label={servicesPage.indexLabel} items={serviceSlugs.map((slug) => ({ slug, title: services.items[slug].title }))} />
        </aside>

        <div className="lg:col-span-9">
          {serviceSlugs.map((slug, i) => {
            const s = services.items[slug];
            const Icon = serviceIcons[slug];
            const flip = i % 2 === 1;
            return (
              <section
                key={slug}
                id={slug}
                aria-labelledby={`${slug}-title`}
                className="scroll-mt-40 border-b border-line py-16 last:border-0 sm:py-24 lg:scroll-mt-28"
              >
                <div className="grid items-center gap-10 xl:grid-cols-2">
                  <div className={cn(flip && "xl:order-2")}>
                    <div data-reveal="fade" className="flex items-center gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-xl border border-accent/25 bg-accent/[0.07] text-accent">
                        <Icon aria-hidden className="h-5 w-5" />
                      </span>
                      <span className="font-label text-xs font-bold tracking-widest text-subtle">
                        {pad2(i + 1)} / {pad2(serviceSlugs.length)}
                      </span>
                    </div>
                    <h2 id={`${slug}-title`} data-reveal className="mt-6 text-h2 font-medium">
                      {s.title}
                    </h2>
                    <p data-reveal className="mt-4 text-lead text-fg/90">
                      {s.short}
                    </p>
                    <p data-reveal className="mt-5 leading-relaxed text-muted">
                      {s.description}
                    </p>
                  </div>
                  <div className="group">
                    <RevealImage
                      image={serviceImages[slug]}
                      alt={s.imageAlt}
                      parallax
                      sizes="(min-width: 1280px) 35vw, (min-width: 1024px) 70vw, 100vw"
                      className="aspect-[4/3] rounded-[var(--radius-panel)] border border-line"
                    />
                  </div>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  <div data-reveal className="rounded-[var(--radius-card)] border border-line bg-ink-900/60 p-6 sm:p-7">
                    <h3 className="font-label text-xs font-bold tracking-widest text-accent uppercase">{labels.benefits}</h3>
                    <ul className="mt-5 space-y-3">
                      {s.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 leading-relaxed text-fg/90">
                          <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div data-reveal className="rounded-[var(--radius-card)] border border-line bg-ink-900/60 p-6 sm:p-7">
                    <h3 className="font-label text-xs font-bold tracking-widest text-accent uppercase">{labels.how}</h3>
                    <ol className="mt-5 space-y-3">
                      {s.how.map((h, n) => (
                        <li key={h} className="flex items-start gap-3 leading-relaxed text-fg/90">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/20 font-label text-[0.65rem] font-bold text-accent">
                            {n + 1}
                          </span>
                          {h}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <Link data-reveal href={{ pathname: "/contact", query: { service: slug } }} className="btn btn-primary mt-8" data-magnetic>
                  {labels.cta}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </section>
            );
          })}
        </div>
      </div>

      <div className="pt-16 sm:pt-24">
        <CtaBand eyebrow={servicesPage.eyebrow} title={servicesPage.ctaTitle} description={servicesPage.ctaDescription} cta={tc("contactPomelos")} />
      </div>
    </>
  );
}
