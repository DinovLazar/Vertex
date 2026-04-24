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
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'vertex-theme'

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

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Track OS preference changes — only apply when the user has not set
  // an explicit preference (localStorage is empty or invalid).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null
      try {
        stored = localStorage.getItem(STORAGE_KEY)
      } catch {}
      if (stored !== 'light' && stored !== 'dark') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [applyTheme])

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
