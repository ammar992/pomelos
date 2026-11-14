import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Mail } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Eyebrow } from "@/components/ui/SectionHeading";

/** The original site's "Open Application": anything not listed? Email us. */
export async function OpenApplication() {
  const t = await getTranslations("home.openApplication");
  const tc = await getTranslations("common");

  return (
    <section aria-labelledby="open-title" className="relative py-6">
      <div className="container-x">
        <div
          data-reveal="scale"
          className="relative isolate grid items-center gap-8 overflow-hidden rounded-[var(--radius-panel)] border border-pomelo/40 bg-[linear-gradient(120deg,rgb(203_5_5/0.22),rgb(10_17_32/0.6)_55%,rgb(216_30_39/0.18))] p-8 sm:p-12 lg:grid-cols-[1fr_auto]"
        >
          <div className="grid-bg absolute inset-0 -z-10 opacity-40" aria-hidden />
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 id="open-title" className="mt-4 text-h2 font-medium">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-2xl text-muted">{t("description")}</p>
          </div>
          <a href={`mailto:${siteConfig.email}`} className="btn btn-primary justify-self-start" data-magnetic>
            <Mail aria-hidden className="h-4 w-4" />
            {tc("emailUs")}
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
