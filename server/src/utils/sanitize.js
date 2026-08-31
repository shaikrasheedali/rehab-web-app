import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitizes rich HTML content, allowing only safe semantic formatting tags
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h2', 'h3', 'h4', 'p', 'strong', 'em', 'u', 'ul', 'ol', 'li',
      'blockquote', 'a', 'br', 'span', 'b', 'i'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });
};

/**
 * Strips all HTML tags to produce clean plain text
 */
export const cleanPlainText = (text) => {
  if (!text) return '';
  return DOMPurify.sanitize(String(text), { ALLOWED_TAGS: [] }).trim();
};
