import { getMessages, getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MAP_H, MAP_W, REGION_XY, TAIWAN_XY, arcPath, landPath } from "./worldMap";

export async function GlobalMap() {
  const t = await getTranslations("home.global");
  const { home } = await getMessages();
  const regions = home.global.regions;
  const [tx, ty] = TAIWAN_XY;

  return (
    <section aria-labelledby="global-title" className="section-y relative overflow-hidden">
      <div className="absolute top-1/2 left-1/3 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-brand/12 blur-[140px]" aria-hidden />
      <div className="container-x">
        <SectionHeading id="global-title" index="06" eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

        <figure data-reveal="fade" className="glass relative mt-14 overflow-hidden rounded-[var(--radius-panel)] p-3 sm:p-6">
          <div className="grid-bg absolute inset-0 opacity-50" aria-hidden />
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="relative h-auto w-full" role="img" aria-labelledby="global-map-title">
            <title id="global-map-title">{t("title")}</title>
            <defs>
              <linearGradient id="route" x1="0" x2="1">
                <stop offset="0" stopColor="#FF3B3B" />
                <stop offset="0.5" stopColor="#F2C46D" />
                <stop offset="1" stopColor="#FBF7EC" />
              </linearGradient>
              <radialGradient id="tw-glow">
                <stop offset="0" stopColor="#FF3B3B" stopOpacity="0.55" />
                <stop offset="1" stopColor="#FF3B3B" stopOpacity="0" />
              </radialGradient>
            </defs>

            <path d={landPath} stroke="rgb(174 182 198 / 0.3)" strokeWidth="3.2" strokeLinecap="round" fill="none" />

            {REGION_XY.map((xy, i) => (
              <g key={i}>
                <path d={arcPath(xy)} fill="none" stroke="rgb(242 196 109 / 0.16)" strokeWidth="1.2" />
                <path
                  d={arcPath(xy)}
                  fill="none"
                  stroke="url(#route)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  pathLength={1}
                  className="map-route"
                  style={{ animationDelay: `${i * 0.45}s` }}
                />
                <circle cx={xy[0]} cy={xy[1]} r="4" fill="#F2C46D" />
                <circle cx={xy[0]} cy={xy[1]} r="4" fill="none" stroke="#F2C46D" className="map-ping" style={{ animationDelay: `${i * 0.45}s` }} />
                <text
                  x={xy[0]}
                  y={xy[1] + 20}
                  textAnchor="middle"
                  className="fill-muted font-label text-[13px] font-semibold"
                >
                  {regions[i]}
                </text>
              </g>
            ))}

            <circle cx={tx} cy={ty} r="34" fill="url(#tw-glow)" />
            <circle cx={tx} cy={ty} r="6" fill="#FF3B3B" />
            <circle cx={tx} cy={ty} r="6" fill="none" stroke="#FF3B3B" strokeWidth="1.5" className="map-ping" />
            <g transform={`translate(${tx} ${ty - 22})`}>
              <rect x="-34" y="-13" width="68" height="22" rx="11" fill="#CB0505" stroke="#FBFAF2" strokeWidth="1.2" />
              <text textAnchor="middle" y="3" className="fill-cream font-label text-[11px] font-bold tracking-wider uppercase">
                {t("hub")}
              </text>
            </g>
          </svg>
          <figcaption className="relative mt-3 flex items-center gap-2 px-2 text-xs text-subtle">
            <Info aria-hidden className="h-3.5 w-3.5 shrink-0" />
            {t("note")}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
