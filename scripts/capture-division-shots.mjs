/**
 * Captures the consulting + marketing landing pages as the blurred backdrops
 * behind the homepage division cards (`src/components/sections/DivisionSplit.tsx`).
 *
 * Usage:
 *   npm run dev            # in another shell
 *   npm run shots
 *
 * Against production instead (no local dev server needed):
 *   SHOT_BASE_URL=https://www.vertexconsulting.mk npm run shots
 *
 * Output: public/images/divisions/{consulting,marketing}.webp — 1600px wide,
 * WebP q72, both well under the 200 KB card budget. Re-run whenever either
 * landing hero is redesigned; the card markup never changes.
 *
 * Requires the committed `playwright` devDependency plus its Chromium:
 *   npx playwright install chromium
 */
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.SHOT_BASE_URL ?? 'http://localhost:3000'
const OUT = path.resolve('public/images/divisions')

const TARGETS = [
  { name: 'consulting', url: `${BASE}/en/consulting` },
  { name: 'marketing', url: `${BASE}/en/marketing` },
]

/**
 * Chrome-only furniture that must never appear inside a card. Verified
 * against the real DOM on 2026-08-29:
 *   header         Navbar (`src/components/global/Navbar.tsx`)
 *   .chat-trigger  chat launcher bubble (`src/components/chat/ChatWidget.tsx`)
 *   nextjs-portal  the dev-server error/indicator overlay
 * Everything else — the 2px ScrollProgress bar, the BackToTop pill, and any
 * future overlay — is caught by the computed-position sweep below rather than
 * by a hand-maintained selector list. Neither of those two carries a stable
 * class or a locale-independent aria-label, and both are `position: fixed`,
 * which no piece of actual page content on either landing page is.
 */
const HIDE = ['header', '.chat-trigger', 'nextjs-portal']

/**
 * Belt-and-braces: hide every `position: fixed` element in the document. All
 * three hero backdrops are `absolute inset-0`, so page content is untouched.
 */
function hideFixedChrome() {
  for (const el of document.querySelectorAll('body *')) {
    if (getComputedStyle(el).position === 'fixed') {
      el.style.setProperty('display', 'none', 'important')
    }
  }
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  // NOT `reducedMotion: 'reduce'`. Both heroes gate their backdrop on
  // `useShouldAnimate()` (`src/lib/useMediaQuery.ts`), so under reduce the
  // consulting hero collapses to a flat `--division-bg` rectangle and the
  // plasma hero falls back to its poster — the shot would be a blank panel
  // with a headline on it rather than the page a visitor actually sees. The
  // 4s settle below covers the GSAP plate drift and the video's first loop;
  // the card blurs the result to 3px anyway, so frame-level non-determinism
  // between runs is invisible.
  reducedMotion: 'no-preference',
})

const page = await context.newPage()

for (const target of TARGETS) {
  await page.goto(target.url, { waitUntil: 'networkidle', timeout: 60_000 })
  await page.addStyleTag({
    content: `${HIDE.join(',')} { display: none !important; }`,
  })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(4000) // let shaders + fonts settle
  // After the settle, not before: the chat bubble mounts on a delay.
  await page.evaluate(hideFixedChrome)

  const png = await page.screenshot({ type: 'png' })
  const file = path.join(OUT, `${target.name}.webp`)
  await sharp(png).resize({ width: 1600 }).webp({ quality: 72 }).toFile(file)

  const { size } = await stat(file)
  console.log(`captured ${target.name}.webp — ${(size / 1024).toFixed(1)} KB`)
  if (size > 200 * 1024) {
    console.warn(
      '  ⚠ over the 200 KB card budget — lower the webp quality or the width.',
    )
  }
}

await browser.close()
