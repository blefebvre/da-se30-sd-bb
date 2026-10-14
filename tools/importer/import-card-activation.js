/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the "card-activation" template (3 Elementor credit card activation pages:
 * visa-gold-activation, visa-infinite-activation, visa-signature-activation; roots
 * .elementor-21581 / -20373 / -21555 share every element id).
 * Blocks/sections come from tools/importer/page-templates.json (template "card-activation").
 * Per-instance block options (variant classes) live in INSTANCE_OPTIONS (keyed by block
 * name, then instance selector) and are passed to parsers as `options`.
 * Page metadata template "landing, card-activation": the pages inherit the landing template
 * styles (section intros, boxed width); card-activation specifics are scoped to
 * body.card-activation.
 */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import columnsMediaParser from './parsers/columns-media.js';

// TRANSFORMER IMPORTS (order matters: cleanup -> card-activation -> landing cleanup -> sections -> links)
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import cardActivationTransformer from './transformers/bradesco-card-activation.js';
import landingTransformer from './transformers/bradesco-landing.js';
import sectionsTransformer from './transformers/bradesco-landing-sections.js';
import linksTransformer from './transformers/bradesco-links.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-feature': cardsFeatureParser,
  'columns-media': columnsMediaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "card-activation",
  "description": "Credit card activation instructions page",
  "urls": [
    "https://bradescobank.com/en/visa-gold-activation/",
    "https://bradescobank.com/en/visa-infinite-activation/",
    "https://bradescobank.com/en/visa-signature-activation/"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        ".elementor-21581 .elementor-element-2ee2b11",
        ".elementor-20373 .elementor-element-2ee2b11",
        ".elementor-21555 .elementor-element-2ee2b11"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".elementor-21581 .elementor-element-9b0cd4c",
        ".elementor-20373 .elementor-element-9b0cd4c",
        ".elementor-21555 .elementor-element-9b0cd4c"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        ".elementor-21581 .elementor-element-8685a5c",
        ".elementor-20373 .elementor-element-8685a5c",
        ".elementor-21555 .elementor-element-8685a5c"
      ]
    }
  ],
  "sections": [
    {
      "id": "card-activation-1",
      "name": "hero",
      "selector": [
        ".elementor-21581 .elementor-element-2ee2b11",
        ".elementor-20373 .elementor-element-2ee2b11",
        ".elementor-21555 .elementor-element-2ee2b11"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "card-activation-2",
      "name": "activation-steps",
      "selector": [
        ".elementor-21581 .elementor-element-9feccb9",
        ".elementor-20373 .elementor-element-9feccb9",
        ".elementor-21555 .elementor-element-9feccb9"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": [
        ".elementor-21581 .elementor-element-55cb8fe h2",
        ".elementor-20373 .elementor-element-55cb8fe h2",
        ".elementor-21555 .elementor-element-55cb8fe h2"
      ]
    },
    {
      "id": "card-activation-3",
      "name": "card-agreements",
      "selector": [
        ".elementor-21581 .elementor-element-8685a5c",
        ".elementor-20373 .elementor-element-8685a5c",
        ".elementor-21555 .elementor-element-8685a5c"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    }
  ]
};

// PER-INSTANCE BLOCK OPTIONS (variant classes): block name -> instance selector -> options
const INSTANCE_OPTIONS = {
  "hero-banner": {
    ".elementor-21581 .elementor-element-2ee2b11": [
      "right"
    ],
    ".elementor-20373 .elementor-element-2ee2b11": [
      "right"
    ],
    ".elementor-21555 .elementor-element-2ee2b11": [
      "right"
    ]
  },
  "cards-feature": {
    ".elementor-21581 .elementor-element-9b0cd4c": [
      "screens"
    ],
    ".elementor-20373 .elementor-element-9b0cd4c": [
      "screens"
    ],
    ".elementor-21555 .elementor-element-9b0cd4c": [
      "screens"
    ]
  }
};

// page metadata "template" value (body classes landing + card-activation)
const TEMPLATE_METADATA = 'landing, card-activation';

const BLOCK_ATTR = 'data-excat-block';

const transformers = [
  cleanupTransformer, cardActivationTransformer, landingTransformer, sectionsTransformer, linksTransformer,
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
  // parse inner blocks before the blocks that contain them
  pageBlocks.sort((a, b) => {
    if (a.element.contains(b.element)) return 1;
    if (b.element.contains(a.element)) return -1;
    return 0;
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    const source = new URL(params.originalURL);
    const basePath = source.pathname.replace(/\/$/, '').replace(/\.html?$/, '');

    // 1. beforeTransform (cleanup, step tiles merged, section breaks)
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

    // 5. Metadata + built-in rules.
    // Lowercase "template" key: the preview server is case-sensitive about metadata keys.
    main.appendChild(document.createElement('hr'));
    const meta = WebImporter.Blocks.getMetadata(document) || {};
    meta.template = TEMPLATE_METADATA;
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: URL path without trailing slash (e.g. /en/visa-gold-activation)
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
