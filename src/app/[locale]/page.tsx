import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/metadata";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { WhyUs } from "@/components/home/WhyUs";
import { HowWeWork } from "@/components/home/HowWeWork";
import { GlobalMap } from "@/components/home/GlobalMap";
import { FeatureSplit } from "@/components/home/FeatureSplit";
import { Advantages } from "@/components/home/Advantages";
import { OpenApplication } from "@/components/home/OpenApplication";
import { Faq } from "@/components/home/Faq";
import { CtaBand } from "@/components/sections/CtaBand";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale as Locale, "home");
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  return (
    <>
      <Hero />
      <Intro />
      <WhatWeDo />
      <ServicesGrid />
      <WhyUs />
      <HowWeWork />
      <GlobalMap />
      <FeatureSplit
        id="sourcing-title"
        index="07"
        eyebrow={t("sourcing.eyebrow")}
        title={t("sourcing.title")}
        body={t("sourcing.body")}
        points={t.raw("sourcing.points") as string[]}
        image="factory"
        imageAlt={t("sourcing.imageAlt")}
        tinted
      />
      <FeatureSplit
        id="shipping-title"
        index="08"
        eyebrow={t("shipping.eyebrow")}
        title={t("shipping.title")}
        body={t("shipping.body")}
        points={t.raw("shipping.points") as string[]}
        image="shipping"
        imageAlt={t("shipping.imageAlt")}
        reverse
      />
      <FeatureSplit
        id="aftersales-title"
        index="09"
        eyebrow={t("afterSales.eyebrow")}
        title={t("afterSales.title")}
        body={t("afterSales.body")}
        points={t.raw("afterSales.points") as string[]}
        image="warehouse"
        imageAlt={t("afterSales.imageAlt")}
        tinted
      />
      <Advantages />
      <OpenApplication />
      <Faq />
      <div className="pt-8">
        <CtaBand eyebrow={t("cta.eyebrow")} title={t("cta.title")} description={t("cta.description")} cta={tc("contactPomelos")} />
      </div>
    </>
  );
}
