'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'motion/react'
import { Section, AnimateIn } from '@/components/global'
import { BlogCard, CTABanner } from '@/components/sections'
import { Button } from '@/components/ui/button'
import { staggerContainer, staggerItem } from '@/lib/animations'
import type { BlogPost } from '@/lib/blog'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'consulting' | 'marketing' | 'shared'

const FILTERS: Filter[] = ['all', 'consulting', 'marketing', 'shared']

interface BlogListingClientProps {
  posts: BlogPost[]
}

export default function BlogListingClient({ posts }: BlogListingClientProps) {
  const t = useTranslations('blog.listing')
  const [filter, setFilter] = useState<Filter>('all')
  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.division === filter)

  return (
    <>
      {/* Header. `md:pb-8` actually zeroes desktop bottom padding override. */}
      <Section className="pt-16 md:pt-24 pb-8 md:pb-8">
        <AnimateIn>
          <p className="overline text-[var(--division-accent)] mb-4">
            {t('hero.overline')}
          </p>
          <h1 className="text-h1 text-[var(--division-text-primary)] max-w-3xl">
            {t('hero.headline')}
          </h1>
          <p className="mt-4 text-body-lg text-[var(--division-text-secondary)] max-w-2xl">
            {t('hero.subtitle')}
          </p>
        </AnimateIn>
      </Section>

      {/* Filters. Both pt and pb need md: variants to take effect on desktop. */}
      <Section className="pt-0 md:pt-0 pb-8 md:pb-8">
        <AnimateIn>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((value) => {
              const isActive = filter === value
              return (
                <Button
                  key={value}
                  size="pill"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setFilter(value)}
                  className={cn(
                    isActive
                      ? 'bg-[var(--division-accent)] text-[var(--division-bg)] hover:bg-[var(--division-accent)]'
                      : 'border-[var(--division-border)] bg-transparent text-[var(--division-text-secondary)] hover:bg-transparent hover:text-[var(--division-text-primary)] hover:border-white/20'
                  )}
                >
                  {t(`filters.${value}`)}
                </Button>
              )
            })}
          </div>
        </AnimateIn>
      </Section>

      {/* Posts grid. `md:pt-0` strips desktop top padding. */}
      <Section className="pt-0 md:pt-0">
        {filteredPosts.length === 0 ? (
          <AnimateIn>
            <div className="text-center py-16 border border-dashed border-[var(--division-border)] rounded-card">
              <h3 className="text-h3 text-[var(--division-text-secondary)]">
                {t('empty.title')}
              </h3>
              <p className="mt-2 text-small text-[var(--division-text-muted)]">
                {t('empty.subtitle')}
              </p>
            </div>
          </AnimateIn>
        ) : (
          <motion.div
            key={filter}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredPosts.map((post) => (
              <motion.div key={post.slug} variants={staggerItem}>
                <BlogCard post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </Section>

      {/* CTA */}
      <CTABanner />
    </>
  )
}
