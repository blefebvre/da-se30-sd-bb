/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank "category-listing" template cleanup (WordPress blog category
 * archives rendered by Elementor archive templates):
 *   /en/category/educational/    (archive root .elementor-13031)
 *   /en/category/market-insight/ (archive root .elementor-12641)
 *   /en/category/videos/         (archive root .elementor-13035)
 * Used ONLY by import-category-listing.js, after bradesco-cleanup.js and before
 * bradesco-landing.js / bradesco-landing-sections.js / bradesco-links.js.
 *
 * Archive-root children (verified on the live rendered DOM, 2026-10):
 *   educational:    23b3058 hero (bg image + text-editor title) | 545cf99 strip
 *                   | 02cdc07 .bb-blog-menu | 0d46745 (82e923b loop grid)
 *   market-insight: ef7e68f hero | 21ce4a6 strip | 0c3c125 .bb-blog-menu | 0d46745 (82e923b)
 *   videos:         9644ee6 hero | 21ce4a6 strip | 2d91cef blog menu (NO .bb-blog-menu class)
 *                   | 0d46745 (82e923b)
 *
 * Already handled elsewhere: bradesco-cleanup.js removes .bb-blog-menu and .favorite-container.
 *
 * beforeTransform:
 *  1. Decorative strip under the hero (empty container, linha-degrade CSS background), removed
 *     when it holds no text/media, so bradesco-landing.js does not materialise it as an <img>.
 *  2. Blog sub-menu bar (site chrome, same decision as the listing / article templates): any
 *     archive-root child holding a .blog-menu-wrapper (videos 2d91cef).
 *  3. Loop-grid pagination UI (import-category-listing.js onLoad merges every page into the
 *     grid; the block paginates client-side) and the empty "nothing found" placeholder.
 *  4. Loop-item noise: bookmark shortcodes, html (script) widgets.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const MEDIA_SELECTOR = 'img, picture, video, iframe, svg';

const CATEGORY_ROOTS = ['.elementor-13031', '.elementor-12641', '.elementor-13035'];

const STRIP_SELECTORS = [
  '.elementor-13031 > .elementor-element-545cf99',
  '.elementor-12641 > .elementor-element-21ce4a6',
  '.elementor-13035 > .elementor-element-21ce4a6',
];

const BLOG_MENU_SELECTORS = [
  '.elementor-13031 > .elementor-element-02cdc07',
  '.elementor-12641 > .elementor-element-0c3c125',
  '.elementor-13035 > .elementor-element-2d91cef',
];
const BLOG_MENU_MARKER = '.blog-menu-wrapper';

const PAGINATION_SELECTORS = [
  '.elementor-widget-loop-grid .elementor-pagination',
  '.elementor-widget-loop-grid .e-load-more-anchor',
  '.e-loop-nothing-found-message',
  'nav.elementor-pagination',
  '.e-load-more-anchor',
];

const NOISE_SELECTORS = [
  '.post-bookmark-placeholder',
  '.favorite-btn',
  '.e-loop-item .elementor-absolute.elementor-widget-shortcode:has(.favorite-container)',
  '.e-loop-item .elementor-widget-html',
];

function normText(el) {
  return (el.textContent || '').replace(/[\s ​]+/g, ' ').trim();
}

function isContentEmpty(el) {
  return normText(el) === '' && !el.querySelector(MEDIA_SELECTOR) && !el.matches(MEDIA_SELECTOR);
}

function queryAll(element, selectors) {
  const out = [];
  selectors.forEach((sel) => {
    try {
      element.querySelectorAll(sel).forEach((el) => { if (!out.includes(el)) out.push(el); });
    } catch (e) { /* unsupported selector */ }
  });
  return out;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;
  const roots = queryAll(element, CATEGORY_ROOTS);
  if (!roots.length) return;

  // 1. Decorative strips
  queryAll(element, STRIP_SELECTORS).forEach((el) => {
    if (isContentEmpty(el)) el.remove();
  });

  // 2. Blog sub-menu
  queryAll(element, BLOG_MENU_SELECTORS).forEach((el) => {
    if (el.querySelector(BLOG_MENU_MARKER)) el.remove();
  });
  roots.forEach((root) => {
    Array.from(root.children).forEach((child) => {
      if (child.querySelector(BLOG_MENU_MARKER)) child.remove();
    });
  });

  // 3. Pagination UI / empty-state placeholder; 4. loop-item noise
  roots.forEach((root) => {
    queryAll(root, PAGINATION_SELECTORS).forEach((el) => el.remove());
    queryAll(root, NOISE_SELECTORS).forEach((el) => el.remove());
  });
}
