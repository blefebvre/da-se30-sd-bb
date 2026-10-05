import { createOptimizedPicture } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const OPTION_CLASSES = ['fragments', 'tiles', 'vertical'];

let tabsCount = 0;

/**
 * True when the element holds picture(s) and no text.
 * @param {Element} el
 */
function isImageOnly(el) {
  return !!el.querySelector('picture') && !el.textContent.trim();
}

/**
 * Replaces authored pictures inside the element with optimized ones.
 * @param {Element} el
 * @param {string} width
 */
function optimizePictures(el, width) {
  el.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width }]));
  });
}

/**
 * tiles: regroup the panel copy into tiles, a new tile starting at every image.
 * @param {Element} panel
 */
function buildTiles(panel) {
  if (!panel.querySelector('picture')) return;
  const grid = document.createElement('ul');
  grid.className = 'tabs-tiles';
  let tile = null;
  const startTile = () => {
    tile = document.createElement('li');
    tile.className = 'tabs-tile';
    const text = document.createElement('div');
    text.className = 'tabs-tile-text';
    tile.append(text);
    grid.append(tile);
  };
  [...panel.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
    const isImage = node.nodeType === Node.ELEMENT_NODE
      && (node.tagName === 'PICTURE' || isImageOnly(node));
    if (isImage) {
      startTile();
      const media = document.createElement('div');
      media.className = 'tabs-tile-media';
      media.append(node);
      tile.prepend(media);
    } else {
      if (!tile) startTile();
      tile.querySelector('.tabs-tile-text').append(node);
    }
  });
  optimizePictures(grid, '600');
  panel.replaceChildren(grid);
}

/**
 * vertical: the panel's first image becomes a full-panel background behind the copy.
 * @param {Element} panel
 */
function buildBackgroundPanel(panel) {
  const pic = panel.querySelector('picture');
  const content = document.createElement('div');
  content.className = 'tabs-panel-content';
  if (pic) {
    const holder = pic.closest('p');
    const media = document.createElement('div');
    media.className = 'tabs-panel-media';
    media.append(pic);
    if (holder && panel.contains(holder) && !holder.textContent.trim() && !holder.querySelector('picture')) holder.remove();
    optimizePictures(media, '1200');
    while (panel.firstChild) content.append(panel.firstChild);
    panel.replaceChildren(media, content);
    panel.classList.add('has-media');
  } else {
    while (panel.firstChild) content.append(panel.firstChild);
    panel.replaceChildren(content);
  }
}

/*
 * fragments: the fragment's sections are placed as siblings of the block's section
 * (directly in <main>) so the page's section styles (main > .section ...) apply to
 * them. The tabpanel owns them via aria-owns; inactive ones are hidden.
 */
const fragmentPanels = new WeakMap();

/**
 * Reads the fragment reference of an authored panel cell set.
 * buildAutoBlocks may already have swapped the `/fragments/` link for the
 * fragment's sections; those are reused as-is.
 * @param {Element[]} cells
 * @returns {{ path: string|null, sections: Element[] }}
 */
function readFragmentCells(cells) {
  const sections = cells.flatMap((c) => (c.classList.contains('section')
    ? [c] : [...c.querySelectorAll(':scope > .section')]));
  if (sections.length) return { path: null, sections };
  const link = cells.map((c) => c.querySelector('a[href]')).find(Boolean);
  if (!link) return { path: null, sections: [] };
  try {
    const path = new URL(link.getAttribute('href'), window.location.href)
      .pathname.replace(/(\.plain)?\.html$/, '');
    return { path, sections: [] };
  } catch {
    return { path: null, sections: [] };
  }
}

/**
 * Places a panel's fragment sections after the block's section, keeping panel order.
 * @param {Element} panel
 * @param {Element[]} sections
 * @param {Element[]} panelEls all panels of the block, in order
 * @param {Element} host the block's section
 */
function placeFragmentSections(panel, sections, panelEls, host) {
  const state = fragmentPanels.get(panel);
  const index = panelEls.indexOf(panel);
  // insert after the last placed section of the closest previous panel, else after host
  let ref = host;
  for (let i = index - 1; i >= 0; i -= 1) {
    const prev = fragmentPanels.get(panelEls[i]);
    if (prev && prev.sections.length) {
      ref = prev.sections[prev.sections.length - 1];
      break;
    }
  }
  ref.after(...sections);
  sections.forEach((section, n) => {
    section.id = section.id || `${panel.id}-section-${n}`;
    section.classList.add('tabs-fragment-section');
    section.hidden = panel.hidden;
  });
  state.sections = sections;
  panel.setAttribute('aria-owns', sections.map((s) => s.id).join(' '));
}

/**
 * fragments: load the panel's linked fragment page (once).
 * @param {Element} panel
 * @param {Element[]} panelEls
 * @param {Element} host
 * @returns {Promise<void>}
 */
function loadPanelFragment(panel, panelEls, host) {
  const state = fragmentPanels.get(panel);
  if (!state) return Promise.resolve();
  if (state.promise) return state.promise;
  if (state.sections.length || !state.path) return Promise.resolve();
  state.promise = loadFragment(state.path).then((fragment) => {
    const sections = fragment ? [...fragment.querySelectorAll(':scope > .section')] : [];
    if (sections.length) placeFragmentSections(panel, sections, panelEls, host);
    else state.promise = null;
  });
  return state.promise;
}

/**
 * Tabs: one authored row per tab, [tab label | panel content].
 * Options: fragments (panel = link to a fragment page), tiles (panel images become a
 * photo tile grid), vertical (tab list on the left, panel image as background).
 * @param {Element} block
 */
export default async function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  tabsCount += 1;
  const id = `tabs-${tabsCount}`;

  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  if (active.includes('vertical')) tablist.setAttribute('aria-orientation', 'vertical');

  const panels = document.createElement('div');
  panels.className = 'tabs-panels';

  const buttons = [];
  const panelEls = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const [labelCell, ...rest] = cells;
    const label = labelCell.textContent.trim();
    if (!label && !rest.some((c) => c.innerHTML.trim())) return;

    const index = buttons.length;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-tab';
    button.id = `${id}-tab-${index}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `${id}-panel-${index}`);
    // keep inline formatting of the label, drop wrapping paragraphs
    const labelSource = labelCell.querySelector('p') && labelCell.children.length === 1
      ? labelCell.firstElementChild : labelCell;
    button.innerHTML = labelSource.innerHTML.trim() || `Tab ${index + 1}`;

    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = `${id}-panel-${index}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.hidden = true;
    if (active.includes('fragments')) {
      // the authored cells stay detached: a pending buildAutoBlocks swap lands there harmlessly
      fragmentPanels.set(panel, { ...readFragmentCells(rest), promise: null });
    } else {
      panel.tabIndex = 0;
      rest.forEach((cell) => {
        while (cell.firstChild) panel.append(cell.firstChild);
      });
    }

    if (active.includes('tiles')) buildTiles(panel);
    else if (active.includes('vertical')) buildBackgroundPanel(panel);
    else if (!active.includes('fragments')) optimizePictures(panel, '1200');

    buttons.push(button);
    panelEls.push(panel);
    tablist.append(button);
    panels.append(panel);
  });

  const host = block.closest('.section') || block;
  const isFragments = active.includes('fragments');

  const select = (index, focus = false) => {
    buttons.forEach((b, i) => {
      const selected = i === index;
      b.setAttribute('aria-selected', selected);
      b.tabIndex = selected ? 0 : -1;
      panelEls[i].hidden = !selected;
      if (isFragments) {
        fragmentPanels.get(panelEls[i]).sections.forEach((s) => { s.hidden = !selected; });
      }
    });
    if (focus) buttons[index].focus();
    if (isFragments) return loadPanelFragment(panelEls[index], panelEls, host);
    return Promise.resolve();
  };

  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (e) => {
      const keys = active.includes('vertical')
        ? { prev: 'ArrowUp', next: 'ArrowDown' }
        : { prev: 'ArrowLeft', next: 'ArrowRight' };
      let target = null;
      if (e.key === keys.next) target = (i + 1) % buttons.length;
      else if (e.key === keys.prev) target = (i - 1 + buttons.length) % buttons.length;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = buttons.length - 1;
      if (target !== null) {
        e.preventDefault();
        select(target, true);
      }
    });
  });

  block.replaceChildren(tablist, panels);
  if (!buttons.length) return;
  if (isFragments) {
    // fragments buildAutoBlocks already inlined: move them next to the block's section
    panelEls.forEach((panel) => {
      const { sections } = fragmentPanels.get(panel);
      if (sections.length) placeFragmentSections(panel, sections, panelEls, host);
    });
  }
  await select(0);
}
