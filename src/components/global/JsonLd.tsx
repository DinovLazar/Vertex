/**
 * Renders a schema.org JSON-LD block.
 *
 * Server component — no `'use client'`. Emitting structured data on the
 * server means it's present in the initial HTML, which is what both
 * Googlebot and non-JS-executing LLM crawlers actually read.
 *
 * `<` is escaped to `<` so a stray closing tag inside translated
 * content can't break out of the script element.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
