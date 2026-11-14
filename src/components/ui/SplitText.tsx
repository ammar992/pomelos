"use client";

import { useEffect, useMemo, useRef, type ElementType } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  /** Pre-segmented words from the server (see lib/segment.ts). Falls back to splitting on spaces. */
  words?: string[];
  as?: ElementType;
  className?: string;
  /** Extra classes for each word wrapper (e.g. gradient text). */
  wordClassName?: string;
  delay?: number;
  id?: string;
};

/**
 * Scroll-triggered word-by-word heading reveal. Words are React-rendered spans (no DOM
 * mutation), the full sentence is exposed to assistive tech via aria-label.
 */
export function SplitText({ text, words: given, as: Tag = "h2", className, wordClassName, delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const words = useMemo(() => given ?? text.split(/(?<=\s)/), [given, text]);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    // Already visible at load (e.g. a page title): leave it as rendered, never flash it.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-word]");
    const ctx = gsap.context(() => {
      gsap.set(targets, { yPercent: 110, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () =>
          gsap.to(targets, {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.035,
            delay,
          }),
      });
    }, el);
    return () => ctx.revert();
  }, [words, delay]);

  return (
    <Tag ref={ref} id={id} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.1em] align-bottom -mb-[0.1em]">
          <span data-word className={cn("inline-block whitespace-pre-wrap", wordClassName)}>
            {w}
          </span>
        </span>
      ))}
    </Tag>
  );
}
