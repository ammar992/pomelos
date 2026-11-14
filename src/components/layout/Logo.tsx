import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The Pomelos lockup, redrawn from the original website: a red pill (#CB0505) with a
 * cream outline ring, "Pomelos." over the "Sourcing & Sales" tagline.
 */
export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const s = {
    sm: { pill: "px-3.5 py-1", name: "text-[1.05rem]", tag: "text-[0.5rem]" },
    md: { pill: "px-4 py-1.5", name: "text-[1.2rem]", tag: "text-[0.56rem]" },
    lg: { pill: "px-6 py-2.5", name: "text-[1.9rem]", tag: "text-[0.8rem]" },
  }[size];
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center rounded-full bg-pomelo leading-none text-cream shadow-[0_6px_24px_-6px_rgb(203_5_5/0.6)] ring-2 ring-cream/90 ring-offset-2 ring-offset-ink-950",
        s.pill,
        className,
      )}
    >
      <span className={cn("font-display font-semibold tracking-[-0.01em]", s.name)}>{siteConfig.name}.</span>
      <span className={cn("mt-0.5 font-label font-bold tracking-[0.12em] uppercase", s.tag)}>{siteConfig.tagline}</span>
    </span>
  );
}

/** Compact mark (preloader / icons): the red pill with a "P." monogram. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-14 w-14 place-items-center rounded-full bg-pomelo font-display text-2xl font-semibold text-cream ring-2 ring-cream/90 ring-offset-2 ring-offset-ink-950",
        className,
      )}
    >
      P.
    </span>
  );
}
