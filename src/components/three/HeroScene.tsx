"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Billboard, Float, PerformanceMonitor } from "@react-three/drei";
import landPoints from "./globe-points.json";
import { DESTINATIONS, SEA_LANES, TAIWAN, arcCurve, latLonToVec3, mulberry32, seaLaneCurve } from "./geo";
import {
  arcFragment,
  arcVertex,
  fresnelVertex,
  globeFragment,
  glowFragment,
  glowVertex,
  particlesFragment,
  particlesVertex,
  pointsFragment,
  pointsVertex,
} from "./shaders";

const R = 2;
// Palette follows the Pomelos lockup: brand red, warm gold, cream on deep navy.
const BRAND = new THREE.Color("#D81E27");
const GOLD = new THREE.Color("#F2C46D");
const CREAM = new THREE.Color("#FBF7EC");
const RED = new THREE.Color("#FF3B3B");
const TAIWAN_POS = latLonToVec3(TAIWAN.lat, TAIWAN.lon, R * 1.006);

export type SceneQuality = "high" | "low";
type TimeRef = React.RefObject<number>;

/* ───────────────────────── Globe ───────────────────────── */

function GlobeBody() {
  const uniforms = useMemo(
    () => ({ uBase: { value: new THREE.Color("#0b1630") }, uRim: { value: new THREE.Color("#2c4f86") } }),
    [],
  );
  return (
    <mesh>
      <sphereGeometry args={[R, 72, 72]} />
      <shaderMaterial vertexShader={fresnelVertex} fragmentShader={globeFragment} uniforms={uniforms} />
    </mesh>
  );
}

function Atmosphere() {
  const half = R * 1.7;
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#4a6fae") }, uRadius: { value: R }, uHalfSize: { value: half }, uStrength: { value: 0.55 } }),
    [half],
  );
  return (
    <Billboard>
      <mesh>
        <planeGeometry args={[half * 2, half * 2]} />
        <shaderMaterial
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Billboard>
  );
}

/** Land dots + an extra dense cluster shaped like Taiwan so the island reads clearly. */
function LandPoints({ time, pixelRatio }: { time: TimeRef; pixelRatio: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const data = landPoints as number[];
    const rng = mulberry32(7);
    const coords: Array<[number, number]> = [];
    for (let i = 0; i < data.length; i += 2) coords.push([data[i]!, data[i + 1]!]);
    // Taiwan: leaf-shaped ellipse (~1.9° × 0.75°) tilted NNE.
    const tilt = (-18 * Math.PI) / 180;
    for (let i = 0; i < 90; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng());
      const dy = Math.sin(a) * r * 1.85;
      const dx = Math.cos(a) * r * 0.72;
      coords.push([TAIWAN.lat + dy * Math.cos(tilt) - dx * Math.sin(tilt), TAIWAN.lon + dx * Math.cos(tilt) + dy * Math.sin(tilt)]);
    }
    const pos = new Float32Array(coords.length * 3);
    const rand = new Float32Array(coords.length);
    const v = new THREE.Vector3();
    coords.forEach(([lat, lon], i) => {
      latLonToVec3(lat, lon, R * 1.006, v);
      pos.set([v.x, v.y, v.z], i * 3);
      rand[i] = rng();
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 3.0 },
      uPixelRatio: { value: pixelRatio },
      uRadius: { value: R },
      uTaiwan: { value: TAIWAN_POS.clone() },
      uColorA: { value: new THREE.Color("#9fb0cf") },
      uColorB: { value: CREAM.clone() },
      uScanColor: { value: GOLD.clone() },
      uTaiwanColor: { value: RED.clone() },
    }),
    [pixelRatio],
  );

  useFrame(() => {
    if (mat.current) mat.current.uniforms.uTime!.value = time.current;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={pointsVertex}
        fragmentShader={pointsFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Trade routes: every arc starts in Taiwan. A bright head travels along each. */
function TradeRoutes({ time }: { time: TimeRef }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const SEG = 72;
    const positions: number[] = [];
    const ts: number[] = [];
    const offsets: number[] = [];
    const speeds: number[] = [];
    const rng = mulberry32(42);
    const a = latLonToVec3(TAIWAN.lat, TAIWAN.lon, R * 1.01);
    for (const d of DESTINATIONS) {
      const b = latLonToVec3(d.lat, d.lon, R * 1.01);
      const pts = arcCurve(a, b, R).getPoints(SEG);
      const offset = rng();
      const speed = 0.1 + rng() * 0.1;
      for (let i = 0; i < SEG; i++) {
        const p0 = pts[i]!;
        const p1 = pts[i + 1]!;
        positions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
        ts.push(i / SEG, (i + 1) / SEG);
        offsets.push(offset, offset);
        speeds.push(speed, speed);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
    g.setAttribute("aOffset", new THREE.Float32BufferAttribute(offsets, 1));
    g.setAttribute("aSpeed", new THREE.Float32BufferAttribute(speeds, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: BRAND.clone() }, uHeadColor: { value: GOLD.clone() } }),
    [],
  );
  useFrame(() => {
    if (mat.current) mat.current.uniforms.uTime!.value = time.current;
  });

  return (
    <lineSegments geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={arcVertex}
        fragmentShader={arcFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

function DestinationNodes({ time }: { time: TimeRef }) {
  const rings = useRef<Array<THREE.Mesh | null>>([]);
  const nodes = useMemo(
    () =>
      DESTINATIONS.map((d) => {
        const pos = latLonToVec3(d.lat, d.lon, R * 1.012);
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
        return { pos, quat };
      }),
    [],
  );
  useFrame(() => {
    rings.current.forEach((m, i) => {
      if (!m) return;
      const p = (time.current * 0.5 + i * 0.31) % 1;
      m.scale.setScalar(1 + p * 4);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.7;
    });
  });
  return (
    <group>
      {nodes.map((n, i) => (
        <group key={i} position={n.pos} quaternion={n.quat}>
          <mesh>
            <circleGeometry args={[0.028, 18]} />
            <meshBasicMaterial color={GOLD} toneMapped={false} />
          </mesh>
          <mesh ref={(el) => void (rings.current[i] = el)}>
            <ringGeometry args={[0.032, 0.038, 32]} />
            <meshBasicMaterial color={GOLD} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Taiwan beacon: red core, pulsing rings and a light beam. Also drives the DOM label. */
function TaiwanBeacon({ time, labelRef }: { time: TimeRef; labelRef: React.RefObject<HTMLDivElement | null> }) {
  const rings = useRef<Array<THREE.Mesh | null>>([]);
  const tip = useRef<THREE.Group>(null);
  const base = useRef<THREE.Group>(null);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), TAIWAN_POS.clone().normalize()), []);
  const world = useMemo(() => new THREE.Vector3(), []);
  const center = useMemo(() => new THREE.Vector3(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const toCam = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }) => {
    rings.current.forEach((m, i) => {
      if (!m) return;
      const p = (time.current * 0.45 + i / 3) % 1;
      m.scale.setScalar(1 + p * 6);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.85;
    });
    const el = labelRef.current;
    const globe = base.current?.parent?.parent;
    if (!el || !tip.current || !base.current || !globe) return;
    // Visible only while Taiwan faces the camera.
    base.current.getWorldPosition(world);
    globe.getWorldPosition(center);
    normal.subVectors(world, center).normalize();
    toCam.subVectors(camera.position, world).normalize();
    const facing = normal.dot(toCam);
    // Project the top of the beam to screen space and move the label there.
    tip.current.getWorldPosition(world);
    world.project(camera);
    const x = ((world.x + 1) / 2) * size.width;
    const y = ((1 - world.y) / 2) * size.height;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -120%)`;
    el.style.opacity = facing > 0.2 ? "1" : "0";
  });

  return (
    <group position={TAIWAN_POS} quaternion={quat}>
      <group ref={base} />
      <group ref={tip} position={[0, 0, 0.66]} />
      <mesh>
        <circleGeometry args={[0.05, 24]} />
        <meshBasicMaterial color={RED} toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => void (rings.current[i] = el)}>
          <ringGeometry args={[0.05, 0.058, 48]} />
          <meshBasicMaterial color={RED} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.02, 0.64, 10, 1, true]} />
        <meshBasicMaterial color={RED} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ───────────────────────── Shipping & products ───────────────────────── */

const CONTAINER_COLORS = ["#CB0505", "#1F3354", "#F2C46D", "#FBF7EC", "#8A1C22", "#3B5277"];

/** A tiny container ship: hull, bridge and stacked containers, oriented along +X. */
function Ship({ scale = 1 }: { scale?: number }) {
  const stacks = useMemo(() => {
    const rng = mulberry32(3);
    const out: Array<{ x: number; z: number; y: number; c: string }> = [];
    for (let x = -3; x <= 2; x++)
      for (let z = -1; z <= 1; z++)
        for (let y = 0; y < 1 + Math.floor(rng() * 2); y++)
          out.push({ x: x * 0.022, z: z * 0.017, y: 0.016 + y * 0.013, c: CONTAINER_COLORS[Math.floor(rng() * CONTAINER_COLORS.length)]! });
    return out;
  }, []);
  return (
    <group scale={scale}>
      <mesh position={[0, 0.004, 0]}>
        <boxGeometry args={[0.17, 0.016, 0.06]} />
        <meshStandardMaterial color="#1b2a44" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0.07, 0.024, 0]}>
        <boxGeometry args={[0.02, 0.03, 0.05]} />
        <meshStandardMaterial color="#f2efe4" roughness={0.5} />
      </mesh>
      {stacks.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]}>
          <boxGeometry args={[0.02, 0.012, 0.015]} />
          <meshStandardMaterial color={s.c} roughness={0.55} metalness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Ships({ time }: { time: TimeRef }) {
  const refs = useRef<Array<THREE.Group | null>>([]);
  const lanes = useMemo(() => SEA_LANES.map((w) => seaLaneCurve(w, R * 1.012)), []);
  const lines = useMemo(() => {
    return lanes.map((c) => {
      const g = new THREE.BufferGeometry().setFromPoints(c.getSpacedPoints(200));
      return new THREE.Line(g, new THREE.LineDashedMaterial({ color: GOLD, transparent: true, opacity: 0.4, dashSize: 0.025, gapSize: 0.025, depthWrite: false })).computeLineDistances();
    });
  }, [lanes]);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const m = useMemo(() => new THREE.Matrix4(), []);

  useFrame(() => {
    lanes.forEach((curve, i) => {
      const g = refs.current[i];
      if (!g) return;
      // Ping-pong along the lane: out to the destination and back to Taiwan.
      const raw = (time.current * 0.022 + i * 0.37) % 2;
      const t = raw < 1 ? raw : 2 - raw;
      const p = curve.getPointAt(t);
      curve.getTangentAt(t, tangent);
      if (raw >= 1) tangent.negate();
      up.copy(p).normalize();
      side.crossVectors(tangent, up).normalize();
      tangent.crossVectors(up, side).normalize();
      m.makeBasis(tangent, up, side);
      g.position.copy(p);
      g.quaternion.setFromRotationMatrix(m);
    });
  });

  return (
    <group>
      {lines.map((line, i) => (
        <primitive key={`lane-${i}`} object={line} />
      ))}
      {lanes.map((_, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)}>
          <Ship scale={1.25} />
        </group>
      ))}
    </group>
  );
}

function Gear() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.z += Math.min(d, 0.05) * 0.5;
  });
  return (
    <group ref={ref} rotation={[0.4, 0.6, 0]}>
      <mesh>
        <torusGeometry args={[0.14, 0.045, 12, 36]} />
        <meshStandardMaterial color="#9fb3cc" metalness={0.8} roughness={0.3} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.06, 0.05, 0.07]} />
            <meshStandardMaterial color="#9fb3cc" metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Floating cargo: containers and parcels orbiting slowly, plus a manufacturing gear. */
function FloatingCargo({ quality }: { quality: SceneQuality }) {
  const ring = useRef<THREE.Group>(null);
  const items = useMemo(() => {
    const rng = mulberry32(19);
    const n = quality === "high" ? 9 : 6;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rng() * 0.3;
      const r = R * (1.6 + rng() * 0.35);
      return {
        kind: i % 3 === 0 ? "parcel" : "container",
        pos: [Math.cos(a) * r, (rng() - 0.5) * 1.6, Math.sin(a) * r] as [number, number, number],
        rot: [rng() * 3, rng() * 3, rng() * 3] as [number, number, number],
        color: CONTAINER_COLORS[i % CONTAINER_COLORS.length]!,
        speed: 0.6 + rng() * 0.8,
      };
    });
  }, [quality]);

  useFrame((_, d) => {
    if (ring.current) ring.current.rotation.y += Math.min(d, 0.05) * 0.06;
  });

  return (
    <group ref={ring}>
      {items.map((it, i) => (
        <Float key={i} speed={it.speed} rotationIntensity={0.6} floatIntensity={0.5} position={it.pos}>
          <group rotation={it.rot}>
            {it.kind === "container" ? (
              <mesh>
                <boxGeometry args={[0.34, 0.14, 0.14]} />
                <meshStandardMaterial color={it.color} roughness={0.45} metalness={0.25} />
              </mesh>
            ) : (
              <group>
                <mesh>
                  <boxGeometry args={[0.16, 0.13, 0.16]} />
                  <meshStandardMaterial color="#c9965c" roughness={0.85} />
                </mesh>
                <mesh position={[0, 0.0655, 0]}>
                  <boxGeometry args={[0.035, 0.002, 0.162]} />
                  <meshStandardMaterial color="#e8d3a8" roughness={0.6} />
                </mesh>
              </group>
            )}
          </group>
        </Float>
      ))}
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.4} position={[R * 1.45, R * 0.95, -R * 0.4]}>
        <Gear />
      </Float>
    </group>
  );
}

function AirFreight({ time }: { time: TimeRef }) {
  const dot = useRef<THREE.Mesh>(null);
  const radius = R * 1.85;
  useFrame(() => {
    if (!dot.current) return;
    const a = time.current * 0.3;
    dot.current.position.set(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  });
  return (
    <group rotation={[1.2, 0.25, 0.35]}>
      <mesh>
        <torusGeometry args={[radius, 0.003, 6, 220]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.22} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={dot}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={GOLD} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Particles({ count, time, pixelRatio }: { count: number; time: TimeRef; pixelRatio: number }) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const rng = mulberry32(11);
    const pos = new Float32Array(count * 3);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 3.6 + rng() * 7;
      const th = rng() * Math.PI * 2;
      const ph = Math.acos(2 * rng() - 1);
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.7, r * Math.sin(ph) * Math.sin(th)], i * 3);
      scale[i] = 0.4 + rng() * 1.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uColor: { value: new THREE.Color("#d9deea") } }),
    [pixelRatio],
  );
  useFrame((_, delta) => {
    if (mat.current) mat.current.uniforms.uTime!.value = time.current;
    if (ref.current) ref.current.rotation.y += Math.min(delta, 0.05) * 0.012;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={particlesVertex}
        fragmentShader={particlesFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ───────────────────────── Rig: intro, pointer, scroll, layout ───────────────────────── */

/** Y-rotation that turns Taiwan to face the camera (+Z). */
const TAIWAN_FACING = -Math.atan2(TAIWAN_POS.x, TAIWAN_POS.z);

function Rig({ animate, quality, labelRef }: { animate: boolean; quality: SceneQuality; labelRef: React.RefObject<HTMLDivElement | null> }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const time = useRef(animate ? 0 : 6.5);
  const intro = useRef(animate ? 0 : 1);
  const pointer = useRef({ x: 0, y: 0 });
  const { size, gl } = useThree();
  const pixelRatio = gl.getPixelRatio();

  useEffect(() => {
    if (!animate) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [animate]);

  const aspect = size.width / size.height;
  const wide = aspect >= 1.05;
  const layout = wide
    ? { x: Math.min(2.5, 1.1 * aspect), y: 0.05, scale: 1, camZ: 9.4 }
    : { x: 0, y: -2.3, scale: aspect < 0.6 ? 0.82 : 0.95, camZ: 10.6 };

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (animate) {
      time.current += delta;
      intro.current = Math.min(1, intro.current + delta / 2.8);
    }
    const e = 1 - Math.pow(1 - intro.current, 4);
    const scroll = Math.min(1, window.scrollY / Math.max(window.innerHeight, 1));

    camera.position.z = THREE.MathUtils.lerp(17, layout.camZ, e) + scroll * 2.2;
    camera.position.y = THREE.MathUtils.lerp(2.5, 0, e);
    camera.lookAt(0, 0, 0);

    if (outer.current) {
      const g = outer.current;
      g.position.x = layout.x;
      g.position.y = layout.y + scroll * 1.2;
      g.scale.setScalar(layout.scale * THREE.MathUtils.lerp(0.75, 1, e));
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.42 + pointer.current.y * 0.14, 3, delta);
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.current.x * 0.3, 3, delta);
      g.rotation.z = -0.12;
    }
    if (spin.current) {
      // Intro: a sweeping turn that settles on Taiwan; afterwards a gentle sway keeps it in view.
      const introTurn = (1 - e) * Math.PI * 0.9;
      const sway = Math.sin(time.current * 0.12) * 0.35 + scroll * 0.8;
      spin.current.rotation.y = TAIWAN_FACING - 0.75 + introTurn + sway;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} color="#c9d6f0" />
      <directionalLight position={[5, 6, 6]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-6, -2, -4]} intensity={0.8} color="#ff8a7a" />
      <group ref={outer}>
        <group ref={spin}>
          <GlobeBody />
          <LandPoints time={time} pixelRatio={pixelRatio} />
          <TradeRoutes time={time} />
          <DestinationNodes time={time} />
          <Ships time={time} />
          <TaiwanBeacon time={time} labelRef={labelRef} />
        </group>
        <Atmosphere />
        <AirFreight time={time} />
        <FloatingCargo quality={quality} />
      </group>
      <Particles count={quality === "high" ? 600 : 240} time={time} pixelRatio={pixelRatio} />
    </>
  );
}

/* ───────────────────────── Canvas ───────────────────────── */

export default function HeroScene({
  animate,
  quality,
  active,
  taiwanLabel,
}: {
  animate: boolean;
  quality: SceneQuality;
  active: boolean;
  taiwanLabel: string;
}) {
  const [dprCap, setDprCap] = useState(quality === "high" ? 1.8 : 1.35);
  const labelRef = useRef<HTMLDivElement>(null);
  return (
    <div className="absolute inset-0">
      <Canvas
        aria-hidden
        dpr={[1, dprCap]}
        frameloop={!active ? "never" : animate ? "always" : "demand"}
        camera={{ position: [0, 0, 17], fov: 36, near: 0.1, far: 100 }}
        gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance", stencil: false }}
        style={{ pointerEvents: "none" }}
      >
        <PerformanceMonitor onDecline={() => setDprCap(1)} />
        <AdaptiveDpr pixelated={false} />
        <Rig animate={animate} quality={quality} labelRef={labelRef} />
      </Canvas>
      {/* Positioned every frame by TaiwanBeacon (screen-space projection). */}
      <div
        ref={labelRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 flex items-center gap-1.5 rounded-full border border-pomelo-bright/50 bg-ink-950/85 px-2.5 py-1 font-label text-[11px] font-bold tracking-[0.14em] whitespace-nowrap text-cream uppercase opacity-0 shadow-[0_0_20px_rgb(255_59_59/0.45)] transition-opacity duration-500 will-change-transform"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-pomelo-bright" />
        {taiwanLabel}
      </div>
    </div>
  );
}
