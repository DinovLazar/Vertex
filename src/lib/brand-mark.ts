/**
 * The Vertex brand mark — one vector definition, every surface.
 *
 * The mark is a black disc carrying the VERTEX wordmark, and it replaced the
 * old geometric "V" chevron on 2026-08-20. Everything that renders it — the
 * tab favicon, the Apple touch icon, the PWA manifest icons, the schema.org
 * Organization.logo, the badge on the Open Graph card — derives from the
 * constants below, so the mark can never drift between surfaces.
 *
 * ## Where the path data came from
 * The wordmark arrived as a 1024x1024 raster (a flat, hard-edged render at
 * #0E0E0E / #F5F5F5, no live text, no source vector). `WORDMARK_PATH` is that
 * raster's white channel traced back to vectors: pixel-boundary contours
 * chained into closed loops, then Douglas-Peucker simplified at a 1.2px
 * tolerance. 1.2px is chosen deliberately — a rasterised straight edge wanders
 * up to ~1px off the true line, so a tolerance just above that erases the
 * staircase artefact while leaving real curvature (the R bowl) intact. Result:
 * 7 loops, 743 bytes, and a re-render that differs from the source raster by
 * 531 of 1,048,576 pixels (0.05%), all of them sub-pixel edge noise.
 *
 * If a true vector master ever turns up, replace the two path constants with
 * it and re-run `npx tsx scripts/build-brand-icons.ts` — nothing else changes.
 */

/** The mark is authored on a 1024x1024 grid; every emitted size scales from it. */
export const MARK_SIZE = 1024

/** Disc / plate colour. The dark palette's deepest surface. */
export const MARK_BG = '#0E0E0E'

/** Wordmark colour. */
export const MARK_FG = '#F5F5F5'

/**
 * The wordmark's leading V, on its own — the monogram used at favicon sizes.
 *
 * Deliberately a slice of the wordmark rather than a second drawing: it is the
 * same letterform in the same typeface, so the small icon is a crop of the
 * brand rather than a rival mark. Notably it is *not* the pre-2026-08-20
 * chevron, which was a hand-drawn path with rounded joins and no relationship
 * to the wordmark at all.
 *
 * Bounding box: x 146-268, y 447-574 (122 x 127), centred at (207, 510.5).
 */
export const MONOGRAM_PATH =
  'M146 447 174 447 176 449 207 544 209 543 239 449 241 447 268 447 267 454 223 574 190 573 148 457Z'

/** The remaining five letterforms, ERTEX. Only ever rendered after the V. */
const WORDMARK_TAIL_PATH =
  'M280 448 381 448 381 470 308 470 308 498 373 498 373 520 308 520 308 551 382 551 382 574 280 574ZM401 448 478 448 493 452 505 462 512 480 511 499 502 516 500 516 496 521 492 522 491 525 516 574 486 574 464 528 428 528 428 574 401 574ZM428 470 428 506 471 506 481 500 484 492 484 482 482 477 477 472 472 470ZM522 448 631 448 631 471 590 471 590 574 562 574 562 471 522 471ZM644 448 745 448 745 470 672 470 672 498 737 498 737 520 672 520 672 551 746 551 746 574 644 574ZM757 448 791 448 816 488 818 488 843 448 875 448 842 497 839 499 834 509 841 517 879 574 845 574 816 528 812 530 811 534 801 547 785 574 753 574 795 511 798 509 795 502 792 500Z'

/**
 * All six VERTEX letterforms as one compound path, in 1024-grid coordinates.
 * Composed from the monogram so the V exists exactly once in this file.
 *
 * Needs `fill-rule="evenodd"` — the R's counter is a separate loop, not a
 * reverse-wound subpath.
 *
 * Bounding box: x 146-878, y 447-574. That puts every corner within 372px of
 * the centre, comfortably inside the 409.6px radius of Android's maskable
 * safe zone, which is why the bleed plate needs no extra inset.
 */
export const WORDMARK_PATH = MONOGRAM_PATH + WORDMARK_TAIL_PATH

/**
 * Monogram cap height, as a fraction of the 1024 grid.
 *
 * Tuned by rendering 44/50/55/60% at 16px and 32px and looking at them. 55%
 * puts the stem at 1.93px on a 16px favicon — thick enough to survive
 * anti-aliasing as a legible letter — while keeping the arm tips 388px from
 * centre, comfortably inside the 512px disc. 60% starts to crowd the disc
 * edge; 50% goes thin and timid at 16px.
 */
export const MONOGRAM_CAP_RATIO = 560 / MARK_SIZE

/**
 * `disc` — the mark proper: a #0E0E0E circle, transparent outside it. Correct
 * anywhere the host surface shows through and may be light or dark: browser
 * tabs, `purpose: "any"` manifest icons, the knowledge-panel logo.
 *
 * `bleed` — a full-bleed #0E0E0E square, no disc. Correct where the platform
 * imposes its own silhouette and discards alpha: iOS squircle-masks the Apple
 * touch icon and paints transparency black, and Android crops
 * `purpose: "maskable"` to its own shape. Nesting a circle inside either mask
 * reads as a mistake, so the plate is squared off.
 */
export type MarkPlate = 'disc' | 'bleed'

/**
 * `wordmark` — the full VERTEX lockup. The brand mark proper, for anything
 * rendered at roughly 48px and up.
 *
 * `monogram` — the V alone, scaled to `MONOGRAM_CAP_RATIO`. For favicon
 * surfaces, where six letters cannot physically resolve: at 16px the wordmark
 * has a ~2px cap height and reads as a light smear across a dark disc.
 *
 * Which surface gets which is decided in `scripts/build-brand-icons.ts`.
 */
export type MarkGlyph = 'wordmark' | 'monogram'

export interface BrandMarkOptions {
  /** Default `'disc'`. */
  plate?: MarkPlate
  /** Default `'wordmark'`. */
  glyph?: MarkGlyph
  /** Emits a `<title>`; omit for decorative uses. */
  title?: string
}

/** Renders the mark as a standalone SVG document. */
export function brandMarkSvg({
  plate = 'disc',
  glyph = 'wordmark',
  title,
}: BrandMarkOptions = {}): string {
  const plateEl =
    plate === 'disc'
      ? `<circle cx="512" cy="512" r="512" fill="${MARK_BG}"/>`
      : `<rect width="1024" height="1024" fill="${MARK_BG}"/>`

  // The monogram is scaled about its own bbox centre and re-centred on the
  // disc, as a transform rather than baked coordinates, so MONOGRAM_PATH stays
  // byte-identical to the slice of WORDMARK_PATH it came from.
  let art = `<path d="${WORDMARK_PATH}" fill="${MARK_FG}" fill-rule="evenodd"/>`
  if (glyph === 'monogram') {
    const scale = (MONOGRAM_CAP_RATIO * MARK_SIZE) / 127
    const tx = 512 - 207 * scale
    const ty = 512 - 510.5 * scale
    art =
      `<g transform="translate(${round(tx)} ${round(ty)}) scale(${round(scale, 5)})">` +
      `<path d="${MONOGRAM_PATH}" fill="${MARK_FG}"/></g>`
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK_SIZE} ${MARK_SIZE}" role="img" aria-label="Vertex">`,
    title ? `<title>${title}</title>` : '',
    plateEl,
    art,
    '</svg>',
  ]
    .filter(Boolean)
    .join('')
}

/**
 * The mark as a `data:` URI, for renderers that take an image source rather
 * than markup — chiefly satori (`next/og`), which powers the Open Graph card.
 */
export function brandMarkDataUri(options: BrandMarkOptions = {}): string {
  const svg = brandMarkSvg(options)
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

/** Trims trailing zeros so the emitted SVG has no `4.40000` noise. */
function round(value: number, places = 3): string {
  return String(Number(value.toFixed(places)))
}
