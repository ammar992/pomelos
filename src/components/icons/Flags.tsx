import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/*
 * Inline SVG flags. Emoji flags are not rendered on Windows (they show as "US"/"TW"
 * letters), so we draw them. All flags use a 3:2 viewBox.
 */

function starPoints(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    out.push(`${(cx + r * Math.cos(a)).toFixed(3)},${(cy + r * Math.sin(a)).toFixed(3)}`);
  }
  return out.join(" ");
}

const TW_SUN = starPoints(7.5, 5, 3.75, 2.05, 12);

function FlagTW() {
  return (
    <>
      <rect width="30" height="20" fill="#FE0000" />
      <rect width="15" height="10" fill="#000095" />
      <polygon points={TW_SUN} fill="#fff" />
      <circle cx="7.5" cy="5" r="2.125" fill="#000095" />
      <circle cx="7.5" cy="5" r="1.875" fill="#fff" />
    </>
  );
}

const US_STRIPE_H = 20 / 13;
const US_STARS: Array<[number, number]> = [];
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < (row % 2 === 0 ? 6 : 5); col++) {
    US_STARS.push([1.1 + col * 2.2 + (row % 2 === 0 ? 0 : 1.1), 1.2 + row * 2.05]);
  }
}

function FlagUS() {
  return (
    <>
      <rect width="30" height="20" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * US_STRIPE_H} width="30" height={US_STRIPE_H} fill="#B22234" />
      ))}
      <rect width="13" height={US_STRIPE_H * 7} fill="#3C3B6E" />
      {US_STARS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.42" fill="#fff" />
      ))}
    </>
  );
}

const flags: Record<Locale, () => React.JSX.Element> = {
  en: FlagUS,
  "zh-TW": FlagTW,
};

export function Flag({ locale, className }: { locale: Locale; className?: string }) {
  const Inner = flags[locale];
  return (
    <svg
      viewBox="0 0 30 20"
      aria-hidden="true"
      focusable="false"
      className={cn("h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[3px] ring-1 ring-white/20", className)}
    >
      <Inner />
    </svg>
  );
}
