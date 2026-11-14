import { getMessages, getTranslations } from "next-intl/server";
import { Factory, Headset, PackageSearch, Ship } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pad2 } from "@/lib/utils";

const icons = [PackageSearch, Factory, Ship, Headset];

/** The end-to-end chain as a horizontal flow with a travelling "shipment" pulse. */
export async function WhatWeDo() {
  const t = await getTranslations("home.whatWeDo");
  const { home } = await getMessages();

  return (
    <section aria-labelledby="what-title" className="section-y relative overflow-hidden bg-ink-900/60">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative">
        <SectionHeading id="what-title" index="02" eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

        <ol className="relative mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-9 right-[12%] left-[12%] hidden h-px overflow-hidden bg-line lg:block" aria-hidden>
            <div className="flow-pulse h-full w-1/4 bg-gradient-to-r from-transparent via-accent to-transparent" />
          </div>
          {home.whatWeDo.steps.map((step, i) => {
            const Icon = icons[i] ?? PackageSearch;
            return (
              <li key={step.title} data-reveal className="relative text-center">
                <div className="relative z-10 mx-auto grid h-[4.5rem] w-[4.5rem] place-items-center rounded-2xl border border-line-strong bg-ink-950 shadow-[0_0_40px_-10px_rgb(216_30_39/0.6)]">
                  <Icon aria-hidden className="h-7 w-7 text-accent" />
                  <span className="absolute -top-2 -right-2 rounded-full bg-ink-950 px-1.5 font-label text-[0.65rem] font-bold text-gold ring-1 ring-line">
                    {pad2(i + 1)}
                  </span>
                </div>
                <h3 className="mt-6 text-h3 font-medium">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-muted sm:text-base">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
