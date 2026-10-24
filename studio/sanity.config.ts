import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

// The Studio reads these from studio/.env (see studio/.env.example).
// Variables must start with SANITY_STUDIO_ to be visible in the browser.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineConfig({
  name: 'default',
  title: 'Blog CMS',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {types: schemaTypes},
})
