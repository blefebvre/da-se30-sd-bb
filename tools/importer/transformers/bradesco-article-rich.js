/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank "article-rich" post body tweaks.
 * Runs only for template "article-rich", in the order
 *   bradesco-cleanup -> bradesco-article-rich -> bradesco-sections -> bradesco-links
 * All work is scoped to the post body `.elementor-widget-theme-post-content`
 * (verified in migration-work/templates/article-rich/<slug>/cleaned.html).
 *
 * beforeTransform
 *  - Promote "visual heading" paragraphs: a text-editor widget whose only content
 *    is one short <p> (< 120 chars, no links/images) rendered at >= 24px becomes
 *    an <h3>. e.g. investing-for-different-client-profiles,
 *    .elementor-element-0f101eb: "Investor profiles are not static. They can
 *    change over time due to:" (28px <p>). Skipped inside block instances.
 *    No-op when computed style is unavailable.
 *  - The post-content divider widget is intentionally kept: bradesco-sections
 *    locates the "disclaimer" section via
 *    `.e-con:has(> .e-con-inner > .elementor-widget-divider)`.
 *
 * afterTransform (blocks already parsed into tables; tables are never touched)
 *  - Remove decorative widgets: .elementor-widget-divider, -icon, -spacer,
 *    any <svg>, <img src="data:...">.
 *  - Remove text-less .elementor-widget-shortcode remnants (bookmark/favourite);
 *    the date shortcode .elementor-element-235adcb is always kept.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const POST_BODY = '.elementor-widget-theme-post-content';
const MAX_HEADING_CHARS = 120;
const MIN_HEADING_PX = 24;

// Containers consumed by block parsers (see page-templates.json "article-rich").
const BLOCK_ANCESTORS = [
  '.elementor-widget-n-accordion',
  '.e-n-accordion-item',
  '.elementor-widget-n-carousel',
  '.swiper-slide',
  '.e-con.e-grid',
  '.bdc-calc',
  '.elementor-widget-shortcode',
  '.elementor-widget-html',
  'table',
];

function norm(text) {
  return (text || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function computedFontSize(el) {
  try {
    const view = el.ownerDocument && el.ownerDocument.defaultView;
    if (!view || typeof view.getComputedStyle !== 'function') return NaN;
    return parseFloat(view.getComputedStyle(el).fontSize);
  } catch (e) {
    return NaN;
  }
}

function blockInstanceRoots(root, payload) {
  const roots = new Set();
  const blocks = (payload.template && payload.template.blocks) || [];
  blocks.forEach((b) => {
    (b.instances || []).forEach((sel) => {
      try {
        root.querySelectorAll(sel).forEach((el) => roots.add(el));
      } catch (e) { /* unsupported selector: ignore */ }
    });
  });
  return roots;
}

function insideBlock(el, roots) {
  if (el.closest(BLOCK_ANCESTORS.join(','))) return true;
  for (const r of roots) {
    if (r.contains(el)) return true;
  }
  return false;
}

function promoteVisualHeadings(body, payload) {
  const doc = body.ownerDocument;
  const roots = blockInstanceRoots(body, payload);
  body.querySelectorAll('.elementor-widget-text-editor').forEach((widget) => {
    if (insideBlock(widget, roots)) return;
    const container = widget.querySelector(':scope > .elementor-widget-container') || widget;
    const elementKids = [...container.children];
    if (elementKids.length !== 1 || elementKids[0].tagName !== 'P') return;
    const p = elementKids[0];
    // No stray text outside the single paragraph.
    const stray = [...container.childNodes].some((n) => n.nodeType === 3 && norm(n.textContent));
    if (stray) return;
    const text = norm(p.textContent);
    if (!text || text.length >= MAX_HEADING_CHARS) return;
    // Multi-line paragraphs are not headings, e.g. the 24px author byline on
    // exploring-investment-products-in-the-u-s (.elementor-element-5b4334e):
    // <p>By Guilherme Arruda<br>Fixed Income Analyst</p>
    if (p.querySelector('a, img, picture, video, iframe, svg, br')) return;

    // Font size of the paragraph, or of a single wrapper (<span>/<strong>) carrying all text.
    let size = computedFontSize(p);
    const only = p.children.length === 1 && norm(p.children[0].textContent) === text ? p.children[0] : null;
    if (only) {
      const inner = computedFontSize(only);
      if (!Number.isNaN(inner) && (Number.isNaN(size) || inner > size)) size = inner;
    }
    if (Number.isNaN(size) || size < MIN_HEADING_PX) return;

    const h3 = doc.createElement('h3');
    while (p.firstChild) h3.append(p.firstChild);
    p.replaceWith(h3);
  });
}

/**
 * Split paragraphs that use an empty line (<br>&nbsp;<br>) as a paragraph break into separate
 * <p> elements, e.g. the outro and disclaimer of investing-for-different-client-profiles
 * (.elementor-widget-text-editor: "...risk tolerance.<br>&nbsp;<br>Regardless of ...").
 * Block tables are never touched.
 */
function splitBreakParagraphs(body) {
  const doc = body.ownerDocument;
  const isBlank = (n) => n.nodeType === 3 && !norm(n.textContent);
  body.querySelectorAll('p').forEach((p) => {
    if (p.closest('table')) return;
    const kids = [...p.childNodes];
    const groups = [[]];
    for (let i = 0; i < kids.length; i += 1) {
      const n = kids[i];
      if (n.nodeType === 1 && n.tagName === 'BR') {
        let j = i + 1;
        while (j < kids.length && isBlank(kids[j])) j += 1;
        if (j < kids.length && kids[j].nodeType === 1 && kids[j].tagName === 'BR') {
          groups.push([]);
          i = j;
          continue;
        }
      }
      groups[groups.length - 1].push(n);
    }
    const filled = groups.filter((g) => g.some((n) => !isBlank(n)));
    if (filled.length < 2) return;
    const paras = filled.map((g) => {
      const np = doc.createElement('p');
      g.forEach((n) => np.append(n));
      while (np.firstChild && (isBlank(np.firstChild) || np.firstChild.tagName === 'BR')) np.firstChild.remove();
      while (np.lastChild && (isBlank(np.lastChild) || np.lastChild.tagName === 'BR')) np.lastChild.remove();
      return np;
    });
    p.replaceWith(...paras);
  });
}

/**
 * Clear filename alts: <img alt="Rectangle" src=".../Rectangle-47.webp"> (an alt that is just
 * the start of the file name carries no meaning). Block tables are never touched.
 */
function clearFilenameAlts(body) {
  body.querySelectorAll('img[alt]').forEach((img) => {
    if (img.closest('table')) return;
    const alt = norm(img.getAttribute('alt')).toLowerCase();
    if (!alt) return;
    const src = img.getAttribute('src') || '';
    const file = decodeURIComponent(src.split('?')[0].split('/').pop() || '').toLowerCase();
    const stem = file.replace(/\.[a-z0-9]+$/, '').replace(/[-_]+/g, ' ');
    if (stem === alt || (stem.startsWith(`${alt} `) && /^[\d\sx]+$/.test(stem.slice(alt.length)))) img.setAttribute('alt', '');
  });
}

function removeDecorations(body) {
  const candidates = body.querySelectorAll([
    '.elementor-widget-divider',
    '.elementor-widget-icon',
    '.elementor-widget-spacer',
    'svg',
    'img[src^="data:"]',
  ].join(','));
  candidates.forEach((el) => {
    if (!el.isConnected || el.closest('table')) return;
    el.remove();
  });

  body.querySelectorAll('.elementor-widget-shortcode').forEach((sc) => {
    if (sc.closest('table')) return;
    if (sc.classList.contains('elementor-element-235adcb')) return; // post date
    if (norm(sc.textContent)) return;
    if (sc.querySelector('img:not([src^="data:"]), picture, video, iframe, table')) return;
    sc.remove();
  });
}

export default function transform(hookName, element, payload) {
  if (!(payload && payload.template && payload.template.name === 'article-rich')) return;
  const bodies = element.querySelectorAll(POST_BODY);
  if (!bodies.length) return;

  if (hookName === TransformHook.beforeTransform) {
    bodies.forEach((body) => promoteVisualHeadings(body, payload));
  }

  if (hookName === TransformHook.afterTransform) {
    bodies.forEach((body) => {
      removeDecorations(body);
      splitBreakParagraphs(body);
      clearFilenameAlts(body);
    });
  }
}
