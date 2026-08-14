'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query.
 *
 * `useSyncExternalStore` rather than the usual `useState` + `useEffect` pair.
 * The effect version is a cascading render — it paints once with the fallback,
 * then immediately re-renders with the real value — which React's
 * `react-hooks/set-state-in-effect` rule now flags.
 *
 * The important property here is that `getServerSnapshot` supplies the value
 * for BOTH the server render and the hydration render, so server and first
 * client markup stay byte-identical. A lazy `useState` initializer could not
 * do this: these are `'use client'` components that are still server-rendered,
 * and `window.matchMedia` would throw during SSR.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverFallback,
  )
}

/**
 * True when the visitor has NOT asked for reduced motion — i.e. when it is
 * safe to run a shader background or a decorative animation.
 *
 * Defaults to `false` on the server and through hydration, so a reduced-motion
 * visitor never downloads three.js / ogl / gsap: the wrappers only reference
 * those `dynamic(..., { ssr: false })` modules inside the truthy branch.
 */
export function useShouldAnimate(): boolean {
  return !useMediaQuery('(prefers-reduced-motion: reduce)', true)
}

/**
 * `false` during SSR and the hydration render, `true` immediately after —
 * React's blessed "am I hydrated yet" idiom, for components whose outer markup
 * must match the server exactly before they swap in client-only content.
 */
const subscribeNoop = () => () => {}
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}
