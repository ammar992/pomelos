"use client";

import { useEffect, useRef, useState } from "react";
import type { ServiceSlug } from "@/config/site";
import { cn, pad2 } from "@/lib/utils";

type Item = { slug: ServiceSlug; title: string };

/** Scroll-spy index: sticky sidebar on desktop, horizontally scrollable chip bar on mobile. */
export function ServiceIndex({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState<ServiceSlug>(items[0]!.slug);
  const bar = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.slug)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id as ServiceSlug);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  // Keep the active chip visible in the mobile bar.
  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>(`[data-slug="${active}"]`);
    if (el && bar.current && bar.current.scrollWidth > bar.current.clientWidth) {
      bar.current.scrollTo({ left: el.offsetLeft - 16, behavior: "smooth" });
    }
  }, [active]);

  return (
    <nav aria-label={label}>
      <p className="mb-5 hidden font-label text-xs tracking-widest text-subtle uppercase lg:block">{label}</p>
      <ul
        ref={bar}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => {
          const on = item.slug === active;
          return (
            <li key={item.slug} data-slug={item.slug} className="shrink-0">
              <a
                href={`#${item.slug}`}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm whitespace-nowrap transition-all lg:rounded-xl lg:border-transparent lg:px-3",
                  on
                    ? "border-accent/40 bg-accent/10 text-fg lg:border-l-accent lg:bg-accent/[0.07]"
                    : "border-line text-muted hover:text-fg lg:hover:bg-white/[0.03]",
                )}
              >
                <span className={cn("font-label text-[0.68rem]", on ? "text-accent" : "text-subtle")}>{pad2(i + 1)}</span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
