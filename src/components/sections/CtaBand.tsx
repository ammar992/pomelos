import { ArrowRight, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import { segmentWords } from "@/lib/segment";
import { SplitText } from "@/components/ui/SplitText";
import { Eyebrow } from "@/components/ui/SectionHeading";

type Props = { eyebrow: string; title: string; description: string; cta: string };

/** Closing call-to-action band, reused across pages. */
export function CtaBand({ eyebrow, title, description, cta }: Props) {
  return (
    <section aria-labelledby="cta-title" className="relative pb-24 sm:pb-32">
      <div className="container-x">
        <div
          data-reveal="scale"
          className="glow-border glow-border-always relative isolate overflow-hidden rounded-[2rem] border border-line bg-ink-900 px-6 py-16 text-center sm:px-12 sm:py-24"
        >
          <div className="grid-bg grid-bg-animated absolute inset-0 -z-10 opacity-80" aria-hidden />
          <div className="absolute top-1/2 left-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2" aria-hidden>
            <div className="absolute inset-0 rounded-full bg-accent/12 blur-[110px]" />
            <div className="absolute inset-[18%] animate-spin-slow rounded-full border border-dashed border-accent/20" />
            <div className="absolute inset-[30%] animate-[spin_26s_linear_infinite_reverse] rounded-full border border-brand/25" />
            <div className="absolute inset-[42%] rounded-full border border-gold/20" />
          </div>
          <div className="flex justify-center">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <SplitText
            id="cta-title"
            text={title}
            words={segmentWords(title)}
            className="mx-auto mt-6 max-w-3xl text-h1 font-medium"
          />
          <p className="mx-auto mt-6 max-w-xl text-lead text-muted">{description}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="btn btn-primary" data-magnetic>
              {cta}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <a href={`mailto:${siteConfig.email}`} className="btn btn-ghost" data-magnetic>
              <Mail aria-hidden className="h-4 w-4 text-accent" />
              {siteConfig.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
