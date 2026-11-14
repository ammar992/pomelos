// Generates the land-dot dataset for the 3D hero globe.
// Source: Natural Earth (public domain) via the `world-atlas` package.
// Output: src/components/three/globe-points.json  → [lat, lon, lat, lon, ...] rounded to 0.1°.
// Run: npm run globe:generate
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import { geoContains } from "d3-geo";

const require = createRequire(import.meta.url);
const topology = JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(topology, topology.objects.land);

const SAMPLES = 26000; // Fibonacci sphere samples — evenly distributed points
const golden = Math.PI * (3 - Math.sqrt(5));
const out = [];

for (let i = 0; i < SAMPLES; i++) {
  const y = 1 - (i / (SAMPLES - 1)) * 2;
  const theta = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((((theta * 180) / Math.PI) % 360) + 540) % 360 - 180;
  if (lat < -60) continue; // skip Antarctica for a cleaner silhouette
  if (geoContains(land, [lon, lat])) {
    out.push(Math.round(lat * 10) / 10, Math.round(lon * 10) / 10);
  }
}

writeFileSync(new URL("../src/components/three/globe-points.json", import.meta.url), JSON.stringify(out));
console.log(`Wrote ${out.length / 2} land points`);
