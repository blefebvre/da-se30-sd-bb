# cards-feature

Custom **cards** block. Purpose: product-cards.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

| Variation | Option class |
| --- | --- |
| Boxed | `boxed` |
| Elevated | `elevated` |
| Overlap | `overlap` |
| Posts (white shadowed post cards: 3:2 image, small date, linked title; 3/2/1 columns) | `posts` |
| Product (centred credit-card products: card image on top, dark-red title; with `overlap` the card image rises out of the box over the section above) | `product` |
| Icon Left | `icon-left` |
| Links | `links` |
| Icons | `icons` |
| Carousel (single horizontal scrolling row with prev/next arrows; with `icons`: white icon tiles, arrows above/below; with `boxed`: translucent outlined boxes for dark sections, arrows at the sides) | `carousel` |
| Circle (unboxed row of round photos with a centred label and optional small sub-label) | `circle` |
| Steps (numbered red circles joined by a red line, numbers from CSS counters; vertical list on mobile) | `steps` |
| Accent (with `elevated`: red left bar, light titles) | `accent` |
| Divided (with `elevated`: rule under the title, gradient-dot bullets) | `divided` |
| Highlight (with `elevated`: red bold titles, airy copy, stronger shadow) | `highlight` |
| Gradient (with `elevated`: centred 282px tiles, red caps title with short rule, red-to-blue bottom edge) | `gradient` |

Content conventions: a paragraph holding only `<em>` text is a badge (e.g. "Coming soon");
in `boxed` (without `elevated`) items without a heading render as compact key-fact boxes, and
four plain boxes sit 2 x 2 on desktop.
In `product` the item layout follows its content: benefit lines (p) without an h4 render as a
gradient box with short rules between lines and a pill CTA (32px below the box on desktop); an h4
tagline switches to the open layout (rules around the tagline, plain text link); image + title only
renders as a small grey tile.

## Universal Editor fields

N/A (Document Authoring project)
