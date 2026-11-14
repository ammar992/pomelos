import * as THREE from "three";

const DEG = Math.PI / 180;

export function latLonToVec3(lat: number, lon: number, radius: number, target = new THREE.Vector3()) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export const TAIWAN = { lat: 23.7, lon: 121.0 };

/**
 * Trade destinations connected to Taiwan. Purely illustrative world trade hubs —
 * not a claim about Pomelos clients or shipments.
 */
export const DESTINATIONS: Array<{ lat: number; lon: number }> = [
  { lat: 51.9, lon: 4.5 }, // Rotterdam
  { lat: 53.5, lon: 10.0 }, // Hamburg
  { lat: 33.7, lon: -118.3 }, // Los Angeles
  { lat: 40.7, lon: -74.0 }, // New York
  { lat: 49.3, lon: -123.1 }, // Vancouver
  { lat: 25.2, lon: 55.3 }, // Dubai
  { lat: 1.35, lon: 103.8 }, // Singapore
  { lat: -33.9, lon: 151.2 }, // Sydney
  { lat: 35.7, lon: 139.7 }, // Tokyo
  { lat: 19.0, lon: 72.8 }, // Mumbai
  { lat: -23.5, lon: -46.6 }, // São Paulo
  { lat: -26.2, lon: 28.0 }, // Johannesburg
];

/** Approximate ocean shipping lanes from Taiwan (waypoints over open water). */
export const SEA_LANES: Array<Array<[number, number]>> = [
  // Taiwan → North Pacific → US West Coast
  [[22.4, 121.5], [26, 132], [32, 150], [38, 172], [40, -165], [38, -145], [34.5, -125], [33.6, -118.6]],
  // Taiwan → South China Sea → Singapore → Indian Ocean → Red Sea
  [[22.0, 120.0], [17, 116.5], [10, 111], [4, 106], [1.4, 104.2], [5.5, 96], [6, 82], [10, 66], [12.5, 52], [12.6, 44]],
  // Taiwan → Australia
  [[21.5, 121.8], [12, 127], [2, 129], [-8, 132], [-20, 155], [-33.5, 152]],
];

/** Builds a raised cubic bezier between two points on a sphere. */
export function arcCurve(a: THREE.Vector3, b: THREE.Vector3, radius: number) {
  const dist = a.distanceTo(b);
  const lift = radius + dist * 0.38;
  const c1 = a.clone().lerp(b, 0.25).normalize().multiplyScalar(lift);
  const c2 = a.clone().lerp(b, 0.75).normalize().multiplyScalar(lift);
  return new THREE.CubicBezierCurve3(a, c1, c2, b);
}

/** Smooth path hugging the sphere surface through lat/lon waypoints. */
export function seaLaneCurve(waypoints: Array<[number, number]>, radius: number) {
  const pts = waypoints.map(([lat, lon]) => latLonToVec3(lat, lon, radius));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  // Re-project sampled points onto the sphere so the lane never cuts through land/globe.
  const sampled = curve.getSpacedPoints(240).map((p) => p.normalize().multiplyScalar(radius));
  return new THREE.CatmullRomCurve3(sampled, false, "centripetal");
}

/** Deterministic PRNG so geometry is identical between renders. */
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
