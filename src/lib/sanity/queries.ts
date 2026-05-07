import { groq } from 'next-sanity'

// All published-post projections share this field shape so `collapse()` in
// `lib/blog.ts` can treat every response identically regardless of query.
export const blogPostFields = groq`
  _id,
  "slug": slug.current,
  title,
  excerpt,
  body,
  "author": author->{
    name,
    initials,
    role,
    division,
    "image": image.asset->url
  },
  division,
  publishedAt,
  readTime,
  tags,
  featuredImage {
    alt,
    asset->{
      url,
      metadata { dimensions, lqip }
    }
  }
`

export const allPublishedPostsQuery = groq`
  *[_type == "blogPost" && status == "published"] | order(publishedAt desc) {
    ${blogPostFields}
  }
`

export const postBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
    ${blogPostFields}
  }
`

export const postsByDivisionQuery = groq`
  *[_type == "blogPost" && status == "published" && division == $division] | order(publishedAt desc) {
    ${blogPostFields}
  }
`

export const relatedPostsQuery = groq`
  *[_type == "blogPost" && status == "published" && division == $division && slug.current != $excludeSlug] | order(publishedAt desc) [0...$limit] {
    ${blogPostFields}
  }
`

export const allSlugsQuery = groq`
  *[_type == "blogPost" && status == "published"].slug.current
`
