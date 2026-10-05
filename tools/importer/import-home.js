/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import cardsAudienceParser from './parsers/cards-audience.js';
import heroStatementParser from './parsers/hero-statement.js';
import cardsProductParser from './parsers/cards-product.js';
import heroPromoParser from './parsers/hero-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import sectionsTransformer from './transformers/bradesco-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'cards-audience': cardsAudienceParser,
  'hero-statement': heroStatementParser,
  'cards-product': cardsProductParser,
  'hero-promo': heroPromoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Homepage: video hero, audience tiles, statement video banner, product tile grid, promo banner',
  urls: [
    'https://bradescobank.com/',
  ],
  blocks: [
    { name: 'hero-video', instances: ['.elementor-element-b079a4a'] },
    { name: 'cards-audience', instances: ['section.services.elementor-element-6ff733d', 'section.services'] },
    { name: 'hero-statement', instances: ['.elementor-element-e5bf88e'] },
    { name: 'cards-product', instances: ['.elementor-element-c28d200'] },
    { name: 'hero-promo', instances: ['.elementor-element-f4e421d'] },
  ],
  sections: [
    { id: '1', name: 'hero', selector: ['.elementor-element-b079a4a'], style: null, blocks: ['hero-video'], defaultContent: [] },
    { id: '2', name: 'audience-offerings', selector: ['.elementor-element-c766b99'], style: null, blocks: ['cards-audience'], defaultContent: ['.elementor-element-c766b99 h2'] },
    { id: '3', name: 'statement', selector: ['.elementor-element-e5bf88e'], style: null, blocks: ['hero-statement'], defaultContent: [] },
    { id: '4', name: 'products', selector: ['.elementor-element-0faff3c'], style: null, blocks: ['cards-product'], defaultContent: ['.elementor-element-0faff3c h2', '.elementor-element-77e13de p'] },
    { id: '5', name: 'market-insights', selector: ['.elementor-element-3326291'], style: null, blocks: ['hero-promo'], defaultContent: ['.elementor-element-3326291 h2'] },
  ],
};

// TRANSFORMER REGISTRY (sections runs after cleanup)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
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
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        // the same element can match several instance selectors
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform (cleanup + section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse blocks
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path (root URL maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

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
