"use client";

import { useEffect, useRef } from "react";
import { isFinePointer, prefersReducedMotion } from "@/lib/gsap";

const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, summary, [data-cursor]";

/**
 * Desktop-only cursor layer: a trailing glow ring that reacts to interactive elements,
 * plus "magnetic" pull for [data-magnetic] and pointer spotlight for `.spotlight` cards.
 * The native cursor is intentionally kept visible for usability and accessibility.
 */
export function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    const ringEl = ring.current;
    const glowEl = glow.current;
    if (!ringEl || !glowEl) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let gx = x;
    let gy = y;
    let raf = 0;
    let visible = false;
    let magnet: HTMLElement | null = null;

    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      gx += (x - gx) * 0.06;
      gy += (y - gy) * 0.06;
      ringEl.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      glowEl.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        ringEl.style.opacity = "1";
        glowEl.style.opacity = "1";
      }

      const target = e.target instanceof Element ? e.target : null;
      ringEl.dataset.hover = target?.closest(INTERACTIVE) ? "true" : "false";

      // Spotlight cards
      const card = target?.closest<HTMLElement>(".spotlight");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      // Magnetic elements
      const m = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) magnet.style.transform = "";
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        m.style.transform = `translate(${dx * 0.18}px, ${dy * 0.25}px)`;
      }
    };

    const onLeave = () => {
      visible = false;
      ringEl.style.opacity = "0";
      glowEl.style.opacity = "0";
      if (magnet) magnet.style.transform = "";
    };
    const onDown = () => (ringEl.dataset.down = "true");
    const onUp = () => (ringEl.dataset.down = "false");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden [@media(hover:hover)_and_(pointer:fine)]:block">
      <div
        ref={glow}
        className="absolute top-0 left-0 h-[420px] w-[420px] rounded-full opacity-0 transition-opacity duration-500"
        style={{ background: "radial-gradient(circle, rgb(0 229 255 / 0.07), transparent 65%)" }}
      />
      <div
        ref={ring}
        data-hover="false"
        className="absolute top-0 left-0 h-9 w-9 rounded-full border border-accent/50 opacity-0 transition-[width,height,opacity,background-color,border-color] duration-300 data-[down=true]:h-6 data-[down=true]:w-6 data-[hover=true]:h-14 data-[hover=true]:w-14 data-[hover=true]:border-accent data-[hover=true]:bg-accent/10"
      />
    </div>
  );
}
