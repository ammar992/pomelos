"use client";

import { useEffect, useRef, useState } from "react";

export type SceneQuality = "high" | "low";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

function detectQuality(): SceneQuality {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;
  const weak = (nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) <= 4;
  return coarse || small || weak ? "low" : "high";
}

/**
 * Decides if/when a WebGL scene should mount:
 * - only with WebGL and without Save-Data,
 * - after the browser is idle (keeps 3D off the critical path for LCP/INP),
 * - paused (frameloop "never") while off-screen,
 * - still frame when the user prefers reduced motion.
 */
export function useSceneGate() {
  const ref = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<{ animate: boolean; quality: SceneQuality } | null>(null);
  const [active, setActive] = useState(true);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (!hasWebGL() || nav.connection?.saveData) return;
    const go = () =>
      setConfig({
        animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        quality: detectQuality(),
      });
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(go, { timeout: 1200 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(go, 300);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(!!e?.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!config) return;
    const t = window.setTimeout(() => setShown(true), 120);
    return () => window.clearTimeout(t);
  }, [config]);

  return { ref, config, active, shown };
}
