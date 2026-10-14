/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank "card-activation" template (visa-gold / visa-infinite /
 * visa-signature activation pages; Elementor roots .elementor-21581 / -20373 / -21555,
 * identical element ids on all three). Used ONLY by import-card-activation.js, after
 * bradesco-cleanup.js and before bradesco-landing.js / bradesco-landing-sections.js.
 *
 * beforeTransform:
 *  - drop the decorative 19px strip under the hero (.elementor-element-5356ebf); the
 *    hero-banner block draws its own strip;
 *  - the 7 activation steps are split over 4 row containers (9b0cd4c: steps 1-2,
 *    8336b05: 3-4, f14b958: 5-6, b403cd7: 7). Move every step tile into the first row
 *    (the mapped cards-feature instance) so they become one block. Step 7 is two sibling
 *    containers (red panel d1b5968 + screenshot panel 46c198b): wrap them in one tile.
 *  - drop the "1." ... "7." number headings (the cards-feature "screens" option numbers
 *    the cards with CSS counters).
 */
const ROOTS = ['21581', '20373', '21555'];
const STEP_ROWS = ['9b0cd4c', '8336b05', 'f14b958', 'b403cd7'];
const STEP_NUMBER = /^\d+\.?$/;
// read by the hero-banner parser: mobile background image URL of the hero container
const MOBILE_BG_ATTR = 'data-excat-mobile-bg';

/**
 * Mobile-only background image of an Elementor container: a rule inside an
 * @media (max-width: <=767px) block of the page stylesheets (Elementor post CSS) that
 * targets `.elementor-element-<id>` with a url() background.
 */
function mobileBackground(doc, id) {
  const needle = `.elementor-element-${id}`;
  const find = (rules, mobile, base) => {
    for (const rule of rules) {
      if (rule.cssRules && rule.media) {
        const m = /max-width:\s*(\d+)/.exec(rule.media.mediaText || '');
        const found = find(rule.cssRules, mobile || (!!m && Number(m[1]) <= 767), base);
        if (found) return found;
      } else if (mobile && rule.selectorText && rule.selectorText.includes(needle)) {
        const bg = (rule.style && (rule.style.backgroundImage || rule.style.background)) || '';
        const u = bg.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
        if (u) {
          try { return new URL(u[1], base).href; } catch (e) { return u[1]; }
        }
      }
    }
    return null;
  };
  for (const sheet of [...doc.styleSheets]) {
    let rules = null;
    try { rules = sheet.cssRules; } catch (e) { rules = null; }
    if (rules) {
      const found = find(rules, false, sheet.href || doc.baseURI);
      if (found) return found;
    }
  }
  return null;
}

function tilesOf(row) {
  const inner = row.querySelector(':scope > .e-con-inner') || row;
  return [...inner.children].filter((c) => c.classList.contains('elementor-element'));
}

// eslint-disable-next-line no-unused-vars
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const doc = element.ownerDocument;

  ROOTS.forEach((id) => {
    const root = element.querySelector(`.elementor-${id}`);
    if (!root) return;

    root.querySelectorAll('.elementor-element-5356ebf').forEach((el) => el.remove());

    // hero: mobile background (Header-mob-1.webp) for the hero-banner parser
    const hero = root.querySelector('.elementor-element-2ee2b11');
    const mobileBg = hero && mobileBackground(doc, '2ee2b11');
    if (mobileBg) hero.setAttribute(MOBILE_BG_ATTR, mobileBg);

    const rows = STEP_ROWS.map((e) => root.querySelector(`.elementor-element-${e}`)).filter(Boolean);
    if (rows.length < 2) return;
    const [first, ...rest] = rows;
    const target = first.querySelector(':scope > .e-con-inner') || first;
    rest.forEach((row) => {
      const tiles = tilesOf(row);
      // a row whose content is split over a red panel + a screenshot panel (step 7)
      const split = tiles.length === 2
        && tiles[0].querySelector('.elementor-widget-heading')
        && !tiles[0].querySelector('img')
        && tiles[1].querySelector('img')
        && !tiles[1].querySelector('.elementor-widget-heading');
      if (split) {
        const tile = doc.createElement('div');
        tile.className = 'elementor-element e-con e-child';
        tile.setAttribute('data-element_type', 'container');
        tile.append(...tiles);
        target.append(tile);
      } else {
        target.append(...tiles);
      }
      row.remove();
    });

    first.querySelectorAll('.elementor-widget-heading').forEach((w) => {
      const h = w.querySelector('h1, h2, h3, h4, h5, h6');
      if (h && STEP_NUMBER.test((h.textContent || '').trim())) w.remove();
    });
  });
}
