/**
 * Captures the three "Our Work" client screenshots.
 *
 * Spec (matches the 2026-06-20 originals — do not change):
 *   - Viewport 1280×720, deviceScaleFactor 2 → 2560×1440 output (16:9)
 *   - Above-the-fold hero shot (fullPage: false)
 *   - Written to public/projects/<slug>.png
 *
 * URLs are the exact locale-specific pages the "Our Work" / /lazar cards link
 * to (see src/config/projects.ts + src/config/lazar.ts), so each screenshot
 * matches what a visitor sees when they click "View project".
 *
 * Filenames are fixed (northgate / sunset / daliborac) so no config change is
 * ever needed — re-run whenever a client site is redesigned:
 *
 *   node scripts/capture-projects.mjs
 *
 * Requires Playwright's Chromium (installed on-demand, not a committed dep):
 *   npm install --no-save playwright && npx playwright install chromium
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const TARGETS = [
  { slug: 'northgate', url: 'https://northgate.optimind000.com/en' },
  { slug: 'sunset', url: 'https://sunsetservices.vercel.app/' },
  { slug: 'daliborac', url: 'https://daliborac.vertexconsulting.mk/mk' },
];

const OUT_DIR = path.join(process.cwd(), 'public', 'projects');

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2, // → 2560×1440
    reducedMotion: 'reduce', // freeze hero animations so the shot is deterministic
  });

  const results = [];

  for (const { slug, url } of TARGETS) {
    const page = await context.newPage();
    try {
      console.log(`→ ${slug}: ${url}`);
      // Prefer a fully-idle network for a deterministic shot, but sites with
      // persistent analytics/websocket connections never reach 'networkidle';
      // fall back to 'load' so a chatty site doesn't fail the whole run.
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      } catch {
        console.log(`  · networkidle timed out — falling back to 'load'`);
        await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
      }

      // Let fonts, lazy images and any entry animation settle.
      await page.waitForLoadState('load');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(3000);

      // Dismiss a cookie banner if one is in the way (best-effort, non-fatal).
      for (const label of [/accept/i, /agree/i, /прифати/i, /се согласувам/i]) {
        const btn = page.getByRole('button', { name: label }).first();
        if (await btn.isVisible().catch(() => false)) {
          await btn.click().catch(() => {});
          await page.waitForTimeout(800);
          break;
        }
      }

      // Make sure we're at the very top.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      const out = path.join(OUT_DIR, `${slug}.png`);
      await page.screenshot({ path: out, fullPage: false, type: 'png' });
      results.push({ slug, ok: true, out });
      console.log(`  ✓ ${out}`);
    } catch (err) {
      results.push({ slug, ok: false, error: String(err) });
      console.error(`  ✗ ${slug} failed: ${err}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error(`\n${failed.length} capture(s) FAILED:`);
    failed.forEach((f) => console.error(`  - ${f.slug}: ${f.error}`));
    process.exit(1);
  }
  console.log('\nAll 3 screenshots captured.');
}

main();
