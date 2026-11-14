import { getMessages, getTranslations } from "next-intl/server";
import { Boxes, MessageSquareText, Recycle, Scale, UserCheck, Workflow } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealImage } from "@/components/ui/RevealImage";
import { pad2 } from "@/lib/utils";

const icons = [UserCheck, Workflow, MessageSquareText, Scale, Recycle, Boxes];

export async function WhyUs() {
  const t = await getTranslations("home.why");
  const { home } = await getMessages();

  return (
    <section aria-labelledby="why-title" className="section-y relative overflow-hidden bg-ink-900/60">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" aria-hidden />
      <div className="container-x relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading id="why-title" index="04" eyebrow={t("eyebrow")} title={t("title")} />
            <RevealImage
              image="handshake"
              alt=""
              className="mt-10 hidden aspect-[4/5] rounded-[var(--radius-panel)] border border-line lg:block"
              sizes="30vw"
            />
          </div>
        </div>
        <ul className="grid gap-px self-start overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line sm:grid-cols-2 lg:col-span-8">
          {home.why.items.map((item, i) => {
            const Icon = icons[i] ?? UserCheck;
            return (
              <li key={item.title} data-reveal className="spotlight group relative bg-ink-950 p-7 transition-colors hover:bg-ink-900 sm:p-9">
                <div className="flex items-center justify-between">
                  <Icon aria-hidden className="h-6 w-6 text-accent transition-transform duration-500 group-hover:scale-110" />
                  <span className="font-label text-xs font-semibold text-subtle">{pad2(i + 1)}</span>
                </div>
                <h3 className="mt-8 text-h3 font-medium">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{item.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
