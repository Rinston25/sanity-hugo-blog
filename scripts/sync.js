// Fetches content from Sanity and writes it as Markdown files that Hugo can build.
import 'dotenv/config'
import { createClient } from '@sanity/client'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { portableTextToMarkdown } from './portableTextToMarkdown.js'

if (!process.env.SANITY_PROJECT_ID) {
  console.error('Missing SANITY_PROJECT_ID. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2025-01-01',
  useCdn: false, // always read fresh content at build time, not a cached copy
})

// Resolve paths from this file so the script works from any folder.
const rootFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentFolder = path.join(rootFolder, 'site', 'content')

// One simple query per document type. "->" follows a reference and "slug.current" reads the slug text.
const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  body,
  "heroUrl": heroImage.asset->url,
  "heroAlt": heroImage.alt,
  "categorySlug": category->slug.current,
  "authorSlug": author->slug.current
}`

const categoriesQuery = `*[_type == "category"] {
  title,
  "slug": slug.current,
  description
}`

const authorsQuery = `*[_type == "author"] {
  name,
  "slug": slug.current,
  bio,
  "imageUrl": image.asset->url,
  "imageAlt": image.alt
}`

// Builds the "---" block at the top of a Markdown file.
// JSON.stringify gives us safely quoted strings and lists, and valid JSON is valid YAML,
// so titles containing quotes or colons cannot break the front matter.
// Empty values are left out so optional fields simply do not appear.
function buildFrontMatter(fields) {
  const lines = []
  for (const [name, value] of Object.entries(fields)) {
    const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
    if (!isEmpty) lines.push(`${name}: ${JSON.stringify(value)}`)
  }
  return `---\n${lines.join('\n')}\n---\n`
}

// Sanity serves resized images from its CDN, so we link to them instead of downloading.
function imageUrl(url, width) {
  return url ? `${url}?w=${width}&auto=format` : ''
}

// Removes the files created by the last run so deleted posts do not linger.
async function clearOldContent() {
  for (const folder of ['posts', 'authors', 'categories']) {
    await rm(path.join(contentFolder, folder), { recursive: true, force: true })
  }
}

async function writePost(post) {
  const frontMatter = buildFrontMatter({
    title: post.title,
    date: post.publishedAt,
    description: post.excerpt,
    heroImage: imageUrl(post.heroUrl, 1200),
    heroAlt: post.heroAlt,
    categories: post.categorySlug ? [post.categorySlug] : [],
    authors: post.authorSlug ? [post.authorSlug] : [],
  })
  const body = portableTextToMarkdown(post.body)

  const folder = path.join(contentFolder, 'posts')
  await mkdir(folder, { recursive: true })
  await writeFile(path.join(folder, `${post.slug}.md`), `${frontMatter}\n${body}\n`)
}

async function writeCategory(category) {
  const frontMatter = buildFrontMatter({
    title: category.title,
    description: category.description,
  })

  const folder = path.join(contentFolder, 'categories', category.slug)
  await mkdir(folder, { recursive: true })
  await writeFile(path.join(folder, '_index.md'), frontMatter)
}

async function writeAuthor(author) {
  const frontMatter = buildFrontMatter({
    title: author.name,
    bio: author.bio,
    image: imageUrl(author.imageUrl, 400),
    imageAlt: author.imageAlt,
  })

  const folder = path.join(contentFolder, 'authors', author.slug)
  await mkdir(folder, { recursive: true })
  await writeFile(path.join(folder, '_index.md'), frontMatter)
}

// Writes every item that has a slug and warns about the rest. Returns how many were written.
async function writeAll(items, kind, writeItem) {
  let count = 0
  for (const item of items) {
    if (!item.slug) {
      console.warn(`Warning: skipped a ${kind} with no slug (${item.title || item.name || 'untitled'})`)
      continue
    }
    await writeItem(item)
    count += 1
  }
  return count
}

try {
  // Fetch everything first, so a network error does not leave us with half-deleted content.
  const [posts, categories, authors] = await Promise.all([
    client.fetch(postsQuery),
    client.fetch(categoriesQuery),
    client.fetch(authorsQuery),
  ])

  await clearOldContent()
  const postCount = await writeAll(posts, 'post', writePost)
  const categoryCount = await writeAll(categories, 'category', writeCategory)
  const authorCount = await writeAll(authors, 'author', writeAuthor)

  console.log(`Synced ${postCount} posts, ${categoryCount} categories, ${authorCount} authors`)
} catch (error) {
  console.error('Sync failed:', error.message)
  process.exit(1)
}
