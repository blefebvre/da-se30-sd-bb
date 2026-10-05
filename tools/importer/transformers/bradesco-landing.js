/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank "landing" template cleanup (Elementor landing pages).
 * Used ONLY by import-landing.js, after bradesco-cleanup.js and before
 * bradesco-landing-sections.js.
 *
 * Selectors verified in migration-work/cleaned.html (combined landing snapshot)
 * and the per-page analyses' excludedContent lists
 * (migration-work/templates/landing/<slug>/authoring-analysis.json).
 * Page-specific element ids are always scoped with the page root class
 * (.elementor-<postId>) because Elementor reuses ids across pages.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const CONTACT_URL = 'https://bradescobank.com/en/help/';
const MEDIA_SELECTOR = 'img, picture, video, iframe';
const BULLET_ATTR = 'data-excat-bullets';
const BUTTON_ATTR = 'data-excat-button';

// Decorative widgets/containers listed in the analyses' excludedContent.
const DECORATIVE_SELECTORS = [
  // corporate: caminho-12.png red diagonal stripe (also alt="Section background element")
  '.elementor-1799 .elementor-element-439f262',
  // real-estate: elemento-real-2.png / elemento-real-3.png diagonal stripes
  '.elementor-1861 .elementor-element-bc6cbee',
  '.elementor-1861 .elementor-element-50607a3',
  // credit-cards: 1px vertical separator icons between wallet logos
  '.elementor-22451 .elementor-element-47d9f9b',
  '.elementor-22451 .elementor-element-6f7aab1',
  // zelle: Line-8.svg container, zelle-detalhe-1.svg container, image-12.webp
  // stripes (inside hero-promo .elementor-element-3bb0ed2), hero vetor-sup-1.svg /
  // vetor-inf-1.svg (inside hero-banner .elementor-element-eb18198)
  '.elementor-13944 .elementor-element-1bc281d',
  '.elementor-13944 .elementor-element-e74dae0',
  '.elementor-13944 .elementor-element-8ba202e',
  '.elementor-13944 .elementor-element-7ef6142',
  '.elementor-13944 .elementor-element-3beb4c5',
  // personal-bank/investments: dark-red strip image (image-4.svg)
  '.elementor-6840 .elementor-element-3ca1bbd',
  // private-bank: decorative white curve (caminho-52.svg) in the dark CTA band
  '.elementor-2871 .elementor-element-cfbc8cf',
  // visa-infinite: hidden "show less" image widget
  '.elementor-19290 .elementor-element-e214cd8',
];

// JS-only SHOW MORE / SEE MORE toggles (href="#") and their "show less" images.
const TOGGLE_SELECTORS = [
  '.elementor-13944 .elementor-element-d5db71b', // zelle SHOW MORE (.zelle-show-more)
  '.elementor-19290 .elementor-element-9ba697e', // visa-infinite See more (.visa-infinite-show-more)
  '.zelle-show-more',
  '.zelle-show-less',
  '.visa-infinite-show-more',
  '.visa-infinite-show-less',
];

// Slider arrow controls (private-bank, visa-infinite carousels).
const SLIDER_CONTROL_SELECTORS = [
  '.swiper-button-prev',
  '.swiper-button-next',
  '.elementor-swiper-button',
];

// Elementor Pro popup templates (rendered hidden at the end of <body> on the
// live page; stripped from the scraped snapshot). Not migratable.
const POPUP_SELECTORS = [
  '.elementor-location-popup',
  '[data-elementor-type="popup"]',
];

function hasRootClass(el) {
  return /(^|\s)elementor-\d+(\s|$)/.test(el.className || '');
}

/** Elementor page root: [data-elementor-type="wp-page"] or div.elementor.elementor-<id>
 *  (fragment mode: wrapper div.elementor.elementor-6573 around a tab panel). */
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

function normText(el) {
  return (el.textContent || '').replace(/[ ​\s]+/g, ' ').trim();
}

function isContentEmpty(el) {
  return normText(el) === '' && !el.querySelector(MEDIA_SELECTOR) && !el.matches(MEDIA_SELECTOR);
}

function backgroundUrl(el) {
  const view = el.ownerDocument.defaultView;
  const values = [el.style && el.style.backgroundImage];
  if (view && view.getComputedStyle) values.push(view.getComputedStyle(el).backgroundImage);
  for (const v of values) {
    const m = v && v.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
    if (m) return m[1];
  }
  return null;
}

function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function contactPlaceholder(doc) {
  const p = doc.createElement('p');
  const a = doc.createElement('a');
  a.href = CONTACT_URL;
  a.textContent = 'Contact us';
  p.append(a);
  return p;
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument;

  if (hookName === TransformHook.beforeTransform) {
    // 1. Decorative widgets, JS toggles, slider arrows, popups.
    WebImporter.DOMUtils.remove(element, [
      ...DECORATIVE_SELECTORS,
      ...TOGGLE_SELECTORS,
      ...SLIDER_CONTROL_SELECTORS,
      ...POPUP_SELECTORS,
    ]);

    // 2. "Section background element" red line/stripe images (image-3.webp,
    //    caminho-12.png, elemento-private-1.png) on personal-bank, corporate,
    //    personal-bank/investments: <img alt="Section background element">.
    element.querySelectorAll('img[alt="Section background element"]').forEach((img) => {
      (img.closest('.elementor-widget-image') || img).remove();
    });

    // 3. corporate: repeticao-de-grade-1.png red-dot bullet glyph inside
    //    Documentary Services paragraphs -> drop glyph, turn paragraphs into list items.
    element.querySelectorAll('.elementor-1799 img[src*="repeticao-de-grade"], .elementor-1799 img.wp-image-1522').forEach((img) => {
      const p = img.closest('p');
      img.remove();
      if (!p) return;
      // trim the leading "&nbsp; &nbsp;" spacer left after the glyph
      const firstText = p.firstChild && p.firstChild.nodeType === 3 ? p.firstChild : null;
      if (firstText) firstText.textContent = firstText.textContent.replace(/^[\s ]+/, '');
      const li = doc.createElement('li');
      while (p.firstChild) li.append(p.firstChild);
      const prev = p.previousElementSibling;
      if (prev && prev.tagName === 'UL' && prev.hasAttribute(BULLET_ATTR)) {
        prev.append(li);
        p.remove();
      } else {
        const ul = doc.createElement('ul');
        ul.setAttribute(BULLET_ATTR, '');
        ul.append(li);
        p.replaceWith(ul);
      }
    });

    // 4. Elementor default placeholder accordion item (visa-infinite):
    //    title "Accordion", body "–".
    element.querySelectorAll('.elementor-accordion-item').forEach((item) => {
      const title = item.querySelector('.elementor-accordion-title, .elementor-tab-title');
      const body = item.querySelector('.elementor-tab-content');
      if (title && normText(title) === 'Accordion' && (!body || normText(body).replace(/[–—-]/g, '').trim() === '')) {
        item.remove();
      }
    });

    // 5. Elementor popup triggers (<a href="#elementor-action:action=popup:open&settings=base64({id})">)
    //    -> placeholder anchor "#popup-<id>" (popups cannot be migrated).
    element.querySelectorAll('a[href*="elementor-action"]').forEach((a) => {
      let href = a.getAttribute('href') || '';
      try { href = decodeURIComponent(href); } catch (e) { /* keep raw */ }
      if (!/popup/.test(href)) return;
      let id = '';
      const m = href.match(/settings=([A-Za-z0-9+/=]+)/);
      if (m) {
        try { id = String(JSON.parse(atob(m[1])).id || ''); } catch (e) { id = ''; }
      }
      a.setAttribute('href', id ? `#popup-${id}` : '#popup');
    });

    // 6. WPForms / HubSpot forms -> placeholder "Contact us" link. Surrounding
    //    heading/text widgets are kept. Shortcode widgets WITHOUT a form
    //    (real-estate tabs .elementor-element-bccf07d, investments-app post
    //    cards .elementor-element-57278c7a) are untouched.
    //    personal-bank .elementor-element-4c4b3c0 (wpforms-form-3258),
    //    real-estate .elementor-element-1f62fc3 (wpforms-form-3256).
    const FORM_SELECTOR = 'form, .wpforms-container, .hbspt-form';
    element.querySelectorAll('.elementor-widget-shortcode').forEach((widget) => {
      if (!widget.querySelector(FORM_SELECTOR)) return;
      widget.replaceWith(contactPlaceholder(doc));
    });
    element.querySelectorAll('.wpforms-container, .hbspt-form').forEach((form) => {
      if (!form.isConnected) return;
      form.replaceWith(contactPlaceholder(doc));
    });

    // 7. Top-level containers of the Elementor page root.
    const root = getPageRoot(element);
    const sections = (payload && payload.template && payload.template.sections) || [];
    const sectionStarts = new Set();
    sections.forEach((s) => {
      const el = querySection(element, s.selector);
      if (el) sectionStarts.add(el);
    });

    // 7a. Image-only bands whose picture is a CSS background (e.g. credit-cards
    //     .elementor-element-a79f9f8, corporate .elementor-element-ceba38a, both
    //     "full-bleed" section starts) -> materialise as <img> so content survives.
    const bgCandidates = new Set(sectionStarts);
    if (root) Array.from(root.children).forEach((c) => bgCandidates.add(c));
    bgCandidates.forEach((el) => {
      if (!el.isConnected || !isContentEmpty(el)) return;
      const url = backgroundUrl(el);
      if (!url) return;
      const img = doc.createElement('img');
      img.src = url;
      img.alt = '';
      const inner = el.querySelector(':scope > .e-con-inner');
      (inner || el).prepend(img);
      // the importer's transformBackgroundImages rule would add the same image again
      // from the inline background copied off the live page
      if (el.style) el.style.removeProperty('background-image');
      if (el.style && el.style.background && /url\(/i.test(el.style.background)) el.style.removeProperty('background');
    });

    // 7b. Thin red/gradient strips and empty spacer containers between sections:
    //     direct child containers of the page root with no text and no media
    //     (e.g. personal-bank fccde11/20e1f04, private-bank 0dc893a, corporate
    //     61e5698/8a80bde/9698d03, real-estate 8a0d98d/9e973a1, credit-cards f98095f,
    //     signature-gold c0fe5d4, CD 00989d5, zelle/careers 1e5579e, zelle 850de40,
    //     visa-infinite 94f6587/3f03bf8/7535390, investments 7674cc6/e4b0a9f).
    //     Section-start elements are never removed.
    if (root) {
      Array.from(root.children).forEach((child) => {
        if (sectionStarts.has(child)) return;
        if (!child.matches('.e-con, .elementor-section, .elementor-element')) return;
        if (isContentEmpty(child)) child.remove();
      });
    }

    // 8. Section titles outside blocks: Elementor often styles them as h4-h6 or as a
    //    30px+ text-editor paragraph (real-estate, zelle, visa-infinite). Promote them
    //    to h2 using the live computed font size, so default content keeps the heading
    //    hierarchy. Elements inside mapped block instances are left to the parsers.
    const blockSelectors = ((payload && payload.template && payload.template.blocks) || [])
      .flatMap((b) => b.instances || []);
    const inBlock = (el) => blockSelectors.some((sel) => {
      try { return !!el.closest(sel); } catch (e) { return false; }
    });
    const view = doc.defaultView;
    const fontSize = (el) => {
      try { return parseFloat(view.getComputedStyle(el).fontSize) || 0; } catch (e) { return 0; }
    };
    const toH2 = (el) => {
      const h2 = doc.createElement('h2');
      h2.innerHTML = el.innerHTML;
      el.replaceWith(h2);
    };
    // 8b. Sections whose background comes from a section style (grey/red/dark/navy):
    //     drop decorative CSS backgrounds (e.g. careers internship red swoosh) on the
    //     section start and its non-block containers, so the importer's
    //     transformBackgroundImages rule doesn't turn them into content images.
    sections.forEach((s) => {
      if (!s.style || !/\b(grey|red|dark|navy)\b/.test(s.style)) return;
      const start = querySection(element, s.selector);
      if (!start) return;
      [start, ...start.querySelectorAll('.e-con, .elementor-element')].forEach((el) => {
        if (el !== start && inBlock(el)) return;
        if (el.style) {
          el.style.removeProperty('background-image');
          if (el.style.background && /url\(/i.test(el.style.background)) el.style.removeProperty('background');
        }
      });
    });

    // 9. Elementor button widgets in default content -> primary button (<strong><a>),
    //    one paragraph per button. Buttons inside block instances are left to parsers.
    element.querySelectorAll('.elementor-widget-button').forEach((w) => {
      // credit-cards: the product-card CTAs live in the container after the
      // cards-feature instance and are merged into the cards by its parser.
      if (w.closest('.elementor-22451 .elementor-element-9e81d46')) return;
      if (inBlock(w)) {
        // parsers may move such buttons out of the block as default content:
        // mark them so afterTransform can still render them as buttons
        w.querySelectorAll('a[href]').forEach((a) => a.setAttribute(BUTTON_ATTR, ''));
        return;
      }
      const a = w.querySelector('a[href]');
      if (!a) return;
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim();
      if (!label) return;
      // buttons styled as plain text links on the source (transparent background) stay links
      let asText = false;
      try {
        const bg = view.getComputedStyle(a).backgroundColor;
        asText = /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(bg);
      } catch (e) { /* default: button */ }
      const p = doc.createElement('p');
      const link = doc.createElement('a');
      link.setAttribute('href', a.getAttribute('href'));
      link.textContent = label;
      if (asText) {
        p.append(link);
      } else {
        const strong = doc.createElement('strong');
        strong.append(link);
        p.append(strong);
      }
      w.replaceWith(p);
    });

    if (view && view.getComputedStyle) {
      element.querySelectorAll('.elementor-widget-heading :is(h4, h5, h6)').forEach((h) => {
        if (!inBlock(h) && fontSize(h) >= 26) toH2(h);
      });
      // small-print disclaimers authored as heading widgets (e.g. signature-gold
      // "*Covered automatically…", "Offer subject to eligibility…") -> paragraph
      element.querySelectorAll('.elementor-widget-heading :is(h1, h2, h3, h4, h5, h6)').forEach((h) => {
        if (inBlock(h) || fontSize(h) > 16) return;
        const p = doc.createElement('p');
        p.innerHTML = h.innerHTML;
        h.replaceWith(p);
      });
      element.querySelectorAll('.elementor-widget-text-editor').forEach((w) => {
        if (inBlock(w)) return;
        const ps = w.querySelectorAll('p');
        const text = normText(w);
        if (ps.length !== 1 || !text || text.length > 140) return;
        if (w.querySelector('a, img, ul, ol')) return;
        if (fontSize(ps[0]) >= 28) toH2(ps[0]);
      });
    }
  }

  if (hookName === TransformHook.afterTransform) {
    element.querySelectorAll(`[${BULLET_ATTR}]`).forEach((ul) => ul.removeAttribute(BULLET_ATTR));
    // Elementor buttons a parser moved out of its block (default content) -> primary button
    element.querySelectorAll(`a[${BUTTON_ATTR}]`).forEach((a) => {
      a.removeAttribute(BUTTON_ATTR);
      if (a.closest('table, strong, em')) return;
      const p = a.parentElement;
      if (!p || p.tagName !== 'P' || p.textContent.trim() !== a.textContent.trim()) return;
      const strong = doc.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
    });
  }
}
