'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [1, 0.5, 0.2]
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ]
}

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

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
}
`

interface PlasmaProps {
  color?: string
  speed?: number
  direction?: 'forward' | 'reverse' | 'pingpong'
  scale?: number
  opacity?: number
  mouseInteractive?: boolean
}

export default function Plasma({
  color = '#737373',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
}: PlasmaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const containerEl = containerRef.current

    const useCustomColor = color ? 1.0 : 0.0
    const customColorRgb = color ? hexToRgb(color) : [1, 1, 1]
    const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0

    const renderer = new Renderer({
      webgl: 2,
      alpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
    const gl = renderer.gl
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    containerEl.appendChild(canvas)

    const geometry = new Triangle(gl)

    const program = new Program(gl, {
      vertex,
      fragment,
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
        uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteractive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mousePos.current.x = e.clientX - rect.left
      mousePos.current.y = e.clientY - rect.top
      const mouseUniform = program.uniforms.uMouse.value as Float32Array
      mouseUniform[0] = mousePos.current.x
      mouseUniform[1] = mousePos.current.y
    }

    if (mouseInteractive) {
      containerEl.addEventListener('mousemove', handleMouseMove)
    }

    const setSize = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const width = Math.max(1, Math.floor(rect.width))
      const height = Math.max(1, Math.floor(rect.height))
      renderer.setSize(width, height)
      const res = program.uniforms.iResolution.value as Float32Array
      res[0] = gl.drawingBufferWidth
      res[1] = gl.drawingBufferHeight
    }

    const ro = new ResizeObserver(setSize)
    ro.observe(containerEl)
    setSize()

    // Sim-time advances only while the loop is active. We keep it as a locally
    // accumulated value instead of `performance.now() - t0` so the animation
    // does not jump forward by hours after the tab has been hidden.
    let raf = 0
    let lastFrame = 0
    let simSeconds = 0

    const loop = (t: number) => {
      const dt = lastFrame === 0 ? 0 : (t - lastFrame) * 0.001
      lastFrame = t
      simSeconds += dt
      if (direction === 'pingpong') {
        const pingpongDuration = 10
        const segmentTime = simSeconds % pingpongDuration
        const isForward = Math.floor(simSeconds / pingpongDuration) % 2 === 0
        const u = segmentTime / pingpongDuration
        const smooth = u * u * (3 - 2 * u)
        const pingpongTime = isForward ? smooth * pingpongDuration : (1 - smooth) * pingpongDuration
        program.uniforms.uDirection.value = 1.0
        program.uniforms.iTime.value = pingpongTime
      } else {
        program.uniforms.iTime.value = simSeconds
      }
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (raf !== 0) return
      lastFrame = 0
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf === 0) return
      cancelAnimationFrame(raf)
      raf = 0
    }

    // Pause the render loop when the background scrolls offscreen or the tab
    // is hidden — cancels the rAF entirely (zero CPU/GPU) rather than rendering
    // invisible frames. Resumes cleanly via `lastFrame = 0` which zeroes the
    // next delta so no giant time step leaks into the shader. Start optimistic
    // (`inView = true`) so the hero renders on first frame; IntersectionObserver
    // callbacks are async and would otherwise cause one blank frame.
    let inView = true
    let pageVisible = typeof document !== 'undefined' ? !document.hidden : true
    const apply = () => {
      if (inView && pageVisible) start()
      else stop()
    }
    apply()

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        apply()
      },
      { threshold: 0 }
    )
    io.observe(containerEl)

    const onVis = () => {
      pageVisible = !document.hidden
      apply()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      if (mouseInteractive && containerEl) {
        containerEl.removeEventListener('mousemove', handleMouseMove)
      }
      try {
        containerEl?.removeChild(canvas)
      } catch {
        console.warn('Canvas already removed from container')
      }
    }
  }, [color, speed, direction, scale, opacity, mouseInteractive])

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    />
  )
}
