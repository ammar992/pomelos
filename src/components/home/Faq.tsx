import { getMessages, getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/seo/JsonLd";

export async function Faq() {
  const t = await getTranslations("home.faq");
  const { home } = await getMessages();
  const items = home.faq.items;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };

  return (
    <section aria-labelledby="faq-title" className="section-y relative">
      <JsonLd data={faqSchema} />
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading id="faq-title" index="11" eyebrow={t("eyebrow")} title={t("title")} />
        </div>
        <div className="lg:col-span-8">
          <Accordion items={items} />
        </div>
      </div>
    </section>
  );
}
