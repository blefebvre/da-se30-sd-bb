/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank "info-page" template cleanup (Elementor informational/legal
 * pages: about-us, institutional, help, bank-holidays, bradesco-lounge, security,
 * privacy-and-cookies (+ its 7 tab-panel fragments), other-disclosures, cra-public-file).
 * Used ONLY by import-info-page.js, after bradesco-cleanup.js and before
 * bradesco-landing.js / bradesco-landing-sections.js.
 *
 * Selectors verified in migration-work/templates/info-page/<slug>/cleaned.html and the
 * per-page analyses' excludedContent lists (authoring-analysis.json).
 * Page-specific element ids are always scoped with the page / embedded-template root class
 * (.elementor-<postId>) because Elementor reuses ids across pages and templates
 * (e.g. .elementor-9803 and .elementor-2542 share ae3d255 / 090781e).
 *
 * Every step no-ops when its elements are missing: the file runs on all 9 pages and on the
 * privacy-and-cookies fragments (?fragment=<slug>: body = div.elementor.elementor-2498
 * wrapping a single tab panel).
 *
 * beforeTransform:
 *  1. remove decorative / spacer elements not covered by bradesco-cleanup / bradesco-landing;
 *  2. structural moves so mapped blocks are flat siblings (no nested block tables);
 *  3. help: red-dot image between "Bradesco Bank" and the address -> " • ";
 *  4. default-content headings authored as styled paragraphs / h3 widgets -> h2;
 *  5. privacy tab-panel templates: "." placeholders, styled-paragraph headings -> h2/h3,
 *     bullet-image lines -> <ul><li> (also inside the notice table rows).
 * afterTransform: remove the helper attribute added in step 5.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const BULLET_ATTR = 'data-excat-info-bullets';
const CSS_ATTR = 'data-excat-info-css';

// 1. Decorative widgets / empty spacers from the analyses' excludedContent that the generic
//    rules don't catch (the 19px #900f15 strips under the heroes, e.g. institutional 61e5698,
//    help 0b35093, are empty top-level containers removed by bradesco-landing step 7b; the
//    bank-holidays containers hidden at every breakpoint - 7e22b77, 779aa3e (+ b210b0a),
//    6ad11e8 - carry .elementor-hidden-desktop and are removed by bradesco-cleanup).
const DECORATIVE_SELECTORS = [
  // institutional: "Detalhe corporate" stripe image containers (absolute-positioned
  // image widgets 6f712c1 / 925b212) next to the columns-media / grey sections
  '.elementor-6834 .elementor-element-c1bafdb',
  '.elementor-6834 .elementor-element-72b0fa3',
  // institutional: alt="Section background element" stripe image widget
  '.elementor-6834 .elementor-element-2428ec5',
  // institutional: empty spacer columns (6902f7c after the video hero, fa4f77a inside the
  // hero-promo instance 0796a69 > 2c90867)
  '.elementor-6834 .elementor-element-6902f7c',
  '.elementor-6834 .elementor-element-fa4f77a',
  // institutional: red strip divider (empty e-parent container)
  '.elementor-6834 .elementor-element-db86ed4',
  // other-disclosures: divisao.png (alt="Divisão") divider image widgets between the
  // document items of cards-feature 4fc6a9d (dividers are block CSS)
  '.elementor-467 .elementor-element-e21edd6',
  '.elementor-467 .elementor-element-c14a543',
  '.elementor-467 .elementor-element-44ba0ab',
  '.elementor-467 .elementor-element-d8bba28',
  '.elementor-467 .elementor-element-da17a8a',
  // cra-public-file: empty layout spacer next to the last document tile (in 220b4b9)
  '.elementor-631 .elementor-element-fcfa8ea',
  // privacy notice templates: invisible "." placeholder text widgets in the group rows
  // (Who we are / What we do / Definitions) of the details notice tables
  '.elementor-2456 .elementor-element-359ad53',
  '.elementor-2456 .elementor-element-11f654b',
  '.elementor-2456 .elementor-element-976b22f',
  '.elementor-2514 .elementor-element-b194630',
  '.elementor-2514 .elementor-element-abe6ed9',
  '.elementor-2514 .elementor-element-99b26a7',
];

// 4. Section titles in default content authored as text-editor paragraphs or h3 heading
//    widgets; the analyses model them as H2.
const H2_SELECTORS = [
  // about-us: "Bradesco Bank" / "Banco Bradesco SA" (<p> in .tam-seg-titulo widgets e6335aa, a67b587)
  '.elementor-2212 .tam-seg-titulo p',
  // about-us: "International presence in 6 countries besides Brazil:" (first <p> of widget 5c7c86e)
  '.elementor-2212 .elementor-element-5c7c86e p:first-child',
  // institutional: "Cash Management" (7323a63) / "Credit Solutions" (759ea43) heading widgets (h3)
  '.elementor-6834 .elementor-element-7323a63 h3',
  '.elementor-6834 .elementor-element-759ea43 h3',
  // other-disclosures: "Useful links" (<p> in widget 8690dff)
  '.elementor-467 .elementor-element-8690dff p',
];

// 5. Embedded templates of the privacy-and-cookies tab panels (.elementor-2498 nested tabs).
const PRIVACY_TEMPLATES = ['2456', '2514', '2519', '2527', '2539', '9803', '2542'];

// Top-level rows of the table-article (notice) tables (privacy analysis fragments[].sections
// sequences sourceSelector). Their cells belong to the parser: no heading promotion there.
const NOTICE_ROWS = {
  2456: ['697c7f0', 'f71cafb', '2d492cf', '765f5e0', 'ed03cad', 'e1d4462', '370c845', '3bf885c',
    '79b99f0', '25c853d', 'f6ac3d7', 'fb5dcaf', '6ba3229', 'e65f866', '07e47b9', '0b32bc6',
    '77b4429', 'e7b886d', '9ab7f41', '7c8e479', 'dc75663', '48e0ecb', '5638301', '2eb989e'],
  2514: ['8ecd117', '717d2c5', 'f09cbb6', '08b3406', '0996d82', '9c9398f', '0b6d427', '250f509',
    'fba5984', 'ab0b7cc', '08c5142', 'ccbc17b', 'f008461', 'ecaad1f', 'd30d6e6', '5d66697',
    'b5b9bc0', 'ccbe8da', 'a2798b7', '4c648f8', '67e4087', 'bdddbfa', '166c5ca', '7cbc271'],
  2527: ['a43783e', '1302451', 'fcd6ed6', '6043491', 'b00e01b', '4a9f9f2', '291e3c6', 'df71a71',
    'b658d00', '99dc4e6', '4cc082b', '5c1d646'],
};

// Bullet glyph images: repeticao-de-grade-1.png (wp-image-1522, red dot) and
// risto-colorido.png (wp-image-2703, coloured dash).
const BULLET_IMG = 'img[src*="repeticao-de-grade"], img[src*="risto-colorido"], img.wp-image-1522, img.wp-image-2703';

const WS = /^[\s ​]*$/;

function normText(el) {
  return (el.textContent || '').replace(/[\s ​]+/g, ' ').trim();
}

function rename(el, tag) {
  const doc = el.ownerDocument;
  const n = doc.createElement(tag);
  while (el.firstChild) n.append(el.firstChild);
  el.replaceWith(n);
  return n;
}

/** Move `el` right after `ref` (no-op when either is missing). */
function moveAfter(el, ref) {
  if (el && ref && ref.parentNode && !el.contains(ref)) ref.after(el);
}

/** Move the tiles (children) of container `extra` into the tile level of block instance
 *  `cards` (its .e-con-inner when boxed), then drop `extra` if nothing is left. */
function mergeTiles(cards, extra) {
  if (!cards || !extra || cards.contains(extra) || extra.contains(cards)) return;
  const target = cards.querySelector(':scope > .e-con-inner') || cards;
  const source = extra.querySelector(':scope > .e-con-inner') || extra;
  [...source.children].forEach((tile) => target.append(tile));
  if (!normText(extra) && !extra.querySelector('img, picture, video, iframe')) extra.remove();
}

/** Trim leading/trailing whitespace (incl. &nbsp;) of a list of nodes, descending into
 *  inline elements (e.g. <strong> [img]&nbsp; Advertising…</strong>). */
function trimNodes(nodes) {
  const trimEdge = (list, start) => {
    const seq = start ? list : [...list].reverse();
    for (const n of seq) {
      if (n.nodeType === 3) {
        n.textContent = start ? n.textContent.replace(/^[\s ]+/, '') : n.textContent.replace(/[\s ]+$/, '');
        if (n.textContent) return;
      } else if (n.nodeType === 1) {
        if (/^(IMG|PICTURE|BR)$/.test(n.tagName)) return;
        trimEdge([...n.childNodes], start);
        if (normText(n) || n.querySelector('img')) return;
      }
    }
  };
  trimEdge(nodes, true);
  trimEdge(nodes, false);
  return nodes.filter((n) => !(n.nodeType === 3 && n.textContent === '')
    && !(n.nodeType === 1 && !/^(IMG|PICTURE)$/.test(n.tagName) && !normText(n) && !n.querySelector('img')));
}

/** True when all visible text of `nodes` sits inside <strong>/<b>. */
function isStrongOnly(nodes) {
  let hasStrong = false;
  for (const n of nodes) {
    if (n.nodeType === 3) {
      if (!WS.test(n.textContent)) return false;
    } else if (n.nodeType === 1) {
      if (/^(STRONG|B)$/.test(n.tagName)) {
        if (normText(n)) hasStrong = true;
      } else if (n.tagName === 'BR' || WS.test(n.textContent)) {
        // ignore
      } else if (/^(SPAN|U|EM|I)$/.test(n.tagName)) {
        if (!isStrongOnly([...n.childNodes])) return false;
        hasStrong = true;
      } else {
        return false;
      }
    }
  }
  return hasStrong;
}

/** A non-bullet line continues the previous bullet item when the source wrapped it
 *  ("…everyday business<br>purposes-information…", "…identification and<br>Tax…"). */
function isContinuation(prevText, text) {
  return /^[a-z]/.test(text) || /(\b(and|or|of|the|to|for|with|in|a|an)|[,\-–])$/i.test(prevText);
}

/** <p> lines separated by <br>, prefixed by bullet images -> <ul><li>; other lines stay
 *  paragraphs (lead-in before the list, trailing text after it). */
function convertBulletParagraph(p) {
  const doc = p.ownerDocument;
  const lines = [[]];
  [...p.childNodes].forEach((n) => {
    if (n.nodeType === 1 && n.tagName === 'BR') lines.push([]);
    else lines[lines.length - 1].push(n);
  });

  const out = [];
  let ul = null;
  let last = null; // { li, leadIn }
  let para = null;
  lines.forEach((raw) => {
    const isBullet = raw.some((n) => n.nodeType === 1 && (n.matches(BULLET_IMG) || n.querySelector(BULLET_IMG)));
    raw.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.matches(BULLET_IMG)) n.remove();
      else n.querySelectorAll(BULLET_IMG).forEach((img) => img.remove());
    });
    const nodes = trimNodes(raw.filter((n) => n.parentNode || n.nodeType === 3));
    if (!nodes.length || nodes.every((n) => n.nodeType === 3 && WS.test(n.textContent))) return;
    const text = nodes.map((n) => n.textContent).join('').replace(/[\s ]+/g, ' ').trim();

    if (isBullet) {
      if (!ul) {
        ul = doc.createElement('ul');
        ul.setAttribute(BULLET_ATTR, '');
        out.push(ul);
      }
      const li = doc.createElement('li');
      li.append(...nodes);
      ul.append(li);
      last = { li, leadIn: isStrongOnly(nodes), text };
      para = null;
    } else if (last && (last.leadIn || isContinuation(last.text, text))) {
      // bold lead-in item: the text after the <br> is the item body; wrapped line: same item
      if (last.leadIn) last.li.append(doc.createElement('br'));
      else last.li.append(doc.createTextNode(' '));
      last.li.append(...nodes);
      last.text = text;
      last.leadIn = false;
    } else {
      last = null;
      ul = null;
      if (para) {
        para.append(doc.createElement('br'), ...nodes);
      } else {
        para = doc.createElement('p');
        para.append(...nodes);
        out.push(para);
      }
    }
  });

  if (!out.length) {
    p.remove();
    return;
  }
  // consecutive bullet paragraphs (Online Privacy Notice 4c7ae57) -> one list
  const prev = p.previousElementSibling;
  if (out[0].tagName === 'UL' && prev && prev.tagName === 'UL' && prev.hasAttribute(BULLET_ATTR)) {
    prev.append(...out[0].children);
    out.shift();
  }
  p.replaceWith(...out);
}

/**
 * Fragment mode: the import script replaces <body> with the isolated tab panel, which also
 * drops the per-template stylesheets Elementor links inside <body>
 * (<link id="elementor-post-<id>-css" href="/wp-content/uploads/elementor/css/post-<id>.css">,
 * e.g. ".elementor-2519 .elementor-element-ea46f05{font-size:22px}"), so every paragraph
 * computes to the 16px default. Re-load that stylesheet synchronously into <head> so the
 * live computed font sizes are available again. No-op when the link is still present (full
 * page) or the request fails (offline validation): the strong-only fallback applies then.
 */
function ensureTemplateCss(doc, id, originalURL) {
  const href = `/wp-content/uploads/elementor/css/post-${id}.css`;
  const present = [...doc.querySelectorAll('link[rel="stylesheet"], style')].some((n) => (
    (n.getAttribute('href') || '').includes(`post-${id}.css`) || n.getAttribute(CSS_ATTR) === id));
  if (present || !doc.head) return;
  try {
    let origin = '';
    try { origin = new URL(originalURL).origin; } catch (e) { origin = ''; }
    const view = doc.defaultView;
    if (!view || !view.XMLHttpRequest) return;
    const xhr = new view.XMLHttpRequest();
    xhr.open('GET', `${origin}${href}`, false);
    xhr.send(null);
    if (xhr.status !== 200 || !xhr.responseText) return;
    const style = doc.createElement('style');
    style.setAttribute(CSS_ATTR, id);
    style.textContent = xhr.responseText;
    doc.head.append(style);
  } catch (e) { /* fallback rules only */ }
}

function fontInfo(el) {
  const view = el.ownerDocument.defaultView;
  if (!view || !view.getComputedStyle || !el.isConnected) return { size: 0, weight: 0 };
  try {
    // size: largest of the paragraph and its inline wrappers; weight: the paragraph's own
    // (a bold lead-in <strong> must not turn the whole paragraph into a heading)
    let size = 0;
    [el, ...el.querySelectorAll('strong, b, span')].forEach((n) => {
      size = Math.max(size, parseFloat(view.getComputedStyle(n).fontSize) || 0);
    });
    const fw = view.getComputedStyle(el).fontWeight;
    const weight = fw === 'bold' ? 700 : parseInt(fw, 10) || 0;
    return { size, weight };
  } catch (e) {
    return { size: 0, weight: 0 };
  }
}

/** Privacy template default content: styled-paragraph headings -> h2 / h3. */
function promoteTemplateHeadings(tpl, rowSelector) {
  const inNotice = (el) => !!(rowSelector && el.closest(rowSelector));
  const widgets = [...tpl.querySelectorAll('.elementor-widget-text-editor')];

  // fallback-independent rule: the first text widget of a template holding one short
  // paragraph is the document title (Online Privacy Notice, CCPA, Children's Privacy Policy,
  // Changing your information) -> h2
  const first = widgets.find((w) => normText(w));
  let titleP = null;
  if (first && !inNotice(first)) {
    const ps = first.querySelectorAll('p');
    if (ps.length === 1 && normText(first) === normText(ps[0]) && normText(ps[0]).length <= 80
      && !ps[0].querySelector('a, img, br')) titleP = ps[0];
  }

  widgets.forEach((w) => {
    if (inNotice(w)) return;
    w.querySelectorAll('p').forEach((p) => {
      if (p.closest('li, table')) return;
      const text = normText(p);
      if (!text || text.length > 150) return;
      if (p.querySelector('a, picture, ul, ol')) return;
      if ([...p.querySelectorAll('img')].some((img) => !img.matches(BULLET_IMG))) return;
      const nodes = [...p.childNodes].filter((n) => !(n.nodeType === 1 && n.matches(BULLET_IMG)));
      // <br> (at any depth) followed by more text = bold lead-in paragraph
      // ("<strong>Purpose of Image Collection<br></strong>We collect…"), never a heading
      const segments = p.innerHTML.split(/<br\s*\/?>/i)
        .filter((h) => h.replace(/<[^>]+>/g, '').replace(/&nbsp;|[\s ]/g, '') !== '');
      if (segments.length > 1) return;
      const strongOnly = isStrongOnly(nodes);
      const { size, weight } = fontInfo(p);
      let level = 0;
      if (p === titleP || size >= 20) level = 2;
      else if (size >= 17 && (strongOnly || weight >= 600)) level = 3;
      else if (strongOnly && (size === 0 || size >= 15)) level = 3;
      if (!level) return;
      p.querySelectorAll(BULLET_IMG).forEach((img) => img.remove());
      // keep the text, drop the presentational strong/b wrapper
      const h = p.ownerDocument.createElement(`h${level}`);
      h.textContent = text;
      p.replaceWith(h);
    });
  });
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument;

  if (hookName === TransformHook.beforeTransform) {
    // 1. Decorative / spacer / placeholder elements.
    WebImporter.DOMUtils.remove(element, DECORATIVE_SELECTORS);

    // 2. Structural moves: blocks must be flat siblings (inner blocks are parsed first,
    //    which would nest block tables).
    // 2a. institutional: cards-feature 1980f3f (Export collections / Commercial documentary
    //     services / SBLC issuance tiles) sits inside the hero-promo instance 0796a69
    //     (0796a69 > 2c90867 > 38cf35d > 1980f3f) -> right after 0796a69.
    moveAfter(
      element.querySelector('.elementor-6834 .elementor-element-1980f3f'),
      element.querySelector('.elementor-6834 .elementor-element-0796a69'),
    );
    // 2b. help: cards-feature note tile 6aca6cb ("Note: For your protection…") sits inside
    //     the columns-media instance 81ae845 (81ae845 > a6f4f61 > … > 0d9ea73 > 6aca6cb)
    //     -> right after 81ae845.
    moveAfter(
      element.querySelector('.elementor-1481 .elementor-element-6aca6cb'),
      element.querySelector('.elementor-1481 .elementor-element-81ae845'),
    );
    // 2c. security: cards-feature a2edf52 has 2 .protect-account tiles (bdb1227, ce1c305) in
    //     its .e-con-inner; the third tile (556ea62) lives in the sibling container ebf86a1
    //     -> move it next to the others, drop the emptied ebf86a1.
    mergeTiles(
      element.querySelector('.elementor-1178 .elementor-element-a2edf52'),
      element.querySelector('.elementor-1178 .elementor-element-ebf86a1'),
    );
    // 2d. other-disclosures: cards-feature documents 4fc6a9d holds 4 document tiles (ae23b08,
    //     0112d8d, 34b393a, 6289ba7); the last 3 of the 7 (5909ead "Additional Disclosures",
    //     c47d93c "Private Client Fee Schedule", 0d2bf62 "Self Directed Fee Schedule") live in
    //     the sibling container 0d1933e (0e286b0 > .e-con-inner > [4fc6a9d, 0d1933e])
    //     -> move them into 4fc6a9d, drop the emptied 0d1933e.
    mergeTiles(
      element.querySelector('.elementor-467 .elementor-element-4fc6a9d'),
      element.querySelector('.elementor-467 .elementor-element-0d1933e'),
    );

    // 3. help: decorative red dot (img.img-repeat, repeticao-de-grade-1.png) between
    //    "Bradesco Bank" and the address in widget 865d32d -> " • ".
    element.querySelectorAll('.elementor-1481 .elementor-element-865d32d img.img-repeat').forEach((img) => {
      const prev = img.previousSibling;
      const next = img.nextSibling;
      if (prev && prev.nodeType === 3) prev.textContent = prev.textContent.replace(/[\s ]+$/, '');
      if (next && next.nodeType === 3) next.textContent = next.textContent.replace(/^[\s ]+/, '');
      img.replaceWith(doc.createTextNode(' • '));
    });

    // 4. Default-content section titles -> h2.
    H2_SELECTORS.forEach((sel) => {
      element.querySelectorAll(sel).forEach((el) => {
        if (!normText(el) || el.querySelector('a, img')) return;
        rename(el, 'h2');
      });
    });

    // 5. privacy-and-cookies tab-panel templates (full page: inside the tabs widget, which the
    //    tabs parser replaces by fragment links; fragment mode: the isolated panel).
    PRIVACY_TEMPLATES.forEach((id) => {
      element.querySelectorAll(`.elementor-${id}`).forEach((tpl) => {
        ensureTemplateCss(doc, id, payload && payload.params && payload.params.originalURL);
        const rows = NOTICE_ROWS[id] || [];
        const rowSelector = rows.map((r) => `.elementor-${id} .elementor-element-${r}`).join(', ');
        // 5a. bold lead-ins authored with the line break inside the bold element
        //     (SMS 090781e "<b>Use of phone numbers for SMS<br> </b>Your phone…", Online
        //     Privacy d0676f2 "<strong>Image Collection and Usage<br> </strong>Our app…"):
        //     move the <br> after </b>, otherwise the break is lost in conversion and the
        //     lead-in runs into the text.
        tpl.querySelectorAll('strong, b').forEach((s) => {
          let last = s.lastChild;
          while (last && last.nodeType === 3 && WS.test(last.textContent)) last = last.previousSibling;
          if (!last || last.nodeType !== 1 || last.tagName !== 'BR' || !normText(s)) return;
          while (s.lastChild !== last) s.lastChild.remove();
          s.after(last);
        });
        // 5b. headings (default content only; bullet glyph + strong-only line -> h3)
        promoteTemplateHeadings(tpl, rowSelector);
        // 5c. bullet-image lines -> lists (everywhere, incl. the notice table cells)
        const ps = new Set();
        tpl.querySelectorAll(BULLET_IMG).forEach((img) => {
          const p = img.closest('p');
          if (p && tpl.contains(p)) ps.add(p);
          else img.remove();
        });
        ps.forEach((p) => { if (p.isConnected) convertBulletParagraph(p); });
      });
    });
  }

  if (hookName === TransformHook.afterTransform) {
    element.querySelectorAll(`[${BULLET_ATTR}]`).forEach((el) => el.removeAttribute(BULLET_ATTR));
    // stylesheets re-loaded by ensureTemplateCss (they live in <head>, outside the output)
    doc.querySelectorAll(`style[${CSS_ATTR}]`).forEach((el) => el.remove());
  }
}
