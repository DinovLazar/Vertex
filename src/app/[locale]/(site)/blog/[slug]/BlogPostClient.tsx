'use client'

import React from 'react'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Section, AnimateIn } from '@/components/global'
import { BlogCard, CTABanner } from '@/components/sections'
import { getRelatedPosts, type BlogPost } from '@/lib/blog'
import { ArrowLeft, Clock } from 'lucide-react'
import { siteConfig } from '@/config/site'
import type { Locale } from '@/i18n/routing'

interface BlogPostClientProps {
  post: BlogPost
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const tPost = useTranslations('blog.post')
  const tBlogChrome = useTranslations('sections.blog')
  const locale = useLocale() as Locale
  const format = useFormatter()

  const related = getRelatedPosts(post.slug, locale, 2)

  const formattedDate = format.dateTime(new Date(post.publishedAt), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const divisionLabel = tBlogChrome(`divisionLabels.${post.division}`)

  // BlogPosting structured data. URL stays locale-aware so canonical reflects
  // the locale the visitor is on. `inLanguage` tags the post for bilingual SEO.
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorRole,
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    url: `${siteConfig.url}/${locale}/blog/${post.slug}`,
    inLanguage: locale === 'mk' ? 'mk-MK' : 'en-US',
    keywords: post.tags.join(', '),
  }

  return (
    <>
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      {/* Back link. Tighter top (was pt-16/md:pt-24 — ~96px desktop was too
          much over the navbar). `md:pb-0` actually zeroes desktop bottom
          padding, letting the header flow immediately underneath. */}
      <Section className="pt-10 md:pt-16 pb-0 md:pb-0">
        <AnimateIn>
          <Link
            href="/blog"
            className="inline-flex items-center min-h-[44px] gap-2 text-small text-[var(--division-text-muted)] hover:text-[var(--division-text-primary)] transition-colors mb-8 focus-ring"
          >
            <ArrowLeft size={14} />
            <span>{tPost('backLink')}</span>
          </Link>
        </AnimateIn>
      </Section>

      {/* Header. `md:pt-0` strips desktop top padding; `pb-10 md:pb-12`
          gives the author block a tight separation from the first body
          paragraph (was inheriting 80/112px default pb — that was the
          ~150px gap the user reported). */}
      <Section className="pt-0 md:pt-0 pb-10 md:pb-12">
        <AnimateIn>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="overline text-[var(--division-accent)]">
                {divisionLabel}
              </span>
              <span className="text-micro text-[var(--division-text-muted)]">·</span>
              <span className="text-micro text-[var(--division-text-muted)] tabular-nums">{formattedDate}</span>
              <span className="text-micro text-[var(--division-text-muted)]">·</span>
              <div className="flex items-center gap-1 text-micro text-[var(--division-text-muted)] tabular-nums">
                <Clock size={11} />
                <span>{post.readTime} {tPost('readTimeLong')}</span>
              </div>
            </div>
            <h1 className="text-h1 text-[var(--division-text-primary)]">
              {post.title}
            </h1>
            <p className="mt-4 text-body-lg text-[var(--division-text-secondary)]">
              {post.excerpt}
            </p>
            <div className="mt-6 pt-6 border-t border-[var(--division-border)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[var(--division-border)] bg-[var(--division-card)] flex items-center justify-center">
                <span className="font-heading text-small font-bold text-[var(--division-text-muted)]">
                  {post.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <div>
                <p className="font-heading text-small font-semibold text-[var(--division-text-primary)]">
                  {post.author}
                </p>
                <p className="text-micro text-[var(--division-text-muted)]">{post.authorRole}</p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </Section>

      {/* Content. `md:pt-0` strips desktop top padding so the prose flows
          continuously from the header above. */}
      <Section className="pt-0 md:pt-0">
        <AnimateIn>
          <div className="prose-blog max-w-3xl">{renderContent(post.content)}</div>
        </AnimateIn>
      </Section>

      {/* Related posts */}
      {related.length > 0 && (
        <Section className="bg-[var(--division-surface)]">
          <AnimateIn>
            <h2 className="text-h2 text-[var(--division-text-primary)] mb-10">
              {tPost('relatedHeading')}
            </h2>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {related.map((r) => (
              <BlogCard key={r.slug} post={r} />
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <CTABanner />
    </>
  )
}

/**
 * Parses a post body string into React elements:
 *   `## heading` → <h2>
 *   `**bold**` → <strong>
 *   `[label](href)` → <Link> (internal, locale-aware) or <a> (external).
 */
function renderContent(content: string) {
  const blocks = content.split('\n\n')
  return blocks.map((block, i) => {
    const trimmed = block.trim()
    if (trimmed.startsWith('## ')) {
      return <h2 key={i}>{trimmed.slice(3)}</h2>
    }
    if (trimmed.startsWith('# ')) {
      return <h2 key={i}>{trimmed.slice(2)}</h2>
    }
    return <p key={i}>{renderInline(trimmed)}</p>
  })
}

function renderInline(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = []
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    if (match[1]) {
      nodes.push(<strong key={`s-${match.index}`}>{match[1]}</strong>)
    } else if (match[2] && match[3]) {
      const label = match[2]
      const href = match[3]
      if (href.startsWith('/')) {
        nodes.push(
          <Link key={`l-${match.index}`} href={href}>
            {label}
          </Link>
        )
      } else {
        nodes.push(
          <a
            key={`l-${match.index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        )
      }
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.map((node, i) =>
    typeof node === 'string' ? <React.Fragment key={`t-${i}`}>{node}</React.Fragment> : node
  )
}
