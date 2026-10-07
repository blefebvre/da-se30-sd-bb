/* eslint-disable */
/* global WebImporter */
/**
 * Parser for compound-calculator. Source: https://bradescobank.com/en/the-power-of-compounding/
 * (template "article-rich"). Instance:
 *   `.elementor-widget-theme-post-content .elementor-widget-shortcode:has(.bdc-calc)` —
 * the compound-interest calculator shortcode (.bdc-calc, inline <style> + <script>).
 * Only the authorable configuration is kept; the behaviour lives in blocks/compound-calculator.
 * Output: key | value [| label] rows
 *   [ title        | .bdc-calc__title text ]
 *   [ start        | #bdc-start value (1000)   | field label ]
 *   [ contribution | #bdc-contrib value (0)    | field label ]
 *   [ frequency    | selected #bdc-freq option, lower-cased (annual) | field label ]
 *   [ rate         | #bdc-rate value (10)      | field label ]
 *   [ years        | .bdc-years value (4)      | field label without the live "(n)" ]
 *   [ max-years    | .bdc-years max (30) ]
 *   [ disclaimer   | <p>.bdc-disclaimer text</p> ]
 * Values come from attributes (the markup defaults, not the script-updated state). Inputs are
 * found by id/class with a label-text fallback. No .bdc-calc -> the element is left untouched.
 */
const norm = (s) => String(s || '').replace(/[\s ​]+/g, ' ').trim();

function blockName(base, options) {
  const opts = (options || []).filter(Boolean);
  return opts.length ? `${base} (${opts.join(', ')})` : base;
}

/** Field wrapper (.bdc-field) + control by selector, else by its label text. */
function field(calc, selector, labelRe) {
  let control = calc.querySelector(selector);
  let wrap = control ? (control.closest('.bdc-field') || control.parentElement) : null;
  if (!control) {
    wrap = [...calc.querySelectorAll('.bdc-field')]
      .find((f) => { const l = f.querySelector('label'); return l && labelRe.test(norm(l.textContent)); }) || null;
    control = wrap ? wrap.querySelector('input, select, textarea') : null;
  }
  let label = '';
  const labelEl = wrap ? wrap.querySelector('label') : null;
  if (labelEl) {
    const clone = labelEl.cloneNode(true);
    clone.querySelectorAll('.bdc-years-val').forEach((s) => s.remove());
    label = norm(clone.textContent).replace(/\s*\(\s*\)\s*$/, '');
  }
  return { control, label };
}

function attr(el, name, fallback) {
  const v = el ? el.getAttribute(name) : null;
  return v !== null && norm(v) !== '' ? norm(v) : fallback;
}

export default function parse(element, { document, options } = {}) {
  const calc = element.matches('.bdc-calc') ? element : element.querySelector('.bdc-calc');
  if (!calc) return;

  const titleEl = calc.querySelector('.bdc-calc__title') || calc.querySelector('h1, h2, h3, h4');
  const title = titleEl ? norm(titleEl.textContent) : '';

  const start = field(calc, '#bdc-start', /^starting amount/i);
  const contrib = field(calc, '#bdc-contrib', /^contribution\b(?!.*frequency)/i);
  const freq = field(calc, '#bdc-freq', /frequency/i);
  const rate = field(calc, '#bdc-rate', /return|rate/i);
  const years = field(calc, '.bdc-years', /^years/i);

  let frequency = 'annual';
  if (freq.control) {
    const opt = freq.control.querySelector('option[selected]');
    if (opt && norm(opt.textContent)) frequency = norm(opt.textContent).toLowerCase();
  }

  const row = (key, value, label) => (label ? [key, value, label] : [key, value]);
  const cells = [];
  if (title) cells.push(['title', title]);
  cells.push(row('start', attr(start.control, 'value', '1000'), start.label));
  cells.push(row('contribution', attr(contrib.control, 'value', '0'), contrib.label));
  cells.push(row('frequency', frequency, freq.label));
  cells.push(row('rate', attr(rate.control, 'value', '10'), rate.label));
  cells.push(row('years', attr(years.control, 'value', '4'), years.label));
  cells.push(['max-years', attr(years.control, 'max', '30')]);

  const disclaimerEl = calc.querySelector('.bdc-disclaimer')
    || (calc.parentElement && calc.parentElement.querySelector('.bdc-disclaimer'));
  const disclaimer = disclaimerEl ? norm(disclaimerEl.textContent) : '';
  if (disclaimer) {
    const p = document.createElement('p');
    p.textContent = disclaimer;
    cells.push(['disclaimer', p]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: blockName('compound-calculator', options), cells });
  element.replaceWith(block);
}
