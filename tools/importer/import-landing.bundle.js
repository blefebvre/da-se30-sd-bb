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

  // tools/importer/import-landing.js
  var import_landing_exports = {};
  __export(import_landing_exports, {
    default: () => import_landing_default
  });

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
    const video = EL.videoUrl(element);
    const s = EL.settings(element);
    const poster = s.background_video_fallback && s.background_video_fallback.url || EL.bgUrl(element);
    const { images, copy, hasTitle } = heroCopy(document, element);
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
    const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName("hero-video", options), cells });
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
    if (element.closest(EL.LEGACY_ROOTS)) {
      parseLegacy(element, { document });
      return;
    }
    parseLanding(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/cards-audience.js
  var IMG_BASE = "https://bradescobank.com/wp-content/uploads/2024/05/";
  var FALLBACK_IMAGES = {
    private_bank: `${IMG_BASE}desk-thumb-discovery-2.jpg`,
    personal_bank: `${IMG_BASE}desk-thumb-discovery-1.jpg`,
    us_residents: `${IMG_BASE}desk-thumb-discovery-4.jpg`,
    business: `${IMG_BASE}desk-thumb-discovery-3.jpg`
  };
  var FALLBACK_BY_INDEX = [
    FALLBACK_IMAGES.private_bank,
    FALLBACK_IMAGES.personal_bank,
    FALLBACK_IMAGES.us_residents,
    FALLBACK_IMAGES.business
  ];
  function urlFromCss(value) {
    if (!value) return null;
    const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m ? m[1] : null;
  }
  function resolveBgImage(tile, index) {
    if (!tile) return FALLBACK_BY_INDEX[index] || null;
    let src = urlFromCss(tile.getAttribute("style"));
    if (!src) {
      const raw = tile.getAttribute("data-settings");
      if (raw) {
        try {
          const s = JSON.parse(raw);
          src = s.background_image && s.background_image.url || null;
        } catch (e) {
        }
      }
    }
    if (!src) {
      try {
        const view = tile.ownerDocument && tile.ownerDocument.defaultView;
        if (view && view.getComputedStyle) {
          src = urlFromCss(view.getComputedStyle(tile).backgroundImage);
        }
      } catch (e) {
      }
    }
    if (src && /^data:/i.test(src)) src = null;
    if (!src) src = FALLBACK_IMAGES[tile.id] || FALLBACK_BY_INDEX[index] || null;
    return src;
  }
  function parseLegacy2(element, { document }) {
    let items = [...element.querySelectorAll(".title-services")].map((label) => ({
      label,
      tile: label.closest("a[href]")
    }));
    if (!items.length) {
      items = [...element.querySelectorAll(":scope > a[href]")].map((tile) => ({
        label: tile,
        tile
      }));
    }
    const cells = [];
    items.forEach(({ label, tile }, index) => {
      const text = (label.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      const imgSrc2 = resolveBgImage(tile, index);
      let imageCell = "";
      if (imgSrc2) {
        const img = document.createElement("img");
        img.src = imgSrc2;
        img.alt = text;
        imageCell = img;
      }
      const p = document.createElement("p");
      const href = tile ? tile.getAttribute("href") : null;
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = text;
        p.append(a);
      } else {
        p.textContent = text;
      }
      cells.push([imageCell, p]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-audience", cells });
    element.replaceWith(block);
  }
  function parseLanding2(element, { document, options }) {
    EL2.unlazy(document);
    let tiles = EL2.findItems(element);
    if (!tiles.length) tiles = EL2.contentKids(element);
    const cells = [];
    tiles.forEach((tile) => {
      const items = EL2.collect(document, tile, { bgImages: false }).filter((it) => it.el);
      const label = items.find((it) => it.kind === "heading") || items.find((it) => it.kind === "text");
      if (!label) return;
      const text = EL2.norm(label.el.textContent);
      const photo = items.find((it) => it.kind === "image");
      const src = EL2.bgUrl(tile) || photo && photo.img.getAttribute("src");
      let imageCell = "";
      if (src) {
        imageCell = document.createElement("img");
        imageCell.src = src;
        imageCell.alt = text;
      }
      const anchor = tile.matches("a[href]") ? tile : tile.closest("a[href]");
      const href = anchor && anchor.getAttribute("href");
      let labelCell = label.el;
      if (href) {
        labelCell = document.createElement("p");
        const a = document.createElement("a");
        a.href = EL2.fixHref(href);
        a.innerHTML = label.el.innerHTML;
        labelCell.append(a);
      }
      const rest = items.filter((it) => it !== label && it !== photo).map((it) => it.el);
      cells.push([imageCell, [labelCell, ...rest]]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const { before, after } = EL2.outside(element, tiles);
    EL2.moveOut(document, element, before, "before");
    EL2.moveOut(document, element, after, "after");
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("cards-audience", options), cells });
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
      parseLegacy2(element, { document });
      return;
    }
    parseLanding2(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/cards-feature.js
  var NO_TITLE_PROMOTION = ["icons", "circle", "steps", "links", "posts", "carousel"];
  var BADGE = /^\(?\s*coming soon\s*\)?$/i;
  function cardItems(element) {
    const slides = [...element.querySelectorAll(".swiper-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate") && EL3.hasContent(s));
    if (slides.length) return slides;
    const loop = [...element.querySelectorAll(".e-loop-item")].filter((s) => EL3.hasContent(s));
    if (loop.length) return loop;
    return EL3.findItems(element);
  }
  function cardBody(document, item, options) {
    const raw = EL3.collect(document, item, { bgImages: false, dividers: true, imageLinks: !options.includes("posts") });
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
          body.push(EL3.retag(document, it.el, "h3"));
        } else {
          body.push(EL3.retag(document, it.el, it === tagline ? "h4" : "p"));
        }
        return;
      }
      if (it.kind === "text" && BADGE.test(EL3.norm(it.el.textContent)) && !it.el.querySelector("em")) {
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = EL3.norm(it.el.textContent);
        p.append(em);
        body.push(p);
        return;
      }
      body.push(it.el);
    });
    if (!titled && !options.some((o) => NO_TITLE_PROMOTION.includes(o))) {
      const texts = body.filter((el) => el.tagName === "P" && !el.querySelector("em:only-child"));
      const first = texts[0];
      if (first && texts.length >= 2 && !first.querySelector("a") && EL3.norm(first.textContent).length <= 40 && !/[.:]$/.test(EL3.norm(first.textContent))) {
        body[body.indexOf(first)] = EL3.retag(document, first, "h3");
      }
    }
    let imageEl = image ? image.el : null;
    if (!imageEl) {
      const src = EL3.bgUrl(item);
      if (src) imageEl = EL3.bgImageItem(document, src).el;
    }
    return { imageEl, body };
  }
  function parseLanding3(element, { document, options }) {
    EL3.unlazy(document);
    const items = cardItems(element);
    const rows = items.map((item) => cardBody(document, item, options)).filter((r) => r.body.length || r.imageEl);
    const ctaHost = element.nextElementSibling && element.nextElementSibling.matches(".elementor-element-9e81d46") ? element.nextElementSibling : null;
    if (ctaHost && element.matches(".elementor-element-9c6aacd")) {
      const ctas = EL3.collect(document, ctaHost).filter((it) => it.kind === "button");
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
      if (host && host !== element && element.contains(host)) ({ before, after } = EL3.outside(element, [host]));
    } else {
      ({ before, after } = EL3.outside(element, items));
    }
    EL3.moveOut(document, element, before, "before");
    EL3.moveOut(document, element, after, "after");
    const withImage = rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("cards-feature", options), cells });
    element.replaceWith(block);
    if (ctaHost) ctaHost.remove();
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
    parseLanding3(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/cards-product.js
  function imgSrc(img) {
    return img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || img.getAttribute("src") || "";
  }
  function cloneImg(document, img) {
    const out = document.createElement("img");
    out.src = imgSrc(img);
    const alt = img.getAttribute("alt");
    if (alt) out.alt = alt;
    return out;
  }
  var FALLBACK_BG = {
    e274826: "https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-home-investments-2.jpg",
    "1391f39": "https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-produto-3.jpg",
    f9193f1: "https://bradescobank.com/wp-content/uploads/2026/08/thumb-bradesco-credit-home-1.webp",
    "3618faf": "https://bradescobank.com/wp-content/uploads/2025/12/home-zelle-2.webp"
  };
  function urlFromCss2(value) {
    if (!value) return null;
    const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m && !/^data:/i.test(m[1]) ? m[1] : null;
  }
  function tileBackground(tile) {
    let src = urlFromCss2(tile.getAttribute("style"));
    if (!src) {
      try {
        const view = tile.ownerDocument && tile.ownerDocument.defaultView;
        if (view && view.getComputedStyle) src = urlFromCss2(view.getComputedStyle(tile).backgroundImage);
      } catch (e) {
      }
    }
    if (!src) {
      const id = tile.getAttribute("data-id") || ([...tile.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c)) || "").replace("elementor-element-", "");
      src = FALLBACK_BG[id] || null;
    }
    return src;
  }
  function widgetContent(widget) {
    return widget.querySelector(":scope > .elementor-widget-container") || widget;
  }
  function buildRow(document, body) {
    const tile = body.parentElement;
    const photo = tile ? tile.querySelector(":scope > img") : null;
    let imageCell = "";
    if (photo) {
      imageCell = cloneImg(document, photo);
    } else if (tile) {
      const bg = tileBackground(tile);
      if (bg) {
        imageCell = document.createElement("img");
        imageCell.src = bg;
        const title = body.querySelector("h1, h2, h3, h4, h5, h6");
        imageCell.alt = title ? title.textContent.replace(/\s+/g, " ").trim() : "";
      }
    }
    const bodyCell = [];
    const scope = body.querySelector(":scope > .e-con-inner") || body;
    const widgets = [...scope.querySelectorAll(":scope > .elementor-widget")];
    let titleFound = false;
    widgets.forEach((widget) => {
      const content = widgetContent(widget);
      const heading = content.querySelector("h1, h2, h3, h4, h5, h6");
      const logo = widget.classList.contains("elementor-widget-image") ? content.querySelector("img") : null;
      if (heading) {
        const h3 = document.createElement("h3");
        h3.innerHTML = heading.innerHTML.replace(/&nbsp;/g, " ").trim();
        h3.textContent = h3.textContent.replace(/ /g, " ").trim();
        bodyCell.push(h3);
        titleFound = true;
        return;
      }
      if (logo) {
        const p = document.createElement("p");
        p.append(cloneImg(document, logo));
        bodyCell.push(p);
        titleFound = true;
        return;
      }
      if (!content.textContent.trim()) return;
      const paras = [...content.querySelectorAll(":scope > p")];
      if (paras.length) {
        paras.forEach((p) => {
          if (!p.textContent.trim()) return;
          const np = document.createElement("p");
          np.innerHTML = p.innerHTML.trim();
          bodyCell.push(np);
        });
      } else {
        const np = document.createElement("p");
        np.innerHTML = content.innerHTML.trim();
        bodyCell.push(np);
      }
    });
    const ctaLink = tile ? tile.querySelector(":scope > .elementor-widget-button a[href], :scope > .elementor-widget-button + * a.elementor-button") : null;
    if (ctaLink) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = ctaLink.getAttribute("href");
      a.textContent = (ctaLink.textContent || "").replace(/\s+/g, " ").trim();
      p.append(a);
      bodyCell.push(p);
    }
    if (!titleFound && !bodyCell.length) return null;
    return [imageCell, bodyCell];
  }
  function parseLegacy3(element, { document }) {
    let extra = element.nextElementSibling;
    if (!extra || !extra.classList.contains("elementor-element-6cab8f9")) {
      extra = document.querySelector(".elementor-element-6cab8f9");
    }
    if (extra && (extra === element || element.contains(extra))) extra = null;
    const containers = [element];
    if (extra) containers.push(extra);
    const cells = [];
    containers.forEach((container) => {
      [...container.querySelectorAll(".discovery-product")].forEach((body) => {
        const row = buildRow(document, body);
        if (row) cells.push(row);
      });
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let footnote = null;
    if (extra) {
      const fnSrc = extra.querySelector(".elementor-element-77e13de p") || document.querySelector(".elementor-element-77e13de p");
      if (fnSrc && fnSrc.textContent.trim()) {
        footnote = document.createElement("p");
        footnote.innerHTML = fnSrc.innerHTML.trim();
        const onlySpan = footnote.children.length === 1 && footnote.firstElementChild.tagName === "SPAN" ? footnote.firstElementChild : null;
        if (onlySpan) footnote.innerHTML = onlySpan.innerHTML.trim();
      }
      extra.remove();
    }
    if (footnote) cells[cells.length - 1][1].push(footnote);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }
  function parseLanding4(element, { document, options }) {
    EL4.unlazy(document);
    let tiles = EL4.findItems(element);
    if (!tiles.length) tiles = EL4.contentKids(element);
    const cells = [];
    tiles.forEach((tile) => {
      const items = EL4.collect(document, tile, { bgImages: true }).filter((it) => it.el);
      const heading = items.find((it) => it.kind === "heading");
      let src = EL4.bgUrl(tile);
      let photo = null;
      if (!src) {
        photo = items.find((it) => it.kind === "image");
        if (photo) src = photo.img.getAttribute("src");
      }
      const body = items.filter((it) => it !== photo).map((it) => it.el);
      if (!body.length) return;
      let imageCell = "";
      if (src) {
        imageCell = document.createElement("img");
        imageCell.src = src;
        imageCell.alt = heading ? EL4.norm(heading.el.textContent) : "";
      }
      cells.push([imageCell, body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const { before, after } = EL4.outside(element, tiles);
    EL4.moveOut(document, element, before, "before");
    EL4.moveOut(document, element, after, "after");
    const block = WebImporter.Blocks.createBlock(document, { name: EL4.blockName("cards-product", options), cells });
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
  function parse4(element, { document, options, basePath } = {}) {
    if (element.closest(EL4.LEGACY_ROOTS)) {
      parseLegacy3(element, { document });
      return;
    }
    parseLanding4(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/hero-promo.js
  var FALLBACK_BG2 = {
    f4e421d: "https://bradescobank.com/wp-content/uploads/2024/10/bg-Exclusive-1.jpg"
  };
  function urlFromCss3(value) {
    if (!value) return null;
    const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m && !/^data:/i.test(m[1]) ? m[1] : null;
  }
  function resolveBackground(element) {
    const img = element.querySelector(":scope > img");
    if (img) return img.getAttribute("data-src") || img.getAttribute("src");
    let src = urlFromCss3(element.getAttribute("style"));
    if (!src) {
      try {
        const view = element.ownerDocument && element.ownerDocument.defaultView;
        if (view && view.getComputedStyle) src = urlFromCss3(view.getComputedStyle(element).backgroundImage);
      } catch (e) {
      }
    }
    if (!src) {
      const id = element.getAttribute("data-id") || ([...element.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c)) || "").replace("elementor-element-", "");
      src = FALLBACK_BG2[id] || null;
    }
    return src;
  }
  function parseLegacy4(element, { document }) {
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
    if (!prev || !EL5.isCon(prev)) return [];
    const boxes = [...prev.querySelectorAll(".elementor-widget-icon-box")];
    if (boxes.length !== 1 || EL5.norm(boxes[0].textContent) !== EL5.norm(prev.textContent)) return [];
    const items = EL5.collect(document, boxes[0]).filter((it) => it.el && it.kind !== "image");
    const holder = boxes[0].closest(".e-con") || boxes[0];
    (holder === prev ? boxes[0] : holder).remove();
    return items;
  }
  function parseLanding5(element, { document, options }) {
    EL5.unlazy(document);
    let bg = EL5.bgUrl(element);
    if (!bg) {
      const holder = [...element.querySelectorAll(".e-con")].find((c) => EL5.hasContent(c) && EL5.bgUrl(c));
      if (holder) bg = EL5.bgUrl(holder);
    }
    const items = [...promoBadge(document, element), ...EL5.collect(document, element, { bgImages: false })].filter((it) => it.el);
    let titleIdx = items.findIndex((it) => it.kind === "heading");
    if (titleIdx < 0) {
      const first = items.findIndex((it) => it.kind === "text");
      if (first >= 0 && EL5.norm(items[first].el.textContent).length <= 40) {
        items[first] = __spreadProps(__spreadValues({}, items[first]), { kind: "heading", el: EL5.retag(document, items[first].el, options.includes("card") ? "h3" : "h2") });
        titleIdx = first;
      }
    }
    const content = items.map((it, i) => {
      if (i === titleIdx) return it.el.tagName === "H1" ? EL5.retag(document, it.el, "h2") : it.el;
      if (it.kind === "heading") return EL5.retag(document, it.el, "p");
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
      imageCell.alt = title ? EL5.norm(title.el.textContent) : "";
    }
    const cells = [[imageCell, content]];
    const block = WebImporter.Blocks.createBlock(document, { name: EL5.blockName("hero-promo", options), cells });
    element.replaceWith(block);
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
  function parse5(element, { document, options, basePath } = {}) {
    if (element.closest(EL5.LEGACY_ROOTS)) {
      parseLegacy4(element, { document });
      return;
    }
    parseLanding5(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/columns-media.js
  function columnsOf(element) {
    let node = element;
    for (let i = 0; i < 6; i += 1) {
      const all = EL6.kidsOf(node).filter((k) => EL6.isCon(k) || EL6.isWidget(k));
      const kids = all.filter((k) => EL6.hasContent(k) || EL6.isCon(k) && EL6.bgUrl(k));
      if (kids.length === 1 && all.length === 1 && EL6.isCon(kids[0])) {
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
        li.append(EL6.make(document, "strong", it.el.innerHTML), " ");
        ol.append(li);
      } else if (li && it.kind === "text") {
        if (li.childNodes.length > 2) li.append(document.createElement("br"));
        li.append(...EL6.make(document, "span", it.el.innerHTML).childNodes);
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
      const pairs = texts.length >= 4 && texts.length % 2 === 0 && texts.length === out.length && texts.every((it, i) => i % 2 === 0 === EL6.norm(it.el.textContent).length <= 60);
      if (pairs) {
        out = out.map((it, i) => i % 2 === 0 ? __spreadProps(__spreadValues({}, it), { el: EL6.retag(document, it.el, "h3") }) : it);
      } else if (texts.length && texts[0] === out[0]) {
        out = [__spreadProps(__spreadValues({}, out[0]), { el: EL6.retag(document, out[0].el, "h2") }), ...out.slice(1)];
      }
    }
    return out.map((it) => it.el);
  }
  function parseLanding6(element, { document, options }) {
    EL6.unlazy(document);
    const cols = columnsOf(element);
    const images = [];
    const texts = [];
    cols.forEach((col) => {
      const items = EL6.collect(document, col, { bgImages: true }).filter((it) => it.el);
      if (!items.length) {
        const src = EL6.isCon(col) ? EL6.bgUrl(col) : null;
        if (src) images.push([EL6.bgImageItem(document, src).el]);
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
    const block = WebImporter.Blocks.createBlock(document, { name: EL6.blockName("columns-media", options), cells: [row] });
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
  function parse6(element, { document, options, basePath } = {}) {
    parseLanding6(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/tabs.js
  var TILE_FALLBACK = {
    // credit-card-signature-gold, hidden "Visa Gold" panel (authoring-analysis.json)
    "876afa7": "https://bradescobank.com/wp-content/uploads/2026/08/AdobeStock_1924749375-1.webp",
    e434b48: "https://bradescobank.com/wp-content/uploads/2026/08/Rectangle-6-1.webp"
  };
  function slugify(text) {
    return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
    parseLanding7(element, { document, options: options || [], basePath: basePath || "" });
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
  function parseLegacy5(element, { document }) {
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
  function parse8(element, { document, options, basePath } = {}) {
    if (element.closest(EL8.LEGACY_ROOTS)) {
      parseLegacy5(element, { document });
      return;
    }
    parseLanding8(element, { document, options: options || [], basePath: basePath || "" });
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
  function parseLanding9(element, { document, options }) {
    const cells = [];
    accordionItems(element).forEach(({ title, body }) => {
      const label = title ? EL9.norm(title.textContent) : "";
      if (!label) return;
      const answer = [];
      body.forEach((node) => {
        EL9.collect(document, node, { bgImages: false }).forEach((it) => {
          if (it.el) answer.push(it.el);
        });
      });
      const answerText = answer.map((n) => EL9.norm(n.textContent)).join("").replace(/[-–—]/g, "");
      if (/^accordion$/i.test(label) && !answerText) return;
      cells.push([label, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL9.blockName("accordion", options), cells });
    element.replaceWith(block);
  }
  var EL9 = (() => {
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
  function parse9(element, { document, options, basePath } = {}) {
    parseLanding9(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/hero-banner.js
  function heroCopy2(document, element) {
    const items = EL10.collect(document, element, { bgImages: true });
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
        copy.push(EL10.retag(document, it.el, "h1"));
        return;
      }
      if (it.kind === "heading") {
        copy.push(EL10.retag(document, it.el, "p"));
        return;
      }
      copy.push(it.el);
    });
    return { images, copy, hasTitle: idx >= 0 };
  }
  function parseLanding10(element, { document, options }) {
    EL10.unlazy(document);
    let bg = EL10.bgUrl(element);
    if (!bg) {
      const holder = [...element.querySelectorAll(".e-con")].find((c) => EL10.hasContent(c) && EL10.bgUrl(c));
      if (holder) bg = EL10.bgUrl(holder);
    }
    const { images, copy, hasTitle } = heroCopy2(document, element);
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
    const block = WebImporter.Blocks.createBlock(document, { name: EL10.blockName("hero-banner", options), cells });
    element.replaceWith(block);
  }
  var EL10 = (() => {
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
    function urlFromCss4(value) {
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
    function imgSrc2(img) {
      const c = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src")];
      return c.find((s) => s && !/^data:/i.test(s)) || "";
    }
    function bgUrl(el) {
      if (!isEl(el)) return null;
      let src = urlFromCss4(el.getAttribute("style"));
      if (!src) {
        const s = settings(el);
        const slides = Array.isArray(s.background_slideshow_gallery) ? s.background_slideshow_gallery : [];
        src = s.background_image && s.background_image.url || slides[0] && slides[0].url || null;
      }
      if (!src) {
        try {
          const view = el.ownerDocument && el.ownerDocument.defaultView;
          if (view && view.getComputedStyle) src = urlFromCss4(view.getComputedStyle(el).backgroundImage);
        } catch (e) {
        }
      }
      if (!src) {
        const img = el.querySelector(":scope > img, :scope > .e-con-inner > img");
        if (img) src = imgSrc2(img) || null;
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
      const src = imgSrc2(img);
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
      urlFromCss: urlFromCss4,
      settings,
      unlazy,
      imgSrc: imgSrc2,
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
  function parse10(element, { document, options, basePath } = {}) {
    parseLanding10(element, { document, options: options || [], basePath: basePath || "" });
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

  // tools/importer/transformers/bradesco-landing.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var CONTACT_URL = "https://bradescobank.com/en/help/";
  var MEDIA_SELECTOR = "img, picture, video, iframe";
  var BULLET_ATTR = "data-excat-bullets";
  var BUTTON_ATTR = "data-excat-button";
  var DECORATIVE_SELECTORS = [
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
  function normText(el) {
    return (el.textContent || "").replace(/[ ​\s]+/g, " ").trim();
  }
  function isContentEmpty(el) {
    return normText(el) === "" && !el.querySelector(MEDIA_SELECTOR) && !el.matches(MEDIA_SELECTOR);
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
  function transform2(hookName, element, payload) {
    const doc = element.ownerDocument;
    if (hookName === TransformHook2.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ...DECORATIVE_SELECTORS,
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
        if (prev && prev.tagName === "UL" && prev.hasAttribute(BULLET_ATTR)) {
          prev.append(li);
          p.remove();
        } else {
          const ul = doc.createElement("ul");
          ul.setAttribute(BULLET_ATTR, "");
          ul.append(li);
          p.replaceWith(ul);
        }
      });
      element.querySelectorAll(".elementor-accordion-item").forEach((item) => {
        const title = item.querySelector(".elementor-accordion-title, .elementor-tab-title");
        const body = item.querySelector(".elementor-tab-content");
        if (title && normText(title) === "Accordion" && (!body || normText(body).replace(/[–—-]/g, "").trim() === "")) {
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
          const text = normText(w);
          if (ps.length !== 1 || !text || text.length > 140) return;
          if (w.querySelector("a, img, ul, ol")) return;
          if (fontSize(ps[0]) >= 28) toH2(ps[0]);
        });
      }
    }
    if (hookName === TransformHook2.afterTransform) {
      element.querySelectorAll(`[${BULLET_ATTR}]`).forEach((ul) => ul.removeAttribute(BULLET_ATTR));
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
  function transform3(hookName, element, payload) {
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

  // tools/importer/import-landing.js
  var parsers = {
    "hero-video": parse,
    "cards-audience": parse2,
    "cards-feature": parse3,
    "cards-product": parse4,
    "hero-promo": parse5,
    "columns-media": parse6,
    "tabs": parse7,
    "table-article": parse8,
    "accordion": parse9,
    "hero-banner": parse10
  };
  var PAGE_TEMPLATE = {
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
  var INSTANCE_OPTIONS = {
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
  var transformers = [transform, transform2, transform3];
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
    return (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
  var import_landing_default = {
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
  return __toCommonJS(import_landing_exports);
})();
