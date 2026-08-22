'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/global'
import { useShouldAnimate } from '@/lib/useMediaQuery'

/**
 * Marketing-hero plasma backdrop — a pre-rendered looping video, not a live
 * shader (Session — Plasma Video Hero, 2026-08-23).
 *
 * The original OGL/WebGL2 implementation raymarched 60 iterations per pixel
 * per frame, which made the marketing page stutter and occasionally glitch,
 * especially on phones. These videos are pixel-faithful offline renders of
 * that exact shader with everything baked in: the page background
 * (--division-bg), the shader's own alpha, and the light-mode
 * --plasma-opacity damper. The loop is seamless (in-shader crossfade back to
 * frame 0), so playback wraps invisibly.
 *
 * Regenerate with `node scripts/render-plasma-hero.mjs` if the palette or
 * motion parameters ever change — the baked values are documented there.
 */
const SOURCES = {
  dark: {
    video: '/heroes/plasma-hero-dark.mp4',
    poster: '/heroes/plasma-hero-dark.webp',
  },
  light: {
    video: '/heroes/plasma-hero-light.mp4',
    poster: '/heroes/plasma-hero-light.webp',
  },
} as const

interface BackgroundPlasmaProps {
  className?: string
}

export default function BackgroundPlasma({ className = '' }: BackgroundPlasmaProps) {
  // Reduced-motion visitors get the static first-frame poster — same
  // composition, no motion, no video download.
  const shouldAnimate = useShouldAnimate()
  const { theme } = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Play/pause management, mirroring what the old shader's rAF gating did:
  //   - play() after mount: React does not serialize `muted` into SSR markup
  //     (long-standing react-dom quirk), so a browser evaluating the autoplay
  //     attribute pre-hydration can refuse playback and never retry. Setting
  //     the property first and calling play() covers that; the catch swallows
  //     e.g. iOS Low Power Mode, where the poster remains.
  //   - pause when the hero scrolls offscreen or the tab is hidden, resume on
  //     re-entry — no point decoding video nobody can see. This also fixes
  //     tabs opened in the background: the deferred autoplay is retried on
  //     the first visibilitychange.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true

    let inView = true
    let pageVisible = !document.hidden
    const apply = () => {
      if (inView && pageVisible) video.play().catch(() => {})
      else video.pause()
    }
    apply()

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        apply()
      },
      { threshold: 0 },
    )
    io.observe(video)

    const onVis = () => {
      pageVisible = !document.hidden
      apply()
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [theme, shouldAnimate])

  const src = SOURCES[theme]

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      {shouldAnimate ? (
        <video
          // Remount on theme flip so the other theme's video loads fresh and
          // autoplays instead of src-swapping a live element mid-play.
          key={theme}
          ref={videoRef}
          className="w-full h-full object-cover"
          src={src.video}
          poster={src.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : (
        // Decorative full-bleed backdrop; next/image's optimizer pipeline
        // buys nothing for a single already-tiny WebP and would add a
        // layout wrapper.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src.poster}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  )
}
