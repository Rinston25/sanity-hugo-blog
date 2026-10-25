# AI Usage

AI tools were used in building this project. I reviewed every file and can explain how each part works.

## Tools used

- **Claude (Anthropic)**: reading the test brief, planning the architecture, and writing a detailed step-by-step prompt for the coding agent.
- **Google Antigravity**: an AI coding agent that generated code phase by phase, following that prompt.

## What AI helped with

- **Architecture planning**: choosing the Sanity → sync script → Markdown → Hugo → Netlify flow, since Hugo cannot fetch from an API directly.
- **Project structure**: folder layout and splitting the work into phases, each with its own commit.
- **Sanity schemas**: Post, Category and Author schemas with validation rules.
- **Scripts**: first drafts of the seed script (sample content), the sync script and the Portable Text to Markdown converter.
- **Hugo templates**: layouts, partials, taxonomy pages for categories and authors, the table of contents and reading time.
- **Styling**: Sass structure and the responsive layout.
- **Share button**: the copy-link and share script.
- **Documentation**: first drafts of the README sections.

## What I wrote or changed myself

- Set the constraints for the AI: simple code, minimal packages, plain JavaScript outside the Studio, readable names and comments.
- Decided the content model and validation limits.
- Created and configured the Sanity project, API tokens, the Netlify site, environment variables and the Sanity → Netlify webhook.
- Reviewed each phase before committing, and simplified or rewrote code I found hard to follow.
- [Add specific things you changed, e.g. "fixed author image not showing when alt was missing", "adjusted mobile spacing", "rewrote the date format"]

## How I verified the output

- Ran `npm run seed` and checked the content in Sanity Studio.
- Ran `npm run sync` and inspected the generated Markdown files.
- Ran `hugo server` locally and checked every page type: home, post, category, author and 404.
- **Tested missing fields**: removed the hero image, author image and category description to confirm pages still render.
- **Tested the layout on mobile and desktop** using browser dev tools.
- **Checked accessibility**: heading order, alt text, keyboard navigation and focus styles [add Lighthouse score if you ran it].
- **Tested the share button**: clipboard copy on desktop, native share on mobile.
- **Verified a fresh clone builds**, and confirmed the Netlify deploy matches the local build.