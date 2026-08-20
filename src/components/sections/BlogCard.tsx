'use client'

import Image from 'next/image'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'motion/react'
import { ArrowRight, Clock } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'
import type { Locale } from '@/i18n/routing'
import BorderGlow from '@/components/ui/BorderGlow'

interface BlogCardProps {
  post: BlogPost
  /** Render the featured image as eager / priority. Set true for the first
   *  card on the listing page so the LCP image preloads instead of going
   *  through the lazy queue. */
  eager?: boolean
  /** Heading level for the card title. The card is reused in two places that
   *  sit at different depths: the /blog listing renders cards directly under
   *  the page <h1>, so they must be <h2>, while the related-posts strip on a
   *  post page sits under its own "Related posts" <h2>, so <h3> is right
   *  there. Hardcoding h3 made the listing skip from h1 straight to h3
   *  (WCAG 1.3.1). Defaults to 3 — the related-posts case. */
  headingLevel?: 2 | 3
}

export default function BlogCard({ post, eager = false, headingLevel = 3 }: BlogCardProps) {
  const Heading = (headingLevel === 2 ? 'h2' : 'h3') as 'h2' | 'h3'
  const t = useTranslations('sections.blog')
  const format = useFormatter()
  const locale = useLocale() as Locale

  const divisionLabel = t(`divisionLabels.${post.division}`)

  // Neutral indicator — division is signaled by the label, not by color.
  const divisionColor = 'var(--division-text-muted)'

  // Use next-intl's formatter — it uses the active request locale on both the
  // server and client, avoiding hydration mismatches from Intl API differences
  // between Node and the browser.
  const formattedDate = format.dateTime(new Date(post.publishedAt), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const image = post.featuredImage
  const imageAlt = image?.alt?.[locale] ?? post.title

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.3 }} className="h-full">
      <BorderGlow
        className="h-full"
        borderRadius={12}
        glowRadius={40}
        glowIntensity={0.8}
        coneSpread={25}
        animated={false}
      >
        <Link
          href={`/blog/${post.slug}`}
          className="group block h-full focus-ring overflow-hidden rounded-[12px]"
          aria-label={t('readMoreAria')}
        >
          {image && (
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={image.url}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder={image.lqip ? 'blur' : 'empty'}
                blurDataURL={image.lqip ?? undefined}
                priority={eager}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="p-6">
            {/* Division + meta */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: divisionColor }}
                />
                <span className="overline text-[var(--division-text-muted)]">
                  {divisionLabel}
                </span>
              </div>
              <span className="text-micro text-[var(--division-text-muted)]">·</span>
              <span className="text-micro text-[var(--division-text-muted)] tabular-nums">{formattedDate}</span>
              <span className="text-micro text-[var(--division-text-muted)]">·</span>
              <div className="flex items-center gap-1 text-micro text-[var(--division-text-muted)] tabular-nums">
                <Clock size={11} />
                <span>{post.readTime} {t('readTimeSuffix')}</span>
              </div>
            </div>

            {/* Title */}
            <Heading className="text-h3 text-[var(--division-text-primary)]">
              {post.title}
            </Heading>

            {/* Excerpt */}
            <p className="mt-3 text-small text-[var(--division-text-muted)] line-clamp-3">
              {post.excerpt}
            </p>

            {/* Author + read more */}
            <div className="mt-5 flex items-center justify-between">
              <p className="text-micro text-[var(--division-text-muted)]">
                {t('authorBy')} <span className="text-[var(--division-text-secondary)]">{post.author.name}</span>
              </p>
              <div className="flex items-center gap-1 text-micro font-medium text-[var(--division-text-secondary)] group-hover:text-[var(--division-text-primary)] transition-colors">
                <span>{t('readLabel')}</span>
                <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </BorderGlow>
    </motion.article>
  )
}
