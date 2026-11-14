"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "@/i18n/navigation";
import { gsap, ScrollTrigger, isFinePointer, prefersReducedMotion } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Global motion controller:
 * 1. Lenis smooth scrolling on desktop pointers only (touch devices keep native momentum scroll).
 * 2. Batched scroll-reveal for every `[data-reveal]` element on the page, so server
 *    components can opt in with a data attribute instead of becoming client components.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  // Lenis + GSAP ticker integration (mount once).
  useEffect(() => {
    if (prefersReducedMotion() || !isFinePointer()) return;

    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { offset: -96 } });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("lenis:stop", stop);
    window.addEventListener("lenis:start", start);

    return () => {
      window.removeEventListener("lenis:stop", stop);
      window.removeEventListener("lenis:start", start);
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Reveal animations (re-run per route).
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    if (window.location.hash) {
      // Respect deep links like /services#cloud-security after the new page renders.
      const id = decodeURIComponent(window.location.hash.slice(1));
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    }

    if (prefersReducedMotion()) return;

    let ctx: gsap.Context | undefined;
    const raf = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        // Only animate content below the fold: anything already visible at load stays put
        // (no flash of hidden content, LCP unaffected).
        const fold = window.innerHeight * 0.92;
        const items = gsap.utils
          .toArray<HTMLElement>("[data-reveal]")
          .filter((el) => el.getBoundingClientRect().top > fold);
        items.forEach((el) => {
          const kind = el.dataset.reveal;
          if (kind === "clip") {
            gsap.set(el, { clipPath: "inset(18% 12% 18% 12% round 1.75rem)", opacity: 0.4, scale: 1.04 });
            return;
          }
          gsap.set(el, {
            opacity: 0,
            y: kind === "fade" ? 0 : kind === "scale" ? 0 : 32,
            scale: kind === "scale" ? 0.94 : 1,
            filter: kind === "blur" ? "blur(12px)" : "none",
          });
        });

        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              clipPath: "inset(0% 0% 0% 0% round 1.75rem)",
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.08,
              overwrite: true,
              clearProps: "filter,clipPath",
            }),
        });

        // Parallax layers: data-parallax="0.2" moves at 20% of scroll speed.
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const speed = Number(el.dataset.parallax) || 0.15;
          gsap.to(el, {
            yPercent: speed * -100,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });

        // Horizontal progress lines: data-draw scales from 0 → 1 as the section scrolls.
        gsap.utils.toArray<HTMLElement>("[data-draw]").forEach((el) => {
          gsap.fromTo(
            el,
            { scaleY: 0, scaleX: 1 },
            {
              scaleY: 1,
              ease: "none",
              transformOrigin: "top center",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top 70%", end: "bottom 60%", scrub: true },
            },
          );
        });
      });
      ScrollTrigger.refresh();
    });

    // Fonts can change layout; recalculate trigger positions once they're ready.
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
