import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero (Article): post-title banner.
 * Content model: row 1 = featured image, row 2 = h1 post title.
 * Decorates defensively: image and heading may be in any cell/row, or missing.
 * @param {Element} block
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');

  const media = document.createElement('div');
  media.className = 'hero-article-media';
  if (picture) {
    const img = picture.querySelector('img');
    media.append(img
      ? createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : picture);
  } else {
    block.classList.add('no-image');
  }

  const content = document.createElement('div');
  content.className = 'hero-article-content';
  if (heading) {
    content.append(heading);
  } else {
    // No heading authored: promote any remaining text to the title slot.
    const text = [...block.querySelectorAll('p')]
      .filter((p) => !p.querySelector('picture') && p.textContent.trim());
    if (text.length) {
      const h1 = document.createElement('h1');
      h1.textContent = text[0].textContent.trim();
      content.append(h1);
    }
  }

  const children = [];
  if (picture) children.push(media);
  if (content.childElementCount) children.push(content);
  block.replaceChildren(...children);
}
