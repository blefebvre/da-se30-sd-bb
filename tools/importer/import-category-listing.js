/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the "category-listing" template (WordPress blog category archives,
 * Elementor archive templates):
 *   /en/category/educational/    (.elementor-13031) hero | strip | blog menu | loop grid
 *   /en/category/market-insight/ (.elementor-12641) same layout
 *   /en/category/videos/         (.elementor-13035) same layout
 * Blocks/sections come from tools/importer/page-templates.json (template "category-listing").
 * Reuses the "listing" template's parsers (cards-feature listing branch, hero-banner) and
 * page styles: metadata "template: listing, category-listing" -> body.listing.category-listing.
 *
 * Output per page:
 *   hero-banner (compact, short) | cards-feature (posts, paged-9)
 *   The hero is the same 450px / 270px title banner as /en/investments-content/saved-articles/
 *   (compact short); the grid uses loop-item template 13474, the translation of 12464 =
 *   /en/investments-content/ "Latest Insights" cards (cards-feature "posts"): image, date,
 *   category, title, excerpt; 3/2/1 columns, 9 posts per page, numbered pagination.
 *
 * onLoad() (live page, awaited before the DOM is copied):
 *  1. Loop grids with rendered items + pagination: the pages the pagination links to are
 *     fetched and their loop items appended (same as import-listing.js).
 *  2. EN category archives currently render an EMPTY loop grid (e-loop-nothing-found-message,
 *     the PT/ES translations render their posts). The grid is then filled from the WordPress
 *     REST API: the archive's category (link rel=alternate type=application/json ->
 *     /en/wp-json/wp/v2/categories/<id>), every public post type that uses the "category"
 *     taxonomy (post, insight), newest first - the archive's main query. Each post becomes a
 *     loop item with the 12464/13474 card fields (featured image medium_large, MM/DD/YYYY date,
 *     .post-category-alt, theme-post-title link, theme-post-excerpt).
 */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsFeatureParser from './parsers/cards-feature.js';

// TRANSFORMER IMPORTS (order: cleanup -> category cleanup -> landing cleanup -> sections -> links)
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import categoryListingTransformer from './transformers/bradesco-category-listing.js';
import landingTransformer from './transformers/bradesco-landing.js';
import sectionsTransformer from './transformers/bradesco-landing-sections.js';
import linksTransformer from './transformers/bradesco-links.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-feature': cardsFeatureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "category-listing",
  "description": "Blog category archive",
  "urls": [
    "https://bradescobank.com/en/category/educational/",
    "https://bradescobank.com/en/category/market-insight/",
    "https://bradescobank.com/en/category/videos/"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        ".elementor-13031 .elementor-element-23b3058",
        ".elementor-12641 .elementor-element-ef7e68f",
        ".elementor-13035 .elementor-element-9644ee6"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".elementor-13031 .elementor-element-82e923b",
        ".elementor-12641 .elementor-element-82e923b",
        ".elementor-13035 .elementor-element-82e923b"
      ]
    }
  ],
  "sections": [
    {
      "id": "category-hero",
      "name": "category-hero",
      "selector": [
        ".elementor-13031 .elementor-element-23b3058",
        ".elementor-12641 .elementor-element-ef7e68f",
        ".elementor-13035 .elementor-element-9644ee6"
      ],
      "style": null,
      "blocks": ["hero-banner"],
      "defaultContent": []
    },
    {
      "id": "category-strip",
      "name": "category-strip (decorative gradient strip under the hero, dropped)",
      "selector": [
        ".elementor-13031 .elementor-element-545cf99",
        ".elementor-12641 .elementor-element-21ce4a6",
        ".elementor-13035 .elementor-element-21ce4a6"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "category-blog-menu",
      "name": "category-blog-menu (blog sub-menu: Home pill + Saved Articles, dropped as chrome)",
      "selector": [
        ".elementor-13031 .elementor-element-02cdc07",
        ".elementor-12641 .elementor-element-0c3c125",
        ".elementor-13035 .elementor-element-2d91cef"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "category-posts",
      "name": "category-posts",
      "selector": [
        ".elementor-13031 .elementor-element-0d46745",
        ".elementor-12641 .elementor-element-0d46745",
        ".elementor-13035 .elementor-element-0d46745"
      ],
      "style": null,
      "blocks": ["cards-feature"],
      "defaultContent": []
    }
  ]
};

// Page metadata "template": listing page styles + category-listing specifics.
const TEMPLATE_META = 'listing, category-listing';
// The parsers' listing branches are gated on template === 'listing'.
const PARSER_TEMPLATE = 'listing';
// Posts per page of the archive's loop grid (Elementor pagination "numbers").
const PAGE_SIZE = 9;

// PER-INSTANCE BLOCK OPTIONS (variant classes): block name -> instance selector -> options
const INSTANCE_OPTIONS = {
  "hero-banner": {
    ".elementor-13031 .elementor-element-23b3058": ["compact", "short"],
    ".elementor-12641 .elementor-element-ef7e68f": ["compact", "short"],
    ".elementor-13035 .elementor-element-9644ee6": ["compact", "short"]
  },
  "cards-feature": {
    ".elementor-13031 .elementor-element-82e923b": ["posts", `paged-${PAGE_SIZE}`],
    ".elementor-12641 .elementor-element-82e923b": ["posts", `paged-${PAGE_SIZE}`],
    ".elementor-13035 .elementor-element-82e923b": ["posts", `paged-${PAGE_SIZE}`]
  }
};

const BLOCK_ATTR = 'data-excat-block';

// bradesco-links.js MUST stay last.
const transformers = [
  cleanupTransformer, categoryListingTransformer, landingTransformer, sectionsTransformer,
  linksTransformer,
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

const postIdOf = (el) => (el.className.match(/e-loop-item-(\d+)/) || [])[1];

/** Appends the loop items of every page the grid's pagination links to. */
async function loadAllPages(document, widget) {
  const id = widget.getAttribute('data-id');
  const container = widget.querySelector('.elementor-loop-container');
  if (!id || !container) return;
  const known = new Set([...container.querySelectorAll('.e-loop-item')].map(postIdOf).filter(Boolean));
  const current = new URL(document.location.href);
  const seen = new Set([current.href]);
  const urls = [];
  widget.querySelectorAll('.elementor-pagination a.page-numbers[href]').forEach((a) => {
    const href = new URL(a.getAttribute('href'), current).href;
    if (!seen.has(href)) { seen.add(href); urls.push(href); }
  });
  for (const url of urls) {
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const src = doc.querySelector(`.elementor-widget-loop-grid[data-id="${id}"] .elementor-loop-container`);
      if (!src) throw new Error('loop grid not found');
      [...src.children].forEach((child) => {
        if (child.matches('.e-loop-item')) {
          const postId = postIdOf(child);
          if (postId && known.has(postId)) return;
          if (postId) known.add(postId);
        } else if (child.tagName !== 'STYLE') {
          return;
        }
        container.append(document.importNode(child, true));
      });
    } catch (e) {
      console.warn(`Loop grid ${id}: page ${url} could not be loaded: ${e.message}`);
    }
  }
}

async function getJson(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

/** All items of a paged REST collection. */
async function getAll(url) {
  const out = [];
  for (let page = 1; page <= 20; page += 1) {
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${sep}per_page=100&page=${page}`, { credentials: 'same-origin' });
    if (!res.ok) break; // 400 past the last page
    const items = await res.json();
    out.push(...items);
    const total = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    if (page >= total || items.length < 100) break;
  }
  return out;
}

/** The archive's category: REST base (language-prefixed) + term id. */
async function archiveCategory(document) {
  const alt = document.querySelector('link[rel="alternate"][type="application/json"][href*="/wp/v2/categories/"]');
  if (alt) {
    const m = alt.href.match(/^(.*\/wp\/v2\/)categories\/(\d+)/);
    if (m) return { base: m[1], id: Number(m[2]) };
  }
  const slug = (document.location.pathname.match(/\/category\/([^/]+)/) || [])[1];
  if (!slug) return null;
  const base = `${document.location.origin}/wp-json/wp/v2/`;
  const terms = await getJson(`${base}categories?slug=${encodeURIComponent(slug)}&_fields=id`);
  return terms.length ? { base, id: terms[0].id } : null;
}

const decode = (document, html) => {
  const t = document.createElement('textarea');
  t.innerHTML = String(html || '').replace(/<[^>]*>/g, ' ');
  return t.value.replace(/\s+/g, ' ').trim();
};

/** 2026-09-08T13:57:25 -> 09/08/2026 (the cards' date shortcode format). */
const mmddyyyy = (iso) => {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : '';
};

/** Loop item with the fields of loop-item template 12464 / 13474. */
function loopItem(document, post, categoryNames) {
  const link = post.link || '';
  const media = ((post._embedded || {})['wp:featuredmedia'] || [])[0] || {};
  const sizes = (media.media_details || {}).sizes || {};
  const imgSrc = (sizes.medium_large || sizes.large || sizes.full || {}).source_url || media.source_url || '';
  const category = (post.categories || []).map((id) => categoryNames[id]).find(Boolean) || '';
  const item = document.createElement('div');
  item.className = `elementor e-loop-item e-loop-item-${post.id} post-${post.id} ${post.type || 'post'}`;
  const add = (cls, child) => {
    const w = document.createElement('div');
    w.className = `elementor-element elementor-widget ${cls}`;
    const c = document.createElement('div');
    c.className = 'elementor-widget-container';
    if (typeof child === 'string') c.textContent = child; else c.append(child);
    w.append(c);
    item.append(w);
  };
  if (imgSrc) {
    const a = document.createElement('a');
    a.href = link;
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = media.alt_text || '';
    a.append(img);
    add('elementor-widget-theme-post-featured-image elementor-widget-image', a);
  }
  const date = mmddyyyy(post.date);
  if (date) add('elementor-widget-shortcode', date);
  if (category) {
    const meta = document.createElement('div');
    meta.className = 'post-meta';
    meta.innerHTML = '<span class="post-category-alt"><a></a></span>';
    meta.querySelector('a').textContent = category;
    add('elementor-widget-shortcode', meta);
  }
  const h3 = document.createElement('h3');
  h3.className = 'elementor-heading-title';
  const ta = document.createElement('a');
  ta.href = link;
  ta.textContent = decode(document, (post.title || {}).rendered);
  h3.append(ta);
  add('elementor-widget-theme-post-title elementor-widget-heading', h3);
  const excerpt = decode(document, (post.excerpt || {}).rendered);
  if (excerpt) add('elementor-widget-theme-post-excerpt', excerpt);
  return item;
}

/** Fills an empty archive loop grid from the REST API (see header, onLoad 2). */
async function fillFromRest(document, widget) {
  const cat = await archiveCategory(document);
  if (!cat) { console.warn('Category archive: category not found'); return; }
  const types = await getJson(`${cat.base}types`);
  const bases = Object.values(types)
    .filter((t) => (t.taxonomies || []).includes('category') && t.rest_base)
    .map((t) => t.rest_base);
  const categoryNames = {};
  (await getAll(`${cat.base}categories?_fields=id,name`))
    .forEach((c) => { categoryNames[c.id] = decode(document, c.name); });
  let posts = [];
  for (const base of bases) {
    try {
      posts.push(...await getAll(`${cat.base}${base}?categories=${cat.id}&orderby=date&order=desc&_embed=wp:featuredmedia`));
    } catch (e) {
      console.warn(`Category archive: ${base} could not be loaded: ${e.message}`);
    }
  }
  const seen = new Set();
  posts = posts.filter((p) => !seen.has(p.id) && seen.add(p.id))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const host = widget.querySelector('.elementor-widget-container') || widget;
  let container = widget.querySelector('.elementor-loop-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'elementor-loop-container elementor-grid';
    host.append(container);
  }
  posts.forEach((post) => container.append(loopItem(document, post, categoryNames)));
  console.log(`Category archive ${cat.id}: ${posts.length} posts from ${bases.join(', ')}`);
}

export default {
  /** Runs on the live page (awaited) before html2md copies the document. */
  onLoad: async ({ document }) => {
    const widgets = [...document.querySelectorAll('[data-elementor-type="archive"] .elementor-widget-loop-grid')];
    for (const widget of widgets) {
      try {
        if (widget.querySelector('.e-loop-item')) await loadAllPages(document, widget);
        else await fillFromRest(document, widget);
      } catch (e) {
        console.warn(`Category archive: loop grid could not be filled: ${e.message}`);
      }
    }
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
          document, url, params, options: block.options, template: PARSER_TEMPLATE, basePath,
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
    meta.template = TEMPLATE_META;
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: URL path without trailing slash (/en/category/educational)
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
