'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'motion/react'
import { ArrowRight, Clock } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'
import BorderGlow from '@/components/ui/BorderGlow'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  const t = useTranslations('sections.blog')
  const format = useFormatter()

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

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.3 }} className="h-full">
      <BorderGlow
        className="h-full"
        colors={['#F5F5F5', '#C9C9C9', '#A3A3A3']}
        glowColor="0 0 85"
        backgroundColor="#1C1C1C"
        borderRadius={12}
        glowRadius={40}
        glowIntensity={0.8}
        coneSpread={25}
        animated={false}
      >
        <Link
          href={`/blog/${post.slug}`}
          className="group block p-6 h-full focus-ring"
          aria-label={t('readMoreAria')}
        >
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
          <h3 className="text-h3 text-[var(--division-text-primary)] group-hover:text-white transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="mt-3 text-small text-[var(--division-text-muted)] line-clamp-3">
            {post.excerpt}
          </p>

          {/* Author + read more */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-micro text-[var(--division-text-muted)]">
              {t('authorBy')} <span className="text-[var(--division-text-secondary)]">{post.author}</span>
            </p>
            <div className="flex items-center gap-1 text-micro font-medium text-[var(--division-text-secondary)] group-hover:text-[var(--division-text-primary)] transition-colors">
              <span>{t('readLabel')}</span>
              <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </BorderGlow>
    </motion.article>
  )
}
