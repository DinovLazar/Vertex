'use client'

import type { MouseEvent } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useDivisionTransition } from '@/components/global/DivisionTransition'

/* ---------------------------------------------------------------
   Phase 18 — the two division cards.

   This component owns ONLY the card row. The section's eyebrow /
   heading / sub-copy live one level up, in `[locale]/(site)/page.tsx`
   inside `<Section id="divisions">`, and are deliberately untouched.

   The row breaks out of that Section's `max-w-7xl … px-8` container
   and is deliberately WIDER than the viewport, so the left card is
   cut off by the left screen edge and the right card by the right.
   Everything the cards used to say in text — title, subtitle,
   description, service chips, "Explore …" — is gone. What is left is
   a soft-focus screenshot of the page each card links to (captured by
   `scripts/capture-division-shots.mjs`, `npm run shots`), one word,
   and an arrow that only appears on hover. The removed wording
   survives verbatim as an `sr-only` sentence so crawlers and screen
   readers keep the meaning.

   Hover is pure CSS on `group-hover` — no Motion — so it costs
   nothing on a page that already runs a WebGL hero. The click
   transition is the one thing that needs JS; it lives in
   `DivisionTransitionProvider`, mounted in the locale layout rather
   than here, because the overlay has to outlive the navigation that
   unmounts this component.
   --------------------------------------------------------------- */

type DivisionKey = 'consulting' | 'marketing'

const CARDS: { key: DivisionKey; href: string; src: string }[] = [
  {
    key: 'consulting',
    href: '/consulting',
    src: '/images/divisions/consulting.webp',
  },
  {
    key: 'marketing',
    href: '/marketing',
    src: '/images/divisions/marketing.webp',
  },
]

function DivisionCard({
  cardKey,
  href,
  src,
  label,
  srText,
}: {
  cardKey: DivisionKey
  href: string
  src: string
  label: string
  srText: string
}) {
  const { start } = useDivisionTransition()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return // let the browser handle new-tab / new-window
    }

    const el = event.currentTarget
    event.preventDefault()

    // The card overhangs the viewport horizontally, so rect.left is negative
    // and rect.right exceeds innerWidth. inset() insets cannot be negative
    // without the clip escaping the overlay, so clamp to the VISIBLE rect —
    // which is what the eye is tracking anyway.
    const rect = el.getBoundingClientRect()
    const radius =
      Number.parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
    const top = Math.max(0, rect.top)
    const left = Math.max(0, rect.left)
    const right = Math.max(0, window.innerWidth - rect.right)
    const bottom = Math.max(0, window.innerHeight - rect.bottom)

    start({
      href,
      src,
      label,
      clipFrom: `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`,
      dx: rect.left + rect.width / 2 - window.innerWidth / 2,
      dy: rect.top + rect.height / 2 - window.innerHeight / 2,
    })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      data-division-card={cardKey}
      className="group relative block aspect-[16/11] overflow-hidden rounded-2xl outline-none ring-1 ring-white/10 transition-shadow duration-500 focus-visible:ring-2 focus-visible:ring-[#F5F5F5]/70 md:aspect-[16/10] md:rounded-3xl"
    >
      {/* A plain <img>, not next/image: this file is a hand-tuned 1600px WebP
          that is already at its display size, and the optimizer's wrapper
          would fight the absolute fill + the blur/scale transitions. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={1600}
        height={1000}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-[1.08] object-cover blur-[3px] brightness-[0.6] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.14] group-hover:blur-[1.5px] group-hover:brightness-[0.72]"
      />
      {/* Scrim — the label has to clear AA against a photographic backdrop. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#141414]/30 via-[#141414]/45 to-[#141414]/80" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="font-heading text-[clamp(1.75rem,4.5vw,4rem)] font-bold tracking-tight text-[#F5F5F5] drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]">
          {label}
        </span>
        <span
          aria-hidden
          className="translate-y-1 text-2xl leading-none text-[#C9C9C9] opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100"
        >
          &rarr;
        </span>
      </div>

      <span className="sr-only">{srText}</span>
    </Link>
  )
}

export default function DivisionSplit() {
  const t = useTranslations('home.divisionSplit')

  return (
    // Full-bleed escape: `ml-[calc(50%-50vw)] w-[100vw]` walks the row out of
    // the Section's centred container to the viewport edges, then the inner
    // grid overhangs by a further 5vw/6vw per side. `overflow-x-clip` on the
    // 100vw frame is what makes the overhang a design decision rather than a
    // horizontal scrollbar; `clip` rather than `hidden` so no scroll container
    // is created (same reasoning as the `html` rule in globals.css).
    <div className="relative ml-[calc(50%_-_50vw)] w-[100vw] overflow-x-clip">
      <div className="-ml-[5vw] grid w-[110vw] grid-cols-1 gap-4 md:-ml-[6vw] md:w-[112vw] md:grid-cols-2 md:gap-6">
        {CARDS.map((card) => (
          <DivisionCard
            key={card.key}
            cardKey={card.key}
            href={card.href}
            src={card.src}
            label={t(`${card.key}.cardLabel`)}
            srText={`${t(`${card.key}.title`)} — ${t(`${card.key}.subtitle`)}. ${t(`${card.key}.cta`)}.`}
          />
        ))}
      </div>
    </div>
  )
}
