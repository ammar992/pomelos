// GLSL shaders for the hero scene. Compiled by WebGL — no JS eval, CSP-safe.

export const fresnelVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vPos = position;
    gl_Position = projectionMatrix * mv;
  }
`;

export const globeFragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uRim;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
    vec3 col = mix(uBase, uRim, f * 0.9);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const glowVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Camera-facing halo: zero inside the globe, bright at the limb, exponential falloff outward. */
export const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uRadius;
  uniform float uHalfSize;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0 * uHalfSize;
    float outside = r - uRadius;
    float halo = exp(-max(outside, 0.0) * 3.2) * smoothstep(-0.06, 0.02, outside);
    float edge = 1.0 - smoothstep(uHalfSize * 0.85, uHalfSize, r);
    gl_FragColor = vec4(uColor, halo * edge * uStrength);
  }
`;

export const pointsVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uRadius;
  uniform vec3 uTaiwan;
  attribute float aRand;
  varying float vAlpha;
  varying float vScan;
  varying float vRand;
  varying float vTw;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    float facing = dot(n, normalize(-mv.xyz));
    float scanY = sin(uTime * 0.35) * uRadius;
    vScan = smoothstep(0.25, 0.0, abs(position.y - scanY)) * 0.6;
    vTw = smoothstep(0.2, 0.0, distance(position, uTaiwan));
    vRand = aRand;
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.5 + aRand * 6.2831);
    vAlpha = smoothstep(-0.15, 0.45, facing) * mix(twinkle, 1.0, vTw);
    float pulse = 1.0 + vTw * (0.6 + 0.4 * sin(uTime * 3.0));
    gl_PointSize = uSize * uPixelRatio * (1.0 + vScan * 0.6) * pulse * (9.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const pointsFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uScanColor;
  uniform vec3 uTaiwanColor;
  varying float vAlpha;
  varying float vScan;
  varying float vRand;
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    vec3 col = mix(uColorA, uColorB, step(0.8, vRand));
    col = mix(col, uScanColor, vScan);
    col = mix(col, uTaiwanColor, vTw);
    gl_FragColor = vec4(col, a * vAlpha * (0.85 + vScan + vTw * 1.5));
  }
`;

export const arcVertex = /* glsl */ `
  attribute float aT;
  attribute float aOffset;
  attribute float aSpeed;
  varying float vT;
  varying float vOffset;
  varying float vSpeed;
  void main() {
    vT = aT;
    vOffset = aOffset;
    vSpeed = aSpeed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const arcFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uHeadColor;
  varying float vT;
  varying float vOffset;
  varying float vSpeed;
  void main() {
    float head = fract(uTime * vSpeed + vOffset) * 1.4 - 0.2;
    float d = vT - head;
    float trail = smoothstep(-0.3, 0.0, d) * (1.0 - smoothstep(0.0, 0.015, d));
    float ends = smoothstep(0.0, 0.06, vT) * smoothstep(1.0, 0.94, vT);
    vec3 col = mix(uColor, uHeadColor, trail);
    gl_FragColor = vec4(col, (0.13 + trail * 1.1) * ends);
  }
`;

export const particlesVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aScale;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.3 + aScale * 10.0) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aScale * 26.0 * uPixelRatio / -mv.z;
    vAlpha = 0.25 + 0.55 * (0.5 + 0.5 * sin(uTime * 0.9 + aScale * 40.0));
    gl_Position = projectionMatrix * mv;
  }
`;

export const particlesFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vAlpha);
  }
`;
