# Sanity + Hugo Blog

## Overview

A small blog CMS. Editors write posts, categories and authors in **Sanity Studio**. A Node.js script copies that content into Markdown files, **Hugo** turns the Markdown into a static site, and **Netlify** hosts it.

## Tech stack

| Part | Tool |
|---|---|
| CMS | Sanity Studio (TypeScript) |
| Sync and seed scripts | Node.js 20+ (plain JavaScript, ES modules) |
| Static site | Hugo extended (no theme, own layouts) |
| Styles | Sass via Hugo Pipes |
| Hosting | Netlify |

npm packages: `@sanity/client` and `dotenv` in the root; `sanity`, `react`, `react-dom` and `styled-components` (required by Sanity) plus `typescript` in `studio/`.

## Architecture

```
Sanity Studio  ->  Sanity API  ->  scripts/sync.js  ->  Markdown files  ->  Hugo  ->  Netlify
 (editors)         (content)       (fetch + convert)    (site/content)     (build)    (hosting)
```

A Sanity webhook calls a Netlify build hook whenever content is published, which starts a new build.

## Prerequisites

- **Node.js 20 or newer** (`node -v`). Download from https://nodejs.org.
- **Hugo extended** (the extended edition is needed for Sass). Check with `hugo version`; the output must contain `extended`.
  - Windows: `winget install Hugo.Hugo.Extended`
  - macOS: `brew install hugo`
  - Linux: download `hugo_extended` from https://github.com/gohugoio/hugo/releases, or `sudo snap install hugo`
- **Git**
- A free **Sanity project** (https://www.sanity.io/manage)

The project was built with Hugo 0.168.0, the same version pinned in `netlify.toml`.

## Setup from a fresh clone

```bash
git clone https://github.com/Rinston25/sanity-hugo-blog.git
cd sanity-hugo-blog
npm install                      # root dependencies (sync and seed scripts)
cp .env.example .env             # then fill in the values (see below)

# Optional: fill the dataset with sample content
npm run seed

# Build the site once, or run it locally with live reload
npm run build                    # output goes to site/public
npm run dev                      # http://localhost:1313
```

To run the Studio:

```bash
cd studio
npm install
cp .env.example .env             # set SANITY_STUDIO_PROJECT_ID
npm run dev                      # http://localhost:3333
```

In your Sanity project settings (API -> CORS origins), add `http://localhost:3333` so the Studio can sign in.

## Environment variables

Root `.env` (never committed):

| Variable | Used by | Meaning |
|---|---|---|
| `SANITY_PROJECT_ID` | sync, seed | Your Sanity project ID |
| `SANITY_DATASET` | sync, seed | Dataset name, usually `production` |
| `SANITY_API_VERSION` | sync, seed | Date-based API version, for example `2025-01-01` |
| `SANITY_WRITE_TOKEN` | seed only | Token with Editor permission. Not needed for the build. |

`studio/.env` has `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET`.

On Netlify, set the first three in **Site configuration -> Environment variables**. The sync script reads them from the environment when there is no `.env` file.

## Scripts

Run from the repository root:

| Script | What it does |
|---|---|
| `npm run seed` | Creates 3 categories, 2 authors and 6 posts in Sanity. Safe to run twice (fixed IDs, `createOrReplace`). |
| `npm run sync` | Fetches content from Sanity and writes Markdown into `site/content/`. |
| `npm run dev` | Sync, then `hugo server` with live reload. |
| `npm run build` | Sync, then `hugo --minify`. This is what Netlify runs. |

Inside `studio/`: `npm run dev` (local Studio), `npm run deploy` (host the Studio on sanity.studio), `npm run typecheck`.

## Content model

- **Post**: title (max 100), slug, excerpt (max 200), body (Portable Text: normal, h2, h3, quote, bullet list, bold, italic, link), publishedAt, heroImage (with required alt text when set), category (reference), author (reference). All required except the hero image.
- **Category**: title, slug, description (optional, max 300).
- **Author**: name, slug, bio (max 500), image with alt text (optional).

The sync script writes:

```
site/content/posts/<slug>.md
site/content/categories/<slug>/_index.md
site/content/authors/<slug>/_index.md
```

Posts list their category and author by slug in front matter (`categories: ["..."]`, `authors: ["..."]`). Hugo taxonomies connect them, and templates look up the details with `site.GetPage`.

## How missing fields are handled

- **Post, category or author with no slug**: skipped, and a warning is printed.
- **Empty optional fields** (hero image, description, author image): left out of the front matter.
- **Templates**: every optional field is wrapped in `with` or `if`, so a missing image, description or author simply does not render.
- **Missing body or non-text blocks**: the converter returns an empty string or ignores the block instead of crashing.
- **Table of contents**: only shown when the post has headings.
- **A failed fetch** stops the script before anything is deleted, so the last good content stays in place.

## Deployment

1. Push the repository to GitHub and create a Netlify site from it. `netlify.toml` sets the build command (`npm run build`), the publish folder (`site/public`), `HUGO_VERSION` and `NODE_VERSION`.
2. Add `SANITY_PROJECT_ID`, `SANITY_DATASET` and `SANITY_API_VERSION` as Netlify environment variables.
3. In Netlify: **Site configuration -> Build & deploy -> Build hooks -> Add build hook**. Copy the URL.
4. In Sanity: **manage -> your project -> API -> Webhooks -> Create webhook**. Paste the Netlify build hook as the URL, choose the dataset, trigger on create, update and delete, and use the filter `_type in ["post", "category", "author"]`. Method `POST`.
5. Publishing in the Studio now starts a Netlify build, and the site updates in about a minute.

Check the first deploy log: the Hugo version printed should be 0.168.0 and the build should not report a Sass error.

## Trade-offs and what I would improve with more time

**Why a sync script.** Hugo cannot easily read from an API at build time, and a script that writes plain Markdown keeps the build simple and reproducible: the same content gives the same site, and the files are easy to inspect. The downside is that content only updates when the site is rebuilt, so we depend on the webhook. A change in the Studio is not live until the build finishes.

**Hand-written Portable Text converter vs a library.** The converter is about 55 lines and handles only the blocks the schema allows, so it is easy to read and explain, with no extra dependency. A library such as `@portabletext/to-html` would handle every block type, custom blocks and edge cases. If editors start adding images, tables or code blocks in the body, a library becomes the better choice.

**Sanity CDN images vs downloading them.** The site links straight to Sanity's image CDN (`?w=1200&auto=format`), which gives resizing and modern formats for free and keeps the repository and build small. The downside is that the site depends on Sanity's CDN being available, and images cannot be processed by Hugo (no srcset). Downloading them would remove the dependency but make builds slower and more complex.

**Other things I would do next:**
- Pagination on the posts list.
- `srcset` and image width/height to avoid layout shift.
- Move from LibSass (deprecated in Hugo) to Dart Sass; this needs one more npm package.
- Incremental sync: only rewrite files that changed.
- Draft preview of unpublished posts.
- Automated tests for the converter.
- RSS feed styling and Open Graph tags for sharing.

## Links

- Live site: _add the Netlify URL here_
- Studio: _add the sanity.studio URL here_
- Walkthrough video: `video/` folder (_add link or file here_)
