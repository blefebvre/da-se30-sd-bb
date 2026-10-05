/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the "landing" template (12 Elementor product/segment landing pages).
 * Blocks/sections come from tools/importer/page-templates.json (template "landing").
 * Per-instance block options (variant classes) live in INSTANCE_OPTIONS (keyed by block
 * name, then instance selector) and are passed to parsers as `options`.
 *
 * Fragment mode: a URL with ?fragment=<slug> (e.g. /en/careers/?fragment=jobs) imports only
 * the nested-tabs panel whose tab title slugifies to <slug>, saved as
 * <page-path>/fragments/<slug>. The careers tabs block links its panels to those documents.
 */

// PARSER IMPORTS
import heroVideoParser from './parsers/hero-video.js';
import cardsAudienceParser from './parsers/cards-audience.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsProductParser from './parsers/cards-product.js';
import heroPromoParser from './parsers/hero-promo.js';
import columnsMediaParser from './parsers/columns-media.js';
import tabsParser from './parsers/tabs.js';
import tableArticleParser from './parsers/table-article.js';
import accordionParser from './parsers/accordion.js';
import heroBannerParser from './parsers/hero-banner.js';

// TRANSFORMER IMPORTS (order matters: cleanup -> landing cleanup -> sections)
import cleanupTransformer from './transformers/bradesco-cleanup.js';
import landingTransformer from './transformers/bradesco-landing.js';
import landingSectionsTransformer from './transformers/bradesco-landing-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-video': heroVideoParser,
  'cards-audience': cardsAudienceParser,
  'cards-feature': cardsFeatureParser,
  'cards-product': cardsProductParser,
  'hero-promo': heroPromoParser,
  'columns-media': columnsMediaParser,
  'tabs': tabsParser,
  'table-article': tableArticleParser,
  'accordion': accordionParser,
  'hero-banner': heroBannerParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "landing",
  "description": "Product/segment landing page (banner hero, feature rows, cards, CTAs)",
  "urls": [
    "https://bradescobank.com/en/personal-bank/",
    "https://bradescobank.com/en/private-bank/",
    "https://bradescobank.com/en/corporate/",
    "https://bradescobank.com/en/real-estate/",
    "https://bradescobank.com/en/credit-cards/",
    "https://bradescobank.com/en/credit-card-signature-gold/",
    "https://bradescobank.com/en/certificate-of-deposit-bradesco/",
    "https://bradescobank.com/en/zelle/",
    "https://bradescobank.com/en/credit-card/visa-infinite/",
    "https://bradescobank.com/en/personal-bank/investments/",
    "https://bradescobank.com/en/investments-content/bradesco-investments-app/",
    "https://bradescobank.com/en/careers/"
  ],
  "blocks": [
    {
      "name": "hero-video",
      "instances": [
        ".elementor-2745 .elementor-element-112f6d8",
        ".elementor-2871 .elementor-element-5c6ea91",
        ".elementor-1799 .elementor-element-cb27143",
        ".elementor-1861 .elementor-element-c9f3a87",
        ".elementor-22451 .elementor-element-5d04821",
        ".elementor-22830 .elementor-element-ae7b4e1"
      ]
    },
    {
      "name": "cards-audience",
      "instances": [
        ".elementor-2745 .elementor-element-d6ecb0a",
        ".elementor-2871 .elementor-element-035d061",
        ".elementor-1799 .elementor-element-4b846a8"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".elementor-2745 .elementor-element-aa7e11f",
        ".elementor-2745 .elementor-element-3f6e18f",
        ".elementor-2745 .elementor-element-9d8b971",
        ".elementor-2871 .elementor-element-38ecf0e",
        ".elementor-1799 .elementor-element-73bb45e",
        ".elementor-1799 .elementor-element-c6606bc",
        ".elementor-1861 .elementor-element-b5cf05e",
        ".elementor-22451 .elementor-element-9c6aacd",
        ".elementor-22830 .elementor-element-2eeed79",
        ".elementor-3099 .elementor-element-062be19",
        ".elementor-3099 .elementor-element-b8dc142",
        ".elementor-13944 .elementor-element-14cf9d6",
        ".elementor-13944 .elementor-element-93ede8a",
        ".elementor-19290 .elementor-element-710cfdd",
        ".elementor-19290 .elementor-element-9ab5255",
        ".elementor-6840 .elementor-element-c158bfb",
        ".elementor-6840 .elementor-element-9d25ef1",
        ".elementor-12803 .elementor-element-5edeb97",
        ".elementor-12803 .elementor-element-6c234bd"
      ]
    },
    {
      "name": "cards-product",
      "instances": [
        ".elementor-2745 .elementor-element-00e6b5c",
        ".elementor-19290 .elementor-element-9cc3acd"
      ]
    },
    {
      "name": "hero-promo",
      "instances": [
        ".elementor-2745 .elementor-element-912870a",
        ".elementor-2745 .elementor-element-ca5306d",
        ".elementor-2871 .elementor-element-986ffe9",
        ".elementor-2871 .elementor-element-6378b6b",
        ".elementor-2871 .elementor-element-84b88d0",
        ".elementor-1799 .elementor-element-5330a3e",
        ".elementor-22451 .elementor-element-b24133b",
        ".elementor-22451 .elementor-element-c94aa6a",
        ".elementor-22451 .elementor-element-607c7dd",
        ".elementor-22830 .elementor-element-8f44234",
        ".elementor-22830 .elementor-element-b9ba7d7",
        ".elementor-13944 .elementor-element-3bb0ed2",
        ".elementor-19290 .elementor-element-9b2d1d7",
        ".elementor-19290 .elementor-element-635bb7b",
        ".elementor-19290 .elementor-element-6e85c13",
        ".elementor-6840 .elementor-element-26517c1",
        ".elementor-6840 .elementor-element-af9d94e",
        ".elementor-6840 .elementor-element-0ec23cb",
        ".elementor-12803 .elementor-element-130823e",
        ".elementor-6573 .elementor-element-782d0f83",
        ".elementor-6573 .elementor-element-5a456f9f"
      ]
    },
    {
      "name": "columns-media",
      "instances": [
        ".elementor-2871 .elementor-element-d4d42ec",
        ".elementor-2871 .elementor-element-74401a0",
        ".elementor-1861 .elementor-element-1fcc151",
        ".elementor-12803 .elementor-element-66369c7",
        ".elementor-6573 .elementor-element-4ce5f23e",
        ".elementor-6573 .elementor-element-3d3948f2"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        ".elementor-1861 .elementor-element-bccf07d",
        ".elementor-22830 .elementor-element-4b630b1",
        ".elementor-6573 .elementor-element-88d9683"
      ]
    },
    {
      "name": "table-article",
      "instances": [
        ".elementor-22830 .elementor-element-240ef93",
        ".elementor-19290 .elementor-element-2be8725 .tabela-beneficios"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        ".elementor-22830 .elementor-element-96c7314",
        ".elementor-13944 .elementor-element-f1f23bb",
        ".elementor-19290 .elementor-element-fd74825"
      ]
    },
    {
      "name": "hero-banner",
      "instances": [
        ".elementor-3099 .elementor-element-59c64c7",
        ".elementor-13944 .elementor-element-eb18198",
        ".elementor-19290 .elementor-element-0fedced",
        ".elementor-6840 .elementor-element-b7e6335",
        ".elementor-12803 .elementor-element-72971f4",
        ".elementor-6573 .elementor-element-eb18198"
      ]
    }
  ],
  "sections": [
    {
      "id": "personal-bank-1",
      "name": "personal-bank-1",
      "selector": [
        ".elementor-2745 .elementor-element-112f6d8"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-2",
      "name": "personal-bank-2",
      "selector": [
        ".elementor-2745 .elementor-element-d6ecb0a"
      ],
      "style": null,
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-3",
      "name": "personal-bank-3",
      "selector": [
        ".elementor-2745 .elementor-element-3406f07"
      ],
      "style": "grey, split",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-4",
      "name": "personal-bank-4",
      "selector": [
        ".elementor-2745 .elementor-element-00e6b5c"
      ],
      "style": null,
      "blocks": [
        "cards-product"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-5",
      "name": "personal-bank-5",
      "selector": [
        ".elementor-2745 .elementor-element-912870a"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-6",
      "name": "personal-bank-6",
      "selector": [
        ".elementor-2745 .elementor-element-ca5306d"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-7",
      "name": "personal-bank-7",
      "selector": [
        ".elementor-2745 .elementor-element-03be253"
      ],
      "style": "red, split",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-8",
      "name": "personal-bank-8",
      "selector": [
        ".elementor-2745 .elementor-element-6ead701"
      ],
      "style": "grey, split",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-9",
      "name": "personal-bank-9",
      "selector": [
        ".elementor-2745 .elementor-element-26b7e01"
      ],
      "style": "split",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "private-bank-1",
      "name": "private-bank-1",
      "selector": [
        ".elementor-2871 .elementor-element-5c6ea91"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "private-bank-2",
      "name": "private-bank-2",
      "selector": [
        ".elementor-2871 .elementor-element-dd8aea9"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "private-bank-3",
      "name": "private-bank-3",
      "selector": [
        ".elementor-2871 .elementor-element-986ffe9"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "private-bank-4",
      "name": "private-bank-4",
      "selector": [
        ".elementor-2871 .elementor-element-62e3401"
      ],
      "style": "dark, navy",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "private-bank-5",
      "name": "private-bank-5",
      "selector": [
        ".elementor-2871 .elementor-element-d4d42ec"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "private-bank-6",
      "name": "private-bank-6",
      "selector": [
        ".elementor-2871 .elementor-element-74401a0"
      ],
      "style": "grey",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "private-bank-7",
      "name": "private-bank-7",
      "selector": [
        ".elementor-2871 .elementor-element-e196ad0"
      ],
      "style": null,
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": []
    },
    {
      "id": "private-bank-8",
      "name": "private-bank-8",
      "selector": [
        ".elementor-2871 .elementor-element-8a3140e"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "private-bank-9",
      "name": "private-bank-9",
      "selector": [
        ".elementor-2871 .elementor-element-84b88d0"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "private-bank-10",
      "name": "private-bank-10",
      "selector": [
        ".elementor-2871 .elementor-element-505c3da"
      ],
      "style": "grey",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "private-bank-11",
      "name": "private-bank-11",
      "selector": [
        ".elementor-2871 .elementor-element-ce42cc2"
      ],
      "style": "dark, navy",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "corporate-1",
      "name": "corporate-1",
      "selector": [
        ".elementor-1799 .elementor-element-cb27143"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "corporate-2",
      "name": "corporate-2",
      "selector": [
        ".elementor-1799 .elementor-element-e21ddf3"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "corporate-3",
      "name": "corporate-3",
      "selector": [
        ".elementor-1799 .elementor-element-ceba38a"
      ],
      "style": "full-bleed",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "corporate-3b",
      "name": "corporate-3b",
      "selector": [
        ".elementor-1799 .elementor-element-1cd2ca1"
      ],
      "style": "red",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "corporate-4",
      "name": "corporate-4",
      "selector": [
        ".elementor-1799 .elementor-element-73bb45e"
      ],
      "style": "grey",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "corporate-5",
      "name": "corporate-5",
      "selector": [
        ".elementor-1799 .elementor-element-5330a3e"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "corporate-6",
      "name": "corporate-6",
      "selector": [
        ".elementor-1799 .elementor-element-c6606bc"
      ],
      "style": "grey",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "corporate-7",
      "name": "corporate-7",
      "selector": [
        ".elementor-1799 .elementor-element-4b846a8"
      ],
      "style": null,
      "blocks": [
        "cards-audience"
      ],
      "defaultContent": []
    },
    {
      "id": "real-estate-1",
      "name": "real-estate-1",
      "selector": [
        ".elementor-1861 .elementor-element-c9f3a87"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "real-estate-2",
      "name": "real-estate-2",
      "selector": [
        ".elementor-1861 .elementor-element-185cf88"
      ],
      "style": "grey",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "real-estate-3",
      "name": "real-estate-3",
      "selector": [
        ".elementor-1861 .elementor-element-1fcc151"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "real-estate-4",
      "name": "real-estate-4",
      "selector": [
        ".elementor-1861 .elementor-element-750c69f"
      ],
      "style": "grey",
      "blocks": [
        "tabs"
      ],
      "defaultContent": []
    },
    {
      "id": "real-estate-5",
      "name": "real-estate-5",
      "selector": [
        ".elementor-1861 .elementor-element-81add60"
      ],
      "style": "split",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "credit-cards-1",
      "name": "credit-cards-1",
      "selector": [
        ".elementor-22451 .elementor-element-5d04821"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-cards-2",
      "name": "credit-cards-2",
      "selector": [
        ".elementor-22451 .elementor-element-b24133b"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-cards-3",
      "name": "credit-cards-3",
      "selector": [
        ".elementor-22451 .elementor-element-a79f9f8"
      ],
      "style": "full-bleed",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "credit-cards-4",
      "name": "credit-cards-4",
      "selector": [
        ".elementor-22451 .elementor-element-9c6aacd"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-cards-5",
      "name": "credit-cards-5",
      "selector": [
        ".elementor-22451 .elementor-element-c94aa6a"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-cards-6",
      "name": "credit-cards-6",
      "selector": [
        ".elementor-22451 .elementor-element-607c7dd"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-cards-7",
      "name": "credit-cards-7",
      "selector": [
        ".elementor-22451 .elementor-element-65d7f31"
      ],
      "style": "notes",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-1",
      "name": "credit-card-signature-gold-1",
      "selector": [
        ".elementor-22830 .elementor-element-ae7b4e1"
      ],
      "style": null,
      "blocks": [
        "hero-video"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-2",
      "name": "credit-card-signature-gold-2",
      "selector": [
        ".elementor-22830 .elementor-element-8f44234"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-3",
      "name": "credit-card-signature-gold-3",
      "selector": [
        ".elementor-22830 .elementor-element-f5908ca"
      ],
      "style": null,
      "blocks": [
        "tabs"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-4",
      "name": "credit-card-signature-gold-4",
      "selector": [
        ".elementor-22830 .elementor-element-ed47c36"
      ],
      "style": "notes",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-5",
      "name": "credit-card-signature-gold-5",
      "selector": [
        ".elementor-22830 .elementor-element-f87d030"
      ],
      "style": "grey",
      "blocks": [
        "table-article"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-6",
      "name": "credit-card-signature-gold-6",
      "selector": [
        ".elementor-22830 .elementor-element-a00c704"
      ],
      "style": "notes",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-7",
      "name": "credit-card-signature-gold-7",
      "selector": [
        ".elementor-22830 .elementor-element-b9ba7d7"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-8",
      "name": "credit-card-signature-gold-8",
      "selector": [
        ".elementor-22830 .elementor-element-b312b1c"
      ],
      "style": null,
      "blocks": [
        "accordion"
      ],
      "defaultContent": []
    },
    {
      "id": "credit-card-signature-gold-9",
      "name": "credit-card-signature-gold-9",
      "selector": [
        ".elementor-22830 .elementor-element-f0c294f"
      ],
      "style": "grey",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "certificate-of-deposit-bradesco-1",
      "name": "certificate-of-deposit-bradesco-1",
      "selector": [
        ".elementor-3099 .elementor-element-59c64c7"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "certificate-of-deposit-bradesco-2",
      "name": "certificate-of-deposit-bradesco-2",
      "selector": [
        ".elementor-3099 .elementor-element-36e3fe9"
      ],
      "style": "grey, split",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "certificate-of-deposit-bradesco-3",
      "name": "certificate-of-deposit-bradesco-3",
      "selector": [
        ".elementor-3099 .elementor-element-1068bbf"
      ],
      "style": "red",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "certificate-of-deposit-bradesco-4",
      "name": "certificate-of-deposit-bradesco-4",
      "selector": [
        ".elementor-3099 .elementor-element-062be19"
      ],
      "style": "grey, split",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "certificate-of-deposit-bradesco-5",
      "name": "certificate-of-deposit-bradesco-5",
      "selector": [
        ".elementor-3099 .elementor-element-0babd61"
      ],
      "style": "grey",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "certificate-of-deposit-bradesco-6",
      "name": "certificate-of-deposit-bradesco-6",
      "selector": [
        ".elementor-3099 .elementor-element-b878909"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "zelle-1",
      "name": "zelle-1",
      "selector": [
        ".elementor-13944 .elementor-element-eb18198"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "zelle-2",
      "name": "zelle-2",
      "selector": [
        ".elementor-13944 .elementor-element-4d27485"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "zelle-3",
      "name": "zelle-3",
      "selector": [
        ".elementor-13944 .elementor-element-3bb0ed2"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "zelle-4",
      "name": "zelle-4",
      "selector": [
        ".elementor-13944 .elementor-element-22adc58"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "zelle-5",
      "name": "zelle-5",
      "selector": [
        ".elementor-13944 .elementor-element-c6ae99e"
      ],
      "style": "grey",
      "blocks": [
        "accordion"
      ],
      "defaultContent": []
    },
    {
      "id": "zelle-6",
      "name": "zelle-6",
      "selector": [
        ".elementor-13944 .elementor-element-19ecbe4"
      ],
      "style": "notes",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-1",
      "name": "visa-infinite-1",
      "selector": [
        ".elementor-19290 .elementor-element-0fedced"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-2",
      "name": "visa-infinite-2",
      "selector": [
        ".elementor-19290 .elementor-element-9b2d1d7"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-3",
      "name": "visa-infinite-3",
      "selector": [
        ".elementor-19290 .elementor-element-df407d2"
      ],
      "style": "grey",
      "blocks": [
        "cards-product"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-4",
      "name": "visa-infinite-4",
      "selector": [
        ".elementor-19290 .elementor-element-e0cf2e4"
      ],
      "style": "dark, split",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-5",
      "name": "visa-infinite-5",
      "selector": [
        ".elementor-19290 .elementor-element-225b2a0"
      ],
      "style": "grey",
      "blocks": [
        "accordion"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-6",
      "name": "visa-infinite-6",
      "selector": [
        ".elementor-19290 .elementor-element-edbae3f"
      ],
      "style": "dark",
      "blocks": [
        "table-article"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-7",
      "name": "visa-infinite-7",
      "selector": [
        ".elementor-19290 .elementor-element-635bb7b"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-8",
      "name": "visa-infinite-8",
      "selector": [
        ".elementor-19290 .elementor-element-eaaebca"
      ],
      "style": "grey",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-9",
      "name": "visa-infinite-9",
      "selector": [
        ".elementor-19290 .elementor-element-6e85c13"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "visa-infinite-10",
      "name": "visa-infinite-10",
      "selector": [
        ".elementor-19290 .elementor-element-0d349da"
      ],
      "style": "notes",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "personal-bank-investments-1",
      "name": "personal-bank-investments-1",
      "selector": [
        ".elementor-6840 .elementor-element-b7e6335"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-investments-2",
      "name": "personal-bank-investments-2",
      "selector": [
        ".elementor-6840 .elementor-element-245c4ba"
      ],
      "style": "split",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-investments-3",
      "name": "personal-bank-investments-3",
      "selector": [
        ".elementor-6840 .elementor-element-26517c1"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-investments-4",
      "name": "personal-bank-investments-4",
      "selector": [
        ".elementor-6840 .elementor-element-af9d94e"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-investments-5",
      "name": "personal-bank-investments-5",
      "selector": [
        ".elementor-6840 .elementor-element-16b4893"
      ],
      "style": "grey, split",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "personal-bank-investments-6",
      "name": "personal-bank-investments-6",
      "selector": [
        ".elementor-6840 .elementor-element-0ec23cb"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "bradesco-investments-app-1",
      "name": "bradesco-investments-app-1",
      "selector": [
        ".elementor-12803 .elementor-element-72971f4"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "bradesco-investments-app-2",
      "name": "bradesco-investments-app-2",
      "selector": [
        ".elementor-12803 .elementor-element-64988fd"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "bradesco-investments-app-3",
      "name": "bradesco-investments-app-3",
      "selector": [
        ".elementor-12803 .elementor-element-cb9b4cd"
      ],
      "style": "grey",
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "bradesco-investments-app-4",
      "name": "bradesco-investments-app-4",
      "selector": [
        ".elementor-12803 .elementor-element-130823e"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "bradesco-investments-app-5",
      "name": "bradesco-investments-app-5",
      "selector": [
        ".elementor-12803 .elementor-element-5edeb97"
      ],
      "style": null,
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "bradesco-investments-app-6",
      "name": "bradesco-investments-app-6",
      "selector": [
        ".elementor-12803 .elementor-element-6dd48ff"
      ],
      "style": "grey",
      "blocks": [
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "careers-1",
      "name": "careers-1",
      "selector": [
        ".elementor-6573 .elementor-element-eb18198"
      ],
      "style": null,
      "blocks": [
        "hero-banner"
      ],
      "defaultContent": []
    },
    {
      "id": "careers-2",
      "name": "careers-2",
      "selector": [
        ".elementor-6573 .elementor-element-398179c"
      ],
      "style": null,
      "blocks": [
        "tabs"
      ],
      "defaultContent": []
    },
    {
      "id": "careers-F1.1",
      "name": "jobs-fragment-careers-F1.1",
      "selector": [
        ".elementor-6573 .elementor-element-1e7711b"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "careers-F1.2",
      "name": "jobs-fragment-careers-F1.2",
      "selector": [
        ".elementor-6573 .elementor-element-3c765362"
      ],
      "style": "grey, notes",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "careers-F2.1",
      "name": "internship-fragment-careers-F2.1",
      "selector": [
        ".elementor-6573 .elementor-element-213ddcfe"
      ],
      "style": "red",
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "careers-F2.2",
      "name": "internship-fragment-careers-F2.2",
      "selector": [
        ".elementor-6573 .elementor-element-64d8e2e"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    },
    {
      "id": "careers-F2.3",
      "name": "internship-fragment-careers-F2.3",
      "selector": [
        ".elementor-6573 .elementor-element-4ce5f23e"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "careers-F2.4",
      "name": "internship-fragment-careers-F2.4",
      "selector": [
        ".elementor-6573 .elementor-element-54325338"
      ],
      "style": null,
      "blocks": [
        "columns-media"
      ],
      "defaultContent": []
    },
    {
      "id": "careers-F2.5",
      "name": "internship-fragment-careers-F2.5",
      "selector": [
        ".elementor-6573 .elementor-element-5a456f9f"
      ],
      "style": null,
      "blocks": [
        "hero-promo"
      ],
      "defaultContent": []
    }
  ]
};

// PER-INSTANCE BLOCK OPTIONS (variant classes): block name -> instance selector -> options
const INSTANCE_OPTIONS = {
  "cards-feature": {
    ".elementor-2745 .elementor-element-aa7e11f": [
      "boxed"
    ],
    ".elementor-2745 .elementor-element-3f6e18f": [
      "icons"
    ],
    ".elementor-2745 .elementor-element-9d8b971": [
      "links"
    ],
    ".elementor-2871 .elementor-element-38ecf0e": [
      "icons",
      "carousel"
    ],
    ".elementor-1799 .elementor-element-73bb45e": [
      "boxed",
      "elevated"
    ],
    ".elementor-1799 .elementor-element-c6606bc": [
      "boxed",
      "elevated",
      "overlap",
      "divided"
    ],
    ".elementor-1861 .elementor-element-b5cf05e": [
      "circle"
    ],
    ".elementor-22451 .elementor-element-9c6aacd": [
      "product",
      "overlap"
    ],
    ".elementor-22830 .elementor-element-2eeed79": [
      "product"
    ],
    ".elementor-3099 .elementor-element-062be19": [
      "boxed"
    ],
    ".elementor-3099 .elementor-element-b8dc142": [
      "boxed",
      "elevated",
      "accent"
    ],
    ".elementor-13944 .elementor-element-14cf9d6": [
      "boxed",
      "elevated",
      "gradient"
    ],
    ".elementor-13944 .elementor-element-93ede8a": [
      "steps"
    ],
    ".elementor-19290 .elementor-element-710cfdd": [
      "boxed",
      "carousel"
    ],
    ".elementor-19290 .elementor-element-9ab5255": [
      "product"
    ],
    ".elementor-6840 .elementor-element-c158bfb": [
      "boxed",
      "elevated",
      "icon-left"
    ],
    ".elementor-6840 .elementor-element-9d25ef1": [
      "links"
    ],
    ".elementor-12803 .elementor-element-5edeb97": [
      "boxed",
      "elevated",
      "overlap",
      "highlight"
    ],
    ".elementor-12803 .elementor-element-6c234bd": [
      "posts"
    ]
  },
  "cards-product": {
    ".elementor-2745 .elementor-element-00e6b5c": [
      "light"
    ],
    ".elementor-19290 .elementor-element-9cc3acd": [
      "hover"
    ]
  },
  "hero-promo": {
    ".elementor-2745 .elementor-element-ca5306d": [
      "light",
      "right"
    ],
    ".elementor-2871 .elementor-element-986ffe9": [
      "right"
    ],
    ".elementor-2871 .elementor-element-6378b6b": [
      "card"
    ],
    ".elementor-2871 .elementor-element-84b88d0": [
      "split"
    ],
    ".elementor-1799 .elementor-element-5330a3e": [
      "center"
    ],
    ".elementor-22451 .elementor-element-c94aa6a": [
      "right"
    ],
    ".elementor-22830 .elementor-element-8f44234": [
      "right",
      "end"
    ],
    ".elementor-13944 .elementor-element-3bb0ed2": [
      "light"
    ],
    ".elementor-19290 .elementor-element-635bb7b": [
      "right"
    ],
    ".elementor-6840 .elementor-element-26517c1": [
      "light",
      "checks"
    ],
    ".elementor-6840 .elementor-element-0ec23cb": [
      "light",
      "right"
    ],
    ".elementor-12803 .elementor-element-130823e": [
      "center",
      "dim"
    ],
    ".elementor-6573 .elementor-element-5a456f9f": [
      "light"
    ]
  },
  "columns-media": {
    ".elementor-2871 .elementor-element-d4d42ec": [
      "steps"
    ],
    ".elementor-2871 .elementor-element-74401a0": [
      "reverse"
    ],
    ".elementor-1861 .elementor-element-1fcc151": [
      "steps",
      "numbered"
    ],
    ".elementor-6573 .elementor-element-4ce5f23e": [
      "reverse",
      "panel"
    ],
    ".elementor-6573 .elementor-element-3d3948f2": [
      "steps",
      "filled"
    ]
  },
  "cards-audience": {
    ".elementor-1799 .elementor-element-4b846a8": [
      "landscape"
    ],
    ".elementor-2871 .elementor-element-035d061": [
      "compact"
    ]
  },
  "tabs": {
    ".elementor-1861 .elementor-element-bccf07d": [
      "vertical"
    ],
    ".elementor-22830 .elementor-element-4b630b1": [
      "tiles"
    ],
    ".elementor-6573 .elementor-element-88d9683": [
      "fragments"
    ]
  },
  "table-article": {
    ".elementor-22830 .elementor-element-240ef93": [
      "compare"
    ],
    ".elementor-19290 .elementor-element-2be8725 .tabela-beneficios": [
      "features"
    ]
  },
  "hero-banner": {
    ".elementor-3099 .elementor-element-59c64c7": [
      "split"
    ],
    ".elementor-19290 .elementor-element-0fedced": [
      "right"
    ]
  },
  "accordion": {
    ".elementor-13944 .elementor-element-f1f23bb": [
      "more",
      "visible-5"
    ],
    ".elementor-19290 .elementor-element-fd74825": [
      "more",
      "premium"
    ]
  },
  "hero-video": {
    ".elementor-2745 .elementor-element-112f6d8": [
      "large"
    ]
  }
};

const transformers = [cleanupTransformer, landingTransformer, landingSectionsTransformer];

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
  return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
