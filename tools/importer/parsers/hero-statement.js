/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-statement. Base: hero. Source: https://bradescobank.com/
 * Output: 1 column, 1 row — [video link (Vimeo), statement text].
 * Video comes from the Elementor background-video iframe, falling back to
 * data-settings.background_video_link. Raw iframes are never emitted.
 */
function resolveVimeoUrl(element) {
  const iframe = element.querySelector('.elementor-background-video-container iframe, iframe[src*="vimeo"]');
  const candidates = [];
  if (iframe) candidates.push(iframe.getAttribute('src') || '');
  [element, ...element.querySelectorAll('[data-settings]')].forEach((el) => {
    const raw = el.getAttribute && el.getAttribute('data-settings');
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      if (s.background_video_link) candidates.push(s.background_video_link);
    } catch (e) { /* ignore */ }
  });
  for (const c of candidates) {
    const m = String(c).match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (m) return `https://player.vimeo.com/video/${m[1]}`;
  }
  return null;
}

export default function parse(element, { document }) {
  const videoUrl = resolveVimeoUrl(element);
  const textContainer = element.querySelector('.elementor-widget-text-editor .elementor-widget-container, .elementor-widget-heading .elementor-widget-container');
  const textNodes = textContainer
    ? [...textContainer.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > p')]
    : [];
  if (!textNodes.length && textContainer && textContainer.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = textContainer.textContent.trim();
    textNodes.push(p);
  }

  if (!videoUrl && !textNodes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (videoUrl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    p.append(a);
    contentCell.push(p);
  }
  contentCell.push(...textNodes);

  const cells = [[contentCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-statement', cells });
  element.replaceWith(block);
}
