const OPTION_CLASSES = ['more', 'premium', 'icons'];

const DEFAULT_VISIBLE = 3;

let instance = 0;

/**
 * Number of items shown before "Show more" (optional `visible-N` class, default 3).
 * @param {Element} block
 */
function visibleCount(block) {
  const cls = [...block.classList].find((c) => /^visible-\d+$/.test(c));
  const n = cls ? parseInt(cls.split('-')[1], 10) : DEFAULT_VISIBLE;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_VISIBLE;
}

/**
 * Accordion: one row per item, [label | answer rich text].
 * One item open at a time; the first item opens by default (all start closed with `premium`).
 * With `more` only the first N items show until the "Show more" toggle reveals the rest.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  instance += 1;
  const group = `accordion-${instance}`;

  const items = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children].filter((c) => c.innerHTML.trim());
    if (!cells.length) return;
    const [labelCell, ...bodyCells] = cells;

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.name = group;

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    const title = document.createElement('span');
    title.className = 'accordion-item-title';
    // keep inline formatting of the label, drop a wrapping paragraph / heading
    const only = labelCell.children.length === 1 && labelCell.childNodes.length === 1
      ? labelCell.firstElementChild : null;
    const source = only && /^(P|H[1-6])$/.test(only.tagName) ? only : labelCell;
    while (source.firstChild) title.append(source.firstChild);
    summary.append(title);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    bodyCells.forEach((cell) => {
      while (cell.firstChild) body.append(cell.firstChild);
    });

    details.append(summary, body);
    items.push(details);
  });

  if (items.length && !active.includes('premium')) items[0].open = true;

  block.replaceChildren(...items);

  if (active.includes('more')) {
    const extra = items.slice(visibleCount(block));
    if (!extra.length) return;
    extra.forEach((item) => { item.hidden = true; });

    const wrapper = document.createElement('p');
    wrapper.className = 'accordion-more';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'accordion-more-button';
    toggle.textContent = active.includes('premium') ? 'See more' : 'Show more';
    // the source reveals the remaining items once and drops the toggle
    toggle.addEventListener('click', () => {
      extra.forEach((item) => { item.hidden = false; });
      extra[0].querySelector('summary').focus();
      wrapper.remove();
    });
    wrapper.append(toggle);
    block.append(wrapper);
  }
}
