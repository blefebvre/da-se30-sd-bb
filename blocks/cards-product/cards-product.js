import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = ['light', 'hover'];

/**
 * Tags the parts of a card body and groups the copy above the CTA:
 *   .cards-product-card-content > [eyebrow] [title | logo] [text...]
 *   .cards-product-card-cta
 *   .cards-product-card-footnote (any paragraph after the CTA)
 * Authors may omit any of them.
 * @param {Element} body
 */
function decorateBody(body) {
  const children = [...body.children];
  const heading = children.find((el) => /^H[1-6]$/.test(el.tagName));
  const logoP = children.find((el) => el.tagName === 'P' && el.querySelector('picture') && !el.textContent.trim());
  const title = heading || logoP;

  if (title) {
    title.classList.add(heading ? 'cards-product-card-title' : 'cards-product-card-logo');
    // A short text paragraph authored before the title is the eyebrow.
    children.slice(0, children.indexOf(title)).forEach((el) => {
      if (el.tagName === 'P' && el.textContent.trim() && !el.querySelector('a')) {
        el.classList.add('cards-product-card-eyebrow');
      }
    });
  }

  // The last paragraph holding only a link is the CTA.
  const ctaP = [...children].reverse().find((el) => {
    if (el.tagName !== 'P') return false;
    const a = el.querySelector('a[href]');
    return a && el.textContent.trim() === a.textContent.trim();
  });

  const ctaIdx = ctaP ? children.indexOf(ctaP) : children.length;
  const before = children.slice(0, ctaIdx);
  const after = children.slice(ctaIdx + 1);

  if (ctaP) {
    ctaP.classList.add('cards-product-card-cta');
    ctaP.querySelector('a[href]').classList.add('cards-product-card-cta-link');
  }

  before.forEach((el) => {
    if (el.tagName === 'P' && !el.className) el.classList.add('cards-product-card-text');
  });
  after.forEach((el) => {
    if (el.tagName === 'P') el.classList.add('cards-product-card-footnote');
  });

  if (before.length) {
    const content = document.createElement('div');
    content.className = 'cards-product-card-content';
    content.append(...before);
    body.prepend(content);
  }
}

/**
 * hover: an image-only paragraph in the body (that is not the title logo) is the tile's
 * corner icon; lift it out of the copy so it can sit in the corner.
 * @param {HTMLLIElement} li
 */
function liftCornerIcon(li) {
  const body = li.querySelector('.cards-product-card-body');
  if (!body) return;
  const icon = [...body.querySelectorAll('p')].find((p) => p.querySelector('picture')
    && !p.textContent.trim() && !p.classList.contains('cards-product-card-logo'));
  if (!icon) return;
  icon.className = 'cards-product-card-icon';
  li.append(icon);
  const content = body.querySelector('.cards-product-card-content');
  if (content && !content.children.length) content.remove();
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    let hasImage = false;
    [...li.children].forEach((cell) => {
      const onlyPicture = !hasImage && cell.querySelector('picture') && !cell.textContent.trim()
        && cell.querySelectorAll('picture').length === 1;
      if (onlyPicture) {
        cell.className = 'cards-product-card-image';
        hasImage = true;
      } else if (!cell.children.length && !cell.textContent.trim()) {
        cell.remove();
      } else {
        cell.className = 'cards-product-card-body';
        decorateBody(cell);
      }
    });
    if (!hasImage) li.classList.add('no-image');
    if (active.includes('hover')) liftCornerIcon(li);

    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('.cards-product-card-image picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1000' }, { width: '750' }]));
  });
  ul.querySelectorAll('.cards-product-card-logo picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
  });

  block.replaceChildren(ul);
}
