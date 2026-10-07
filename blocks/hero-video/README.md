# hero-video

Custom **hero** block. Purpose: page-intro-hero.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell of content.

## Supported variations

- `large` (option class, landing pages only): personal-bank layout - 86vh tall, copy flush 60px from the left
  edge (30px on mobile), 50px title, 30px/39px subtitle at 49% width.

On landing pages (`body.landing`) the layout also adapts to the authored content, no option needed:

- H1 only (Vimeo): boxed, title 70% wide (real-estate).
- H1 + subtitle paragraph (Vimeo): boxed 41% text column, 30px subtitle (corporate).
- Logo image authored above the H1 (`p.hero-video-logo`): 35px title, blue gradient strip (private-bank).
- MP4 video link: 746px / 638px tall, 44% scrim, 13px #cc092f strip (credit cards).

On listing pages (`body.listing`, e.g. investments-content), the poster image is used without a video. Rows are
`[picture | h1]`.

- Fixed 765px tall, photo anchored to the top, 20% scrim.
- Title at the bottom left in the boxed 41% column, 86% wide. Sizes are 40px/48px on desktop and 22px/23px on
  mobile.
- 19px strip below: solid dark red with a 1px overlap on desktop, red-to-violet gradient on mobile.

## Universal Editor fields

N/A (Document Authoring project)
