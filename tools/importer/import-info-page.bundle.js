/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-info-page.js
  var import_info_page_exports = {};
  __export(import_info_page_exports, {
    default: () => import_info_page_default
  });

  // tools/importer/parsers/hero-banner.js
  function heroCopy(document, element) {
    const items = EL.collect(document, element, { bgImages: true });
    const titleIdx = items.findIndex((it) => it.kind === "heading");
    const idx = titleIdx >= 0 ? titleIdx : items.findIndex((it) => it.kind === "text");
    const images = [];
    const copy = [];
    items.forEach((it, i) => {
      if (!it.el) return;
      if (it.kind === "image") {
        images.push(it.el);
        return;
      }
      if (i === idx) {
        copy.push(EL.retag(document, it.el, "h1"));
        return;
      }
      if (it.kind === "heading") {
        copy.push(EL.retag(document, it.el, "p"));
        return;
      }
      copy.push(it.el);
    });
    return { images, copy, hasTitle: idx >= 0 };
  }
  function parseLanding(element, { document, options }) {
    EL.unlazy(document);
    let bg = EL.bgUrl(element);
    if (!bg) {
      const holder = [...element.querySelectorAll(".e-con")].find((c) => EL.hasContent(c) && EL.bgUrl(c));
      if (holder) bg = EL.bgUrl(holder);
    }
    const { images, copy, hasTitle } = heroCopy(document, element);
    if (!hasTitle && !bg && !images.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bg) {
      const img = document.createElement("img");
      img.src = bg;
      img.alt = "";
      cells.push([img]);
    }
    cells.push([[...images, ...copy]]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName("hero-banner", options), cells });
    element.replaceWith(block);
  }
  var EL = (() => {
    const HEADING = /^H[1-6]$/;
    const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
    const WIDGET_TYPES = [
      "theme-post-featured-image",
      "theme-post-title",
      "text-editor",
      "heading",
      "image-box",
      "icon-box",
      "icon-list",
      "image",
      "button",
      "divider",
      "spacer",
      "icon",
      "html",
      "shortcode",
      "accordion",
      "toggle",
      "n-accordion",
      "nested-accordion",
      "n-tabs",
      "n-carousel",
      "loop-grid",
      "template",
      "video",
      "menu-anchor"
    ];
    const norm = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector("img");
    function fixHref(href) {
      if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) return href;
      const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
      return m ? `${m[1] || ""}${m[2].replace(/\/{2,}/g, "/")}${m[3]}` : href;
    }
    function fixLinks(root) {
      if (!isEl(root)) return root;
      const links = [...root.querySelectorAll("a[href]")];
      if (root.matches("a[href]")) links.unshift(root);
      links.forEach((a) => a.setAttribute("href", fixHref(a.getAttribute("href"))));
      return root;
    }
    function urlFromCss2(value) {
      if (!value) return null;
      const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
    }
    function settings(el) {
      const raw = isEl(el) ? el.getAttribute("data-settings") : null;
      if (!raw) return {};
      try {
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
    function unlazy(doc) {
      doc.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    }
    function imgSrc(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss2(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc(img) || null;
      }
      return src || null;
    }
    function canonicalVideo(raw) {
      if (!raw) return null;
      let u;
      try {
        u = new URL(raw, "https://bradescobank.com/");
      } catch (e) {
        return null;
      }
      const host = u.hostname.replace(/^www\.|^m\./, "");
      if (/(^|\.)vimeo\.com$/.test(host)) {
        const id = (u.pathname.match(/(\d{5,})/) || [])[1];
        return id ? `https://vimeo.com/${id}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/")[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
      return null;
    }
    function videoUrl(el) {
      const cands = [];
      [el, ...el.querySelectorAll("[data-settings]")].forEach((n) => {
        const s = settings(n);
        if (s.background_video_link) cands.push(s.background_video_link);
      });
      el.querySelectorAll("video").forEach((v) => {
        cands.push(v.getAttribute("src"));
        v.querySelectorAll("source").forEach((s) => cands.push(s.getAttribute("src")));
      });
      el.querySelectorAll("iframe").forEach((f) => cands.push(f.getAttribute("src") || f.getAttribute("data-src")));
      for (const c of cands) {
        const v = canonicalVideo(c);
        if (v) return v;
      }
      return null;
    }
    function widgetType(w) {
      const t = w.getAttribute("data-widget_type");
      if (t) return t.split(".")[0];
      const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1]).filter((c) => c && !/__|--/.test(c));
      return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || "";
    }
    function kidsOf(node) {
      const out = [];
      const inners = [...node.children].filter((c) => c.classList.contains("e-con-inner"));
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
      if (html !== void 0) el.innerHTML = String(html).trim();
      return el;
    }
    function clean(el) {
      el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
      el.querySelectorAll("[class], [style], [id]").forEach((n) => {
        n.removeAttribute("class");
        n.removeAttribute("style");
        n.removeAttribute("id");
      });
      el.querySelectorAll("span").forEach((s) => {
        if (!s.attributes.length) s.replaceWith(...s.childNodes);
      });
      el.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
      for (let guard = 0; guard < 10; guard += 1) {
        const nested = [...el.querySelectorAll("strong > strong, b > b, em > em, i > i, u > u, sup > sup")].filter((n) => n.parentElement.childNodes.length === 1);
        if (!nested.length) break;
        nested.forEach((n) => {
          if (n.isConnected) n.replaceWith(...n.childNodes);
        });
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
      const out = doc.createElement("img");
      out.src = src;
      const alt = img.getAttribute("alt");
      if (alt) out.alt = alt;
      const p = doc.createElement("p");
      const a = keepLink ? img.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !/^#?$/.test(a.getAttribute("href"))) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        link.append(out);
        p.append(link);
      } else {
        p.append(out);
      }
      return { kind: "image", el: p, img: out };
    }
    function bgImageItem(doc, src, alt = "") {
      const img = doc.createElement("img");
      img.src = src;
      img.alt = alt;
      const p = doc.createElement("p");
      p.append(img);
      return { kind: "image", el: p, img };
    }
    function push(items, item, origin) {
      if (!item) return;
      item.origin = origin;
      items.push(item);
    }
    function stepsList(doc, c) {
      const list = doc.createElement(c.querySelector(".numero-passo img") ? "ul" : "ol");
      c.querySelectorAll(".passo-numerado").forEach((step) => {
        const body = step.querySelector(".texto-passo") || step;
        const li = doc.createElement("li");
        const h = body.querySelector("h1, h2, h3, h4, h5, h6");
        if (h) {
          li.append(make(doc, "strong", h.innerHTML));
          li.append(" ");
        }
        const ps = [...body.querySelectorAll("p")].filter((p) => norm(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm(body.textContent);
        if (norm(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm(n.textContent)) {
            run = run || doc.createElement("p");
            run.append(n.textContent.replace(/[\s\u00a0]+/g, " "));
          } else if (run) run.append(" ");
          return;
        }
        if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
        const tag = n.tagName.toUpperCase();
        if (tag === "BR") {
          if (run) run.append(doc.createElement("br"));
          return;
        }
        if (INLINE.test(tag) && !n.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section")) {
          if (n.querySelector("img") && !norm(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm(n.textContent)) return;
          run = run || doc.createElement("p");
          run.append(n.cloneNode(true));
          return;
        }
        flush();
        if (isWidget(n)) {
          widget(doc, n, items, opts);
          return;
        }
        if (isCon(n)) {
          walkContainer(doc, n, items, opts);
          return;
        }
        if (HEADING.test(tag)) {
          if (norm(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm(list.textContent)) push(items, { kind: "list", el: list }, container);
          return;
        }
        if (tag === "TABLE" || tag === "BLOCKQUOTE" || tag === "PRE") {
          push(items, { kind: "text", el: clean(n.cloneNode(true)) }, container);
          return;
        }
        if (tag === "IMG") {
          push(items, imageItem(doc, n), container);
          return;
        }
        if (n.classList.contains("secao-numeros")) {
          push(items, stepsList(doc, n), container);
          return;
        }
        flow(doc, n, items, opts);
      });
      flush();
    }
    function headingItem(doc, title, fallbackTag) {
      if (!title || !norm(title.textContent)) return null;
      const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
      const el = clean(make(doc, tag, title.innerHTML));
      const a = title.closest("a[href]");
      if (a && !el.querySelector("a")) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        while (el.firstChild) link.append(el.firstChild);
        el.append(link);
      }
      return { kind: "heading", el, sourceTag: title.tagName };
    }
    function widget(doc, w, items, opts = {}) {
      if (hidden(w)) return;
      const type = widgetType(w);
      const c = w.querySelector(":scope > .elementor-widget-container") || w;
      switch (type) {
        case "heading":
        case "theme-post-title": {
          const t = c.querySelector(".elementor-heading-title") || c.querySelector("h1, h2, h3, h4, h5, h6, p");
          push(items, headingItem(doc, t, "p"), w);
          return;
        }
        case "image":
        case "theme-post-featured-image":
          c.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
          return;
        case "button": {
          const a = c.querySelector("a.elementor-button, a[href]");
          if (!a) return;
          const text = norm((a.querySelector(".elementor-button-text") || a).textContent);
          if (!text) return;
          const p = doc.createElement("p");
          const href = a.getAttribute("href");
          if (href) {
            const link = doc.createElement("a");
            link.href = fixHref(href);
            link.textContent = text;
            p.append(link);
          } else {
            p.textContent = text;
          }
          push(items, { kind: "button", el: p }, w);
          return;
        }
        case "icon-list": {
          const ul = doc.createElement("ul");
          c.querySelectorAll(".elementor-icon-list-item").forEach((it) => {
            const text = it.querySelector(".elementor-icon-list-text") || it;
            if (!norm(text.textContent)) return;
            const li = clean(make(doc, "li", text.innerHTML));
            const a = it.querySelector("a[href]");
            if (a && !li.querySelector("a")) {
              const link = doc.createElement("a");
              link.href = fixHref(a.getAttribute("href"));
              while (li.firstChild) link.append(li.firstChild);
              li.append(link);
            }
            ul.append(li);
          });
          if (ul.children.length) push(items, { kind: "list", el: ul }, w);
          return;
        }
        case "icon-box":
        case "image-box": {
          c.querySelectorAll(".elementor-icon-box-icon img, .elementor-image-box-img img").forEach((img) => push(items, imageItem(doc, img), w));
          const title = c.querySelector(".elementor-icon-box-title, .elementor-image-box-title");
          push(items, headingItem(doc, title, "h3"), w);
          const d = c.querySelector(".elementor-icon-box-description, .elementor-image-box-description");
          if (d && norm(d.textContent)) {
            const tmp = [];
            flow(doc, d, tmp, opts);
            if (!tmp.length) tmp.push({ kind: "text", el: clean(make(doc, "p", d.innerHTML)) });
            tmp.forEach((i) => push(items, i, w));
          }
          return;
        }
        case "divider":
          if (opts.dividers) push(items, { kind: "divider", el: null }, w);
          return;
        case "spacer":
        case "icon":
        case "menu-anchor":
          return;
        case "html":
          if (c.querySelector(".passo-numerado")) {
            push(items, stepsList(doc, c), w);
            return;
          }
          if (!norm(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
      if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2 && widgetType(widgets[0]) === "icon" && ["text-editor", "heading"].includes(widgetType(widgets[1]))) {
        const tmp = [];
        widget(doc, widgets[1], tmp, opts);
        const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
        const src = bgUrl(con);
        if (src) push(items, bgImageItem(doc, src), con);
        return;
      }
      kids.forEach((k) => {
        if (isWidget(k)) widget(doc, k, items, opts);
        else if (isCon(k)) walkContainer(doc, k, items, opts);
        else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
          const tmp = [];
          flow(doc, { childNodes: [k] }, tmp, opts);
          tmp.forEach((i) => push(items, i, con));
        }
      });
    };
    function collect(doc, root, opts = {}) {
      const items = [];
      if (isWidget(root)) widget(doc, root, items, opts);
      else if (isCon(root)) walkContainer(doc, root, items, opts);
      else flow(doc, root, items, opts);
      const out = [];
      items.forEach((it) => {
        const prev = out[out.length - 1];
        if (it.kind === "li") {
          if (prev && prev.kind === "list" && prev.liRun) {
            prev.el.append(it.el);
          } else {
            const ul = make(doc, "ul");
            ul.append(it.el);
            out.push({ kind: "list", el: ul, liRun: true, origin: it.origin });
          }
          return;
        }
        if (it.kind === "list" && prev && prev.kind === "list" && prev.el.tagName === it.el.tagName) {
          prev.el.append(...it.el.children);
          return;
        }
        if (opts.groupImages !== false && it.kind === "image" && prev && prev.kind === "image" && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement && prev.origin.closest(".e-con") === it.origin.closest(".e-con")) {
          prev.el.append(" ", ...it.el.childNodes);
          prev.group = true;
          return;
        }
        out.push(it);
      });
      return out;
    }
    function shape(k) {
      const s = [];
      if (isStrictGroup(k)) s.push("group");
      if (k.querySelector("img")) s.push("img");
      if (k.querySelector("h1, h2, h3, h4, h5, h6")) s.push("h");
      if (k.querySelector(".elementor-widget-button")) s.push("btn");
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm(n.textContent));
      if (text) s.push("text");
      return s.join("+");
    }
    function sameShapeGroup(kids) {
      const by = /* @__PURE__ */ new Map();
      kids.forEach((k) => {
        const s = shape(k);
        if (!by.has(s)) by.set(s, []);
        by.get(s).push(k);
      });
      let best = null;
      by.forEach((g) => {
        if (g.length >= 2 && (!best || g.length > best.length)) best = g;
      });
      return best;
    }
    function isStrictGroup(node) {
      const kids = contentKids(node);
      if (kids.length < 2) return false;
      if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
      const g = sameShapeGroup(kids);
      return !!g && g.length === kids.length;
    }
    function findItems(node) {
      const kids = contentKids(node);
      const group = sameShapeGroup(kids);
      if (group) return group.flatMap((k) => isStrictGroup(k) ? findItems(k) : [k]);
      for (const k of kids) {
        const sub = findItems(k);
        if (sub.length >= 2) return sub;
      }
      return [];
    }
    function outside(root, items) {
      const before = [];
      const after = [];
      if (!items.length) return { before, after };
      const first = items[0];
      const walk = (node) => {
        kidsOf(node).forEach((k) => {
          if (items.includes(k) || !isEl(k)) return;
          if (items.some((it) => k.contains(it))) {
            walk(k);
            return;
          }
          if (!hasContent(k)) return;
          const isBefore = !!(k.compareDocumentPosition(first) & 4);
          (isBefore ? before : after).push(k);
        });
      };
      walk(root);
      return { before, after };
    }
    function moveOut(doc, element, chunks, where) {
      const nodes = [];
      chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => it.el && nodes.push(it.el)));
      if (!nodes.length) return;
      if (where === "before") element.before(...nodes);
      else element.after(...nodes);
    }
    function blockName(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm,
      isEl,
      isWidget,
      isCon,
      hasContent,
      fixHref,
      fixLinks,
      urlFromCss: urlFromCss2,
      settings,
      unlazy,
      imgSrc,
      bgUrl,
      videoUrl,
      canonicalVideo,
      widgetType,
      kidsOf,
      contentKids,
      make,
      clean,
      retag,
      imageItem,
      bgImageItem,
      collect,
      findItems,
      outside,
      moveOut,
      blockName,
      LEGACY_ROOTS
    };
  })();
  function parse(element, { document, options, basePath } = {}) {
    parseLanding(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/hero-video.js
  function resolveVimeoUrl(element) {
    const iframe = element.querySelector('.elementor-background-video-container iframe, iframe[src*="vimeo"]');
    const candidates = [];
    if (iframe) candidates.push(iframe.getAttribute("src") || "");
    [element, ...element.querySelectorAll("[data-settings]")].forEach((el) => {
      const raw = el.getAttribute && el.getAttribute("data-settings");
      if (!raw) return;
      try {
        const s = JSON.parse(raw);
        if (s.background_video_link) candidates.push(s.background_video_link);
      } catch (e) {
      }
    });
    for (const c of candidates) {
      const m = String(c).match(/vimeo\.com\/(?:video\/)?(\d+)/i);
      if (m) return `https://player.vimeo.com/video/${m[1]}`;
    }
    return null;
  }
  function parseLegacy(element, { document }) {
    const videoUrl = resolveVimeoUrl(element);
    const heading = element.querySelector("h1, h2, .elementor-widget-text-editor h3");
    if (!videoUrl && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (videoUrl) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = videoUrl;
      a.textContent = videoUrl;
      p.append(a);
      contentCell.push(p);
    }
    if (heading) contentCell.push(heading);
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-video", cells });
    element.replaceWith(block);
  }
  function heroCopy2(document, element) {
    const items = EL2.collect(document, element, { bgImages: true });
    const titleIdx = items.findIndex((it) => it.kind === "heading");
    const idx = titleIdx >= 0 ? titleIdx : items.findIndex((it) => it.kind === "text");
    const images = [];
    const copy = [];
    items.forEach((it, i) => {
      if (!it.el) return;
      if (it.kind === "image") {
        images.push(it.el);
        return;
      }
      if (i === idx) {
        copy.push(EL2.retag(document, it.el, "h1"));
        return;
      }
      if (it.kind === "heading") {
        copy.push(EL2.retag(document, it.el, "p"));
        return;
      }
      copy.push(it.el);
    });
    return { images, copy, hasTitle: idx >= 0 };
  }
  function parseLanding2(element, { document, options }) {
    EL2.unlazy(document);
    const video = EL2.videoUrl(element);
    const s = EL2.settings(element);
    const poster = s.background_video_fallback && s.background_video_fallback.url || EL2.bgUrl(element);
    const { images, copy, hasTitle } = heroCopy2(document, element);
    if (!video && !hasTitle) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const media = [];
    if (poster) {
      const img = document.createElement("img");
      img.src = poster;
      img.alt = "";
      media.push(img);
    }
    if (video) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = video;
      a.textContent = video;
      p.append(a);
      media.push(p);
    }
    if (media.length) cells.push([media]);
    cells.push([[...images, ...copy]]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("hero-video", options), cells });
    element.replaceWith(block);
  }
  var EL2 = (() => {
    const HEADING = /^H[1-6]$/;
    const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
    const WIDGET_TYPES = [
      "theme-post-featured-image",
      "theme-post-title",
      "text-editor",
      "heading",
      "image-box",
      "icon-box",
      "icon-list",
      "image",
      "button",
      "divider",
      "spacer",
      "icon",
      "html",
      "shortcode",
      "accordion",
      "toggle",
      "n-accordion",
      "nested-accordion",
      "n-tabs",
      "n-carousel",
      "loop-grid",
      "template",
      "video",
      "menu-anchor"
    ];
    const norm = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector("img");
    function fixHref(href) {
      if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) return href;
      const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
      return m ? `${m[1] || ""}${m[2].replace(/\/{2,}/g, "/")}${m[3]}` : href;
    }
    function fixLinks(root) {
      if (!isEl(root)) return root;
      const links = [...root.querySelectorAll("a[href]")];
      if (root.matches("a[href]")) links.unshift(root);
      links.forEach((a) => a.setAttribute("href", fixHref(a.getAttribute("href"))));
      return root;
    }
    function urlFromCss2(value) {
      if (!value) return null;
      const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
    }
    function settings(el) {
      const raw = isEl(el) ? el.getAttribute("data-settings") : null;
      if (!raw) return {};
      try {
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
    function unlazy(doc) {
      doc.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    }
    function imgSrc(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss2(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc(img) || null;
      }
      return src || null;
    }
    function canonicalVideo(raw) {
      if (!raw) return null;
      let u;
      try {
        u = new URL(raw, "https://bradescobank.com/");
      } catch (e) {
        return null;
      }
      const host = u.hostname.replace(/^www\.|^m\./, "");
      if (/(^|\.)vimeo\.com$/.test(host)) {
        const id = (u.pathname.match(/(\d{5,})/) || [])[1];
        return id ? `https://vimeo.com/${id}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/")[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
      return null;
    }
    function videoUrl(el) {
      const cands = [];
      [el, ...el.querySelectorAll("[data-settings]")].forEach((n) => {
        const s = settings(n);
        if (s.background_video_link) cands.push(s.background_video_link);
      });
      el.querySelectorAll("video").forEach((v) => {
        cands.push(v.getAttribute("src"));
        v.querySelectorAll("source").forEach((s) => cands.push(s.getAttribute("src")));
      });
      el.querySelectorAll("iframe").forEach((f) => cands.push(f.getAttribute("src") || f.getAttribute("data-src")));
      for (const c of cands) {
        const v = canonicalVideo(c);
        if (v) return v;
      }
      return null;
    }
    function widgetType(w) {
      const t = w.getAttribute("data-widget_type");
      if (t) return t.split(".")[0];
      const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1]).filter((c) => c && !/__|--/.test(c));
      return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || "";
    }
    function kidsOf(node) {
      const out = [];
      const inners = [...node.children].filter((c) => c.classList.contains("e-con-inner"));
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
      if (html !== void 0) el.innerHTML = String(html).trim();
      return el;
    }
    function clean(el) {
      el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
      el.querySelectorAll("[class], [style], [id]").forEach((n) => {
        n.removeAttribute("class");
        n.removeAttribute("style");
        n.removeAttribute("id");
      });
      el.querySelectorAll("span").forEach((s) => {
        if (!s.attributes.length) s.replaceWith(...s.childNodes);
      });
      el.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
      for (let guard = 0; guard < 10; guard += 1) {
        const nested = [...el.querySelectorAll("strong > strong, b > b, em > em, i > i, u > u, sup > sup")].filter((n) => n.parentElement.childNodes.length === 1);
        if (!nested.length) break;
        nested.forEach((n) => {
          if (n.isConnected) n.replaceWith(...n.childNodes);
        });
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
      const out = doc.createElement("img");
      out.src = src;
      const alt = img.getAttribute("alt");
      if (alt) out.alt = alt;
      const p = doc.createElement("p");
      const a = keepLink ? img.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !/^#?$/.test(a.getAttribute("href"))) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        link.append(out);
        p.append(link);
      } else {
        p.append(out);
      }
      return { kind: "image", el: p, img: out };
    }
    function bgImageItem(doc, src, alt = "") {
      const img = doc.createElement("img");
      img.src = src;
      img.alt = alt;
      const p = doc.createElement("p");
      p.append(img);
      return { kind: "image", el: p, img };
    }
    function push(items, item, origin) {
      if (!item) return;
      item.origin = origin;
      items.push(item);
    }
    function stepsList(doc, c) {
      const list = doc.createElement(c.querySelector(".numero-passo img") ? "ul" : "ol");
      c.querySelectorAll(".passo-numerado").forEach((step) => {
        const body = step.querySelector(".texto-passo") || step;
        const li = doc.createElement("li");
        const h = body.querySelector("h1, h2, h3, h4, h5, h6");
        if (h) {
          li.append(make(doc, "strong", h.innerHTML));
          li.append(" ");
        }
        const ps = [...body.querySelectorAll("p")].filter((p) => norm(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm(body.textContent);
        if (norm(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm(n.textContent)) {
            run = run || doc.createElement("p");
            run.append(n.textContent.replace(/[\s\u00a0]+/g, " "));
          } else if (run) run.append(" ");
          return;
        }
        if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
        const tag = n.tagName.toUpperCase();
        if (tag === "BR") {
          if (run) run.append(doc.createElement("br"));
          return;
        }
        if (INLINE.test(tag) && !n.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section")) {
          if (n.querySelector("img") && !norm(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm(n.textContent)) return;
          run = run || doc.createElement("p");
          run.append(n.cloneNode(true));
          return;
        }
        flush();
        if (isWidget(n)) {
          widget(doc, n, items, opts);
          return;
        }
        if (isCon(n)) {
          walkContainer(doc, n, items, opts);
          return;
        }
        if (HEADING.test(tag)) {
          if (norm(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm(list.textContent)) push(items, { kind: "list", el: list }, container);
          return;
        }
        if (tag === "TABLE" || tag === "BLOCKQUOTE" || tag === "PRE") {
          push(items, { kind: "text", el: clean(n.cloneNode(true)) }, container);
          return;
        }
        if (tag === "IMG") {
          push(items, imageItem(doc, n), container);
          return;
        }
        if (n.classList.contains("secao-numeros")) {
          push(items, stepsList(doc, n), container);
          return;
        }
        flow(doc, n, items, opts);
      });
      flush();
    }
    function headingItem(doc, title, fallbackTag) {
      if (!title || !norm(title.textContent)) return null;
      const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
      const el = clean(make(doc, tag, title.innerHTML));
      const a = title.closest("a[href]");
      if (a && !el.querySelector("a")) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        while (el.firstChild) link.append(el.firstChild);
        el.append(link);
      }
      return { kind: "heading", el, sourceTag: title.tagName };
    }
    function widget(doc, w, items, opts = {}) {
      if (hidden(w)) return;
      const type = widgetType(w);
      const c = w.querySelector(":scope > .elementor-widget-container") || w;
      switch (type) {
        case "heading":
        case "theme-post-title": {
          const t = c.querySelector(".elementor-heading-title") || c.querySelector("h1, h2, h3, h4, h5, h6, p");
          push(items, headingItem(doc, t, "p"), w);
          return;
        }
        case "image":
        case "theme-post-featured-image":
          c.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
          return;
        case "button": {
          const a = c.querySelector("a.elementor-button, a[href]");
          if (!a) return;
          const text = norm((a.querySelector(".elementor-button-text") || a).textContent);
          if (!text) return;
          const p = doc.createElement("p");
          const href = a.getAttribute("href");
          if (href) {
            const link = doc.createElement("a");
            link.href = fixHref(href);
            link.textContent = text;
            p.append(link);
          } else {
            p.textContent = text;
          }
          push(items, { kind: "button", el: p }, w);
          return;
        }
        case "icon-list": {
          const ul = doc.createElement("ul");
          c.querySelectorAll(".elementor-icon-list-item").forEach((it) => {
            const text = it.querySelector(".elementor-icon-list-text") || it;
            if (!norm(text.textContent)) return;
            const li = clean(make(doc, "li", text.innerHTML));
            const a = it.querySelector("a[href]");
            if (a && !li.querySelector("a")) {
              const link = doc.createElement("a");
              link.href = fixHref(a.getAttribute("href"));
              while (li.firstChild) link.append(li.firstChild);
              li.append(link);
            }
            ul.append(li);
          });
          if (ul.children.length) push(items, { kind: "list", el: ul }, w);
          return;
        }
        case "icon-box":
        case "image-box": {
          c.querySelectorAll(".elementor-icon-box-icon img, .elementor-image-box-img img").forEach((img) => push(items, imageItem(doc, img), w));
          const title = c.querySelector(".elementor-icon-box-title, .elementor-image-box-title");
          push(items, headingItem(doc, title, "h3"), w);
          const d = c.querySelector(".elementor-icon-box-description, .elementor-image-box-description");
          if (d && norm(d.textContent)) {
            const tmp = [];
            flow(doc, d, tmp, opts);
            if (!tmp.length) tmp.push({ kind: "text", el: clean(make(doc, "p", d.innerHTML)) });
            tmp.forEach((i) => push(items, i, w));
          }
          return;
        }
        case "divider":
          if (opts.dividers) push(items, { kind: "divider", el: null }, w);
          return;
        case "spacer":
        case "icon":
        case "menu-anchor":
          return;
        case "html":
          if (c.querySelector(".passo-numerado")) {
            push(items, stepsList(doc, c), w);
            return;
          }
          if (!norm(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
      if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2 && widgetType(widgets[0]) === "icon" && ["text-editor", "heading"].includes(widgetType(widgets[1]))) {
        const tmp = [];
        widget(doc, widgets[1], tmp, opts);
        const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
        const src = bgUrl(con);
        if (src) push(items, bgImageItem(doc, src), con);
        return;
      }
      kids.forEach((k) => {
        if (isWidget(k)) widget(doc, k, items, opts);
        else if (isCon(k)) walkContainer(doc, k, items, opts);
        else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
          const tmp = [];
          flow(doc, { childNodes: [k] }, tmp, opts);
          tmp.forEach((i) => push(items, i, con));
        }
      });
    };
    function collect(doc, root, opts = {}) {
      const items = [];
      if (isWidget(root)) widget(doc, root, items, opts);
      else if (isCon(root)) walkContainer(doc, root, items, opts);
      else flow(doc, root, items, opts);
      const out = [];
      items.forEach((it) => {
        const prev = out[out.length - 1];
        if (it.kind === "li") {
          if (prev && prev.kind === "list" && prev.liRun) {
            prev.el.append(it.el);
          } else {
            const ul = make(doc, "ul");
            ul.append(it.el);
            out.push({ kind: "list", el: ul, liRun: true, origin: it.origin });
          }
          return;
        }
        if (it.kind === "list" && prev && prev.kind === "list" && prev.el.tagName === it.el.tagName) {
          prev.el.append(...it.el.children);
          return;
        }
        if (opts.groupImages !== false && it.kind === "image" && prev && prev.kind === "image" && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement && prev.origin.closest(".e-con") === it.origin.closest(".e-con")) {
          prev.el.append(" ", ...it.el.childNodes);
          prev.group = true;
          return;
        }
        out.push(it);
      });
      return out;
    }
    function shape(k) {
      const s = [];
      if (isStrictGroup(k)) s.push("group");
      if (k.querySelector("img")) s.push("img");
      if (k.querySelector("h1, h2, h3, h4, h5, h6")) s.push("h");
      if (k.querySelector(".elementor-widget-button")) s.push("btn");
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm(n.textContent));
      if (text) s.push("text");
      return s.join("+");
    }
    function sameShapeGroup(kids) {
      const by = /* @__PURE__ */ new Map();
      kids.forEach((k) => {
        const s = shape(k);
        if (!by.has(s)) by.set(s, []);
        by.get(s).push(k);
      });
      let best = null;
      by.forEach((g) => {
        if (g.length >= 2 && (!best || g.length > best.length)) best = g;
      });
      return best;
    }
    function isStrictGroup(node) {
      const kids = contentKids(node);
      if (kids.length < 2) return false;
      if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
      const g = sameShapeGroup(kids);
      return !!g && g.length === kids.length;
    }
    function findItems(node) {
      const kids = contentKids(node);
      const group = sameShapeGroup(kids);
      if (group) return group.flatMap((k) => isStrictGroup(k) ? findItems(k) : [k]);
      for (const k of kids) {
        const sub = findItems(k);
        if (sub.length >= 2) return sub;
      }
      return [];
    }
    function outside(root, items) {
      const before = [];
      const after = [];
      if (!items.length) return { before, after };
      const first = items[0];
      const walk = (node) => {
        kidsOf(node).forEach((k) => {
          if (items.includes(k) || !isEl(k)) return;
          if (items.some((it) => k.contains(it))) {
            walk(k);
            return;
          }
          if (!hasContent(k)) return;
          const isBefore = !!(k.compareDocumentPosition(first) & 4);
          (isBefore ? before : after).push(k);
        });
      };
      walk(root);
      return { before, after };
    }
    function moveOut(doc, element, chunks, where) {
      const nodes = [];
      chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => it.el && nodes.push(it.el)));
      if (!nodes.length) return;
      if (where === "before") element.before(...nodes);
      else element.after(...nodes);
    }
    function blockName(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm,
      isEl,
      isWidget,
      isCon,
      hasContent,
      fixHref,
      fixLinks,
      urlFromCss: urlFromCss2,
      settings,
      unlazy,
      imgSrc,
      bgUrl,
      videoUrl,
      canonicalVideo,
      widgetType,
      kidsOf,
      contentKids,
      make,
      clean,
      retag,
      imageItem,
      bgImageItem,
      collect,
      findItems,
      outside,
      moveOut,
      blockName,
      LEGACY_ROOTS
    };
  })();
  function parse2(element, { document, options, basePath } = {}) {
    if (element.closest(EL2.LEGACY_ROOTS)) {
      parseLegacy(element, { document });
      return;
    }
    parseLanding2(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/hero-promo.js
  var FALLBACK_BG = {
    f4e421d: "https://bradescobank.com/wp-content/uploads/2024/10/bg-Exclusive-1.jpg"
  };
  function urlFromCss(value) {
    if (!value) return null;
    const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m && !/^data:/i.test(m[1]) ? m[1] : null;
  }
  function resolveBackground(element) {
    const img = element.querySelector(":scope > img");
    if (img) return img.getAttribute("data-src") || img.getAttribute("src");
    let src = urlFromCss(element.getAttribute("style"));
    if (!src) {
      try {
        const view = element.ownerDocument && element.ownerDocument.defaultView;
        if (view && view.getComputedStyle) src = urlFromCss(view.getComputedStyle(element).backgroundImage);
      } catch (e) {
      }
    }
    if (!src) {
      const id = element.getAttribute("data-id") || ([...element.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c)) || "").replace("elementor-element-", "");
      src = FALLBACK_BG[id] || null;
    }
    return src;
  }
  function parseLegacy2(element, { document }) {
    const heading = element.querySelector("h1, h2, h3, h4");
    const description = [...element.querySelectorAll(".elementor-widget-text-editor p")].find((p) => p.textContent.trim());
    const ctaLink = element.querySelector(".elementor-widget-button a[href], a.elementor-button[href]");
    if (!heading && !description) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let imageCell = "";
    const bg = resolveBackground(element);
    if (bg) {
      imageCell = document.createElement("img");
      imageCell.src = bg;
      imageCell.alt = heading ? heading.innerHTML.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "";
    }
    const contentCell = [];
    if (heading) {
      const h3 = document.createElement("h3");
      h3.innerHTML = heading.innerHTML.trim();
      contentCell.push(h3);
    }
    if (description) contentCell.push(description);
    if (ctaLink) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = ctaLink.getAttribute("href");
      a.textContent = (ctaLink.textContent || "").replace(/\s+/g, " ").trim();
      p.append(a);
      contentCell.push(p);
    }
    const cells = [[imageCell, contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-promo", cells });
    element.replaceWith(block);
  }
  function promoBadge(document, element) {
    const prev = element.previousElementSibling;
    if (!prev || !EL3.isCon(prev)) return [];
    const boxes = [...prev.querySelectorAll(".elementor-widget-icon-box")];
    if (boxes.length !== 1 || EL3.norm(boxes[0].textContent) !== EL3.norm(prev.textContent)) return [];
    const items = EL3.collect(document, boxes[0]).filter((it) => it.el && it.kind !== "image");
    const holder = boxes[0].closest(".e-con") || boxes[0];
    (holder === prev ? boxes[0] : holder).remove();
    return items;
  }
  function parseLanding3(element, { document, options }) {
    EL3.unlazy(document);
    let bg = EL3.bgUrl(element);
    if (!bg) {
      const holder = [...element.querySelectorAll(".e-con")].find((c) => EL3.hasContent(c) && EL3.bgUrl(c));
      if (holder) bg = EL3.bgUrl(holder);
    }
    const items = [...promoBadge(document, element), ...EL3.collect(document, element, { bgImages: false })].filter((it) => it.el);
    let titleIdx = items.findIndex((it) => it.kind === "heading");
    if (titleIdx < 0) {
      const first = items.findIndex((it) => it.kind === "text");
      if (first >= 0 && EL3.norm(items[first].el.textContent).length <= 40) {
        items[first] = __spreadProps(__spreadValues({}, items[first]), { kind: "heading", el: EL3.retag(document, items[first].el, options.includes("card") ? "h3" : "h2") });
        titleIdx = first;
      }
    }
    const content = items.map((it, i) => {
      if (i === titleIdx) return it.el.tagName === "H1" ? EL3.retag(document, it.el, "h2") : it.el;
      if (it.kind === "heading") return EL3.retag(document, it.el, "p");
      return it.el;
    });
    if (!content.length && !bg) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let imageCell = "";
    if (bg) {
      imageCell = document.createElement("img");
      imageCell.src = bg;
      const title = items[titleIdx];
      imageCell.alt = title ? EL3.norm(title.el.textContent) : "";
    }
    const cells = [[imageCell, content]];
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("hero-promo", options), cells });
    element.replaceWith(block);
  }
  var EL3 = (() => {
    const HEADING = /^H[1-6]$/;
    const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
    const WIDGET_TYPES = [
      "theme-post-featured-image",
      "theme-post-title",
      "text-editor",
      "heading",
      "image-box",
      "icon-box",
      "icon-list",
      "image",
      "button",
      "divider",
      "spacer",
      "icon",
      "html",
      "shortcode",
      "accordion",
      "toggle",
      "n-accordion",
      "nested-accordion",
      "n-tabs",
      "n-carousel",
      "loop-grid",
      "template",
      "video",
      "menu-anchor"
    ];
    const norm = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector("img");
    function fixHref(href) {
      if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) return href;
      const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
      return m ? `${m[1] || ""}${m[2].replace(/\/{2,}/g, "/")}${m[3]}` : href;
    }
    function fixLinks(root) {
      if (!isEl(root)) return root;
      const links = [...root.querySelectorAll("a[href]")];
      if (root.matches("a[href]")) links.unshift(root);
      links.forEach((a) => a.setAttribute("href", fixHref(a.getAttribute("href"))));
      return root;
    }
    function urlFromCss2(value) {
      if (!value) return null;
      const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
    }
    function settings(el) {
      const raw = isEl(el) ? el.getAttribute("data-settings") : null;
      if (!raw) return {};
      try {
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
    function unlazy(doc) {
      doc.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    }
    function imgSrc(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss2(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc(img) || null;
      }
      return src || null;
    }
    function canonicalVideo(raw) {
      if (!raw) return null;
      let u;
      try {
        u = new URL(raw, "https://bradescobank.com/");
      } catch (e) {
        return null;
      }
      const host = u.hostname.replace(/^www\.|^m\./, "");
      if (/(^|\.)vimeo\.com$/.test(host)) {
        const id = (u.pathname.match(/(\d{5,})/) || [])[1];
        return id ? `https://vimeo.com/${id}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/")[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
      return null;
    }
    function videoUrl(el) {
      const cands = [];
      [el, ...el.querySelectorAll("[data-settings]")].forEach((n) => {
        const s = settings(n);
        if (s.background_video_link) cands.push(s.background_video_link);
      });
      el.querySelectorAll("video").forEach((v) => {
        cands.push(v.getAttribute("src"));
        v.querySelectorAll("source").forEach((s) => cands.push(s.getAttribute("src")));
      });
      el.querySelectorAll("iframe").forEach((f) => cands.push(f.getAttribute("src") || f.getAttribute("data-src")));
      for (const c of cands) {
        const v = canonicalVideo(c);
        if (v) return v;
      }
      return null;
    }
    function widgetType(w) {
      const t = w.getAttribute("data-widget_type");
      if (t) return t.split(".")[0];
      const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1]).filter((c) => c && !/__|--/.test(c));
      return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || "";
    }
    function kidsOf(node) {
      const out = [];
      const inners = [...node.children].filter((c) => c.classList.contains("e-con-inner"));
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
      if (html !== void 0) el.innerHTML = String(html).trim();
      return el;
    }
    function clean(el) {
      el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
      el.querySelectorAll("[class], [style], [id]").forEach((n) => {
        n.removeAttribute("class");
        n.removeAttribute("style");
        n.removeAttribute("id");
      });
      el.querySelectorAll("span").forEach((s) => {
        if (!s.attributes.length) s.replaceWith(...s.childNodes);
      });
      el.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
      for (let guard = 0; guard < 10; guard += 1) {
        const nested = [...el.querySelectorAll("strong > strong, b > b, em > em, i > i, u > u, sup > sup")].filter((n) => n.parentElement.childNodes.length === 1);
        if (!nested.length) break;
        nested.forEach((n) => {
          if (n.isConnected) n.replaceWith(...n.childNodes);
        });
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
      const out = doc.createElement("img");
      out.src = src;
      const alt = img.getAttribute("alt");
      if (alt) out.alt = alt;
      const p = doc.createElement("p");
      const a = keepLink ? img.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !/^#?$/.test(a.getAttribute("href"))) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        link.append(out);
        p.append(link);
      } else {
        p.append(out);
      }
      return { kind: "image", el: p, img: out };
    }
    function bgImageItem(doc, src, alt = "") {
      const img = doc.createElement("img");
      img.src = src;
      img.alt = alt;
      const p = doc.createElement("p");
      p.append(img);
      return { kind: "image", el: p, img };
    }
    function push(items, item, origin) {
      if (!item) return;
      item.origin = origin;
      items.push(item);
    }
    function stepsList(doc, c) {
      const list = doc.createElement(c.querySelector(".numero-passo img") ? "ul" : "ol");
      c.querySelectorAll(".passo-numerado").forEach((step) => {
        const body = step.querySelector(".texto-passo") || step;
        const li = doc.createElement("li");
        const h = body.querySelector("h1, h2, h3, h4, h5, h6");
        if (h) {
          li.append(make(doc, "strong", h.innerHTML));
          li.append(" ");
        }
        const ps = [...body.querySelectorAll("p")].filter((p) => norm(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm(body.textContent);
        if (norm(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm(n.textContent)) {
            run = run || doc.createElement("p");
            run.append(n.textContent.replace(/[\s\u00a0]+/g, " "));
          } else if (run) run.append(" ");
          return;
        }
        if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
        const tag = n.tagName.toUpperCase();
        if (tag === "BR") {
          if (run) run.append(doc.createElement("br"));
          return;
        }
        if (INLINE.test(tag) && !n.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section")) {
          if (n.querySelector("img") && !norm(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm(n.textContent)) return;
          run = run || doc.createElement("p");
          run.append(n.cloneNode(true));
          return;
        }
        flush();
        if (isWidget(n)) {
          widget(doc, n, items, opts);
          return;
        }
        if (isCon(n)) {
          walkContainer(doc, n, items, opts);
          return;
        }
        if (HEADING.test(tag)) {
          if (norm(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm(list.textContent)) push(items, { kind: "list", el: list }, container);
          return;
        }
        if (tag === "TABLE" || tag === "BLOCKQUOTE" || tag === "PRE") {
          push(items, { kind: "text", el: clean(n.cloneNode(true)) }, container);
          return;
        }
        if (tag === "IMG") {
          push(items, imageItem(doc, n), container);
          return;
        }
        if (n.classList.contains("secao-numeros")) {
          push(items, stepsList(doc, n), container);
          return;
        }
        flow(doc, n, items, opts);
      });
      flush();
    }
    function headingItem(doc, title, fallbackTag) {
      if (!title || !norm(title.textContent)) return null;
      const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
      const el = clean(make(doc, tag, title.innerHTML));
      const a = title.closest("a[href]");
      if (a && !el.querySelector("a")) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        while (el.firstChild) link.append(el.firstChild);
        el.append(link);
      }
      return { kind: "heading", el, sourceTag: title.tagName };
    }
    function widget(doc, w, items, opts = {}) {
      if (hidden(w)) return;
      const type = widgetType(w);
      const c = w.querySelector(":scope > .elementor-widget-container") || w;
      switch (type) {
        case "heading":
        case "theme-post-title": {
          const t = c.querySelector(".elementor-heading-title") || c.querySelector("h1, h2, h3, h4, h5, h6, p");
          push(items, headingItem(doc, t, "p"), w);
          return;
        }
        case "image":
        case "theme-post-featured-image":
          c.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
          return;
        case "button": {
          const a = c.querySelector("a.elementor-button, a[href]");
          if (!a) return;
          const text = norm((a.querySelector(".elementor-button-text") || a).textContent);
          if (!text) return;
          const p = doc.createElement("p");
          const href = a.getAttribute("href");
          if (href) {
            const link = doc.createElement("a");
            link.href = fixHref(href);
            link.textContent = text;
            p.append(link);
          } else {
            p.textContent = text;
          }
          push(items, { kind: "button", el: p }, w);
          return;
        }
        case "icon-list": {
          const ul = doc.createElement("ul");
          c.querySelectorAll(".elementor-icon-list-item").forEach((it) => {
            const text = it.querySelector(".elementor-icon-list-text") || it;
            if (!norm(text.textContent)) return;
            const li = clean(make(doc, "li", text.innerHTML));
            const a = it.querySelector("a[href]");
            if (a && !li.querySelector("a")) {
              const link = doc.createElement("a");
              link.href = fixHref(a.getAttribute("href"));
              while (li.firstChild) link.append(li.firstChild);
              li.append(link);
            }
            ul.append(li);
          });
          if (ul.children.length) push(items, { kind: "list", el: ul }, w);
          return;
        }
        case "icon-box":
        case "image-box": {
          c.querySelectorAll(".elementor-icon-box-icon img, .elementor-image-box-img img").forEach((img) => push(items, imageItem(doc, img), w));
          const title = c.querySelector(".elementor-icon-box-title, .elementor-image-box-title");
          push(items, headingItem(doc, title, "h3"), w);
          const d = c.querySelector(".elementor-icon-box-description, .elementor-image-box-description");
          if (d && norm(d.textContent)) {
            const tmp = [];
            flow(doc, d, tmp, opts);
            if (!tmp.length) tmp.push({ kind: "text", el: clean(make(doc, "p", d.innerHTML)) });
            tmp.forEach((i) => push(items, i, w));
          }
          return;
        }
        case "divider":
          if (opts.dividers) push(items, { kind: "divider", el: null }, w);
          return;
        case "spacer":
        case "icon":
        case "menu-anchor":
          return;
        case "html":
          if (c.querySelector(".passo-numerado")) {
            push(items, stepsList(doc, c), w);
            return;
          }
          if (!norm(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
      if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2 && widgetType(widgets[0]) === "icon" && ["text-editor", "heading"].includes(widgetType(widgets[1]))) {
        const tmp = [];
        widget(doc, widgets[1], tmp, opts);
        const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
        const src = bgUrl(con);
        if (src) push(items, bgImageItem(doc, src), con);
        return;
      }
      kids.forEach((k) => {
        if (isWidget(k)) widget(doc, k, items, opts);
        else if (isCon(k)) walkContainer(doc, k, items, opts);
        else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
          const tmp = [];
          flow(doc, { childNodes: [k] }, tmp, opts);
          tmp.forEach((i) => push(items, i, con));
        }
      });
    };
    function collect(doc, root, opts = {}) {
      const items = [];
      if (isWidget(root)) widget(doc, root, items, opts);
      else if (isCon(root)) walkContainer(doc, root, items, opts);
      else flow(doc, root, items, opts);
      const out = [];
      items.forEach((it) => {
        const prev = out[out.length - 1];
        if (it.kind === "li") {
          if (prev && prev.kind === "list" && prev.liRun) {
            prev.el.append(it.el);
          } else {
            const ul = make(doc, "ul");
            ul.append(it.el);
            out.push({ kind: "list", el: ul, liRun: true, origin: it.origin });
          }
          return;
        }
        if (it.kind === "list" && prev && prev.kind === "list" && prev.el.tagName === it.el.tagName) {
          prev.el.append(...it.el.children);
          return;
        }
        if (opts.groupImages !== false && it.kind === "image" && prev && prev.kind === "image" && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement && prev.origin.closest(".e-con") === it.origin.closest(".e-con")) {
          prev.el.append(" ", ...it.el.childNodes);
          prev.group = true;
          return;
        }
        out.push(it);
      });
      return out;
    }
    function shape(k) {
      const s = [];
      if (isStrictGroup(k)) s.push("group");
      if (k.querySelector("img")) s.push("img");
      if (k.querySelector("h1, h2, h3, h4, h5, h6")) s.push("h");
      if (k.querySelector(".elementor-widget-button")) s.push("btn");
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm(n.textContent));
      if (text) s.push("text");
      return s.join("+");
    }
    function sameShapeGroup(kids) {
      const by = /* @__PURE__ */ new Map();
      kids.forEach((k) => {
        const s = shape(k);
        if (!by.has(s)) by.set(s, []);
        by.get(s).push(k);
      });
      let best = null;
      by.forEach((g) => {
        if (g.length >= 2 && (!best || g.length > best.length)) best = g;
      });
      return best;
    }
    function isStrictGroup(node) {
      const kids = contentKids(node);
      if (kids.length < 2) return false;
      if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
      const g = sameShapeGroup(kids);
      return !!g && g.length === kids.length;
    }
    function findItems(node) {
      const kids = contentKids(node);
      const group = sameShapeGroup(kids);
      if (group) return group.flatMap((k) => isStrictGroup(k) ? findItems(k) : [k]);
      for (const k of kids) {
        const sub = findItems(k);
        if (sub.length >= 2) return sub;
      }
      return [];
    }
    function outside(root, items) {
      const before = [];
      const after = [];
      if (!items.length) return { before, after };
      const first = items[0];
      const walk = (node) => {
        kidsOf(node).forEach((k) => {
          if (items.includes(k) || !isEl(k)) return;
          if (items.some((it) => k.contains(it))) {
            walk(k);
            return;
          }
          if (!hasContent(k)) return;
          const isBefore = !!(k.compareDocumentPosition(first) & 4);
          (isBefore ? before : after).push(k);
        });
      };
      walk(root);
      return { before, after };
    }
    function moveOut(doc, element, chunks, where) {
      const nodes = [];
      chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => it.el && nodes.push(it.el)));
      if (!nodes.length) return;
      if (where === "before") element.before(...nodes);
      else element.after(...nodes);
    }
    function blockName(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm,
      isEl,
      isWidget,
      isCon,
      hasContent,
      fixHref,
      fixLinks,
      urlFromCss: urlFromCss2,
      settings,
      unlazy,
      imgSrc,
      bgUrl,
      videoUrl,
      canonicalVideo,
      widgetType,
      kidsOf,
      contentKids,
      make,
      clean,
      retag,
      imageItem,
      bgImageItem,
      collect,
      findItems,
      outside,
      moveOut,
      blockName,
      LEGACY_ROOTS
    };
  })();
  function parse3(element, { document, options, basePath } = {}) {
    if (element.closest(EL3.LEGACY_ROOTS)) {
      parseLegacy2(element, { document });
      return;
    }
    parseLanding3(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/columns-media.js
  function columnsOf(element) {
    let node = element;
    for (let i = 0; i < 6; i += 1) {
      const all = EL4.kidsOf(node).filter((k) => EL4.isCon(k) || EL4.isWidget(k));
      const kids = all.filter((k) => EL4.hasContent(k) || EL4.isCon(k) && EL4.bgUrl(k));
      if (kids.length === 1 && all.length === 1 && EL4.isCon(kids[0])) {
        node = kids[0];
        continue;
      }
      return kids;
    }
    return [node];
  }
  function stepsFromHeadings(document, items) {
    const ol = document.createElement("ol");
    let li = null;
    items.forEach((it) => {
      if (it.kind === "heading") {
        li = document.createElement("li");
        li.append(EL4.make(document, "strong", it.el.innerHTML), " ");
        ol.append(li);
      } else if (li && it.kind === "text") {
        if (li.childNodes.length > 2) li.append(document.createElement("br"));
        li.append(...EL4.make(document, "span", it.el.innerHTML).childNodes);
      }
    });
    return ol;
  }
  function textCell(document, items, options, bandHasHeading) {
    let out = items.filter((it) => it.el);
    const headings = out.filter((it) => it.kind === "heading");
    if (options.includes("steps") && headings.length >= 2 && !out.some((it) => it.kind === "list") && out.every((it) => it.kind === "heading" || it.kind === "text")) {
      return [stepsFromHeadings(document, out)];
    }
    if (!bandHasHeading) {
      const texts = out.filter((it) => it.kind === "text");
      const pairs = texts.length >= 4 && texts.length % 2 === 0 && texts.length === out.length && texts.every((it, i) => i % 2 === 0 === EL4.norm(it.el.textContent).length <= 60);
      if (pairs) {
        out = out.map((it, i) => i % 2 === 0 ? __spreadProps(__spreadValues({}, it), { el: EL4.retag(document, it.el, "h3") }) : it);
      } else if (texts.length && texts[0] === out[0]) {
        out = [__spreadProps(__spreadValues({}, out[0]), { el: EL4.retag(document, out[0].el, "h2") }), ...out.slice(1)];
      }
    }
    return out.map((it) => it.el);
  }
  function parseLanding4(element, { document, options }) {
    EL4.unlazy(document);
    const cols = columnsOf(element);
    const images = [];
    const texts = [];
    cols.forEach((col) => {
      const items = EL4.collect(document, col, { bgImages: true }).filter((it) => it.el);
      if (!items.length) {
        const src = EL4.isCon(col) ? EL4.bgUrl(col) : null;
        if (src) images.push([EL4.bgImageItem(document, src).el]);
        return;
      }
      if (items.every((it) => it.kind === "image")) {
        images.push(items.map((it) => it.el));
        return;
      }
      texts.push(items);
    });
    const bandHasHeading = texts.some((items) => items.some((it) => it.kind === "heading"));
    const textCells = texts.map((items, i) => textCell(document, items, options, bandHasHeading || i > 0));
    const row = [...images, ...textCells];
    if (!row.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL4.blockName("columns-media", options), cells: [row] });
    element.replaceWith(block);
  }
  var EL4 = (() => {
    const HEADING = /^H[1-6]$/;
    const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
    const WIDGET_TYPES = [
      "theme-post-featured-image",
      "theme-post-title",
      "text-editor",
      "heading",
      "image-box",
      "icon-box",
      "icon-list",
      "image",
      "button",
      "divider",
      "spacer",
      "icon",
      "html",
      "shortcode",
      "accordion",
      "toggle",
      "n-accordion",
      "nested-accordion",
      "n-tabs",
      "n-carousel",
      "loop-grid",
      "template",
      "video",
      "menu-anchor"
    ];
    const norm = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector("img");
    function fixHref(href) {
      if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) return href;
      const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
      return m ? `${m[1] || ""}${m[2].replace(/\/{2,}/g, "/")}${m[3]}` : href;
    }
    function fixLinks(root) {
      if (!isEl(root)) return root;
      const links = [...root.querySelectorAll("a[href]")];
      if (root.matches("a[href]")) links.unshift(root);
      links.forEach((a) => a.setAttribute("href", fixHref(a.getAttribute("href"))));
      return root;
    }
    function urlFromCss2(value) {
      if (!value) return null;
      const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
    }
    function settings(el) {
      const raw = isEl(el) ? el.getAttribute("data-settings") : null;
      if (!raw) return {};
      try {
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
    function unlazy(doc) {
      doc.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    }
    function imgSrc(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss2(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc(img) || null;
      }
      return src || null;
    }
    function canonicalVideo(raw) {
      if (!raw) return null;
      let u;
      try {
        u = new URL(raw, "https://bradescobank.com/");
      } catch (e) {
        return null;
      }
      const host = u.hostname.replace(/^www\.|^m\./, "");
      if (/(^|\.)vimeo\.com$/.test(host)) {
        const id = (u.pathname.match(/(\d{5,})/) || [])[1];
        return id ? `https://vimeo.com/${id}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/")[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
      return null;
    }
    function videoUrl(el) {
      const cands = [];
      [el, ...el.querySelectorAll("[data-settings]")].forEach((n) => {
        const s = settings(n);
        if (s.background_video_link) cands.push(s.background_video_link);
      });
      el.querySelectorAll("video").forEach((v) => {
        cands.push(v.getAttribute("src"));
        v.querySelectorAll("source").forEach((s) => cands.push(s.getAttribute("src")));
      });
      el.querySelectorAll("iframe").forEach((f) => cands.push(f.getAttribute("src") || f.getAttribute("data-src")));
      for (const c of cands) {
        const v = canonicalVideo(c);
        if (v) return v;
      }
      return null;
    }
    function widgetType(w) {
      const t = w.getAttribute("data-widget_type");
      if (t) return t.split(".")[0];
      const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1]).filter((c) => c && !/__|--/.test(c));
      return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || "";
    }
    function kidsOf(node) {
      const out = [];
      const inners = [...node.children].filter((c) => c.classList.contains("e-con-inner"));
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
      if (html !== void 0) el.innerHTML = String(html).trim();
      return el;
    }
    function clean(el) {
      el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
      el.querySelectorAll("[class], [style], [id]").forEach((n) => {
        n.removeAttribute("class");
        n.removeAttribute("style");
        n.removeAttribute("id");
      });
      el.querySelectorAll("span").forEach((s) => {
        if (!s.attributes.length) s.replaceWith(...s.childNodes);
      });
      el.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
      for (let guard = 0; guard < 10; guard += 1) {
        const nested = [...el.querySelectorAll("strong > strong, b > b, em > em, i > i, u > u, sup > sup")].filter((n) => n.parentElement.childNodes.length === 1);
        if (!nested.length) break;
        nested.forEach((n) => {
          if (n.isConnected) n.replaceWith(...n.childNodes);
        });
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
      const out = doc.createElement("img");
      out.src = src;
      const alt = img.getAttribute("alt");
      if (alt) out.alt = alt;
      const p = doc.createElement("p");
      const a = keepLink ? img.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !/^#?$/.test(a.getAttribute("href"))) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        link.append(out);
        p.append(link);
      } else {
        p.append(out);
      }
      return { kind: "image", el: p, img: out };
    }
    function bgImageItem(doc, src, alt = "") {
      const img = doc.createElement("img");
      img.src = src;
      img.alt = alt;
      const p = doc.createElement("p");
      p.append(img);
      return { kind: "image", el: p, img };
    }
    function push(items, item, origin) {
      if (!item) return;
      item.origin = origin;
      items.push(item);
    }
    function stepsList(doc, c) {
      const list = doc.createElement(c.querySelector(".numero-passo img") ? "ul" : "ol");
      c.querySelectorAll(".passo-numerado").forEach((step) => {
        const body = step.querySelector(".texto-passo") || step;
        const li = doc.createElement("li");
        const h = body.querySelector("h1, h2, h3, h4, h5, h6");
        if (h) {
          li.append(make(doc, "strong", h.innerHTML));
          li.append(" ");
        }
        const ps = [...body.querySelectorAll("p")].filter((p) => norm(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm(body.textContent);
        if (norm(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm(n.textContent)) {
            run = run || doc.createElement("p");
            run.append(n.textContent.replace(/[\s\u00a0]+/g, " "));
          } else if (run) run.append(" ");
          return;
        }
        if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
        const tag = n.tagName.toUpperCase();
        if (tag === "BR") {
          if (run) run.append(doc.createElement("br"));
          return;
        }
        if (INLINE.test(tag) && !n.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section")) {
          if (n.querySelector("img") && !norm(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm(n.textContent)) return;
          run = run || doc.createElement("p");
          run.append(n.cloneNode(true));
          return;
        }
        flush();
        if (isWidget(n)) {
          widget(doc, n, items, opts);
          return;
        }
        if (isCon(n)) {
          walkContainer(doc, n, items, opts);
          return;
        }
        if (HEADING.test(tag)) {
          if (norm(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm(list.textContent)) push(items, { kind: "list", el: list }, container);
          return;
        }
        if (tag === "TABLE" || tag === "BLOCKQUOTE" || tag === "PRE") {
          push(items, { kind: "text", el: clean(n.cloneNode(true)) }, container);
          return;
        }
        if (tag === "IMG") {
          push(items, imageItem(doc, n), container);
          return;
        }
        if (n.classList.contains("secao-numeros")) {
          push(items, stepsList(doc, n), container);
          return;
        }
        flow(doc, n, items, opts);
      });
      flush();
    }
    function headingItem(doc, title, fallbackTag) {
      if (!title || !norm(title.textContent)) return null;
      const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
      const el = clean(make(doc, tag, title.innerHTML));
      const a = title.closest("a[href]");
      if (a && !el.querySelector("a")) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        while (el.firstChild) link.append(el.firstChild);
        el.append(link);
      }
      return { kind: "heading", el, sourceTag: title.tagName };
    }
    function widget(doc, w, items, opts = {}) {
      if (hidden(w)) return;
      const type = widgetType(w);
      const c = w.querySelector(":scope > .elementor-widget-container") || w;
      switch (type) {
        case "heading":
        case "theme-post-title": {
          const t = c.querySelector(".elementor-heading-title") || c.querySelector("h1, h2, h3, h4, h5, h6, p");
          push(items, headingItem(doc, t, "p"), w);
          return;
        }
        case "image":
        case "theme-post-featured-image":
          c.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
          return;
        case "button": {
          const a = c.querySelector("a.elementor-button, a[href]");
          if (!a) return;
          const text = norm((a.querySelector(".elementor-button-text") || a).textContent);
          if (!text) return;
          const p = doc.createElement("p");
          const href = a.getAttribute("href");
          if (href) {
            const link = doc.createElement("a");
            link.href = fixHref(href);
            link.textContent = text;
            p.append(link);
          } else {
            p.textContent = text;
          }
          push(items, { kind: "button", el: p }, w);
          return;
        }
        case "icon-list": {
          const ul = doc.createElement("ul");
          c.querySelectorAll(".elementor-icon-list-item").forEach((it) => {
            const text = it.querySelector(".elementor-icon-list-text") || it;
            if (!norm(text.textContent)) return;
            const li = clean(make(doc, "li", text.innerHTML));
            const a = it.querySelector("a[href]");
            if (a && !li.querySelector("a")) {
              const link = doc.createElement("a");
              link.href = fixHref(a.getAttribute("href"));
              while (li.firstChild) link.append(li.firstChild);
              li.append(link);
            }
            ul.append(li);
          });
          if (ul.children.length) push(items, { kind: "list", el: ul }, w);
          return;
        }
        case "icon-box":
        case "image-box": {
          c.querySelectorAll(".elementor-icon-box-icon img, .elementor-image-box-img img").forEach((img) => push(items, imageItem(doc, img), w));
          const title = c.querySelector(".elementor-icon-box-title, .elementor-image-box-title");
          push(items, headingItem(doc, title, "h3"), w);
          const d = c.querySelector(".elementor-icon-box-description, .elementor-image-box-description");
          if (d && norm(d.textContent)) {
            const tmp = [];
            flow(doc, d, tmp, opts);
            if (!tmp.length) tmp.push({ kind: "text", el: clean(make(doc, "p", d.innerHTML)) });
            tmp.forEach((i) => push(items, i, w));
          }
          return;
        }
        case "divider":
          if (opts.dividers) push(items, { kind: "divider", el: null }, w);
          return;
        case "spacer":
        case "icon":
        case "menu-anchor":
          return;
        case "html":
          if (c.querySelector(".passo-numerado")) {
            push(items, stepsList(doc, c), w);
            return;
          }
          if (!norm(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
      if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2 && widgetType(widgets[0]) === "icon" && ["text-editor", "heading"].includes(widgetType(widgets[1]))) {
        const tmp = [];
        widget(doc, widgets[1], tmp, opts);
        const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
        const src = bgUrl(con);
        if (src) push(items, bgImageItem(doc, src), con);
        return;
      }
      kids.forEach((k) => {
        if (isWidget(k)) widget(doc, k, items, opts);
        else if (isCon(k)) walkContainer(doc, k, items, opts);
        else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
          const tmp = [];
          flow(doc, { childNodes: [k] }, tmp, opts);
          tmp.forEach((i) => push(items, i, con));
        }
      });
    };
    function collect(doc, root, opts = {}) {
      const items = [];
      if (isWidget(root)) widget(doc, root, items, opts);
      else if (isCon(root)) walkContainer(doc, root, items, opts);
      else flow(doc, root, items, opts);
      const out = [];
      items.forEach((it) => {
        const prev = out[out.length - 1];
        if (it.kind === "li") {
          if (prev && prev.kind === "list" && prev.liRun) {
            prev.el.append(it.el);
          } else {
            const ul = make(doc, "ul");
            ul.append(it.el);
            out.push({ kind: "list", el: ul, liRun: true, origin: it.origin });
          }
          return;
        }
        if (it.kind === "list" && prev && prev.kind === "list" && prev.el.tagName === it.el.tagName) {
          prev.el.append(...it.el.children);
          return;
        }
        if (opts.groupImages !== false && it.kind === "image" && prev && prev.kind === "image" && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement && prev.origin.closest(".e-con") === it.origin.closest(".e-con")) {
          prev.el.append(" ", ...it.el.childNodes);
          prev.group = true;
          return;
        }
        out.push(it);
      });
      return out;
    }
    function shape(k) {
      const s = [];
      if (isStrictGroup(k)) s.push("group");
      if (k.querySelector("img")) s.push("img");
      if (k.querySelector("h1, h2, h3, h4, h5, h6")) s.push("h");
      if (k.querySelector(".elementor-widget-button")) s.push("btn");
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm(n.textContent));
      if (text) s.push("text");
      return s.join("+");
    }
    function sameShapeGroup(kids) {
      const by = /* @__PURE__ */ new Map();
      kids.forEach((k) => {
        const s = shape(k);
        if (!by.has(s)) by.set(s, []);
        by.get(s).push(k);
      });
      let best = null;
      by.forEach((g) => {
        if (g.length >= 2 && (!best || g.length > best.length)) best = g;
      });
      return best;
    }
    function isStrictGroup(node) {
      const kids = contentKids(node);
      if (kids.length < 2) return false;
      if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
      const g = sameShapeGroup(kids);
      return !!g && g.length === kids.length;
    }
    function findItems(node) {
      const kids = contentKids(node);
      const group = sameShapeGroup(kids);
      if (group) return group.flatMap((k) => isStrictGroup(k) ? findItems(k) : [k]);
      for (const k of kids) {
        const sub = findItems(k);
        if (sub.length >= 2) return sub;
      }
      return [];
    }
    function outside(root, items) {
      const before = [];
      const after = [];
      if (!items.length) return { before, after };
      const first = items[0];
      const walk = (node) => {
        kidsOf(node).forEach((k) => {
          if (items.includes(k) || !isEl(k)) return;
          if (items.some((it) => k.contains(it))) {
            walk(k);
            return;
          }
          if (!hasContent(k)) return;
          const isBefore = !!(k.compareDocumentPosition(first) & 4);
          (isBefore ? before : after).push(k);
        });
      };
      walk(root);
      return { before, after };
    }
    function moveOut(doc, element, chunks, where) {
      const nodes = [];
      chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => it.el && nodes.push(it.el)));
      if (!nodes.length) return;
      if (where === "before") element.before(...nodes);
      else element.after(...nodes);
    }
    function blockName(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm,
      isEl,
      isWidget,
      isCon,
      hasContent,
      fixHref,
      fixLinks,
      urlFromCss: urlFromCss2,
      settings,
      unlazy,
      imgSrc,
      bgUrl,
      videoUrl,
      canonicalVideo,
      widgetType,
      kidsOf,
      contentKids,
      make,
      clean,
      retag,
      imageItem,
      bgImageItem,
      collect,
      findItems,
      outside,
      moveOut,
      blockName,
      LEGACY_ROOTS
    };
  })();
  var INFO_ROOTS = ["1178", "2212", "1481", "1401", "2391", "2498", "467", "631", "6834", "2456", "2514", "2527"].map((id) => `.elementor-${id}`).join(", ");
  function isInfoPage(element, template) {
    if (template) return template === "info-page";
    return !!element.closest(INFO_ROOTS);
  }
  function inlineIconRuns(document, root) {
    root.querySelectorAll(".elementor-widget-text-editor > .elementor-widget-container").forEach((c) => {
      const loose = [...c.childNodes].some((n) => n.nodeType === 1 && n.tagName === "IMG");
      const text = [...c.childNodes].some((n) => n.nodeType === 3 && EL4.norm(n.textContent));
      if (!loose || !text) return;
      const runs = [];
      let run = [];
      [...c.childNodes].forEach((n) => {
        run.push(n);
        if (n.nodeType === 1 && n.tagName === "IMG") {
          runs.push(run);
          run = [];
        }
      });
      if (run.length) runs.push(run);
      const ps = runs.map((r) => {
        const p = document.createElement("p");
        r.forEach((n) => {
          if (n.nodeType === 3) p.append(n.textContent.replace(/[\s ]+/g, " "));
          else p.append(n);
        });
        if (p.firstChild && p.firstChild.nodeType === 3) p.firstChild.textContent = p.firstChild.textContent.replace(/^\s+/, "");
        return p;
      }).filter((p) => EL4.norm(p.textContent) || p.querySelector("img"));
      c.replaceChildren(...ps);
    });
  }
  function textColumns(element) {
    let node = element;
    for (let i = 0; i < 8; i += 1) {
      const kids = EL4.kidsOf(node).filter((k) => EL4.isCon(k) && EL4.hasContent(k));
      if (kids.length !== 1) return kids.length ? kids : [node];
      node = kids[0];
    }
    return [node];
  }
  function parseContacts(element, { document, options }) {
    EL4.unlazy(document);
    let image = null;
    EL4.kidsOf(element).some((k) => {
      if (!EL4.isCon(k) || EL4.hasContent(k)) return false;
      const src = EL4.bgUrl(k);
      if (src) image = EL4.bgImageItem(document, src).el;
      return !!src;
    });
    const textHost = EL4.kidsOf(element).find((k) => EL4.isCon(k) && EL4.hasContent(k));
    if (!textHost) {
      parseLanding4(element, { document, options });
      return;
    }
    inlineIconRuns(document, textHost);
    const cols = textColumns(textHost).map((col) => EL4.collect(document, col, { bgImages: false, groupImages: false }).map((it) => it.el).filter(Boolean)).filter((c) => c.length);
    if (!cols.length) {
      parseLanding4(element, { document, options });
      return;
    }
    const row = image ? [[image], ...cols] : cols;
    const block = WebImporter.Blocks.createBlock(document, { name: EL4.blockName("columns-media", options), cells: [row] });
    element.replaceWith(block);
  }
  function parse4(element, { document, options, basePath, template } = {}) {
    const opts = options || [];
    if (isInfoPage(element, template) && opts.includes("contacts")) {
      parseContacts(element, { document, options: opts, basePath: basePath || "" });
      return;
    }
    parseLanding4(element, { document, options: opts, basePath: basePath || "" });
  }

  // tools/importer/parsers/cards-feature.js
  var NO_TITLE_PROMOTION = ["icons", "circle", "steps", "links", "posts", "carousel"];
  var BADGE = /^\(?\s*coming soon\s*\)?$/i;
  function cardItems(element) {
    const slides = [...element.querySelectorAll(".swiper-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate") && EL5.hasContent(s));
    if (slides.length) return slides;
    const loop = [...element.querySelectorAll(".e-loop-item")].filter((s) => EL5.hasContent(s));
    if (loop.length) return loop;
    return EL5.findItems(element);
  }
  function cardBody(document, item, options) {
    const raw = EL5.collect(document, item, { bgImages: false, dividers: true, imageLinks: !options.includes("posts") });
    let image = null;
    const parts = [];
    raw.forEach((it) => {
      if (it.kind === "image" && !image) {
        image = it;
        return;
      }
      parts.push(it);
    });
    const heads = [];
    parts.forEach((it, i) => {
      if (it.kind !== "heading") return;
      const next = parts[i + 1];
      heads.push({ it, divider: !!next && next.kind === "divider" });
    });
    const tagline = heads.length >= 4 && heads[0].divider && heads[1].divider && !heads[2].divider ? heads[1].it : null;
    const body = [];
    let titled = false;
    parts.forEach((it) => {
      if (!it.el) return;
      if (it.kind === "heading") {
        if (!titled) {
          titled = true;
          body.push(EL5.retag(document, it.el, "h3"));
        } else {
          body.push(EL5.retag(document, it.el, it === tagline ? "h4" : "p"));
        }
        return;
      }
      if (it.kind === "text" && BADGE.test(EL5.norm(it.el.textContent)) && !it.el.querySelector("em")) {
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = EL5.norm(it.el.textContent);
        p.append(em);
        body.push(p);
        return;
      }
      body.push(it.el);
    });
    if (!titled && !options.some((o) => NO_TITLE_PROMOTION.includes(o))) {
      const texts = body.filter((el) => el.tagName === "P" && !el.querySelector("em:only-child"));
      const first = texts[0];
      if (first && texts.length >= 2 && !first.querySelector("a") && EL5.norm(first.textContent).length <= 40 && !/[.:]$/.test(EL5.norm(first.textContent))) {
        body[body.indexOf(first)] = EL5.retag(document, first, "h3");
      }
    }
    let imageEl = image ? image.el : null;
    if (!imageEl) {
      const src = EL5.bgUrl(item);
      if (src) imageEl = EL5.bgImageItem(document, src).el;
    }
    return { imageEl, body };
  }
  function parseLanding5(element, { document, options }) {
    EL5.unlazy(document);
    const items = cardItems(element);
    const rows = items.map((item) => cardBody(document, item, options)).filter((r) => r.body.length || r.imageEl);
    const ctaHost = element.nextElementSibling && element.nextElementSibling.matches(".elementor-element-9e81d46") ? element.nextElementSibling : null;
    if (ctaHost && element.matches(".elementor-element-9c6aacd")) {
      const ctas = EL5.collect(document, ctaHost).filter((it) => it.kind === "button");
      ctas.forEach((cta, i) => {
        if (rows[i]) rows[i].body.push(cta.el);
      });
    }
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let before = [];
    let after = [];
    if (items.length && items[0].classList.contains("swiper-slide")) {
      const host = items[0].closest(".elementor-widget");
      if (host && host !== element && element.contains(host)) ({ before, after } = EL5.outside(element, [host]));
    } else {
      ({ before, after } = EL5.outside(element, items));
    }
    EL5.moveOut(document, element, before, "before");
    EL5.moveOut(document, element, after, "after");
    const withImage = rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL5.blockName("cards-feature", options), cells });
    element.replaceWith(block);
    if (ctaHost) ctaHost.remove();
  }
  var EL5 = (() => {
    const HEADING = /^H[1-6]$/;
    const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
    const WIDGET_TYPES = [
      "theme-post-featured-image",
      "theme-post-title",
      "text-editor",
      "heading",
      "image-box",
      "icon-box",
      "icon-list",
      "image",
      "button",
      "divider",
      "spacer",
      "icon",
      "html",
      "shortcode",
      "accordion",
      "toggle",
      "n-accordion",
      "nested-accordion",
      "n-tabs",
      "n-carousel",
      "loop-grid",
      "template",
      "video",
      "menu-anchor"
    ];
    const norm = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector("img");
    function fixHref(href) {
      if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) return href;
      const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
      return m ? `${m[1] || ""}${m[2].replace(/\/{2,}/g, "/")}${m[3]}` : href;
    }
    function fixLinks(root) {
      if (!isEl(root)) return root;
      const links = [...root.querySelectorAll("a[href]")];
      if (root.matches("a[href]")) links.unshift(root);
      links.forEach((a) => a.setAttribute("href", fixHref(a.getAttribute("href"))));
      return root;
    }
    function urlFromCss2(value) {
      if (!value) return null;
      const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
    }
    function settings(el) {
      const raw = isEl(el) ? el.getAttribute("data-settings") : null;
      if (!raw) return {};
      try {
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
    function unlazy(doc) {
      doc.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    }
    function imgSrc(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss2(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc(img) || null;
      }
      return src || null;
    }
    function canonicalVideo(raw) {
      if (!raw) return null;
      let u;
      try {
        u = new URL(raw, "https://bradescobank.com/");
      } catch (e) {
        return null;
      }
      const host = u.hostname.replace(/^www\.|^m\./, "");
      if (/(^|\.)vimeo\.com$/.test(host)) {
        const id = (u.pathname.match(/(\d{5,})/) || [])[1];
        return id ? `https://vimeo.com/${id}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/")[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
      return null;
    }
    function videoUrl(el) {
      const cands = [];
      [el, ...el.querySelectorAll("[data-settings]")].forEach((n) => {
        const s = settings(n);
        if (s.background_video_link) cands.push(s.background_video_link);
      });
      el.querySelectorAll("video").forEach((v) => {
        cands.push(v.getAttribute("src"));
        v.querySelectorAll("source").forEach((s) => cands.push(s.getAttribute("src")));
      });
      el.querySelectorAll("iframe").forEach((f) => cands.push(f.getAttribute("src") || f.getAttribute("data-src")));
      for (const c of cands) {
        const v = canonicalVideo(c);
        if (v) return v;
      }
      return null;
    }
    function widgetType(w) {
      const t = w.getAttribute("data-widget_type");
      if (t) return t.split(".")[0];
      const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1]).filter((c) => c && !/__|--/.test(c));
      return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || "";
    }
    function kidsOf(node) {
      const out = [];
      const inners = [...node.children].filter((c) => c.classList.contains("e-con-inner"));
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
      if (html !== void 0) el.innerHTML = String(html).trim();
      return el;
    }
    function clean(el) {
      el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
      el.querySelectorAll("[class], [style], [id]").forEach((n) => {
        n.removeAttribute("class");
        n.removeAttribute("style");
        n.removeAttribute("id");
      });
      el.querySelectorAll("span").forEach((s) => {
        if (!s.attributes.length) s.replaceWith(...s.childNodes);
      });
      el.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
      for (let guard = 0; guard < 10; guard += 1) {
        const nested = [...el.querySelectorAll("strong > strong, b > b, em > em, i > i, u > u, sup > sup")].filter((n) => n.parentElement.childNodes.length === 1);
        if (!nested.length) break;
        nested.forEach((n) => {
          if (n.isConnected) n.replaceWith(...n.childNodes);
        });
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
      const out = doc.createElement("img");
      out.src = src;
      const alt = img.getAttribute("alt");
      if (alt) out.alt = alt;
      const p = doc.createElement("p");
      const a = keepLink ? img.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !/^#?$/.test(a.getAttribute("href"))) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        link.append(out);
        p.append(link);
      } else {
        p.append(out);
      }
      return { kind: "image", el: p, img: out };
    }
    function bgImageItem(doc, src, alt = "") {
      const img = doc.createElement("img");
      img.src = src;
      img.alt = alt;
      const p = doc.createElement("p");
      p.append(img);
      return { kind: "image", el: p, img };
    }
    function push(items, item, origin) {
      if (!item) return;
      item.origin = origin;
      items.push(item);
    }
    function stepsList(doc, c) {
      const list = doc.createElement(c.querySelector(".numero-passo img") ? "ul" : "ol");
      c.querySelectorAll(".passo-numerado").forEach((step) => {
        const body = step.querySelector(".texto-passo") || step;
        const li = doc.createElement("li");
        const h = body.querySelector("h1, h2, h3, h4, h5, h6");
        if (h) {
          li.append(make(doc, "strong", h.innerHTML));
          li.append(" ");
        }
        const ps = [...body.querySelectorAll("p")].filter((p) => norm(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm(body.textContent);
        if (norm(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm(n.textContent)) {
            run = run || doc.createElement("p");
            run.append(n.textContent.replace(/[\s\u00a0]+/g, " "));
          } else if (run) run.append(" ");
          return;
        }
        if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
        const tag = n.tagName.toUpperCase();
        if (tag === "BR") {
          if (run) run.append(doc.createElement("br"));
          return;
        }
        if (INLINE.test(tag) && !n.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section")) {
          if (n.querySelector("img") && !norm(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm(n.textContent)) return;
          run = run || doc.createElement("p");
          run.append(n.cloneNode(true));
          return;
        }
        flush();
        if (isWidget(n)) {
          widget(doc, n, items, opts);
          return;
        }
        if (isCon(n)) {
          walkContainer(doc, n, items, opts);
          return;
        }
        if (HEADING.test(tag)) {
          if (norm(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm(list.textContent)) push(items, { kind: "list", el: list }, container);
          return;
        }
        if (tag === "TABLE" || tag === "BLOCKQUOTE" || tag === "PRE") {
          push(items, { kind: "text", el: clean(n.cloneNode(true)) }, container);
          return;
        }
        if (tag === "IMG") {
          push(items, imageItem(doc, n), container);
          return;
        }
        if (n.classList.contains("secao-numeros")) {
          push(items, stepsList(doc, n), container);
          return;
        }
        flow(doc, n, items, opts);
      });
      flush();
    }
    function headingItem(doc, title, fallbackTag) {
      if (!title || !norm(title.textContent)) return null;
      const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
      const el = clean(make(doc, tag, title.innerHTML));
      const a = title.closest("a[href]");
      if (a && !el.querySelector("a")) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        while (el.firstChild) link.append(el.firstChild);
        el.append(link);
      }
      return { kind: "heading", el, sourceTag: title.tagName };
    }
    function widget(doc, w, items, opts = {}) {
      if (hidden(w)) return;
      const type = widgetType(w);
      const c = w.querySelector(":scope > .elementor-widget-container") || w;
      switch (type) {
        case "heading":
        case "theme-post-title": {
          const t = c.querySelector(".elementor-heading-title") || c.querySelector("h1, h2, h3, h4, h5, h6, p");
          push(items, headingItem(doc, t, "p"), w);
          return;
        }
        case "image":
        case "theme-post-featured-image":
          c.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
          return;
        case "button": {
          const a = c.querySelector("a.elementor-button, a[href]");
          if (!a) return;
          const text = norm((a.querySelector(".elementor-button-text") || a).textContent);
          if (!text) return;
          const p = doc.createElement("p");
          const href = a.getAttribute("href");
          if (href) {
            const link = doc.createElement("a");
            link.href = fixHref(href);
            link.textContent = text;
            p.append(link);
          } else {
            p.textContent = text;
          }
          push(items, { kind: "button", el: p }, w);
          return;
        }
        case "icon-list": {
          const ul = doc.createElement("ul");
          c.querySelectorAll(".elementor-icon-list-item").forEach((it) => {
            const text = it.querySelector(".elementor-icon-list-text") || it;
            if (!norm(text.textContent)) return;
            const li = clean(make(doc, "li", text.innerHTML));
            const a = it.querySelector("a[href]");
            if (a && !li.querySelector("a")) {
              const link = doc.createElement("a");
              link.href = fixHref(a.getAttribute("href"));
              while (li.firstChild) link.append(li.firstChild);
              li.append(link);
            }
            ul.append(li);
          });
          if (ul.children.length) push(items, { kind: "list", el: ul }, w);
          return;
        }
        case "icon-box":
        case "image-box": {
          c.querySelectorAll(".elementor-icon-box-icon img, .elementor-image-box-img img").forEach((img) => push(items, imageItem(doc, img), w));
          const title = c.querySelector(".elementor-icon-box-title, .elementor-image-box-title");
          push(items, headingItem(doc, title, "h3"), w);
          const d = c.querySelector(".elementor-icon-box-description, .elementor-image-box-description");
          if (d && norm(d.textContent)) {
            const tmp = [];
            flow(doc, d, tmp, opts);
            if (!tmp.length) tmp.push({ kind: "text", el: clean(make(doc, "p", d.innerHTML)) });
            tmp.forEach((i) => push(items, i, w));
          }
          return;
        }
        case "divider":
          if (opts.dividers) push(items, { kind: "divider", el: null }, w);
          return;
        case "spacer":
        case "icon":
        case "menu-anchor":
          return;
        case "html":
          if (c.querySelector(".passo-numerado")) {
            push(items, stepsList(doc, c), w);
            return;
          }
          if (!norm(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
      if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2 && widgetType(widgets[0]) === "icon" && ["text-editor", "heading"].includes(widgetType(widgets[1]))) {
        const tmp = [];
        widget(doc, widgets[1], tmp, opts);
        const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
        const src = bgUrl(con);
        if (src) push(items, bgImageItem(doc, src), con);
        return;
      }
      kids.forEach((k) => {
        if (isWidget(k)) widget(doc, k, items, opts);
        else if (isCon(k)) walkContainer(doc, k, items, opts);
        else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
          const tmp = [];
          flow(doc, { childNodes: [k] }, tmp, opts);
          tmp.forEach((i) => push(items, i, con));
        }
      });
    };
    function collect(doc, root, opts = {}) {
      const items = [];
      if (isWidget(root)) widget(doc, root, items, opts);
      else if (isCon(root)) walkContainer(doc, root, items, opts);
      else flow(doc, root, items, opts);
      const out = [];
      items.forEach((it) => {
        const prev = out[out.length - 1];
        if (it.kind === "li") {
          if (prev && prev.kind === "list" && prev.liRun) {
            prev.el.append(it.el);
          } else {
            const ul = make(doc, "ul");
            ul.append(it.el);
            out.push({ kind: "list", el: ul, liRun: true, origin: it.origin });
          }
          return;
        }
        if (it.kind === "list" && prev && prev.kind === "list" && prev.el.tagName === it.el.tagName) {
          prev.el.append(...it.el.children);
          return;
        }
        if (opts.groupImages !== false && it.kind === "image" && prev && prev.kind === "image" && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement && prev.origin.closest(".e-con") === it.origin.closest(".e-con")) {
          prev.el.append(" ", ...it.el.childNodes);
          prev.group = true;
          return;
        }
        out.push(it);
      });
      return out;
    }
    function shape(k) {
      const s = [];
      if (isStrictGroup(k)) s.push("group");
      if (k.querySelector("img")) s.push("img");
      if (k.querySelector("h1, h2, h3, h4, h5, h6")) s.push("h");
      if (k.querySelector(".elementor-widget-button")) s.push("btn");
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm(n.textContent));
      if (text) s.push("text");
      return s.join("+");
    }
    function sameShapeGroup(kids) {
      const by = /* @__PURE__ */ new Map();
      kids.forEach((k) => {
        const s = shape(k);
        if (!by.has(s)) by.set(s, []);
        by.get(s).push(k);
      });
      let best = null;
      by.forEach((g) => {
        if (g.length >= 2 && (!best || g.length > best.length)) best = g;
      });
      return best;
    }
    function isStrictGroup(node) {
      const kids = contentKids(node);
      if (kids.length < 2) return false;
      if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
      const g = sameShapeGroup(kids);
      return !!g && g.length === kids.length;
    }
    function findItems(node) {
      const kids = contentKids(node);
      const group = sameShapeGroup(kids);
      if (group) return group.flatMap((k) => isStrictGroup(k) ? findItems(k) : [k]);
      for (const k of kids) {
        const sub = findItems(k);
        if (sub.length >= 2) return sub;
      }
      return [];
    }
    function outside(root, items) {
      const before = [];
      const after = [];
      if (!items.length) return { before, after };
      const first = items[0];
      const walk = (node) => {
        kidsOf(node).forEach((k) => {
          if (items.includes(k) || !isEl(k)) return;
          if (/^(STYLE|SCRIPT|LINK|NOSCRIPT|TEMPLATE)$/.test(k.tagName)) return;
          if (items.some((it) => k.contains(it))) {
            walk(k);
            return;
          }
          if (!hasContent(k)) return;
          const isBefore = !!(k.compareDocumentPosition(first) & 4);
          (isBefore ? before : after).push(k);
        });
      };
      walk(root);
      return { before, after };
    }
    function moveOut(doc, element, chunks, where) {
      const nodes = [];
      chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => {
        if (!it.el) return;
        const a = it.kind === "button" && it.el.querySelector(":scope > a");
        if (a) {
          const strong = doc.createElement("strong");
          a.replaceWith(strong);
          strong.append(a);
        }
        nodes.push(it.el);
      }));
      if (!nodes.length) return;
      if (where === "before") element.before(...nodes);
      else element.after(...nodes);
    }
    function blockName(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm,
      isEl,
      isWidget,
      isCon,
      hasContent,
      fixHref,
      fixLinks,
      urlFromCss: urlFromCss2,
      settings,
      unlazy,
      imgSrc,
      bgUrl,
      videoUrl,
      canonicalVideo,
      widgetType,
      kidsOf,
      contentKids,
      make,
      clean,
      retag,
      imageItem,
      bgImageItem,
      collect,
      findItems,
      outside,
      moveOut,
      blockName,
      LEGACY_ROOTS
    };
  })();
  var INFO_ROOTS2 = ["1178", "2212", "1481", "1401", "2391", "2498", "467", "631", "6834", "2456", "2514", "2527"].map((id) => `.elementor-${id}`).join(", ");
  function isInfoPage2(element, template) {
    if (template) return template === "info-page";
    return !!element.closest(INFO_ROOTS2);
  }
  var FIGURE = /^([$€£]?\s*[\d][\d.,]*\s*\+?(?:\s*(?:million|billion|thousand|trillion|mil|bi)\b)?\s*\+?)\s+(\S.*)$/i;
  function splitFigure(document, p) {
    const lines = [];
    let cur = [];
    [...p.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName === "BR") {
        lines.push(cur);
        cur = [];
      } else cur.push(n);
    });
    lines.push(cur);
    const filled = lines.filter((l) => l.some((n) => EL5.norm(n.textContent)));
    if (filled.length >= 2) {
      return filled.map((l) => {
        const out = document.createElement("p");
        l.forEach((n) => out.append(n));
        [...out.childNodes].forEach((n) => {
          if (n.nodeType === 3) n.textContent = n.textContent.replace(/\s+/g, " ");
        });
        if (out.firstChild && out.firstChild.nodeType === 3) out.firstChild.textContent = out.firstChild.textContent.replace(/^\s+/, "");
        if (out.lastChild && out.lastChild.nodeType === 3) out.lastChild.textContent = out.lastChild.textContent.replace(/\s+$/, "");
        return out;
      });
    }
    const text = EL5.norm(p.textContent);
    const m = !p.querySelector("*") && text.match(FIGURE);
    if (!m) return [p];
    return [m[1].trim(), m[2].trim()].map((t) => {
      const out = document.createElement("p");
      out.textContent = t;
      return out;
    });
  }
  function trimTrailingBreaks(el) {
    for (let guard = 0; guard < 20; guard += 1) {
      const last = el.lastChild;
      if (!last) break;
      if (last.nodeType === 3 && !last.textContent.replace(/[\s ]+/g, "")) {
        last.remove();
        continue;
      }
      if (last.nodeType === 1 && last.tagName === "BR") {
        last.remove();
        continue;
      }
      break;
    }
  }
  function infoBody(document, body, options) {
    let out = body;
    if (options.includes("rows")) {
      out = out.map((el) => {
        if (/^H[1-6]$/.test(el.tagName)) {
          el.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
          el.innerHTML = el.innerHTML.replace(/\s+/g, " ").trim();
        }
        if (el.tagName === "UL" || el.tagName === "OL") {
          [...el.children].forEach((li) => {
            const ps = [...li.children].filter((c) => c.tagName === "P");
            ps.forEach((p, i) => {
              trimTrailingBreaks(p);
              const frag = [...p.childNodes];
              if (i > 0) frag.unshift(document.createElement("br"));
              p.replaceWith(...frag);
            });
            [...li.childNodes].forEach((n) => {
              if (n.nodeType === 3 && !n.textContent.trim()) n.remove();
            });
            trimTrailingBreaks(li);
            if (li.firstChild && li.firstChild.nodeType === 3) li.firstChild.textContent = li.firstChild.textContent.replace(/^\s+/, "");
          });
          [...el.childNodes].forEach((n) => {
            if (n.nodeType === 3 && !n.textContent.trim()) n.remove();
          });
        }
        return el;
      });
    }
    if (options.includes("gradient") && !out.some((el) => /^H[1-6]$/.test(el.tagName))) {
      out = out.flatMap((el) => el.tagName === "P" ? splitFigure(document, el) : [el]);
    }
    if (options.includes("documents") && !out.some((el) => /^H[1-6]$/.test(el.tagName))) {
      const first = out.find((el) => el.tagName === "P" && EL5.norm(el.textContent));
      const link = first && first.querySelector("a");
      const isLink = !!link && EL5.norm(first.textContent) === EL5.norm(link.textContent);
      if (first && !isLink) out[out.indexOf(first)] = EL5.retag(document, first, "h3");
    }
    return out;
  }
  function parseInfo(element, { document, options }) {
    EL5.unlazy(document);
    let items = options.includes("documents") ? [...element.querySelectorAll(".box-cra")].filter((n) => EL5.hasContent(n)) : [];
    if (!items.length) items = cardItems(element);
    const single = !items.length && EL5.hasContent(element);
    if (single) items = [element];
    const rows = items.map((item) => cardBody(document, item, options)).filter((r) => r.body.length || r.imageEl).map((r) => ({ imageEl: r.imageEl, body: infoBody(document, r.body, options) }));
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (!single) {
      const { before, after } = EL5.outside(element, items);
      EL5.moveOut(document, element, before, "before");
      EL5.moveOut(document, element, after, "after");
    }
    const withImage = options.includes("documents") || rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL5.blockName("cards-feature", options), cells });
    element.replaceWith(block);
  }
  var LISTING_DROP = ".favorite-container, .post-bookmark-placeholder, button, script, style, noscript, svg, .elementor-element-05a409f, .elementor-hidden-desktop";
  var LISTING_DATE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  var LISTING_BYLINE = /^by\s+(\S.*)$/i;
  var LISTING_TITLE = ".post-title, .elementor-widget-theme-post-title, .elementor-widget-heading";
  var LISTING_TEXT = ".post-excerpt, .elementor-widget-text-editor, .elementor-widget-theme-post-excerpt, .elementor-widget-shortcode";
  function listingItems(element) {
    const cards = [...element.querySelectorAll("article.post-card")].filter((n) => EL5.hasContent(n));
    if (cards.length) return cards;
    const loop = [...element.querySelectorAll(".e-loop-item")].filter((n) => EL5.hasContent(n));
    if (loop.length) return loop;
    return EL5.findItems(element);
  }
  var listingDropped = (n) => !!n.closest(LISTING_DROP);
  var listingText = (n) => {
    const c = n.cloneNode(true);
    c.querySelectorAll(LISTING_DROP).forEach((x) => x.remove());
    return EL5.norm(c.textContent);
  };
  var listingHref = (a) => {
    const href = a && a.getAttribute("href");
    return href && !/^#?$/.test(href) ? EL5.fixHref(href) : null;
  };
  function listingRow(document, item) {
    const p = (text) => {
      const el = document.createElement("p");
      el.textContent = text;
      return el;
    };
    let imageEl = null;
    let imageLink = null;
    const img = [...item.querySelectorAll("img")].find((i) => !listingDropped(i) && EL5.imgSrc(i));
    if (img) {
      const it = EL5.imageItem(document, img, false);
      if (it) {
        imageEl = it.el;
        imageLink = img.closest("a[href]");
      }
    }
    if (!imageEl) {
      const bg = [item, ...item.querySelectorAll('[data-settings*="background_background"]')].filter((n) => !listingDropped(n) && !EL5.norm(n.textContent)).map((n) => EL5.bgUrl(n)).find((src) => src && !/\.svg(\?|#|$)/i.test(src));
      if (bg) imageEl = EL5.bgImageItem(document, bg).el;
    }
    const catEl = [...item.querySelectorAll(".post-category-alt")].find((n) => !listingDropped(n) && listingText(n));
    const category = catEl ? listingText(catEl) : "";
    let titleEl = [...item.querySelectorAll(LISTING_TITLE)].find((n) => !listingDropped(n) && listingText(n));
    if (!titleEl) {
      titleEl = [...item.querySelectorAll("h1, h2, h3, h4, h5, h6")].find((n) => !listingDropped(n) && listingText(n));
    }
    const texts = [];
    [...item.querySelectorAll(LISTING_TEXT)].forEach((n) => {
      if (listingDropped(n) || catEl && (n.contains(catEl) || catEl.contains(n))) return;
      if (titleEl && (n.contains(titleEl) || titleEl.contains(n))) return;
      if (texts.some((t) => t.el.contains(n))) return;
      const text = listingText(n);
      if (text) texts.push({ el: n, text });
    });
    let date = "";
    let byline = "";
    const rest = [];
    texts.forEach((t) => {
      if (!date && LISTING_DATE.test(t.text)) {
        date = t.text;
        return;
      }
      const by = t.text.match(LISTING_BYLINE);
      if (!byline && by) {
        byline = `By ${by[1]}`;
        return;
      }
      rest.push(t);
    });
    let title = titleEl ? listingText(titleEl) : "";
    if (!title && rest.length) title = rest.shift().text;
    const wrapper = item.matches("a[href]") ? item : item.querySelector("a.e-con[href]") || item.closest("a[href]");
    const href = listingHref(titleEl && (titleEl.matches("a[href]") ? titleEl : titleEl.querySelector("a[href]"))) || listingHref(wrapper) || listingHref(imageLink);
    const body = [];
    if (date) body.push(p(date));
    if (category) {
      const el = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = category;
      el.append(em);
      body.push(el);
    }
    if (title) {
      const h3 = document.createElement("h3");
      if (href) {
        const a = document.createElement("a");
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
    EL5.unlazy(document);
    const items = listingItems(element);
    const rows = items.map((item) => listingRow(document, item)).filter((r) => r.body.length || r.imageEl);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const { before, after } = EL5.outside(element, items);
    EL5.moveOut(document, element, before, "before");
    EL5.moveOut(document, element, after, "after");
    const withImage = rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL5.blockName("cards-feature", options), cells });
    element.replaceWith(block);
  }
  var AR_SKIP = /^(STYLE|SCRIPT|NOSCRIPT|TEMPLATE|LINK|META)$/;
  function arTidy(el) {
    const walker = el.ownerDocument.createTreeWalker(el, 4);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      t.textContent = t.textContent.replace(/[\s\u00a0\u200b]+/g, " ");
    });
    const edge = (n, dir) => {
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
      if (!prev || prev.nodeType === 1 && prev.tagName === "BR") t.textContent = t.textContent.replace(/^ /, "");
      if (!next || next.nodeType === 1 && next.tagName === "BR") t.textContent = t.textContent.replace(/ $/, "");
      if (!t.textContent) t.remove();
    });
    while (el.firstChild && el.firstChild.nodeType === 1 && el.firstChild.tagName === "BR") el.firstChild.remove();
    while (el.lastChild && el.lastChild.nodeType === 1 && el.lastChild.tagName === "BR") el.lastChild.remove();
    return el;
  }
  function arParagraph(document, html) {
    const p = EL5.clean(EL5.make(document, "p", html));
    return arTidy(p);
  }
  var arHidden = (n, stop) => {
    for (let cur = n; cur && cur !== stop; cur = cur.parentElement) {
      if (cur.classList && (cur.classList.contains("elementor-hidden-desktop") || cur.classList.contains("swiper-slide-duplicate"))) return true;
      if (cur.hasAttribute && cur.hasAttribute("hidden")) return true;
      const style = cur.getAttribute && cur.getAttribute("style");
      if (style && /display\s*:\s*none/i.test(style)) return true;
    }
    return false;
  };
  function arWidgetParas(document, w) {
    const out = [];
    EL5.collect(document, w, { bgImages: false, iconItems: false }).forEach((it) => {
      if (!it.el || it.kind === "image") return;
      if (it.kind === "list") {
        out.push(it.el);
        return;
      }
      out.push(arParagraph(document, it.el.innerHTML));
    });
    return out.filter((n) => EL5.norm(n.textContent));
  }
  function arSlideIcon(document, slide) {
    const img = [...slide.querySelectorAll(".elementor-widget-icon img")].find((i) => !arHidden(i, slide));
    const src = img ? EL5.imgSrc(img) : "";
    if (!src) return "";
    const out = document.createElement("img");
    out.src = src;
    out.alt = "";
    return out;
  }
  function arSlideBody(document, slide) {
    const widgets = [...slide.querySelectorAll(".elementor-widget")].filter((w) => !arHidden(w, slide) && ["heading", "text-editor"].includes(EL5.widgetType(w)));
    const body = [];
    let ul = null;
    let stage = "title";
    widgets.forEach((w) => {
      const type = EL5.widgetType(w);
      if (type === "heading") {
        const t = w.querySelector(".elementor-heading-title") || w.querySelector("h1, h2, h3, h4, h5, h6, p");
        const text2 = t ? EL5.norm(t.textContent) : "";
        if (!text2) return;
        const h = EL5.clean(EL5.make(document, stage === "title" ? "h3" : "h4", t.innerHTML));
        arTidy(h);
        body.push(h);
        if (stage === "title") stage = "desc";
        return;
      }
      const paras = arWidgetParas(document, w);
      if (!paras.length) return;
      const text = EL5.norm(paras.map((p) => p.textContent).join(" "));
      if (stage === "title" || stage === "desc") {
        if (stage === "desc" && body.some((n) => n.tagName === "P") && /:$/.test(text)) {
          body.push(arTidy(EL5.make(document, "h4", paras.map((p) => p.innerHTML).join(" "))));
          stage = "items";
          return;
        }
        body.push(...paras);
        if (stage === "title") stage = "desc";
        return;
      }
      if (!ul) {
        ul = document.createElement("ul");
        body.push(ul);
      }
      const li = document.createElement("li");
      paras.forEach((p, i) => {
        if (i) li.append(document.createElement("br"));
        if (p.tagName === "P") li.append(...p.childNodes);
        else li.append(p);
      });
      ul.append(arTidy(li));
    });
    return body;
  }
  function parseArticleRichSlides(element, { document, options }) {
    const slides = [...element.querySelectorAll(".swiper-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate") && EL5.hasContent(s));
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    slides.forEach((slide, pos) => {
      const idxAttr = slide.getAttribute("data-swiper-slide-index");
      const idx = idxAttr !== null && idxAttr !== "" && !Number.isNaN(parseInt(idxAttr, 10)) ? parseInt(idxAttr, 10) : null;
      const heading = slide.querySelector(".elementor-widget-heading .elementor-heading-title, .elementor-widget-heading h1, .elementor-widget-heading h2, .elementor-widget-heading h3");
      const key = idx !== null ? `i:${idx}` : `h:${EL5.norm(heading ? heading.textContent : slide.textContent).toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ slide, idx, pos });
    });
    items.sort((a, b) => {
      if (a.idx !== null && b.idx !== null && a.idx !== b.idx) return a.idx - b.idx;
      return a.pos - b.pos;
    });
    const cells = items.map(({ slide }) => [arSlideIcon(document, slide), arSlideBody(document, slide)]).filter((r) => r[1].length);
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const carousel = element.matches(".elementor-widget-n-carousel") ? element : element.querySelector(".elementor-widget-n-carousel") || element;
    const opts = [...options];
    if (EL5.settings(carousel).autoplay === "yes" && !opts.includes("autoplay")) opts.push("autoplay");
    const block = WebImporter.Blocks.createBlock(document, { name: EL5.blockName("cards-feature", opts), cells });
    element.replaceWith(block);
  }
  function parseArticleRichGrid(element, { document, options }) {
    let items = EL5.kidsOf(element).filter((k) => EL5.isCon(k) && EL5.hasContent(k));
    if (!items.length) items = EL5.findItems(element);
    const cells = [];
    items.forEach((item) => {
      const body = [];
      EL5.collect(document, item, { bgImages: false, iconItems: false }).forEach((it) => {
        if (!it.el || it.kind === "image" || it.kind === "divider") return;
        if (it.kind === "list") {
          body.push(it.el);
          return;
        }
        const p = arParagraph(document, it.el.innerHTML);
        if (EL5.norm(p.textContent)) body.push(p);
      });
      if (body.length) cells.push([body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL5.blockName("cards-feature", options), cells });
    element.replaceWith(block);
  }
  function arHtmlRoot(element) {
    const c = element.querySelector(":scope > .elementor-widget-container") || element;
    const kids = [...c.children].filter((k) => !AR_SKIP.test(k.tagName));
    return kids.length === 1 ? kids[0] : c;
  }
  function arRepeated(root, fallback) {
    const kids = [...root.children].filter((k) => !AR_SKIP.test(k.tagName));
    const groups = /* @__PURE__ */ new Map();
    kids.forEach((k) => {
      const key = `${k.tagName}.${[...k.classList].sort().join(".")}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(k);
    });
    let best = null;
    groups.forEach((g) => {
      if (g.length >= 2 && (!best || g.length > best.length)) best = g;
    });
    if (best) return best;
    return [...root.querySelectorAll(fallback)];
  }
  function parseArticleRichHtml(element, { document, options, kind }) {
    const root = arHtmlRoot(element);
    const items = kind === "steps" ? arRepeated(root, ".compounding-step") : arRepeated(root, ".investment-option");
    const cells = [];
    items.forEach((item) => {
      let html;
      if (kind === "steps") {
        const text = item.querySelector(".compounding-step-text");
        if (text) {
          html = text.innerHTML;
        } else {
          const clone = item.cloneNode(true);
          [...clone.children].forEach((k) => {
            if (/^\d+\.?$/.test(EL5.norm(k.textContent))) k.remove();
          });
          const inner = clone.children.length === 1 && /^(P|DIV)$/.test(clone.children[0].tagName) && EL5.norm(clone.children[0].textContent) === EL5.norm(clone.textContent) ? clone.children[0] : clone;
          html = inner.innerHTML;
        }
      } else {
        html = item.innerHTML;
      }
      const p = arParagraph(document, html);
      if (EL5.norm(p.textContent)) cells.push([[p]]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL5.blockName("cards-feature", options), cells });
    element.replaceWith(block);
  }
  function parseArticleRich(element, { document, options }) {
    if (options.includes("slides")) {
      parseArticleRichSlides(element, { document, options });
      return;
    }
    if (options.includes("centered")) {
      parseArticleRichGrid(element, { document, options });
      return;
    }
    if (options.includes("steps")) {
      parseArticleRichHtml(element, { document, options, kind: "steps" });
      return;
    }
    if (options.includes("filled")) {
      parseArticleRichHtml(element, { document, options, kind: "filled" });
      return;
    }
    parseLanding5(element, { document, options });
  }
  function parse5(element, { document, options, basePath, template } = {}) {
    if (template === "article-rich") {
      parseArticleRich(element, { document, options: options || [], basePath: basePath || "" });
      return;
    }
    if (template === "listing") {
      parseListing(element, { document, options: options || [], basePath: basePath || "" });
      return;
    }
    if (isInfoPage2(element, template)) {
      parseInfo(element, { document, options: options || [], basePath: basePath || "" });
      return;
    }
    parseLanding5(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/accordion.js
  function accordionItems(element) {
    const nested = [...element.querySelectorAll(".e-n-accordion-item")];
    if (nested.length) {
      return nested.map((item) => {
        const summary = item.querySelector(":scope > summary") || item.querySelector("summary");
        const title = summary && (summary.querySelector(".e-n-accordion-item-title-text") || summary);
        const body = [...item.children].filter((c) => c !== summary);
        return { title, body };
      });
    }
    return [...element.querySelectorAll(".elementor-accordion-item, .elementor-toggle-item")].map((item) => {
      const head = item.querySelector(".elementor-tab-title");
      const title = head && (head.querySelector(".elementor-accordion-title, .elementor-toggle-title") || head);
      const content = item.querySelector(".elementor-tab-content");
      return { title, body: content ? [content] : [] };
    });
  }
  function parseLanding6(element, { document, options }) {
    const cells = [];
    accordionItems(element).forEach(({ title, body }) => {
      const label = title ? EL6.norm(title.textContent) : "";
      if (!label) return;
      const answer = [];
      body.forEach((node) => {
        EL6.collect(document, node, { bgImages: false }).forEach((it) => {
          if (it.el) answer.push(it.el);
        });
      });
      const answerText = answer.map((n) => EL6.norm(n.textContent)).join("").replace(/[-–—]/g, "");
      if (/^accordion$/i.test(label) && !answerText) return;
      cells.push([label, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL6.blockName("accordion", options), cells });
    element.replaceWith(block);
  }
  var EL6 = (() => {
    const HEADING = /^H[1-6]$/;
    const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
    const WIDGET_TYPES = [
      "theme-post-featured-image",
      "theme-post-title",
      "text-editor",
      "heading",
      "image-box",
      "icon-box",
      "icon-list",
      "image",
      "button",
      "divider",
      "spacer",
      "icon",
      "html",
      "shortcode",
      "accordion",
      "toggle",
      "n-accordion",
      "nested-accordion",
      "n-tabs",
      "n-carousel",
      "loop-grid",
      "template",
      "video",
      "menu-anchor"
    ];
    const norm = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector("img");
    function fixHref(href) {
      if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) return href;
      const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
      return m ? `${m[1] || ""}${m[2].replace(/\/{2,}/g, "/")}${m[3]}` : href;
    }
    function fixLinks(root) {
      if (!isEl(root)) return root;
      const links = [...root.querySelectorAll("a[href]")];
      if (root.matches("a[href]")) links.unshift(root);
      links.forEach((a) => a.setAttribute("href", fixHref(a.getAttribute("href"))));
      return root;
    }
    function urlFromCss2(value) {
      if (!value) return null;
      const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
    }
    function settings(el) {
      const raw = isEl(el) ? el.getAttribute("data-settings") : null;
      if (!raw) return {};
      try {
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
    function unlazy(doc) {
      doc.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    }
    function imgSrc(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss2(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc(img) || null;
      }
      return src || null;
    }
    function canonicalVideo(raw) {
      if (!raw) return null;
      let u;
      try {
        u = new URL(raw, "https://bradescobank.com/");
      } catch (e) {
        return null;
      }
      const host = u.hostname.replace(/^www\.|^m\./, "");
      if (/(^|\.)vimeo\.com$/.test(host)) {
        const id = (u.pathname.match(/(\d{5,})/) || [])[1];
        return id ? `https://vimeo.com/${id}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/")[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
      return null;
    }
    function videoUrl(el) {
      const cands = [];
      [el, ...el.querySelectorAll("[data-settings]")].forEach((n) => {
        const s = settings(n);
        if (s.background_video_link) cands.push(s.background_video_link);
      });
      el.querySelectorAll("video").forEach((v) => {
        cands.push(v.getAttribute("src"));
        v.querySelectorAll("source").forEach((s) => cands.push(s.getAttribute("src")));
      });
      el.querySelectorAll("iframe").forEach((f) => cands.push(f.getAttribute("src") || f.getAttribute("data-src")));
      for (const c of cands) {
        const v = canonicalVideo(c);
        if (v) return v;
      }
      return null;
    }
    function widgetType(w) {
      const t = w.getAttribute("data-widget_type");
      if (t) return t.split(".")[0];
      const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1]).filter((c) => c && !/__|--/.test(c));
      return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || "";
    }
    function kidsOf(node) {
      const out = [];
      const inners = [...node.children].filter((c) => c.classList.contains("e-con-inner"));
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
      if (html !== void 0) el.innerHTML = String(html).trim();
      return el;
    }
    function clean(el) {
      el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
      el.querySelectorAll("[class], [style], [id]").forEach((n) => {
        n.removeAttribute("class");
        n.removeAttribute("style");
        n.removeAttribute("id");
      });
      el.querySelectorAll("span").forEach((s) => {
        if (!s.attributes.length) s.replaceWith(...s.childNodes);
      });
      el.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
      for (let guard = 0; guard < 10; guard += 1) {
        const nested = [...el.querySelectorAll("strong > strong, b > b, em > em, i > i, u > u, sup > sup")].filter((n) => n.parentElement.childNodes.length === 1);
        if (!nested.length) break;
        nested.forEach((n) => {
          if (n.isConnected) n.replaceWith(...n.childNodes);
        });
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
      const out = doc.createElement("img");
      out.src = src;
      const alt = img.getAttribute("alt");
      if (alt) out.alt = alt;
      const p = doc.createElement("p");
      const a = keepLink ? img.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !/^#?$/.test(a.getAttribute("href"))) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        link.append(out);
        p.append(link);
      } else {
        p.append(out);
      }
      return { kind: "image", el: p, img: out };
    }
    function bgImageItem(doc, src, alt = "") {
      const img = doc.createElement("img");
      img.src = src;
      img.alt = alt;
      const p = doc.createElement("p");
      p.append(img);
      return { kind: "image", el: p, img };
    }
    function push(items, item, origin) {
      if (!item) return;
      item.origin = origin;
      items.push(item);
    }
    function stepsList(doc, c) {
      const list = doc.createElement(c.querySelector(".numero-passo img") ? "ul" : "ol");
      c.querySelectorAll(".passo-numerado").forEach((step) => {
        const body = step.querySelector(".texto-passo") || step;
        const li = doc.createElement("li");
        const h = body.querySelector("h1, h2, h3, h4, h5, h6");
        if (h) {
          li.append(make(doc, "strong", h.innerHTML));
          li.append(" ");
        }
        const ps = [...body.querySelectorAll("p")].filter((p) => norm(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm(body.textContent);
        if (norm(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm(n.textContent)) {
            run = run || doc.createElement("p");
            run.append(n.textContent.replace(/[\s\u00a0]+/g, " "));
          } else if (run) run.append(" ");
          return;
        }
        if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
        const tag = n.tagName.toUpperCase();
        if (tag === "BR") {
          if (run) run.append(doc.createElement("br"));
          return;
        }
        if (INLINE.test(tag) && !n.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section")) {
          if (n.querySelector("img") && !norm(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm(n.textContent)) return;
          run = run || doc.createElement("p");
          run.append(n.cloneNode(true));
          return;
        }
        flush();
        if (isWidget(n)) {
          widget(doc, n, items, opts);
          return;
        }
        if (isCon(n)) {
          walkContainer(doc, n, items, opts);
          return;
        }
        if (HEADING.test(tag)) {
          if (norm(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm(list.textContent)) push(items, { kind: "list", el: list }, container);
          return;
        }
        if (tag === "TABLE" || tag === "BLOCKQUOTE" || tag === "PRE") {
          push(items, { kind: "text", el: clean(n.cloneNode(true)) }, container);
          return;
        }
        if (tag === "IMG") {
          push(items, imageItem(doc, n), container);
          return;
        }
        if (n.classList.contains("secao-numeros")) {
          push(items, stepsList(doc, n), container);
          return;
        }
        flow(doc, n, items, opts);
      });
      flush();
    }
    function headingItem(doc, title, fallbackTag) {
      if (!title || !norm(title.textContent)) return null;
      const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
      const el = clean(make(doc, tag, title.innerHTML));
      const a = title.closest("a[href]");
      if (a && !el.querySelector("a")) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        while (el.firstChild) link.append(el.firstChild);
        el.append(link);
      }
      return { kind: "heading", el, sourceTag: title.tagName };
    }
    function widget(doc, w, items, opts = {}) {
      if (hidden(w)) return;
      const type = widgetType(w);
      const c = w.querySelector(":scope > .elementor-widget-container") || w;
      switch (type) {
        case "heading":
        case "theme-post-title": {
          const t = c.querySelector(".elementor-heading-title") || c.querySelector("h1, h2, h3, h4, h5, h6, p");
          push(items, headingItem(doc, t, "p"), w);
          return;
        }
        case "image":
        case "theme-post-featured-image":
          c.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
          return;
        case "button": {
          const a = c.querySelector("a.elementor-button, a[href]");
          if (!a) return;
          const text = norm((a.querySelector(".elementor-button-text") || a).textContent);
          if (!text) return;
          const p = doc.createElement("p");
          const href = a.getAttribute("href");
          if (href) {
            const link = doc.createElement("a");
            link.href = fixHref(href);
            link.textContent = text;
            p.append(link);
          } else {
            p.textContent = text;
          }
          push(items, { kind: "button", el: p }, w);
          return;
        }
        case "icon-list": {
          const ul = doc.createElement("ul");
          c.querySelectorAll(".elementor-icon-list-item").forEach((it) => {
            const text = it.querySelector(".elementor-icon-list-text") || it;
            if (!norm(text.textContent)) return;
            const li = clean(make(doc, "li", text.innerHTML));
            const a = it.querySelector("a[href]");
            if (a && !li.querySelector("a")) {
              const link = doc.createElement("a");
              link.href = fixHref(a.getAttribute("href"));
              while (li.firstChild) link.append(li.firstChild);
              li.append(link);
            }
            ul.append(li);
          });
          if (ul.children.length) push(items, { kind: "list", el: ul }, w);
          return;
        }
        case "icon-box":
        case "image-box": {
          c.querySelectorAll(".elementor-icon-box-icon img, .elementor-image-box-img img").forEach((img) => push(items, imageItem(doc, img), w));
          const title = c.querySelector(".elementor-icon-box-title, .elementor-image-box-title");
          push(items, headingItem(doc, title, "h3"), w);
          const d = c.querySelector(".elementor-icon-box-description, .elementor-image-box-description");
          if (d && norm(d.textContent)) {
            const tmp = [];
            flow(doc, d, tmp, opts);
            if (!tmp.length) tmp.push({ kind: "text", el: clean(make(doc, "p", d.innerHTML)) });
            tmp.forEach((i) => push(items, i, w));
          }
          return;
        }
        case "divider":
          if (opts.dividers) push(items, { kind: "divider", el: null }, w);
          return;
        case "spacer":
        case "icon":
        case "menu-anchor":
          return;
        case "html":
          if (c.querySelector(".passo-numerado")) {
            push(items, stepsList(doc, c), w);
            return;
          }
          if (!norm(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
      if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2 && widgetType(widgets[0]) === "icon" && ["text-editor", "heading"].includes(widgetType(widgets[1]))) {
        const tmp = [];
        widget(doc, widgets[1], tmp, opts);
        const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
        const src = bgUrl(con);
        if (src) push(items, bgImageItem(doc, src), con);
        return;
      }
      kids.forEach((k) => {
        if (isWidget(k)) widget(doc, k, items, opts);
        else if (isCon(k)) walkContainer(doc, k, items, opts);
        else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
          const tmp = [];
          flow(doc, { childNodes: [k] }, tmp, opts);
          tmp.forEach((i) => push(items, i, con));
        }
      });
    };
    function collect(doc, root, opts = {}) {
      const items = [];
      if (isWidget(root)) widget(doc, root, items, opts);
      else if (isCon(root)) walkContainer(doc, root, items, opts);
      else flow(doc, root, items, opts);
      const out = [];
      items.forEach((it) => {
        const prev = out[out.length - 1];
        if (it.kind === "li") {
          if (prev && prev.kind === "list" && prev.liRun) {
            prev.el.append(it.el);
          } else {
            const ul = make(doc, "ul");
            ul.append(it.el);
            out.push({ kind: "list", el: ul, liRun: true, origin: it.origin });
          }
          return;
        }
        if (it.kind === "list" && prev && prev.kind === "list" && prev.el.tagName === it.el.tagName) {
          prev.el.append(...it.el.children);
          return;
        }
        if (opts.groupImages !== false && it.kind === "image" && prev && prev.kind === "image" && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement && prev.origin.closest(".e-con") === it.origin.closest(".e-con")) {
          prev.el.append(" ", ...it.el.childNodes);
          prev.group = true;
          return;
        }
        out.push(it);
      });
      return out;
    }
    function shape(k) {
      const s = [];
      if (isStrictGroup(k)) s.push("group");
      if (k.querySelector("img")) s.push("img");
      if (k.querySelector("h1, h2, h3, h4, h5, h6")) s.push("h");
      if (k.querySelector(".elementor-widget-button")) s.push("btn");
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm(n.textContent));
      if (text) s.push("text");
      return s.join("+");
    }
    function sameShapeGroup(kids) {
      const by = /* @__PURE__ */ new Map();
      kids.forEach((k) => {
        const s = shape(k);
        if (!by.has(s)) by.set(s, []);
        by.get(s).push(k);
      });
      let best = null;
      by.forEach((g) => {
        if (g.length >= 2 && (!best || g.length > best.length)) best = g;
      });
      return best;
    }
    function isStrictGroup(node) {
      const kids = contentKids(node);
      if (kids.length < 2) return false;
      if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
      const g = sameShapeGroup(kids);
      return !!g && g.length === kids.length;
    }
    function findItems(node) {
      const kids = contentKids(node);
      const group = sameShapeGroup(kids);
      if (group) return group.flatMap((k) => isStrictGroup(k) ? findItems(k) : [k]);
      for (const k of kids) {
        const sub = findItems(k);
        if (sub.length >= 2) return sub;
      }
      return [];
    }
    function outside(root, items) {
      const before = [];
      const after = [];
      if (!items.length) return { before, after };
      const first = items[0];
      const walk = (node) => {
        kidsOf(node).forEach((k) => {
          if (items.includes(k) || !isEl(k)) return;
          if (items.some((it) => k.contains(it))) {
            walk(k);
            return;
          }
          if (!hasContent(k)) return;
          const isBefore = !!(k.compareDocumentPosition(first) & 4);
          (isBefore ? before : after).push(k);
        });
      };
      walk(root);
      return { before, after };
    }
    function moveOut(doc, element, chunks, where) {
      const nodes = [];
      chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => it.el && nodes.push(it.el)));
      if (!nodes.length) return;
      if (where === "before") element.before(...nodes);
      else element.after(...nodes);
    }
    function blockName(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm,
      isEl,
      isWidget,
      isCon,
      hasContent,
      fixHref,
      fixLinks,
      urlFromCss: urlFromCss2,
      settings,
      unlazy,
      imgSrc,
      bgUrl,
      videoUrl,
      canonicalVideo,
      widgetType,
      kidsOf,
      contentKids,
      make,
      clean,
      retag,
      imageItem,
      bgImageItem,
      collect,
      findItems,
      outside,
      moveOut,
      blockName,
      LEGACY_ROOTS
    };
  })();
  var INFO_ROOTS3 = ["1178", "2212", "1481", "1401", "2391", "2498", "467", "631", "6834", "2456", "2514", "2527"].map((id) => `.elementor-${id}`).join(", ");
  function isInfoPage3(element, template) {
    if (template) return template === "info-page";
    return !!element.closest(INFO_ROOTS3);
  }
  function cssUrl(value) {
    const m = String(value || "").match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
  }
  function styleIconMap(document) {
    const map = {};
    document.querySelectorAll("style").forEach((s) => {
      const css = s.textContent || "";
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
    const anchor = item.querySelector(".elementor-accordion-title, .elementor-toggle-title") || item.querySelector(".elementor-tab-title a");
    let src = null;
    const view = document.defaultView;
    if (anchor && view && view.getComputedStyle) {
      try {
        const cs = view.getComputedStyle(anchor, "::before");
        src = cssUrl(cs.content) || cssUrl(cs.backgroundImage);
      } catch (e) {
      }
    }
    if (!src) {
      const tab = item.querySelector("[data-tab]");
      const n = tab && tab.getAttribute("data-tab");
      if (n && styleMap[n]) src = styleMap[n];
    }
    if (!src) return null;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    return img;
  }
  function parseInfoIcons(element, { document, options }) {
    const styleMap = styleIconMap(document);
    const items = [...element.querySelectorAll(".elementor-accordion-item, .elementor-toggle-item")];
    if (!items.length) {
      parseLanding6(element, { document, options });
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const head = item.querySelector(".elementor-tab-title");
      const title = head && (head.querySelector(".elementor-accordion-title, .elementor-toggle-title") || head);
      const label = title ? EL6.norm(title.textContent) : "";
      if (!label) return;
      const content = item.querySelector(".elementor-tab-content");
      const answer = [];
      if (content) EL6.collect(document, content, { bgImages: false }).forEach((it) => {
        if (it.el) answer.push(it.el);
      });
      const icon = titleIcon(document, item, styleMap);
      const labelCell = icon ? [icon, document.createTextNode(` ${label}`)] : label;
      cells.push([labelCell, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL6.blockName("accordion", options), cells });
    element.replaceWith(block);
  }
  function articleRichHeadingTag(widgetEl) {
    const parent = widgetEl && widgetEl.parentElement;
    if (!parent) return "h3";
    const withIcon = [...parent.children].some((c) => c !== widgetEl && EL6.isWidget(c) && EL6.widgetType(c) === "icon");
    return withIcon ? "h4" : "h3";
  }
  function parseArticleRich2(element, { document, options }) {
    const cells = [];
    accordionItems(element).forEach(({ title, body }) => {
      const label = title ? EL6.norm(title.textContent) : "";
      if (!label) return;
      const answer = [];
      body.forEach((node) => {
        EL6.collect(document, node, { bgImages: false, iconItems: false }).forEach((it) => {
          if (!it.el) return;
          if (it.kind === "image") return;
          if (it.kind === "heading") {
            const isWidgetOrigin = it.origin && EL6.isWidget(it.origin);
            const tag = isWidgetOrigin ? articleRichHeadingTag(it.origin) : "h3";
            const h = EL6.retag(document, it.el, tag);
            if (!h.children.length) h.textContent = EL6.norm(h.textContent);
            answer.push(h);
            return;
          }
          answer.push(it.el);
        });
      });
      cells.push([label, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL6.blockName("accordion", options), cells });
    element.replaceWith(block);
  }
  function parse6(element, { document, options, basePath, template } = {}) {
    const opts = options || [];
    if (template === "article-rich") {
      parseArticleRich2(element, { document, options: opts, basePath: basePath || "" });
      return;
    }
    if (isInfoPage3(element, template) && opts.includes("icons")) {
      parseInfoIcons(element, { document, options: opts, basePath: basePath || "" });
      return;
    }
    parseLanding6(element, { document, options: opts, basePath: basePath || "" });
  }

  // tools/importer/parsers/tabs.js
  var TILE_FALLBACK = {
    // credit-card-signature-gold, hidden "Visa Gold" panel (authoring-analysis.json)
    "876afa7": "https://bradescobank.com/wp-content/uploads/2026/08/AdobeStock_1924749375-1.webp",
    e434b48: "https://bradescobank.com/wp-content/uploads/2026/08/Rectangle-6-1.webp"
  };
  function slugify(text) {
    return (text || "").replace(/['\u2019]/g, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function elementId(el) {
    return el.getAttribute("data-id") || ([...el.classList].find((c) => /^elementor-element-[0-9a-f]{6,8}$/.test(c)) || "").replace("elementor-element-", "");
  }
  function tabPairs(element) {
    const nested = [...element.querySelectorAll(".e-n-tab-title")].filter((t) => !t.closest(".e-n-tabs-content"));
    if (nested.length) {
      const content = element.querySelector(".e-n-tabs-content");
      const panels = content ? [...content.children].filter((c) => !c.classList.contains("e-n-tab-title")) : [];
      return nested.map((t, i) => {
        const id = t.getAttribute("aria-controls");
        const panel = id && element.querySelector(`[id="${id}"]`) || panels[i] || null;
        return { label: t.querySelector(".e-n-tab-title-text") || t, panel };
      });
    }
    const buttons = [...element.querySelectorAll(".tab-btn")];
    if (buttons.length) {
      const panels = [...element.querySelectorAll(".tab-content")];
      return buttons.map((b, i) => ({ label: b, panel: panels[i] || null }));
    }
    const titles = [...element.querySelectorAll(".elementor-tab-desktop-title, .elementor-tabs-wrapper .elementor-tab-title")];
    const contents = [...element.querySelectorAll(".elementor-tab-content")];
    return titles.map((t, i) => ({ label: t, panel: contents[i] || null }));
  }
  function tilesPanel(document, panel) {
    let tiles = EL7.findItems(panel);
    if (!tiles.length) tiles = EL7.contentKids(panel);
    const out = [];
    tiles.forEach((tile) => {
      const items = EL7.collect(document, tile, { bgImages: false }).filter((it) => it.el);
      const image = items.find((it) => it.kind === "image");
      const src = EL7.bgUrl(tile) || TILE_FALLBACK[elementId(tile)] || image && image.img.getAttribute("src");
      const head = items.find((it) => it.kind === "heading") || items.find((it) => it.kind === "text");
      if (src) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = head ? EL7.norm(head.el.textContent) : "";
        const p = document.createElement("p");
        p.append(img);
        out.push(p);
      }
      items.forEach((it) => {
        if (it === image) return;
        if (it === head) out.push(EL7.retag(document, it.el, "h3"));
        else out.push(it.kind === "heading" ? EL7.retag(document, it.el, "p") : it.el);
      });
    });
    return out;
  }
  function backgroundPanel(document, panel) {
    const out = [];
    EL7.unlazy(document);
    const src = EL7.bgUrl(panel);
    if (src) out.push(EL7.bgImageItem(document, src).el);
    EL7.collect(document, panel, { bgImages: true }).forEach((it) => {
      if (it.el) out.push(it.el);
    });
    return out;
  }
  var isFaq = (element, options) => options.includes("faq") || !!element.querySelector(".term-link[data-term-id]") && !!element.querySelector(".question-item");
  var termId = (link) => link.getAttribute("data-term-id") || ([...link.classList].map((c) => (c.match(/^term-(\d+)$/) || [])[1]).find(Boolean) || "");
  function absUrl(document, src) {
    if (!src) return "";
    try {
      return new URL(src, document.baseURI || "https://bradescobank.com/").href;
    } catch (e) {
      return src;
    }
  }
  function faqCategories(document, element) {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    element.querySelectorAll(".term-link").forEach((link) => {
      const id = termId(link);
      if (!id || seen.has(id) || link.closest(".swiper-slide-duplicate")) return;
      seen.add(id);
      const slide = link.closest(".swiper-slide");
      const img = link.querySelector("img.slide-image") || link.querySelector("img");
      out.push({
        id,
        label: EL7.norm((link.querySelector(".slide-text") || link).textContent),
        icon: img ? absUrl(document, EL7.imgSrc(img)) : "",
        active: !!(slide && slide.classList.contains("active") || link.classList.contains("active"))
      });
    });
    return out;
  }
  function faqPanel(document, panel) {
    const out = [];
    panel.querySelectorAll(".question-item, .title-subterm").forEach((node) => {
      if (node.classList.contains("title-subterm")) {
        if (node.closest(".question-item") || !EL7.norm(node.textContent)) return;
        const p = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = EL7.norm(node.textContent);
        p.append(strong);
        out.push(p);
        return;
      }
      const header = node.querySelector(".cta-header") || node;
      const title = header.querySelector(".cta-title") || header.querySelector("h1, h2, h3, h4, h5, h6");
      const question = EL7.norm(title ? title.textContent : "");
      if (!question) return;
      const h3 = document.createElement("h3");
      h3.textContent = question;
      out.push(h3);
      const answer = node.querySelector(".toggle-content");
      if (!answer) return;
      const clone = answer.cloneNode(true);
      clone.querySelectorAll("svg, .cta-icon, .question-terms").forEach((n) => n.remove());
      EL7.collect(document, clone, { bgImages: false }).forEach((it) => {
        if (!it.el) return;
        out.push(/^H[1-6]$/.test(it.el.tagName) ? EL7.retag(document, it.el, "h4") : it.el);
      });
    });
    return out;
  }
  function parseFaq(element, { document, options }) {
    const categories = faqCategories(document, element);
    if (!categories.length) return false;
    const panels = [...element.querySelectorAll(".faq-term-panel[data-term-id]")];
    const defaultContainer = element.querySelector('[id="faq_container"]');
    const defaultId = (categories.find((c) => c.active) || categories[0]).id;
    const cells = categories.map((cat) => {
      const label = [];
      if (cat.icon) {
        const img = document.createElement("img");
        img.src = cat.icon;
        img.alt = "";
        label.push(img);
      }
      const p = document.createElement("p");
      p.textContent = cat.label;
      label.push(p);
      let panel = panels.find((n) => n.getAttribute("data-term-id") === cat.id);
      if (!panel && cat.id === defaultId) panel = defaultContainer;
      return [label, panel ? faqPanel(document, panel) : ""];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: EL7.blockName("tabs", options), cells });
    element.replaceWith(block);
    return true;
  }
  function parseLanding7(element, { document, options, basePath }) {
    EL7.unlazy(document);
    const pairs = tabPairs(element).filter((p) => EL7.norm(p.label.textContent));
    const cells = [];
    pairs.forEach(({ label, panel }) => {
      const text = EL7.norm(label.textContent);
      let panelCell = "";
      if (options.includes("fragments")) {
        const href = `${(basePath || "").replace(/\/$/, "")}/fragments/${slugify(text)}`;
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        p.append(a);
        panelCell = p;
      } else if (panel && options.includes("tiles")) {
        panelCell = tilesPanel(document, panel);
      } else if (panel && options.includes("vertical")) {
        panelCell = backgroundPanel(document, panel);
      } else if (panel) {
        panelCell = EL7.collect(document, panel, { bgImages: true }).map((it) => it.el).filter(Boolean);
      }
      cells.push([text, panelCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL7.blockName("tabs", options), cells });
    element.replaceWith(block);
  }
  var EL7 = (() => {
    const HEADING = /^H[1-6]$/;
    const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
    const WIDGET_TYPES = [
      "theme-post-featured-image",
      "theme-post-title",
      "text-editor",
      "heading",
      "image-box",
      "icon-box",
      "icon-list",
      "image",
      "button",
      "divider",
      "spacer",
      "icon",
      "html",
      "shortcode",
      "accordion",
      "toggle",
      "n-accordion",
      "nested-accordion",
      "n-tabs",
      "n-carousel",
      "loop-grid",
      "template",
      "video",
      "menu-anchor"
    ];
    const norm = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector("img");
    function fixHref(href) {
      if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) return href;
      const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
      return m ? `${m[1] || ""}${m[2].replace(/\/{2,}/g, "/")}${m[3]}` : href;
    }
    function fixLinks(root) {
      if (!isEl(root)) return root;
      const links = [...root.querySelectorAll("a[href]")];
      if (root.matches("a[href]")) links.unshift(root);
      links.forEach((a) => a.setAttribute("href", fixHref(a.getAttribute("href"))));
      return root;
    }
    function urlFromCss2(value) {
      if (!value) return null;
      const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
    }
    function settings(el) {
      const raw = isEl(el) ? el.getAttribute("data-settings") : null;
      if (!raw) return {};
      try {
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
    function unlazy(doc) {
      doc.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    }
    function imgSrc(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss2(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc(img) || null;
      }
      return src || null;
    }
    function canonicalVideo(raw) {
      if (!raw) return null;
      let u;
      try {
        u = new URL(raw, "https://bradescobank.com/");
      } catch (e) {
        return null;
      }
      const host = u.hostname.replace(/^www\.|^m\./, "");
      if (/(^|\.)vimeo\.com$/.test(host)) {
        const id = (u.pathname.match(/(\d{5,})/) || [])[1];
        return id ? `https://vimeo.com/${id}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/")[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
      return null;
    }
    function videoUrl(el) {
      const cands = [];
      [el, ...el.querySelectorAll("[data-settings]")].forEach((n) => {
        const s = settings(n);
        if (s.background_video_link) cands.push(s.background_video_link);
      });
      el.querySelectorAll("video").forEach((v) => {
        cands.push(v.getAttribute("src"));
        v.querySelectorAll("source").forEach((s) => cands.push(s.getAttribute("src")));
      });
      el.querySelectorAll("iframe").forEach((f) => cands.push(f.getAttribute("src") || f.getAttribute("data-src")));
      for (const c of cands) {
        const v = canonicalVideo(c);
        if (v) return v;
      }
      return null;
    }
    function widgetType(w) {
      const t = w.getAttribute("data-widget_type");
      if (t) return t.split(".")[0];
      const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1]).filter((c) => c && !/__|--/.test(c));
      return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || "";
    }
    function kidsOf(node) {
      const out = [];
      const inners = [...node.children].filter((c) => c.classList.contains("e-con-inner"));
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
      if (html !== void 0) el.innerHTML = String(html).trim();
      return el;
    }
    function clean(el) {
      el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
      el.querySelectorAll("[class], [style], [id]").forEach((n) => {
        n.removeAttribute("class");
        n.removeAttribute("style");
        n.removeAttribute("id");
      });
      el.querySelectorAll("span").forEach((s) => {
        if (!s.attributes.length) s.replaceWith(...s.childNodes);
      });
      el.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
      for (let guard = 0; guard < 10; guard += 1) {
        const nested = [...el.querySelectorAll("strong > strong, b > b, em > em, i > i, u > u, sup > sup")].filter((n) => n.parentElement.childNodes.length === 1);
        if (!nested.length) break;
        nested.forEach((n) => {
          if (n.isConnected) n.replaceWith(...n.childNodes);
        });
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
      const out = doc.createElement("img");
      out.src = src;
      const alt = img.getAttribute("alt");
      if (alt) out.alt = alt;
      const p = doc.createElement("p");
      const a = keepLink ? img.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !/^#?$/.test(a.getAttribute("href"))) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        link.append(out);
        p.append(link);
      } else {
        p.append(out);
      }
      return { kind: "image", el: p, img: out };
    }
    function bgImageItem(doc, src, alt = "") {
      const img = doc.createElement("img");
      img.src = src;
      img.alt = alt;
      const p = doc.createElement("p");
      p.append(img);
      return { kind: "image", el: p, img };
    }
    function push(items, item, origin) {
      if (!item) return;
      item.origin = origin;
      items.push(item);
    }
    function stepsList(doc, c) {
      const list = doc.createElement(c.querySelector(".numero-passo img") ? "ul" : "ol");
      c.querySelectorAll(".passo-numerado").forEach((step) => {
        const body = step.querySelector(".texto-passo") || step;
        const li = doc.createElement("li");
        const h = body.querySelector("h1, h2, h3, h4, h5, h6");
        if (h) {
          li.append(make(doc, "strong", h.innerHTML));
          li.append(" ");
        }
        const ps = [...body.querySelectorAll("p")].filter((p) => norm(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm(body.textContent);
        if (norm(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm(n.textContent)) {
            run = run || doc.createElement("p");
            run.append(n.textContent.replace(/[\s\u00a0]+/g, " "));
          } else if (run) run.append(" ");
          return;
        }
        if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
        const tag = n.tagName.toUpperCase();
        if (tag === "BR") {
          if (run) run.append(doc.createElement("br"));
          return;
        }
        if (INLINE.test(tag) && !n.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section")) {
          if (n.querySelector("img") && !norm(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm(n.textContent)) return;
          run = run || doc.createElement("p");
          run.append(n.cloneNode(true));
          return;
        }
        flush();
        if (isWidget(n)) {
          widget(doc, n, items, opts);
          return;
        }
        if (isCon(n)) {
          walkContainer(doc, n, items, opts);
          return;
        }
        if (HEADING.test(tag)) {
          if (norm(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm(list.textContent)) push(items, { kind: "list", el: list }, container);
          return;
        }
        if (tag === "TABLE" || tag === "BLOCKQUOTE" || tag === "PRE") {
          push(items, { kind: "text", el: clean(n.cloneNode(true)) }, container);
          return;
        }
        if (tag === "IMG") {
          push(items, imageItem(doc, n), container);
          return;
        }
        if (n.classList.contains("secao-numeros")) {
          push(items, stepsList(doc, n), container);
          return;
        }
        flow(doc, n, items, opts);
      });
      flush();
    }
    function headingItem(doc, title, fallbackTag) {
      if (!title || !norm(title.textContent)) return null;
      const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
      const el = clean(make(doc, tag, title.innerHTML));
      const a = title.closest("a[href]");
      if (a && !el.querySelector("a")) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        while (el.firstChild) link.append(el.firstChild);
        el.append(link);
      }
      return { kind: "heading", el, sourceTag: title.tagName };
    }
    function widget(doc, w, items, opts = {}) {
      if (hidden(w)) return;
      const type = widgetType(w);
      const c = w.querySelector(":scope > .elementor-widget-container") || w;
      switch (type) {
        case "heading":
        case "theme-post-title": {
          const t = c.querySelector(".elementor-heading-title") || c.querySelector("h1, h2, h3, h4, h5, h6, p");
          push(items, headingItem(doc, t, "p"), w);
          return;
        }
        case "image":
        case "theme-post-featured-image":
          c.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
          return;
        case "button": {
          const a = c.querySelector("a.elementor-button, a[href]");
          if (!a) return;
          const text = norm((a.querySelector(".elementor-button-text") || a).textContent);
          if (!text) return;
          const p = doc.createElement("p");
          const href = a.getAttribute("href");
          if (href) {
            const link = doc.createElement("a");
            link.href = fixHref(href);
            link.textContent = text;
            p.append(link);
          } else {
            p.textContent = text;
          }
          push(items, { kind: "button", el: p }, w);
          return;
        }
        case "icon-list": {
          const ul = doc.createElement("ul");
          c.querySelectorAll(".elementor-icon-list-item").forEach((it) => {
            const text = it.querySelector(".elementor-icon-list-text") || it;
            if (!norm(text.textContent)) return;
            const li = clean(make(doc, "li", text.innerHTML));
            const a = it.querySelector("a[href]");
            if (a && !li.querySelector("a")) {
              const link = doc.createElement("a");
              link.href = fixHref(a.getAttribute("href"));
              while (li.firstChild) link.append(li.firstChild);
              li.append(link);
            }
            ul.append(li);
          });
          if (ul.children.length) push(items, { kind: "list", el: ul }, w);
          return;
        }
        case "icon-box":
        case "image-box": {
          c.querySelectorAll(".elementor-icon-box-icon img, .elementor-image-box-img img").forEach((img) => push(items, imageItem(doc, img), w));
          const title = c.querySelector(".elementor-icon-box-title, .elementor-image-box-title");
          push(items, headingItem(doc, title, "h3"), w);
          const d = c.querySelector(".elementor-icon-box-description, .elementor-image-box-description");
          if (d && norm(d.textContent)) {
            const tmp = [];
            flow(doc, d, tmp, opts);
            if (!tmp.length) tmp.push({ kind: "text", el: clean(make(doc, "p", d.innerHTML)) });
            tmp.forEach((i) => push(items, i, w));
          }
          return;
        }
        case "divider":
          if (opts.dividers) push(items, { kind: "divider", el: null }, w);
          return;
        case "spacer":
        case "icon":
        case "menu-anchor":
          return;
        case "html":
          if (c.querySelector(".passo-numerado")) {
            push(items, stepsList(doc, c), w);
            return;
          }
          if (!norm(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
      if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2 && widgetType(widgets[0]) === "icon" && ["text-editor", "heading"].includes(widgetType(widgets[1]))) {
        const tmp = [];
        widget(doc, widgets[1], tmp, opts);
        const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
        const src = bgUrl(con);
        if (src) push(items, bgImageItem(doc, src), con);
        return;
      }
      kids.forEach((k) => {
        if (isWidget(k)) widget(doc, k, items, opts);
        else if (isCon(k)) walkContainer(doc, k, items, opts);
        else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
          const tmp = [];
          flow(doc, { childNodes: [k] }, tmp, opts);
          tmp.forEach((i) => push(items, i, con));
        }
      });
    };
    function collect(doc, root, opts = {}) {
      const items = [];
      if (isWidget(root)) widget(doc, root, items, opts);
      else if (isCon(root)) walkContainer(doc, root, items, opts);
      else flow(doc, root, items, opts);
      const out = [];
      items.forEach((it) => {
        const prev = out[out.length - 1];
        if (it.kind === "li") {
          if (prev && prev.kind === "list" && prev.liRun) {
            prev.el.append(it.el);
          } else {
            const ul = make(doc, "ul");
            ul.append(it.el);
            out.push({ kind: "list", el: ul, liRun: true, origin: it.origin });
          }
          return;
        }
        if (it.kind === "list" && prev && prev.kind === "list" && prev.el.tagName === it.el.tagName) {
          prev.el.append(...it.el.children);
          return;
        }
        if (opts.groupImages !== false && it.kind === "image" && prev && prev.kind === "image" && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement && prev.origin.closest(".e-con") === it.origin.closest(".e-con")) {
          prev.el.append(" ", ...it.el.childNodes);
          prev.group = true;
          return;
        }
        out.push(it);
      });
      return out;
    }
    function shape(k) {
      const s = [];
      if (isStrictGroup(k)) s.push("group");
      if (k.querySelector("img")) s.push("img");
      if (k.querySelector("h1, h2, h3, h4, h5, h6")) s.push("h");
      if (k.querySelector(".elementor-widget-button")) s.push("btn");
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm(n.textContent));
      if (text) s.push("text");
      return s.join("+");
    }
    function sameShapeGroup(kids) {
      const by = /* @__PURE__ */ new Map();
      kids.forEach((k) => {
        const s = shape(k);
        if (!by.has(s)) by.set(s, []);
        by.get(s).push(k);
      });
      let best = null;
      by.forEach((g) => {
        if (g.length >= 2 && (!best || g.length > best.length)) best = g;
      });
      return best;
    }
    function isStrictGroup(node) {
      const kids = contentKids(node);
      if (kids.length < 2) return false;
      if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
      const g = sameShapeGroup(kids);
      return !!g && g.length === kids.length;
    }
    function findItems(node) {
      const kids = contentKids(node);
      const group = sameShapeGroup(kids);
      if (group) return group.flatMap((k) => isStrictGroup(k) ? findItems(k) : [k]);
      for (const k of kids) {
        const sub = findItems(k);
        if (sub.length >= 2) return sub;
      }
      return [];
    }
    function outside(root, items) {
      const before = [];
      const after = [];
      if (!items.length) return { before, after };
      const first = items[0];
      const walk = (node) => {
        kidsOf(node).forEach((k) => {
          if (items.includes(k) || !isEl(k)) return;
          if (items.some((it) => k.contains(it))) {
            walk(k);
            return;
          }
          if (!hasContent(k)) return;
          const isBefore = !!(k.compareDocumentPosition(first) & 4);
          (isBefore ? before : after).push(k);
        });
      };
      walk(root);
      return { before, after };
    }
    function moveOut(doc, element, chunks, where) {
      const nodes = [];
      chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => it.el && nodes.push(it.el)));
      if (!nodes.length) return;
      if (where === "before") element.before(...nodes);
      else element.after(...nodes);
    }
    function blockName(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm,
      isEl,
      isWidget,
      isCon,
      hasContent,
      fixHref,
      fixLinks,
      urlFromCss: urlFromCss2,
      settings,
      unlazy,
      imgSrc,
      bgUrl,
      videoUrl,
      canonicalVideo,
      widgetType,
      kidsOf,
      contentKids,
      make,
      clean,
      retag,
      imageItem,
      bgImageItem,
      collect,
      findItems,
      outside,
      moveOut,
      blockName,
      LEGACY_ROOTS
    };
  })();
  function parse7(element, { document, options, basePath } = {}) {
    const opts = options || [];
    if (isFaq(element, opts) && parseFaq(element, { document, options: opts })) return;
    parseLanding7(element, { document, options: opts, basePath: basePath || "" });
  }

  // tools/importer/parsers/table-article.js
  function cellContent(cell, document) {
    const frag = document.createElement("div");
    frag.innerHTML = cell.innerHTML.trim();
    frag.querySelectorAll("p").forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector("img, a")) p.remove();
    });
    return frag.childNodes.length ? [...frag.childNodes] : "";
  }
  function rowCells(tr) {
    return [...tr.children].filter((c) => /^(TH|TD)$/.test(c.tagName));
  }
  function parseLegacy3(element, { document }) {
    const table = element.tagName === "TABLE" ? element : element.querySelector("table");
    if (!table) return;
    const allRows = [...table.querySelectorAll(":scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr, :scope > tr")];
    if (!allRows.length) {
      table.remove();
      return;
    }
    let headerRow = table.querySelector(":scope > thead > tr");
    if (!headerRow) headerRow = allRows[0];
    const bodyRows = allRows.filter((tr) => tr !== headerRow && !(tr.parentElement.tagName === "THEAD"));
    const expand = (tr) => {
      const out = [];
      rowCells(tr).forEach((c) => {
        out.push(cellContent(c, document));
        const span = parseInt(c.getAttribute("colspan") || "1", 10);
        for (let i = 1; i < span; i += 1) out.push("");
      });
      return out;
    };
    const rows = [expand(headerRow), ...bodyRows.map(expand)].filter((r) => r.length);
    const colCount = Math.max(...rows.map((r) => r.length));
    rows.forEach((r) => {
      while (r.length < colCount) r.push("");
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "table-article", cells: rows });
    let target = table;
    const parent = table.parentElement;
    if (parent && parent.tagName === "DIV" && !parent.matches(".elementor-widget-container, .elementor-widget-theme-post-content") && [...parent.children].length === 1 && parent.textContent.trim() === table.textContent.trim()) {
      target = parent;
    }
    if (target === table) {
      element.replaceWith(block);
    } else {
      target.replaceWith(block);
    }
  }
  var CHECK = "\u2713";
  function landingCell(document, cell) {
    const text = EL8.norm(cell.textContent);
    const icon = cell.querySelector('svg, .check-icon, img[src*="check" i], img[alt*="check" i], .icon-check');
    if (!text && icon || /^(✓|✔|✔️|:check:)$/u.test(text)) return CHECK;
    if (!text) return "";
    const div = EL8.make(document, "div", cell.innerHTML);
    EL8.clean(div);
    div.querySelectorAll("*").forEach((n) => {
      if (!n.childNodes.length && !/^(BR|IMG)$/.test(n.tagName)) n.remove();
    });
    [...div.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.textContent = n.textContent.replace(/\s+/g, " ");
    });
    const blocks = div.querySelectorAll("p, ul, ol");
    if (!blocks.length) return EL8.norm(div.innerHTML) === EL8.norm(div.textContent) ? text : [...div.childNodes];
    return [...div.childNodes];
  }
  function landingRows(document, element) {
    const rows = [];
    const features = element.matches(".tabela-beneficios") ? element : element.querySelector(".tabela-beneficios");
    if (features) {
      features.querySelectorAll(".tabela-beneficios-row").forEach((row) => {
        const left = row.querySelector(".tabela-beneficios-left");
        const right = row.querySelector(".tabela-beneficios-right");
        if (!left && !right) return;
        rows.push([left ? landingCell(document, left) : "", right ? landingCell(document, right) : ""]);
      });
      return rows;
    }
    const table = element.tagName === "TABLE" ? element : element.querySelector("table");
    if (!table) return rows;
    const trs = [...table.querySelectorAll("tr")].filter((tr) => tr.closest("table") === table);
    const headerCells = [...element.querySelectorAll(".card-tabs-header > *")].map((n) => EL8.norm(n.textContent));
    let body = trs;
    if (headerCells.length) {
      rows.push(["", ...headerCells]);
    } else {
      const head = table.querySelector("thead tr") || trs.find((tr) => tr.querySelector("th"));
      if (head) {
        rows.push([...head.children].map((c) => landingCell(document, c)));
        body = trs.filter((tr) => tr !== head);
      }
    }
    body.forEach((tr) => {
      const cells = [...tr.children].filter((c) => /^(TD|TH)$/.test(c.tagName));
      if (!cells.length || cells.every((c) => !EL8.norm(c.textContent) && !c.querySelector("svg, img"))) return;
      const out = [];
      cells.forEach((c) => {
        out.push(landingCell(document, c));
        const span = parseInt(c.getAttribute("colspan") || "1", 10);
        for (let i = 1; i < span; i += 1) out.push("");
      });
      rows.push(out);
    });
    return rows;
  }
  function parseLanding8(element, { document, options }) {
    const rows = landingRows(document, element);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const colCount = Math.max(...rows.map((r) => r.length));
    rows.forEach((r) => {
      while (r.length < colCount) r.push("");
    });
    const block = WebImporter.Blocks.createBlock(document, { name: EL8.blockName("table-article", options), cells: rows });
    element.replaceWith(block);
  }
  var EL8 = (() => {
    const HEADING = /^H[1-6]$/;
    const INLINE = /^(A|ABBR|B|BDI|BR|CODE|EM|I|LABEL|MARK|Q|S|SMALL|SPAN|STRONG|SUB|SUP|U|FONT|TIME)$/;
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|LINK|META|TEMPLATE|FORM|INPUT|SELECT|TEXTAREA|BUTTON|IFRAME|VIDEO|SOURCE|CANVAS)$/i;
    const WIDGET_TYPES = [
      "theme-post-featured-image",
      "theme-post-title",
      "text-editor",
      "heading",
      "image-box",
      "icon-box",
      "icon-list",
      "image",
      "button",
      "divider",
      "spacer",
      "icon",
      "html",
      "shortcode",
      "accordion",
      "toggle",
      "n-accordion",
      "nested-accordion",
      "n-tabs",
      "n-carousel",
      "loop-grid",
      "template",
      "video",
      "menu-anchor"
    ];
    const norm = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm(n.textContent) || !!n.querySelector("img");
    function fixHref(href) {
      if (!href || /^(#|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith("//")) return href;
      const m = href.match(/^([a-z][a-z0-9+.-]*:\/\/[^/?#]*)?([^?#]*)(.*)$/i);
      return m ? `${m[1] || ""}${m[2].replace(/\/{2,}/g, "/")}${m[3]}` : href;
    }
    function fixLinks(root) {
      if (!isEl(root)) return root;
      const links = [...root.querySelectorAll("a[href]")];
      if (root.matches("a[href]")) links.unshift(root);
      links.forEach((a) => a.setAttribute("href", fixHref(a.getAttribute("href"))));
      return root;
    }
    function urlFromCss2(value) {
      if (!value) return null;
      const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
    }
    function settings(el) {
      const raw = isEl(el) ? el.getAttribute("data-settings") : null;
      if (!raw) return {};
      try {
        return JSON.parse(raw) || {};
      } catch (e) {
        return {};
      }
    }
    function unlazy(doc) {
      doc.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded), .elementor-section:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    }
    function imgSrc(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss2(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc(img) || null;
      }
      return src || null;
    }
    function canonicalVideo(raw) {
      if (!raw) return null;
      let u;
      try {
        u = new URL(raw, "https://bradescobank.com/");
      } catch (e) {
        return null;
      }
      const host = u.hostname.replace(/^www\.|^m\./, "");
      if (/(^|\.)vimeo\.com$/.test(host)) {
        const id = (u.pathname.match(/(\d{5,})/) || [])[1];
        return id ? `https://vimeo.com/${id}` : null;
      }
      if (host === "youtu.be") {
        const id = u.pathname.split("/")[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
        const id = u.searchParams.get("v") || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
        return id ? `https://www.youtube.com/watch?v=${id}` : null;
      }
      if (/\.(mp4|webm|ogg|ogv|mov)$/i.test(u.pathname)) return u.href;
      return null;
    }
    function videoUrl(el) {
      const cands = [];
      [el, ...el.querySelectorAll("[data-settings]")].forEach((n) => {
        const s = settings(n);
        if (s.background_video_link) cands.push(s.background_video_link);
      });
      el.querySelectorAll("video").forEach((v) => {
        cands.push(v.getAttribute("src"));
        v.querySelectorAll("source").forEach((s) => cands.push(s.getAttribute("src")));
      });
      el.querySelectorAll("iframe").forEach((f) => cands.push(f.getAttribute("src") || f.getAttribute("data-src")));
      for (const c of cands) {
        const v = canonicalVideo(c);
        if (v) return v;
      }
      return null;
    }
    function widgetType(w) {
      const t = w.getAttribute("data-widget_type");
      if (t) return t.split(".")[0];
      const cls = [...w.classList].map((c) => (c.match(/^elementor-widget-([a-z0-9-]+)$/) || [])[1]).filter((c) => c && !/__|--/.test(c));
      return WIDGET_TYPES.find((type) => cls.includes(type)) || cls[0] || "";
    }
    function kidsOf(node) {
      const out = [];
      const inners = [...node.children].filter((c) => c.classList.contains("e-con-inner"));
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
      if (html !== void 0) el.innerHTML = String(html).trim();
      return el;
    }
    function clean(el) {
      el.querySelectorAll('svg, script, style, noscript, button, i.fa, i[class*="icon"]').forEach((n) => n.remove());
      el.querySelectorAll("[class], [style], [id]").forEach((n) => {
        n.removeAttribute("class");
        n.removeAttribute("style");
        n.removeAttribute("id");
      });
      el.querySelectorAll("span").forEach((s) => {
        if (!s.attributes.length) s.replaceWith(...s.childNodes);
      });
      el.querySelectorAll("a:not([href])").forEach((a) => a.replaceWith(...a.childNodes));
      for (let guard = 0; guard < 10; guard += 1) {
        const nested = [...el.querySelectorAll("strong > strong, b > b, em > em, i > i, u > u, sup > sup")].filter((n) => n.parentElement.childNodes.length === 1);
        if (!nested.length) break;
        nested.forEach((n) => {
          if (n.isConnected) n.replaceWith(...n.childNodes);
        });
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
      const out = doc.createElement("img");
      out.src = src;
      const alt = img.getAttribute("alt");
      if (alt) out.alt = alt;
      const p = doc.createElement("p");
      const a = keepLink ? img.closest("a[href]") : null;
      if (a && a.getAttribute("href") && !/^#?$/.test(a.getAttribute("href"))) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        link.append(out);
        p.append(link);
      } else {
        p.append(out);
      }
      return { kind: "image", el: p, img: out };
    }
    function bgImageItem(doc, src, alt = "") {
      const img = doc.createElement("img");
      img.src = src;
      img.alt = alt;
      const p = doc.createElement("p");
      p.append(img);
      return { kind: "image", el: p, img };
    }
    function push(items, item, origin) {
      if (!item) return;
      item.origin = origin;
      items.push(item);
    }
    function stepsList(doc, c) {
      const list = doc.createElement(c.querySelector(".numero-passo img") ? "ul" : "ol");
      c.querySelectorAll(".passo-numerado").forEach((step) => {
        const body = step.querySelector(".texto-passo") || step;
        const li = doc.createElement("li");
        const h = body.querySelector("h1, h2, h3, h4, h5, h6");
        if (h) {
          li.append(make(doc, "strong", h.innerHTML));
          li.append(" ");
        }
        const ps = [...body.querySelectorAll("p")].filter((p) => norm(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm(body.textContent);
        if (norm(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm(n.textContent)) {
            run = run || doc.createElement("p");
            run.append(n.textContent.replace(/[\s\u00a0]+/g, " "));
          } else if (run) run.append(" ");
          return;
        }
        if (!isEl(n) || hidden(n) || SKIP.test(n.tagName)) return;
        const tag = n.tagName.toUpperCase();
        if (tag === "BR") {
          if (run) run.append(doc.createElement("br"));
          return;
        }
        if (INLINE.test(tag) && !n.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, table, section")) {
          if (n.querySelector("img") && !norm(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm(n.textContent)) return;
          run = run || doc.createElement("p");
          run.append(n.cloneNode(true));
          return;
        }
        flush();
        if (isWidget(n)) {
          widget(doc, n, items, opts);
          return;
        }
        if (isCon(n)) {
          walkContainer(doc, n, items, opts);
          return;
        }
        if (HEADING.test(tag)) {
          if (norm(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm(list.textContent)) push(items, { kind: "list", el: list }, container);
          return;
        }
        if (tag === "TABLE" || tag === "BLOCKQUOTE" || tag === "PRE") {
          push(items, { kind: "text", el: clean(n.cloneNode(true)) }, container);
          return;
        }
        if (tag === "IMG") {
          push(items, imageItem(doc, n), container);
          return;
        }
        if (n.classList.contains("secao-numeros")) {
          push(items, stepsList(doc, n), container);
          return;
        }
        flow(doc, n, items, opts);
      });
      flush();
    }
    function headingItem(doc, title, fallbackTag) {
      if (!title || !norm(title.textContent)) return null;
      const tag = HEADING.test(title.tagName) ? title.tagName.toLowerCase() : fallbackTag;
      const el = clean(make(doc, tag, title.innerHTML));
      const a = title.closest("a[href]");
      if (a && !el.querySelector("a")) {
        const link = doc.createElement("a");
        link.href = fixHref(a.getAttribute("href"));
        while (el.firstChild) link.append(el.firstChild);
        el.append(link);
      }
      return { kind: "heading", el, sourceTag: title.tagName };
    }
    function widget(doc, w, items, opts = {}) {
      if (hidden(w)) return;
      const type = widgetType(w);
      const c = w.querySelector(":scope > .elementor-widget-container") || w;
      switch (type) {
        case "heading":
        case "theme-post-title": {
          const t = c.querySelector(".elementor-heading-title") || c.querySelector("h1, h2, h3, h4, h5, h6, p");
          push(items, headingItem(doc, t, "p"), w);
          return;
        }
        case "image":
        case "theme-post-featured-image":
          c.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img, opts.imageLinks !== false), w));
          return;
        case "button": {
          const a = c.querySelector("a.elementor-button, a[href]");
          if (!a) return;
          const text = norm((a.querySelector(".elementor-button-text") || a).textContent);
          if (!text) return;
          const p = doc.createElement("p");
          const href = a.getAttribute("href");
          if (href) {
            const link = doc.createElement("a");
            link.href = fixHref(href);
            link.textContent = text;
            p.append(link);
          } else {
            p.textContent = text;
          }
          push(items, { kind: "button", el: p }, w);
          return;
        }
        case "icon-list": {
          const ul = doc.createElement("ul");
          c.querySelectorAll(".elementor-icon-list-item").forEach((it) => {
            const text = it.querySelector(".elementor-icon-list-text") || it;
            if (!norm(text.textContent)) return;
            const li = clean(make(doc, "li", text.innerHTML));
            const a = it.querySelector("a[href]");
            if (a && !li.querySelector("a")) {
              const link = doc.createElement("a");
              link.href = fixHref(a.getAttribute("href"));
              while (li.firstChild) link.append(li.firstChild);
              li.append(link);
            }
            ul.append(li);
          });
          if (ul.children.length) push(items, { kind: "list", el: ul }, w);
          return;
        }
        case "icon-box":
        case "image-box": {
          c.querySelectorAll(".elementor-icon-box-icon img, .elementor-image-box-img img").forEach((img) => push(items, imageItem(doc, img), w));
          const title = c.querySelector(".elementor-icon-box-title, .elementor-image-box-title");
          push(items, headingItem(doc, title, "h3"), w);
          const d = c.querySelector(".elementor-icon-box-description, .elementor-image-box-description");
          if (d && norm(d.textContent)) {
            const tmp = [];
            flow(doc, d, tmp, opts);
            if (!tmp.length) tmp.push({ kind: "text", el: clean(make(doc, "p", d.innerHTML)) });
            tmp.forEach((i) => push(items, i, w));
          }
          return;
        }
        case "divider":
          if (opts.dividers) push(items, { kind: "divider", el: null }, w);
          return;
        case "spacer":
        case "icon":
        case "menu-anchor":
          return;
        case "html":
          if (c.querySelector(".passo-numerado")) {
            push(items, stepsList(doc, c), w);
            return;
          }
          if (!norm(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
      if (opts.iconItems !== false && kids.length === 2 && widgets.length === 2 && widgetType(widgets[0]) === "icon" && ["text-editor", "heading"].includes(widgetType(widgets[1]))) {
        const tmp = [];
        widget(doc, widgets[1], tmp, opts);
        const texts = tmp.filter((i) => i.el && norm(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
        const src = bgUrl(con);
        if (src) push(items, bgImageItem(doc, src), con);
        return;
      }
      kids.forEach((k) => {
        if (isWidget(k)) widget(doc, k, items, opts);
        else if (isCon(k)) walkContainer(doc, k, items, opts);
        else if (/^(P|H[1-6]|UL|OL)$/.test(k.tagName)) {
          const tmp = [];
          flow(doc, { childNodes: [k] }, tmp, opts);
          tmp.forEach((i) => push(items, i, con));
        }
      });
    };
    function collect(doc, root, opts = {}) {
      const items = [];
      if (isWidget(root)) widget(doc, root, items, opts);
      else if (isCon(root)) walkContainer(doc, root, items, opts);
      else flow(doc, root, items, opts);
      const out = [];
      items.forEach((it) => {
        const prev = out[out.length - 1];
        if (it.kind === "li") {
          if (prev && prev.kind === "list" && prev.liRun) {
            prev.el.append(it.el);
          } else {
            const ul = make(doc, "ul");
            ul.append(it.el);
            out.push({ kind: "list", el: ul, liRun: true, origin: it.origin });
          }
          return;
        }
        if (it.kind === "list" && prev && prev.kind === "list" && prev.el.tagName === it.el.tagName) {
          prev.el.append(...it.el.children);
          return;
        }
        if (opts.groupImages !== false && it.kind === "image" && prev && prev.kind === "image" && prev.origin && it.origin && prev.origin.parentElement && it.origin.parentElement && prev.origin.closest(".e-con") === it.origin.closest(".e-con")) {
          prev.el.append(" ", ...it.el.childNodes);
          prev.group = true;
          return;
        }
        out.push(it);
      });
      return out;
    }
    function shape(k) {
      const s = [];
      if (isStrictGroup(k)) s.push("group");
      if (k.querySelector("img")) s.push("img");
      if (k.querySelector("h1, h2, h3, h4, h5, h6")) s.push("h");
      if (k.querySelector(".elementor-widget-button")) s.push("btn");
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm(n.textContent));
      if (text) s.push("text");
      return s.join("+");
    }
    function sameShapeGroup(kids) {
      const by = /* @__PURE__ */ new Map();
      kids.forEach((k) => {
        const s = shape(k);
        if (!by.has(s)) by.set(s, []);
        by.get(s).push(k);
      });
      let best = null;
      by.forEach((g) => {
        if (g.length >= 2 && (!best || g.length > best.length)) best = g;
      });
      return best;
    }
    function isStrictGroup(node) {
      const kids = contentKids(node);
      if (kids.length < 2) return false;
      if (kidsOf(node).some((k) => isWidget(k) && hasContent(k))) return false;
      const g = sameShapeGroup(kids);
      return !!g && g.length === kids.length;
    }
    function findItems(node) {
      const kids = contentKids(node);
      const group = sameShapeGroup(kids);
      if (group) return group.flatMap((k) => isStrictGroup(k) ? findItems(k) : [k]);
      for (const k of kids) {
        const sub = findItems(k);
        if (sub.length >= 2) return sub;
      }
      return [];
    }
    function outside(root, items) {
      const before = [];
      const after = [];
      if (!items.length) return { before, after };
      const first = items[0];
      const walk = (node) => {
        kidsOf(node).forEach((k) => {
          if (items.includes(k) || !isEl(k)) return;
          if (items.some((it) => k.contains(it))) {
            walk(k);
            return;
          }
          if (!hasContent(k)) return;
          const isBefore = !!(k.compareDocumentPosition(first) & 4);
          (isBefore ? before : after).push(k);
        });
      };
      walk(root);
      return { before, after };
    }
    function moveOut(doc, element, chunks, where) {
      const nodes = [];
      chunks.forEach((chunk) => collect(doc, chunk, { bgImages: false }).forEach((it) => it.el && nodes.push(it.el)));
      if (!nodes.length) return;
      if (where === "before") element.before(...nodes);
      else element.after(...nodes);
    }
    function blockName(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm,
      isEl,
      isWidget,
      isCon,
      hasContent,
      fixHref,
      fixLinks,
      urlFromCss: urlFromCss2,
      settings,
      unlazy,
      imgSrc,
      bgUrl,
      videoUrl,
      canonicalVideo,
      widgetType,
      kidsOf,
      contentKids,
      make,
      clean,
      retag,
      imageItem,
      bgImageItem,
      collect,
      findItems,
      outside,
      moveOut,
      blockName,
      LEGACY_ROOTS
    };
  })();
  var INFO_ROOTS4 = ["1178", "2212", "1481", "1401", "2391", "2498", "467", "631", "6834", "2456", "2514", "2527"].map((id) => `.elementor-${id}`).join(", ");
  var BLOCK_ATTR = "data-excat-block";
  function isInfoPage4(element, template) {
    if (template) return template === "info-page";
    return !!element.closest(INFO_ROOTS4);
  }
  var hiddenDesktop = (n) => n.classList.contains("elementor-hidden-desktop");
  function calendarRows(element) {
    const cols = [".elementor-element-19c2d74", ".elementor-element-65d8928"].map((s) => element.querySelector(s)).filter(Boolean);
    const hosts = cols.length ? cols : [element];
    const sel = ".ticker-calendar h1, .ticker-calendar h2, .ticker-calendar h3, .ticker-calendar h4, .ticker-calendar p";
    let heads = hosts.flatMap((h) => [...h.querySelectorAll(sel)]);
    if (!heads.length) heads = hosts.flatMap((h) => [...h.querySelectorAll("h3")]);
    const rows = [];
    heads.forEach((h) => {
      if (h.closest(".elementor-hidden-desktop")) return;
      const date = [];
      const name = [];
      let seenBreak = false;
      [...h.childNodes].forEach((n) => {
        if (n.nodeType === 1 && n.tagName === "BR") {
          seenBreak = true;
          return;
        }
        (seenBreak ? name : date).push(n.textContent);
      });
      const d = EL8.norm(date.join(""));
      const nm = EL8.norm(name.join(""));
      if (d || nm) rows.push([d, nm]);
    });
    return rows;
  }
  function noticeCells(row) {
    const host = row.querySelector(":scope > .e-con-inner") || row;
    return [...host.children].filter((c) => c.classList.contains("e-con") && !hiddenDesktop(c));
  }
  function isNoticeRow(n) {
    if (!n || n.nodeType !== 1 || !n.classList.contains("e-con") || hiddenDesktop(n)) return false;
    if (n.hasAttribute(BLOCK_ATTR)) return false;
    const host = n.querySelector(":scope > .e-con-inner") || n;
    if ([...host.children].some((c) => EL8.isWidget(c))) return false;
    return noticeCells(n).length >= 2;
  }
  function noticeCell(document, cell) {
    const els = EL8.collect(document, cell, { bgImages: false }).map((it) => it.el).filter(Boolean);
    const text = els.map((e) => EL8.norm(e.textContent)).join("");
    if (!els.length || /^[.\s]*$/.test(text) && !els.some((e) => e.querySelector && e.querySelector("img"))) return "";
    return els;
  }
  function parseNotice(element, { document, options }) {
    if (noticeCells(element).length < 2) {
      parseLanding8(element, { document, options });
      return;
    }
    const trs = [element];
    let n = element.nextElementSibling;
    while (n && n.tagName !== "HR" && !n.hasAttribute(BLOCK_ATTR) && isNoticeRow(n)) {
      trs.push(n);
      n = n.nextElementSibling;
    }
    const rows = trs.map((tr) => noticeCells(tr).map((c) => noticeCell(document, c)));
    const colCount = Math.max(...rows.map((r) => r.length));
    rows.forEach((r) => {
      while (r.length < colCount) r.push("");
    });
    const block = WebImporter.Blocks.createBlock(document, { name: EL8.blockName("table-article", options), cells: rows });
    trs.slice(1).forEach((tr) => tr.remove());
    element.replaceWith(block);
  }
  function parseCalendar(element, { document, options }) {
    const rows = calendarRows(element);
    if (!rows.length) {
      parseLanding8(element, { document, options });
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL8.blockName("table-article", options), cells: rows });
    element.replaceWith(block);
  }
  function articleRichCell(document, cell) {
    if (!cell) return "";
    const text = EL8.norm(cell.textContent);
    if (!text && !cell.querySelector("img")) return "";
    const div = EL8.clean(EL8.make(document, "div", cell.innerHTML));
    div.querySelectorAll("p").forEach((p) => {
      if (!EL8.norm(p.textContent) && !p.querySelector("img")) p.remove();
    });
    [...div.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.textContent = n.textContent.replace(/[\s\u00a0]+/g, " ");
    });
    if (!div.children.length) return text;
    while (div.firstChild && div.firstChild.nodeType === 3 && !EL8.norm(div.firstChild.textContent)) div.firstChild.remove();
    while (div.lastChild && div.lastChild.nodeType === 3 && !EL8.norm(div.lastChild.textContent)) div.lastChild.remove();
    return [...div.childNodes];
  }
  function articleRichExpand(tr) {
    const out = [];
    rowCells(tr).forEach((c) => {
      out.push(c);
      const span = parseInt(c.getAttribute("colspan") || "1", 10);
      for (let i = 1; i < span; i += 1) out.push(null);
    });
    return out;
  }
  function parseArticleRich3(element, { document, options }) {
    const table = element.tagName === "TABLE" ? element : element.querySelector("table");
    if (!table || table.closest(".bdc-calc")) return;
    const own = (tr) => tr.closest("table") === table;
    const allRows = [...table.querySelectorAll("tr")].filter(own);
    if (!allRows.length) return;
    let headerRow = [...table.querySelectorAll("thead tr")].find(own) || null;
    if (!headerRow && rowCells(allRows[0]).length && rowCells(allRows[0]).every((c) => c.tagName === "TH")) {
      headerRow = allRows[0];
    }
    const bodyRows = allRows.filter((tr) => tr !== headerRow && !(tr.parentElement && tr.parentElement.tagName === "THEAD"));
    const head = headerRow ? articleRichExpand(headerRow) : null;
    const body = bodyRows.map(articleRichExpand).filter((r) => r.length);
    const colCount = Math.max(head ? head.length : 0, ...body.map((r) => r.length));
    if (!colCount) return;
    const filled = (c) => !!c && (!!EL8.norm(c.textContent) || !!c.querySelector("img"));
    const keep = [];
    for (let i = 0; i < colCount; i += 1) {
      if (!body.length ? head && filled(head[i]) : body.some((r) => filled(r[i]))) keep.push(i);
    }
    if (!keep.length) return;
    const rows = [];
    if (head) rows.push(keep.map((i) => articleRichCell(document, head[i])));
    body.forEach((r) => {
      if (!keep.some((i) => filled(r[i]))) return;
      rows.push(keep.map((i) => articleRichCell(document, r[i])));
    });
    if (!rows.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: EL8.blockName("table-article", options), cells: rows });
    element.replaceWith(block);
  }
  function parse8(element, { document, options, basePath, template } = {}) {
    const opts = options || [];
    if (template === "article-rich") {
      parseArticleRich3(element, { document, options: opts, basePath: basePath || "" });
      return;
    }
    if (isInfoPage4(element, template) && (opts.includes("notice") || opts.includes("calendar"))) {
      if (opts.includes("notice")) parseNotice(element, { document, options: opts });
      else parseCalendar(element, { document, options: opts });
      return;
    }
    if (element.closest(EL8.LEGACY_ROOTS)) {
      parseLegacy3(element, { document });
      return;
    }
    parseLanding8(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/transformers/bradesco-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Cookie Notice plugin: <div id="cookie-notice" class="cookie-revoke-hidden ...">
        "#cookie-notice",
        // WPML development-site banner: <div class="otgs-development-site-front-end">
        ".otgs-development-site-front-end",
        // Blocksy mobile drawer: <div class="ct-drawer-canvas"> (contains #offcanvas)
        ".ct-drawer-canvas",
        // accessiBe widget: <access-widget-ui>, <span class="acsb-sr-alert acsb-sr-only">,
        // <a class="acsb-sr-only">, <div class="acsb-trigger acsb-widget">
        "access-widget-ui",
        ".acsb-sr-only",
        ".acsb-trigger",
        // Mobile duplicate of hero + audience (elementor-hidden-desktop elementor-hidden-laptop)
        ".elementor-element-b9a3d24",
        // Containers hidden on every breakpoint
        ".elementor-element-6e9c8f1",
        ".elementor-element-2f7416d",
        // Empty decorative divider containers
        ".elementor-element-df3b3d3",
        ".elementor-element-1191c87",
        // --- Article (single post) template chrome; absent on the homepage ---
        // Decorative gradient strip: <div class="elementor-element elementor-element-df751d4 e-con-full ...">
        ".elementor-location-single > .elementor-element-df751d4",
        // Blog sub-menu (Menu toggle / Saved Articles / Home pill):
        // <div class="elementor-element elementor-element-e780a37 e-con-full bb-blog-menu ...">
        ".bb-blog-menu",
        // Favorite/bookmark shortcode widget wrapper + inner <div class="favorite-container">
        ".elementor-element-a848acf",
        ".favorite-container",
        // --- Generic Elementor rules (non-breaking for home/article) ---
        // Elements not visible on desktop: mobile/tablet duplicates and elements
        // hidden at every breakpoint. Class-based on purpose (element ids are
        // reused across pages, e.g. zelle/careers .elementor-element-4d27485).
        // Home: b9a3d24, 6e9c8f1, 2f7416d (already listed above); article: none.
        ".elementor-hidden-desktop",
        // Swiper loop clones: <div class="swiper-slide swiper-slide-duplicate ...">
        // (visa-infinite carousel). Does NOT match real slides that only carry
        // swiper-slide-duplicate-prev/-next/-active state classes.
        ".swiper-slide-duplicate"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Skip link: <a class="skip-link screen-reader-text" href="#main">
        ".skip-link",
        // Site header: <header id="header" class="ct-header">
        "#header",
        // Elementor footer template: <footer class="elementor elementor-6228 elementor-location-footer">
        // (contains .elementor-element-3500dbfc, -71ad2869, -6b13f498, -f98f3fe)
        "footer",
        ".elementor-6228",
        ".elementor-element-3500dbfc",
        ".elementor-element-71ad2869",
        ".elementor-element-6b13f498",
        ".elementor-element-f98f3fe",
        // Elementor device-mode helper: <span id="elementor-device-mode">
        "#elementor-device-mode",
        // Noise: stylesheet links, scripts, styles, noscript, empty tracking iframe
        "link",
        "script",
        "style",
        "noscript",
        "iframe:not([src])"
      ]);
      element.querySelectorAll("p, h1, h2, h3, h4, h5, h6").forEach((el) => {
        if (el.closest("table")) return;
        if (el.querySelector("img, picture, video, iframe, svg, a")) return;
        if (el.textContent.replace(/ /g, "").trim() !== "") return;
        el.remove();
      });
    }
  }

  // tools/importer/transformers/bradesco-links.js
  var SOURCE_HOSTS = ["bradescobank.com", "www.bradescobank.com"];
  var REDIRECTS = {
    "/privacy-and-security.html": "/en/privacy-and-cookies",
    "/opt-out-form.html": "/en/opt-out-form",
    "/real-estate": "/en/real-estate",
    "/help": "/en/help",
    "/en/signature-gold": "/en/credit-card-signature-gold",
    "/en/investments": "/en/personal-bank/investments",
    "/certificate-of-deposit-bradesco": "/en/certificate-of-deposit-bradesco",
    "/en/credit-card": "/en/credit-cards",
    "/apex-fee-schedule": "https://bradescobank.com/wp-content/uploads/2026/01/APEX-Fee-Schedule-01.2026.pdf"
  };
  var KEEP_ABSOLUTE = /^\/(assets|wp-content|wp-admin|wp-includes|wp-json|feed)(\/|$)/;
  function toSitePath(href) {
    if (!href) return null;
    let url;
    try {
      url = new URL(href, "https://bradescobank.com/");
    } catch (e) {
      return null;
    }
    if (!SOURCE_HOSTS.includes(url.hostname)) return null;
    if (!/^https?:$/.test(url.protocol)) return null;
    if (KEEP_ABSOLUTE.test(url.pathname)) return null;
    let path = url.pathname.replace(/\/+$/, "") || "/";
    if (REDIRECTS[path]) path = REDIRECTS[path];
    if (/^https?:/.test(path)) return path;
    if (path === "/en" || path === "/index") path = "/";
    if (/^\/(pt|es)(\/|$)/.test(path)) return null;
    return `${path}${url.search}${url.hash}`;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    element.querySelectorAll("a[href]").forEach((a) => {
      const raw = a.getAttribute("href");
      if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return;
      const path = toSitePath(raw);
      if (path) a.setAttribute("href", path);
    });
  }

  // tools/importer/transformers/bradesco-info-page.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var BULLET_ATTR = "data-excat-info-bullets";
  var CSS_ATTR = "data-excat-info-css";
  var DECORATIVE_SELECTORS = [
    // institutional: "Detalhe corporate" stripe image containers (absolute-positioned
    // image widgets 6f712c1 / 925b212) next to the columns-media / grey sections
    ".elementor-6834 .elementor-element-c1bafdb",
    ".elementor-6834 .elementor-element-72b0fa3",
    // institutional: alt="Section background element" stripe image widget
    ".elementor-6834 .elementor-element-2428ec5",
    // institutional: empty spacer columns (6902f7c after the video hero, fa4f77a inside the
    // hero-promo instance 0796a69 > 2c90867)
    ".elementor-6834 .elementor-element-6902f7c",
    ".elementor-6834 .elementor-element-fa4f77a",
    // institutional: red strip divider (empty e-parent container)
    ".elementor-6834 .elementor-element-db86ed4",
    // other-disclosures: divisao.png (alt="Divisão") divider image widgets between the
    // document items of cards-feature 4fc6a9d (dividers are block CSS)
    ".elementor-467 .elementor-element-e21edd6",
    ".elementor-467 .elementor-element-c14a543",
    ".elementor-467 .elementor-element-44ba0ab",
    ".elementor-467 .elementor-element-d8bba28",
    ".elementor-467 .elementor-element-da17a8a",
    // cra-public-file: empty layout spacer next to the last document tile (in 220b4b9)
    ".elementor-631 .elementor-element-fcfa8ea",
    // privacy notice templates: invisible "." placeholder text widgets in the group rows
    // (Who we are / What we do / Definitions) of the details notice tables
    ".elementor-2456 .elementor-element-359ad53",
    ".elementor-2456 .elementor-element-11f654b",
    ".elementor-2456 .elementor-element-976b22f",
    ".elementor-2514 .elementor-element-b194630",
    ".elementor-2514 .elementor-element-abe6ed9",
    ".elementor-2514 .elementor-element-99b26a7"
  ];
  var H2_SELECTORS = [
    // about-us: "Bradesco Bank" / "Banco Bradesco SA" (<p> in .tam-seg-titulo widgets e6335aa, a67b587)
    ".elementor-2212 .tam-seg-titulo p",
    // about-us: "International presence in 6 countries besides Brazil:" (first <p> of widget 5c7c86e)
    ".elementor-2212 .elementor-element-5c7c86e p:first-child",
    // institutional: "Cash Management" (7323a63) / "Credit Solutions" (759ea43) heading widgets (h3)
    ".elementor-6834 .elementor-element-7323a63 h3",
    ".elementor-6834 .elementor-element-759ea43 h3",
    // other-disclosures: "Useful links" (<p> in widget 8690dff)
    ".elementor-467 .elementor-element-8690dff p"
  ];
  var PRIVACY_TEMPLATES = ["2456", "2514", "2519", "2527", "2539", "9803", "2542"];
  var NOTICE_ROWS = {
    2456: [
      "697c7f0",
      "f71cafb",
      "2d492cf",
      "765f5e0",
      "ed03cad",
      "e1d4462",
      "370c845",
      "3bf885c",
      "79b99f0",
      "25c853d",
      "f6ac3d7",
      "fb5dcaf",
      "6ba3229",
      "e65f866",
      "07e47b9",
      "0b32bc6",
      "77b4429",
      "e7b886d",
      "9ab7f41",
      "7c8e479",
      "dc75663",
      "48e0ecb",
      "5638301",
      "2eb989e"
    ],
    2514: [
      "8ecd117",
      "717d2c5",
      "f09cbb6",
      "08b3406",
      "0996d82",
      "9c9398f",
      "0b6d427",
      "250f509",
      "fba5984",
      "ab0b7cc",
      "08c5142",
      "ccbc17b",
      "f008461",
      "ecaad1f",
      "d30d6e6",
      "5d66697",
      "b5b9bc0",
      "ccbe8da",
      "a2798b7",
      "4c648f8",
      "67e4087",
      "bdddbfa",
      "166c5ca",
      "7cbc271"
    ],
    2527: [
      "a43783e",
      "1302451",
      "fcd6ed6",
      "6043491",
      "b00e01b",
      "4a9f9f2",
      "291e3c6",
      "df71a71",
      "b658d00",
      "99dc4e6",
      "4cc082b",
      "5c1d646"
    ]
  };
  var BULLET_IMG = 'img[src*="repeticao-de-grade"], img[src*="risto-colorido"], img.wp-image-1522, img.wp-image-2703';
  var WS = /^[\s ​]*$/;
  function normText(el) {
    return (el.textContent || "").replace(/[\s ​]+/g, " ").trim();
  }
  function rename(el, tag) {
    const doc = el.ownerDocument;
    const n = doc.createElement(tag);
    while (el.firstChild) n.append(el.firstChild);
    el.replaceWith(n);
    return n;
  }
  function moveAfter(el, ref) {
    if (el && ref && ref.parentNode && !el.contains(ref)) ref.after(el);
  }
  function mergeTiles(cards, extra) {
    if (!cards || !extra || cards.contains(extra) || extra.contains(cards)) return;
    const target = cards.querySelector(":scope > .e-con-inner") || cards;
    const source = extra.querySelector(":scope > .e-con-inner") || extra;
    [...source.children].forEach((tile) => target.append(tile));
    if (!normText(extra) && !extra.querySelector("img, picture, video, iframe")) extra.remove();
  }
  function trimNodes(nodes) {
    const trimEdge = (list, start) => {
      const seq = start ? list : [...list].reverse();
      for (const n of seq) {
        if (n.nodeType === 3) {
          n.textContent = start ? n.textContent.replace(/^[\s ]+/, "") : n.textContent.replace(/[\s ]+$/, "");
          if (n.textContent) return;
        } else if (n.nodeType === 1) {
          if (/^(IMG|PICTURE|BR)$/.test(n.tagName)) return;
          trimEdge([...n.childNodes], start);
          if (normText(n) || n.querySelector("img")) return;
        }
      }
    };
    trimEdge(nodes, true);
    trimEdge(nodes, false);
    return nodes.filter((n) => !(n.nodeType === 3 && n.textContent === "") && !(n.nodeType === 1 && !/^(IMG|PICTURE)$/.test(n.tagName) && !normText(n) && !n.querySelector("img")));
  }
  function isStrongOnly(nodes) {
    let hasStrong = false;
    for (const n of nodes) {
      if (n.nodeType === 3) {
        if (!WS.test(n.textContent)) return false;
      } else if (n.nodeType === 1) {
        if (/^(STRONG|B)$/.test(n.tagName)) {
          if (normText(n)) hasStrong = true;
        } else if (n.tagName === "BR" || WS.test(n.textContent)) {
        } else if (/^(SPAN|U|EM|I)$/.test(n.tagName)) {
          if (!isStrongOnly([...n.childNodes])) return false;
          hasStrong = true;
        } else {
          return false;
        }
      }
    }
    return hasStrong;
  }
  function isContinuation(prevText, text) {
    return /^[a-z]/.test(text) || /(\b(and|or|of|the|to|for|with|in|a|an)|[,\-–])$/i.test(prevText);
  }
  function convertBulletParagraph(p) {
    const doc = p.ownerDocument;
    const lines = [[]];
    [...p.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName === "BR") lines.push([]);
      else lines[lines.length - 1].push(n);
    });
    const out = [];
    let ul = null;
    let last = null;
    let para = null;
    lines.forEach((raw) => {
      const isBullet = raw.some((n) => n.nodeType === 1 && (n.matches(BULLET_IMG) || n.querySelector(BULLET_IMG)));
      raw.forEach((n) => {
        if (n.nodeType !== 1) return;
        if (n.matches(BULLET_IMG)) n.remove();
        else n.querySelectorAll(BULLET_IMG).forEach((img) => img.remove());
      });
      const nodes = trimNodes(raw.filter((n) => n.parentNode || n.nodeType === 3));
      if (!nodes.length || nodes.every((n) => n.nodeType === 3 && WS.test(n.textContent))) return;
      const text = nodes.map((n) => n.textContent).join("").replace(/[\s ]+/g, " ").trim();
      if (isBullet) {
        if (!ul) {
          ul = doc.createElement("ul");
          ul.setAttribute(BULLET_ATTR, "");
          out.push(ul);
        }
        const li = doc.createElement("li");
        li.append(...nodes);
        ul.append(li);
        last = { li, leadIn: isStrongOnly(nodes), text };
        para = null;
      } else if (last && (last.leadIn || isContinuation(last.text, text))) {
        if (last.leadIn) last.li.append(doc.createElement("br"));
        else last.li.append(doc.createTextNode(" "));
        last.li.append(...nodes);
        last.text = text;
        last.leadIn = false;
      } else {
        last = null;
        ul = null;
        if (para) {
          para.append(doc.createElement("br"), ...nodes);
        } else {
          para = doc.createElement("p");
          para.append(...nodes);
          out.push(para);
        }
      }
    });
    if (!out.length) {
      p.remove();
      return;
    }
    const prev = p.previousElementSibling;
    if (out[0].tagName === "UL" && prev && prev.tagName === "UL" && prev.hasAttribute(BULLET_ATTR)) {
      prev.append(...out[0].children);
      out.shift();
    }
    p.replaceWith(...out);
  }
  function ensureTemplateCss(doc, id, originalURL) {
    const href = `/wp-content/uploads/elementor/css/post-${id}.css`;
    const present = [...doc.querySelectorAll('link[rel="stylesheet"], style')].some((n) => (n.getAttribute("href") || "").includes(`post-${id}.css`) || n.getAttribute(CSS_ATTR) === id);
    if (present || !doc.head) return;
    try {
      let origin = "";
      try {
        origin = new URL(originalURL).origin;
      } catch (e) {
        origin = "";
      }
      const view = doc.defaultView;
      if (!view || !view.XMLHttpRequest) return;
      const xhr = new view.XMLHttpRequest();
      xhr.open("GET", `${origin}${href}`, false);
      xhr.send(null);
      if (xhr.status !== 200 || !xhr.responseText) return;
      const style = doc.createElement("style");
      style.setAttribute(CSS_ATTR, id);
      style.textContent = xhr.responseText;
      doc.head.append(style);
    } catch (e) {
    }
  }
  function fontInfo(el) {
    const view = el.ownerDocument.defaultView;
    if (!view || !view.getComputedStyle || !el.isConnected) return { size: 0, weight: 0 };
    try {
      let size = 0;
      [el, ...el.querySelectorAll("strong, b, span")].forEach((n) => {
        size = Math.max(size, parseFloat(view.getComputedStyle(n).fontSize) || 0);
      });
      const fw = view.getComputedStyle(el).fontWeight;
      const weight = fw === "bold" ? 700 : parseInt(fw, 10) || 0;
      return { size, weight };
    } catch (e) {
      return { size: 0, weight: 0 };
    }
  }
  function promoteTemplateHeadings(tpl, rowSelector) {
    const inNotice = (el) => !!(rowSelector && el.closest(rowSelector));
    const widgets = [...tpl.querySelectorAll(".elementor-widget-text-editor")];
    const first = widgets.find((w) => normText(w));
    let titleP = null;
    if (first && !inNotice(first)) {
      const ps = first.querySelectorAll("p");
      if (ps.length === 1 && normText(first) === normText(ps[0]) && normText(ps[0]).length <= 80 && !ps[0].querySelector("a, img, br")) titleP = ps[0];
    }
    widgets.forEach((w) => {
      if (inNotice(w)) return;
      w.querySelectorAll("p").forEach((p) => {
        if (p.closest("li, table")) return;
        const text = normText(p);
        if (!text || text.length > 150) return;
        if (p.querySelector("a, picture, ul, ol")) return;
        if ([...p.querySelectorAll("img")].some((img) => !img.matches(BULLET_IMG))) return;
        const nodes = [...p.childNodes].filter((n) => !(n.nodeType === 1 && n.matches(BULLET_IMG)));
        const segments = p.innerHTML.split(/<br\s*\/?>/i).filter((h2) => h2.replace(/<[^>]+>/g, "").replace(/&nbsp;|[\s ]/g, "") !== "");
        if (segments.length > 1) return;
        const strongOnly = isStrongOnly(nodes);
        const { size, weight } = fontInfo(p);
        let level = 0;
        if (p === titleP || size >= 20) level = 2;
        else if (size >= 17 && (strongOnly || weight >= 600)) level = 3;
        else if (strongOnly && (size === 0 || size >= 15)) level = 3;
        if (!level) return;
        p.querySelectorAll(BULLET_IMG).forEach((img) => img.remove());
        const h = p.ownerDocument.createElement(`h${level}`);
        h.textContent = text;
        p.replaceWith(h);
      });
    });
  }
  function transform3(hookName, element, payload) {
    const doc = element.ownerDocument;
    if (hookName === TransformHook2.beforeTransform) {
      WebImporter.DOMUtils.remove(element, DECORATIVE_SELECTORS);
      moveAfter(
        element.querySelector(".elementor-6834 .elementor-element-1980f3f"),
        element.querySelector(".elementor-6834 .elementor-element-0796a69")
      );
      moveAfter(
        element.querySelector(".elementor-1481 .elementor-element-6aca6cb"),
        element.querySelector(".elementor-1481 .elementor-element-81ae845")
      );
      mergeTiles(
        element.querySelector(".elementor-1178 .elementor-element-a2edf52"),
        element.querySelector(".elementor-1178 .elementor-element-ebf86a1")
      );
      mergeTiles(
        element.querySelector(".elementor-467 .elementor-element-4fc6a9d"),
        element.querySelector(".elementor-467 .elementor-element-0d1933e")
      );
      element.querySelectorAll(".elementor-1481 .elementor-element-865d32d img.img-repeat").forEach((img) => {
        const prev = img.previousSibling;
        const next = img.nextSibling;
        if (prev && prev.nodeType === 3) prev.textContent = prev.textContent.replace(/[\s ]+$/, "");
        if (next && next.nodeType === 3) next.textContent = next.textContent.replace(/^[\s ]+/, "");
        img.replaceWith(doc.createTextNode(" \u2022 "));
      });
      H2_SELECTORS.forEach((sel) => {
        element.querySelectorAll(sel).forEach((el) => {
          if (!normText(el) || el.querySelector("a, img")) return;
          rename(el, "h2");
        });
      });
      PRIVACY_TEMPLATES.forEach((id) => {
        element.querySelectorAll(`.elementor-${id}`).forEach((tpl) => {
          ensureTemplateCss(doc, id, payload && payload.params && payload.params.originalURL);
          const rows = NOTICE_ROWS[id] || [];
          const rowSelector = rows.map((r) => `.elementor-${id} .elementor-element-${r}`).join(", ");
          tpl.querySelectorAll("strong, b").forEach((s) => {
            let last = s.lastChild;
            while (last && last.nodeType === 3 && WS.test(last.textContent)) last = last.previousSibling;
            if (!last || last.nodeType !== 1 || last.tagName !== "BR" || !normText(s)) return;
            while (s.lastChild !== last) s.lastChild.remove();
            s.after(last);
          });
          promoteTemplateHeadings(tpl, rowSelector);
          const ps = /* @__PURE__ */ new Set();
          tpl.querySelectorAll(BULLET_IMG).forEach((img) => {
            const p = img.closest("p");
            if (p && tpl.contains(p)) ps.add(p);
            else img.remove();
          });
          ps.forEach((p) => {
            if (p.isConnected) convertBulletParagraph(p);
          });
        });
      });
    }
    if (hookName === TransformHook2.afterTransform) {
      element.querySelectorAll(`[${BULLET_ATTR}]`).forEach((el) => el.removeAttribute(BULLET_ATTR));
      doc.querySelectorAll(`style[${CSS_ATTR}]`).forEach((el) => el.remove());
    }
  }

  // tools/importer/transformers/bradesco-landing.js
  var TransformHook3 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var CONTACT_URL = "https://bradescobank.com/en/help/";
  var MEDIA_SELECTOR = "img, picture, video, iframe";
  var BULLET_ATTR2 = "data-excat-bullets";
  var BUTTON_ATTR = "data-excat-button";
  var DECORATIVE_SELECTORS2 = [
    // corporate: caminho-12.png red diagonal stripe (also alt="Section background element")
    ".elementor-1799 .elementor-element-439f262",
    // real-estate: elemento-real-2.png / elemento-real-3.png diagonal stripes
    ".elementor-1861 .elementor-element-bc6cbee",
    ".elementor-1861 .elementor-element-50607a3",
    // credit-cards: 1px vertical separator icons between wallet logos
    ".elementor-22451 .elementor-element-47d9f9b",
    ".elementor-22451 .elementor-element-6f7aab1",
    // zelle: Line-8.svg container, zelle-detalhe-1.svg container, image-12.webp
    // stripes (inside hero-promo .elementor-element-3bb0ed2), hero vetor-sup-1.svg /
    // vetor-inf-1.svg (inside hero-banner .elementor-element-eb18198)
    ".elementor-13944 .elementor-element-1bc281d",
    ".elementor-13944 .elementor-element-e74dae0",
    ".elementor-13944 .elementor-element-8ba202e",
    ".elementor-13944 .elementor-element-7ef6142",
    ".elementor-13944 .elementor-element-3beb4c5",
    // personal-bank/investments: dark-red strip image (image-4.svg)
    ".elementor-6840 .elementor-element-3ca1bbd",
    // private-bank: decorative white curve (caminho-52.svg) in the dark CTA band
    ".elementor-2871 .elementor-element-cfbc8cf",
    // visa-infinite: hidden "show less" image widget
    ".elementor-19290 .elementor-element-e214cd8"
  ];
  var TOGGLE_SELECTORS = [
    ".elementor-13944 .elementor-element-d5db71b",
    // zelle SHOW MORE (.zelle-show-more)
    ".elementor-19290 .elementor-element-9ba697e",
    // visa-infinite See more (.visa-infinite-show-more)
    ".zelle-show-more",
    ".zelle-show-less",
    ".visa-infinite-show-more",
    ".visa-infinite-show-less"
  ];
  var SLIDER_CONTROL_SELECTORS = [
    ".swiper-button-prev",
    ".swiper-button-next",
    ".elementor-swiper-button"
  ];
  var POPUP_SELECTORS = [
    ".elementor-location-popup",
    '[data-elementor-type="popup"]'
  ];
  function hasRootClass(el) {
    return /(^|\s)elementor-\d+(\s|$)/.test(el.className || "");
  }
  function getPageRoot(element) {
    const wpPage = element.querySelector('[data-elementor-type="wp-page"]');
    let first = null;
    const candidates = element.querySelectorAll("div.elementor");
    for (const el of candidates) {
      if (!hasRootClass(el)) continue;
      if (el.classList.contains("e-loop-item")) continue;
      if (el.closest("header, footer, .elementor-location-header, .elementor-location-footer, .elementor-location-popup")) continue;
      first = el;
      break;
    }
    if (wpPage && first && first !== wpPage && first.contains(wpPage)) return first;
    return wpPage || first;
  }
  function normText2(el) {
    return (el.textContent || "").replace(/[ ​\s]+/g, " ").trim();
  }
  function isContentEmpty(el) {
    return normText2(el) === "" && !el.querySelector(MEDIA_SELECTOR) && !el.matches(MEDIA_SELECTOR);
  }
  function backgroundUrl(el) {
    const view = el.ownerDocument.defaultView;
    const values = [el.style && el.style.backgroundImage];
    if (view && view.getComputedStyle) values.push(view.getComputedStyle(el).backgroundImage);
    for (const v of values) {
      const m = v && v.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
      if (m) return m[1];
    }
    return null;
  }
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function contactPlaceholder(doc) {
    const p = doc.createElement("p");
    const a = doc.createElement("a");
    a.href = CONTACT_URL;
    a.textContent = "Contact us";
    p.append(a);
    return p;
  }
  function transform4(hookName, element, payload) {
    const doc = element.ownerDocument;
    if (hookName === TransformHook3.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ...DECORATIVE_SELECTORS2,
        ...TOGGLE_SELECTORS,
        ...SLIDER_CONTROL_SELECTORS,
        ...POPUP_SELECTORS
      ]);
      element.querySelectorAll('img[alt="Section background element"]').forEach((img) => {
        (img.closest(".elementor-widget-image") || img).remove();
      });
      element.querySelectorAll('.elementor-1799 img[src*="repeticao-de-grade"], .elementor-1799 img.wp-image-1522').forEach((img) => {
        const p = img.closest("p");
        img.remove();
        if (!p) return;
        const firstText = p.firstChild && p.firstChild.nodeType === 3 ? p.firstChild : null;
        if (firstText) firstText.textContent = firstText.textContent.replace(/^[\s ]+/, "");
        const li = doc.createElement("li");
        while (p.firstChild) li.append(p.firstChild);
        const prev = p.previousElementSibling;
        if (prev && prev.tagName === "UL" && prev.hasAttribute(BULLET_ATTR2)) {
          prev.append(li);
          p.remove();
        } else {
          const ul = doc.createElement("ul");
          ul.setAttribute(BULLET_ATTR2, "");
          ul.append(li);
          p.replaceWith(ul);
        }
      });
      element.querySelectorAll(".elementor-accordion-item").forEach((item) => {
        const title = item.querySelector(".elementor-accordion-title, .elementor-tab-title");
        const body = item.querySelector(".elementor-tab-content");
        if (title && normText2(title) === "Accordion" && (!body || normText2(body).replace(/[–—-]/g, "").trim() === "")) {
          item.remove();
        }
      });
      element.querySelectorAll('a[href*="elementor-action"]').forEach((a) => {
        let href = a.getAttribute("href") || "";
        try {
          href = decodeURIComponent(href);
        } catch (e) {
        }
        if (!/popup/.test(href)) return;
        let id = "";
        const m = href.match(/settings=([A-Za-z0-9+/=]+)/);
        if (m) {
          try {
            id = String(JSON.parse(atob(m[1])).id || "");
          } catch (e) {
            id = "";
          }
        }
        a.setAttribute("href", id ? `#popup-${id}` : "#popup");
      });
      const FORM_SELECTOR = "form, .wpforms-container, .hbspt-form";
      element.querySelectorAll(".elementor-widget-shortcode").forEach((widget) => {
        if (!widget.querySelector(FORM_SELECTOR)) return;
        widget.replaceWith(contactPlaceholder(doc));
      });
      element.querySelectorAll(".wpforms-container, .hbspt-form").forEach((form) => {
        if (!form.isConnected) return;
        form.replaceWith(contactPlaceholder(doc));
      });
      const root = getPageRoot(element);
      const sections = payload && payload.template && payload.template.sections || [];
      const sectionStarts = /* @__PURE__ */ new Set();
      sections.forEach((s) => {
        const el = querySection(element, s.selector);
        if (el) sectionStarts.add(el);
      });
      const bgCandidates = new Set(sectionStarts);
      if (root) Array.from(root.children).forEach((c) => bgCandidates.add(c));
      bgCandidates.forEach((el) => {
        if (!el.isConnected || !isContentEmpty(el)) return;
        const url = backgroundUrl(el);
        if (!url) return;
        const img = doc.createElement("img");
        img.src = url;
        img.alt = "";
        const inner = el.querySelector(":scope > .e-con-inner");
        (inner || el).prepend(img);
        if (el.style) el.style.removeProperty("background-image");
        if (el.style && el.style.background && /url\(/i.test(el.style.background)) el.style.removeProperty("background");
      });
      if (root) {
        Array.from(root.children).forEach((child) => {
          if (sectionStarts.has(child)) return;
          if (!child.matches(".e-con, .elementor-section, .elementor-element")) return;
          if (isContentEmpty(child)) child.remove();
        });
      }
      const blockSelectors = (payload && payload.template && payload.template.blocks || []).flatMap((b) => b.instances || []);
      const inBlock = (el) => blockSelectors.some((sel) => {
        try {
          return !!el.closest(sel);
        } catch (e) {
          return false;
        }
      });
      const view = doc.defaultView;
      const fontSize = (el) => {
        try {
          return parseFloat(view.getComputedStyle(el).fontSize) || 0;
        } catch (e) {
          return 0;
        }
      };
      const toH2 = (el) => {
        const h2 = doc.createElement("h2");
        h2.innerHTML = el.innerHTML;
        el.replaceWith(h2);
      };
      sections.forEach((s) => {
        if (!s.style || !/\b(grey|red|dark|navy)\b/.test(s.style)) return;
        const start = querySection(element, s.selector);
        if (!start) return;
        [start, ...start.querySelectorAll(".e-con, .elementor-element")].forEach((el) => {
          if (el !== start && inBlock(el)) return;
          if (el.style) {
            el.style.removeProperty("background-image");
            if (el.style.background && /url\(/i.test(el.style.background)) el.style.removeProperty("background");
          }
        });
      });
      element.querySelectorAll(".elementor-widget-button").forEach((w) => {
        if (w.closest(".elementor-22451 .elementor-element-9e81d46")) return;
        if (inBlock(w)) {
          w.querySelectorAll("a[href]").forEach((a2) => a2.setAttribute(BUTTON_ATTR, ""));
          return;
        }
        const a = w.querySelector("a[href]");
        if (!a) return;
        const label = (a.textContent || "").replace(/\s+/g, " ").trim();
        if (!label) return;
        let asText = false;
        try {
          const bg = view.getComputedStyle(a).backgroundColor;
          asText = /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(bg);
        } catch (e) {
        }
        const p = doc.createElement("p");
        const link = doc.createElement("a");
        link.setAttribute("href", a.getAttribute("href"));
        link.textContent = label;
        if (asText) {
          p.append(link);
        } else {
          const strong = doc.createElement("strong");
          strong.append(link);
          p.append(strong);
        }
        w.replaceWith(p);
      });
      if (view && view.getComputedStyle) {
        element.querySelectorAll(".elementor-widget-heading :is(h4, h5, h6)").forEach((h) => {
          if (!inBlock(h) && fontSize(h) >= 26) toH2(h);
        });
        element.querySelectorAll(".elementor-widget-heading :is(h1, h2, h3, h4, h5, h6)").forEach((h) => {
          if (inBlock(h) || fontSize(h) > 16) return;
          const p = doc.createElement("p");
          p.innerHTML = h.innerHTML;
          h.replaceWith(p);
        });
        element.querySelectorAll(".elementor-widget-text-editor").forEach((w) => {
          if (inBlock(w)) return;
          const ps = w.querySelectorAll("p");
          const text = normText2(w);
          if (ps.length !== 1 || !text || text.length > 140) return;
          if (w.querySelector("a, img, ul, ol")) return;
          if (fontSize(ps[0]) >= 28) toH2(ps[0]);
        });
      }
    }
    if (hookName === TransformHook3.afterTransform) {
      element.querySelectorAll(`[${BULLET_ATTR2}]`).forEach((ul) => ul.removeAttribute(BULLET_ATTR2));
      element.querySelectorAll(`a[${BUTTON_ATTR}]`).forEach((a) => {
        a.removeAttribute(BUTTON_ATTR);
        if (a.closest("table, strong, em")) return;
        const p = a.parentElement;
        if (!p || p.tagName !== "P" || p.textContent.trim() !== a.textContent.trim()) return;
        const strong = doc.createElement("strong");
        a.replaceWith(strong);
        strong.append(a);
      });
    }
  }

  // tools/importer/transformers/bradesco-landing-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var SECTION_STYLE_ATTR = "data-excat-section-style";
  var SECTION_LEADING_ATTR = "data-excat-section-leading";
  var MEDIA_SELECTOR2 = "img, picture, video, iframe";
  function querySection2(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function hasRootClass2(el) {
    return /(^|\s)elementor-\d+(\s|$)/.test(el.className || "");
  }
  function getPageRoot2(element) {
    const wpPage = element.querySelector('[data-elementor-type="wp-page"]');
    let first = null;
    const candidates = element.querySelectorAll("div.elementor");
    for (const el of candidates) {
      if (!hasRootClass2(el)) continue;
      if (el.classList.contains("e-loop-item")) continue;
      if (el.closest("header, footer, .elementor-location-header, .elementor-location-footer, .elementor-location-popup")) continue;
      first = el;
      break;
    }
    if (wpPage && first && first !== wpPage && first.contains(wpPage)) return first;
    return wpPage || first;
  }
  function hasContentBefore(scope, target) {
    if (!scope.contains(target)) return true;
    const doc = scope.ownerDocument;
    const walker = doc.createTreeWalker(scope, 1 | 4);
    let node = walker.nextNode();
    while (node && node !== target) {
      if (node.nodeType === 3) {
        const parent = node.parentElement;
        if (parent && !parent.closest("script, style, noscript, template") && node.textContent.replace(/[ ​\s]+/g, "") !== "") return true;
      } else if (node.matches(MEDIA_SELECTOR2)) {
        return true;
      }
      node = walker.nextNode();
    }
    return false;
  }
  function parseColors(value) {
    const out = [];
    const re = /rgba?\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,\s/]+(\d*\.?\d+))?\s*\)/g;
    let m = re.exec(value || "");
    while (m) {
      const a = m[4] === void 0 ? 1 : parseFloat(m[4]);
      if (a > 0.05) out.push([+m[1], +m[2], +m[3]]);
      m = re.exec(value || "");
    }
    return out;
  }
  function classifyColor([r, g, b]) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (r >= 100 && r - g >= 70 && r - b >= 50) return "red";
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (lum < 0.3) return "dark";
    if (max - min <= 14 && min >= 220 && max <= 250) return "grey";
    return null;
  }
  function styleFromBackground(el) {
    const view = el.ownerDocument.defaultView;
    if (!view || !view.getComputedStyle) return null;
    const targets = [el, el.querySelector(":scope > .e-con-inner")].filter(Boolean);
    for (const t of targets) {
      const cs = view.getComputedStyle(t);
      if (/url\(/.test(cs.backgroundImage || "")) return null;
      let colors = parseColors(cs.backgroundColor);
      if (!colors.length && /gradient/.test(cs.backgroundImage || "")) colors = parseColors(cs.backgroundImage);
      if (colors.length) {
        const avg = [0, 1, 2].map((i) => colors.reduce((s, c) => s + c[i], 0) / colors.length);
        return classifyColor(avg);
      }
    }
    return null;
  }
  function resolveSections(element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    const seen = /* @__PURE__ */ new Set();
    const resolved = [];
    sections.forEach((section) => {
      const el = querySection2(element, section.selector);
      if (!el || seen.has(el)) return;
      if (el.closest(".e-n-tabs-content")) return;
      seen.add(el);
      resolved.push({ id: String(section.id), style: section.style || null, el });
    });
    if (resolved.length) return resolved;
    const root = getPageRoot2(element);
    if (!root) return [];
    return Array.from(root.children).filter((c) => c.matches(".e-con, .elementor-section, .elementor-element")).map((el, i) => ({ id: `auto-${i + 1}`, style: styleFromBackground(el), el }));
  }
  function transform5(hookName, element, payload) {
    const doc = element.ownerDocument;
    if (hookName === "beforeTransform") {
      const resolved = resolveSections(element, payload);
      if (!resolved.length) return;
      for (let i = 1; i < resolved.length; i += 1) {
        const prev = resolved[i - 1].el;
        const cur = resolved[i].el;
        if (prev.parentNode && prev.parentNode === cur.parentNode && cur.compareDocumentPosition(prev) & 4) {
          cur.parentNode.insertBefore(prev, cur);
        }
      }
      const scope = getPageRoot2(element) || element;
      for (let i = resolved.length - 1; i >= 0; i -= 1) {
        const { id, style, el } = resolved[i];
        const leading = !hasContentBefore(scope, el);
        if (leading && !style) continue;
        const hr = doc.createElement("hr");
        if (style) {
          hr.setAttribute(SECTION_MARKER_ATTR, id);
          hr.setAttribute(SECTION_STYLE_ATTR, style);
        }
        if (leading) hr.setAttribute(SECTION_LEADING_ATTR, "");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const markers = Array.from(element.querySelectorAll(`hr[${SECTION_MARKER_ATTR}]`));
      for (let i = markers.length - 1; i >= 0; i -= 1) {
        const marker = markers[i];
        const style = marker.getAttribute(SECTION_STYLE_ATTR);
        if (style) {
          const metadataBlock = WebImporter.Blocks.createBlock(doc, {
            name: "Section Metadata",
            cells: { style }
          });
          marker.after(metadataBlock);
        }
        if (marker.hasAttribute(SECTION_LEADING_ATTR)) {
          marker.remove();
        } else {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          marker.removeAttribute(SECTION_STYLE_ATTR);
        }
      }
    }
  }

  // tools/importer/import-info-page.js
  var parsers = {
    "hero-banner": parse,
    "hero-video": parse2,
    "hero-promo": parse3,
    "columns-media": parse4,
    "cards-feature": parse5,
    "accordion": parse6,
    "tabs": parse7,
    "table-article": parse8
  };
  var PAGE_TEMPLATE = {
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
  var INSTANCE_OPTIONS = {
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
  var BLOCK_ATTR2 = "data-excat-block";
  var transformers = [
    transform,
    transform3,
    transform4,
    transform5,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          const options = (INSTANCE_OPTIONS[blockDef.name] || {})[selector] || [];
          element.setAttribute(BLOCK_ATTR2, blockDef.name);
          pageBlocks.push({ name: blockDef.name, selector, element, options });
        });
      });
    });
    pageBlocks.sort((a, b) => {
      if (a.element.contains(b.element)) return 1;
      if (b.element.contains(a.element)) return -1;
      return 0;
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function slugify2(text) {
    return (text || "").replace(/['\u2019]/g, "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function isolateTabPanel(document, slug) {
    const widgets = [...document.querySelectorAll(".elementor-widget-n-tabs")];
    for (const widget of widgets) {
      const titles = [...widget.querySelectorAll(".e-n-tab-title")];
      const content = widget.querySelector(".e-n-tabs-content");
      if (content) {
        const panels = [...content.children];
        const idx = titles.findIndex((t) => slugify2(t.textContent) === slug);
        if (idx >= 0 && panels[idx]) {
          const root = widget.closest('[data-elementor-type="wp-page"], .elementor[data-elementor-id]');
          const wrapper = document.createElement("div");
          wrapper.className = root ? root.className : "elementor";
          wrapper.append(panels[idx]);
          document.body.replaceChildren(wrapper);
          return true;
        }
      }
    }
    return false;
  }
  var import_info_page_default = {
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
      try {
        fragment = new URL(url).searchParams.get("fragment");
      } catch (e) {
      }
      if (!fragment) return;
      document.querySelectorAll(".e-con.e-parent:not(.e-lazyloaded)").forEach((n) => n.classList.add("e-lazyloaded"));
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      const source = new URL(params.originalURL);
      const fragment = source.searchParams.get("fragment");
      const basePath = source.pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      let fragmentMode = false;
      if (fragment) {
        fragmentMode = isolateTabPanel(document, slugify2(fragment));
        if (!fragmentMode) console.warn(`Fragment "${fragment}" not found on page`);
      }
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.isConnected) return;
        const parser = parsers[block.name];
        if (!parser) {
          console.warn(`No parser found for block: ${block.name}`);
          return;
        }
        try {
          parser(block.element, {
            document,
            url,
            params,
            options: block.options,
            template: PAGE_TEMPLATE.name,
            basePath
          });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.querySelectorAll(`[${BLOCK_ATTR2}]`).forEach((el) => el.removeAttribute(BLOCK_ATTR2));
      if (!fragmentMode) {
        main.appendChild(document.createElement("hr"));
        const meta = WebImporter.Blocks.getMetadata(document) || {};
        meta.template = PAGE_TEMPLATE.name;
        main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
      }
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = fragmentMode ? `${basePath}/fragments/${slugify2(fragment)}` : basePath;
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          fragment: fragmentMode ? slugify2(fragment) : "",
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_info_page_exports);
})();
