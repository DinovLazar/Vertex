import { defineType, defineField } from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized string',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'mk', title: 'Macedonian', type: 'string', validation: (r) => r.required() }),
  ],
})

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized text',
  type: 'object',
  fields: [
    defineField({ name: 'en', title: 'English', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'mk', title: 'Macedonian', type: 'text', rows: 3, validation: (r) => r.required() }),
  ],
})

const portableTextBlockDef = {
  type: 'block' as const,
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'H2', value: 'h2' },
  ],
  lists: [{ title: 'Bullet', value: 'bullet' }],
  marks: {
    decorators: [
      { title: 'Bold', value: 'strong' },
      { title: 'Emphasis', value: 'em' },
    ],
    annotations: [
      {
        name: 'link',
        type: 'object' as const,
        title: 'Link',
        fields: [
          {
            name: 'href',
            type: 'string',
            title: 'URL (internal like /consulting/ai-consulting or external like https://...)',
          },
        ],
      },
    ],
  },
}

export const localizedPortableText = defineType({
  name: 'localizedPortableText',
  title: 'Localized portable text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English body',
      type: 'array',
      of: [portableTextBlockDef],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'mk',
      title: 'Macedonian body',
      type: 'array',
      of: [portableTextBlockDef],
      validation: (r) => r.required().min(1),
    }),
  ],
})
