/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-article. Base: hero. Source: https://bradescobank.com/en/reits/
 * Output: 2 rows — [featured image] / [h1 post title]. Image row omitted if none found.
 *
 * The featured image is an Elementor per-post CSS background-image on the container
 * (inline <style> rule `.elementor-<postId> .elementor-element.elementor-element-b710887 ...`),
 * different for every post. Resolution order:
 *   1. direct child <img> (scraper-inlined)
 *   2. inline style attribute
 *   3. getComputedStyle(element).backgroundImage
 *   4. document <style> text / CSSOM rules mentioning the element class with background-image
 *   5. <meta property="og:image">
 */

function urlFromCss(value) {
  if (!value) return null;
  const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
}

function elementClass(element) {
  return [...element.classList].find((c) => /^elementor-element-[0-9a-f]{6,8}$/.test(c))
    || (element.getAttribute('data-id') ? `elementor-element-${element.getAttribute('data-id')}` : 'elementor-element-b710887');
}

function postId(element, document) {
  const host = element.closest('[data-elementor-id]');
  if (host) return host.getAttribute('data-elementor-id');
  const m = (document.body && document.body.className || '').match(/postid-(\d+)/);
  return m ? m[1] : null;
}

// Pick the best background-image url among CSS rules whose selector mentions the element class.
function pickFromRules(rules, cls, pid) {
  const hits = rules
    .filter((r) => r.selector.includes(cls) && /background-image\s*:/i.test(r.body))
    .map((r) => {
      const decl = r.body.match(/background-image\s*:\s*([^;]+)/i);
      return { url: decl ? urlFromCss(decl[1]) : null, selector: r.selector, media: r.media };
    })
    .filter((h) => h.url);
  if (!hits.length) return null;
  const score = (h) => (pid && h.selector.includes(`elementor-${pid}`) ? 2 : 0) + (h.media ? 0 : 1);
  hits.sort((a, b) => score(b) - score(a));
  return hits[0].url;
}

function rulesFromText(text) {
  const rules = [];
  // Strip comments, then capture innermost "selector{body}" pairs (works inside @media too).
  // Track brace depth so rules nested in @media/@supports are marked and ranked lower.
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const re = /([^{}]*)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) {
    const before = clean.slice(0, m.index);
    const depth = (before.match(/\{/g) || []).length - (before.match(/\}/g) || []).length;
    rules.push({ selector: m[1].trim(), body: m[2], media: depth > 0 ? 'nested' : null });
  }
  return rules;
}

function rulesFromCssom(document) {
  const rules = [];
  const walk = (list, media) => {
    [...(list || [])].forEach((r) => {
      if (r.cssRules && !r.selectorText) walk(r.cssRules, r.media ? r.media.mediaText : media);
      else if (r.selectorText && r.style) {
        rules.push({ selector: r.selectorText, body: `background-image:${r.style.backgroundImage || ''};`, media });
      }
    });
  };
  try {
    [...(document.styleSheets || [])].forEach((sheet) => {
      try { walk(sheet.cssRules, null); } catch (e) { /* cross-origin sheet */ }
    });
  } catch (e) { /* ignore */ }
  return rules;
}

function resolveImage(element, document) {
  const img = element.querySelector(':scope > img, :scope > picture img');
  if (img) {
    const s = img.getAttribute('data-src') || img.getAttribute('src');
    if (s) return s;
  }

  let src = urlFromCss(element.getAttribute('style'));
  if (src) return src;

  try {
    const view = (element.ownerDocument && element.ownerDocument.defaultView) || document.defaultView;
    if (view && view.getComputedStyle) src = urlFromCss(view.getComputedStyle(element).backgroundImage);
  } catch (e) { /* ignore */ }
  if (src) return src;

  const cls = elementClass(element);
  const pid = postId(element, document);
  const styleText = [...document.querySelectorAll('style')].map((s) => s.textContent || '').join('\n');
  src = pickFromRules(rulesFromText(styleText), cls, pid) || pickFromRules(rulesFromCssom(document), cls, pid);
  if (src) return src;

  const og = document.querySelector('meta[property="og:image"], meta[name="og:image"], meta[name="twitter:image"]');
  return og ? og.getAttribute('content') : null;
}

export default function parse(element, { document }) {
  const heading = element.querySelector('h1, .elementor-widget-theme-post-title .elementor-heading-title, h2');

  const titleText = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : '';
  const src = resolveImage(element, document);

  if (!titleText && !src) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (src) {
    const img = document.createElement('img');
    try {
      img.src = new URL(src, document.baseURI || document.location.href).href;
    } catch (e) {
      img.src = src;
    }
    // keep scraper-local relative paths as-is
    if (/^\.\/|^images\//.test(src)) img.setAttribute('src', src);
    img.alt = titleText;
    cells.push([img]);
  }

  if (titleText) {
    const h1 = document.createElement('h1');
    h1.innerHTML = heading.innerHTML.trim();
    cells.push([h1]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
