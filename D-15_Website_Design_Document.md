**VERTEX CONSULTING** | D-15 · Website Design Document — Confidential

# VERTEX CONSULTING

## D-15 · Website Design Document

### Design System · Component Library · Build Specification

Version 1.0 | April 2026 | Strumica, Macedonia

***CONFIDENTIAL — Internal use only***

*This document defines the complete design system, visual direction, component specifications, and build plan for the Vertex Consulting website. It is the single source of truth for all frontend development.*

---

# 1. Project Overview

| **Item** | **Value** |
|---|---|
| Company | Vertex Consulting (ВЕРТЕКС КОНСАЛТИНГ ДООЕЛ) |
| Domain | vertexconsulting.mk |
| Owner | Goran Dinov |
| Address | Str. Mladinska 43, Strumica, Macedonia |
| Phone | +389 70 214 033 |
| Primary email | info@vertexconsulting.mk |
| Marketing email | marketing@vertexconsulting.mk |
| Languages | English (primary) + Macedonian |
| Total pages | 16 (5 shared, 5 consulting, 5 marketing, 2 utility) |

## 1.1 — Two Divisions

| **Division** | **Manager** | **Team** | **Personality** |
|---|---|---|---|
| Vertex Consulting (Core) | Goran Dinov | Goran (lead) | Serious, premium, no-nonsense authority |
| Vertex Marketing (New) | Goran (oversight) | Lazar, Petar, Andrej | Creative, energetic, bold expression |

---

# 2. Technology Stack

| **Component** | **Tool** | **Notes** |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | TypeScript |
| Styling | Tailwind CSS | — |
| Component system | shadcn/ui + 21st.dev marketplace | Radix UI primitives |
| Animation | Motion (Framer Motion v12+) | Import from "motion/react" |
| CMS | Sanity.io | Free tier |
| Hosting | Vercel | Pro tier |
| Internationalization | next-intl | EN + MK |
| Email | Resend | Free tier |
| DNS / CDN | Cloudflare | Free |
| Analytics | Google Analytics 4 | Free |
| AI chat | Anthropic Claude API | Abstracted for Ollama migration |
| Notifications | Telegram Bot | Free |

## 2.1 — Full Dependency List

### Core framework
- `next@14`
- `react@18`
- `tailwindcss`
- `typescript`

### Design & animation
- `motion` (Framer Motion)
- `@radix-ui/*`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `lucide-react`

### Background effects
- `@react-three/fiber` (Silk component — homepage)
- `three` (Silk component — homepage)
- `ogl` (Plasma component — marketing)
- `gsap` (GridMotion component — consulting)

### CMS & content
- `next-sanity`
- `@sanity/image-url`
- `next-intl`

### Services
- `@anthropic-ai/sdk`
- `resend`

### Fonts (Google Fonts via next/font)
- Sora (headings)
- DM Sans (body)

---

# 3. Design System — Arctic & Amethyst

## 3.1 — Design Direction

| **Decision** | **Value** |
|---|---|
| Theme | Dark mode primary. Light mode planned as toggle (phase 2). |
| Palette name | Arctic & Amethyst (Option E) |
| Animation style | Punchy and energetic — snappy springs, bounce, snap into position |
| Visual texture | Rich and layered — gradients, glassmorphism, glows, subtle patterns |
| Typography vibe | Sharp and geometric — bold, angular, modern and authoritative |
| Division strategy | Same skeleton, different energy — Consulting is serious, Marketing is creative |

## 3.2 — Color System

### Consulting — Monochrome Grays

Consulting uses ONLY black, gray, and white. No color accents. Clean, sharp, premium.

| **Token** | **Hex** | **Usage** |
|---|---|---|
| bg | #141414 | Page background |
| surface | #1C1C1C | Surface / section backgrounds |
| card | #262626 | Card backgrounds |
| elevated | #333333 | Elevated surfaces, hover states |
| border | #404040 | Borders, dividers |
| 600 | #525252 | Subtle text, disabled states |
| 500 | #737373 | Muted text, labels |
| 400 | #A3A3A3 | Secondary text |
| 300 | #D4D4D4 | Body text on dark |
| 200 | #E5E5E5 | Emphasis text |
| 100 | #F5F5F5 | Primary text, headings |
| 50 | #FAFAFA | Bright white text |
| white | #FFFFFF | Buttons, strong emphasis |

### Marketing — Purple / Lavender

| **Token** | **Hex** | **Usage** |
|---|---|---|
| 900 | #1E1530 | Deep purple background |
| 700 | #553C8B | Dark purple |
| 500 | #9474D4 | Primary purple (warm) |
| 400 | #B490F0 | Bright lavender — main accent |
| 200 | #E0BBFF | Light lavender |
| 50 | #F3E8FF | Lightest purple |

### Shared Brand Blue

The bridge color that connects both divisions. Used on the homepage and shared pages.

| **Token** | **Hex** | **Usage** |
|---|---|---|
| 800 | #1E3A5F | Dark blue backgrounds |
| 600 | #2563EB | Strong blue |
| 400 | #60A5FA | Main brand blue — primary shared accent |
| 50 | #DBEAFE | Light blue backgrounds |

### Accent Colors

| **Name** | **Hex** | **Usage** |
|---|---|---|
| Gold | #D4A017 | Highlights, premium indicators |
| Terracotta | #E2725B | Warm accent, creative energy |
| Success | #10B981 | Success states, positive feedback |
| Error | #EF4444 | Error states, destructive actions |

## 3.3 — Typography

| **Level** | **Font** | **Size** | **Weight** | **Notes** |
|---|---|---|---|---|
| Display | Sora | 64–80px | 700 (Bold) | Hero headlines. Letter-spacing -0.02em |
| H1 | Sora | 48px | 700 (Bold) | Section titles |
| H2 | Sora | 36px | 600 (Semibold) | Sub-sections |
| H3 | Sora | 24px | 500 (Medium) | Card titles |
| Body | DM Sans | 16px | 400 (Regular) | Line-height 1.6 |
| Small | DM Sans | 14px | 400 (Regular) | Labels, captions, meta |
| Micro | DM Sans | 12px | 500 (Medium) | Badges, tags, overlines |

## 3.4 — Animation System

All animations use Motion (Framer Motion). Import from `"motion/react"`.

| **Name** | **Config** | **Usage** |
|---|---|---|
| Snap in | spring stiffness:300, damping:20 | Main scroll entrance animation |
| Stagger reveal | 0.08s stagger between children | Cards, list items, grid items |
| Hover pop | scale:1.03, spring 400/25 | Cards and buttons |
| Click squish | scale:0.97, 100ms | Buttons only |
| Slide up | y:30→0, 0.5s ease-out | Section content |
| Glow pulse | opacity 0.4–0.7, 3s loop | Accent elements (marketing only) |
| Consulting speed | 0.6s base duration | Measured, confident |
| Marketing speed | 0.4s base duration | Snappy, energetic |
| Reduced motion | MotionConfig reducedMotion="user" | Wraps entire app |

## 3.5 — Visual Effects

| **Effect** | **Where** | **Notes** |
|---|---|---|
| Glassmorphism cards | Navbar, cards, chat widget | backdrop-blur, semi-transparent bg, white border 8% opacity |
| Gradient mesh | Marketing pages only | Radial gradients using purple as background atmosphere |
| Glow accents | Marketing hover states | Colored box-shadow on hover — lavender glow |
| Noise grain | Hero sections | Subtle SVG noise overlay, adds texture to dark surfaces |
| Gradient text | Hero headlines only | Marketing: lavender→purple. Consulting: white→gray. Sparingly. |
| Animated borders | Marketing cards on hover | Rotating conic gradient border shimmer |

## 3.6 — Division Personalities

| **Trait** | **Consulting** | **Marketing** |
|---|---|---|
| Feeling | Authoritative, precise, calm confidence | Creative, energetic, bold expression |
| Colors | Black, grays, white only | Lavender, amethyst, purple on dark |
| Backgrounds | Dark gray (#141414) | Deep purple-black (#0F0B18) |
| Cards | Dark gray (#1C1C1C) with subtle gray border | Glass with purple border glow |
| Buttons | White on black, or black on white | Purple gradient or solid lavender |
| Glow effects | None — clean and sharp | Lavender radial glow, purple accents |
| Text accents | White for emphasis, gray for body | Lavender/purple for emphasis |
| Hover states | Subtle gray shift, crisp and minimal | Glow, scale, color shift — playful |
| Animation speed | Slower (0.6s) — measured, confident | Faster (0.4s) — snappy, energetic |
| Icons | White line icons, thin stroke | Filled or duotone, purple tinted |
| Overall vibe | Like a luxury law firm's site | Like a creative agency portfolio |

---

# 4. Three Sites, Three Background Effects

Each major section of the website uses a distinct animated background component to establish its identity. All three are mouse-interactive and respect reduced-motion preferences.

| **Section** | **Component** | **Library** | **Color** | **Personality** |
|---|---|---|---|---|
| Homepage (/) | Silk | @react-three/fiber + three | #7B7481 (purple-gray blend) | Flowing fabric — bridges both divisions |
| Consulting (/consulting/*) | GridMotion | gsap | gradientColor: #141414, gray cards | Structured tilted grid — precise, organized |
| Marketing (/marketing/*) | Plasma | ogl | #9474D4 (amethyst), opacity 0.7 | Organic glowing waves — creative, expressive |

### Integration rules:
- Each background renders behind hero content with `position: absolute` and `z-index: 0`
- Text and content layers sit on top with `z-index: 1+`
- On mobile, Plasma and GridMotion reduce DPR to 1 for performance
- Silk canvas is lazy-loaded (dynamic import with `ssr: false`)
- All three wrapped in `@media (prefers-reduced-motion: no-preference)` — static fallback otherwise

---

# 5. Background Component Source Code

## 5.1 — Silk Component (Homepage)

**File:** `src/components/backgrounds/Silk.tsx`
**Dependencies:** `@react-three/fiber`, `three`

```tsx
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Color } from 'three';

const hexToNormalizedRGB = hex => {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255
  ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

const SilkPlane = forwardRef(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);

  useFrame((_, delta) => {
    ref.current.material.uniforms.uTime.value += 0.1 * delta;
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});
SilkPlane.displayName = 'SilkPlane';

const Silk = ({ speed = 5, scale = 1, color = '#7B7481', noiseIntensity = 1.5, rotation = 0 }) => {
  const meshRef = useRef();

  const uniforms = useMemo(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 }
    }),
    [speed, scale, noiseIntensity, color, rotation]
  );

  return (
    <Canvas dpr={[1, 2]} frameloop="always">
      <SilkPlane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  );
};

export default Silk;
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| speed | number | 5 | Animation speed |
| scale | number | 1 | Scale of the silk pattern |
| color | string | '#7B7481' | Hex color for the silk |
| noiseIntensity | number | 1.5 | Intensity of noise effect |
| rotation | number | 0 | Rotation in radians |

**Vertex Consulting usage:**
```tsx
<Silk color="#7B7481" speed={5} scale={1} noiseIntensity={1.5} rotation={0} />
```

---

## 5.2 — Plasma Component (Marketing)

**File:** `src/components/backgrounds/Plasma.tsx`
**CSS File:** `src/components/backgrounds/Plasma.css`
**Dependencies:** `ogl`

```tsx
import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Plasma.css';

const hexToRgb = hex => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

export const Plasma = ({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true
}) => {
  const containerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const containerEl = containerRef.current;

    const useCustomColor = color ? 1.0 : 0.0;
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];

    const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerRef.current.appendChild(canvas);

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: useCustomColor },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const handleMouseMove = e => {
      if (!mouseInteractive) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current.x = e.clientX - rect.left;
      mousePos.current.y = e.clientY - rect.top;
      const mouseUniform = program.uniforms.uMouse.value;
      mouseUniform[0] = mousePos.current.x;
      mouseUniform[1] = mousePos.current.y;
    };

    if (mouseInteractive) {
      containerEl.addEventListener('mousemove', handleMouseMove);
    }

    const setSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height);
      const res = program.uniforms.iResolution.value;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(containerEl);
    setSize();

    let raf = 0;
    const t0 = performance.now();
    const loop = t => {
      let timeValue = (t - t0) * 0.001;
      if (direction === 'pingpong') {
        const pingpongDuration = 10;
        const segmentTime = timeValue % pingpongDuration;
        const isForward = Math.floor(timeValue / pingpongDuration) % 2 === 0;
        const u = segmentTime / pingpongDuration;
        const smooth = u * u * (3 - 2 * u);
        const pingpongTime = isForward ? smooth * pingpongDuration : (1 - smooth) * pingpongDuration;
        program.uniforms.uDirection.value = 1.0;
        program.uniforms.iTime.value = pingpongTime;
      } else {
        program.uniforms.iTime.value = timeValue;
      }
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (mouseInteractive && containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove);
      }
      try {
        containerEl?.removeChild(canvas);
      } catch {
        console.warn('Canvas already removed from container');
      }
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive]);

  return <div ref={containerRef} className="plasma-container" />;
};

export default Plasma;
```

**Plasma CSS:**
```css
.plasma-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| color | string | undefined | Hex color to tint the plasma |
| speed | number | 1.0 | Animation speed multiplier |
| direction | string | 'forward' | 'forward', 'reverse', or 'pingpong' |
| scale | number | 1.0 | Zoom level |
| opacity | number | 1.0 | Overall opacity (0–1) |
| mouseInteractive | boolean | false | Respond to mouse movement |

**Vertex Marketing usage:**
```tsx
<Plasma color="#9474D4" speed={0.6} direction="forward" scale={1.1} opacity={0.7} mouseInteractive={true} />
```

---

## 5.3 — GridMotion Component (Consulting)

**File:** `src/components/backgrounds/GridMotion.tsx`
**CSS File:** `src/components/backgrounds/GridMotion.css`
**Dependencies:** `gsap`

```tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './GridMotion.css';

const GridMotion = ({ items = [], gradientColor = 'black' }) => {
  const gridRef = useRef(null);
  const rowRefs = useRef([]);
  const mouseXRef = useRef(window.innerWidth / 2);

  const totalItems = 28;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = e => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = () => {
      const maxMoveAmount = 300;
      const baseDuration = 0.8;
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div className="noscroll loading" ref={gridRef}>
      <section
        className="intro"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`
        }}
      >
        <div className="gridMotion-container">
          {[...Array(4)].map((_, rowIndex) => (
            <div key={rowIndex} className="row" ref={el => (rowRefs.current[rowIndex] = el)}>
              {[...Array(7)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="row__item">
                    <div className="row__item-inner" style={{ backgroundColor: '#111' }}>
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="row__item-img"
                          style={{
                            backgroundImage: `url(${content})`
                          }}
                        ></div>
                      ) : (
                        <div className="row__item-content">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="fullview"></div>
      </section>
    </div>
  );
};

export default GridMotion;
```

**GridMotion CSS:**
```css
.noscroll {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.intro {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intro::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 250px;
  pointer-events: none;
  z-index: 4;
}

.gridMotion-container {
  gap: 1rem;
  flex: none;
  position: relative;
  width: 150vw;
  height: 150vh;
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  grid-template-columns: 100%;
  transform: rotate(-15deg);
  transform-origin: center center;
  z-index: 2;
}

.row {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(7, 1fr);
  will-change: transform, filter;
}

.row__item {
  position: relative;
}

.row__item-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
  background-color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.row__item-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: 50% 50%;
  position: absolute;
  top: 0;
  left: 0;
}

.row__item-content {
  padding: 1rem;
  text-align: center;
  z-index: 1;
}

.fullview {
  position: relative;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.fullview .row__item-inner {
  border-radius: 0px;
}
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| items | array | [] | Array of strings, JSX, or image URLs (max 28) |
| gradientColor | string | 'black' | Background gradient color |

**Vertex Consulting usage:**
```tsx
const consultingItems = [
  'Strategy', 'Operations', 'AI Tools', 'Workflow',
  'Systems', 'Growth', 'Efficiency', 'Planning',
  'Analysis', 'Structure', 'Process', 'Integration',
  'Consulting', 'Optimization', 'Management', 'Solutions',
  'Advisory', 'Development', 'Innovation', 'Technology',
  'Assessment', 'Implementation', 'Transformation', 'Results',
  'Performance', 'Automation', 'Infrastructure', 'Scaling'
];

<GridMotion items={consultingItems} gradientColor="#141414" />
```

---

# 6. Site Structure — 16 Pages

## 6.1 — Shared Pages (5)

| **Route** | **Page** | **Background** | **Sections** |
|---|---|---|---|
| `/` | Homepage | Silk (purple-gray) | Hero, division split, services overview, social proof, CTA |
| `/about` | About | Static dark | Story, team grid (4 members), values, company timeline |
| `/contact` | Contact | Static dark | Form + details side-by-side, map embed |
| `/blog` | Blog listing | Static dark | Post cards with division filter. Sanity CMS powered. |
| `/blog/[slug]` | Blog post | Static dark | Full article, author bio, related posts, CTA |

## 6.2 — Consulting Division (5)

| **Route** | **Page** | **Background** | **Sections** |
|---|---|---|---|
| `/consulting` | Landing | GridMotion (gray) | Hero, 4 services grid, Goran intro, testimonials, CTA |
| `/consulting/business-consulting` | Service | Static gray | 800+ words, process steps, FAQ (4+), CTA |
| `/consulting/workflow-restructuring` | Service | Static gray | 800+ words, process steps, FAQ (4+), CTA |
| `/consulting/it-systems` | Service | Static gray | 800+ words, process steps, FAQ (4+), CTA |
| `/consulting/ai-consulting` | Service | Static gray | 800+ words, process steps, FAQ (4+), CTA |

## 6.3 — Marketing Division (5)

| **Route** | **Page** | **Background** | **Sections** |
|---|---|---|---|
| `/marketing` | Landing | Plasma (purple) | Hero, 4 services grid, team showcase, testimonials, CTA |
| `/marketing/web-design` | Service | Static purple | 800+ words, process steps, FAQ (4+), CTA |
| `/marketing/social-media` | Service | Static purple | 800+ words, process steps, FAQ (4+), CTA |
| `/marketing/it-infrastructure` | Service | Static purple | 800+ words, process steps, FAQ (4+), CTA |
| `/marketing/ai-development` | Service | Static purple | 800+ words, process steps, FAQ (4+), CTA |

## 6.4 — Utility Pages (2, no-index)

| **Route** | **Page** |
|---|---|
| `/privacy` | Privacy policy |
| `/thank-you` | Form confirmation |

## 6.5 — Future Pages (Planned)

| **Route** | **Page** | **Notes** |
|---|---|---|
| `/marketing/blog` | Marketing blog | Separate blog for marketing division. To be added in a future phase. Will use Sanity CMS with division-specific filtering. |

---

# 7. Global Components (Every Page)

| **Component** | **Specification** |
|---|---|
| Navbar | Sticky glassmorphism. Logo, division links, EN/MK language toggle, contact CTA button. Hides on scroll down, shows on scroll up via Framer Motion. Mobile hamburger menu. |
| Footer | Full footer. Logo, both division links, all services, contact info, social links, copyright. Matches dark design system. |
| AI chat widget | Bottom-right floating 40px circle. Opens 360x480 chat panel. Claude API powered (abstracted via src/lib/ai.ts). Context-aware persona per page. Lead capture with Telegram notification. |
| Language toggle | EN/MK switch in navbar. Powered by next-intl. Smooth transition, no page reload. |
| Scroll progress bar | Thin colored line at top of page. Gray on consulting pages, purple on marketing pages, blue on shared pages. |
| Back to top | Appears after scrolling past first section. Smooth scroll with spring animation. |

---

# 8. Reusable Section Components

| **Component** | **Where Used** | **Specification** |
|---|---|---|
| Hero section | Homepage, consulting landing, marketing landing | Big headline (Display size), subtitle, 1–2 CTA buttons, animated background. Each division gets its own variant. |
| Services grid | Homepage, division landings | 3–4 column card grid. Each card links to service page. Icon, title, short desc. Hover glow (marketing) or subtle gray shift (consulting). |
| Team showcase | About, division landings | Photo cards with name, role, short bio. Hover effect reveals more detail. Links to about page. |
| FAQ accordion | Every service page | Expandable Q&A with smooth animation. Minimum 4 items per page. FAQPage schema built into component. |
| CTA banner | Bottom of every page | Full-width section with headline, subtext, action button. Gradient background matching the current division. |
| Social proof | Homepage, division landings | Stats counters (animated on scroll), client logos (when available), testimonial cards, trust badges. |
| Process steps | Service pages, division landings | Numbered steps showing working process. Animated timeline or stepper with scroll trigger. |
| Blog cards | Blog listing, blog post, homepage | Featured image, title, excerpt, author, date, division tag. Used in listing and "related posts." |
| Contact form | Contact page, embedded in CTA sections | Name, email, phone (optional), division selector, message. Sends via Resend email + Telegram notification. |
| Division switcher | Homepage only | Visual split showing both divisions side by side. Hover/click reveals more about each. Animated transition between the two. |

---

# 9. AI Chat Widget

Full specification defined in D-10 (AI Chat Widget Specification). Key implementation details:

| **Item** | **Value** |
|---|---|
| Provider abstraction | src/lib/ai.ts — single function, env var switches between Claude API and Ollama |
| API model | claude-sonnet-4-5, max_tokens: 300 |
| Chat API route | src/app/api/chat/route.ts |
| Lead API route | src/app/api/chat/lead/route.ts |
| System prompt | src/lib/chatWidget.ts — builds context-aware prompt per page URL |
| Persona switching | / = brand overview, /consulting/* = professional advisor, /marketing/* = creative energetic, /blog/* = topic-related, /contact = encourage form |
| Language detection | From page language toggle (priority) or visitor's first message |
| Lead capture fields | Name (required), email (required), division (auto-detected), summary (AI-generated), timestamp, page URL |
| Telegram notification | Immediate on lead capture. Format defined in D-10 Section 5.2. |
| Rate limits | 20 messages/session, 10 sessions/IP/hour, 300 tokens/reply |
| Migration | AI_PROVIDER env var: 'claude' (default) or 'ollama'. See D-07c for full migration plan. |

---

# 10. SEO & AEO/GEO — Built from Day One

Full strategies defined in D-13 (SEO Strategy) and D-14 (AEO/GEO Strategy). Implementation summary:

## 10.1 — Structured Data

| **Schema** | **Pages** |
|---|---|
| LocalBusiness | All pages (in layout) |
| Organization | Homepage and About |
| Person | About and Team (Goran Dinov) |
| Service | Each service page |
| FAQPage | Every service page (min 4 items) |
| WebSite | Homepage |
| BreadcrumbList | All pages |
| BlogPosting | Each blog post |

## 10.2 — Technical Files

| **File** | **Purpose** |
|---|---|
| /llms.txt | AI crawler guide. Company info, services, key URLs. For ChatGPT/Perplexity citation. |
| /sitemap.xml | Auto-generated. Submitted to Google Search Console and Bing Webmaster Tools. |
| /robots.txt | Allow all important pages. Block /privacy and /thank-you. |
| Open Graph tags | Title, description, OG image on every page. |
| Hreflang tags | EN + MK on every page via next-intl. |
| Canonical URLs | Self-referencing on every page. |

## 10.3 — Content SEO Rules

- Service page minimum: 800 words
- Blog post minimum: 600 words (target 1,000–1,500 for competitive terms)
- Primary keyword in: page title, first H1, first paragraph, and 2–4 times naturally
- Every blog post links to at least one service page
- Every service page links to related services
- Author attribution on all blog posts with link to team page
- Every piece of content in both MK and EN (never auto-translated)
- Direct-answer format: answer the question in the first sentence, then context

## 10.4 — Performance Targets

| **Metric** | **Target** |
|---|---|
| Lighthouse Performance | 90+ |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |

Achieved via: lazy loading background components, code splitting, Next.js Image component (automatic WebP), prefers-reduced-motion support, dynamic imports with `ssr: false` for WebGL components.

---

# 11. Build Order

| **Phase** | **Scope** | **Dependencies** |
|---|---|---|
| 1 | Project setup: Next.js, Tailwind, shadcn/ui, fonts, color tokens, animation config | — |
| 2 | Global components: navbar, footer, layout wrapper, language toggle | Phase 1 |
| 3 | Homepage: Silk BG, hero, division split, services overview, social proof, CTA | Phases 1–2 |
| 4 | Consulting: GridMotion BG, landing page, 4 service pages | Phases 1–2 |
| 5 | Marketing: Plasma BG, landing page, 4 service pages | Phases 1–2 |
| 6 | Shared pages: about, contact form, blog listing, blog post template | Phases 1–2 |
| 7 | AI chat widget + Telegram integration | Phases 1–2 |
| 8 | Sanity CMS setup + content migration | Phase 6 |
| 9 | SEO: structured data schemas, llms.txt, sitemap, OG images, GA4 | All pages built |
| 10 | Bilingual: Macedonian translations via next-intl | All content finalized |
| 11 | Performance audit, Lighthouse 90+, accessibility check, launch prep | Everything complete |

---

# 12. Additional Components (To Be Added During Build)

The following components will be sourced from 21st.dev or similar marketplaces during the build process and integrated into the design system:

- **Navbar component** — to be selected from 21st.dev/s/navbars
- **Footer component** — to be selected from 21st.dev/s/footers
- **Hero variants** — to be selected from 21st.dev/s/hero
- **Feature/service cards** — to be selected from 21st.dev/s/features
- **Testimonials** — to be selected from 21st.dev/s/testimonials
- **CTA sections** — to be selected from 21st.dev/s/cta
- **Additional background effects** — to be browsed from 21st.dev/s/backgrounds

These will be integrated as they are selected, matched to the color palette and animation system defined in this document.

---

*Vertex Consulting | Goran Dinov | Strumica, Macedonia | April 2026*

*This document is confidential — for internal use only.*
