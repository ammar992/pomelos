import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { serviceSlugs } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { RevealImage } from "@/components/ui/RevealImage";
import { serviceIcons, serviceImages } from "@/components/services/serviceIcons";
import { cn, pad2 } from "@/lib/utils";

export async function ServicesGrid() {
  const t = await getTranslations("home.services");
  const ts = await getTranslations("services.items");
  const tc = await getTranslations("common");

  return (
    <section aria-labelledby="services-title" className="section-y relative">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="services-title" index="03" eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <Link data-reveal href="/services" className="btn btn-ghost self-start lg:self-auto">
            {tc("viewAllServices")}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serviceSlugs.map((slug, i) => {
            const Icon = serviceIcons[slug];
            const featured = i === 0 || i === 4;
            return (
              <li key={slug} data-reveal className={cn(featured && "lg:col-span-2")}>
                <TiltCard className="h-full" max={featured ? 4 : 6}>
                  <Link
                    href={`/services#${slug}`}
                    className="glass glow-border spotlight group relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-[var(--radius-card)]"
                  >
                    {featured && (
                      <div className="absolute inset-0 opacity-75 transition-opacity duration-700 group-hover:opacity-90" aria-hidden>
                        <RevealImage image={serviceImages[slug]} alt="" className="h-full w-full" sizes="(min-width: 1024px) 60vw, 100vw" />
                        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/55 to-ink-950/10" />
                      </div>
                    )}
                    <div className="relative flex flex-1 flex-col p-6 sm:p-8">
                      <div className="flex items-start justify-between">
                        <span className="grid h-12 w-12 place-items-center rounded-xl border border-accent/25 bg-ink-950/60 text-accent backdrop-blur transition-colors group-hover:bg-accent/15">
                          <Icon aria-hidden className="h-5 w-5" />
                        </span>
                        <span className="font-label text-xs font-semibold text-subtle">{pad2(i + 1)}</span>
                      </div>
                      <div className="mt-auto pt-12">
                        <h3 className={cn("font-medium text-fg", featured ? "max-w-md text-h3 sm:text-[1.85rem]" : "text-xl")}>{ts(`${slug}.title`)}</h3>
                        <p className={cn("mt-3 max-w-md leading-relaxed text-muted", !featured && "text-sm")}>{ts(`${slug}.short`)}</p>
                        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                          {tc("learnMore")}
                          <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
