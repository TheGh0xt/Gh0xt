//@ts-nocheck
import { marked } from 'marked'

export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''

  
  marked.setOptions({
    breaks: true,
    gfm: true, // GitHub Flavored Markdown
  })

  return marked(markdown)
}

export function renderMarkdownAsHtml(markdown: string): string {
  return renderMarkdown(markdown)
}
