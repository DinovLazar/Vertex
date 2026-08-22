import type { PortableTextBlock } from '@portabletext/types'

/**
 * JSON schema passed to Claude's tool_use for structured blog post output.
 * Using tool_use guarantees Claude's response is valid JSON matching this shape —
 * no prompt-engineering for JSON format, no parse retries needed.
 */

export const TOOL_NAME = 'submit_blog_post'

export const toolSchema = {
  name: TOOL_NAME,
  description: 'Submit a finished blog post. Call this exactly once. All fields required.',
  input_schema: {
    type: 'object',
    properties: {
      title: {
        type: 'object',
        description: 'Final post title in both languages. 40–80 chars each.',
        properties: {
          en: { type: 'string', minLength: 10, maxLength: 120 },
          mk: { type: 'string', minLength: 10, maxLength: 120 },
        },
        required: ['en', 'mk'],
      },
      slug: {
        type: 'string',
        description:
          'URL slug, lowercase, hyphenated, derived from the English title. 4–10 words max.',
        pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      },
      excerpt: {
        type: 'object',
        description: 'Short summary for cards and social previews. 120–200 chars each.',
        properties: {
          en: { type: 'string', minLength: 80, maxLength: 280 },
          mk: { type: 'string', minLength: 80, maxLength: 280 },
        },
        required: ['en', 'mk'],
      },
      body: {
        type: 'object',
        description:
          'Full post body as Portable Text blocks in both languages. 500-800 words each (tight, keep it focused). Use h2 for section headings, normal for paragraphs, bullet lists where appropriate. Include 1-2 internal links to the target service page if one is provided.',
        properties: {
          en: {
            type: 'array',
            minItems: 6,
            items: { $ref: '#/definitions/ptBlock' },
          },
          mk: {
            type: 'array',
            minItems: 6,
            items: { $ref: '#/definitions/ptBlock' },
          },
        },
        required: ['en', 'mk'],
      },
      tags: {
        type: 'object',
        description:
          'Topical tags. 3–5 per language. Lowercase. Translate concepts, not word-for-word.',
        properties: {
          en: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
          mk: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
        },
        required: ['en', 'mk'],
      },
      readTime: {
        type: 'integer',
        description: 'Estimated read time in minutes. Typical range 4–8 for a 700–1000 word post.',
        minimum: 3,
        maximum: 15,
      },
      pexelsQuery: {
        type: 'string',
        description:
          'A 2-4 word English phrase to search Pexels for a featured image. Concrete nouns only (e.g. "office whiteboard planning", "laptop coffee desk"). Avoid abstract concepts.',
        minLength: 5,
        maxLength: 60,
      },
      imageAlt: {
        type: 'object',
        description:
          'Accessible alt text for the featured image in both languages. Describes what is visible, not the post topic. 50–120 chars.',
        properties: {
          en: { type: 'string', minLength: 20, maxLength: 200 },
          mk: { type: 'string', minLength: 20, maxLength: 200 },
        },
        required: ['en', 'mk'],
      },
      facebookCaption: {
        type: 'string',
        description:
          'A 1-3 sentence caption for the Facebook Page post, in Macedonian (Cyrillic). ' +
          'Direct and practical, no hashtags, no emojis, no hype. ' +
          'Will appear above an auto-generated link preview card. 80-300 chars.',
        minLength: 40,
        maxLength: 400,
      },
      instagramCaption: {
        type: 'string',
        description:
          'An Instagram caption in Macedonian (Cyrillic). 2-4 short paragraphs of value-forward content ' +
          '(NOT a direct restatement of the blog excerpt), followed by the line ' +
          '"Повеќе на vertexconsulting.mk, линкот е во био.", followed by an empty line, ' +
          'then 5-10 relevant hashtags on one line separated by spaces. ' +
          'Include at least one Macedonian hashtag (e.g. #македонскибизнис, #скопје, #струмица). ' +
          'Max 1 emoji total, ideally zero. Total length 400-1500 chars.',
        minLength: 200,
        maxLength: 2000,
      },
    },
    required: [
      'title',
      'slug',
      'excerpt',
      'body',
      'tags',
      'readTime',
      'pexelsQuery',
      'imageAlt',
      'facebookCaption',
      'instagramCaption',
    ],
    definitions: {
      ptBlock: {
        type: 'object',
        description:
          'A Portable Text block. _type is always "block". style is "normal" or "h2". listItem is "bullet" for list items (omit otherwise). markDefs holds link definitions; children holds text spans.',
        properties: {
          _type: { const: 'block' },
          _key: { type: 'string' },
          style: { enum: ['normal', 'h2'] },
          listItem: { enum: ['bullet'] },
          level: { type: 'integer' },
          markDefs: { type: 'array' },
          children: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _type: { const: 'span' },
                _key: { type: 'string' },
                text: { type: 'string' },
                marks: { type: 'array', items: { type: 'string' } },
              },
              required: ['_type', '_key', 'text', 'marks'],
            },
          },
        },
        required: ['_type', '_key', 'style', 'markDefs', 'children'],
      },
    },
  },
} as const

/** Types downstream consumers work with — matches the tool's `input_schema`. */
export interface GeneratedPost {
  title: { en: string; mk: string }
  slug: string
  excerpt: { en: string; mk: string }
  body: {
    en: PortableTextBlock[]
    mk: PortableTextBlock[]
  }
  tags: { en: string[]; mk: string[] }
  readTime: number
  pexelsQuery: string
  imageAlt: { en: string; mk: string }
  facebookCaption: string
  instagramCaption: string
}
