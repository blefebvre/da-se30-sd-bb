import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = ['split', 'right'];

/**
 * Removes the element and any ancestors (inside the block) left empty by its removal.
 * @param {Element} el
 * @param {Element} block
 */
function removeAndPrune(el, block) {
  let parent = el.parentElement;
  el.remove();
  while (parent && parent !== block && !parent.textContent.trim() && !parent.querySelector('picture, img')) {
    const next = parent.parentElement;
    parent.remove();
    parent = next;
  }
}

/**
 * Hero (Banner): page-top hero with a full-bleed background image.
 * Content model: row 1 = background image; row 2 = optional foreground/logo image,
 * h1, optional subtitle paragraph(s), optional CTA link. Everything may also be
 * authored in a single cell; the first picture is always the background.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const pictures = [...block.querySelectorAll('picture')];
  const [background, ...foreground] = pictures;

  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  if (background) {
    const img = background.querySelector('img');
    media.append(img
      ? createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : background.cloneNode(true));
    removeAndPrune(background, block);
  } else {
    block.classList.add('no-image');
  }

  const figure = document.createElement('div');
  figure.className = 'hero-banner-figure';
  foreground.forEach((pic) => {
    const img = pic.querySelector('img');
    figure.append(img
      ? createOptimizedPicture(img.src, img.alt || '', true, [{ width: '750' }])
      : pic.cloneNode(true));
    removeAndPrune(pic, block);
  });

  const text = document.createElement('div');
  text.className = 'hero-banner-text';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) text.append(cell.firstChild);
    });
  });
  // drop whitespace-only text nodes / empty paragraphs left by authoring
  [...text.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
    else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P'
      && !node.textContent.trim() && !node.querySelector('picture, img')) node.remove();
  });

  // last paragraph that holds only a link is the CTA
  const ctaP = [...text.querySelectorAll(':scope > p')].reverse().find((p) => {
    const a = p.querySelector('a[href]');
    return a && p.textContent.trim() === a.textContent.trim();
  });
  if (ctaP) ctaP.classList.add('hero-banner-cta');

  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  if (figure.children.length) content.append(figure);
  else block.classList.add('no-figure');
  if (text.children.length) content.append(text);

  // split/right place the foreground image beside the text; without one they keep the
  // text column only (default stacked layout)
  if (active.includes('split') && figure.children.length) {
    const divider = document.createElement('span');
    divider.className = 'hero-banner-divider';
    divider.setAttribute('aria-hidden', 'true');
    figure.after(divider);
  }

  block.replaceChildren(...(background ? [media] : []), content);
}
