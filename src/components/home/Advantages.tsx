import { getMessages, getTranslations } from "next-intl/server";
import { Boxes, Gauge, MessageSquareText, Scale, ShieldCheck, Sprout } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";

const icons = [Scale, Gauge, MessageSquareText, ShieldCheck, Boxes, Sprout];

export async function Advantages() {
  const t = await getTranslations("home.advantages");
  const { home } = await getMessages();

  return (
    <section aria-labelledby="adv-title" className="section-y relative">
      <div className="container-x">
        <SectionHeading id="adv-title" index="10" eyebrow={t("eyebrow")} title={t("title")} align="center" />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {home.advantages.items.map((item, i) => {
            const Icon = icons[i] ?? Scale;
            return (
              <li key={item.title} data-reveal>
                <TiltCard className="h-full">
                  <div className="glass glow-border spotlight h-full rounded-[var(--radius-card)] p-7">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand/25 to-accent/10 ring-1 ring-accent/25">
                      <Icon aria-hidden className="h-5 w-5 text-accent" />
                    </span>
                    <h3 className="mt-6 text-xl font-medium">{item.title}</h3>
                    <p className="mt-2 leading-relaxed text-muted">{item.description}</p>
                  </div>
                </TiltCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
