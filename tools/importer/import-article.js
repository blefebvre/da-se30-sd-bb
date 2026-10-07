/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroArticleParser from './parsers/hero-article.js';
import tableArticleParser from './parsers/table-article.js';
import embedVideoParser from './parsers/embed-video.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import linksTransformer from './transformers/bradesco-links.js';
import sectionsTransformer from './transformers/bradesco-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-article': heroArticleParser,
  'table-article': tableArticleParser,
  'embed-video': embedVideoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'article',
  description: 'Blog/insight article (single post, theme post content)',
  urls: [
    'https://bradescobank.com/en/financial-habits/',
    'https://bradescobank.com/en/gold-as-a-portfolio-diversifier/',
    'https://bradescobank.com/en/how-to-buy-assets/',
    'https://bradescobank.com/en/how-to-sell-assets/',
    'https://bradescobank.com/en/investments-at-bradesco-bank/',
    'https://bradescobank.com/en/mutual-funds/',
    'https://bradescobank.com/en/open-an-investment-account/',
    'https://bradescobank.com/en/portfolio-considerations-the-role-of-staying-invested/',
    'https://bradescobank.com/en/reits/',
    'https://bradescobank.com/en/thematic-etfs/',
    'https://bradescobank.com/en/u-s-stocks/',
    'https://bradescobank.com/en/what-are-asset-allocation-and-diversification/',
    'https://bradescobank.com/en/why-invest-abroad/',
  ],
  blocks: [
    { name: 'hero-article', instances: ['.elementor-location-single > .elementor-element-b710887'] },
    { name: 'table-article', instances: ['.elementor-widget-theme-post-content table'] },
    {
      name: 'embed-video',
      instances: [
        '.elementor-widget-theme-post-content iframe[src*="youtube.com"]',
        '.elementor-widget-theme-post-content iframe[src*="youtu.be"]',
        '.elementor-widget-theme-post-content iframe[src*="vimeo.com"]',
      ],
    },
  ],
  sections: [
    { id: '1', name: 'post-title-banner', selector: ['.elementor-location-single > .elementor-element-b710887'], style: null, blocks: ['hero-article'], defaultContent: [] },
    { id: '2', name: 'decorative-gradient-line', selector: ['.elementor-location-single > .elementor-element-df751d4'], style: null, blocks: [], defaultContent: [] },
    { id: '3', name: 'blog-sub-menu', selector: ['.elementor-location-single > .bb-blog-menu'], style: null, blocks: [], defaultContent: [] },
    {
      id: '4',
      name: 'article-body',
      selector: ['.elementor-location-single > .elementor-element-0fa6826'],
      style: null,
      blocks: ['table-article', 'embed-video'],
      defaultContent: [
        '.elementor-element-235adcb .elementor-shortcode',
        '.elementor-widget-theme-post-content h1',
        '.elementor-widget-theme-post-content h2',
        '.elementor-widget-theme-post-content h3',
        '.elementor-widget-theme-post-content h4',
        '.elementor-widget-theme-post-content h5',
        '.elementor-widget-theme-post-content h6',
        '.elementor-widget-theme-post-content p',
        '.elementor-widget-theme-post-content ul',
        '.elementor-widget-theme-post-content ol',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY (sections runs after cleanup)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
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

    // 5. Built-in rules. Metadata = default head metadata + Template (body class "article")
    const hr = document.createElement('hr');
    main.appendChild(hr);
    const meta = WebImporter.Blocks.getMetadata(document) || {};
    meta.template = PAGE_TEMPLATE.name;
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: URL path without trailing slash (root maps to /index)
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
