/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank "faq-hub" template cleanup (WordPress FAQ shortcode hubs:
 * /en/personal-bank/faq/ (.elementor-12036) and /en/personal-bank/investments/faq/
 * (.elementor-17691)).
 * Used ONLY by import-faq-hub.js, after bradesco-cleanup.js and before
 * bradesco-landing.js / bradesco-landing-sections.js / bradesco-links.js.
 *
 * Selectors verified in migration-work/templates/faq-hub/{personal-bank-faq,investments-faq}/
 * cleaned.html and injected-page-root.html (page root after import-faq-hub.js onLoad injected
 * .faq__content > .faq-term-panel[data-term-id] panels with every category's questions).
 *
 * Shortcode markup (both pages):
 *   .faq
 *     .faq__header > .header__inner
 *       .header__inner__search > .search-container > form#faq-search-form.search-form
 *         (input.search-input, #loading-spinner.spinner, button.search-button)
 *       .header__inner__categories > section.swiper.faq-swiper
 *         .swiper-wrapper > .swiper-slide > a.term-link[data-term-id] (icon + label)  KEEP
 *         span.swiper-notification, .swiper-button-next, .swiper-button-prev
 *     .faq__separator  (20px CSS gradient bar)
 *     .faq__content > .content__inner
 *       #loading-spinner-body.spinner
 *       #faq_container > .question-container > .question-item                      KEEP
 *         .cta-header (question + .cta-icon chevron) / .toggle-content.hidden (answer) KEEP
 *       .no-results-message
 *       .faq-term-panel[data-term-id] (injected by onLoad)                          KEEP
 *   .no-results, .section-search, .question-terms are styled by the shortcode's inline CSS
 *   (search-result panes / result term pills); removed when the AJAX search rendered them.
 *
 * beforeTransform:
 *  1. Remove the AJAX search UI. bradesco-landing.js step 6 replaces every
 *     .elementor-widget-shortcode containing a <form> with a "Contact us" placeholder, which
 *     would wipe the whole FAQ app (shortcode widgets c6a9c1b / 4fa91f0 subtree).
 *  2. Remove decorative / JS-only parts of the shortcode.
 *  3. Remove the empty gradient-line container under the hero (personal-bank a3b4bbf,
 *     investments e54f8fd): no text, no media, only a CSS background (linha-degrade).
 *     It is a template section start, so bradesco-landing.js 7a would otherwise materialise
 *     its background as an <img>.
 * Never removed: .toggle-content (class "hidden" but holds the answers), .faq-term-panel,
 * #faq_container, .term-link icons/labels, hero containers 937bd0f / a5dc729 (H1 "FAQ").
 *
 * afterTransform: drop .faq wrappers left without any content.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const MEDIA_SELECTOR = 'img, picture, video, iframe, svg';

// 1. AJAX search UI (verified: .faq .header__inner__search > .search-container >
//    form#faq-search-form.search-form).
const SEARCH_SELECTORS = [
  '.faq .header__inner__search',
  '.faq .search-container',
  '#faq-search-form',
  '.faq form',
];

// 2. Decorative / JS-only parts.
const DECORATIVE_SELECTORS = [
  // gradient bar between the category carousel and the questions
  '.faq__separator',
  // AJAX loading spinners (#loading-spinner in the search box, #loading-spinner-body above
  // #faq_container), both div.spinner
  '#loading-spinner-body',
  '#loading-spinner',
  '.faq .spinner',
  // swiper carousel controls / a11y live region (the slides with .term-link are kept)
  '.faq .swiper-button-next',
  '.faq .swiper-button-prev',
  '.faq .swiper-notification',
  // search "no results" messages (.no-results-message "Nenhum resultado encontrado.")
  '.faq .no-results',
  '.faq .no-results-message',
  // search-result panes and result term pills (rendered by the AJAX search only)
  '.faq .section-search',
  '.faq .question-terms',
  // accordion chevron icons inside .cta-header (block CSS renders the toggle)
  '.faq .cta-icon',
];

// 3. Empty gradient-line containers (direct children of the page root).
const GRADIENT_LINE_SELECTORS = [
  '.elementor-12036 > .elementor-element-a3b4bbf',
  '.elementor-17691 > .elementor-element-e54f8fd',
];

function normText(el) {
  return (el.textContent || '').replace(/[\s ​]+/g, ' ').trim();
}

function isContentEmpty(el) {
  return normText(el) === '' && !el.querySelector(MEDIA_SELECTOR) && !el.matches(MEDIA_SELECTOR);
}

function backgroundUrls(el) {
  const view = el.ownerDocument.defaultView;
  const values = [el.style && el.style.backgroundImage, el.style && el.style.background];
  try {
    if (view && view.getComputedStyle) values.push(view.getComputedStyle(el).backgroundImage);
  } catch (e) { /* detached / no layout */ }
  return values.filter(Boolean).join(' ');
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // only the FAQ shortcode pages: everything below is scoped to .faq or the two page roots
    // 1. AJAX search UI (must go before bradesco-landing step 6 sees the <form>).
    WebImporter.DOMUtils.remove(element, SEARCH_SELECTORS);

    // 2. Decorative / JS-only parts.
    WebImporter.DOMUtils.remove(element, DECORATIVE_SELECTORS);

    // 3. Gradient-line containers: explicit ids + generic rule (empty direct child of the
    //    wp-page root whose inline/computed background is the linha-degrade gradient image).
    WebImporter.DOMUtils.remove(element, GRADIENT_LINE_SELECTORS);
    element.querySelectorAll('[data-elementor-type="wp-page"]').forEach((root) => {
      Array.from(root.children).forEach((child) => {
        if (!isContentEmpty(child)) return;
        if (/linha-degrade/i.test(backgroundUrls(child))) child.remove();
      });
    });
  }

  if (hookName === TransformHook.afterTransform) {
    element.querySelectorAll('.faq').forEach((faq) => {
      if (isContentEmpty(faq)) faq.remove();
    });
  }
}
