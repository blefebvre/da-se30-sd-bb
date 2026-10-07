/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards. Source: bradescobank.com landing pages (template "landing").
 * Variant options arrive as `options` (block name "cards-feature (opt, ...)").
 *
 * Landing pages: one row per item — [icon/image | heading + text / list / em badge / link].
 * The image cell is omitted when no item has one (and padded with '' for items without one).
 *
 * Items: swiper slides (carousels), loop-grid items (posts), otherwise the largest set of
 * same-shape sibling containers (EL.findItems). Content around the items (section intro
 * headings, footnotes, "See More" buttons) is moved before/after the block as default content.
 *
 * Instance specifics:
 *  - credit-cards (.elementor-22451 .elementor-element-9c6aacd): the card CTAs live in the next
 *    sibling container .elementor-element-9e81d46 (button widgets, matched by index); they are
 *    merged into their card and that container is removed.
 *  - zelle steps: step numbers are CSS (.circulo-numero html widgets are dropped).
 *  - posts: [featured image (link dropped) | date, linked H3 title].
 */
const NO_TITLE_PROMOTION = ['icons', 'circle', 'steps', 'links', 'posts', 'carousel'];
const BADGE = /^\(?\s*coming soon\s*\)?$/i;

function cardItems(element) {
  const slides = [...element.querySelectorAll('.swiper-slide')]
    .filter((s) => !s.classList.contains('swiper-slide-duplicate') && EL.hasContent(s));
  if (slides.length) return slides;
  const loop = [...element.querySelectorAll('.e-loop-item')].filter((s) => EL.hasContent(s));
  if (loop.length) return loop;
  return EL.findItems(element);
}

function cardBody(document, item, options) {
  const raw = EL.collect(document, item, { bgImages: false, dividers: true, imageLinks: !options.includes('posts') });
  let image = null;
  const parts = [];
  raw.forEach((it) => {
    if (it.kind === 'image' && !image) { image = it; return; }
    parts.push(it);
  });

  // heading sequence with "divider follows" flags (product cards: title / tagline / benefits)
  const heads = [];
  parts.forEach((it, i) => {
    if (it.kind !== 'heading') return;
    const next = parts[i + 1];
    heads.push({ it, divider: !!next && next.kind === 'divider' });
  });
  const tagline = heads.length >= 4 && heads[0].divider && heads[1].divider && !heads[2].divider
    ? heads[1].it : null;

  const body = [];
  let titled = false;
  parts.forEach((it) => {
    if (!it.el) return;
    if (it.kind === 'heading') {
      if (!titled) {
        titled = true;
        body.push(EL.retag(document, it.el, 'h3'));
      } else {
        body.push(EL.retag(document, it.el, it === tagline ? 'h4' : 'p'));
      }
      return;
    }
    if (it.kind === 'text' && BADGE.test(EL.norm(it.el.textContent)) && !it.el.querySelector('em')) {
      const p = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = EL.norm(it.el.textContent);
      p.append(em);
      body.push(p);
      return;
    }
    body.push(it.el);
  });

  // promote a short leading label (e.g. "STOCKS", "CONVENIENT") to the item heading
  if (!titled && !options.some((o) => NO_TITLE_PROMOTION.includes(o))) {
    const texts = body.filter((el) => el.tagName === 'P' && !el.querySelector('em:only-child'));
    const first = texts[0];
    if (first && texts.length >= 2 && !first.querySelector('a')
      && EL.norm(first.textContent).length <= 40 && !/[.:]$/.test(EL.norm(first.textContent))) {
      body[body.indexOf(first)] = EL.retag(document, first, 'h3');
    }
  }

  let imageEl = image ? image.el : null;
  if (!imageEl) {
    const src = EL.bgUrl(item);
    if (src) imageEl = EL.bgImageItem(document, src).el;
  }
  return { imageEl, body };
}

function parseLanding(element, { document, options }) {
  EL.unlazy(document);
  const items = cardItems(element);
  const rows = items.map((item) => cardBody(document, item, options)).filter((r) => r.body.length || r.imageEl);

  // credit-cards: CTAs in the next sibling container, matched by index
  const ctaHost = element.nextElementSibling && element.nextElementSibling.matches('.elementor-element-9e81d46')
    ? element.nextElementSibling : null;
  if (ctaHost && element.matches('.elementor-element-9c6aacd')) {
    const ctas = EL.collect(document, ctaHost).filter((it) => it.kind === 'button');
    ctas.forEach((cta, i) => { if (rows[i]) rows[i].body.push(cta.el); });
  }

  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  let before = [];
  let after = [];
  if (items.length && items[0].classList.contains('swiper-slide')) {
    // carousel: everything outside the slider widget itself
    const host = items[0].closest('.elementor-widget');
    if (host && host !== element && element.contains(host)) ({ before, after } = EL.outside(element, [host]));
  } else {
    ({ before, after } = EL.outside(element, items));
  }
  EL.moveOut(document, element, before, 'before');
  EL.moveOut(document, element, after, 'after');

  const withImage = rows.some((r) => r.imageEl);
  const cells = rows.map((r) => (withImage ? [r.imageEl || '', r.body] : [r.body]));
  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('cards-feature', options), cells });
  element.replaceWith(block);
  if (ctaHost) ctaHost.remove();
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
        // inline <style>/<script>/<link> (e.g. loop-grid custom CSS) are not content
        if (/^(STYLE|SCRIPT|LINK|NOSCRIPT|TEMPLATE)$/.test(k.tagName)) return;
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
    chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => {
      if (!it.el) return;
      // a button moved out of the block is default content: author it as a primary button
      const a = it.kind === 'button' && it.el.querySelector(':scope > a');
      if (a) {
        const strong = doc.createElement('strong');
        a.replaceWith(strong);
        strong.append(a);
      }
      nodes.push(it.el);
    }));
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

/* ------------------------------------------------------------------------------------------
 * Info-page template (import-info-page.js, template "info-page"). Gated in parse(): never runs
 * for home / article / landing imports. Reuses cardItems / cardBody unchanged, then:
 *  - documents: items = .box-cra tiles when present (cra-public-file, 10 tiles); always two
 *    cells [icon or '' | body]; an item without heading gets its first text line as H3.
 *  - a container without repeated items IS a single tile (help "Note: ..." bar) -> 1 row.
 *  - gradient (about-us key figures): figure and label on separate paragraphs.
 *  - rows (bradesco-lounge): <br> in headings -> space; <li><p>..</p></li> unwrapped,
 *    trailing <br> trimmed.
 * Rows follow the Cards convention: [image | text] when items have images (or "documents"),
 * otherwise a single text cell (Cards "no images").
 * ---------------------------------------------------------------------------------------- */
const INFO_ROOTS = ['1178', '2212', '1481', '1401', '2391', '2498', '467', '631', '6834', '2456', '2514', '2527']
  .map((id) => `.elementor-${id}`).join(', ');

function isInfoPage(element, template) {
  if (template) return template === 'info-page';
  return !!element.closest(INFO_ROOTS);
}

const FIGURE = /^([$€£]?\s*[\d][\d.,]*\s*\+?(?:\s*(?:million|billion|thousand|trillion|mil|bi)\b)?\s*\+?)\s+(\S.*)$/i;

/** "72.7 million customers" / "$414+ billion<br>Total Assets" -> [figure, label] paragraphs */
function splitFigure(document, p) {
  const lines = [];
  let cur = [];
  [...p.childNodes].forEach((n) => {
    if (n.nodeType === 1 && n.tagName === 'BR') { lines.push(cur); cur = []; } else cur.push(n);
  });
  lines.push(cur);
  const filled = lines.filter((l) => l.some((n) => EL.norm(n.textContent)));
  if (filled.length >= 2) {
    return filled.map((l) => {
      const out = document.createElement('p');
      l.forEach((n) => out.append(n));
      [...out.childNodes].forEach((n) => { if (n.nodeType === 3) n.textContent = n.textContent.replace(/\s+/g, ' '); });
      if (out.firstChild && out.firstChild.nodeType === 3) out.firstChild.textContent = out.firstChild.textContent.replace(/^\s+/, '');
      if (out.lastChild && out.lastChild.nodeType === 3) out.lastChild.textContent = out.lastChild.textContent.replace(/\s+$/, '');
      return out;
    });
  }
  const text = EL.norm(p.textContent);
  const m = !p.querySelector('*') && text.match(FIGURE);
  if (!m) return [p];
  return [m[1].trim(), m[2].trim()].map((t) => {
    const out = document.createElement('p');
    out.textContent = t;
    return out;
  });
}

function trimTrailingBreaks(el) {
  for (let guard = 0; guard < 20; guard += 1) {
    const last = el.lastChild;
    if (!last) break;
    if (last.nodeType === 3 && !last.textContent.replace(/[\s ]+/g, '')) { last.remove(); continue; }
    if (last.nodeType === 1 && last.tagName === 'BR') { last.remove(); continue; }
    break;
  }
}

function infoBody(document, body, options) {
  let out = body;
  if (options.includes('rows')) {
    out = out.map((el) => {
      if (/^H[1-6]$/.test(el.tagName)) {
        el.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
        el.innerHTML = el.innerHTML.replace(/\s+/g, ' ').trim();
      }
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        [...el.children].forEach((li) => {
          const ps = [...li.children].filter((c) => c.tagName === 'P');
          ps.forEach((p, i) => {
            trimTrailingBreaks(p);
            const frag = [...p.childNodes];
            if (i > 0) frag.unshift(document.createElement('br'));
            p.replaceWith(...frag);
          });
          [...li.childNodes].forEach((n) => { if (n.nodeType === 3 && !n.textContent.trim()) n.remove(); });
          trimTrailingBreaks(li);
          if (li.firstChild && li.firstChild.nodeType === 3) li.firstChild.textContent = li.firstChild.textContent.replace(/^\s+/, '');
        });
        [...el.childNodes].forEach((n) => { if (n.nodeType === 3 && !n.textContent.trim()) n.remove(); });
      }
      return el;
    });
  }
  if (options.includes('gradient') && !out.some((el) => /^H[1-6]$/.test(el.tagName))) {
    out = out.flatMap((el) => (el.tagName === 'P' ? splitFigure(document, el) : [el]));
  }
  if (options.includes('documents') && !out.some((el) => /^H[1-6]$/.test(el.tagName))) {
    const first = out.find((el) => el.tagName === 'P' && EL.norm(el.textContent));
    const link = first && first.querySelector('a');
    const isLink = !!link && EL.norm(first.textContent) === EL.norm(link.textContent);
    if (first && !isLink) out[out.indexOf(first)] = EL.retag(document, first, 'h3');
  }
  return out;
}

function parseInfo(element, { document, options }) {
  EL.unlazy(document);
  let items = options.includes('documents')
    ? [...element.querySelectorAll('.box-cra')].filter((n) => EL.hasContent(n)) : [];
  if (!items.length) items = cardItems(element);
  // the instance is itself a single tile (no repeated item containers inside)
  const single = !items.length && EL.hasContent(element);
  if (single) items = [element];
  const rows = items.map((item) => cardBody(document, item, options))
    .filter((r) => r.body.length || r.imageEl)
    .map((r) => ({ imageEl: r.imageEl, body: infoBody(document, r.body, options) }));

  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (!single) {
    const { before, after } = EL.outside(element, items);
    EL.moveOut(document, element, before, 'before');
    EL.moveOut(document, element, after, 'after');
  }

  const withImage = options.includes('documents') || rows.some((r) => r.imageEl);
  const cells = rows.map((r) => (withImage ? [r.imageEl || '', r.body] : [r.body]));
  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('cards-feature', options), cells });
  element.replaceWith(block);
}

/* ------------------------------------------------------------------------------------------
 * Listing template (import-listing.js, template "listing"). Gated in parse(): only runs when
 * template === 'listing'. Field-based extraction (no EL.collect walk), one row per post:
 *   [image (img only, no link) | body]   or   [body]  when no post has an image.
 *   body = <p>DATE</p> <p><em>CATEGORY</em></p> <h3><a href=PERMALINK>TITLE</a></h3>
 *          <p>EXCERPT</p> <p>By AUTHOR</p>   (each only when present; the title is the only link)
 * Items: article.post-card (custom-posts-grid shortcode, investments-content Highlights),
 *   .e-loop-item (loop grids), otherwise EL.findItems.
 * Fields:
 *   image     first <img> of the item (onLoad materializes articles-archive CSS backgrounds as a
 *             direct-child <img> of container b0cf567); fallback EL.bgUrl of the item's empty
 *             background containers (svg decorations ignored).
 *   date      a text widget matching MM/DD/YYYY.
 *   category  .post-category-alt (emphasised text, link dropped). articles-archive's
 *             category text-editor 05a409f is invisible on the source and is dropped.
 *   title     .post-title / theme-post-title / heading widget / first heading, else the first
 *             remaining text widget (archives: plain text-editor).
 *   permalink title link, else the item's wrapper anchor (a.e-con), else the image link.
 *   excerpt   .post-excerpt / theme-post-excerpt / remaining text widgets.
 *   byline    a text widget "BY <name>" -> "By <name>".
 * Dropped: favorite/bookmark buttons, scripts, html widgets, empty nodes. Content of the
 * instance outside the items (pagination nav) is moved out as default content (EL.moveOut).
 * ---------------------------------------------------------------------------------------- */
const LISTING_DROP = '.favorite-container, .post-bookmark-placeholder, button, script, style, noscript, svg, .elementor-element-05a409f, .elementor-hidden-desktop';
const LISTING_DATE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
const LISTING_BYLINE = /^by\s+(\S.*)$/i;
const LISTING_TITLE = '.post-title, .elementor-widget-theme-post-title, .elementor-widget-heading';
const LISTING_TEXT = '.post-excerpt, .elementor-widget-text-editor, .elementor-widget-theme-post-excerpt, .elementor-widget-shortcode';

function listingItems(element) {
  const cards = [...element.querySelectorAll('article.post-card')].filter((n) => EL.hasContent(n));
  if (cards.length) return cards;
  const loop = [...element.querySelectorAll('.e-loop-item')].filter((n) => EL.hasContent(n));
  if (loop.length) return loop;
  return EL.findItems(element);
}

const listingDropped = (n) => !!n.closest(LISTING_DROP);
const listingText = (n) => {
  const c = n.cloneNode(true);
  c.querySelectorAll(LISTING_DROP).forEach((x) => x.remove());
  return EL.norm(c.textContent);
};
const listingHref = (a) => {
  const href = a && a.getAttribute('href');
  return href && !/^#?$/.test(href) ? EL.fixHref(href) : null;
};

function listingRow(document, item) {
  const p = (text) => { const el = document.createElement('p'); el.textContent = text; return el; };

  // image
  let imageEl = null;
  let imageLink = null;
  const img = [...item.querySelectorAll('img')].find((i) => !listingDropped(i) && EL.imgSrc(i));
  if (img) {
    const it = EL.imageItem(document, img, false);
    if (it) { imageEl = it.el; imageLink = img.closest('a[href]'); }
  }
  if (!imageEl) {
    const bg = [item, ...item.querySelectorAll('[data-settings*="background_background"]')]
      .filter((n) => !listingDropped(n) && !EL.norm(n.textContent))
      .map((n) => EL.bgUrl(n)).find((src) => src && !/\.svg(\?|#|$)/i.test(src));
    if (bg) imageEl = EL.bgImageItem(document, bg).el;
  }

  // category
  const catEl = [...item.querySelectorAll('.post-category-alt')].find((n) => !listingDropped(n) && listingText(n));
  const category = catEl ? listingText(catEl) : '';

  // title
  let titleEl = [...item.querySelectorAll(LISTING_TITLE)].find((n) => !listingDropped(n) && listingText(n));
  if (!titleEl) {
    titleEl = [...item.querySelectorAll('h1, h2, h3, h4, h5, h6')].find((n) => !listingDropped(n) && listingText(n));
  }

  // text widgets (outermost only, outside category / title), in document order
  const texts = [];
  [...item.querySelectorAll(LISTING_TEXT)].forEach((n) => {
    if (listingDropped(n) || (catEl && (n.contains(catEl) || catEl.contains(n)))) return;
    if (titleEl && (n.contains(titleEl) || titleEl.contains(n))) return;
    if (texts.some((t) => t.el.contains(n))) return;
    const text = listingText(n);
    if (text) texts.push({ el: n, text });
  });
  let date = '';
  let byline = '';
  const rest = [];
  texts.forEach((t) => {
    if (!date && LISTING_DATE.test(t.text)) { date = t.text; return; }
    const by = t.text.match(LISTING_BYLINE);
    if (!byline && by) { byline = `By ${by[1]}`; return; }
    rest.push(t);
  });
  let title = titleEl ? listingText(titleEl) : '';
  if (!title && rest.length) title = rest.shift().text;

  // permalink: title link, wrapper anchor, image link
  const wrapper = item.matches('a[href]') ? item
    : (item.querySelector('a.e-con[href]') || item.closest('a[href]'));
  const href = listingHref(titleEl && (titleEl.matches('a[href]') ? titleEl : titleEl.querySelector('a[href]')))
    || listingHref(wrapper) || listingHref(imageLink);

  const body = [];
  if (date) body.push(p(date));
  if (category) {
    const el = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = category;
    el.append(em);
    body.push(el);
  }
  if (title) {
    const h3 = document.createElement('h3');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = title;
      h3.append(a);
    } else {
      h3.textContent = title;
    }
    body.push(h3);
  }
  rest.forEach((t) => body.push(p(t.text)));
  if (byline) body.push(p(byline));
  return { imageEl, body };
}

function parseListing(element, { document, options }) {
  EL.unlazy(document);
  const items = listingItems(element);
  const rows = items.map((item) => listingRow(document, item)).filter((r) => r.body.length || r.imageEl);
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const { before, after } = EL.outside(element, items);
  EL.moveOut(document, element, before, 'before');
  EL.moveOut(document, element, after, 'after');
  const withImage = rows.some((r) => r.imageEl);
  const cells = rows.map((r) => (withImage ? [r.imageEl || '', r.body] : [r.body]));
  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('cards-feature', options), cells });
  element.replaceWith(block);
}

/* ------------------------------------------------------------------------------------------
 * Article-rich template (import-article-rich.js, template "article-rich"). Gated in parse():
 * only runs when template === 'article-rich'; any other option set falls back to parseLanding.
 *  a) 'slides' — Elementor nested carousel (Swiper): items = .swiper-slide minus
 *     .swiper-slide-duplicate clones (swiper-slide-duplicate-prev/-next alone is an original),
 *     de-duplicated by data-swiper-slide-index (fallback heading text), ordered by that index.
 *     Row [icon | body]: icon = .elementor-widget-icon img with a real URL (onLoad swaps the
 *     inline svg for the uploaded .svg), '' when only an svg / data: URI remains. Body: heading
 *     -> h3; first text-editor -> p(s); next text-editor ending with ':' -> h4; every following
 *     text-editor -> one li of a single ul. Level-bar image widgets are dropped. Carousel
 *     data-settings autoplay === 'yes' appends 'autoplay' to the block-name options.
 *  b) 'centered' — e-grid of text boxes: items = the grid's child containers (through a single
 *     .e-con-inner); row [body] = every text paragraph as <p>; background decorations dropped.
 *  c) 'steps' — html widget (.compounding-steps): items = repeated root children
 *     (.compounding-step); row [<p>step text</p>]; the step number is dropped (CSS counters).
 *  d) 'filled' — html widget (.investment-options): items = repeated root children
 *     (.investment-option); row [<p>text with <br> line breaks</p>].
 * ---------------------------------------------------------------------------------------- */
const AR_SKIP = /^(STYLE|SCRIPT|NOSCRIPT|TEMPLATE|LINK|META)$/;

/** Collapse whitespace in text nodes; trim at the edges and around <br>. */
function arTidy(el) {
  const walker = el.ownerDocument.createTreeWalker(el, 4);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach((t) => { t.textContent = t.textContent.replace(/[\s\u00a0\u200b]+/g, ' '); });
  const edge = (n, dir) => {
    // nearest meaningful sibling in a direction, climbing out of inline wrappers
    let cur = n;
    while (cur && cur !== el) {
      const sib = dir < 0 ? cur.previousSibling : cur.nextSibling;
      if (sib) return sib;
      cur = cur.parentNode;
    }
    return null;
  };
  texts.forEach((t) => {
    const prev = edge(t, -1);
    const next = edge(t, 1);
    if (!prev || (prev.nodeType === 1 && prev.tagName === 'BR')) t.textContent = t.textContent.replace(/^ /, '');
    if (!next || (next.nodeType === 1 && next.tagName === 'BR')) t.textContent = t.textContent.replace(/ $/, '');
    if (!t.textContent) t.remove();
  });
  // drop leading / trailing <br>
  while (el.firstChild && el.firstChild.nodeType === 1 && el.firstChild.tagName === 'BR') el.firstChild.remove();
  while (el.lastChild && el.lastChild.nodeType === 1 && el.lastChild.tagName === 'BR') el.lastChild.remove();
  return el;
}

function arParagraph(document, html) {
  const p = EL.clean(EL.make(document, 'p', html));
  return arTidy(p);
}

const arHidden = (n, stop) => {
  for (let cur = n; cur && cur !== stop; cur = cur.parentElement) {
    if (cur.classList && (cur.classList.contains('elementor-hidden-desktop')
      || cur.classList.contains('swiper-slide-duplicate'))) return true;
    if (cur.hasAttribute && cur.hasAttribute('hidden')) return true;
    const style = cur.getAttribute && cur.getAttribute('style');
    if (style && /display\s*:\s*none/i.test(style)) return true;
  }
  return false;
};

/** Text blocks of one widget as paragraphs (inline content kept). */
function arWidgetParas(document, w) {
  const out = [];
  EL.collect(document, w, { bgImages: false, iconItems: false }).forEach((it) => {
    if (!it.el || it.kind === 'image') return;
    if (it.kind === 'list') { out.push(it.el); return; }
    out.push(arParagraph(document, it.el.innerHTML));
  });
  return out.filter((n) => EL.norm(n.textContent));
}

function arSlideIcon(document, slide) {
  const img = [...slide.querySelectorAll('.elementor-widget-icon img')].find((i) => !arHidden(i, slide));
  const src = img ? EL.imgSrc(img) : '';
  if (!src) return '';
  const out = document.createElement('img');
  out.src = src;
  out.alt = '';
  return out;
}

function arSlideBody(document, slide) {
  const widgets = [...slide.querySelectorAll('.elementor-widget')]
    .filter((w) => !arHidden(w, slide) && ['heading', 'text-editor'].includes(EL.widgetType(w)));
  const body = [];
  let ul = null;
  let stage = 'title'; // title -> desc -> intro -> items
  widgets.forEach((w) => {
    const type = EL.widgetType(w);
    if (type === 'heading') {
      const t = w.querySelector('.elementor-heading-title') || w.querySelector('h1, h2, h3, h4, h5, h6, p');
      const text = t ? EL.norm(t.textContent) : '';
      if (!text) return;
      const h = EL.clean(EL.make(document, stage === 'title' ? 'h3' : 'h4', t.innerHTML));
      arTidy(h);
      body.push(h);
      if (stage === 'title') stage = 'desc';
      return;
    }
    const paras = arWidgetParas(document, w);
    if (!paras.length) return;
    const text = EL.norm(paras.map((p) => p.textContent).join(' '));
    if (stage === 'title' || stage === 'desc') {
      if (stage === 'desc' && body.some((n) => n.tagName === 'P') && /:$/.test(text)) {
        body.push(arTidy(EL.make(document, 'h4', paras.map((p) => p.innerHTML).join(' '))));
        stage = 'items';
        return;
      }
      body.push(...paras);
      if (stage === 'title') stage = 'desc';
      return;
    }
    // items: one li per text-editor (several paragraphs joined by <br>)
    if (!ul) { ul = document.createElement('ul'); body.push(ul); }
    const li = document.createElement('li');
    paras.forEach((p, i) => {
      if (i) li.append(document.createElement('br'));
      if (p.tagName === 'P') li.append(...p.childNodes);
      else li.append(p);
    });
    ul.append(arTidy(li));
  });
  return body;
}

function parseArticleRichSlides(element, { document, options }) {
  const slides = [...element.querySelectorAll('.swiper-slide')]
    .filter((s) => !s.classList.contains('swiper-slide-duplicate') && EL.hasContent(s));
  const seen = new Set();
  const items = [];
  slides.forEach((slide, pos) => {
    const idxAttr = slide.getAttribute('data-swiper-slide-index');
    const idx = idxAttr !== null && idxAttr !== '' && !Number.isNaN(parseInt(idxAttr, 10)) ? parseInt(idxAttr, 10) : null;
    const heading = slide.querySelector('.elementor-widget-heading .elementor-heading-title, .elementor-widget-heading h1, .elementor-widget-heading h2, .elementor-widget-heading h3');
    const key = idx !== null ? `i:${idx}` : `h:${EL.norm(heading ? heading.textContent : slide.textContent).toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ slide, idx, pos });
  });
  items.sort((a, b) => {
    if (a.idx !== null && b.idx !== null && a.idx !== b.idx) return a.idx - b.idx;
    return a.pos - b.pos;
  });
  const cells = items
    .map(({ slide }) => [arSlideIcon(document, slide), arSlideBody(document, slide)])
    .filter((r) => r[1].length);
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const carousel = element.matches('.elementor-widget-n-carousel') ? element
    : (element.querySelector('.elementor-widget-n-carousel') || element);
  const opts = [...options];
  if (EL.settings(carousel).autoplay === 'yes' && !opts.includes('autoplay')) opts.push('autoplay');
  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('cards-feature', opts), cells });
  element.replaceWith(block);
}

function parseArticleRichGrid(element, { document, options }) {
  let items = EL.kidsOf(element).filter((k) => EL.isCon(k) && EL.hasContent(k));
  if (!items.length) items = EL.findItems(element);
  const cells = [];
  items.forEach((item) => {
    const body = [];
    EL.collect(document, item, { bgImages: false, iconItems: false }).forEach((it) => {
      if (!it.el || it.kind === 'image' || it.kind === 'divider') return;
      if (it.kind === 'list') { body.push(it.el); return; }
      const p = arParagraph(document, it.el.innerHTML);
      if (EL.norm(p.textContent)) body.push(p);
    });
    if (body.length) cells.push([body]);
  });
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('cards-feature', options), cells });
  element.replaceWith(block);
}

/** Root element of an html widget's markup (skips <style>/<script>). */
function arHtmlRoot(element) {
  const c = element.querySelector(':scope > .elementor-widget-container') || element;
  const kids = [...c.children].filter((k) => !AR_SKIP.test(k.tagName));
  return kids.length === 1 ? kids[0] : c;
}

/** Repeated direct children of the root (largest same-class group, >= 2), else fallback. */
function arRepeated(root, fallback) {
  const kids = [...root.children].filter((k) => !AR_SKIP.test(k.tagName));
  const groups = new Map();
  kids.forEach((k) => {
    const key = `${k.tagName}.${[...k.classList].sort().join('.')}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(k);
  });
  let best = null;
  groups.forEach((g) => { if (g.length >= 2 && (!best || g.length > best.length)) best = g; });
  if (best) return best;
  return [...root.querySelectorAll(fallback)];
}

function parseArticleRichHtml(element, { document, options, kind }) {
  const root = arHtmlRoot(element);
  const items = kind === 'steps'
    ? arRepeated(root, '.compounding-step')
    : arRepeated(root, '.investment-option');
  const cells = [];
  items.forEach((item) => {
    let html;
    if (kind === 'steps') {
      const text = item.querySelector('.compounding-step-text');
      if (text) {
        html = text.innerHTML;
      } else {
        // generic: drop number-only children (CSS counters render the numbers)
        const clone = item.cloneNode(true);
        [...clone.children].forEach((k) => { if (/^\d+\.?$/.test(EL.norm(k.textContent))) k.remove(); });
        const inner = clone.children.length === 1 && /^(P|DIV)$/.test(clone.children[0].tagName)
          && EL.norm(clone.children[0].textContent) === EL.norm(clone.textContent) ? clone.children[0] : clone;
        html = inner.innerHTML;
      }
    } else {
      html = item.innerHTML;
    }
    const p = arParagraph(document, html);
    if (EL.norm(p.textContent)) cells.push([[p]]);
  });
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('cards-feature', options), cells });
  element.replaceWith(block);
}

function parseArticleRich(element, { document, options }) {
  if (options.includes('slides')) { parseArticleRichSlides(element, { document, options }); return; }
  if (options.includes('centered')) { parseArticleRichGrid(element, { document, options }); return; }
  if (options.includes('steps')) { parseArticleRichHtml(element, { document, options, kind: 'steps' }); return; }
  if (options.includes('filled')) { parseArticleRichHtml(element, { document, options, kind: 'filled' }); return; }
  parseLanding(element, { document, options });
}

export default function parse(element, { document, options, basePath, template } = {}) {
  if (template === 'article-rich') {
    parseArticleRich(element, { document, options: options || [], basePath: basePath || '' });
    return;
  }
  if (template === 'listing') {
    parseListing(element, { document, options: options || [], basePath: basePath || '' });
    return;
  }
  if (isInfoPage(element, template)) {
    parseInfo(element, { document, options: options || [], basePath: basePath || '' });
    return;
  }
  parseLanding(element, { document, options: options || [], basePath: basePath || '' });
}
