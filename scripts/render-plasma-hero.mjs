/**
 * Renders the marketing-hero plasma animation to seamless looping MP4s —
 * one per theme — plus matching first-frame posters.
 *
 * Why videos: the live shader (formerly src/components/backgrounds/Plasma.tsx)
 * raymarched 60 iterations per pixel per frame, which stuttered and glitched
 * on phones. The videos are pixel-faithful pre-renders of that exact shader,
 * fully composited: page background + the shader's own alpha + the CSS
 * `--plasma-opacity` damper are all baked in, so the frontend just plays an
 * opaque `<video>` (see BackgroundPlasma.tsx).
 *
 * The loop is genuinely seamless: the shader is not periodic, so the last
 * XFADE_SECONDS of the clip are a crossfade toward the t=0 state, computed
 * INSIDE the shader (both time samples evaluated per pixel), not as a video
 * post-filter. Frame N would equal frame 0 exactly; playback wraps invisibly.
 *
 * Baked parameters mirror the marketing call site + globals.css tokens as of
 * 2026-08-23 — re-run this if any of them change:
 *   - call site (MarketingLandingClient): speed 0.5, scale 1.3, opacity 0.35
 *   - colors (old BackgroundPlasma defaults): dark #F5F5F5, light #2A2D33
 *   - page bg (--division-bg, marketing): dark #141414, light #FFFFFF
 *   - CSS damper (--plasma-opacity): dark 1, light 0.4
 *
 * Outputs (committed to the repo):
 *   public/heroes/plasma-hero-dark.mp4   public/heroes/plasma-hero-dark.webp
 *   public/heroes/plasma-hero-light.mp4  public/heroes/plasma-hero-light.webp
 *
 * Requires on-demand deps (not committed, same policy as capture-projects.mjs):
 *   npm install --no-save playwright ffmpeg-static && npx playwright install chromium
 *
 * Usage:
 *   node scripts/render-plasma-hero.mjs           # both themes
 *   node scripts/render-plasma-hero.mjs dark      # one theme
 */
import { chromium } from 'playwright'
import ffmpegPath from 'ffmpeg-static'
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { statSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// ---------------------------------------------------------------------------
// Render parameters
// ---------------------------------------------------------------------------
const WIDTH = 1920
const HEIGHT = 1080
const FPS = 30
const LOOP_SECONDS = 20 // final video length
const XFADE_SECONDS = 4 // tail crossfade back to frame 0, baked in-shader
const FRAMES = LOOP_SECONDS * FPS

// Shader uniforms shared by both themes (from the marketing call site).
// uSpeed matches Plasma.tsx's `speed * 0.4` mapping (speed prop was 0.5).
const SHARED = { uSpeed: 0.5 * 0.4, uScale: 1.3, uOpacity: 0.35 }

const hexToRgb01 = (hex) => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
]

const THEMES = {
  dark: { color: hexToRgb01('#F5F5F5'), bg: hexToRgb01('#141414'), cssOpacity: 1.0 },
  light: { color: hexToRgb01('#2A2D33'), bg: hexToRgb01('#FFFFFF'), cssOpacity: 0.4 },
}

const OUT_DIR = path.join(process.cwd(), 'public', 'heroes')
const WORK_DIR = path.join(os.tmpdir(), 'plasma-hero-frames')

// ---------------------------------------------------------------------------
// Capture page — the original Plasma.tsx fragment shader, verbatim except:
//   - iTime became a mainImage() parameter so one pass can sample two times
//     (crossfade); the math is otherwise untouched
//   - the mouse-offset lines are dropped (call site had mouseInteractive=false,
//     which multiplied the offset by step(0.5, 0.0) = 0 anyway)
//   - a composite step bakes page bg + shader alpha + the CSS opacity damper
//   - a hash dither (±0.5/255) breaks up H.264 banding on the soft gradients
// ---------------------------------------------------------------------------
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform vec3 uCustomColor;
uniform float uSpeed;
uniform float uScale;
uniform float uOpacity;
uniform vec3 uBg;
uniform float uCssOpacity;
uniform float uTimeA;
uniform float uTimeB;
uniform float uBlend;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C, float t) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  float i, d, z, T = t * uSpeed;
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

// Everything the browser used to do at composite time, done here instead:
// custom-color tint, alpha-over page bg, CSS opacity damper. Channel clamps
// mirror the RGBA8 canvas store the live shader wrote into.
vec3 compositeAt(float t) {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy, t);
  vec3 rgb = sanitize(o.rgb);
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 tinted = clamp(intensity * uCustomColor, 0.0, 1.0);
  float alpha = clamp(length(rgb) * uOpacity, 0.0, 1.0);
  return mix(uBg, tinted, alpha * uCssOpacity);
}

void main() {
  vec3 col = compositeAt(uTimeA);
  if (uBlend > 0.0) col = mix(col, compositeAt(uTimeB), uBlend);
  float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (n - 0.5) / 255.0;
  fragColor = vec4(col, 1.0);
}
`

const VERTEX = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`

const PAGE_HTML = `<!doctype html><html><body style="margin:0">
<canvas id="c" width="${WIDTH}" height="${HEIGHT}"></canvas></body></html>`

// Runs inside the page (Playwright serializes the function source).
const pageSetup = (cfg) => {
  const canvas = document.getElementById('c')
  const gl = canvas.getContext('webgl2', {
    alpha: false, antialias: false, preserveDrawingBuffer: true,
  })
  if (!gl) throw new Error('webgl2 unavailable')

  const compile = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(s))
    return s
  }
  const prog = gl.createProgram()
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, cfg.vertex))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, cfg.fragment))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(prog))
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'position')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u = (name) => gl.getUniformLocation(prog, name)
  gl.viewport(0, 0, cfg.width, cfg.height)
  gl.uniform2f(u('iResolution'), cfg.width, cfg.height)
  gl.uniform3fv(u('uCustomColor'), cfg.color)
  gl.uniform1f(u('uSpeed'), cfg.uSpeed)
  gl.uniform1f(u('uScale'), cfg.uScale)
  gl.uniform1f(u('uOpacity'), cfg.uOpacity)
  gl.uniform3fv(u('uBg'), cfg.bg)
  gl.uniform1f(u('uCssOpacity'), cfg.cssOpacity)

  const uTimeA = u('uTimeA'), uTimeB = u('uTimeB'), uBlend = u('uBlend')
  window.__renderFrame = (timeA, timeB, blend) => {
    gl.uniform1f(uTimeA, timeA)
    gl.uniform1f(uTimeB, timeB)
    gl.uniform1f(uBlend, blend)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    return canvas.toDataURL('image/png')
  }
  window.__rendererString = gl.getParameter(gl.RENDERER)
}

// ---------------------------------------------------------------------------

const only = process.argv.slice(2)
const themeNames = only.length ? only : Object.keys(THEMES)
for (const t of themeNames) {
  if (!THEMES[t]) {
    console.error(`Unknown theme "${t}". Known: ${Object.keys(THEMES).join(', ')}`)
    process.exit(1)
  }
}
if (!ffmpegPath) {
  console.error('ffmpeg-static did not resolve a binary for this platform.')
  process.exit(1)
}

async function captureTheme(context, name) {
  const frameDir = path.join(WORK_DIR, name)
  await rm(frameDir, { recursive: true, force: true })
  await mkdir(frameDir, { recursive: true })

  const page = await context.newPage()
  await page.setContent(PAGE_HTML)
  await page.evaluate(pageSetup, {
    vertex: VERTEX,
    fragment: FRAGMENT,
    width: WIDTH,
    height: HEIGHT,
    ...SHARED,
    ...THEMES[name],
  })
  const renderer = await page.evaluate('window.__rendererString')
  console.log(`  · WebGL renderer: ${renderer}`)
  if (/swiftshader/i.test(renderer)) {
    console.log('  · (software rasterizer — correct output, slower render)')
  }

  const started = Date.now()
  for (let i = 0; i < FRAMES; i++) {
    const t = i / FPS
    const fadeStart = LOOP_SECONDS - XFADE_SECONDS
    const blend = t > fadeStart ? (t - fadeStart) / XFADE_SECONDS : 0
    const dataUrl = await page.evaluate(
      ([a, b, f]) => window.__renderFrame(a, b, f),
      [t, t - LOOP_SECONDS, blend],
    )
    await writeFile(
      path.join(frameDir, `f${String(i).padStart(4, '0')}.png`),
      Buffer.from(dataUrl.slice('data:image/png;base64,'.length), 'base64'),
    )
    if (i % 100 === 0 || i === FRAMES - 1) {
      const secs = ((Date.now() - started) / 1000).toFixed(0)
      console.log(`  · frame ${i + 1}/${FRAMES} (${secs}s elapsed)`)
    }
  }
  await page.close()
  return frameDir
}

function encodeTheme(name, frameDir) {
  const mp4 = path.join(OUT_DIR, `plasma-hero-${name}.mp4`)
  const poster = path.join(OUT_DIR, `plasma-hero-${name}.webp`)

  execFileSync(ffmpegPath, [
    '-y', '-framerate', String(FPS),
    '-i', path.join(frameDir, 'f%04d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
    mp4,
  ], { stdio: ['ignore', 'ignore', 'inherit'] })

  // Poster MUST be frame 0 — it is what the <video poster> shows until
  // playback starts, and playback starts at frame 0.
  execFileSync(ffmpegPath, [
    '-y', '-i', path.join(frameDir, 'f0000.png'),
    '-c:v', 'libwebp', '-q:v', '80',
    poster,
  ], { stdio: ['ignore', 'ignore', 'inherit'] })

  const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2)
  console.log(`  ✓ ${mp4} (${mb(mp4)} MB)`)
  console.log(`  ✓ ${poster} (${mb(poster)} MB)`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  console.log(`Rendering ${FRAMES} frames per theme at ${WIDTH}x${HEIGHT}@${FPS}fps`)
  console.log(`(${LOOP_SECONDS}s loop, last ${XFADE_SECONDS}s crossfade to frame 0)\n`)

  // Try to get a real GPU in headless mode; SwiftShader still renders
  // correctly if ANGLE/Metal is unavailable, just slower.
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
  })
  const context = await browser.newContext({ viewport: { width: 640, height: 480 } })

  for (const name of themeNames) {
    console.log(`→ ${name}`)
    const frameDir = await captureTheme(context, name)
    encodeTheme(name, frameDir)
  }

  await browser.close()
  await rm(WORK_DIR, { recursive: true, force: true })
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
