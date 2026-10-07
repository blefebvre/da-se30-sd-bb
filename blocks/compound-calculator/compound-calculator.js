/**
 * Compound calculator: annual compounding with an optional recurring contribution.
 * Authored rows are `key | value [| label]`:
 *   title, start, contribution, frequency (annual|monthly), rate, years, max-years, disclaimer
 * Each year: interest = start-of-year balance x rate, then the year's contributions
 * (contribution x 1 or x 12) are added at year end — same model as the source widget.
 */

const DEFAULTS = {
  title: 'Simple Annual Compound Calculator',
  start: { value: '1000', label: 'Starting Amount (US$)' },
  contribution: { value: '0', label: 'Contribution (US$)' },
  frequency: { value: 'annual', label: 'Contribution Frequency' },
  rate: { value: '10', label: 'Annual Return (%)' },
  years: { value: '4', label: 'Years' },
  'max-years': { value: '30' },
};

const SCALE_STEP = 5;
const THUMB_SIZE = 18;

function readConfig(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const [keyCell, valueCell, labelCell] = row.children;
    if (!keyCell || !valueCell) return;
    const key = keyCell.textContent.trim().toLowerCase();
    if (key === 'disclaimer') {
      config.disclaimer = valueCell.innerHTML.trim();
    } else if (key === 'title') {
      config.title = valueCell.textContent.trim();
    } else {
      config[key] = {
        value: valueCell.textContent.trim(),
        label: labelCell ? labelCell.textContent.trim() : '',
      };
    }
  });
  Object.entries(DEFAULTS).forEach(([key, def]) => {
    if (typeof def === 'string') {
      config[key] = config[key] || def;
    } else {
      config[key] = {
        value: (config[key] && config[key].value) || def.value,
        label: (config[key] && config[key].label) || def.label || '',
      };
    }
  });
  return config;
}

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const num = (input) => Math.max(0, parseFloat(input.value) || 0);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  });
  node.append(...children);
  return node;
}

/** Block letters (e.g. "e") that number inputs otherwise accept, as the source widget does. */
function numericOnly(input) {
  input.addEventListener('keydown', (e) => {
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) e.preventDefault();
  });
  input.addEventListener('paste', (e) => {
    if (/[a-zA-Z]/.test(e.clipboardData.getData('text'))) e.preventDefault();
  });
}

function field(id, label, control) {
  return el('div', { class: 'compound-calculator-field' }, el('label', { for: id }, label), control);
}

export default function decorate(block) {
  const config = readConfig(block);
  const uid = `cc-${Math.random().toString(36).slice(2, 8)}`;
  const maxYears = parseInt(config['max-years'].value, 10) || 30;

  const start = el('input', {
    type: 'number', id: `${uid}-start`, value: config.start.value, min: '0', step: '100',
  });
  const contribution = el('input', {
    type: 'number', id: `${uid}-contrib`, value: config.contribution.value, min: '0', step: '50',
  });
  const frequency = el(
    'select',
    { id: `${uid}-freq` },
    el('option', { value: '12' }, 'Monthly'),
    el('option', { value: '1' }, 'Annual'),
  );
  frequency.value = /month/i.test(config.frequency.value) ? '12' : '1';
  const rate = el('input', {
    type: 'number', id: `${uid}-rate`, value: config.rate.value, min: '0', max: '50', step: '0.1',
  });
  const years = el('input', {
    type: 'range', class: 'compound-calculator-slider', id: `${uid}-years`, min: '0', max: String(maxYears), step: '1', value: config.years.value,
  });
  const yearsVal = el('span', {}, years.value);
  const scale = el('div', { class: 'compound-calculator-scale', 'aria-hidden': 'true' });
  for (let v = 0; v <= maxYears; v += SCALE_STEP) scale.append(el('span', { 'data-value': String(v) }, String(v)));

  const yearsLabel = el('label', { for: years.id }, `${config.years.label} (`, yearsVal, ')');
  const yearsField = el('div', { class: 'compound-calculator-field' }, yearsLabel, years, scale);

  const form = el(
    'div',
    { class: 'compound-calculator-panel compound-calculator-form' },
    el('h2', { class: 'compound-calculator-title' }, config.title),
    field(start.id, config.start.label, start),
    field(contribution.id, config.contribution.label, contribution),
    field(frequency.id, config.frequency.label, frequency),
    field(rate.id, config.rate.label, rate),
    yearsField,
  );

  const finalValue = el('p', { class: 'compound-calculator-final', 'aria-live': 'polite' });
  const invested = el('p', { class: 'compound-calculator-amount' });
  const interest = el('p', { class: 'compound-calculator-amount' });
  const summary = el(
    'div',
    { class: 'compound-calculator-results' },
    el('p', { class: 'compound-calculator-label' }, 'Final Value'),
    finalValue,
    el(
      'div',
      { class: 'compound-calculator-split' },
      el('div', {}, el('p', {}, 'Total Invested'), invested),
      el('div', {}, el('p', {}, 'Total Interest'), interest),
    ),
  );

  const headers = ['Years', 'Start', 'Interest', 'Contribution', 'End'];
  const tbody = el('tbody');
  const table = el(
    'table',
    {},
    el('thead', {}, el('tr', {}, ...headers.map((h) => el('th', { scope: 'col' }, h)))),
    tbody,
  );
  const results = el(
    'div',
    { class: 'compound-calculator-panel compound-calculator-output' },
    summary,
    el('div', { class: 'compound-calculator-table' }, table),
  );

  const grid = el('div', { class: 'compound-calculator-grid' }, form, results);
  block.replaceChildren(grid);
  if (config.disclaimer) {
    const disclaimer = el('div', { class: 'compound-calculator-disclaimer' });
    disclaimer.innerHTML = config.disclaimer;
    block.append(disclaimer);
  }

  function cell(label, value, na) {
    const td = el('td', { 'data-label': label }, na ? 'N/A' : value);
    if (na) td.className = 'compound-calculator-na';
    return td;
  }

  function calculate() {
    const rateValue = num(rate) / 100;
    const yearCount = parseInt(years.value, 10);
    const annualContribution = num(contribution) * parseInt(frequency.value, 10);
    let balance = num(start);
    let totalInvested = balance;
    const rows = [el(
      'tr',
      {},
      cell('Years', '0'),
      cell('Start', '', true),
      cell('Interest', '', true),
      cell('Contribution', '', true),
      cell('End', fmt(balance)),
    )];
    for (let y = 1; y <= yearCount; y += 1) {
      const yearStart = balance;
      const yearInterest = yearStart * rateValue;
      balance = yearStart + yearInterest + annualContribution;
      totalInvested += annualContribution;
      rows.push(el(
        'tr',
        {},
        cell('Years', String(y)),
        cell('Start', fmt(yearStart)),
        cell('Interest', fmt(yearInterest)),
        cell('Contribution', fmt(annualContribution)),
        cell('End', fmt(balance)),
      ));
    }
    finalValue.textContent = fmt(balance);
    invested.textContent = fmt(totalInvested);
    interest.textContent = fmt(Math.max(0, balance - totalInvested));
    tbody.replaceChildren(...rows);
  }

  // position scale labels under the matching thumb positions of the range track
  function positionScale() {
    const width = years.offsetWidth;
    if (!width) return;
    scale.querySelectorAll('span').forEach((span) => {
      const pct = parseFloat(span.dataset.value) / maxYears;
      span.style.left = `${THUMB_SIZE / 2 + pct * (width - THUMB_SIZE)}px`;
    });
  }

  [start, contribution, rate].forEach(numericOnly);
  [start, contribution, rate, frequency].forEach((input) => input.addEventListener('input', calculate));
  frequency.addEventListener('change', calculate);
  years.addEventListener('input', () => {
    yearsVal.textContent = years.value;
    calculate();
  });

  calculate();
  new ResizeObserver(positionScale).observe(years);
}
