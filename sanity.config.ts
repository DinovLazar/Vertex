import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schemas'

export default defineConfig({
  name: 'vertex-blog',
  title: 'Vertex Blog',

  // Fall back to inert placeholders so the Studio config (imported by the
  // force-static /studio route) never throws at build when the CMS env vars
  // are absent. With the vars set, these resolve to the real values.
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'unconfigured',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  basePath: '/studio',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
