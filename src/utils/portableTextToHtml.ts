
export function portableTextToHtml(blocks: any[]): string {
  if (!Array.isArray(blocks)) return '';

  return blocks.map(block => {
    // Handle regular text blocks
    if (block._type === 'block' && block.children) {
      const text = renderChildren(block.children, block.markDefs);

      // Handle lists (they come in as separate blocks with listItem property)
      if (block.listItem === 'bullet') {
        return `<li>${text}</li>`;
      }
      if (block.listItem === 'number') {
        return `<li>${text}</li>`;
      }

      // Handle text styles
      switch (block.style) {
        case 'h1': return `<h1 class="portable-h1">${text}</h1>`;
        case 'h2': return `<h2 class="portable-h2">${text}</h2>`;
        case 'h3': return `<h3 class="portable-h3">${text}</h3>`;
        case 'h4': return `<h4 class="portable-h4">${text}</h4>`;
        case 'blockquote': return `<blockquote class="portable-blockquote">${text}</blockquote>`;
        default: return `<p class="portable-p">${text}</p>`;
      }
    }

    // Handle dividers specifically if they appear without children
    if (block._type === 'divider') {
      return '<hr class="portable-divider" />';
    }

    // Handle images
    if (block._type === 'image') {
      const src = block.asset?.url || (block.asset?._ref
        ? `https://cdn.sanity.io/images/kciy3tvs/production/${block.asset._ref.replace('image-', '').replace('-webp', '.webp').replace('-png', '.png').replace('-jpg', '.jpg')}`
        : '');
      const alt = block.alt || 'Image';
      const caption = block.caption || '';
      return `<figure class="portable-image">
        <img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" />
        ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}
      </figure>`;
    }

    // Handle code blocks
    if (block._type === 'code') {
      const code = block.code || '';
      const language = block.language || 'text';
      return `<pre class="code-block" data-language="${language}"><code>${escapeHtml(code)}</code></pre>`;
    }

    // Handle callouts
    if (block._type === 'callout') {
      const type = block.type || 'info';
      const title = block.title || '';
      const message = block.message || '';
      return `<div class="callout callout-${type}">
        ${title ? `<span class="callout-title">${escapeHtml(title)}</span>` : ''}
        <p class="callout-message">${escapeHtml(message)}</p>
      </div>`;
    }

    // Handle dividers (duplicate check just in case of different block structures)
    if (block._type === 'divider') {
      return '<hr class="portable-divider" />';
    }

    // Handle video embeds
    if (block._type === 'videoEmbed') {
      const url = block.url || '';
      const caption = block.caption || '';
      const embedUrl = convertToEmbedUrl(url);
      return `<figure class="portable-video">
        <div class="video-container">
          <iframe src="${embedUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>
        </div>
        ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}
      </figure>`;
    }

    // Handle quote blocks
    if (block._type === 'quoteBlock') {
      const text = block.text || '';
      const author = block.author || '';
      return `<blockquote class="portable-quote">
        <p>${escapeHtml(text)}</p>
        ${author ? `<footer class="quote-author">— ${escapeHtml(author)}</footer>` : ''}
      </blockquote>`;
    }

    // Handle highlights
    if (block._type === 'highlight') {
      const text = block.text || '';
      const color = block.color || 'yellow';
      return `<mark class="highlight-${color}">${escapeHtml(text)}</mark>`;
    }

    // Handle preview blocks
    if (block._type === 'previewBlock') {
      const title = block.title || '';
      const description = block.description || '';
      const content = block.previewContent || '';
      const bgType = block.bgType || 'light';
      return `<div class="preview-block preview-${bgType}">
        <div class="preview-header">
          <div class="preview-title">${escapeHtml(title)}</div>
          ${description ? `<div class="preview-description">${escapeHtml(description)}</div>` : ''}
        </div>
        <div class="preview-content">
          ${content}
        </div>
      </div>`;
    }

    return '';
  }).join('\n');
}

function renderChildren(children: any[], markDefs: any[] = []): string {
  return children.map(child => {
    let text = child.text || '';

    // Escape HTML
    text = escapeHtml(text);

    // Handle newlines (Shift+Enter in Sanity)
    text = text.replace(/\n/g, '<br />');

    // Apply marks
    if (child.marks) {
      child.marks.forEach((mark: string) => {
        // Handle decorators
        if (mark === 'strong') text = `<strong>${text}</strong>`;
        if (mark === 'em') text = `<em>${text}</em>`;
        if (mark === 'code') text = `<code>${text}</code>`;
        if (mark === 'underline') text = `<u>${text}</u>`;
        if (mark === 'strike-through') text = `<s>${text}</s>`;

        // Handle annotations
        const def = markDefs.find(d => d._key === mark);
        if (def) {
          if (def._type === 'link') {
            text = `<a href="${def.href}" target="_blank" rel="noopener">${text}</a>`;
          }
          if (def._type === 'internalLink') {
            const slug = def.reference?.slug?.current || '';
            text = `<a href="/articles/${slug}" class="internal-link">${text}</a>`;
          }
        }
      });
    }

    return text;
  }).join('');
}

function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function convertToEmbedUrl(url: string): string {
  if (!url) return '';
  // Convert YouTube URL to embed format
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  // Convert Vimeo URL to embed format
  if (url.includes('vimeo.com')) {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (videoId) return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
}

