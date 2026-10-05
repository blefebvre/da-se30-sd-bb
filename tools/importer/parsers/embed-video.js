/* eslint-disable */
/* global WebImporter */
/**
 * Parser for embed-video. Base: embed. Source: https://bradescobank.com/en/how-to-buy-assets/
 * Output: one row, one cell — <a href="URL">URL</a> with the canonical watch URL
 *   YouTube: https://www.youtube.com/watch?v=<id>   Vimeo: https://vimeo.com/<id>
 * The iframe sits inside a <p>; if that <p> holds nothing else meaningful, the <p> is
 * replaced (so the block table is not nested in a paragraph), otherwise just the iframe.
 */

function canonicalUrl(raw) {
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw, 'https://www.youtube.com');
  } catch (e) {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.split('/')[1];
    return id ? `https://www.youtube.com/watch?v=${id}` : null;
  }
  if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
    const id = url.searchParams.get('v')
      || (url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
    return id && id !== 'videoseries' ? `https://www.youtube.com/watch?v=${id}` : null;
  }
  if (/(^|\.)vimeo\.com$/.test(host)) {
    const id = (url.pathname.match(/(\d{5,})/) || [])[1];
    return id ? `https://vimeo.com/${id}` : null;
  }
  return null;
}

export default function parse(element, { document }) {
  const iframe = element.tagName === 'IFRAME' ? element : element.querySelector('iframe');
  const raw = iframe && (iframe.getAttribute('src') || iframe.getAttribute('data-src')
    || iframe.getAttribute('data-lazy-src'));
  const href = canonicalUrl(raw);

  if (!href) {
    element.remove();
    return;
  }

  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;

  const cells = [[a]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });

  // If the wrapping <p> holds nothing but this iframe (whitespace/br/nbsp), replace the <p>.
  const p = element.parentElement;
  const onlyChild = p && p.tagName === 'P'
    && !p.textContent.replace(/\u00a0/g, ' ').trim()
    && [...p.children].every((c) => c === element || c.tagName === 'BR');
  if (onlyChild) {
    p.replaceWith(block);
  } else {
    element.replaceWith(block);
  }
}
