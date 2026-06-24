'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  /** Optional cursor coords seed the circular View-Transition wipe's origin.
   *  No-arg callers (or reduced-motion / unsupported browsers) get an
   *  instant swap. */
  toggleTheme: (origin?: { x: number; y: number }) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'vertex-theme'

// Circular wipe duration — mirrors the --vt-theme-duration token (520ms).
const VT_DURATION = 520

function readAttribute(): Theme | null {
  if (typeof document === 'undefined') return null
  const v = document.documentElement.getAttribute('data-theme')
  return v === 'light' || v === 'dark' ? v : null
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // Server always renders 'dark' (matches default <html>). After hydration,
  // useEffect below syncs to the real attribute set by the pre-hydration
  // inline script. No visible UI depends on `theme` state before Phase L2,
  // so the brief state mismatch is not user-visible.
  const [theme, setThemeState] = useState<Theme>('dark')

  // Sync state to the attribute the inline script set (after hydration).
  useEffect(() => {
    const current = readAttribute()
    if (current && current !== theme) {
      setThemeState(current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply a theme: write the attribute + update state. Persistence is
  // handled separately by setTheme.
  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute('data-theme', next)
    setThemeState(next)
  }, [])

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // localStorage may be unavailable (private mode, cookies blocked).
        // Silently ignore — theme still applies for the session.
      }
      applyTheme(next)
    },
    [applyTheme],
  )

  // Animated theme swap: the new theme grows over the old as a circle
  // expanding from the click point (or the viewport center for no-arg
  // callers) to the furthest corner. Driven by the View Transitions API +
  // Web Animations API so the heavy WebGL hero stays a single captured
  // snapshot rather than re-rendering through the transition. Falls back to
  // the instant `setTheme` when the API is missing or reduced motion is on.
  const setThemeAnimated = useCallback(
    (next: Theme, origin?: { x: number; y: number }) => {
      const docEl = document.documentElement
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> }
      }
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      if (!doc.startViewTransition || reduce) {
        setTheme(next) // existing behavior — instant
        return
      }

      const x = origin?.x ?? window.innerWidth / 2
      const y = origin?.y ?? window.innerHeight / 2
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      )

      const transition = doc.startViewTransition(() => setTheme(next))
      transition.ready
        .then(() => {
          docEl.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: VT_DURATION,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          )
        })
        .catch(() => {
          // A skipped/aborted transition (e.g. rapid double-toggle) rejects
          // `ready`. The theme attribute is already applied by the callback,
          // so there is nothing to recover — swallow it.
        })
    },
    [setTheme],
  )

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      setThemeAnimated(theme === 'dark' ? 'light' : 'dark', origin)
    },
    [theme, setThemeAnimated],
  )

  // Dark is the unconditional default. We intentionally do NOT track OS
  // `prefers-color-scheme` changes: a visitor who hasn't explicitly chosen
  // light stays in dark regardless of their system setting. Only the theme
  // toggle (persisted to localStorage) moves a user off the dark default.

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
