/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the "faq-hub" template (FAQ hubs rendered by the WordPress FAQ shortcode):
 *   /en/personal-bank/faq/              (Accounts / Online Banking / Credit Card / Debit Card)
 *   /en/personal-bank/investments/faq/  (Account Opening / My Investment Account /
 *                                        Payments and Transfers / Trades and Orders)
 * Blocks/sections come from tools/importer/page-templates.json (template "faq-hub").
 *
 * Output per page:
 *   hero-banner  (background photo + H1 "FAQ")
 *   ---
 *   tabs (faq)   one row per category: [category icon + label | Q&As], the Q&As authored as
 *                h3 question + answer content; the block renders them as an accordion (faq).
 *
 * Only the default category's questions are in the page HTML; the shortcode loads the other
 * categories with POST /wp-admin/admin-ajax.php (action=get_term_posts, term_id=<id>).
 * onLoad() fetches EVERY category (default included) on the live page and injects each response
 * as <div class="faq-term-panel" data-term-id="<id>"> inside .faq__content, so the tabs parser
 * sees all questions of all tabs.
 */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import tabsParser from './parsers/tabs.js';

// TRANSFORMER IMPORTS (order: cleanup -> faq-hub cleanup -> landing cleanup -> sections -> links)
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import faqHubTransformer from './transformers/bradesco-faq-hub.js';
import landingTransformer from './transformers/bradesco-landing.js';
import sectionsTransformer from './transformers/bradesco-landing-sections.js';
import linksTransformer from './transformers/bradesco-links.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'tabs': tabsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "faq-hub",
  "description": "FAQ hub with category tabs and Q&A accordion",
  "urls": [
    "https://bradescobank.com/en/personal-bank/faq/",
    "https://bradescobank.com/en/personal-bank/investments/faq/"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        ".elementor-12036 .elementor-element-937bd0f",
        ".elementor-17691 .elementor-element-a5dc729"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        ".elementor-12036 .elementor-element-8e9edbe .faq",
        ".elementor-17691 .elementor-element-4fa91f0 .faq",
        ".elementor-widget-shortcode .faq"
      ]
    }
  ],
  "sections": [
    {
      "id": "faq-hero",
      "name": "faq-hero",
      "selector": [
        ".elementor-12036 .elementor-element-937bd0f",
        ".elementor-17691 .elementor-element-a5dc729"
      ],
      "style": null,
      "blocks": ["hero-banner"],
      "defaultContent": []
    },
    {
      "id": "faq-gradient-line",
      "name": "faq-gradient-line (empty, dropped)",
      "selector": [
        ".elementor-12036 .elementor-element-a3b4bbf",
        ".elementor-17691 .elementor-element-e54f8fd"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "faq-categories",
      "name": "faq-categories",
      "selector": [
        ".elementor-12036 .elementor-element-8e9edbe",
        ".elementor-17691 .elementor-element-4fa91f0"
      ],
      "style": null,
      "blocks": ["tabs"],
      "defaultContent": []
    }
  ]
};

// PER-INSTANCE BLOCK OPTIONS (variant classes): block name -> instance selector -> options
const INSTANCE_OPTIONS = {
  "tabs": {
    ".elementor-12036 .elementor-element-8e9edbe .faq": ["faq"],
    ".elementor-17691 .elementor-element-4fa91f0 .faq": ["faq"],
    ".elementor-widget-shortcode .faq": ["faq"]
  }
};

const BLOCK_ATTR = 'data-excat-block';
const AJAX_URL = '/wp-admin/admin-ajax.php';

const transformers = [
  cleanupTransformer, faqHubTransformer, landingTransformer, sectionsTransformer, linksTransformer,
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

/**
 * Live page: fetch the questions of every FAQ category (the shortcode only renders the
 * default one) and inject them as .faq-term-panel[data-term-id] next to #faq_container.
 * A category whose request fails keeps whatever the page already rendered for it
 * (the default category's #faq_container content).
 */
async function loadAllFaqCategories(document) {
  const roots = [...document.querySelectorAll('.faq')].filter((r) => r.querySelector('.term-link[data-term-id]'));
  for (const root of roots) {
    const content = root.querySelector('.faq__content') || root;
    const links = [...root.querySelectorAll('.term-link[data-term-id]')];
    const seen = new Set();
    for (const link of links) {
      const termId = link.getAttribute('data-term-id');
      if (!termId || seen.has(termId)) continue;
      seen.add(termId);
      if (content.querySelector(`.faq-term-panel[data-term-id="${termId}"]`)) continue;
      try {
        const body = new URLSearchParams({ action: 'get_term_posts', term_id: termId });
        const res = await fetch(AJAX_URL, { method: 'POST', body, credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const panel = document.createElement('div');
        panel.className = 'faq-term-panel';
        panel.setAttribute('data-term-id', termId);
        panel.innerHTML = html;
        const count = panel.querySelectorAll('.question-item').length;
        if (!count) throw new Error('no questions in response');
        content.append(panel);
        console.log(`FAQ category ${termId}: ${count} questions`);
      } catch (e) {
        console.warn(`FAQ category ${termId} could not be loaded: ${e.message}`);
      }
    }
  }
}

export default {
  /** Runs on the live page (awaited) before html2md copies the document. */
  onLoad: async ({ document }) => {
    await loadAllFaqCategories(document);
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

    // 6. Path: URL path without trailing slash (/en/personal-bank/faq)
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
