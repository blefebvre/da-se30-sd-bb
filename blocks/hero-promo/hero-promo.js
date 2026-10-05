import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = ['center', 'light', 'right', 'card', 'split', 'checks', 'end', 'dim'];

/**
 * True when the paragraph holds a single text link and nothing else.
 * @param {Element} p
 */
function isLinkOnly(p) {
  const links = p.querySelectorAll('a[href]');
  if (links.length !== 1) return false;
  const a = links[0];
  return !!a.textContent.trim() && p.textContent.trim() === a.textContent.trim();
}

/**
 * True when the element holds only images (optionally wrapped in links), e.g. logo rows
 * or app-store badges.
 * @param {Element} el
 */
function isImageOnly(el) {
  return !!el.querySelector('picture, img') && !el.textContent.trim();
}

/**
 * card: [title + text | foreground image | text + CTA]. The first image-only paragraph
 * (or bare picture) splits the copy into the two text columns.
 * @param {Element} content
 */
function buildCardColumns(content) {
  const nodes = [...content.childNodes];
  const pivot = nodes.find((n) => n.nodeType === Node.ELEMENT_NODE
    && (n.tagName === 'PICTURE' || (n.tagName === 'P' && isImageOnly(n))));
  if (!pivot) return;
  const lead = document.createElement('div');
  lead.className = 'hero-promo-col hero-promo-lead';
  const figure = document.createElement('div');
  figure.className = 'hero-promo-col hero-promo-figure';
  const body = document.createElement('div');
  body.className = 'hero-promo-col hero-promo-body';
  let target = lead;
  nodes.forEach((n) => {
    if (n === pivot) {
      figure.append(n);
      target = body;
    } else {
      target.append(n);
    }
  });
  content.replaceChildren(...[lead, figure, body].filter((c) => c.childNodes.length));
}

/**
 * split: [heading | vertical rule | remaining copy].
 * @param {Element} content
 */
function buildSplitColumns(content) {
  const heading = content.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4');
  if (!heading) return;
  const lead = document.createElement('div');
  lead.className = 'hero-promo-col hero-promo-lead';
  const body = document.createElement('div');
  body.className = 'hero-promo-col hero-promo-body';
  let target = lead;
  [...content.childNodes].forEach((n) => {
    target.append(n);
    if (n === heading) target = body;
  });
  content.replaceChildren(...[lead, body].filter((c) => c.childNodes.length));
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const media = document.createElement('div');
  media.className = 'hero-promo-media';

  // The first authored picture is the background image, wherever the author put it.
  const picture = block.querySelector('picture');
  if (picture) {
    const holder = picture.closest('p');
    const img = picture.querySelector('img');
    media.append(img
      ? createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : picture);
    picture.remove();
    if (holder && !holder.textContent.trim() && !holder.querySelector('picture')) holder.remove();
  } else {
    block.classList.add('no-image');
  }

  const content = document.createElement('div');
  content.className = 'hero-promo-content';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  // Trailing paragraphs holding only a text link are the CTA(s) (none, one or several);
  // otherwise fall back to the last link-only paragraph anywhere in the copy.
  const paragraphs = [...content.querySelectorAll(':scope > p')];
  const ctas = [];
  for (let i = paragraphs.length - 1; i >= 0; i -= 1) {
    const p = paragraphs[i];
    if (isLinkOnly(p)) ctas.unshift(p);
    else if (p.textContent.trim() || p.querySelector('picture, img')) break;
  }
  if (!ctas.length) {
    const last = [...paragraphs].reverse().find(isLinkOnly);
    if (last) ctas.push(last);
  }
  ctas.forEach((p) => p.classList.add('hero-promo-cta'));
  if (ctas.length > 1) block.classList.add('multi-cta');

  if (active.includes('card')) buildCardColumns(content);
  else if (active.includes('split')) buildSplitColumns(content);

  // Rows of inline images (wallet logos, app-store badges) lay out horizontally;
  // the card option's foreground image is not a logo row.
  content.querySelectorAll('p').forEach((p) => {
    if (!isImageOnly(p) || p.closest('.hero-promo-figure')) return;
    p.classList.add('hero-promo-logos');
    // linked images (app-store badges) vs plain logos (wallets)
    if (p.querySelector('a')) p.classList.add('hero-promo-badges');
  });

  block.replaceChildren(...(picture ? [media] : []), content);
}
