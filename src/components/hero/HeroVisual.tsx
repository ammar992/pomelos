"use client";

import dynamic from "next/dynamic";
import { useSceneGate } from "@/components/three/useSceneGate";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

/** Lazy WebGL globe for the home hero, with a CSS fallback underneath. */
export function HeroVisual({ label, taiwanLabel }: { label: string; taiwanLabel: string }) {
  const { ref, config, active, shown } = useSceneGate();

  return (
    <div ref={ref} role="img" aria-label={label} className="absolute inset-0">
      {/* CSS fallback / loading state (also the experience without WebGL) */}
      <div
        className={`absolute top-[64%] left-1/2 aspect-square w-[min(115vw,40rem)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 lg:top-1/2 lg:left-[72%] lg:w-[min(50vw,44rem)] ${shown ? "opacity-0" : "opacity-100"}`}
        aria-hidden
      >
        <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_35%_35%,#24406e_0%,#0b1630_55%,transparent_72%)] shadow-[0_0_120px_20px_rgb(74_111_174/0.2)]" />
        <div className="absolute inset-[6%] animate-spin-slow rounded-full border border-dashed border-accent/15" />
        <div className="absolute top-[38%] left-[58%] h-3 w-3 rounded-full bg-pomelo-bright shadow-[0_0_24px_rgb(255_59_59/0.8)]" />
      </div>

      {config && (
        <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${shown ? "opacity-100" : "opacity-0"}`}>
          <HeroScene animate={config.animate} quality={config.quality} active={active} taiwanLabel={taiwanLabel} />
        </div>
      )}
    </div>
  );
}
