import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * robots.txt
 *
 * Two audiences, deliberately handled separately:
 *
 * 1. Classic search crawlers (Googlebot, Bingbot, …) — allowed everywhere
 *    except thin/no-index routes and non-public surfaces.
 * 2. AI/LLM crawlers — explicitly named and allowed. Naming them matters:
 *    several (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) treat an
 *    absent rule conservatively, and some CDN/hosting defaults block them
 *    wholesale. Listing them is how the site becomes quotable in ChatGPT,
 *    Claude, Perplexity and Google's AI Overviews.
 *
 * Blocked for everyone: `/api/`, `/studio` and `/admin` (private surfaces),
 * plus `/privacy` and `/thank-you`, which already carry `noIndex` metadata.
 */

// Crawlers used to build or ground AI answers. Allowed on purpose — this is a
// marketing site, and being cited in an AI answer is the point.
const AI_CRAWLERS = [
  'GPTBot', // OpenAI — training + ChatGPT browsing
  'OAI-SearchBot', // OpenAI — ChatGPT search index
  'ChatGPT-User', // OpenAI — live fetch on a user's behalf
  'ClaudeBot', // Anthropic — index
  'Claude-Web', // Anthropic — legacy
  'Claude-User', // Anthropic — live fetch on a user's behalf
  'Claude-SearchBot', // Anthropic — search index
  'anthropic-ai', // Anthropic — legacy
  'PerplexityBot', // Perplexity — index
  'Perplexity-User', // Perplexity — live fetch
  'Google-Extended', // Google — Gemini / AI Overviews grounding
  'Applebot-Extended', // Apple — Apple Intelligence
  'Bingbot', // Microsoft — Bing + Copilot
  'DuckAssistBot', // DuckDuckGo
  'meta-externalagent', // Meta AI
  'Amazonbot', // Amazon / Alexa
  'cohere-ai',
  'YouBot',
]

// Disallow is a prefix match, so `/studio` already covers `/studio/anything`
// — the trailing-slash duplicates that used to sit here were redundant.
const DISALLOW = [
  '/api/',
  '/studio',
  '/admin',
  '/en/privacy',
  '/mk/privacy',
  '/en/thank-you',
  '/mk/thank-you',
]

// Both crawler-facing text files. Listed explicitly in every Allow group:
// they sit under a `Disallow`-free path already, but naming them makes the
// intent unambiguous to crawlers that resolve the most specific rule first.
const LLM_FILES = ['/llms.txt', '/llms-full.txt']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', ...LLM_FILES],
        disallow: DISALLOW,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: ['/', ...LLM_FILES],
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
