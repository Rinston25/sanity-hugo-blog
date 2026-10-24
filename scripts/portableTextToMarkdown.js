// Small hand-written converter: Sanity Portable Text -> Markdown.
// It only knows the block types our Post schema allows:
// normal, h2, h3, blockquote, bullet lists, bold, italic and links.

// Wraps one span of text in Markdown for its marks (bold, italic, link).
function convertSpan(span, markDefs) {
  let text = span.text || ''
  for (const mark of span.marks || []) {
    if (mark === 'strong') {
      text = `**${text}**`
    } else if (mark === 'em') {
      text = `*${text}*`
    } else {
      // Any other mark is a key that points at an annotation in markDefs (our links).
      const definition = markDefs.find((item) => item._key === mark)
      if (definition && definition.href) {
        text = `[${text}](${definition.href})`
      }
    }
  }
  return text
}

// Turns one block into a line of Markdown.
function convertBlock(block) {
  const markDefs = block.markDefs || []
  const text = (block.children || []).map((span) => convertSpan(span, markDefs)).join('')

  if (block.listItem === 'bullet') return `- ${text}`
  if (block.style === 'h2') return `## ${text}`
  if (block.style === 'h3') return `### ${text}`
  if (block.style === 'blockquote') return `> ${text}`
  return text
}

export function portableTextToMarkdown(blocks) {
  // A missing body is fine: it just gives an empty string.
  if (!Array.isArray(blocks)) return ''

  let markdown = ''
  let previousWasBullet = false

  for (const block of blocks) {
    // Ignore anything that is not a text block (for example an image added later).
    if (block._type !== 'block') continue

    const isBullet = block.listItem === 'bullet'
    if (markdown) {
      // Bullets in the same list sit on consecutive lines; everything else needs a blank line.
      markdown += isBullet && previousWasBullet ? '\n' : '\n\n'
    }
    markdown += convertBlock(block)
    previousWasBullet = isBullet
  }

  return markdown
}
