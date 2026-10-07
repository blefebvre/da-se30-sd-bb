/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the "listing" template (article listing / archive pages):
 *   /en/investments-content/                 (.elementor-12376) hero + Highlights (3 posts,
 *                                            custom-posts-grid shortcode) + Latest Insights
 *                                            (9-post loop grid) + 2 category promo tiles
 *   /en/articles-archive/                    (.elementor-8560) hero + loop grid, 3 posts/page,
 *                                            numbered pagination (page reload: /2/, /3/)
 *   /en/insights-archive/                    (.elementor-8507) hero + loop grid, 9 posts/page,
 *                                            numbered pagination (ajax: ?e-page-9bbcacf=2, =3)
 *   /en/investments-content/saved-articles/  (.elementor-12632) hero + favorites empty state
 *                                            (client-side localStorage feature: static shell only)
 * Blocks/sections come from tools/importer/page-templates.json (template "listing").
 *
 * Output per page:
 *   investments-content: hero-video | h2 + cards-feature (posts, featured) [fade section] |
 *                        h2 + cards-feature (posts) | cards-audience (promo)
 *   articles-archive:    hero-banner (compact) | cards-feature (posts, list, paged-3)
 *   insights-archive:    hero-banner (compact) | cards-feature (posts, text, paged-9)
 *   saved-articles:      hero-banner (compact, short) | empty-state paragraph
 *
 * onLoad() (live page, awaited before the DOM is copied):
 *  1. Pagination: every loop grid with an .elementor-pagination fetches the pages its
 *     pagination LINKS to (the pages a visitor can reach; Elementor's page limit caps the
 *     insights archive at 3 of its 6 query pages) and appends their loop items, with the
 *     per-item <style> rules, to the first page's .elementor-loop-container.
 *  2. Loop items whose image is a CSS background (articles-archive) get a real <img>.
 *  3. WordPress shortlinks (https://bradescobank.com/?p=<id>, articles-archive cards) are
 *     resolved to the post permalink via the WP REST API (fallback: follow the redirect),
 *     so bradesco-links can make them site-relative (/en/<slug>).
 */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import heroBannerParser from './parsers/hero-banner.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsAudienceParser from './parsers/cards-audience.js';

// TRANSFORMER IMPORTS (order: cleanup -> listing cleanup -> landing cleanup -> sections -> links)
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import listingTransformer from './transformers/bradesco-listing.js';
import landingTransformer from './transformers/bradesco-landing.js';
import sectionsTransformer from './transformers/bradesco-landing-sections.js';
import linksTransformer from './transformers/bradesco-links.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'hero-banner': heroBannerParser,
  'cards-feature': cardsFeatureParser,
  'cards-audience': cardsAudienceParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "listing",
  "description": "Article listing/archive (loop grid of post cards)",
  "urls": [
    "https://bradescobank.com/en/articles-archive/",
    "https://bradescobank.com/en/insights-archive/",
    "https://bradescobank.com/en/investments-content/",
    "https://bradescobank.com/en/investments-content/saved-articles/"
  ],
  "blocks": [
    {
      "name": "hero-video",
      "instances": [".elementor-12376 .elementor-element-582fe00"]
    },
    {
      "name": "hero-banner",
      "instances": [
        ".elementor-8560 .elementor-element-0a2dd9b",
        ".elementor-8507 .elementor-element-055b7fa",
        ".elementor-12632 .elementor-element-7d911c2"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".elementor-12376 .elementor-element-557535a .custom-posts-grid",
        ".elementor-12376 .elementor-element-08b96a1",
        ".elementor-8560 .elementor-element-5f0fbb7",
        ".elementor-8507 .elementor-element-9bbcacf"
      ]
    },
    {
      "name": "cards-audience",
      "instances": [".elementor-12376 .elementor-element-84ac3c9"]
    }
  ],
  "sections": [
    {
      "id": "listing-hero",
      "name": "listing-hero",
      "selector": [
        ".elementor-12376 .elementor-element-582fe00",
        ".elementor-8560 .elementor-element-0a2dd9b",
        ".elementor-8507 .elementor-element-055b7fa",
        ".elementor-12632 .elementor-element-7d911c2"
      ],
      "style": null,
      "blocks": ["hero-video", "hero-banner"],
      "defaultContent": []
    },
    {
      "id": "listing-strip",
      "name": "listing-strip (decorative gradient/red strip under the hero, dropped)",
      "selector": [
        ".elementor-12376 .elementor-element-62594cb",
        ".elementor-8560 .elementor-element-cf4cd2b",
        ".elementor-8507 .elementor-element-68f1a2b",
        ".elementor-12632 .elementor-element-62594cb"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "listing-blog-menu",
      "name": "listing-blog-menu (blog sub-menu: Home pill + Saved Articles, dropped as chrome)",
      "selector": [
        ".elementor-12376 .elementor-element-5be4d04",
        ".elementor-12632 .elementor-element-0839dfe"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "listing-highlights",
      "name": "listing-highlights",
      "selector": [".elementor-12376 .elementor-element-65b7b51"],
      "style": "fade",
      "blocks": ["cards-feature"],
      "defaultContent": [".elementor-12376 .elementor-element-c5e1a42"]
    },
    {
      "id": "listing-latest",
      "name": "listing-latest",
      "selector": [".elementor-12376 .elementor-element-f7af171"],
      "style": null,
      "blocks": ["cards-feature"],
      "defaultContent": [".elementor-12376 .elementor-element-69c13d9"]
    },
    {
      "id": "listing-categories",
      "name": "listing-categories",
      "selector": [".elementor-12376 .elementor-element-84ac3c9"],
      "style": null,
      "blocks": ["cards-audience"],
      "defaultContent": []
    },
    {
      "id": "listing-archive",
      "name": "listing-archive",
      "selector": [
        ".elementor-8560 .elementor-element-18b7df7",
        ".elementor-8507 .elementor-element-b348263"
      ],
      "style": null,
      "blocks": ["cards-feature"],
      "defaultContent": []
    },
    {
      "id": "listing-favorites",
      "name": "listing-favorites (saved-articles empty state)",
      "selector": [".elementor-12632 .elementor-element-1deedd6"],
      "style": null,
      "blocks": [],
      "defaultContent": [".elementor-12632 .elementor-element-1deedd6 .no-favorites"]
    }
  ]
};

// PER-INSTANCE BLOCK OPTIONS (variant classes): block name -> instance selector -> options
const INSTANCE_OPTIONS = {
  "hero-banner": {
    ".elementor-8560 .elementor-element-0a2dd9b": ["compact"],
    ".elementor-8507 .elementor-element-055b7fa": ["compact"],
    ".elementor-12632 .elementor-element-7d911c2": ["compact", "short"]
  },
  "cards-feature": {
    ".elementor-12376 .elementor-element-557535a .custom-posts-grid": ["posts", "featured"],
    ".elementor-12376 .elementor-element-08b96a1": ["posts"],
    ".elementor-8560 .elementor-element-5f0fbb7": ["posts", "list", "paged-3"],
    ".elementor-8507 .elementor-element-9bbcacf": ["posts", "text", "paged-9"]
  },
  "cards-audience": {
    ".elementor-12376 .elementor-element-84ac3c9": ["promo"]
  }
};

const BLOCK_ATTR = 'data-excat-block';

const transformers = [
  cleanupTransformer, listingTransformer, landingTransformer, sectionsTransformer, linksTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        const options = (INSTANCE_OPTIONS[blockDef.name] || {})[selector] || [];
        element.setAttribute(BLOCK_ATTR, blockDef.name);
        pageBlocks.push({ name: blockDef.name, selector, element, options });
      });
    });
  });
  pageBlocks.sort((a, b) => {
    if (a.element.contains(b.element)) return 1;
    if (b.element.contains(a.element)) return -1;
    return 0;
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/* ------------------------------------------------------------------------------------------
 * onLoad helpers (run in the live page)
 * ---------------------------------------------------------------------------------------- */

/** Absolute URLs of the other pages a loop grid's pagination links to, in page order. */
function paginationUrls(widget, currentHref) {
  const current = new URL(currentHref);
  const seen = new Set([current.href]);
  const urls = [];
  widget.querySelectorAll('.elementor-pagination a.page-numbers[href]').forEach((a) => {
    const href = new URL(a.getAttribute('href'), current).href;
    if (seen.has(href)) return;
    seen.add(href);
    urls.push(href);
  });
  return urls;
}

/**
 * Appends the loop items of every linked pagination page to the first page's grid.
 * The fetched page is matched by the loop-grid widget's data-id; its loop container's
 * children (per-item <style> rules + .e-loop-item elements) are appended in order.
 */
async function loadAllPages(document) {
  const widgets = [...document.querySelectorAll('.elementor-widget-loop-grid')]
    .filter((w) => w.querySelector('.elementor-pagination'));
  for (const widget of widgets) {
    const id = widget.getAttribute('data-id');
    const container = widget.querySelector('.elementor-loop-container');
    if (!id || !container) continue;
    const known = new Set([...container.querySelectorAll('.e-loop-item')]
      .map((it) => (it.className.match(/e-loop-item-(\d+)/) || [])[1]).filter(Boolean));
    const urls = paginationUrls(widget, document.location.href);
    for (const url of urls) {
      try {
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        const src = doc.querySelector(`.elementor-widget-loop-grid[data-id="${id}"] .elementor-loop-container`);
        if (!src) throw new Error('loop grid not found');
        let added = 0;
        [...src.children].forEach((child) => {
          if (child.matches('.e-loop-item')) {
            const postId = (child.className.match(/e-loop-item-(\d+)/) || [])[1];
            if (postId && known.has(postId)) return; // page-limit wrap-around / duplicates
            if (postId) known.add(postId);
            added += 1;
          } else if (child.tagName !== 'STYLE') {
            return;
          }
          container.append(document.importNode(child, true));
        });
        console.log(`Loop grid ${id}: +${added} posts from ${url}`);
      } catch (e) {
        console.warn(`Loop grid ${id}: page ${url} could not be loaded: ${e.message}`);
      }
    }
  }
}

/** Loop-item images set as CSS backgrounds (articles-archive) -> real <img>. */
function materializeLoopBackgrounds(document) {
  const view = document.defaultView;
  document.querySelectorAll('.e-loop-item [data-settings*="background_background"]').forEach((el) => {
    if (el.querySelector('img')) return;
    const bg = view.getComputedStyle(el).backgroundImage || '';
    const m = bg.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
    if (!m || /\.svg(\?|$)/i.test(m[1])) return;
    const img = document.createElement('img');
    img.src = m[1];
    img.alt = '';
    el.prepend(img);
    el.style.backgroundImage = 'none';
  });
}

/** https://bradescobank.com/?p=<id> -> post permalink. */
async function resolveShortlinks(document) {
  const links = [...document.querySelectorAll('a[href*="?p="]')].filter((a) => {
    try {
      const u = new URL(a.href);
      return /(^|\.)bradescobank\.com$/.test(u.hostname) && /^\/?$/.test(u.pathname) && u.searchParams.get('p');
    } catch (e) { return false; }
  });
  if (!links.length) return;
  const ids = [...new Set(links.map((a) => new URL(a.href).searchParams.get('p')))];
  const map = {};
  try {
    const res = await fetch(`/wp-json/wp/v2/posts?include=${ids.join(',')}&per_page=100&_fields=id,link`);
    if (res.ok) (await res.json()).forEach((p) => { map[String(p.id)] = p.link; });
  } catch (e) {
    console.warn(`Shortlinks: REST lookup failed: ${e.message}`);
  }
  for (const id of ids.filter((i) => !map[i])) {
    try {
      const res = await fetch(`/?p=${id}`, { credentials: 'same-origin' });
      if (res.ok && !/[?&]p=/.test(res.url)) map[id] = res.url;
    } catch (e) { /* keep shortlink */ }
  }
  links.forEach((a) => {
    const target = map[new URL(a.href).searchParams.get('p')];
    if (target) a.setAttribute('href', target);
    else console.warn(`Shortlink not resolved: ${a.href}`);
  });
}

export default {
  /** Runs on the live page (awaited) before html2md copies the document. */
  onLoad: async ({ document }) => {
    await loadAllPages(document);
    materializeLoopBackgrounds(document);
    await resolveShortlinks(document);
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    const source = new URL(params.originalURL);
    const basePath = source.pathname.replace(/\/$/, '').replace(/\.html?$/, '');

    // 1. beforeTransform (cleanup + section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse blocks (options = variant classes for this instance)
    pageBlocks.forEach((block) => {
      if (!block.element.isConnected) return;
      const parser = parsers[block.name];
      if (!parser) {
        console.warn(`No parser found for block: ${block.name}`);
        return;
      }
      try {
        parser(block.element, {
          document, url, params, options: block.options, template: PAGE_TEMPLATE.name, basePath,
        });
      } catch (e) {
        console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
      }
    });

    // 4. afterTransform (final cleanup + section metadata + links)
    executeTransformers('afterTransform', main, payload);
    main.querySelectorAll(`[${BLOCK_ATTR}]`).forEach((el) => el.removeAttribute(BLOCK_ATTR));

    // 5. Metadata. Lowercase "template" key: the preview server is case-sensitive about keys.
    main.appendChild(document.createElement('hr'));
    const meta = WebImporter.Blocks.getMetadata(document) || {};
    meta.template = PAGE_TEMPLATE.name;
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: URL path without trailing slash (/en/investments-content)
    const path = WebImporter.FileUtils.sanitizePath(basePath === '' ? '/index' : basePath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
