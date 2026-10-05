/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product. Base: cards. Source: https://bradescobank.com/
 * Output: one row per tile — [image | eyebrow (optional), h3 or logo image, paragraph, CTA link].
 *
 * The 4 tiles are split across two Elementor containers:
 *   .elementor-element-c28d200 (Investments, Lending) — the matched element
 *   .elementor-element-6cab8f9 (Credit Cards, Zelle)  — its next sibling
 * Both are collected into one block. The Zelle footnote (.elementor-element-77e13de p)
 * is kept as default content directly after the block; the rest of 6cab8f9 is removed.
 *
 * Iteration keyed on the inner .discovery-product body wrapper; each body's parent
 * container is the tile (holds the photo <img> and the button widget).
 *
 * Homepage (.elementor-14769) keeps this exact path (parseLegacy). Every other page (landing
 * template) goes through parseLanding: one row per tile [tile background image | heading,
 * text / list, CTA link(s), corner icon image ("hover")]; block name "cards-product (<options>)".
 */
function imgSrc(img) {
  return img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('src') || '';
}

function cloneImg(document, img) {
  const out = document.createElement('img');
  out.src = imgSrc(img);
  const alt = img.getAttribute('alt');
  if (alt) out.alt = alt;
  return out;
}

// Desktop tile backgrounds, verified against post-14769.css.
const FALLBACK_BG = {
  e274826: 'https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-home-investments-2.jpg',
  '1391f39': 'https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-produto-3.jpg',
  f9193f1: 'https://bradescobank.com/wp-content/uploads/2026/08/thumb-bradesco-credit-home-1.webp',
  '3618faf': 'https://bradescobank.com/wp-content/uploads/2025/12/home-zelle-2.webp',
};

function urlFromCss(value) {
  if (!value) return null;
  const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  return m && !/^data:/i.test(m[1]) ? m[1] : null;
}

function tileBackground(tile) {
  let src = urlFromCss(tile.getAttribute('style'));
  if (!src) {
    try {
      const view = tile.ownerDocument && tile.ownerDocument.defaultView;
      if (view && view.getComputedStyle) src = urlFromCss(view.getComputedStyle(tile).backgroundImage);
    } catch (e) { /* ignore */ }
  }
  if (!src) {
    const id = tile.getAttribute('data-id')
      || ([...tile.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c)) || '').replace('elementor-element-', '');
    src = FALLBACK_BG[id] || null;
  }
  return src;
}

function widgetContent(widget) {
  return widget.querySelector(':scope > .elementor-widget-container') || widget;
}

function buildRow(document, body) {
  const tile = body.parentElement;

  // Photo: direct-child <img> of the tile container.
  const photo = tile ? tile.querySelector(':scope > img') : null;
  let imageCell = '';
  if (photo) {
    imageCell = cloneImg(document, photo);
  } else if (tile) {
    // Live page: photo is a CSS background on the tile container.
    const bg = tileBackground(tile);
    if (bg) {
      imageCell = document.createElement('img');
      imageCell.src = bg;
      const title = body.querySelector('h1, h2, h3, h4, h5, h6');
      imageCell.alt = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';
    }
  }

  const bodyCell = [];
  const scope = body.querySelector(':scope > .e-con-inner') || body;
  const widgets = [...scope.querySelectorAll(':scope > .elementor-widget')];
  let titleFound = false;

  widgets.forEach((widget) => {
    const content = widgetContent(widget);
    const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
    const logo = widget.classList.contains('elementor-widget-image') ? content.querySelector('img') : null;

    if (heading) {
      const h3 = document.createElement('h3');
      h3.innerHTML = heading.innerHTML.replace(/&nbsp;/g, ' ').trim();
      h3.textContent = h3.textContent.replace(/ /g, ' ').trim();
      bodyCell.push(h3);
      titleFound = true;
      return;
    }
    if (logo) {
      const p = document.createElement('p');
      p.append(cloneImg(document, logo));
      bodyCell.push(p);
      titleFound = true;
      return;
    }
    if (!content.textContent.trim()) return;

    const paras = [...content.querySelectorAll(':scope > p')];
    if (paras.length) {
      paras.forEach((p) => {
        if (!p.textContent.trim()) return;
        const np = document.createElement('p');
        np.innerHTML = p.innerHTML.trim();
        bodyCell.push(np);
      });
    } else {
      // Bare text (e.g. Zelle: "Send and receive money within minutes<sup>1</sup>")
      const np = document.createElement('p');
      np.innerHTML = content.innerHTML.trim();
      bodyCell.push(np);
    }
  });

  // CTA: button widget is a sibling of the body inside the tile.
  const ctaLink = tile
    ? tile.querySelector(':scope > .elementor-widget-button a[href], :scope > .elementor-widget-button + * a.elementor-button')
    : null;
  if (ctaLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href');
    a.textContent = (ctaLink.textContent || '').replace(/\s+/g, ' ').trim();
    p.append(a);
    bodyCell.push(p);
  }

  if (!titleFound && !bodyCell.length) return null;
  return [imageCell, bodyCell];
}

/* ---- homepage / article path (unchanged) ---- */
function parseLegacy(element, { document }) {
  // Locate the companion container holding tiles 3-4 (Credit Cards, Zelle).
  let extra = element.nextElementSibling;
  if (!extra || !extra.classList.contains('elementor-element-6cab8f9')) {
    extra = document.querySelector('.elementor-element-6cab8f9');
  }
  if (extra && (extra === element || element.contains(extra))) extra = null;

  const containers = [element];
  if (extra) containers.push(extra);

  const cells = [];
  containers.forEach((container) => {
    [...container.querySelectorAll('.discovery-product')].forEach((body) => {
      const row = buildRow(document, body);
      if (row) cells.push(row);
    });
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Zelle footnote -> last paragraph of the Zelle card (it renders inside that tile).
  let footnote = null;
  if (extra) {
    const fnSrc = extra.querySelector('.elementor-element-77e13de p')
      || document.querySelector('.elementor-element-77e13de p');
    if (fnSrc && fnSrc.textContent.trim()) {
      footnote = document.createElement('p');
      footnote.innerHTML = fnSrc.innerHTML.trim();
      // flatten wrapping <span>, keep <sup>
      const onlySpan = footnote.children.length === 1 && footnote.firstElementChild.tagName === 'SPAN'
        ? footnote.firstElementChild : null;
      if (onlySpan) footnote.innerHTML = onlySpan.innerHTML.trim();
    }
    extra.remove();
  }

  if (footnote) cells[cells.length - 1][1].push(footnote);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}

/* ---- landing pages ---- */
/**
 * Landing pages: one row per tile — [image (tile CSS background or photo <img>) | heading,
 * paragraph(s) / list, optional CTA link(s), optional corner icon (content-less child
 * container with a background, "hover" option)]. Content around the tiles is default content.
 */
function parseLanding(element, { document, options }) {
  EL.unlazy(document);
  let tiles = EL.findItems(element);
  if (!tiles.length) tiles = EL.contentKids(element);

  const cells = [];
  tiles.forEach((tile) => {
    const items = EL.collect(document, tile, { bgImages: true }).filter((it) => it.el);
    const heading = items.find((it) => it.kind === 'heading');
    let src = EL.bgUrl(tile);
    let photo = null;
    if (!src) {
      photo = items.find((it) => it.kind === 'image');
      if (photo) src = photo.img.getAttribute('src');
    }
    const body = items.filter((it) => it !== photo).map((it) => it.el);
    if (!body.length) return;
    let imageCell = '';
    if (src) {
      imageCell = document.createElement('img');
      imageCell.src = src;
      imageCell.alt = heading ? EL.norm(heading.el.textContent) : '';
    }
    cells.push([imageCell, body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const { before, after } = EL.outside(element, tiles);
  EL.moveOut(document, element, before, 'before');
  EL.moveOut(document, element, after, 'after');

  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('cards-product', options), cells });
  element.replaceWith(block);
}

/* ------------------------------------------------------------------------------------------
 * Elementor landing helpers (identical copy in every landing parser: parsers are injected
 * standalone by the validator, so they cannot import a shared module).
 * Widget-type based extraction: .elementor-widget-heading / -text-editor / -image / -button /
 * -icon-list / -icon-box / -image-box / -html / -divider, nested containers (.e-con).
 * ---------------------------------------------------------------------------------------- */
const EL = (() => {
  const HEADING = /^H[1-6]$/;
  const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
  const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
  const WIDGET_TYPES = ['theme-post-featured-image', 'theme-post-title', 'text-editor', 'heading',
    'image-box', 'icon-box', 'icon-list', 'image', 'button', 'divider', 'spacer', 'icon', 'html',
    'shortcode', 'accordion', 'toggle', 'n-accordion', 'nested-accordion', 'n-tabs', 'n-carousel',
    'loop-grid', 'template', 'video', 'menu-anchor'];

  const norm = (s) => String(s || '').replace(/[\s\u00a0\u200b\u2028\u2029]+/g, ' ').trim();
  const isEl = (n) => !!n && n.nodeType === 1;
  const hidden = (n) => isEl(n) && n.classList && (n.classList.contains('elementor-hidden-desktop')
    || n.classList.contains('swiper-slide-duplicate'));
  const isWidget = (n) => isEl(n) && (n.classList.contains('elementor-widget')
    || n.getAttribute('data-element_type') === 'widget');
  const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains('e-con')
    || n.classList.contains('e-con-inner') || n.classList.contains('elementor-section')
    || n.classList.contains('elementor-column') || n.classList.contains('elementor-widget-wrap')
    || n.getAttribute('data-element_type') === 'container');
  const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector('img');

  function fixHref(href) {
    if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith('//')) return href;
    const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
    return m ? `${m[1] || ''}${m[2].replace(/\/{2,}/g, '/')}${m[3]}` : href;
  }

  function fixLinks(root) {
    if (!isEl(root)) return root;
    const links = [...root.querySelectorAll('a[href]')];
    if (root.matches('a[href]')) links.unshift(root);
    links.forEach((a) => a.setAttribute('href', fixHref(a.getAttribute('href'))));
    return root;
  }

  function urlFromCss(value) {
    if (!value) return null;
    const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
  }

  function settings(el) {
    const raw = isEl(el) ? el.getAttribute('data-settings') : null;
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
  }

  /** Elementor lazy-loads container backgrounds (`.e-con.e-parent:not(.e-lazyloaded)` forces
   *  `background-image: none`); mark them loaded so getComputedStyle reports the real image. */
  function unlazy(doc) {
    doc.querySelectorAll('.e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)')
      .forEach((n) => n.classList.add('e-lazyloaded'));
  }

  function imgSrc(img) {
    const c = [img.getAttribute('data-src'), img.getAttribute('data-lazy-src'), img.getAttribute('src')];
    return c.find((s) => s && !/^data:/i.test(s)) || '';
  }

  /** CSS background of an Elementor container: inline style, data-settings
   *  (background_image / background_slideshow_gallery), computed style, direct child <img>. */
  function bgUrl(el) {
    if (!isEl(el)) return null;
    let src = urlFromCss(el.getAttribute('style'));
    if (!src) {
      const s = settings(el);
      const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
      src = (s.background_image && s.background_image.url) || (slides[0] && slides[0].url) || null;
    }
    if (!src) {
      try {
        const view = el.ownerDocument && el.ownerDocument.defaultView;
        if (view && view.getComputedStyle) src = urlFromCss(view.getComputedStyle(el).backgroundImage);
      } catch (e) { /* ignore */ }
    }
    if (!src) {
      const img = el.querySelector(':scope > img, :scope > .e-con-inner > img');
      if (img) src = imgSrc(img) || null;
    }
    return src || null;
  }

  function canonicalVideo(raw) {
    if (!raw) return null;
    let u;
    try { u = new URL(raw, 'https://bradescobank.com/'); } catch (e) { return null; }
    const host = u.hostname.replace(/^www\.|^m\./, '');
    if (/(^|\.)vimeo\.com$/.test(host)) {
      const id = (u.pathname.match(/(\d{5,})/) || [])[1];
      return id ? `https://vimeo.com/${id}` : null;
    }
    if (host === 'youtu.be') {
      const id = u.pathname.split('/')[1];
      return id ? `https://www.youtube.com/watch?v=${id}` : null;
    }
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
      const id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
      return id ? `https://www.youtube.com/watch?v=${id}` : null;
    }
    if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
    return null;
  }

  /** Elementor background video: data-settings background_video_link, <video>, iframe. */
  function videoUrl(el) {
    const cands = [];
    [el, ...el.querySelectorAll('[data-settings]')].forEach((n) => {
      const s = settings(n);
      if (s.background_video_link) cands.push(s.background_video_link);
    });
    el.querySelectorAll('video').forEach((v) => {
      cands.push(v.getAttribute('src'));
      v.querySelectorAll('source').forEach((s) => cands.push(s.getAttribute('src')));
    });
    el.querySelectorAll('iframe').forEach((f) => cands.push(f.getAttribute('src') || f.getAttribute('data-src')));
    for (const c of cands) {
      const v = canonicalVideo(c);
      if (v) return v;
    }
    return null;
  }

  function widgetType(w) {
    const t = w.getAttribute('data-widget_type');
    if (t) return t.split('.')[0];
    const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1])
      .filter((c) => c && !/__|--/.test(c));
    return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || '';
  }

  /** Direct children, looking through a single .e-con-inner wrapper (several wrappers = merged
   *  sibling containers, kept apart). */
  function kidsOf(node) {
    const out = [];
    const inners = [...node.children].filter((c) => c.classList.contains('e-con-inner'));
    [...node.children].forEach((c) => {
      if (hidden(c)) return;
      if (inners.length === 1 && c === inners[0]) out.push(...[...c.children].filter((k) => !hidden(k)));
      else out.push(c);
    });
    return out;
  }

  const contentKids = (node) => kidsOf(node).filter((k) => isCon(k) && hasContent(k));

  function make(doc, tag, html) {
    const el = doc.createElement(tag);
    if (html !== undefined) el.innerHTML = String(html).trim();
    return el;
  }

  /** Strip presentational noise from cloned inline content. */
  function clean(el) {
    el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
    el.querySelectorAll('[class], [style], [id]').forEach((n) => {
      n.removeAttribute('class'); n.removeAttribute('style'); n.removeAttribute('id');
    });
    // unwrap attribute-less spans and href-less anchors (named anchors, JS toggles)
    el.querySelectorAll('span').forEach((s) => { if (!s.attributes.length) s.replaceWith(...s.childNodes); });
    el.querySelectorAll('a:not([href])').forEach((a) => a.replaceWith(...a.childNodes));
    // collapse redundant nesting (<strong><strong>x</strong></strong>)
    for (let guard = 0; guard < 10; guard += 1) {
      const nested = [...el.querySelectorAll('strong > strong, b > b, em > em, i > i, u > u, sup > sup')]
        .filter((n) => n.parentElement.childNodes.length === 1);
      if (!nested.length) break;
      nested.forEach((n) => { if (n.isConnected) n.replaceWith(...n.childNodes); });
    }
    return fixLinks(el);
  }

  function retag(doc, el, tag) {
    if (el.tagName.toLowerCase() === tag) return el;
    const out = make(doc, tag);
    while (el.firstChild) out.append(el.firstChild);
    return out;
  }

  function imageItem(doc, img, keepLink = true) {
    const src = imgSrc(img);
    if (!src) return null;
    const out = doc.createElement('img');
    out.src = src;
    const alt = img.getAttribute('alt');
    if (alt) out.alt = alt;
    const p = doc.createElement('p');
    const a = keepLink ? img.closest('a[href]') : null;
    if (a && a.getAttribute('href') && !/^#?$/.test(a.getAttribute('href'))) {
      const link = doc.createElement('a');
      link.href = fixHref(a.getAttribute('href'));
      link.append(out);
      p.append(link);
    } else {
      p.append(out);
    }
    return { kind: 'image', el: p, img: out };
  }

  function bgImageItem(doc, src, alt = '') {
    const img = doc.createElement('img');
    img.src = src;
    img.alt = alt;
    const p = doc.createElement('p');
    p.append(img);
    return { kind: 'image', el: p, img };
  }

  function push(items, item, origin) {
    if (!item) return;
    item.origin = origin;
    items.push(item);
  }

  /** Steps markup of the bradesco html widget (.secao-numeros .passo-numerado). */
  function stepsList(doc, c) {
    const list = doc.createElement(c.querySelector('.numero-passo img') ? 'ul' : 'ol');
    c.querySelectorAll('.passo-numerado').forEach((step) => {
      const body = step.querySelector('.texto-passo') || step;
      const li = doc.createElement('li');
      const h = body.querySelector('h1, h2, h3, h4, h5, h6');
      if (h) {
        li.append(make(doc, 'strong', h.innerHTML));
        li.append(' ');
      }
      const ps = [...body.querySelectorAll('p')].filter((p) => norm(p.textContent));
      ps.forEach((p, i) => {
        if (i) li.append(doc.createElement('br'));
        const tmp = make(doc, 'span', p.innerHTML);
        li.append(...tmp.childNodes);
      });
      if (!h && !ps.length) li.textContent = norm(body.textContent);
      if (norm(li.textContent)) list.append(clean(li));
    });
    return list.children.length ? { kind: 'list', el: list } : null;
  }

  let walkContainer;

  /** Flow content (text-editor body, html widget, shortcode output): blocks are kept, loose
   *  inline/text runs are wrapped in paragraphs. */
  function flow(doc, container, items, opts) {
    let run = null;
    const flush = () => {
      if (run && (norm(run.textContent) || run.querySelector('img'))) {
        push(items, { kind: 'text', el: clean(run) }, container);
      }
      run = null;
    };
    [...container.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        if (norm(n.textContent)) {
          run = run || doc.createElement('p');
          run.append(n.textContent.replace(/[\s\u00a0]+/g, ' '));
        } else if (run) run.append(' ');
        return;
      }
      if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
      const tag = n.tagName.toUpperCase();
      if (tag === 'BR') {
        if (run) run.append(doc.createElement('br'));
        return;
      }
      if (INLINE.test(tag) && !n.querySelector('p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section')) {
        if (n.querySelector('img') && !norm(n.textContent)) {
          flush();
          n.querySelectorAll('img').forEach((img) => push(items, imageItem(doc, img), container));
          return;
        }
        if (!norm(n.textContent)) return;
        run = run || doc.createElement('p');
        run.append(n.cloneNode(true));
        return;
      }
      flush();
      if (isWidget(n)) { widget(doc, n, items, opts); return; }
      if (isCon(n)) { walkContainer(doc, n, items, opts); return; }
      if (HEADING.test(tag)) {
        if (norm(n.textContent)) push(items, { kind: 'heading', el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
        return;
      }
      if (tag === 'P') {
        if (!norm(n.textContent)) {
          n.querySelectorAll('img').forEach((img) => push(items, imageItem(doc, img), container));
          return;
        }
        push(items, { kind: 'text', el: clean(make(doc, 'p', n.innerHTML)) }, container);
        return;
      }
      if (tag === 'UL' || tag === 'OL') {
        const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
        if (norm(list.textContent)) push(items, { kind: 'list', el: list }, container);
        return;
      }
      if (tag === 'TABLE' || tag === 'BLOCKQUOTE' || tag === 'PRE') {
        push(items, { kind: 'text', el: clean(n.cloneNode(true)) }, container);
        return;
      }
      if (tag === 'IMG') { push(items, imageItem(doc, n), container); return; }
      if (n.classList.contains('secao-numeros')) { push(items, stepsList(doc, n), container); return; }
      flow(doc, n, items, opts);
    });
    flush();
  }

  function headingItem(doc, title, fallbackTag) {
    if (!title || !norm(title.textContent)) return null;
    const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
    const el = clean(make(doc, tag, title.innerHTML));
    // a link wrapping the whole title element
    const a = title.closest('a[href]');
    if (a && !el.querySelector('a')) {
      const link = doc.createElement('a');
      link.href = fixHref(a.getAttribute('href'));
      while (el.firstChild) link.append(el.firstChild);
      el.append(link);
    }
    return { kind: 'heading', el, sourceTag: title.tagName };
  }

  function widget(doc, w, items, opts = {}) {
    if (hidden(w)) return;
    const type = widgetType(w);
    const c = w.querySelector(':scope > .elementor-widget-container') || w;
    switch (type) {
      case 'heading':
      case 'theme-post-title': {
        const t = c.querySelector('.elementor-heading-title') || c.querySelector('h1, h2, h3, h4, h5, h6, p');
        push(items, headingItem(doc, t, 'p'), w);
        return;
      }
      case 'image':
      case 'theme-post-featured-image':
        c.querySelectorAll('img').forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
        return;
      case 'button': {
        const a = c.querySelector('a.elementor-button, a[href]');
        if (!a) return;
        const text = norm((a.querySelector('.elementor-button-text') || a).textContent);
        if (!text) return;
        const p = doc.createElement('p');
        const href = a.getAttribute('href');
        if (href) {
          const link = doc.createElement('a');
          link.href = fixHref(href);
          link.textContent = text;
          p.append(link);
        } else {
          p.textContent = text;
        }
        push(items, { kind: 'button', el: p }, w);
        return;
      }
      case 'icon-list': {
        const ul = doc.createElement('ul');
        c.querySelectorAll('.elementor-icon-list-item').forEach((it) => {
          const text = it.querySelector('.elementor-icon-list-text') || it;
          if (!norm(text.textContent)) return;
          const li = clean(make(doc, 'li', text.innerHTML));
          const a = it.querySelector('a[href]');
          if (a && !li.querySelector('a')) {
            const link = doc.createElement('a');
            link.href = fixHref(a.getAttribute('href'));
            while (li.firstChild) link.append(li.firstChild);
            li.append(link);
          }
          ul.append(li);
        });
        if (ul.children.length) push(items, { kind: 'list', el: ul }, w);
        return;
      }
      case 'icon-box':
      case 'image-box': {
        c.querySelectorAll('.elementor-icon-box-icon img, .elementor-image-box-img img')
          .forEach((img) => push(items, imageItem(doc, img), w));
        const title = c.querySelector('.elementor-icon-box-title, .elementor-image-box-title');
        push(items, headingItem(doc, title, 'h3'), w);
        const d = c.querySelector('.elementor-icon-box-description, .elementor-image-box-description');
        if (d && norm(d.textContent)) {
          const tmp = [];
          flow(doc, d, tmp, opts);
          if (!tmp.length) tmp.push({ kind: 'text', el: clean(make(doc, 'p', d.innerHTML)) });
          tmp.forEach((i) => push(items, i, w));
        }
        return;
      }
      case 'divider':
        if (opts.dividers) push(items, { kind: 'divider', el: null }, w);
        return;
      case 'spacer':
      case 'icon':
      case 'menu-anchor':
        return;
      case 'html':
        if (c.querySelector('.passo-numerado')) {
          push(items, stepsList(doc, c), w);
          return;
        }
        // decorative step numbers (.circulo-numero "1")
        if (!norm(c.textContent).replace(/[\d.\s]+/g, '') && !c.querySelector('img')) return;
        flow(doc, c, items, opts);
        return;
      default:
        flow(doc, c, items, opts);
    }
  }

  walkContainer = (doc, con, items, opts = {}) => {
    if (hidden(con)) return;
    const kids = kidsOf(con);
    const widgets = kids.filter(isWidget);
    // [icon widget + text widget] pairs -> list item
    if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2
      && widgetType(widgets[0]) === 'icon' && ['text-editor', 'heading'].includes(widgetType(widgets[1]))) {
      const tmp = [];
      widget(doc, widgets[1], tmp, opts);
      const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
      if (texts.length === 1) {
        push(items, { kind: 'li', el: clean(make(doc, 'li', texts[0].el.innerHTML)) }, con);
        return;
      }
    }
    // content-less container whose background is the picture
    if (opts.bgImages && !norm(con.textContent) && !con.querySelector('.elementor-widget img, video, iframe')) {
      const src = bgUrl(con);
      if (src) push(items, bgImageItem(doc, src), con);
      return;
    }
    kids.forEach((k) => {
      if (isWidget(k)) widget(doc, k, items, opts);
      else if (isCon(k)) walkContainer(doc, k, items, opts);
      else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
        // loose blocks inside a container (e.g. transformer placeholders)
        const tmp = [];
        flow(doc, { childNodes: [k] }, tmp, opts);
        tmp.forEach((i) => push(items, i, con));
      }
    });
  };

  /** Ordered content items of a subtree: [{ kind, el, origin }]. */
  function collect(doc, root, opts = {}) {
    const items = [];
    if (isWidget(root)) widget(doc, root, items, opts);
    else if (isCon(root)) walkContainer(doc, root, items, opts);
    else flow(doc, root, items, opts);
    // post-process: li runs -> ul, adjacent lists of the same type merge, image runs group
    const out = [];
    items.forEach((it) => {
      const prev = out[out.length - 1];
      if (it.kind === 'li') {
        if (prev && prev.kind === 'list' && prev.liRun) {
          prev.el.append(it.el);
        } else {
          const ul = make(doc, 'ul');
          ul.append(it.el);
          out.push({ kind: 'list', el: ul, liRun: true, origin: it.origin });
        }
        return;
      }
      if (it.kind === 'list' && prev && prev.kind === 'list' && prev.el.tagName === it.el.tagName) {
        prev.el.append(...it.el.children);
        return;
      }
      if (opts.groupImages !== false && it.kind === 'image' && prev && prev.kind === 'image'
        && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement
        && (prev.origin.closest('.e-con') === it.origin.closest('.e-con'))) {
        prev.el.append(' ', ...it.el.childNodes);
        prev.group = true;
        return;
      }
      out.push(it);
    });
    return out;
  }

  /* ---- repeated-item detection ---- */
  function shape(k) {
    const s = [];
    // a container that is itself a group of items never pairs with a plain item
    if (isStrictGroup(k)) s.push('group');
    if (k.querySelector('img')) s.push('img');
    if (k.querySelector('h1, h2, h3, h4, h5, h6')) s.push('h');
    if (k.querySelector('.elementor-widget-button')) s.push('btn');
    const text = [...k.querySelectorAll('p, li, .elementor-widget-text-editor, .elementor-widget-html')]
      .some((n) => norm(n.textContent));
    if (text) s.push('text');
    return s.join('+');
  }

  function sameShapeGroup(kids) {
    const by = new Map();
    kids.forEach((k) => {
      const s = shape(k);
      if (!by.has(s)) by.set(s, []);
      by.get(s).push(k);
    });
    let best = null;
    by.forEach((g) => { if (g.length >= 2 && (!best || g.length > best.length)) best = g; });
    return best;
  }

  function isStrictGroup(node) {
    const kids = contentKids(node);
    if (kids.length < 2) return false;
    if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
    const g = sameShapeGroup(kids);
    return !!g && g.length === kids.length;
  }

  /** Repeated item containers: the largest set of same-shape sibling containers (descending
   *  through wrappers and groups of groups). */
  function findItems(node) {
    const kids = contentKids(node);
    const group = sameShapeGroup(kids);
    if (group) return group.flatMap((k) => (isStrictGroup(k) ? findItems(k) : [k]));
    for (const k of kids) {
      const sub = findItems(k);
      if (sub.length >= 2) return sub;
    }
    return [];
  }

  /** Content chunks of `root` outside `items`, split into before/after the first/last item. */
  function outside(root, items) {
    const before = [];
    const after = [];
    if (!items.length) return { before, after };
    const first = items[0];
    const walk = (node) => {
      kidsOf(node).forEach((k) => {
        if (items.includes(k) || !isEl(k)) return;
        if (items.some((it) => k.contains(it))) { walk(k); return; }
        if (!hasContent(k)) return;
        // eslint-disable-next-line no-bitwise
        const isBefore = !!(k.compareDocumentPosition(first) & 4);
        (isBefore ? before : after).push(k);
      });
    };
    walk(root);
    return { before, after };
  }

  /** Move content chunks next to the block as default content. */
  function moveOut(doc, element, chunks, where) {
    const nodes = [];
    chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => it.el && nodes.push(it.el)));
    if (!nodes.length) return;
    if (where === 'before') element.before(...nodes);
    else element.after(...nodes);
  }

  function blockName(base, options) {
    const opts = (options || []).filter(Boolean);
    return opts.length ? `${base} (${opts.join(', ')})` : base;
  }

  const LEGACY_ROOTS = '.elementor-14769, .elementor-location-single';

  return {
    norm, isEl, isWidget, isCon, hasContent, fixHref, fixLinks, urlFromCss, settings, unlazy,
    imgSrc, bgUrl, videoUrl, canonicalVideo, widgetType, kidsOf, contentKids, make, clean, retag,
    imageItem, bgImageItem, collect, findItems, outside, moveOut, blockName, LEGACY_ROOTS,
  };
})();

/* ---- entry point ---- */
export default function parse(element, { document, options, basePath } = {}) {
  // Homepage (.elementor-14769) and articles (.elementor-location-single): unchanged legacy path.
  if (element.closest(EL.LEGACY_ROOTS)) {
    parseLegacy(element, { document });
    return;
  }
  parseLanding(element, { document, options: options || [], basePath: basePath || '' });
}
