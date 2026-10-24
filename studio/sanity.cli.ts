import {defineCliConfig} from 'sanity/cli'

// The CLI (sanity dev / build / deploy) needs to know which project to use.
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
})
