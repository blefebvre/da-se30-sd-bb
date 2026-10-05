import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = ['landscape', 'compact'];

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((cell) => {
      const onlyPicture = cell.querySelector('picture') && !cell.textContent.trim();
      cell.className = onlyPicture ? 'cards-audience-card-image' : 'cards-audience-card-body';
      if (!cell.children.length && !cell.textContent.trim()) cell.remove();
    });

    // Defensive: a picture authored inside the body cell becomes the tile image.
    if (!li.querySelector('.cards-audience-card-image')) {
      const pic = li.querySelector('.cards-audience-card-body picture');
      if (pic) {
        const imageCell = document.createElement('div');
        imageCell.className = 'cards-audience-card-image';
        const holder = pic.closest('p') || pic;
        imageCell.append(pic);
        if (holder !== pic && !holder.textContent.trim()) holder.remove();
        li.prepend(imageCell);
      }
    }

    // The label link makes the whole tile clickable (stretched link, see CSS).
    const link = li.querySelector('.cards-audience-card-body a[href]');
    if (link) {
      li.classList.add('has-link');
      link.classList.remove('button', 'primary', 'secondary', 'accent');
      const wrapper = link.closest('.button-wrapper');
      if (wrapper) wrapper.classList.remove('button-wrapper');
    }

    if (li.children.length) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
