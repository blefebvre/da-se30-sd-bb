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
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // tools/importer/import-listing.js
  var import_listing_exports = {};
  __export(import_listing_exports, {
    default: () => import_listing_default
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
    if (element.closest(EL.LEGACY_ROOTS)) {
      parseLegacy(element, { document });
      return;
    }
    parseLanding(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/hero-banner.js
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
    let bg = EL2.bgUrl(element);
    if (!bg) {
      const holder = [...element.querySelectorAll(".e-con")].find((c) => EL2.hasContent(c) && EL2.bgUrl(c));
      if (holder) bg = EL2.bgUrl(holder);
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
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("hero-banner", options), cells });
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
  var INFO_ROOTS = ["1178", "2212", "1481", "1401", "2391", "2498", "467", "631", "6834", "2456", "2514", "2527"].map((id) => `.elementor-${id}`).join(", ");
  function isInfoPage(element, template) {
    if (template) return template === "info-page";
    return !!element.closest(INFO_ROOTS);
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
    const filled = lines.filter((l) => l.some((n) => EL3.norm(n.textContent)));
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
    const text = EL3.norm(p.textContent);
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
      const first = out.find((el) => el.tagName === "P" && EL3.norm(el.textContent));
      const link = first && first.querySelector("a");
      const isLink = !!link && EL3.norm(first.textContent) === EL3.norm(link.textContent);
      if (first && !isLink) out[out.indexOf(first)] = EL3.retag(document, first, "h3");
    }
    return out;
  }
  function parseInfo(element, { document, options }) {
    EL3.unlazy(document);
    let items = options.includes("documents") ? [...element.querySelectorAll(".box-cra")].filter((n) => EL3.hasContent(n)) : [];
    if (!items.length) items = cardItems(element);
    const single = !items.length && EL3.hasContent(element);
    if (single) items = [element];
    const rows = items.map((item) => cardBody(document, item, options)).filter((r) => r.body.length || r.imageEl).map((r) => ({ imageEl: r.imageEl, body: infoBody(document, r.body, options) }));
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (!single) {
      const { before, after } = EL3.outside(element, items);
      EL3.moveOut(document, element, before, "before");
      EL3.moveOut(document, element, after, "after");
    }
    const withImage = options.includes("documents") || rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("cards-feature", options), cells });
    element.replaceWith(block);
  }
  var LISTING_DROP = ".favorite-container, .post-bookmark-placeholder, button, script, style, noscript, svg, .elementor-element-05a409f, .elementor-hidden-desktop";
  var LISTING_DATE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  var LISTING_BYLINE = /^by\s+(\S.*)$/i;
  var LISTING_TITLE = ".post-title, .elementor-widget-theme-post-title, .elementor-widget-heading";
  var LISTING_TEXT = ".post-excerpt, .elementor-widget-text-editor, .elementor-widget-theme-post-excerpt, .elementor-widget-shortcode";
  function listingItems(element) {
    const cards = [...element.querySelectorAll("article.post-card")].filter((n) => EL3.hasContent(n));
    if (cards.length) return cards;
    const loop = [...element.querySelectorAll(".e-loop-item")].filter((n) => EL3.hasContent(n));
    if (loop.length) return loop;
    return EL3.findItems(element);
  }
  var listingDropped = (n) => !!n.closest(LISTING_DROP);
  var listingText = (n) => {
    const c = n.cloneNode(true);
    c.querySelectorAll(LISTING_DROP).forEach((x) => x.remove());
    return EL3.norm(c.textContent);
  };
  var listingHref = (a) => {
    const href = a && a.getAttribute("href");
    return href && !/^#?$/.test(href) ? EL3.fixHref(href) : null;
  };
  function listingRow(document, item) {
    const p = (text) => {
      const el = document.createElement("p");
      el.textContent = text;
      return el;
    };
    let imageEl = null;
    let imageLink = null;
    const img = [...item.querySelectorAll("img")].find((i) => !listingDropped(i) && EL3.imgSrc(i));
    if (img) {
      const it = EL3.imageItem(document, img, false);
      if (it) {
        imageEl = it.el;
        imageLink = img.closest("a[href]");
      }
    }
    if (!imageEl) {
      const bg = [item, ...item.querySelectorAll('[data-settings*="background_background"]')].filter((n) => !listingDropped(n) && !EL3.norm(n.textContent)).map((n) => EL3.bgUrl(n)).find((src) => src && !/\.svg(\?|#|$)/i.test(src));
      if (bg) imageEl = EL3.bgImageItem(document, bg).el;
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
    EL3.unlazy(document);
    const items = listingItems(element);
    const rows = items.map((item) => listingRow(document, item)).filter((r) => r.body.length || r.imageEl);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const { before, after } = EL3.outside(element, items);
    EL3.moveOut(document, element, before, "before");
    EL3.moveOut(document, element, after, "after");
    const withImage = rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("cards-feature", options), cells });
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
    const p = EL3.clean(EL3.make(document, "p", html));
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
    EL3.collect(document, w, { bgImages: false, iconItems: false }).forEach((it) => {
      if (!it.el || it.kind === "image") return;
      if (it.kind === "list") {
        out.push(it.el);
        return;
      }
      out.push(arParagraph(document, it.el.innerHTML));
    });
    return out.filter((n) => EL3.norm(n.textContent));
  }
  function arSlideIcon(document, slide) {
    const img = [...slide.querySelectorAll(".elementor-widget-icon img")].find((i) => !arHidden(i, slide));
    const src = img ? EL3.imgSrc(img) : "";
    if (!src) return "";
    const out = document.createElement("img");
    out.src = src;
    out.alt = "";
    return out;
  }
  function arSlideBody(document, slide) {
    const widgets = [...slide.querySelectorAll(".elementor-widget")].filter((w) => !arHidden(w, slide) && ["heading", "text-editor"].includes(EL3.widgetType(w)));
    const body = [];
    let ul = null;
    let stage = "title";
    widgets.forEach((w) => {
      const type = EL3.widgetType(w);
      if (type === "heading") {
        const t = w.querySelector(".elementor-heading-title") || w.querySelector("h1, h2, h3, h4, h5, h6, p");
        const text2 = t ? EL3.norm(t.textContent) : "";
        if (!text2) return;
        const h = EL3.clean(EL3.make(document, stage === "title" ? "h3" : "h4", t.innerHTML));
        arTidy(h);
        body.push(h);
        if (stage === "title") stage = "desc";
        return;
      }
      const paras = arWidgetParas(document, w);
      if (!paras.length) return;
      const text = EL3.norm(paras.map((p) => p.textContent).join(" "));
      if (stage === "title" || stage === "desc") {
        if (stage === "desc" && body.some((n) => n.tagName === "P") && /:$/.test(text)) {
          body.push(arTidy(EL3.make(document, "h4", paras.map((p) => p.innerHTML).join(" "))));
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
    const slides = [...element.querySelectorAll(".swiper-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate") && EL3.hasContent(s));
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    slides.forEach((slide, pos) => {
      const idxAttr = slide.getAttribute("data-swiper-slide-index");
      const idx = idxAttr !== null && idxAttr !== "" && !Number.isNaN(parseInt(idxAttr, 10)) ? parseInt(idxAttr, 10) : null;
      const heading = slide.querySelector(".elementor-widget-heading .elementor-heading-title, .elementor-widget-heading h1, .elementor-widget-heading h2, .elementor-widget-heading h3");
      const key = idx !== null ? `i:${idx}` : `h:${EL3.norm(heading ? heading.textContent : slide.textContent).toLowerCase()}`;
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
    if (EL3.settings(carousel).autoplay === "yes" && !opts.includes("autoplay")) opts.push("autoplay");
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("cards-feature", opts), cells });
    element.replaceWith(block);
  }
  function parseArticleRichGrid(element, { document, options }) {
    let items = EL3.kidsOf(element).filter((k) => EL3.isCon(k) && EL3.hasContent(k));
    if (!items.length) items = EL3.findItems(element);
    const cells = [];
    items.forEach((item) => {
      const body = [];
      EL3.collect(document, item, { bgImages: false, iconItems: false }).forEach((it) => {
        if (!it.el || it.kind === "image" || it.kind === "divider") return;
        if (it.kind === "list") {
          body.push(it.el);
          return;
        }
        const p = arParagraph(document, it.el.innerHTML);
        if (EL3.norm(p.textContent)) body.push(p);
      });
      if (body.length) cells.push([body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("cards-feature", options), cells });
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
            if (/^\d+\.?$/.test(EL3.norm(k.textContent))) k.remove();
          });
          const inner = clone.children.length === 1 && /^(P|DIV)$/.test(clone.children[0].tagName) && EL3.norm(clone.children[0].textContent) === EL3.norm(clone.textContent) ? clone.children[0] : clone;
          html = inner.innerHTML;
        }
      } else {
        html = item.innerHTML;
      }
      const p = arParagraph(document, html);
      if (EL3.norm(p.textContent)) cells.push([[p]]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("cards-feature", options), cells });
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
    parseLanding3(element, { document, options });
  }
  function parse3(element, { document, options, basePath, template } = {}) {
    if (template === "article-rich") {
      parseArticleRich(element, { document, options: options || [], basePath: basePath || "" });
      return;
    }
    if (template === "listing") {
      parseListing(element, { document, options: options || [], basePath: basePath || "" });
      return;
    }
    if (isInfoPage(element, template)) {
      parseInfo(element, { document, options: options || [], basePath: basePath || "" });
      return;
    }
    parseLanding3(element, { document, options: options || [], basePath: basePath || "" });
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
      const imgSrc = resolveBgImage(tile, index);
      let imageCell = "";
      if (imgSrc) {
        const img = document.createElement("img");
        img.src = imgSrc;
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
  function parseLanding4(element, { document, options }) {
    EL4.unlazy(document);
    let tiles = EL4.findItems(element);
    if (!tiles.length) tiles = EL4.contentKids(element);
    const cells = [];
    tiles.forEach((tile) => {
      const items = EL4.collect(document, tile, { bgImages: false }).filter((it) => it.el);
      const label = items.find((it) => it.kind === "heading") || items.find((it) => it.kind === "text");
      if (!label) return;
      const text = EL4.norm(label.el.textContent);
      const photo = items.find((it) => it.kind === "image");
      const src = EL4.bgUrl(tile) || photo && photo.img.getAttribute("src");
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
        a.href = EL4.fixHref(href);
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
    const { before, after } = EL4.outside(element, tiles);
    EL4.moveOut(document, element, before, "before");
    EL4.moveOut(document, element, after, "after");
    const block = WebImporter.Blocks.createBlock(document, { name: EL4.blockName("cards-audience", options), cells });
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
  function parse4(element, { document, options, basePath } = {}) {
    if (element.closest(EL4.LEGACY_ROOTS)) {
      parseLegacy2(element, { document });
      return;
    }
    parseLanding4(element, { document, options: options || [], basePath: basePath || "" });
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

  // tools/importer/transformers/bradesco-listing.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var MEDIA_SELECTOR = "img, picture, video, iframe, svg";
  var LISTING_ROOTS = [".elementor-12376", ".elementor-8560", ".elementor-8507", ".elementor-12632"];
  var STRIP_SELECTORS = [
    ".elementor-12376 > .elementor-element-62594cb",
    ".elementor-8560 > .elementor-element-cf4cd2b",
    ".elementor-8507 > .elementor-element-68f1a2b",
    ".elementor-12632 > .elementor-element-62594cb"
  ];
  var BLOG_MENU_SELECTORS = [
    ".elementor-12632 > .elementor-element-0839dfe",
    ".elementor-12376 > .elementor-element-5be4d04"
  ];
  var BLOG_MENU_MARKER = ".blog-menu-wrapper";
  var PAGINATION_SELECTORS = [
    ".elementor-widget-loop-grid .elementor-pagination",
    ".elementor-widget-loop-grid .e-load-more-anchor",
    "nav.elementor-pagination",
    ".e-load-more-anchor"
  ];
  var FAVORITES_SELECTORS = [
    "#favorites-page .favorites-actions",
    "#clear-all-favorites",
    ".favorites-counter"
  ];
  var NOISE_SELECTORS = [
    ".post-bookmark-placeholder",
    ".favorite-btn",
    ".elementor-12464 .elementor-element-e7759d1",
    ".elementor-8574 .elementor-element-dabf083",
    ".e-loop-item .elementor-widget-html"
  ];
  function normText(el) {
    return (el.textContent || "").replace(/[\s ​]+/g, " ").trim();
  }
  function isContentEmpty(el) {
    return normText(el) === "" && !el.querySelector(MEDIA_SELECTOR) && !el.matches(MEDIA_SELECTOR);
  }
  function queryAll(element, selectors) {
    const out = [];
    selectors.forEach((sel) => {
      try {
        element.querySelectorAll(sel).forEach((el) => {
          if (!out.includes(el)) out.push(el);
        });
      } catch (e) {
      }
    });
    return out;
  }
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      const doc = element.ownerDocument;
      const roots = queryAll(element, LISTING_ROOTS);
      if (!roots.length) return;
      queryAll(element, STRIP_SELECTORS).forEach((el) => {
        if (isContentEmpty(el)) el.remove();
      });
      queryAll(element, BLOG_MENU_SELECTORS).forEach((el) => {
        if (el.querySelector(BLOG_MENU_MARKER)) el.remove();
      });
      roots.forEach((root) => {
        Array.from(root.children).forEach((child) => {
          if (child.querySelector(BLOG_MENU_MARKER)) child.remove();
        });
      });
      roots.forEach((root) => WebImporter.DOMUtils.remove(root, PAGINATION_SELECTORS));
      roots.forEach((root) => WebImporter.DOMUtils.remove(root, FAVORITES_SELECTORS));
      element.querySelectorAll("#favorites-page p.no-favorites").forEach((p) => {
        const text = normText(p);
        if (!text || p.querySelector("em")) return;
        const em = doc.createElement("em");
        em.textContent = text;
        p.textContent = "";
        p.append(em);
      });
      roots.forEach((root) => WebImporter.DOMUtils.remove(root, NOISE_SELECTORS));
      const blockSelectors = (payload && payload.template && payload.template.blocks || []).flatMap((b) => b.instances || []);
      const inBlock = (el) => blockSelectors.some((sel) => {
        try {
          return !!el.closest(sel);
        } catch (e) {
          return false;
        }
      });
      roots.forEach((root) => {
        root.querySelectorAll(".elementor-widget-heading :is(h3, h4)").forEach((h) => {
          if (inBlock(h) || h.closest(".e-loop-item") || !normText(h)) return;
          const h2 = doc.createElement("h2");
          if (h.className) h2.className = h.className;
          h2.innerHTML = h.innerHTML;
          h.replaceWith(h2);
        });
      });
    }
  }

  // tools/importer/transformers/bradesco-landing.js
  var TransformHook3 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var CONTACT_URL = "https://bradescobank.com/en/help/";
  var MEDIA_SELECTOR2 = "img, picture, video, iframe";
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
  function normText2(el) {
    return (el.textContent || "").replace(/[ ​\s]+/g, " ").trim();
  }
  function isContentEmpty2(el) {
    return normText2(el) === "" && !el.querySelector(MEDIA_SELECTOR2) && !el.matches(MEDIA_SELECTOR2);
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
  function transform3(hookName, element, payload) {
    const doc = element.ownerDocument;
    if (hookName === TransformHook3.beforeTransform) {
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
        if (!el.isConnected || !isContentEmpty2(el)) return;
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
          if (isContentEmpty2(child)) child.remove();
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
  var MEDIA_SELECTOR3 = "img, picture, video, iframe";
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
      } else if (node.matches(MEDIA_SELECTOR3)) {
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
  function transform4(hookName, element, payload) {
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
  function transform5(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    element.querySelectorAll("a[href]").forEach((a) => {
      const raw = a.getAttribute("href");
      if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return;
      const path = toSitePath(raw);
      if (path) a.setAttribute("href", path);
    });
  }

  // tools/importer/import-listing.js
  var parsers = {
    "hero-video": parse,
    "hero-banner": parse2,
    "cards-feature": parse3,
    "cards-audience": parse4
  };
  var PAGE_TEMPLATE = {
    "name": "listing",
    "description": "Article listing/archive (loop grid of post cards)",
    "urls": [
      "https://bradescobank.com/en/articles-archive/",
      "https://bradescobank.com/en/insights-archive/",
      "https://bradescobank.com/en/investments-content/",
      "https://bradescobank.com/en/investments-content/saved-articles/"
    ],
    "blocks": [
      {
        "name": "hero-video",
        "instances": [".elementor-12376 .elementor-element-582fe00"]
      },
      {
        "name": "hero-banner",
        "instances": [
          ".elementor-8560 .elementor-element-0a2dd9b",
          ".elementor-8507 .elementor-element-055b7fa",
          ".elementor-12632 .elementor-element-7d911c2"
        ]
      },
      {
        "name": "cards-feature",
        "instances": [
          ".elementor-12376 .elementor-element-557535a .custom-posts-grid",
          ".elementor-12376 .elementor-element-08b96a1",
          ".elementor-8560 .elementor-element-5f0fbb7",
          ".elementor-8507 .elementor-element-9bbcacf"
        ]
      },
      {
        "name": "cards-audience",
        "instances": [".elementor-12376 .elementor-element-84ac3c9"]
      }
    ],
    "sections": [
      {
        "id": "listing-hero",
        "name": "listing-hero",
        "selector": [
          ".elementor-12376 .elementor-element-582fe00",
          ".elementor-8560 .elementor-element-0a2dd9b",
          ".elementor-8507 .elementor-element-055b7fa",
          ".elementor-12632 .elementor-element-7d911c2"
        ],
        "style": null,
        "blocks": ["hero-video", "hero-banner"],
        "defaultContent": []
      },
      {
        "id": "listing-strip",
        "name": "listing-strip (decorative gradient/red strip under the hero, dropped)",
        "selector": [
          ".elementor-12376 .elementor-element-62594cb",
          ".elementor-8560 .elementor-element-cf4cd2b",
          ".elementor-8507 .elementor-element-68f1a2b",
          ".elementor-12632 .elementor-element-62594cb"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "listing-blog-menu",
        "name": "listing-blog-menu (blog sub-menu: Home pill + Saved Articles, dropped as chrome)",
        "selector": [
          ".elementor-12376 .elementor-element-5be4d04",
          ".elementor-12632 .elementor-element-0839dfe"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": []
      },
      {
        "id": "listing-highlights",
        "name": "listing-highlights",
        "selector": [".elementor-12376 .elementor-element-65b7b51"],
        "style": "fade",
        "blocks": ["cards-feature"],
        "defaultContent": [".elementor-12376 .elementor-element-c5e1a42"]
      },
      {
        "id": "listing-latest",
        "name": "listing-latest",
        "selector": [".elementor-12376 .elementor-element-f7af171"],
        "style": null,
        "blocks": ["cards-feature"],
        "defaultContent": [".elementor-12376 .elementor-element-69c13d9"]
      },
      {
        "id": "listing-categories",
        "name": "listing-categories",
        "selector": [".elementor-12376 .elementor-element-84ac3c9"],
        "style": null,
        "blocks": ["cards-audience"],
        "defaultContent": []
      },
      {
        "id": "listing-archive",
        "name": "listing-archive",
        "selector": [
          ".elementor-8560 .elementor-element-18b7df7",
          ".elementor-8507 .elementor-element-b348263"
        ],
        "style": null,
        "blocks": ["cards-feature"],
        "defaultContent": []
      },
      {
        "id": "listing-favorites",
        "name": "listing-favorites (saved-articles empty state)",
        "selector": [".elementor-12632 .elementor-element-1deedd6"],
        "style": null,
        "blocks": [],
        "defaultContent": [".elementor-12632 .elementor-element-1deedd6 .no-favorites"]
      }
    ]
  };
  var INSTANCE_OPTIONS = {
    "hero-banner": {
      ".elementor-8560 .elementor-element-0a2dd9b": ["compact"],
      ".elementor-8507 .elementor-element-055b7fa": ["compact"],
      ".elementor-12632 .elementor-element-7d911c2": ["compact", "short"]
    },
    "cards-feature": {
      ".elementor-12376 .elementor-element-557535a .custom-posts-grid": ["posts", "featured"],
      ".elementor-12376 .elementor-element-08b96a1": ["posts"],
      ".elementor-8560 .elementor-element-5f0fbb7": ["posts", "list", "paged-3"],
      ".elementor-8507 .elementor-element-9bbcacf": ["posts", "text", "paged-9"]
    },
    "cards-audience": {
      ".elementor-12376 .elementor-element-84ac3c9": ["promo"]
    }
  };
  var BLOCK_ATTR = "data-excat-block";
  var transformers = [
    transform,
    transform2,
    transform3,
    transform4,
    transform5
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
          element.setAttribute(BLOCK_ATTR, blockDef.name);
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
  function paginationUrls(widget, currentHref) {
    const current = new URL(currentHref);
    const seen = /* @__PURE__ */ new Set([current.href]);
    const urls = [];
    widget.querySelectorAll(".elementor-pagination a.page-numbers[href]").forEach((a) => {
      const href = new URL(a.getAttribute("href"), current).href;
      if (seen.has(href)) return;
      seen.add(href);
      urls.push(href);
    });
    return urls;
  }
  function loadAllPages(document) {
    return __async(this, null, function* () {
      const widgets = [...document.querySelectorAll(".elementor-widget-loop-grid")].filter((w) => w.querySelector(".elementor-pagination"));
      for (const widget of widgets) {
        const id = widget.getAttribute("data-id");
        const container = widget.querySelector(".elementor-loop-container");
        if (!id || !container) continue;
        const known = new Set([...container.querySelectorAll(".e-loop-item")].map((it) => (it.className.match(/e-loop-item-(\d+)/) || [])[1]).filter(Boolean));
        const urls = paginationUrls(widget, document.location.href);
        for (const url of urls) {
          try {
            const res = yield fetch(url, { credentials: "same-origin" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const doc = new DOMParser().parseFromString(yield res.text(), "text/html");
            const src = doc.querySelector(`.elementor-widget-loop-grid[data-id="${id}"] .elementor-loop-container`);
            if (!src) throw new Error("loop grid not found");
            let added = 0;
            [...src.children].forEach((child) => {
              if (child.matches(".e-loop-item")) {
                const postId = (child.className.match(/e-loop-item-(\d+)/) || [])[1];
                if (postId && known.has(postId)) return;
                if (postId) known.add(postId);
                added += 1;
              } else if (child.tagName !== "STYLE") {
                return;
              }
              container.append(document.importNode(child, true));
            });
            console.log(`Loop grid ${id}: +${added} posts from ${url}`);
          } catch (e) {
            console.warn(`Loop grid ${id}: page ${url} could not be loaded: ${e.message}`);
          }
        }
      }
    });
  }
  function materializeLoopBackgrounds(document) {
    const view = document.defaultView;
    document.querySelectorAll('.e-loop-item [data-settings*="background_background"]').forEach((el) => {
      if (el.querySelector("img")) return;
      const bg = view.getComputedStyle(el).backgroundImage || "";
      const m = bg.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
      if (!m || /\.svg(\?|$)/i.test(m[1])) return;
      const img = document.createElement("img");
      img.src = m[1];
      img.alt = "";
      el.prepend(img);
      el.style.backgroundImage = "none";
    });
  }
  function resolveShortlinks(document) {
    return __async(this, null, function* () {
      const links = [...document.querySelectorAll('a[href*="?p="]')].filter((a) => {
        try {
          const u = new URL(a.href);
          return /(^|\.)bradescobank\.com$/.test(u.hostname) && /^\/?$/.test(u.pathname) && u.searchParams.get("p");
        } catch (e) {
          return false;
        }
      });
      if (!links.length) return;
      const ids = [...new Set(links.map((a) => new URL(a.href).searchParams.get("p")))];
      const map = {};
      try {
        const res = yield fetch(`/wp-json/wp/v2/posts?include=${ids.join(",")}&per_page=100&_fields=id,link`);
        if (res.ok) (yield res.json()).forEach((p) => {
          map[String(p.id)] = p.link;
        });
      } catch (e) {
        console.warn(`Shortlinks: REST lookup failed: ${e.message}`);
      }
      for (const id of ids.filter((i) => !map[i])) {
        try {
          const res = yield fetch(`/?p=${id}`, { credentials: "same-origin" });
          if (res.ok && !/[?&]p=/.test(res.url)) map[id] = res.url;
        } catch (e) {
        }
      }
      links.forEach((a) => {
        const target = map[new URL(a.href).searchParams.get("p")];
        if (target) a.setAttribute("href", target);
        else console.warn(`Shortlink not resolved: ${a.href}`);
      });
    });
  }
  var import_listing_default = {
    /** Runs on the live page (awaited) before html2md copies the document. */
    onLoad: (_0) => __async(void 0, [_0], function* ({ document }) {
      yield loadAllPages(document);
      materializeLoopBackgrounds(document);
      yield resolveShortlinks(document);
    }),
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      const source = new URL(params.originalURL);
      const basePath = source.pathname.replace(/\/$/, "").replace(/\.html?$/, "");
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
      main.querySelectorAll(`[${BLOCK_ATTR}]`).forEach((el) => el.removeAttribute(BLOCK_ATTR));
      main.appendChild(document.createElement("hr"));
      const meta = WebImporter.Blocks.getMetadata(document) || {};
      meta.template = PAGE_TEMPLATE.name;
      main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(basePath === "" ? "/index" : basePath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_listing_exports);
})();
