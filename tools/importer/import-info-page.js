/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the "info-page" template (9 Elementor informational/legal pages:
 * about-us, institutional, help, bank-holidays, bradesco-lounge, security,
 * privacy-and-cookies, other-disclosures, cra-public-file).
 * Blocks/sections come from tools/importer/page-templates.json (template "info-page").
 * Per-instance block options (variant classes) live in INSTANCE_OPTIONS (keyed by block
 * name, then instance selector) and are passed to parsers as `options`.
 * Every mapped block element is marked with data-excat-block="<name>" before parsing, so a
 * parser that consumes following sibling containers (table-article "notice" rows) knows where
 * the next block instance starts.
 *
 * Fragment mode: a URL with ?fragment=<slug> (e.g. /en/privacy-and-cookies/?fragment=others)
 * imports only the nested-tabs panel whose tab title slugifies to <slug>, saved as
 * <page-path>/fragments/<slug>. The privacy tabs block links its panels to those documents.
 */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import heroVideoParser from './parsers/hero-video.js';
import heroPromoParser from './parsers/hero-promo.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import accordionParser from './parsers/accordion.js';
import tabsParser from './parsers/tabs.js';
import tableArticleParser from './parsers/table-article.js';

// TRANSFORMER IMPORTS (order matters: cleanup -> info-page cleanup -> landing cleanup -> sections)
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import linksTransformer from './transformers/bradesco-links.js';
import infoPageTransformer from './transformers/bradesco-info-page.js';
import landingTransformer from './transformers/bradesco-landing.js';
import sectionsTransformer from './transformers/bradesco-landing-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'hero-video': heroVideoParser,
  'hero-promo': heroPromoParser,
  'columns-media': columnsMediaParser,
  'cards-feature': cardsFeatureParser,
  'accordion': accordionParser,
  'tabs': tabsParser,
  'table-article': tableArticleParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "info-page",
  "description": "Informational/legal text page (title banner + rich text, documents, accordions)",
  "urls": [
    "https://bradescobank.com/en/about-us/",
    "https://bradescobank.com/en/institutional/",
    "https://bradescobank.com/en/help/",
    "https://bradescobank.com/en/bank-holidays/",
    "https://bradescobank.com/en/bradesco-lounge/",
    "https://bradescobank.com/en/security/",
    "https://bradescobank.com/en/privacy-and-cookies/",
    "https://bradescobank.com/en/other-disclosures/",
    "https://bradescobank.com/en/cra-public-file/"
  ],
  "blocks": [
    {
      "name": "hero-banner",
      "instances": [
        ".elementor-1178 .elementor-element-8ea493e",
        ".elementor-2212 .elementor-element-eb18198",
        ".elementor-1481 .elementor-element-93efab2",
        ".elementor-1401 .elementor-element-1c4cdd8",
        ".elementor-2391 .elementor-element-2ac1894",
        ".elementor-2498 .elementor-element-cc804cd",
        ".elementor-467 .elementor-element-2530a90",
        ".elementor-631 .elementor-element-2d43f3e"
      ]
    },
    {
      "name": "hero-video",
      "instances": [
        ".elementor-6834 .elementor-element-cb27143"
      ]
    },
    {
      "name": "hero-promo",
      "instances": [
        ".elementor-6834 .elementor-element-0796a69"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        ".elementor-6834 .elementor-element-cbfa80c",
        ".elementor-1178 .elementor-element-5358476",
        ".elementor-1481 .elementor-element-81ae845"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".elementor-1178 .elementor-element-a2edf52",
        ".elementor-1178 .elementor-element-ba0258e",
        ".elementor-2212 .elementor-element-14cf9d6",
        ".elementor-6834 .elementor-element-5776fec",
        ".elementor-6834 .elementor-element-1980f3f",
        ".elementor-1481 .elementor-element-6aca6cb",
        ".elementor-2391 .elementor-element-bd525e6",
        ".elementor-467 .elementor-element-4fc6a9d",
        ".elementor-631 .elementor-element-220b4b9"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        ".elementor-1178 .elementor-element-349fe54"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        ".elementor-2498 .elementor-element-7041282"
      ]
    },
    {
      "name": "table-article",
      "instances": [
        ".elementor-1401 .elementor-element-c5bea59",
        ".elementor-2456 .elementor-element-697c7f0",
        ".elementor-2456 .elementor-element-765f5e0",
        ".elementor-2456 .elementor-element-fb5dcaf",
        ".elementor-2456 .elementor-element-e65f866",
        ".elementor-2514 .elementor-element-8ecd117",
        ".elementor-2514 .elementor-element-08b3406",
        ".elementor-2514 .elementor-element-ccbc17b",
        ".elementor-2514 .elementor-element-ecaad1f",
        ".elementor-2527 .elementor-element-a43783e"
      ]
    }
  ],
  "sections": [
    {
      "id": "about-us-1",
      "name": "about-us-1",
      "selector": [
        ".elementor-2212 .elementor-element-eb18198"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "about-us-2",
      "name": "about-us-2",
      "selector": [
        ".elementor-2212 .elementor-element-4d27485"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "about-us-3",
      "name": "about-us-3",
      "selector": [
        ".elementor-2212 .elementor-element-bb22c62"
      ],
      "style": "full-bleed",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "about-us-4",
      "name": "about-us-4",
      "selector": [
        ".elementor-2212 .elementor-element-adbc8f3"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "institutional-1",
      "name": "institutional-1",
      "selector": [
        ".elementor-6834 .elementor-element-cb27143"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "institutional-2",
      "name": "institutional-2",
      "selector": [
        ".elementor-6834 .elementor-element-a5e28e3"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "institutional-3",
      "name": "institutional-3",
      "selector": [
        ".elementor-6834 .elementor-element-a4630b6"
      ],
      "style": "grey",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "institutional-4",
      "name": "institutional-4",
      "selector": [
        ".elementor-6834 .elementor-element-a6c4a49"
      ],
      "style": "split",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "institutional-5",
      "name": "institutional-5",
      "selector": [
        ".elementor-6834 .elementor-element-0796a69"
      ],
      "style": null,
      "blocks": [
        "hero-promo",
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "help-1",
      "name": "help-1",
      "selector": [
        ".elementor-1481 .elementor-element-93efab2"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "help-2",
      "name": "help-2",
      "selector": [
        ".elementor-1481 .elementor-element-3012ebd"
      ],
      "style": null,
      "blocks": [
        "columns-media",
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "help-3",
      "name": "help-3",
      "selector": [
        ".elementor-1481 .elementor-element-58cd61f"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "bank-holidays-1",
      "name": "bank-holidays-1",
      "selector": [
        ".elementor-1401 .elementor-element-1c4cdd8"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "bank-holidays-2",
      "name": "bank-holidays-2",
      "selector": [
        ".elementor-1401 .elementor-element-ba583de"
      ],
      "style": "grey",
      "blocks": [
        "table-article"
      ],
      "defaultContent": []
    },
    {
      "id": "bradesco-lounge-1",
      "name": "bradesco-lounge-1",
      "selector": [
        ".elementor-2391 .elementor-element-2ac1894"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "bradesco-lounge-2",
      "name": "bradesco-lounge-2",
      "selector": [
        ".elementor-2391 .elementor-element-bd525e6"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "security-1",
      "name": "security-1",
      "selector": [
        ".elementor-1178 .elementor-element-8ea493e"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "security-2",
      "name": "security-2",
      "selector": [
        ".elementor-1178 .elementor-element-985c385"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "security-3",
      "name": "security-3",
      "selector": [
        ".elementor-1178 .elementor-element-14b83e7"
      ],
      "style": "grey",
      "blocks": [
        "accordion"
      ],
      "defaultContent": []
    },
    {
      "id": "security-4",
      "name": "security-4",
      "selector": [
        ".elementor-1178 .elementor-element-60799a5"
      ],
      "style": null,
      "blocks": [
        "columns-media",
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "privacy-and-cookies-1",
      "name": "privacy-and-cookies-1",
      "selector": [
        ".elementor-2498 .elementor-element-cc804cd"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "privacy-and-cookies-2",
      "name": "privacy-and-cookies-2",
      "selector": [
        ".elementor-2498 .elementor-element-e7024a1"
      ],
      "style": null,
      "blocks": [
        "tabs"
      ],
      "defaultContent": []
    },
    {
      "id": "privacy-and-cookies-F1.1",
      "name": "consumer-privacy-notice-fragment-privacy-and-cookies-F1.1",
      "selector": [
        ".elementor-2456 .elementor-element-59e75f6"
      ],
      "style": null,
      "blocks": [
        "table-article"
      ],
      "defaultContent": []
    },
    {
      "id": "privacy-and-cookies-F1.2",
      "name": "consumer-privacy-notice-fragment-privacy-and-cookies-F1.2",
      "selector": [
        ".elementor-2456 .elementor-element-618c759"
      ],
      "style": "grey",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "privacy-and-cookies-F2.1",
      "name": "bradesco-investments-privacy-notice-fragment-privacy-and-cookies-F2.1",
      "selector": [
        ".elementor-2514 .elementor-element-a5e7d51"
      ],
      "style": null,
      "blocks": [
        "table-article"
      ],
      "defaultContent": []
    },
    {
      "id": "privacy-and-cookies-F2.2",
      "name": "bradesco-investments-privacy-notice-fragment-privacy-and-cookies-F2.2",
      "selector": [
        ".elementor-2514 .elementor-element-677b880"
      ],
      "style": "grey",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "other-disclosures-1",
      "name": "other-disclosures-1",
      "selector": [
        ".elementor-467 .elementor-element-2530a90"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "other-disclosures-2",
      "name": "other-disclosures-2",
      "selector": [
        ".elementor-467 .elementor-element-0e286b0"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "other-disclosures-3",
      "name": "other-disclosures-3",
      "selector": [
        ".elementor-467 .elementor-element-d721a61"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "cra-public-file-1",
      "name": "cra-public-file-1",
      "selector": [
        ".elementor-631 .elementor-element-2d43f3e"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "cra-public-file-2",
      "name": "cra-public-file-2",
      "selector": [
        ".elementor-631 .elementor-element-518a5cc"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    }
  ]
};

// PER-INSTANCE BLOCK OPTIONS (variant classes): block name -> instance selector -> options
const INSTANCE_OPTIONS = {
  "hero-promo": {
    ".elementor-6834 .elementor-element-0796a69": [
      "end"
    ]
  },
  "columns-media": {
    ".elementor-6834 .elementor-element-cbfa80c": [
      "reverse"
    ],
    ".elementor-1481 .elementor-element-81ae845": [
      "contacts"
    ]
  },
  "cards-feature": {
    ".elementor-1178 .elementor-element-a2edf52": [
      "elevated",
      "bar"
    ],
    ".elementor-1178 .elementor-element-ba0258e": [
      "icon-left",
      "bar"
    ],
    ".elementor-2212 .elementor-element-14cf9d6": [
      "boxed",
      "elevated",
      "gradient"
    ],
    ".elementor-6834 .elementor-element-5776fec": [
      "boxed",
      "elevated"
    ],
    ".elementor-6834 .elementor-element-1980f3f": [
      "elevated",
      "overlap",
      "edge"
    ],
    ".elementor-1481 .elementor-element-6aca6cb": [
      "bar"
    ],
    ".elementor-2391 .elementor-element-bd525e6": [
      "bar",
      "rows"
    ],
    ".elementor-467 .elementor-element-4fc6a9d": [
      "documents"
    ],
    ".elementor-631 .elementor-element-220b4b9": [
      "documents",
      "elevated"
    ]
  },
  "accordion": {
    ".elementor-1178 .elementor-element-349fe54": [
      "icons"
    ]
  },
  "tabs": {
    ".elementor-2498 .elementor-element-7041282": [
      "vertical",
      "fragments"
    ]
  },
  "table-article": {
    ".elementor-1401 .elementor-element-c5bea59": [
      "calendar"
    ],
    ".elementor-2456 .elementor-element-697c7f0": [
      "notice"
    ],
    ".elementor-2456 .elementor-element-765f5e0": [
      "notice"
    ],
    ".elementor-2456 .elementor-element-fb5dcaf": [
      "notice"
    ],
    ".elementor-2456 .elementor-element-e65f866": [
      "notice"
    ],
    ".elementor-2514 .elementor-element-8ecd117": [
      "notice"
    ],
    ".elementor-2514 .elementor-element-08b3406": [
      "notice"
    ],
    ".elementor-2514 .elementor-element-ccbc17b": [
      "notice"
    ],
    ".elementor-2514 .elementor-element-ecaad1f": [
      "notice"
    ],
    ".elementor-2527 .elementor-element-a43783e": [
      "notice"
    ]
  }
};

const BLOCK_ATTR = 'data-excat-block';

const transformers = [
  cleanupTransformer, infoPageTransformer, landingTransformer, sectionsTransformer, linksTransformer,
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

function slugify(text) {
  return (text || '').replace(/['\u2019]/g, '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fragment mode: keep only the nested-tabs panel whose title matches `slug`, wrapped in a
 * div carrying the page root classes so page-scoped selectors still match.
 * @returns {boolean} true when the panel was found
 */
function isolateTabPanel(document, slug) {
  const widgets = [...document.querySelectorAll('.elementor-widget-n-tabs')];
  for (const widget of widgets) {
    const titles = [...widget.querySelectorAll('.e-n-tab-title')];
    const content = widget.querySelector('.e-n-tabs-content');
    if (content) {
      const panels = [...content.children];
      const idx = titles.findIndex((t) => slugify(t.textContent) === slug);
      if (idx >= 0 && panels[idx]) {
        const root = widget.closest('[data-elementor-type="wp-page"], .elementor[data-elementor-id]');
        const wrapper = document.createElement('div');
        wrapper.className = root ? root.className : 'elementor';
        wrapper.append(panels[idx]);
        document.body.replaceChildren(wrapper);
        return true;
      }
    }
  }
  return false;
}

export default {
  /**
   * html2md hook (fragment mode only): runs on the live page right before the importer copies
   * computed CSS background images into inline styles. Elementor lazy-loads container
   * backgrounds (`.e-con.e-parent:not(.e-lazyloaded)` and its descendants get
   * `background-image: none`), and the panels of the hidden tabs are never scrolled into view.
   * The per-template stylesheets Elementor prints in <body> are re-created before transform()
   * runs, so this capture is the only source for the fragment panels' background images.
   */
  preprocess: ({ document, url }) => {
    let fragment = null;
    try { fragment = new URL(url).searchParams.get('fragment'); } catch (e) { /* ignore */ }
    if (!fragment) return;
    document.querySelectorAll('.e-con.e-parent:not(.e-lazyloaded)')
      .forEach((n) => n.classList.add('e-lazyloaded'));
  },

  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    const source = new URL(params.originalURL);
    const fragment = source.searchParams.get('fragment');
    const basePath = source.pathname.replace(/\/$/, '').replace(/\.html?$/, '');

    let fragmentMode = false;
    if (fragment) {
      fragmentMode = isolateTabPanel(document, slugify(fragment));
      if (!fragmentMode) console.warn(`Fragment "${fragment}" not found on page`);
    }

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

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);
    main.querySelectorAll(`[${BLOCK_ATTR}]`).forEach((el) => el.removeAttribute(BLOCK_ATTR));

    // 5. Metadata (pages only, not fragments) + built-in rules.
    // Lowercase "template" key: the preview server is case-sensitive about metadata keys.
    if (!fragmentMode) {
      main.appendChild(document.createElement('hr'));
      const meta = WebImporter.Blocks.getMetadata(document) || {};
      meta.template = PAGE_TEMPLATE.name;
      main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path: URL path without trailing slash; fragments under <path>/fragments/<slug>
    const rawPath = fragmentMode ? `${basePath}/fragments/${slugify(fragment)}` : basePath;
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        fragment: fragmentMode ? slugify(fragment) : '',
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
