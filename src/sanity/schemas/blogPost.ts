import { defineType, defineField } from 'sanity'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'Title',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug (shared EN/MK, lowercase, hyphens)',
      options: {
        source: (doc: Record<string, unknown>) => {
          const title = doc?.title as { en?: string } | undefined
          return title?.en ?? ''
        },
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'localizedText',
      title: 'Excerpt (shown on cards + social)',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'body',
      type: 'localizedPortableText',
      title: 'Body content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      title: 'Author',
      to: [{ type: 'author' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'division',
      type: 'string',
      title: 'Division',
      options: {
        list: [
          { title: 'Consulting', value: 'consulting' },
          { title: 'Marketing', value: 'marketing' },
          { title: 'Shared / general', value: 'shared' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Publish date',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'readTime',
      type: 'number',
      title: 'Read time (minutes)',
      validation: (r) => r.required().min(1).max(60),
    }),
    defineField({
      name: 'tags',
      type: 'object',
      title: 'Tags',
      fields: [
        { name: 'en', type: 'array', of: [{ type: 'string' }], title: 'English tags' },
        { name: 'mk', type: 'array', of: [{ type: 'string' }], title: 'Macedonian tags' },
      ],
    }),
    defineField({
      name: 'featuredImage',
      type: 'image',
      title: 'Featured image (optional for now, required in Phase 13C)',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'localizedString', title: 'Alt text (for accessibility + SEO)' },
      ],
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Publication status',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'division',
      media: 'featuredImage',
    },
  },
})
