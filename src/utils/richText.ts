const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'H3', 'DIV']);
const droppedTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META']);
const safeAlignment = /^text-align:\s*(left|right|center|justify);?$/i;

// Whitelist sanitiser: descriptions are rendered back as HTML in the editor, so anything outside this set is removed.
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const clean = (parent: Node) => {
    for (const child of Array.from(parent.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE) { child.parentNode?.removeChild(child); continue; }
      const element = child as Element;
      if (droppedTags.has(element.tagName)) { element.remove(); continue; }
      clean(element);
      if (!allowedTags.has(element.tagName)) { element.replaceWith(...Array.from(element.childNodes)); continue; }
      for (const attribute of Array.from(element.attributes)) {
        const keepHref = element.tagName === 'A' && attribute.name === 'href' && /^(https?:|mailto:)/i.test(attribute.value.trim());
        const keepAlign = attribute.name === 'style' && safeAlignment.test(attribute.value.trim());
        if (!keepHref && !keepAlign) element.removeAttribute(attribute.name);
      }
      if (element.tagName === 'A') {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      }
    }
  };

  clean(doc.body);
  return doc.body.innerHTML;
}

export function htmlToText(html: string): string {
  return (new DOMParser().parseFromString(html, 'text/html').body.textContent || '').trim();
}

// Older records stored descriptions as plain text.
export function plainTextToHtml(text: string): string {
  if (!text || /<[a-z][\s\S]*>/i.test(text)) return text;
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.split(/\n{2,}/).map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`).join('');
}
