import PortableTextRenderer from './PortableTextRenderer'
import { renderMarkdown } from './markdownRenderer'

interface PostContent {
  body?: any[] // Portable text
  markdown?: string // Markdown content
}

export function renderPostContent(content: PostContent) {
  // Prefer markdown if available, otherwise use body (portable text)
  if (content.markdown) {
    return {
      __html: renderMarkdown(content.markdown),
    }
  }

  if (content.body) {
    return content.body
  }

  return null
}

export function getContentType(content: PostContent): 'markdown' | 'portable' | null {
  if (content.markdown) return 'markdown'
  if (content.body) return 'portable'
  return null
}

// For use in React components
export { PortableTextRenderer, renderMarkdown }
