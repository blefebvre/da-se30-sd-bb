import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [
  'boxed', 'elevated', 'overlap', 'posts', 'product', 'icon-left',
  'links', 'icons', 'carousel', 'circle', 'steps',
  'accent', 'divided', 'highlight', 'gradient',
];

/** Options whose single link should make the whole tile clickable. */
const STRETCH_LINK_OPTIONS = ['links', 'posts'];

/**
 * True when the element holds picture(s) and no text.
 * @param {Element} el
 */
function isImageOnly(el) {
  return !!el.querySelector('picture') && !el.textContent.trim();
}

/**
 * True when the paragraph holds a single text link and nothing else.
 * @param {Element} p
 */
function isLinkOnly(p) {
  const links = p.querySelectorAll('a[href]');
  return links.length === 1 && !!links[0].textContent.trim()
    && p.textContent.trim() === links[0].textContent.trim();
}

/**
 * Builds one card <li> from an authored row: image cell(s) + body cell(s), any order.
 * A leading image-only paragraph inside a mixed cell is lifted into the image slot.
 * @param {Element} row
 * @param {string[]} active
 * @returns {HTMLLIElement|null}
 */
function buildItem(row, active) {
  const cells = [...row.children].filter((c) => c.innerHTML.trim());
  if (!cells.length) return null;

  const li = document.createElement('li');
  li.className = 'cards-feature-item';
  const image = document.createElement('div');
  image.className = 'cards-feature-image';
  const body = document.createElement('div');
  body.className = 'cards-feature-body';

  cells.forEach((cell) => {
    if (isImageOnly(cell)) {
      while (cell.firstChild) image.append(cell.firstChild);
      return;
    }
    // mixed cell: lift a leading picture (or image-only paragraph) into the image slot
    const first = cell.firstElementChild;
    if (!image.childNodes.length && first
      && (first.tagName === 'PICTURE' || (first.tagName === 'P' && isImageOnly(first)))) {
      image.append(first);
    }
    while (cell.firstChild) body.append(cell.firstChild);
  });

  // drop whitespace-only text nodes / empty paragraphs
  [image, body].forEach((slot) => {
    [...slot.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
      else if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'P'
        && !n.textContent.trim() && !n.querySelector('picture, img')) n.remove();
    });
  });

  image.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
  });

  if (image.childNodes.length) li.append(image);
  else li.classList.add('no-image');
  if (body.childNodes.length) li.append(body);

  // "Coming soon" style badge: a paragraph holding only emphasised text
  body.querySelectorAll(':scope > p').forEach((p) => {
    const em = p.querySelector(':scope > em');
    if (em && p.childElementCount === 1 && p.textContent.trim() === em.textContent.trim()) {
      p.classList.add('cards-feature-badge');
      li.classList.add('has-badge');
    }
  });

  // last link-only paragraph is the item CTA
  const cta = [...body.querySelectorAll(':scope > p')].reverse().find(isLinkOnly);
  if (cta) cta.classList.add('cards-feature-cta');

  // whole-tile link (FAQ link tiles, post cards) when the item carries exactly one link
  if (active.some((o) => STRETCH_LINK_OPTIONS.includes(o))) {
    const links = li.querySelectorAll('a[href]');
    if (links.length === 1) links[0].classList.add('cards-feature-stretched');
  }

  return li;
}

/**
 * Wraps the list in a scroll viewport with prev/next buttons.
 * @param {Element} block
 * @param {HTMLUListElement} ul
 */
function buildCarousel(block, ul) {
  const viewport = document.createElement('div');
  viewport.className = 'cards-feature-viewport';
  viewport.append(ul);

  const nav = document.createElement('div');
  nav.className = 'cards-feature-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-feature-prev';
  prev.setAttribute('aria-label', 'Previous');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-feature-next';
  next.setAttribute('aria-label', 'Next');
  nav.append(prev, next);

  const step = () => {
    const item = ul.querySelector('li');
    if (!item) return ul.clientWidth;
    const gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  };
  const update = () => {
    const max = ul.scrollWidth - ul.clientWidth - 1;
    prev.disabled = ul.scrollLeft <= 0;
    next.disabled = ul.scrollLeft >= max;
    nav.hidden = max <= 0;
  };
  prev.addEventListener('click', () => ul.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => ul.scrollBy({ left: step(), behavior: 'smooth' }));
  ul.addEventListener('scroll', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(ul);

  block.replaceChildren(viewport, nav);
  update();
}

/**
 * Cards (Feature): repeated feature items.
 * Content model: one row per item, [icon/image | heading + text / list / link];
 * the image cell and the heading are optional.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  ul.className = 'cards-feature-list';
  [...block.children].forEach((row) => {
    const li = buildItem(row, active);
    if (li) ul.append(li);
  });

  if (active.includes('carousel')) buildCarousel(block, ul);
  else block.replaceChildren(ul);
}
