'use client'

import { motion, useReducedMotion } from 'motion/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useIsHydrated } from '@/lib/useMediaQuery'
// next-intl's navigation wrappers, never next/navigation: `usePathname()` here
// returns the locale-LESS path ("/consulting"), which is exactly the shape the
// payload's `href` carries, and `router.push` re-applies the active prefix.
import { usePathname, useRouter } from '@/i18n/navigation'

export type DivisionTransitionPayload = {
  /** Locale-less href, e.g. "/consulting" */
  href: string
  /** Same image src the card renders, so the overlay hits the browser cache */
  src: string
  label: string
  /** CSS clip-path inset() string describing the card's on-screen rect */
  clipFrom: string
  /** Offset from viewport centre to card centre, for the travelling label */
  dx: number
  dy: number
}

type DivisionTransitionContextValue = {
  start: (payload: DivisionTransitionPayload) => void
  isActive: boolean
}

const DivisionTransitionContext =
  createContext<DivisionTransitionContextValue | null>(null)

export function useDivisionTransition() {
  const ctx = useContext(DivisionTransitionContext)
  if (!ctx) {
    throw new Error(
      'useDivisionTransition must be used inside <DivisionTransitionProvider>',
    )
  }
  return ctx
}

/* ---------------------------------------------------------------
   Timing. The whole sequence is ~1s from click to a clean page:

     0ms     overlay mounts clipped to the card's own rect
     0-620   clip opens to the full viewport, image un-blurs, the
             label travels from the card's centre to the screen's
     340     router.push — the destination renders UNDERNEATH
     ~620+   once the new pathname is live, 380ms fade-out
     2600    safety net: fade out even if the route never changed

   Same family as the theme toggle's circular View-Transition wipe
   (`ThemeProvider.setThemeAnimated`) — a clip-path that grows from
   the thing you clicked — but expressed with Motion rather than the
   View Transitions API, because this one has to outlive the route
   change that unmounts the card.
   --------------------------------------------------------------- */
const EXPAND_MS = 620
const NAV_AT_MS = 340
const EXIT_MS = 380
const SAFETY_MS = 2600
const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export default function DivisionTransitionProvider({
  children,
}: {
  children: ReactNode
}) {
  const [payload, setPayload] = useState<DivisionTransitionPayload | null>(null)
  const [leaving, setLeaving] = useState(false)
  // useSyncExternalStore, not a setState-in-effect mount flag: the portal
  // target only exists on the client, and this is the same hydration gate
  // ThemeToggle uses.
  const mounted = useIsHydrated()

  const router = useRouter()
  const pathname = usePathname()
  const prefersReduced = useReducedMotion()

  const timers = useRef<number[]>([])
  const startedAt = useRef(0)

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  const teardown = useCallback(() => {
    setLeaving(true)
    timers.current.push(
      window.setTimeout(() => {
        setPayload(null)
        setLeaving(false)
        // removeProperty, not `= ''`: <html> carries `overflow-x: clip` from
        // globals.css and the inline `overflow: hidden` shadowed it. Removing
        // the inline declaration hands the axis back to the stylesheet.
        document.documentElement.style.removeProperty('overflow')
      }, EXIT_MS),
    )
  }, [])

  const start = useCallback(
    (next: DivisionTransitionPayload) => {
      if (prefersReduced) {
        router.push(next.href)
        return
      }
      clearTimers()
      setLeaving(false)
      setPayload(next)
      startedAt.current = Date.now()
      document.documentElement.style.overflow = 'hidden'
      timers.current.push(
        window.setTimeout(() => router.push(next.href), NAV_AT_MS),
      )
      timers.current.push(window.setTimeout(teardown, SAFETY_MS))
    },
    [clearTimers, prefersReduced, router, teardown],
  )

  // Fade out once the destination is actually rendered and the expansion has
  // finished — whichever of the two lands last.
  useEffect(() => {
    if (!payload || leaving) return
    if (pathname !== payload.href) return
    const elapsed = Date.now() - startedAt.current
    const wait = Math.max(0, EXPAND_MS + 120 - elapsed)
    const id = window.setTimeout(teardown, wait)
    timers.current.push(id)
    return () => window.clearTimeout(id)
  }, [pathname, payload, leaving, teardown])

  useEffect(
    () => () => {
      clearTimers()
      document.documentElement.style.removeProperty('overflow')
    },
    [clearTimers],
  )

  const overlay =
    mounted && payload
      ? createPortal(
          <div aria-hidden className="pointer-events-none fixed inset-0 z-[120]">
            <motion.div
              className="absolute inset-0 overflow-hidden bg-[#141414]"
              initial={{ clipPath: payload.clipFrom, opacity: 1 }}
              animate={{
                clipPath: 'inset(0px 0px 0px 0px round 0px)',
                opacity: leaving ? 0 : 1,
              }}
              transition={
                leaving
                  ? { duration: EXIT_MS / 1000, ease: 'easeOut' }
                  : { duration: EXPAND_MS / 1000, ease: EASE }
              }
            >
              {/* next/image buys nothing here: the exact same file is already
                  decoded in the card below, so this hits the memory cache, and
                  an optimizer wrapper would fight the absolute fill. */}
              <motion.img
                src={payload.src}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ scale: 1.16, filter: 'blur(7px)', opacity: 0.85 }}
                animate={{ scale: 1, filter: 'blur(0px)', opacity: 0.45 }}
                transition={{ duration: EXPAND_MS / 1000, ease: EASE }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#141414]/40 via-[#141414]/60 to-[#141414]/90" />
              <motion.span
                className="absolute inset-0 flex items-center justify-center font-heading text-[clamp(2.25rem,7vw,5.5rem)] font-bold tracking-tight text-[#F5F5F5]"
                initial={{ x: payload.dx, y: payload.dy, scale: 0.72 }}
                animate={{
                  x: 0,
                  y: 0,
                  scale: 1,
                  opacity: leaving ? 0 : 1,
                }}
                transition={
                  leaving
                    ? { duration: EXIT_MS / 1000, ease: 'easeOut' }
                    : { duration: EXPAND_MS / 1000, ease: EASE }
                }
              >
                {payload.label}
              </motion.span>
            </motion.div>
          </div>,
          document.body,
        )
      : null

  return (
    <DivisionTransitionContext.Provider
      value={{ start, isActive: payload !== null }}
    >
      {children}
      {overlay}
    </DivisionTransitionContext.Provider>
  )
}
