/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the "article-rich" template: single blog posts whose body is a rich
 * Elementor layout (same post chrome / title banner as the "article" template).
 *   /en/exploring-investment-products-in-the-u-s  12-item nested accordion + disclaimer
 *   /en/investing-for-different-client-profiles   4-slide carousel + 3 grid boxes + disclaimer
 *   /en/the-power-of-compounding                   compound-interest calculator, static table,
 *                                                  numbered steps, red option tiles
 * Blocks/sections come from tools/importer/page-templates.json (template "article-rich").
 *
 * Output per page: hero-article | post body (default content + accordion (article) /
 * cards-feature (carousel, slides[, autoplay]) / cards-feature (elevated, gradient, centered) /
 * compound-calculator / table-article (lined) / cards-feature (steps, compact) /
 * cards-feature (filled)) | [disclaimer section] | metadata (template: article-rich)
 *
 * onLoad() (live page): carousel icon widgets render their uploaded SVG inline (no URL in the
 * markup). Each inline <svg> is matched against the site's uploaded SVG media (WP REST API,
 * uploaded around the post date) by its path data and replaced by an <img> of that file, so
 * the icon can be authored as an image.
 */

// PARSER IMPORTS
import heroArticleParser from './parsers/hero-article.js';
import accordionParser from './parsers/accordion.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import tableArticleParser from './parsers/table-article.js';
import compoundCalculatorParser from './parsers/compound-calculator.js';

// TRANSFORMER IMPORTS (order: cleanup -> article-rich -> sections -> links)
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import articleRichTransformer from './transformers/bradesco-article-rich.js';
import sectionsTransformer from './transformers/bradesco-sections.js';
import linksTransformer from './transformers/bradesco-links.js';

// PARSER REGISTRY
const parsers = {
  'hero-article': heroArticleParser,
  accordion: accordionParser,
  'cards-feature': cardsFeatureParser,
  'table-article': tableArticleParser,
  'compound-calculator': compoundCalculatorParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'article-rich',
  description: 'Single post built with a rich Elementor layout inside the post content (nested accordion, carousel, grid boxes, HTML widgets, compound-interest calculator shortcode); same post chrome as "article"',
  urls: [
    'https://bradescobank.com/en/exploring-investment-products-in-the-u-s/',
    'https://bradescobank.com/en/investing-for-different-client-profiles/',
    'https://bradescobank.com/en/the-power-of-compounding/',
  ],
  blocks: [
    { name: 'hero-article', instances: ['.elementor-location-single > .elementor-element-b710887'] },
    { name: 'accordion', instances: ['.elementor-widget-theme-post-content .elementor-widget-n-accordion'] },
    {
      name: 'cards-feature',
      instances: [
        '.elementor-widget-theme-post-content .elementor-widget-n-carousel',
        '.elementor-widget-theme-post-content .e-con.e-grid:has(> .e-con-inner > .e-con)',
        '.elementor-widget-theme-post-content .e-con.e-grid:has(> .e-con)',
        '.elementor-widget-theme-post-content .elementor-widget-html:has(.compounding-steps)',
        '.elementor-widget-theme-post-content .elementor-widget-html:has(.investment-options)',
      ],
    },
    {
      name: 'table-article',
      instances: [
        '.elementor-widget-theme-post-content .elementor-widget-html table',
        '.elementor-widget-theme-post-content .elementor-widget-text-editor table',
      ],
    },
    { name: 'compound-calculator', instances: ['.elementor-widget-theme-post-content .elementor-widget-shortcode:has(.bdc-calc)'] },
  ],
  sections: [
    { id: '1', name: 'post-title-banner', selector: ['.elementor-location-single > .elementor-element-b710887'], style: null, blocks: ['hero-article'], defaultContent: [] },
    { id: '2', name: 'decorative-gradient-line (dropped)', selector: ['.elementor-location-single > .elementor-element-df751d4'], style: null, blocks: [], defaultContent: [] },
    { id: '3', name: 'blog-sub-menu (dropped as chrome)', selector: ['.elementor-location-single > .bb-blog-menu'], style: null, blocks: [], defaultContent: [] },
    {
      id: '4',
      name: 'article-body',
      selector: ['.elementor-location-single > .elementor-element-0fa6826'],
      style: null,
      blocks: ['accordion', 'cards-feature', 'table-article', 'compound-calculator'],
      defaultContent: [
        '.elementor-element-235adcb .elementor-shortcode',
        '.elementor-widget-theme-post-content .elementor-widget-heading',
        '.elementor-widget-theme-post-content .elementor-widget-text-editor',
        '.elementor-widget-theme-post-content .elementor-widget-image',
      ],
    },
    {
      id: '5',
      name: 'disclaimer (post-content divider + small print)',
      selector: [
        '.elementor-widget-theme-post-content .e-con:has(> .e-con-inner > .elementor-widget-divider)',
        '.elementor-widget-theme-post-content .e-con:has(> .elementor-widget-divider)',
      ],
      style: 'disclaimer',
      blocks: [],
      defaultContent: ['.elementor-widget-theme-post-content .e-con:has(> .e-con-inner > .elementor-widget-divider) .elementor-widget-text-editor'],
    },
  ],
};

// PER-INSTANCE BLOCK OPTIONS (variant classes): block name -> instance selector -> options
const INSTANCE_OPTIONS = {
  accordion: {
    '.elementor-widget-theme-post-content .elementor-widget-n-accordion': ['article'],
  },
  'cards-feature': {
    '.elementor-widget-theme-post-content .elementor-widget-n-carousel': ['carousel', 'slides'],
    '.elementor-widget-theme-post-content .e-con.e-grid:has(> .e-con-inner > .e-con)': ['elevated', 'gradient', 'centered'],
    '.elementor-widget-theme-post-content .e-con.e-grid:has(> .e-con)': ['elevated', 'gradient', 'centered'],
    '.elementor-widget-theme-post-content .elementor-widget-html:has(.compounding-steps)': ['steps', 'compact'],
    '.elementor-widget-theme-post-content .elementor-widget-html:has(.investment-options)': ['filled'],
  },
  'table-article': {
    '.elementor-widget-theme-post-content .elementor-widget-html table': ['lined'],
  },
};

const BLOCK_ATTR = 'data-excat-block';

const transformers = [cleanupTransformer, articleRichTransformer, sectionsTransformer, linksTransformer];

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
  // inner instances first (a table inside an html widget before any enclosing block)
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

/** Path-data signature of an SVG document / element (all d attributes, whitespace-free). */
function svgSignature(svg) {
  return [...svg.querySelectorAll('path[d]')].map((p) => p.getAttribute('d').replace(/\s+/g, '')).join('|');
}

/** Inline carousel icon SVGs -> <img> of the matching uploaded SVG media file. */
async function resolveInlineIcons(document) {
  const svgs = [...document.querySelectorAll('.elementor-widget-theme-post-content .elementor-widget-n-carousel .elementor-widget-icon svg')];
  if (!svgs.length) return;
  const wanted = new Map();
  svgs.forEach((svg) => {
    const sig = svgSignature(svg);
    if (sig) wanted.set(sig, (wanted.get(sig) || []).concat(svg));
  });
  if (!wanted.size) return;

  const meta = document.querySelector('meta[property="article:published_time"]');
  const published = meta ? new Date(meta.getAttribute('content')) : null;
  const params = new URLSearchParams({ mime_type: 'image/svg+xml', per_page: '100', _fields: 'source_url' });
  if (published && !Number.isNaN(published.getTime())) {
    params.set('after', new Date(published.getTime() - 120 * 864e5).toISOString().slice(0, 19));
    params.set('before', new Date(published.getTime() + 30 * 864e5).toISOString().slice(0, 19));
  }
  let media = [];
  try {
    const res = await fetch(`/wp-json/wp/v2/media?${params}`);
    if (res.ok) media = await res.json();
  } catch (e) {
    console.warn(`Icons: media lookup failed: ${e.message}`);
  }
  const parser = new DOMParser();
  for (const m of media) {
    if (!wanted.size) break;
    try {
      const res = await fetch(m.source_url);
      if (!res.ok) continue;
      const doc = parser.parseFromString(await res.text(), 'image/svg+xml');
      const sig = svgSignature(doc);
      const targets = wanted.get(sig);
      if (!targets) continue;
      targets.forEach((svg) => {
        const img = document.createElement('img');
        img.src = m.source_url;
        img.alt = '';
        svg.replaceWith(img);
      });
      wanted.delete(sig);
    } catch (e) { /* skip candidate */ }
  }
  if (wanted.size) console.warn(`Icons: ${wanted.size} inline carousel icon(s) without an uploaded match`);
}

/**
 * Body headings on these posts are coloured per post in the source (Elementor heading
 * widgets). Bright red (#cc092f) is the default styling; dark red (#900f15) posts get
 * `theme: burgundy` (-> body.burgundy). Read before cleanup, while styles still apply.
 */
function headingTheme(document) {
  const heading = document.querySelector('.elementor-widget-theme-post-content .elementor-widget-heading h2');
  if (!heading || !document.defaultView) return null;
  const color = document.defaultView.getComputedStyle(heading).color.replace(/\s/g, '');
  return color === 'rgb(144,15,21)' ? 'burgundy' : null;
}

export default {
  /** Runs on the live page (awaited) before the DOM is copied. */
  onLoad: async ({ document }) => {
    await resolveInlineIcons(document);
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    const source = new URL(params.originalURL);
    const basePath = source.pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const theme = headingTheme(document);

    // 1. beforeTransform (cleanup + body tweaks + section breaks)
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

    // 4. afterTransform (final cleanup + section metadata + links, links last)
    executeTransformers('afterTransform', main, payload);
    main.querySelectorAll(`[${BLOCK_ATTR}]`).forEach((el) => el.removeAttribute(BLOCK_ATTR));

    // 5. Metadata. Lowercase "template" key -> body.article.article-rich: the regular
    // article styles (column, banner, body type) apply; article-rich rules add the rest.
    main.appendChild(document.createElement('hr'));
    const meta = WebImporter.Blocks.getMetadata(document) || {};
    meta.template = `article, ${PAGE_TEMPLATE.name}`;
    if (theme) meta.theme = theme;
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: URL path without trailing slash (/en/the-power-of-compounding)
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
