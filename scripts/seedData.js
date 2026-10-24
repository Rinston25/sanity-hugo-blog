// Sample content for seed.js. Kept apart so seed.js stays short and only does the Sanity work.

// Portable Text needs a unique _key on every block and span.
let keyCounter = 0
function newKey() {
  keyCounter += 1
  return `k${keyCounter}`
}

// A "line" is [style, content].
//   style:   'p' (normal), 'h2', 'h3', 'quote' or 'bullet'
//   content: a string, or a list of strings / { text, marks: ['strong'|'em'], href }
// This lets the post bodies below read like plain text instead of raw JSON.
function toBlocks(lines) {
  return lines.map(([style, content]) => {
    const markDefs = []
    const parts = Array.isArray(content) ? content : [content]

    const children = parts.map((part) => {
      const piece = typeof part === 'string' ? { text: part } : part
      const marks = piece.marks ? [...piece.marks] : []
      if (piece.href) {
        // Links are "annotations": defined once on the block, referenced by key from the span.
        const linkKey = newKey()
        markDefs.push({ _key: linkKey, _type: 'link', href: piece.href })
        marks.push(linkKey)
      }
      return { _key: newKey(), _type: 'span', text: piece.text, marks }
    })

    const block = { _key: newKey(), _type: 'block', children, markDefs }
    if (style === 'bullet') {
      block.style = 'normal'
      block.listItem = 'bullet'
      block.level = 1
    } else if (style === 'quote') {
      block.style = 'blockquote'
    } else {
      block.style = style === 'p' ? 'normal' : style
    }
    return block
  })
}

export const categories = [
  {
    slug: 'web-development',
    title: 'Web Development',
    description: 'Practical articles about building fast, accessible websites.',
  },
  {
    slug: 'content-strategy',
    title: 'Content Strategy',
    description: 'How to plan, structure and publish content people actually read.',
  },
  {
    slug: 'productivity',
    title: 'Productivity',
    description: 'Habits and tools that help small teams ship more with less stress.',
  },
]

export const authors = [
  {
    slug: 'maya-fernandes',
    name: 'Maya Fernandes',
    bio: 'Maya is a front-end developer who loves static sites, clean CSS and good documentation. She writes about the web platform and how to keep projects simple.',
    imageSeed: 'maya',
  },
  {
    slug: 'daniel-okafor',
    name: 'Daniel Okafor',
    bio: 'Daniel is a content strategist and former editor. He helps small teams turn scattered ideas into clear, consistent publishing workflows.',
    imageSeed: 'daniel',
  },
]

export const posts = [
  {
    slug: 'why-static-sites-are-back',
    title: 'Why Static Sites Are Back',
    excerpt: 'Static sites are fast, cheap and secure. Here is why more teams are choosing them again.',
    publishedAt: '2026-09-01T09:00:00Z',
    category: 'web-development',
    author: 'maya-fernandes',
    heroSeed: 'static-sites',
    heroAlt: 'A laptop on a desk showing lines of code',
    body: toBlocks([
      ['p', 'For a while it looked like every website needed a server, a database and a long list of plugins. Lately that has started to change, and plain HTML is making a comeback.'],
      ['h2', 'Speed without tricks'],
      ['p', 'A static site is just files. When a visitor asks for a page, the host hands over a file that is already built. There is no waiting for a database query and nothing to render on the fly.'],
      ['h3', 'Caching becomes easy'],
      ['p', 'Because every visitor gets the same file, a CDN can keep copies close to your readers all over the world. Pages load quickly even on slow connections.'],
      ['h2', 'Fewer things that can break'],
      ['p', 'No server code means far fewer security holes. There is no admin login to attack and no database to leak. The attack surface is tiny compared with a typical CMS.'],
      ['bullet', 'Nothing to patch on the live server'],
      ['bullet', 'Hosting is often free or very cheap'],
      ['bullet', 'Every deploy can be rolled back in one click'],
      ['h2', 'Where static sites struggle'],
      ['p', 'Content only changes when you rebuild the site. For a blog that is fine, but for a shop with live stock levels you will need something more dynamic.'],
      ['quote', 'Use the simplest tool that solves the problem, and no simpler.'],
      ['p', ['Read more about the idea on ', { text: 'the Hugo website', href: 'https://gohugo.io' }, '.']],
    ]),
  },
  {
    slug: 'sass-tips-for-small-projects',
    title: 'Sass Tips for Small Projects',
    excerpt: 'You do not need a big framework. A few Sass habits keep a small stylesheet tidy and easy to change.',
    publishedAt: '2026-09-05T09:00:00Z',
    category: 'web-development',
    author: 'maya-fernandes',
    heroSeed: 'sass-tips',
    heroAlt: 'Colour swatches laid out on a table',
    body: toBlocks([
      ['p', 'Sass adds a handful of features on top of CSS, and for a small project you only need a few of them. Here is the short list I reach for every time.'],
      ['h2', 'Keep your values in variables'],
      ['p', 'Put colours, spacing and font sizes in one file. When the brand colour changes you edit one line instead of hunting through the whole stylesheet.'],
      ['h3', 'Name things by purpose'],
      ['p', ['Call a colour ', { text: '$color-link', marks: ['strong'] }, ' rather than ', { text: '$blue', marks: ['em'] }, '. When the link colour changes to green, the name still makes sense.']],
      ['h2', 'Split files by job'],
      ['p', 'A variables file, a base file for element styles, a layout file and a components file are enough. Each one is short enough to read in a minute.'],
      ['h2', 'Write mobile first'],
      ['p', 'Start with the small-screen layout and add one media query for larger screens. You write less code and avoid undoing styles later.'],
      ['bullet', 'Default styles are for phones'],
      ['bullet', 'One breakpoint is usually enough'],
      ['bullet', 'Test by resizing the browser window'],
    ]),
  },
  {
    slug: 'structuring-content-for-readers',
    title: 'Structuring Content for Readers',
    excerpt: 'Good headings, short paragraphs and clear summaries make long articles easy to scan.',
    publishedAt: '2026-09-10T09:00:00Z',
    category: 'content-strategy',
    author: 'daniel-okafor',
    heroSeed: 'structure',
    heroAlt: 'Index cards arranged in rows on a wall',
    body: toBlocks([
      ['p', 'Most readers do not read an article from top to bottom. They scan first, then decide whether it deserves their time. Your structure should help them do that.'],
      ['h2', 'Lead with the point'],
      ['p', 'Say what the article is about in the first two sentences. If readers have to dig for the point, many of them will leave before they find it.'],
      ['h2', 'Use headings as signposts'],
      ['p', 'A good heading tells the reader what the section contains. Compare "Overview" with "Why most newsletters get ignored"; the second one earns a click.'],
      ['h3', 'Keep the hierarchy honest'],
      ['p', 'Use one main title, then second-level headings for sections and third-level headings for details inside them. Skipping levels confuses both readers and screen readers.'],
      ['h2', 'Keep paragraphs short'],
      ['p', 'Three or four lines is plenty. White space gives the eye a place to rest, especially on a small phone screen.'],
      ['quote', 'If you cannot summarise a section in one sentence, it probably needs splitting.'],
    ]),
  },
  {
    slug: 'a-simple-editorial-calendar',
    title: 'A Simple Editorial Calendar',
    excerpt: 'You can plan a month of content with a spreadsheet and thirty minutes. Here is the method.',
    publishedAt: '2026-09-15T09:00:00Z',
    category: 'content-strategy',
    author: 'daniel-okafor',
    heroSeed: 'calendar',
    heroAlt: 'A wall calendar with sticky notes on several dates',
    body: toBlocks([
      ['p', 'Publishing regularly is harder than writing well. An editorial calendar takes the guesswork out by deciding in advance what goes out and when.'],
      ['h2', 'Start with a rhythm'],
      ['p', 'Pick a schedule you can keep, such as one post every week. Consistency matters more than volume, and readers learn when to expect you.'],
      ['h2', 'Collect ideas in one place'],
      ['p', 'Keep a single list where every idea goes, however rough. When it is time to plan, you choose from the list instead of staring at a blank page.'],
      ['h3', 'Score your ideas'],
      ['p', 'Give each idea a quick score for how useful it is to readers and how easy it is to write. Start with the ideas that are high on both.'],
      ['h2', 'Review once a month'],
      ['p', 'Look at what was published and what people read. Move what worked into next month, and drop the topics nobody cared about.'],
      ['bullet', 'Date'],
      ['bullet', 'Working title'],
      ['bullet', 'Owner and status'],
    ]),
  },
  {
    slug: 'deep-work-for-busy-teams',
    title: 'Deep Work for Busy Teams',
    excerpt: 'Constant messages kill focus. These small changes give your team long stretches of uninterrupted time.',
    publishedAt: '2026-09-20T09:00:00Z',
    category: 'productivity',
    author: 'maya-fernandes',
    heroSeed: 'deep-work',
    heroAlt: 'A quiet desk with a notebook and a cup of coffee',
    body: toBlocks([
      ['p', 'The hardest problems need long, unbroken thinking. Yet most workdays are chopped into pieces by chat messages, meetings and email.'],
      ['h2', 'Protect blocks of time'],
      ['p', 'Agree on two or three hours each day when nobody expects an instant reply. Put it in the shared calendar so it is visible and respected.'],
      ['h2', 'Make messages asynchronous'],
      ['p', 'Not every question needs an answer right now. Write messages that contain enough detail to be answered later, without a back-and-forth.'],
      ['h3', 'Choose the right channel'],
      ['p', 'Use chat for quick, low-stakes notes and written documents for decisions. That way important choices do not get lost in a scrolling thread.'],
      ['h2', 'Cut the meetings that do not help'],
      ['p', 'Ask of each recurring meeting whether a short written update could replace it. Many can, and the time you save goes straight back to real work.'],
      ['quote', 'Focus is not about doing more; it is about doing fewer things properly.'],
    ]),
  },
  {
    slug: 'tools-that-keep-projects-simple',
    title: 'Tools That Keep Projects Simple',
    excerpt: 'Every new tool adds something to learn and maintain. Here is how to choose tools that earn their place.',
    publishedAt: '2026-09-25T09:00:00Z',
    category: 'productivity',
    author: 'daniel-okafor',
    heroSeed: 'simple-tools',
    heroAlt: 'A small set of hand tools neatly arranged on a bench',
    body: toBlocks([
      ['p', 'It is tempting to add a new tool whenever something feels slow. A year later you are maintaining ten of them and nobody remembers why.'],
      ['h2', 'Ask what problem it solves'],
      ['p', 'Write the problem down in one sentence before looking at tools. If you cannot, you are probably not ready to add anything yet.'],
      ['h2', 'Count the hidden costs'],
      ['p', 'Every tool needs setup, updates, passwords and someone who understands it. Those costs show up long after the free trial ends.'],
      ['h3', 'Prefer tools your team already knows'],
      ['p', 'A spreadsheet that everyone can use often beats a clever app that only one person understands.'],
      ['h2', 'Review your stack regularly'],
      ['p', 'Twice a year, list every tool in use and remove the ones nobody has touched. A smaller toolbox is easier to learn, explain and hand over.'],
      ['bullet', 'One tool per job'],
      ['bullet', 'Prefer open formats you can export'],
      ['bullet', 'Write down why each tool exists'],
    ]),
  },
]
