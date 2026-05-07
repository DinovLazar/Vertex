import { defineType, defineField } from 'sanity'

export const topicBacklog = defineType({
  name: 'topicBacklog',
  title: 'Topic backlog',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'Working title (AI may refine)',
      description:
        'The seed topic — what the AI writes about. It will produce its own final title but this is the angle.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      type: 'localizedText',
      title: 'Notes / angle (optional)',
      description:
        'Extra context: specific points to cover, audience, tone. The AI reads this as guidance.',
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
      name: 'targetService',
      type: 'string',
      title: 'Target service page (optional)',
      description:
        'If this post is about one of the 8 service pages, link to it so the AI can reference and cross-link it.',
      options: {
        list: [
          { title: 'Consulting — Business Consulting', value: '/consulting/business-consulting' },
          { title: 'Consulting — Workflow Restructuring', value: '/consulting/workflow-restructuring' },
          { title: 'Consulting — IT Systems', value: '/consulting/it-systems' },
          { title: 'Consulting — AI Consulting', value: '/consulting/ai-consulting' },
          { title: 'Marketing — Web Design', value: '/marketing/web-design' },
          { title: 'Marketing — Social Media', value: '/marketing/social-media' },
          { title: 'Marketing — IT Infrastructure', value: '/marketing/it-infrastructure' },
          { title: 'Marketing — AI Development', value: '/marketing/ai-development' },
        ],
      },
    }),
    defineField({
      name: 'assignedAuthor',
      type: 'reference',
      title: 'Author (optional)',
      to: [{ type: 'author' }],
      description:
        'If set, this author is used on the generated post. Otherwise the generator picks based on division.',
    }),
    defineField({
      name: 'priority',
      type: 'number',
      title: 'Priority (1 = highest, 10 = lowest)',
      initialValue: 5,
      validation: (r) => r.required().min(1).max(10),
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Used', value: 'used' },
          { title: 'Skipped', value: 'skipped' },
          { title: 'Failed', value: 'failed' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'usedAt',
      type: 'datetime',
      title: 'Date used (set automatically)',
      readOnly: true,
    }),
    defineField({
      name: 'resultingPost',
      type: 'reference',
      title: 'Resulting post (set automatically)',
      to: [{ type: 'blogPost' }],
      readOnly: true,
    }),
    defineField({
      name: 'failureReason',
      type: 'text',
      title: 'Failure reason (set automatically on failure)',
      readOnly: true,
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: 'Pending — highest priority first',
      name: 'pendingByPriority',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'priority', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title.en',
      subtitle: 'status',
      description: 'division',
    },
    prepare({ title, subtitle, description }) {
      const statusEmoji =
        subtitle === 'pending'
          ? '⏳'
          : subtitle === 'used'
            ? '✅'
            : subtitle === 'failed'
              ? '❌'
              : '⏭️'
      return { title, subtitle: `${statusEmoji} ${subtitle} · ${description}` }
    },
  },
})
