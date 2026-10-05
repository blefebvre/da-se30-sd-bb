/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Bradesco Bank (WordPress + Blocksy + Elementor) site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 *
 * NOTE: .elementor-element-6cab8f9 is intentionally NOT removed here — the
 * cards-product parser (mapped to .elementor-element-c28d200) consumes its
 * product tiles and leaves the Zelle footnote (.elementor-element-77e13de p)
 * as default content.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Cookie Notice plugin: <div id="cookie-notice" class="cookie-revoke-hidden ...">
      '#cookie-notice',
      // WPML development-site banner: <div class="otgs-development-site-front-end">
      '.otgs-development-site-front-end',
      // Blocksy mobile drawer: <div class="ct-drawer-canvas"> (contains #offcanvas)
      '.ct-drawer-canvas',
      // accessiBe widget: <access-widget-ui>, <span class="acsb-sr-alert acsb-sr-only">,
      // <a class="acsb-sr-only">, <div class="acsb-trigger acsb-widget">
      'access-widget-ui',
      '.acsb-sr-only',
      '.acsb-trigger',
      // Mobile duplicate of hero + audience (elementor-hidden-desktop elementor-hidden-laptop)
      '.elementor-element-b9a3d24',
      // Containers hidden on every breakpoint
      '.elementor-element-6e9c8f1',
      '.elementor-element-2f7416d',
      // Empty decorative divider containers
      '.elementor-element-df3b3d3',
      '.elementor-element-1191c87',
      // --- Article (single post) template chrome; absent on the homepage ---
      // Decorative gradient strip: <div class="elementor-element elementor-element-df751d4 e-con-full ...">
      '.elementor-location-single > .elementor-element-df751d4',
      // Blog sub-menu (Menu toggle / Saved Articles / Home pill):
      // <div class="elementor-element elementor-element-e780a37 e-con-full bb-blog-menu ...">
      '.bb-blog-menu',
      // Favorite/bookmark shortcode widget wrapper + inner <div class="favorite-container">
      '.elementor-element-a848acf',
      '.favorite-container',
      // --- Generic Elementor rules (non-breaking for home/article) ---
      // Elements not visible on desktop: mobile/tablet duplicates and elements
      // hidden at every breakpoint. Class-based on purpose (element ids are
      // reused across pages, e.g. zelle/careers .elementor-element-4d27485).
      // Home: b9a3d24, 6e9c8f1, 2f7416d (already listed above); article: none.
      '.elementor-hidden-desktop',
      // Swiper loop clones: <div class="swiper-slide swiper-slide-duplicate ...">
      // (visa-infinite carousel). Does NOT match real slides that only carry
      // swiper-slide-duplicate-prev/-next/-active state classes.
      '.swiper-slide-duplicate',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Skip link: <a class="skip-link screen-reader-text" href="#main">
      '.skip-link',
      // Site header: <header id="header" class="ct-header">
      '#header',
      // Elementor footer template: <footer class="elementor elementor-6228 elementor-location-footer">
      // (contains .elementor-element-3500dbfc, -71ad2869, -6b13f498, -f98f3fe)
      'footer',
      '.elementor-6228',
      '.elementor-element-3500dbfc',
      '.elementor-element-71ad2869',
      '.elementor-element-6b13f498',
      '.elementor-element-f98f3fe',
      // Elementor device-mode helper: <span id="elementor-device-mode">
      '#elementor-device-mode',
      // Noise: stylesheet links, scripts, styles, noscript, empty tracking iframe
      'link',
      'script',
      'style',
      'noscript',
      'iframe:not([src])',
    ]);

    // Generic content hygiene: drop empty spacer paragraphs (e.g. <p>&nbsp;</p>)
    // and empty headings. Never touches elements inside block tables, and keeps
    // any element that carries media or links.
    element.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach((el) => {
      if (el.closest('table')) return;
      if (el.querySelector('img, picture, video, iframe, svg, a')) return;
      if (el.textContent.replace(/ /g, '').trim() !== '') return;
      el.remove();
    });
  }
}
