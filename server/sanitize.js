import sanitizeHtml from 'sanitize-html';

export function sanitizeArticleHtml(html) {
  return sanitizeHtml(html || '', {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'u', 's',
      'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading'],
      div: ['class'],
      span: ['class'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
    disallowedTagsMode: 'discard',
  });
}

export function htmlToPlainText(html) {
  return sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}
