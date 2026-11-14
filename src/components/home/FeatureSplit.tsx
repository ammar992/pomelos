import { CheckCircle2 } from "lucide-react";
import type { ImageKey } from "@/config/images";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealImage } from "@/components/ui/RevealImage";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  image: ImageKey;
  imageAlt: string;
  reverse?: boolean;
  tinted?: boolean;
};

/** Editorial image + text block used for sourcing, shipping and after-sales. */
export function FeatureSplit({ id, index, eyebrow, title, body, points, image, imageAlt, reverse, tinted }: Props) {
  return (
    <section aria-labelledby={id} className={cn("section-y relative overflow-hidden", tinted && "bg-ink-900/60")}>
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className={cn("group relative", reverse && "lg:order-2")}>
          <RevealImage
            image={image}
            alt={imageAlt}
            parallax
            className="aspect-[4/3] rounded-[var(--radius-panel)] border border-line sm:aspect-[16/11]"
          />
          <div
            className={cn(
              "absolute -bottom-5 hidden h-24 w-24 rounded-[1.25rem] border border-line bg-ink-950/80 backdrop-blur-xl sm:grid sm:place-items-center",
              reverse ? "-left-5" : "-right-5",
            )}
            aria-hidden
          >
            <span className="font-display text-3xl font-semibold text-accent">{index}</span>
          </div>
        </div>
        <div>
          <SectionHeading id={id} eyebrow={eyebrow} title={title} />
          <p data-reveal className="mt-6 text-lead text-muted">
            {body}
          </p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} data-reveal className="flex items-center gap-3 text-fg/90">
                <CheckCircle2 aria-hidden className="h-5 w-5 shrink-0 text-gold" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
