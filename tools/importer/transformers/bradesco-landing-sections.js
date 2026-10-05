/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank "landing" template section breaks + Section Metadata.
 * Used ONLY by import-landing.js; must run AFTER bradesco-cleanup.js and
 * bradesco-landing.js (mobile duplicates / decorative strips must already be gone).
 *
 * payload.template.sections[].selector points at the element that STARTS a
 * section (".elementor-<postId> .elementor-element-<id>", verified in
 * migration-work/cleaned.html); following containers continue that section.
 *
 * beforeTransform (before parsers replace elements):
 *  - resolve section starts for the current page (skip ones inside an Elementor
 *    nested-tabs content area, e.g. careers fragment sections on /en/careers/,
 *    which belong to fragment documents);
 *  - fallback for unknown landing pages: every direct child container of the
 *    Elementor page root is a section start, style derived from computed
 *    background colour (grey / red / dark; background images -> none);
 *  - sibling section starts are re-ordered to template order (corporate
 *    .elementor-element-ceba38a photo band is visually above its DOM-earlier
 *    sibling .elementor-element-1cd2ca1 red band);
 *  - insert <hr> before each section start that has content before it (works
 *    for nested starts too); styled sections get a marker so afterTransform can
 *    add Section Metadata. A styled section with nothing before it (first
 *    section, or first fragment section) gets a temporary marker only.
 * afterTransform: Section Metadata (cells { style }) right after each marker,
 * i.e. at the start of its section; leading markers are removed.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';
const SECTION_STYLE_ATTR = 'data-excat-section-style';
const SECTION_LEADING_ATTR = 'data-excat-section-leading';
const MEDIA_SELECTOR = 'img, picture, video, iframe';

function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function hasRootClass(el) {
  return /(^|\s)elementor-\d+(\s|$)/.test(el.className || '');
}

/** Same root detection as bradesco-landing.js (wp-page root, or the fragment-mode
 *  wrapper div.elementor.elementor-6573 around a careers tab panel). */
function getPageRoot(element) {
  const wpPage = element.querySelector('[data-elementor-type="wp-page"]');
  let first = null;
  const candidates = element.querySelectorAll('div.elementor');
  for (const el of candidates) {
    if (!hasRootClass(el)) continue;
    if (el.classList.contains('e-loop-item')) continue;
    if (el.closest('header, footer, .elementor-location-header, .elementor-location-footer, .elementor-location-popup')) continue;
    first = el;
    break;
  }
  if (wpPage && first && first !== wpPage && first.contains(wpPage)) return first;
  return wpPage || first;
}

/** True when any visible text or media precedes `target` inside `scope`. */
function hasContentBefore(scope, target) {
  if (!scope.contains(target)) return true;
  const doc = scope.ownerDocument;
  const walker = doc.createTreeWalker(scope, 0x1 | 0x4); // SHOW_ELEMENT | SHOW_TEXT
  let node = walker.nextNode();
  while (node && node !== target) {
    if (node.nodeType === 3) {
      const parent = node.parentElement;
      if (parent && !parent.closest('script, style, noscript, template')
        && node.textContent.replace(/[ ​\s]+/g, '') !== '') return true;
    } else if (node.matches(MEDIA_SELECTOR)) {
      return true;
    }
    node = walker.nextNode();
  }
  return false;
}

function parseColors(value) {
  const out = [];
  const re = /rgba?\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,\s/]+(\d*\.?\d+))?\s*\)/g;
  let m = re.exec(value || '');
  while (m) {
    const a = m[4] === undefined ? 1 : parseFloat(m[4]);
    if (a > 0.05) out.push([+m[1], +m[2], +m[3]]);
    m = re.exec(value || '');
  }
  return out;
}

function classifyColor([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (r >= 100 && r - g >= 70 && r - b >= 50) return 'red';
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (lum < 0.3) return 'dark';
  if (max - min <= 14 && min >= 220 && max <= 250) return 'grey';
  return null;
}

/** Fallback style from computed background (#f6f6f6/#efefef -> grey, brand red
 *  -> red, near-black/dark gradient -> dark, url() background image -> none). */
function styleFromBackground(el) {
  const view = el.ownerDocument.defaultView;
  if (!view || !view.getComputedStyle) return null;
  const targets = [el, el.querySelector(':scope > .e-con-inner')].filter(Boolean);
  for (const t of targets) {
    const cs = view.getComputedStyle(t);
    if (/url\(/.test(cs.backgroundImage || '')) return null;
    let colors = parseColors(cs.backgroundColor);
    if (!colors.length && /gradient/.test(cs.backgroundImage || '')) colors = parseColors(cs.backgroundImage);
    if (colors.length) {
      const avg = [0, 1, 2].map((i) => colors.reduce((s, c) => s + c[i], 0) / colors.length);
      return classifyColor(avg);
    }
  }
  return null;
}

function resolveSections(element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  const seen = new Set();
  const resolved = [];
  sections.forEach((section) => {
    const el = querySection(element, section.selector);
    if (!el || seen.has(el)) return;
    // On the full careers page the tab-panel (fragment) sections stay inside
    // the tabs block; in fragment mode the panel is no longer under
    // .e-n-tabs-content, so they resolve normally.
    if (el.closest('.e-n-tabs-content')) return;
    seen.add(el);
    resolved.push({ id: String(section.id), style: section.style || null, el });
  });
  if (resolved.length) return resolved;

  // Generic fallback (unknown landing page): direct child containers of the root.
  const root = getPageRoot(element);
  if (!root) return [];
  return Array.from(root.children)
    .filter((c) => c.matches('.e-con, .elementor-section, .elementor-element'))
    .map((el, i) => ({ id: `auto-${i + 1}`, style: styleFromBackground(el), el }));
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    const resolved = resolveSections(element, payload);
    if (!resolved.length) return;

    // Template order wins for sibling section starts.
    for (let i = 1; i < resolved.length; i += 1) {
      const prev = resolved[i - 1].el;
      const cur = resolved[i].el;
      if (prev.parentNode && prev.parentNode === cur.parentNode
        && (cur.compareDocumentPosition(prev) & 4 /* FOLLOWING */)) {
        cur.parentNode.insertBefore(prev, cur);
      }
    }

    const scope = getPageRoot(element) || element;
    for (let i = resolved.length - 1; i >= 0; i -= 1) {
      const { id, style, el } = resolved[i];
      const leading = !hasContentBefore(scope, el);
      if (leading && !style) continue; // no leading empty section
      const hr = doc.createElement('hr');
      if (style) {
        hr.setAttribute(SECTION_MARKER_ATTR, id);
        hr.setAttribute(SECTION_STYLE_ATTR, style);
      }
      if (leading) hr.setAttribute(SECTION_LEADING_ATTR, '');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    const markers = Array.from(element.querySelectorAll(`hr[${SECTION_MARKER_ATTR}]`));
    for (let i = markers.length - 1; i >= 0; i -= 1) {
      const marker = markers[i];
      const style = marker.getAttribute(SECTION_STYLE_ATTR);
      if (style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style },
        });
        marker.after(metadataBlock);
      }
      if (marker.hasAttribute(SECTION_LEADING_ATTR)) {
        marker.remove();
      } else {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        marker.removeAttribute(SECTION_STYLE_ATTR);
      }
    }
  }
}
