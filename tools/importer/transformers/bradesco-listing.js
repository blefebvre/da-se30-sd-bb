/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank "listing" template cleanup (article listing / archive pages):
 *   /en/investments-content/                (.elementor-12376)
 *   /en/articles-archive/                   (.elementor-8560)
 *   /en/insights-archive/                   (.elementor-8507)
 *   /en/investments-content/saved-articles/ (.elementor-12632)
 * Used ONLY by import-listing.js, after bradesco-cleanup.js and before
 * bradesco-landing.js / bradesco-landing-sections.js / bradesco-links.js.
 *
 * Selectors verified in migration-work/templates/listing/{investments-content,articles-archive,
 * insights-archive,saved-articles}/cleaned.html (live-rendered DOM) and the raw source HTML
 * /tmp/listing/{investments-content,articles-archive,insights-archive,
 * investments-content_saved-articles}.html.
 *
 * Page-root children (Elementor reuses ids across pages, so ids are scoped by page root):
 *   investments-content: 582fe00 hero | 62594cb strip | 5be4d04 .bb-blog-menu | 65b7b51 Highlights
 *                        | 8514db4 (557535a .custom-posts-grid) | f7af171 (69c13d9 h3 + 08b96a1
 *                        loop grid) | 84ac3c9 promo tiles
 *   articles-archive:    0a2dd9b hero | cf4cd2b strip | 18b7df7 (5f0fbb7 loop grid + pagination)
 *   insights-archive:    055b7fa hero | 68f1a2b strip | b348263 (9bbcacf loop grid + pagination)
 *   saved-articles:      7d911c2 hero | 62594cb strip | 0839dfe blog menu (NO .bb-blog-menu class)
 *                        | 1deedd6 (#favorites-page shortcode)
 *
 * Already handled elsewhere (not repeated here):
 *   - bradesco-cleanup.js: .bb-blog-menu (investments-content 5be4d04), .favorite-container
 *     (loop-item and custom-posts-grid bookmark buttons), <style>/<script> (afterTransform).
 *   - Loop-item <style id="loop-12464|loop-8537|loop-dynamic-8574"> rules are deliberately kept
 *     until cleanup's afterTransform: they carry the per-item CSS background images
 *     (articles-archive b0cf567) that onLoad / the parsers read via getComputedStyle.
 *
 * beforeTransform:
 *  1. Decorative strip under each hero (empty container, CSS background only), removed only
 *     when it holds no text/media. It is a template section start ("listing-strip"), so
 *     bradesco-landing.js step 7a would otherwise materialise its background as an <img>
 *     (saved-articles linha-degrade-desktop-1.jpg, articles-archive Rectangle-3-1.svg).
 *  2. Blog sub-menu bar (site chrome, same decision as the article template's .bb-blog-menu):
 *     any page-root child container holding a .blog-menu-wrapper (saved-articles 0839dfe).
 *  3. Elementor loop-grid pagination UI (all pages are merged into the grid by
 *     import-listing.js onLoad; the block paginates client-side).
 *  4. Saved-articles favorites shortcode: drop JS-only actions / counters, keep the empty
 *     state paragraph rendered emphasised: <p><em>No favorited posts yet.</em></p>.
 *  5. Section headings outside block instances authored as h3/h4 heading widgets -> h2
 *     (investments-content "Latest Insights").
 *  6. Other listing noise: emptied bookmark wrappers and loop-item html (script) widgets.
 * Never removed: post-card content (images, dates, categories, titles, excerpts, bylines),
 * the promo tiles (84ac3c9), the Highlights grid, #favorites-list / p.no-favorites.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

const MEDIA_SELECTOR = 'img, picture, video, iframe, svg';

// Listing page roots (<div data-elementor-type="wp-page" class="elementor elementor-<id>">).
const LISTING_ROOTS = ['.elementor-12376', '.elementor-8560', '.elementor-8507', '.elementor-12632'];

// 1. Decorative strips (verified, all empty, no children):
//    <div class="elementor-element elementor-element-62594cb e-con-full e-flex e-con e-parent"
//         data-settings="{&quot;background_background&quot;:&quot;classic&quot;}"></div>
//    (same shape for cf4cd2b / 68f1a2b; investments-content + saved-articles share 62594cb).
const STRIP_SELECTORS = [
  '.elementor-12376 > .elementor-element-62594cb',
  '.elementor-8560 > .elementor-element-cf4cd2b',
  '.elementor-8507 > .elementor-element-68f1a2b',
  '.elementor-12632 > .elementor-element-62594cb',
];

// 2. Blog sub-menu (verified, saved-articles):
//    <div class="elementor-element elementor-element-0839dfe e-con-full e-flex e-con e-parent">
//      .elementor-widget-shortcode (ce88f61) > .elementor-shortcode > div.blog-menu-wrapper
//        button.menu-toggle (span.hamburger + span.menu-label "Menu")
//        ul.links > li.current-menu-item.saved-articles > a > span "Saved Articles"
//                   + span.favorites-counter.hidden "(<span class="count">0</span>)"
//    investments-content 5be4d04 has the same wrapper (+ a.VoltarLink "Home") and
//    class bb-blog-menu (already removed by bradesco-cleanup.js).
const BLOG_MENU_SELECTORS = [
  '.elementor-12632 > .elementor-element-0839dfe',
  '.elementor-12376 > .elementor-element-5be4d04',
];
const BLOG_MENU_MARKER = '.blog-menu-wrapper';

// 3. Loop-grid pagination (verified, articles-archive 5f0fbb7 / insights-archive 9bbcacf, inside
//    the loop-grid widget after .elementor-loop-container):
//    <div class="e-load-more-anchor" data-page="1" data-max-page="6" data-next-page="..."></div>
//    <nav class="elementor-pagination" aria-label="Pagination">
//      <span aria-current="page" class="page-numbers current"><span class="elementor-screen-only">
//      Page</span>1</span> <a class="page-numbers" href=".../2/">...2</a> <a ...>3</a></nav>
const PAGINATION_SELECTORS = [
  '.elementor-widget-loop-grid .elementor-pagination',
  '.elementor-widget-loop-grid .e-load-more-anchor',
  'nav.elementor-pagination',
  '.e-load-more-anchor',
];

// 4. Favorites shortcode (verified, saved-articles 1deedd6 > b6c6de7):
//    <div id="favorites-page">
//      <div id="favorites-list"><p class="no-favorites">No favorited posts yet.</p></div>   KEEP
//      <div class="favorites-actions">
//        <button id="clear-all-favorites" class="btn-clear">Clear All Favorites</button></div>
//    </div>
//    + the "(0)" counter in the blog menu: <span class="favorites-counter hidden">.
const FAVORITES_SELECTORS = [
  '#favorites-page .favorites-actions',
  '#clear-all-favorites',
  '.favorites-counter',
];

// 6. Other listing noise (verified):
//  - investments-content .custom-posts-grid article.post-card:
//      <div class="post-bookmark-placeholder"><div class="favorite-container">
//        <button class="favorite-btn" title="Add to favorites">... (container removed by cleanup)
//  - investments-content loop item (.elementor-12464): absolutely positioned bookmark shortcode
//      <div class="elementor-element elementor-element-e7759d1 elementor-absolute elementor-widget
//        elementor-widget-shortcode"> > .favorite-container > button.favorite-btn
//  - articles-archive loop item (.elementor-8574): html widget holding only a <script>
//      <div class="elementor-element elementor-element-dabf083 e-con-boxed ..."> >
//        .elementor-element-f1fe7e8.elementor-widget-html (document.addEventListener(... ))
const NOISE_SELECTORS = [
  '.post-bookmark-placeholder',
  '.favorite-btn',
  '.elementor-12464 .elementor-element-e7759d1',
  '.elementor-8574 .elementor-element-dabf083',
  '.e-loop-item .elementor-widget-html',
];

function normText(el) {
  return (el.textContent || '').replace(/[\s ​]+/g, ' ').trim();
}

function isContentEmpty(el) {
  return normText(el) === '' && !el.querySelector(MEDIA_SELECTOR) && !el.matches(MEDIA_SELECTOR);
}

function queryAll(element, selectors) {
  const out = [];
  selectors.forEach((sel) => {
    try {
      element.querySelectorAll(sel).forEach((el) => { if (!out.includes(el)) out.push(el); });
    } catch (e) { /* invalid selector */ }
  });
  return out;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const doc = element.ownerDocument;
    const roots = queryAll(element, LISTING_ROOTS);
    // only the four listing pages: every rule below is scoped to their page roots
    if (!roots.length) return;

    // 1. Decorative strips: only when they hold no text/media.
    queryAll(element, STRIP_SELECTORS).forEach((el) => {
      if (isContentEmpty(el)) el.remove();
    });

    // 2. Blog sub-menu: explicit ids + generic rule (page-root child with a .blog-menu-wrapper).
    queryAll(element, BLOG_MENU_SELECTORS).forEach((el) => {
      if (el.querySelector(BLOG_MENU_MARKER)) el.remove();
    });
    roots.forEach((root) => {
      Array.from(root.children).forEach((child) => {
        if (child.querySelector(BLOG_MENU_MARKER)) child.remove();
      });
    });

    // 3. Pagination UI.
    roots.forEach((root) => WebImporter.DOMUtils.remove(root, PAGINATION_SELECTORS));

    // 4. Favorites shortcode: actions/counters out, empty state emphasised.
    roots.forEach((root) => WebImporter.DOMUtils.remove(root, FAVORITES_SELECTORS));
    element.querySelectorAll('#favorites-page p.no-favorites').forEach((p) => {
      const text = normText(p);
      if (!text || p.querySelector('em')) return;
      const em = doc.createElement('em');
      em.textContent = text;
      p.textContent = '';
      p.append(em);
    });

    // 6. Other listing noise (bookmark buttons, loop-item script widgets).
    roots.forEach((root) => WebImporter.DOMUtils.remove(root, NOISE_SELECTORS));

    // 5. Section headings outside mapped block instances: heading widget h3/h4 -> h2
    //    (verified: .elementor-12376 .elementor-element-69c13d9.elementor-widget-heading >
    //    .elementor-widget-container > h3.elementor-heading-title "Latest Insights").
    //    The class list is kept so bradesco-landing.js step 8 (font-size based small-print
    //    demotion) still sees the source heading size.
    const blockSelectors = ((payload && payload.template && payload.template.blocks) || [])
      .flatMap((b) => b.instances || []);
    const inBlock = (el) => blockSelectors.some((sel) => {
      try { return !!el.closest(sel); } catch (e) { return false; }
    });
    roots.forEach((root) => {
      root.querySelectorAll('.elementor-widget-heading :is(h3, h4)').forEach((h) => {
        if (inBlock(h) || h.closest('.e-loop-item') || !normText(h)) return;
        const h2 = doc.createElement('h2');
        if (h.className) h2.className = h.className;
        h2.innerHTML = h.innerHTML;
        h.replaceWith(h2);
      });
    });
  }
}
