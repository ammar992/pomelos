import landPoints from "@/components/three/globe-points.json";

/**
 * Pacific-centred equirectangular projection (centre longitude 150°E), so Taiwan sits
 * left of centre with Europe to the west and the Americas to the east — the natural
 * view for trade out of East Asia. Computed once on the server.
 */
export const MAP_W = 1000;
export const MAP_H = 400;
const CENTER_LON = 150;
const LAT_TOP = 78;
const LAT_BOTTOM = -58;

export function project(lat: number, lon: number): [number, number] {
  let l = lon - CENTER_LON;
  while (l < -180) l += 360;
  while (l > 180) l -= 360;
  const x = ((l + 180) / 360) * MAP_W;
  const y = ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * MAP_H;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

/** All land dots as a single path ("M x y h0" segments + round caps = dots). */
export const landPath: string = (() => {
  const data = landPoints as number[];
  const parts: string[] = [];
  for (let i = 0; i < data.length; i += 2) {
    const lat = data[i]!;
    const lon = data[i + 1]!;
    if (lat > LAT_TOP || lat < LAT_BOTTOM) continue;
    const [x, y] = project(lat, lon);
    parts.push(`M${x} ${y}h0`);
  }
  return parts.join("");
})();

export const TAIWAN_XY = project(23.7, 121);

/** Region anchors (illustrative), in the same order as messages home.global.regions. */
export const REGION_XY = [
  project(50, 10), // Europe
  project(40, -98), // North America
  project(25, 47), // Middle East
  project(8, 105), // Southeast Asia
  project(-26, 135), // Oceania
  project(-14, -58), // Latin America
];

/** Quadratic arc from Taiwan to a point, bowed upward. */
export function arcPath([x2, y2]: [number, number]): string {
  const [x1, y1] = TAIWAN_XY;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.max(40, Math.abs(x2 - x1) * 0.28);
  return `M${x1} ${y1} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2} ${y2}`;
}
