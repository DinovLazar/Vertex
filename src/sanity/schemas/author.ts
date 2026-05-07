import { defineType, defineField } from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Full name',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'initials',
      type: 'string',
      title: 'Initials (1–3 chars)',
      validation: (r) => r.required().max(3),
    }),
    defineField({
      name: 'role',
      type: 'localizedString',
      title: 'Role / title',
    }),
    defineField({
      name: 'division',
      type: 'string',
      title: 'Division',
      options: {
        list: [
          { title: 'Consulting', value: 'consulting' },
          { title: 'Marketing', value: 'marketing' },
          { title: 'Shared', value: 'shared' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Photo (optional)',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'division',
      media: 'image',
    },
  },
})
