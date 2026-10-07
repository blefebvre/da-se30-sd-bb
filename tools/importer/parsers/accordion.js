/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion. Base: accordion. Source: bradescobank.com landing pages (template
 * "landing"); block name "accordion (<options>)".
 * Output: one row per item — [question | answer]. ALL items are kept, including the ones the
 * page hides behind its JS "SHOW MORE" toggle (they are present, collapsed, in the DOM).
 * Supports the classic accordion/toggle widgets (.elementor-accordion-item /
 * .elementor-toggle-item: .elementor-tab-title + .elementor-tab-content) and the nested
 * accordion (details.e-n-accordion-item > summary + content container).
 * Iteration is keyed on the item wrappers (div/details), never on the title anchors.
 */
function accordionItems(element) {
  const nested = [...element.querySelectorAll('.e-n-accordion-item')];
  if (nested.length) {
    return nested.map((item) => {
      const summary = item.querySelector(':scope > summary') || item.querySelector('summary');
      const title = summary && (summary.querySelector('.e-n-accordion-item-title-text') || summary);
      const body = [...item.children].filter((c) => c !== summary);
      return { title, body };
    });
  }
  return [...element.querySelectorAll('.elementor-accordion-item, .elementor-toggle-item')].map((item) => {
    const head = item.querySelector('.elementor-tab-title');
    const title = head && (head.querySelector('.elementor-accordion-title, .elementor-toggle-title') || head);
    const content = item.querySelector('.elementor-tab-content');
    return { title, body: content ? [content] : [] };
  });
}

function parseLanding(element, { document, options }) {
  const cells = [];
  accordionItems(element).forEach(({ title, body }) => {
    const label = title ? EL.norm(title.textContent) : '';
    if (!label) return;
    const answer = [];
    body.forEach((node) => {
      EL.collect(document, node, { bgImages: false }).forEach((it) => { if (it.el) answer.push(it.el); });
    });
    // an Elementor placeholder item ("Accordion" / "–") carries no answer
    const answerText = answer.map((n) => EL.norm(n.textContent)).join('').replace(/[-–—]/g, '');
    if (/^accordion$/i.test(label) && !answerText) return;
    cells.push([label, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('accordion', options), cells });
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

/* ------------------------------------------------------------------------------------------
 * Info-page template (import-info-page.js, template "info-page"), option "icons" only (security
 * .elementor-1178 .elementor-element-349fe54). Gated in parse(): never runs for home / article /
 * landing imports. Same 2-cell rows [title | content] as the landing path, plus the label icon
 * — drawn on the source by CSS `::before` on the title anchor (icon-security-1..4.png) — as an
 * <img> at the start of the title cell. Icon source: computed ::before content /
 * background-image, else the page's <style> rules `[data-tab="N"] a::before { ... url(...) }`;
 * no icon when neither resolves.
 * ---------------------------------------------------------------------------------------- */
const INFO_ROOTS = ['1178', '2212', '1481', '1401', '2391', '2498', '467', '631', '6834', '2456', '2514', '2527']
  .map((id) => `.elementor-${id}`).join(', ');

function isInfoPage(element, template) {
  if (template) return template === 'info-page';
  return !!element.closest(INFO_ROOTS);
}

function cssUrl(value) {
  const m = String(value || '').match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
}

/** url() per data-tab number from inline <style> rules: `[data-tab="N"] a::before {...}` */
function styleIconMap(document) {
  const map = {};
  document.querySelectorAll('style').forEach((s) => {
    const css = s.textContent || '';
    const re = /\[data-tab=["']?(\d+)["']?\][^{]*?a\s*:{1,2}before\s*\{([^}]*)\}/gi;
    let m = re.exec(css);
    while (m) {
      const url = cssUrl(m[2]);
      if (url && !map[m[1]]) map[m[1]] = url;
      m = re.exec(css);
    }
  });
  return map;
}

function titleIcon(document, item, styleMap) {
  const anchor = item.querySelector('.elementor-accordion-title, .elementor-toggle-title')
    || item.querySelector('.elementor-tab-title a');
  let src = null;
  const view = document.defaultView;
  if (anchor && view && view.getComputedStyle) {
    try {
      const cs = view.getComputedStyle(anchor, '::before');
      src = cssUrl(cs.content) || cssUrl(cs.backgroundImage);
    } catch (e) { /* ignore */ }
  }
  if (!src) {
    const tab = item.querySelector('[data-tab]');
    const n = tab && tab.getAttribute('data-tab');
    if (n && styleMap[n]) src = styleMap[n];
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  return img;
}

function parseInfoIcons(element, { document, options }) {
  const styleMap = styleIconMap(document);
  const items = [...element.querySelectorAll('.elementor-accordion-item, .elementor-toggle-item')];
  if (!items.length) {
    parseLanding(element, { document, options });
    return;
  }
  const cells = [];
  items.forEach((item) => {
    const head = item.querySelector('.elementor-tab-title');
    const title = head && (head.querySelector('.elementor-accordion-title, .elementor-toggle-title') || head);
    const label = title ? EL.norm(title.textContent) : '';
    if (!label) return;
    const content = item.querySelector('.elementor-tab-content');
    const answer = [];
    if (content) EL.collect(document, content, { bgImages: false }).forEach((it) => { if (it.el) answer.push(it.el); });
    const icon = titleIcon(document, item, styleMap);
    const labelCell = icon ? [icon, document.createTextNode(` ${label}`)] : label;
    cells.push([labelCell, answer.length ? answer : '']);
  });
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('accordion', options), cells });
  element.replaceWith(block);
}

/* ------------------------------------------------------------------------------------------
 * Article-rich template (import-article-rich.js, template "article-rich"). Gated in parse():
 * only runs when template === 'article-rich'. Elementor nested accordion inside the post
 * content (details.e-n-accordion-item > summary + content container): one row per item
 * [title text | body], ALL items kept. Body = the content container flattened with EL.collect
 * (icon widgets — decorative red dots — dropped, no icon+text list pairing, no background
 * images). Heading demotion: a heading widget whose parent container also holds an icon widget
 * (run-in labels "Liquidity:", "STRIPS:") -> <h4>; any other heading widget -> <h3>.
 * Text-editor paragraphs (incl. bold run-in labels) stay <p>.
 * ---------------------------------------------------------------------------------------- */
function articleRichHeadingTag(widgetEl) {
  const parent = widgetEl && widgetEl.parentElement;
  if (!parent) return 'h3';
  const withIcon = [...parent.children].some((c) => c !== widgetEl && EL.isWidget(c) && EL.widgetType(c) === 'icon');
  return withIcon ? 'h4' : 'h3';
}

function parseArticleRich(element, { document, options }) {
  const cells = [];
  accordionItems(element).forEach(({ title, body }) => {
    const label = title ? EL.norm(title.textContent) : '';
    if (!label) return;
    const answer = [];
    body.forEach((node) => {
      EL.collect(document, node, { bgImages: false, iconItems: false }).forEach((it) => {
        if (!it.el) return;
        if (it.kind === 'image') return; // no content images expected; drop icon/data-URI leftovers
        if (it.kind === 'heading') {
          const isWidgetOrigin = it.origin && EL.isWidget(it.origin);
          const tag = isWidgetOrigin ? articleRichHeadingTag(it.origin) : 'h3';
          const h = EL.retag(document, it.el, tag);
          if (!h.children.length) h.textContent = EL.norm(h.textContent);
          answer.push(h);
          return;
        }
        answer.push(it.el);
      });
    });
    cells.push([label, answer.length ? answer : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName('accordion', options), cells });
  element.replaceWith(block);
}

export default function parse(element, { document, options, basePath, template } = {}) {
  const opts = options || [];
  if (template === 'article-rich') {
    parseArticleRich(element, { document, options: opts, basePath: basePath || '' });
    return;
  }
  if (isInfoPage(element, template) && opts.includes('icons')) {
    parseInfoIcons(element, { document, options: opts, basePath: basePath || '' });
    return;
  }
  parseLanding(element, { document, options: opts, basePath: basePath || '' });
}
