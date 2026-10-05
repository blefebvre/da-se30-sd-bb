const OPTION_CLASSES = ['compare', 'features'];

const CHECK_TEXT = /^(:check:|✓|✔|✔️)$/u;

/**
 * compare / features: turn check-mark cells (':check:' / '✓' text or a check icon)
 * into an accessible check element.
 * @param {HTMLTableCellElement} cell
 */
function decorateCheck(cell) {
  const icon = cell.querySelector('.icon-check');
  const text = cell.textContent.trim();
  if (!icon && !CHECK_TEXT.test(text)) return;
  if (icon && text) return;
  const check = document.createElement('span');
  check.className = 'table-article-check';
  check.setAttribute('role', 'img');
  check.setAttribute('aria-label', 'Included');
  cell.replaceChildren(check);
  cell.classList.add('is-check');
}

const DASH_TEXT = /^[-–—]$/u;
// source renders long free-text values (e.g. fee descriptions) in a smaller size
const LONG_TEXT = 38;

/**
 * compare / features: flag dash and long free-text value cells for styling.
 * @param {HTMLTableCellElement} cell
 */
function decorateValue(cell) {
  if (cell.classList.contains('is-check')) return;
  const text = cell.textContent.trim();
  if (DASH_TEXT.test(text)) {
    cell.classList.add('is-dash');
  } else if (text.length > LONG_TEXT) {
    const span = document.createElement('span');
    span.className = 'table-article-long';
    span.append(...cell.childNodes);
    cell.append(span);
    cell.classList.add('is-long');
  }
}

/**
 * Table (Article): generic data table.
 * Content model: first row = header cells, each following row = one data row.
 * Rows with fewer cells are padded to the widest row so columns stay aligned.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  // features: key/value table without a header row
  const hasHeader = !active.includes('features');
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  const colCount = Math.max(...rows.map((row) => row.children.length));

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const buildCell = (source, tag, scope) => {
    const cell = document.createElement(tag);
    if (scope) cell.setAttribute('scope', scope);
    if (source) {
      // unwrap a lone paragraph so cells hold inline content
      const only = source.children.length === 1 && source.firstElementChild.tagName === 'P'
        && source.childNodes.length === 1;
      const from = only ? source.firstElementChild : source;
      while (from.firstChild) cell.append(from.firstChild);
    }
    return cell;
  };

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const cells = [...row.children];
    for (let c = 0; c < colCount; c += 1) {
      if (i === 0 && hasHeader) {
        tr.append(buildCell(cells[c], 'th', 'col'));
      } else if (c === 0 && active.length) {
        // compare / features: the first column labels each row
        tr.append(buildCell(cells[c], 'th', 'row'));
      } else {
        tr.append(buildCell(cells[c], 'td'));
      }
    }
    (i === 0 && hasHeader ? thead : tbody).append(tr);
  });

  if (active.length) {
    tbody.querySelectorAll('td').forEach((td) => {
      decorateCheck(td);
      decorateValue(td);
    });
  }
  if (active.includes('compare')) {
    const first = thead.querySelector('th');
    if (first && !first.textContent.trim()) first.classList.add('is-empty');
  }

  if (thead.children.length) table.append(thead);
  if (tbody.children.length) table.append(tbody);

  const scroller = document.createElement('div');
  scroller.className = 'table-article-scroll';
  scroller.setAttribute('tabindex', '0');
  scroller.setAttribute('role', 'region');
  const label = [...thead.querySelectorAll('th')]
    .map((th) => th.textContent.trim())
    .filter(Boolean)
    .join(', ');
  scroller.setAttribute('aria-label', label ? `Table: ${label}` : 'Table');
  scroller.append(table);

  block.replaceChildren(scroller);
}
