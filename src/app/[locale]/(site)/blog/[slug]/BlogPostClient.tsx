'use client'

import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { Section, AnimateIn } from '@/components/global'
import { BlogCard, CTABanner } from '@/components/sections'
import type { BlogPost } from '@/lib/blog'
import { ArrowLeft, Clock } from 'lucide-react'
import { siteConfig } from '@/config/site'
import type { Locale } from '@/i18n/routing'

// Portable Text → React mapping. Inline links are split: internal paths
// (`/...`) go through the locale-aware <Link> so the prefix is preserved;
// everything else opens in a new tab with safe rel attributes.
const portableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href ?? '#'
      if (href.startsWith('/')) {
        return <Link href={href}>{children}</Link>
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    },
  },
}

interface BlogPostClientProps {
  post: BlogPost
  related: BlogPost[]
}

export default function BlogPostClient({ post, related }: BlogPostClientProps) {
  const tPost = useTranslations('blog.post')
  const tBlogChrome = useTranslations('sections.blog')
  const locale = useLocale() as Locale
  const format = useFormatter()

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
      name: post.author.name,
      jobTitle: post.author.role,
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
                  {post.author.initials}
                </span>
              </div>
              <div>
                <p className="font-heading text-small font-semibold text-[var(--division-text-primary)]">
                  {post.author.name}
                </p>
                <p className="text-micro text-[var(--division-text-muted)]">{post.author.role}</p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </Section>

      {/* Content. `md:pt-0` strips desktop top padding so the prose flows
          continuously from the header above. */}
      <Section className="pt-0 md:pt-0">
        <AnimateIn>
          <div className="prose-blog max-w-3xl">
            <PortableText value={post.body} components={portableTextComponents} />
          </div>
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
