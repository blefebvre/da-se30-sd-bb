import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = ['reverse', 'panel', 'steps', 'numbered', 'filled'];

/**
 * True when a cell holds nothing but picture(s) (and the paragraphs wrapping them).
 * @param {Element} cell
 */
function isMediaCell(cell) {
  return !!cell.querySelector('picture') && !cell.textContent.trim();
}

/**
 * Columns (Media): image + text side by side, one authored row per band.
 * Content model: each row = [image | heading + text/list/h3 pairs]; either cell may hold
 * text instead of an image, and cells may be authored in either order.
 * Options: reverse (image displayed on the other side), panel (with reverse: grey copy panel
 * beside a full-height image), steps (ordered list = dotted timeline), numbered / filled
 * (with steps: white numbered discs on a red rail / dark-red filled numbered discs).
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    const cells = [...row.children].filter((cell) => cell.innerHTML.trim());
    // drop empty cells authors leave behind
    [...row.children].forEach((cell) => { if (!cells.includes(cell)) cell.remove(); });
    row.classList.add(`columns-media-${Math.min(cells.length, 3)}-cols`);

    cells.forEach((cell) => {
      if (isMediaCell(cell)) {
        cell.className = 'columns-media-image';
        cell.querySelectorAll('picture').forEach((pic) => {
          const img = pic.querySelector('img');
          if (img) {
            pic.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [
              { media: '(min-width: 900px)', width: '1200' },
              { width: '750' },
            ]));
          }
        });
      } else {
        cell.className = 'columns-media-text';
        if (active.includes('steps')) {
          cell.querySelectorAll('ol').forEach((ol) => ol.classList.add('columns-media-steps'));
        }
      }
    });

    if (!row.querySelector('.columns-media-image')) row.classList.add('no-image');
  });
}
