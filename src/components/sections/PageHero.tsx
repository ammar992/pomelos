import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/SectionHeading";
import type { ImageKey } from "@/config/images";
import { RevealImage } from "@/components/ui/RevealImage";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional photo shown beside the title. */
  image?: { key: ImageKey; alt: string };
  children?: ReactNode;
  compact?: boolean;
};

export function PageHero({ eyebrow, title, description, image, children, compact }: Props) {
  return (
    <section
      aria-labelledby="page-title"
      className={cn("relative isolate overflow-hidden pt-[calc(var(--header-h)+3.5rem)] sm:pt-[calc(var(--header-h)+5rem)]", compact ? "pb-12" : "pb-16 sm:pb-24")}
    >
      <div className="grid-bg grid-bg-animated absolute inset-0 -z-10" aria-hidden />
      <div className="absolute -top-48 left-1/4 -z-10 h-[32rem] w-[32rem] rounded-full bg-brand/15 blur-[140px]" aria-hidden data-parallax="0.3" />
      <div className="absolute top-10 right-0 -z-10 h-[26rem] w-[26rem] rounded-full bg-accent/10 blur-[130px]" aria-hidden />
      <div className="container-x grid items-center gap-10 lg:grid-cols-12">
        <div className={image ? "lg:col-span-7" : "lg:col-span-9"}>
          <div className="fade-in-up">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1 id="page-title" className="fade-in-up mt-6 text-h1 font-medium" style={{ animationDelay: "0.1s" }}>
            {title}
          </h1>
          <p className="fade-in-up mt-7 max-w-2xl text-lead text-muted" style={{ animationDelay: "0.25s" }}>
            {description}
          </p>
          {children}
        </div>
        {image && (
          <div className="lg:col-span-5">
            <RevealImage
              image={image.key}
              alt={image.alt}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="aspect-[4/3] rounded-[var(--radius-panel)] border border-line lg:aspect-[4/5]"
            />
          </div>
        )}
      </div>
    </section>
  );
}
