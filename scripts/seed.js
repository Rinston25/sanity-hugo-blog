// Creates sample categories, authors and posts in Sanity.
// Safe to run more than once: fixed _id values + createOrReplace means no duplicates.
import 'dotenv/config'
import { createClient } from '@sanity/client'
import { categories, authors, posts } from './seedData.js'

const token = process.env.SANITY_WRITE_TOKEN
if (!process.env.SANITY_PROJECT_ID || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN. Copy .env.example to .env and fill them in.')
  process.exit(1)
}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2025-01-01',
  token,
  useCdn: false, // writes always go to the API, not the cached CDN
})

// Downloads a placeholder photo and uploads it to Sanity.
// Sanity de-duplicates identical files, so re-running does not pile up copies.
async function uploadImage(seed, width, height) {
  const url = `https://picsum.photos/seed/${seed}/${width}/${height}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not download ${url} (status ${response.status})`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, { filename: `${seed}.jpg` })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

async function seedCategories() {
  for (const category of categories) {
    await client.createOrReplace({
      _id: `category-${category.slug}`,
      _type: 'category',
      title: category.title,
      slug: { _type: 'slug', current: category.slug },
      description: category.description,
    })
  }
  console.log(`Created ${categories.length} categories`)
}

async function seedAuthors() {
  for (const author of authors) {
    const image = await uploadImage(author.imageSeed, 400, 400)
    await client.createOrReplace({
      _id: `author-${author.slug}`,
      _type: 'author',
      name: author.name,
      slug: { _type: 'slug', current: author.slug },
      bio: author.bio,
      image: { ...image, alt: `Portrait of ${author.name}` },
    })
  }
  console.log(`Created ${authors.length} authors`)
}

async function seedPosts() {
  for (const post of posts) {
    const heroImage = await uploadImage(post.heroSeed, 1200, 800)
    await client.createOrReplace({
      _id: `post-${post.slug}`,
      _type: 'post',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      excerpt: post.excerpt,
      body: post.body,
      publishedAt: post.publishedAt,
      heroImage: { ...heroImage, alt: post.heroAlt },
      category: { _type: 'reference', _ref: `category-${post.category}` },
      author: { _type: 'reference', _ref: `author-${post.author}` },
    })
  }
  console.log(`Created ${posts.length} posts`)
}

// Order matters: posts point at categories and authors, so those must exist first.
try {
  await seedCategories()
  await seedAuthors()
  await seedPosts()
  console.log('Seed finished.')
} catch (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}
