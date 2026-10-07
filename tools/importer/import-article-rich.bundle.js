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

  // tools/importer/import-article-rich.js
  var import_article_rich_exports = {};
  __export(import_article_rich_exports, {
    default: () => import_article_rich_default
  });

  // tools/importer/parsers/hero-article.js
  function urlFromCss(value) {
    if (!value) return null;
    const m = String(value).match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m && !/^data:/i.test(m[1]) ? m[1].trim() : null;
  }
  function elementClass(element) {
    return [...element.classList].find((c) => /^elementor-element-[0-9a-f]{6,8}$/.test(c)) || (element.getAttribute("data-id") ? `elementor-element-${element.getAttribute("data-id")}` : "elementor-element-b710887");
  }
  function postId(element, document) {
    const host = element.closest("[data-elementor-id]");
    if (host) return host.getAttribute("data-elementor-id");
    const m = (document.body && document.body.className || "").match(/postid-(\d+)/);
    return m ? m[1] : null;
  }
  function pickFromRules(rules, cls, pid) {
    const hits = rules.filter((r) => r.selector.includes(cls) && /background-image\s*:/i.test(r.body)).map((r) => {
      const decl = r.body.match(/background-image\s*:\s*([^;]+)/i);
      return { url: decl ? urlFromCss(decl[1]) : null, selector: r.selector, media: r.media };
    }).filter((h) => h.url);
    if (!hits.length) return null;
    const score = (h) => (pid && h.selector.includes(`elementor-${pid}`) ? 2 : 0) + (h.media ? 0 : 1);
    hits.sort((a, b) => score(b) - score(a));
    return hits[0].url;
  }
  function rulesFromText(text) {
    const rules = [];
    const clean = text.replace(/\/\*[\s\S]*?\*\//g, "");
    const re = /([^{}]*)\{([^{}]*)\}/g;
    let m;
    while (m = re.exec(clean)) {
      const before = clean.slice(0, m.index);
      const depth = (before.match(/\{/g) || []).length - (before.match(/\}/g) || []).length;
      rules.push({ selector: m[1].trim(), body: m[2], media: depth > 0 ? "nested" : null });
    }
    return rules;
  }
  function rulesFromCssom(document) {
    const rules = [];
    const walk = (list, media) => {
      [...list || []].forEach((r) => {
        if (r.cssRules && !r.selectorText) walk(r.cssRules, r.media ? r.media.mediaText : media);
        else if (r.selectorText && r.style) {
          rules.push({ selector: r.selectorText, body: `background-image:${r.style.backgroundImage || ""};`, media });
        }
      });
    };
    try {
      [...document.styleSheets || []].forEach((sheet) => {
        try {
          walk(sheet.cssRules, null);
        } catch (e) {
        }
      });
    } catch (e) {
    }
    return rules;
  }
  function resolveImage(element, document) {
    const img = element.querySelector(":scope > img, :scope > picture img");
    if (img) {
      const s = img.getAttribute("data-src") || img.getAttribute("src");
      if (s) return s;
    }
    let src = urlFromCss(element.getAttribute("style"));
    if (src) return src;
    try {
      const view = element.ownerDocument && element.ownerDocument.defaultView || document.defaultView;
      if (view && view.getComputedStyle) src = urlFromCss(view.getComputedStyle(element).backgroundImage);
    } catch (e) {
    }
    if (src) return src;
    const cls = elementClass(element);
    const pid = postId(element, document);
    const styleText = [...document.querySelectorAll("style")].map((s) => s.textContent || "").join("\n");
    src = pickFromRules(rulesFromText(styleText), cls, pid) || pickFromRules(rulesFromCssom(document), cls, pid);
    if (src) return src;
    const og = document.querySelector('meta[property="og:image"], meta[name="og:image"], meta[name="twitter:image"]');
    return og ? og.getAttribute("content") : null;
  }
  function parse(element, { document }) {
    const heading = element.querySelector("h1, .elementor-widget-theme-post-title .elementor-heading-title, h2");
    const titleText = heading ? heading.textContent.replace(/\s+/g, " ").trim() : "";
    const src = resolveImage(element, document);
    if (!titleText && !src) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (src) {
      const img = document.createElement("img");
      try {
        img.src = new URL(src, document.baseURI || document.location.href).href;
      } catch (e) {
        img.src = src;
      }
      if (/^\.\/|^images\//.test(src)) img.setAttribute("src", src);
      img.alt = titleText;
      cells.push([img]);
    }
    if (titleText) {
      const h1 = document.createElement("h1");
      h1.innerHTML = heading.innerHTML.trim();
      cells.push([h1]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-article", cells });
    element.replaceWith(block);
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
  function parseLanding(element, { document, options }) {
    const cells = [];
    accordionItems(element).forEach(({ title, body }) => {
      const label = title ? EL.norm(title.textContent) : "";
      if (!label) return;
      const answer = [];
      body.forEach((node) => {
        EL.collect(document, node, { bgImages: false }).forEach((it) => {
          if (it.el) answer.push(it.el);
        });
      });
      const answerText = answer.map((n) => EL.norm(n.textContent)).join("").replace(/[-–—]/g, "");
      if (/^accordion$/i.test(label) && !answerText) return;
      cells.push([label, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName("accordion", options), cells });
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
    const norm3 = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm3(n.textContent) || !!n.querySelector("img");
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
        const ps = [...body.querySelectorAll("p")].filter((p) => norm3(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm3(body.textContent);
        if (norm3(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm3(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm3(n.textContent)) {
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
          if (n.querySelector("img") && !norm3(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm3(n.textContent)) return;
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
          if (norm3(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm3(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm3(list.textContent)) push(items, { kind: "list", el: list }, container);
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
      if (!title || !norm3(title.textContent)) return null;
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
          const text = norm3((a.querySelector(".elementor-button-text") || a).textContent);
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
            if (!norm3(text.textContent)) return;
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
          if (d && norm3(d.textContent)) {
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
          if (!norm3(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
        const texts = tmp.filter((i) => i.el && norm3(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm3(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
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
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm3(n.textContent));
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
    function blockName2(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm: norm3,
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
      blockName: blockName2,
      LEGACY_ROOTS
    };
  })();
  var INFO_ROOTS = ["1178", "2212", "1481", "1401", "2391", "2498", "467", "631", "6834", "2456", "2514", "2527"].map((id) => `.elementor-${id}`).join(", ");
  function isInfoPage(element, template) {
    if (template) return template === "info-page";
    return !!element.closest(INFO_ROOTS);
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
      parseLanding(element, { document, options });
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const head = item.querySelector(".elementor-tab-title");
      const title = head && (head.querySelector(".elementor-accordion-title, .elementor-toggle-title") || head);
      const label = title ? EL.norm(title.textContent) : "";
      if (!label) return;
      const content = item.querySelector(".elementor-tab-content");
      const answer = [];
      if (content) EL.collect(document, content, { bgImages: false }).forEach((it) => {
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
    const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName("accordion", options), cells });
    element.replaceWith(block);
  }
  function articleRichHeadingTag(widgetEl) {
    const parent = widgetEl && widgetEl.parentElement;
    if (!parent) return "h3";
    const withIcon = [...parent.children].some((c) => c !== widgetEl && EL.isWidget(c) && EL.widgetType(c) === "icon");
    return withIcon ? "h4" : "h3";
  }
  function parseArticleRich(element, { document, options }) {
    const cells = [];
    accordionItems(element).forEach(({ title, body }) => {
      const label = title ? EL.norm(title.textContent) : "";
      if (!label) return;
      const answer = [];
      body.forEach((node) => {
        EL.collect(document, node, { bgImages: false, iconItems: false }).forEach((it) => {
          if (!it.el) return;
          if (it.kind === "image") return;
          if (it.kind === "heading") {
            const isWidgetOrigin = it.origin && EL.isWidget(it.origin);
            const tag = isWidgetOrigin ? articleRichHeadingTag(it.origin) : "h3";
            const h = EL.retag(document, it.el, tag);
            if (!h.children.length) h.textContent = EL.norm(h.textContent);
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
    const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName("accordion", options), cells });
    element.replaceWith(block);
  }
  function parse2(element, { document, options, basePath, template } = {}) {
    const opts = options || [];
    if (template === "article-rich") {
      parseArticleRich(element, { document, options: opts, basePath: basePath || "" });
      return;
    }
    if (isInfoPage(element, template) && opts.includes("icons")) {
      parseInfoIcons(element, { document, options: opts, basePath: basePath || "" });
      return;
    }
    parseLanding(element, { document, options: opts, basePath: basePath || "" });
  }

  // tools/importer/parsers/cards-feature.js
  var NO_TITLE_PROMOTION = ["icons", "circle", "steps", "links", "posts", "carousel"];
  var BADGE = /^\(?\s*coming soon\s*\)?$/i;
  function cardItems(element) {
    const slides = [...element.querySelectorAll(".swiper-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate") && EL2.hasContent(s));
    if (slides.length) return slides;
    const loop = [...element.querySelectorAll(".e-loop-item")].filter((s) => EL2.hasContent(s));
    if (loop.length) return loop;
    return EL2.findItems(element);
  }
  function cardBody(document, item, options) {
    const raw = EL2.collect(document, item, { bgImages: false, dividers: true, imageLinks: !options.includes("posts") });
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
          body.push(EL2.retag(document, it.el, "h3"));
        } else {
          body.push(EL2.retag(document, it.el, it === tagline ? "h4" : "p"));
        }
        return;
      }
      if (it.kind === "text" && BADGE.test(EL2.norm(it.el.textContent)) && !it.el.querySelector("em")) {
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = EL2.norm(it.el.textContent);
        p.append(em);
        body.push(p);
        return;
      }
      body.push(it.el);
    });
    if (!titled && !options.some((o) => NO_TITLE_PROMOTION.includes(o))) {
      const texts = body.filter((el) => el.tagName === "P" && !el.querySelector("em:only-child"));
      const first = texts[0];
      if (first && texts.length >= 2 && !first.querySelector("a") && EL2.norm(first.textContent).length <= 40 && !/[.:]$/.test(EL2.norm(first.textContent))) {
        body[body.indexOf(first)] = EL2.retag(document, first, "h3");
      }
    }
    let imageEl = image ? image.el : null;
    if (!imageEl) {
      const src = EL2.bgUrl(item);
      if (src) imageEl = EL2.bgImageItem(document, src).el;
    }
    return { imageEl, body };
  }
  function parseLanding2(element, { document, options }) {
    EL2.unlazy(document);
    const items = cardItems(element);
    const rows = items.map((item) => cardBody(document, item, options)).filter((r) => r.body.length || r.imageEl);
    const ctaHost = element.nextElementSibling && element.nextElementSibling.matches(".elementor-element-9e81d46") ? element.nextElementSibling : null;
    if (ctaHost && element.matches(".elementor-element-9c6aacd")) {
      const ctas = EL2.collect(document, ctaHost).filter((it) => it.kind === "button");
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
      if (host && host !== element && element.contains(host)) ({ before, after } = EL2.outside(element, [host]));
    } else {
      ({ before, after } = EL2.outside(element, items));
    }
    EL2.moveOut(document, element, before, "before");
    EL2.moveOut(document, element, after, "after");
    const withImage = rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("cards-feature", options), cells });
    element.replaceWith(block);
    if (ctaHost) ctaHost.remove();
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
    const norm3 = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm3(n.textContent) || !!n.querySelector("img");
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
        const ps = [...body.querySelectorAll("p")].filter((p) => norm3(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm3(body.textContent);
        if (norm3(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm3(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm3(n.textContent)) {
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
          if (n.querySelector("img") && !norm3(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm3(n.textContent)) return;
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
          if (norm3(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm3(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm3(list.textContent)) push(items, { kind: "list", el: list }, container);
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
      if (!title || !norm3(title.textContent)) return null;
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
          const text = norm3((a.querySelector(".elementor-button-text") || a).textContent);
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
            if (!norm3(text.textContent)) return;
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
          if (d && norm3(d.textContent)) {
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
          if (!norm3(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
        const texts = tmp.filter((i) => i.el && norm3(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm3(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
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
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm3(n.textContent));
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
    function blockName2(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm: norm3,
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
      blockName: blockName2,
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
    const filled = lines.filter((l) => l.some((n) => EL2.norm(n.textContent)));
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
    const text = EL2.norm(p.textContent);
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
      const first = out.find((el) => el.tagName === "P" && EL2.norm(el.textContent));
      const link = first && first.querySelector("a");
      const isLink = !!link && EL2.norm(first.textContent) === EL2.norm(link.textContent);
      if (first && !isLink) out[out.indexOf(first)] = EL2.retag(document, first, "h3");
    }
    return out;
  }
  function parseInfo(element, { document, options }) {
    EL2.unlazy(document);
    let items = options.includes("documents") ? [...element.querySelectorAll(".box-cra")].filter((n) => EL2.hasContent(n)) : [];
    if (!items.length) items = cardItems(element);
    const single = !items.length && EL2.hasContent(element);
    if (single) items = [element];
    const rows = items.map((item) => cardBody(document, item, options)).filter((r) => r.body.length || r.imageEl).map((r) => ({ imageEl: r.imageEl, body: infoBody(document, r.body, options) }));
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (!single) {
      const { before, after } = EL2.outside(element, items);
      EL2.moveOut(document, element, before, "before");
      EL2.moveOut(document, element, after, "after");
    }
    const withImage = options.includes("documents") || rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("cards-feature", options), cells });
    element.replaceWith(block);
  }
  var LISTING_DROP = ".favorite-container, .post-bookmark-placeholder, button, script, style, noscript, svg, .elementor-element-05a409f, .elementor-hidden-desktop";
  var LISTING_DATE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  var LISTING_BYLINE = /^by\s+(\S.*)$/i;
  var LISTING_TITLE = ".post-title, .elementor-widget-theme-post-title, .elementor-widget-heading";
  var LISTING_TEXT = ".post-excerpt, .elementor-widget-text-editor, .elementor-widget-theme-post-excerpt, .elementor-widget-shortcode";
  function listingItems(element) {
    const cards = [...element.querySelectorAll("article.post-card")].filter((n) => EL2.hasContent(n));
    if (cards.length) return cards;
    const loop = [...element.querySelectorAll(".e-loop-item")].filter((n) => EL2.hasContent(n));
    if (loop.length) return loop;
    return EL2.findItems(element);
  }
  var listingDropped = (n) => !!n.closest(LISTING_DROP);
  var listingText = (n) => {
    const c = n.cloneNode(true);
    c.querySelectorAll(LISTING_DROP).forEach((x) => x.remove());
    return EL2.norm(c.textContent);
  };
  var listingHref = (a) => {
    const href = a && a.getAttribute("href");
    return href && !/^#?$/.test(href) ? EL2.fixHref(href) : null;
  };
  function listingRow(document, item) {
    const p = (text) => {
      const el = document.createElement("p");
      el.textContent = text;
      return el;
    };
    let imageEl = null;
    let imageLink = null;
    const img = [...item.querySelectorAll("img")].find((i) => !listingDropped(i) && EL2.imgSrc(i));
    if (img) {
      const it = EL2.imageItem(document, img, false);
      if (it) {
        imageEl = it.el;
        imageLink = img.closest("a[href]");
      }
    }
    if (!imageEl) {
      const bg = [item, ...item.querySelectorAll('[data-settings*="background_background"]')].filter((n) => !listingDropped(n) && !EL2.norm(n.textContent)).map((n) => EL2.bgUrl(n)).find((src) => src && !/\.svg(\?|#|$)/i.test(src));
      if (bg) imageEl = EL2.bgImageItem(document, bg).el;
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
    EL2.unlazy(document);
    const items = listingItems(element);
    const rows = items.map((item) => listingRow(document, item)).filter((r) => r.body.length || r.imageEl);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const { before, after } = EL2.outside(element, items);
    EL2.moveOut(document, element, before, "before");
    EL2.moveOut(document, element, after, "after");
    const withImage = rows.some((r) => r.imageEl);
    const cells = rows.map((r) => withImage ? [r.imageEl || "", r.body] : [r.body]);
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("cards-feature", options), cells });
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
    const p = EL2.clean(EL2.make(document, "p", html));
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
    EL2.collect(document, w, { bgImages: false, iconItems: false }).forEach((it) => {
      if (!it.el || it.kind === "image") return;
      if (it.kind === "list") {
        out.push(it.el);
        return;
      }
      out.push(arParagraph(document, it.el.innerHTML));
    });
    return out.filter((n) => EL2.norm(n.textContent));
  }
  function arSlideIcon(document, slide) {
    const img = [...slide.querySelectorAll(".elementor-widget-icon img")].find((i) => !arHidden(i, slide));
    const src = img ? EL2.imgSrc(img) : "";
    if (!src) return "";
    const out = document.createElement("img");
    out.src = src;
    out.alt = "";
    return out;
  }
  function arSlideBody(document, slide) {
    const widgets = [...slide.querySelectorAll(".elementor-widget")].filter((w) => !arHidden(w, slide) && ["heading", "text-editor"].includes(EL2.widgetType(w)));
    const body = [];
    let ul = null;
    let stage = "title";
    widgets.forEach((w) => {
      const type = EL2.widgetType(w);
      if (type === "heading") {
        const t = w.querySelector(".elementor-heading-title") || w.querySelector("h1, h2, h3, h4, h5, h6, p");
        const text2 = t ? EL2.norm(t.textContent) : "";
        if (!text2) return;
        const h = EL2.clean(EL2.make(document, stage === "title" ? "h3" : "h4", t.innerHTML));
        arTidy(h);
        body.push(h);
        if (stage === "title") stage = "desc";
        return;
      }
      const paras = arWidgetParas(document, w);
      if (!paras.length) return;
      const text = EL2.norm(paras.map((p) => p.textContent).join(" "));
      if (stage === "title" || stage === "desc") {
        if (stage === "desc" && body.some((n) => n.tagName === "P") && /:$/.test(text)) {
          body.push(arTidy(EL2.make(document, "h4", paras.map((p) => p.innerHTML).join(" "))));
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
    const slides = [...element.querySelectorAll(".swiper-slide")].filter((s) => !s.classList.contains("swiper-slide-duplicate") && EL2.hasContent(s));
    const seen = /* @__PURE__ */ new Set();
    const items = [];
    slides.forEach((slide, pos) => {
      const idxAttr = slide.getAttribute("data-swiper-slide-index");
      const idx = idxAttr !== null && idxAttr !== "" && !Number.isNaN(parseInt(idxAttr, 10)) ? parseInt(idxAttr, 10) : null;
      const heading = slide.querySelector(".elementor-widget-heading .elementor-heading-title, .elementor-widget-heading h1, .elementor-widget-heading h2, .elementor-widget-heading h3");
      const key = idx !== null ? `i:${idx}` : `h:${EL2.norm(heading ? heading.textContent : slide.textContent).toLowerCase()}`;
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
    if (EL2.settings(carousel).autoplay === "yes" && !opts.includes("autoplay")) opts.push("autoplay");
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("cards-feature", opts), cells });
    element.replaceWith(block);
  }
  function parseArticleRichGrid(element, { document, options }) {
    let items = EL2.kidsOf(element).filter((k) => EL2.isCon(k) && EL2.hasContent(k));
    if (!items.length) items = EL2.findItems(element);
    const cells = [];
    items.forEach((item) => {
      const body = [];
      EL2.collect(document, item, { bgImages: false, iconItems: false }).forEach((it) => {
        if (!it.el || it.kind === "image" || it.kind === "divider") return;
        if (it.kind === "list") {
          body.push(it.el);
          return;
        }
        const p = arParagraph(document, it.el.innerHTML);
        if (EL2.norm(p.textContent)) body.push(p);
      });
      if (body.length) cells.push([body]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("cards-feature", options), cells });
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
            if (/^\d+\.?$/.test(EL2.norm(k.textContent))) k.remove();
          });
          const inner = clone.children.length === 1 && /^(P|DIV)$/.test(clone.children[0].tagName) && EL2.norm(clone.children[0].textContent) === EL2.norm(clone.textContent) ? clone.children[0] : clone;
          html = inner.innerHTML;
        }
      } else {
        html = item.innerHTML;
      }
      const p = arParagraph(document, html);
      if (EL2.norm(p.textContent)) cells.push([[p]]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL2.blockName("cards-feature", options), cells });
    element.replaceWith(block);
  }
  function parseArticleRich2(element, { document, options }) {
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
    parseLanding2(element, { document, options });
  }
  function parse3(element, { document, options, basePath, template } = {}) {
    if (template === "article-rich") {
      parseArticleRich2(element, { document, options: options || [], basePath: basePath || "" });
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
    parseLanding2(element, { document, options: options || [], basePath: basePath || "" });
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
  function parseLegacy(element, { document }) {
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
    const text = EL3.norm(cell.textContent);
    const icon = cell.querySelector('svg, .check-icon, img[src*="check" i], img[alt*="check" i], .icon-check');
    if (!text && icon || /^(✓|✔|✔️|:check:)$/u.test(text)) return CHECK;
    if (!text) return "";
    const div = EL3.make(document, "div", cell.innerHTML);
    EL3.clean(div);
    div.querySelectorAll("*").forEach((n) => {
      if (!n.childNodes.length && !/^(BR|IMG)$/.test(n.tagName)) n.remove();
    });
    [...div.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.textContent = n.textContent.replace(/\s+/g, " ");
    });
    const blocks = div.querySelectorAll("p, ul, ol");
    if (!blocks.length) return EL3.norm(div.innerHTML) === EL3.norm(div.textContent) ? text : [...div.childNodes];
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
    const headerCells = [...element.querySelectorAll(".card-tabs-header > *")].map((n) => EL3.norm(n.textContent));
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
      if (!cells.length || cells.every((c) => !EL3.norm(c.textContent) && !c.querySelector("svg, img"))) return;
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
  function parseLanding3(element, { document, options }) {
    const rows = landingRows(document, element);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const colCount = Math.max(...rows.map((r) => r.length));
    rows.forEach((r) => {
      while (r.length < colCount) r.push("");
    });
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("table-article", options), cells: rows });
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
    const norm3 = (s) => String(s || "").replace(/[\s\u00a0\u200b\u2028\u2029]+/g, " ").trim();
    const isEl = (n) => !!n && n.nodeType === 1;
    const hidden = (n) => isEl(n) && n.classList && (n.classList.contains("elementor-hidden-desktop") || n.classList.contains("swiper-slide-duplicate"));
    const isWidget = (n) => isEl(n) && (n.classList.contains("elementor-widget") || n.getAttribute("data-element_type") === "widget");
    const isCon = (n) => isEl(n) && !isWidget(n) && (n.classList.contains("e-con") || n.classList.contains("e-con-inner") || n.classList.contains("elementor-section") || n.classList.contains("elementor-column") || n.classList.contains("elementor-widget-wrap") || n.getAttribute("data-element_type") === "container");
    const hasContent = (n) => !!norm3(n.textContent) || !!n.querySelector("img");
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
        const ps = [...body.querySelectorAll("p")].filter((p) => norm3(p.textContent));
        ps.forEach((p, i) => {
          if (i) li.append(doc.createElement("br"));
          const tmp = make(doc, "span", p.innerHTML);
          li.append(...tmp.childNodes);
        });
        if (!h && !ps.length) li.textContent = norm3(body.textContent);
        if (norm3(li.textContent)) list.append(clean(li));
      });
      return list.children.length ? { kind: "list", el: list } : null;
    }
    let walkContainer;
    function flow(doc, container, items, opts) {
      let run = null;
      const flush = () => {
        if (run && (norm3(run.textContent) || run.querySelector("img"))) {
          push(items, { kind: "text", el: clean(run) }, container);
        }
        run = null;
      };
      [...container.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (norm3(n.textContent)) {
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
          if (n.querySelector("img") && !norm3(n.textContent)) {
            flush();
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          if (!norm3(n.textContent)) return;
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
          if (norm3(n.textContent)) push(items, { kind: "heading", el: clean(make(doc, tag.toLowerCase(), n.innerHTML)) }, container);
          return;
        }
        if (tag === "P") {
          if (!norm3(n.textContent)) {
            n.querySelectorAll("img").forEach((img) => push(items, imageItem(doc, img), container));
            return;
          }
          push(items, { kind: "text", el: clean(make(doc, "p", n.innerHTML)) }, container);
          return;
        }
        if (tag === "UL" || tag === "OL") {
          const list = clean(make(doc, tag.toLowerCase(), n.innerHTML));
          if (norm3(list.textContent)) push(items, { kind: "list", el: list }, container);
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
      if (!title || !norm3(title.textContent)) return null;
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
          const text = norm3((a.querySelector(".elementor-button-text") || a).textContent);
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
            if (!norm3(text.textContent)) return;
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
          if (d && norm3(d.textContent)) {
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
          if (!norm3(c.textContent).replace(/[\d.\s]+/g, "") && !c.querySelector("img")) return;
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
        const texts = tmp.filter((i) => i.el && norm3(i.el.textContent));
        if (texts.length === 1) {
          push(items, { kind: "li", el: clean(make(doc, "li", texts[0].el.innerHTML)) }, con);
          return;
        }
      }
      if (opts.bgImages && !norm3(con.textContent) && !con.querySelector(".elementor-widget img, video, iframe")) {
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
      const text = [...k.querySelectorAll("p, li, .elementor-widget-text-editor, .elementor-widget-html")].some((n) => norm3(n.textContent));
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
    function blockName2(base, options) {
      const opts = (options || []).filter(Boolean);
      return opts.length ? `${base} (${opts.join(", ")})` : base;
    }
    const LEGACY_ROOTS = ".elementor-14769, .elementor-location-single";
    return {
      norm: norm3,
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
      blockName: blockName2,
      LEGACY_ROOTS
    };
  })();
  var INFO_ROOTS3 = ["1178", "2212", "1481", "1401", "2391", "2498", "467", "631", "6834", "2456", "2514", "2527"].map((id) => `.elementor-${id}`).join(", ");
  var BLOCK_ATTR = "data-excat-block";
  function isInfoPage3(element, template) {
    if (template) return template === "info-page";
    return !!element.closest(INFO_ROOTS3);
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
      const d = EL3.norm(date.join(""));
      const nm = EL3.norm(name.join(""));
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
    if ([...host.children].some((c) => EL3.isWidget(c))) return false;
    return noticeCells(n).length >= 2;
  }
  function noticeCell(document, cell) {
    const els = EL3.collect(document, cell, { bgImages: false }).map((it) => it.el).filter(Boolean);
    const text = els.map((e) => EL3.norm(e.textContent)).join("");
    if (!els.length || /^[.\s]*$/.test(text) && !els.some((e) => e.querySelector && e.querySelector("img"))) return "";
    return els;
  }
  function parseNotice(element, { document, options }) {
    if (noticeCells(element).length < 2) {
      parseLanding3(element, { document, options });
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
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("table-article", options), cells: rows });
    trs.slice(1).forEach((tr) => tr.remove());
    element.replaceWith(block);
  }
  function parseCalendar(element, { document, options }) {
    const rows = calendarRows(element);
    if (!rows.length) {
      parseLanding3(element, { document, options });
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("table-article", options), cells: rows });
    element.replaceWith(block);
  }
  function articleRichCell(document, cell) {
    if (!cell) return "";
    const text = EL3.norm(cell.textContent);
    if (!text && !cell.querySelector("img")) return "";
    const div = EL3.clean(EL3.make(document, "div", cell.innerHTML));
    div.querySelectorAll("p").forEach((p) => {
      if (!EL3.norm(p.textContent) && !p.querySelector("img")) p.remove();
    });
    [...div.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.textContent = n.textContent.replace(/[\s\u00a0]+/g, " ");
    });
    if (!div.children.length) return text;
    while (div.firstChild && div.firstChild.nodeType === 3 && !EL3.norm(div.firstChild.textContent)) div.firstChild.remove();
    while (div.lastChild && div.lastChild.nodeType === 3 && !EL3.norm(div.lastChild.textContent)) div.lastChild.remove();
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
    const filled = (c) => !!c && (!!EL3.norm(c.textContent) || !!c.querySelector("img"));
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
    const block = WebImporter.Blocks.createBlock(document, { name: EL3.blockName("table-article", options), cells: rows });
    element.replaceWith(block);
  }
  function parse4(element, { document, options, basePath, template } = {}) {
    const opts = options || [];
    if (template === "article-rich") {
      parseArticleRich3(element, { document, options: opts, basePath: basePath || "" });
      return;
    }
    if (isInfoPage3(element, template) && (opts.includes("notice") || opts.includes("calendar"))) {
      if (opts.includes("notice")) parseNotice(element, { document, options: opts });
      else parseCalendar(element, { document, options: opts });
      return;
    }
    if (element.closest(EL3.LEGACY_ROOTS)) {
      parseLegacy(element, { document });
      return;
    }
    parseLanding3(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/compound-calculator.js
  var norm = (s) => String(s || "").replace(/[\s ​]+/g, " ").trim();
  function blockName(base, options) {
    const opts = (options || []).filter(Boolean);
    return opts.length ? `${base} (${opts.join(", ")})` : base;
  }
  function field(calc, selector, labelRe) {
    let control = calc.querySelector(selector);
    let wrap = control ? control.closest(".bdc-field") || control.parentElement : null;
    if (!control) {
      wrap = [...calc.querySelectorAll(".bdc-field")].find((f) => {
        const l = f.querySelector("label");
        return l && labelRe.test(norm(l.textContent));
      }) || null;
      control = wrap ? wrap.querySelector("input, select, textarea") : null;
    }
    let label = "";
    const labelEl = wrap ? wrap.querySelector("label") : null;
    if (labelEl) {
      const clone = labelEl.cloneNode(true);
      clone.querySelectorAll(".bdc-years-val").forEach((s) => s.remove());
      label = norm(clone.textContent).replace(/\s*\(\s*\)\s*$/, "");
    }
    return { control, label };
  }
  function attr(el, name, fallback) {
    const v = el ? el.getAttribute(name) : null;
    return v !== null && norm(v) !== "" ? norm(v) : fallback;
  }
  function parse5(element, { document, options } = {}) {
    const calc = element.matches(".bdc-calc") ? element : element.querySelector(".bdc-calc");
    if (!calc) return;
    const titleEl = calc.querySelector(".bdc-calc__title") || calc.querySelector("h1, h2, h3, h4");
    const title = titleEl ? norm(titleEl.textContent) : "";
    const start = field(calc, "#bdc-start", /^starting amount/i);
    const contrib = field(calc, "#bdc-contrib", /^contribution\b(?!.*frequency)/i);
    const freq = field(calc, "#bdc-freq", /frequency/i);
    const rate = field(calc, "#bdc-rate", /return|rate/i);
    const years = field(calc, ".bdc-years", /^years/i);
    let frequency = "annual";
    if (freq.control) {
      const opt = freq.control.querySelector("option[selected]");
      if (opt && norm(opt.textContent)) frequency = norm(opt.textContent).toLowerCase();
    }
    const row = (key, value, label) => label ? [key, value, label] : [key, value];
    const cells = [];
    if (title) cells.push(["title", title]);
    cells.push(row("start", attr(start.control, "value", "1000"), start.label));
    cells.push(row("contribution", attr(contrib.control, "value", "0"), contrib.label));
    cells.push(row("frequency", frequency, freq.label));
    cells.push(row("rate", attr(rate.control, "value", "10"), rate.label));
    cells.push(row("years", attr(years.control, "value", "4"), years.label));
    cells.push(["max-years", attr(years.control, "max", "30")]);
    const disclaimerEl = calc.querySelector(".bdc-disclaimer") || calc.parentElement && calc.parentElement.querySelector(".bdc-disclaimer");
    const disclaimer = disclaimerEl ? norm(disclaimerEl.textContent) : "";
    if (disclaimer) {
      const p = document.createElement("p");
      p.textContent = disclaimer;
      cells.push(["disclaimer", p]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: blockName("compound-calculator", options), cells });
    element.replaceWith(block);
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

  // tools/importer/transformers/bradesco-article-rich.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var POST_BODY = ".elementor-widget-theme-post-content";
  var MAX_HEADING_CHARS = 120;
  var MIN_HEADING_PX = 24;
  var BLOCK_ANCESTORS = [
    ".elementor-widget-n-accordion",
    ".e-n-accordion-item",
    ".elementor-widget-n-carousel",
    ".swiper-slide",
    ".e-con.e-grid",
    ".bdc-calc",
    ".elementor-widget-shortcode",
    ".elementor-widget-html",
    "table"
  ];
  function norm2(text) {
    return (text || "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function computedFontSize(el) {
    try {
      const view = el.ownerDocument && el.ownerDocument.defaultView;
      if (!view || typeof view.getComputedStyle !== "function") return NaN;
      return parseFloat(view.getComputedStyle(el).fontSize);
    } catch (e) {
      return NaN;
    }
  }
  function blockInstanceRoots(root, payload) {
    const roots = /* @__PURE__ */ new Set();
    const blocks = payload.template && payload.template.blocks || [];
    blocks.forEach((b) => {
      (b.instances || []).forEach((sel) => {
        try {
          root.querySelectorAll(sel).forEach((el) => roots.add(el));
        } catch (e) {
        }
      });
    });
    return roots;
  }
  function insideBlock(el, roots) {
    if (el.closest(BLOCK_ANCESTORS.join(","))) return true;
    for (const r of roots) {
      if (r.contains(el)) return true;
    }
    return false;
  }
  function promoteVisualHeadings(body, payload) {
    const doc = body.ownerDocument;
    const roots = blockInstanceRoots(body, payload);
    body.querySelectorAll(".elementor-widget-text-editor").forEach((widget) => {
      if (insideBlock(widget, roots)) return;
      const container = widget.querySelector(":scope > .elementor-widget-container") || widget;
      const elementKids = [...container.children];
      if (elementKids.length !== 1 || elementKids[0].tagName !== "P") return;
      const p = elementKids[0];
      const stray = [...container.childNodes].some((n) => n.nodeType === 3 && norm2(n.textContent));
      if (stray) return;
      const text = norm2(p.textContent);
      if (!text || text.length >= MAX_HEADING_CHARS) return;
      if (p.querySelector("a, img, picture, video, iframe, svg, br")) return;
      let size = computedFontSize(p);
      const only = p.children.length === 1 && norm2(p.children[0].textContent) === text ? p.children[0] : null;
      if (only) {
        const inner = computedFontSize(only);
        if (!Number.isNaN(inner) && (Number.isNaN(size) || inner > size)) size = inner;
      }
      if (Number.isNaN(size) || size < MIN_HEADING_PX) return;
      const h3 = doc.createElement("h3");
      while (p.firstChild) h3.append(p.firstChild);
      p.replaceWith(h3);
    });
  }
  function splitBreakParagraphs(body) {
    const doc = body.ownerDocument;
    const isBlank = (n) => n.nodeType === 3 && !norm2(n.textContent);
    body.querySelectorAll("p").forEach((p) => {
      if (p.closest("table")) return;
      const kids = [...p.childNodes];
      const groups = [[]];
      for (let i = 0; i < kids.length; i += 1) {
        const n = kids[i];
        if (n.nodeType === 1 && n.tagName === "BR") {
          let j = i + 1;
          while (j < kids.length && isBlank(kids[j])) j += 1;
          if (j < kids.length && kids[j].nodeType === 1 && kids[j].tagName === "BR") {
            groups.push([]);
            i = j;
            continue;
          }
        }
        groups[groups.length - 1].push(n);
      }
      const filled = groups.filter((g) => g.some((n) => !isBlank(n)));
      if (filled.length < 2) return;
      const paras = filled.map((g) => {
        const np = doc.createElement("p");
        g.forEach((n) => np.append(n));
        while (np.firstChild && (isBlank(np.firstChild) || np.firstChild.tagName === "BR")) np.firstChild.remove();
        while (np.lastChild && (isBlank(np.lastChild) || np.lastChild.tagName === "BR")) np.lastChild.remove();
        return np;
      });
      p.replaceWith(...paras);
    });
  }
  function clearFilenameAlts(body) {
    body.querySelectorAll("img[alt]").forEach((img) => {
      if (img.closest("table")) return;
      const alt = norm2(img.getAttribute("alt")).toLowerCase();
      if (!alt) return;
      const src = img.getAttribute("src") || "";
      const file = decodeURIComponent(src.split("?")[0].split("/").pop() || "").toLowerCase();
      const stem = file.replace(/\.[a-z0-9]+$/, "").replace(/[-_]+/g, " ");
      if (stem === alt || stem.startsWith(`${alt} `) && /^[\d\sx]+$/.test(stem.slice(alt.length))) img.setAttribute("alt", "");
    });
  }
  function removeDecorations(body) {
    const candidates = body.querySelectorAll([
      ".elementor-widget-divider",
      ".elementor-widget-icon",
      ".elementor-widget-spacer",
      "svg",
      'img[src^="data:"]'
    ].join(","));
    candidates.forEach((el) => {
      if (!el.isConnected || el.closest("table")) return;
      el.remove();
    });
    body.querySelectorAll(".elementor-widget-shortcode").forEach((sc) => {
      if (sc.closest("table")) return;
      if (sc.classList.contains("elementor-element-235adcb")) return;
      if (norm2(sc.textContent)) return;
      if (sc.querySelector('img:not([src^="data:"]), picture, video, iframe, table')) return;
      sc.remove();
    });
  }
  function transform2(hookName, element, payload) {
    if (!(payload && payload.template && payload.template.name === "article-rich")) return;
    const bodies = element.querySelectorAll(POST_BODY);
    if (!bodies.length) return;
    if (hookName === TransformHook2.beforeTransform) {
      bodies.forEach((body) => promoteVisualHeadings(body, payload));
    }
    if (hookName === TransformHook2.afterTransform) {
      bodies.forEach((body) => {
        removeDecorations(body);
        splitBreakParagraphs(body);
        clearFilenameAlts(body);
      });
    }
  }

  // tools/importer/transformers/bradesco-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform3(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = element.ownerDocument.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(element.ownerDocument, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
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
  function transform4(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    element.querySelectorAll("a[href]").forEach((a) => {
      const raw = a.getAttribute("href");
      if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return;
      const path = toSitePath(raw);
      if (path) a.setAttribute("href", path);
    });
  }

  // tools/importer/import-article-rich.js
  var parsers = {
    "hero-article": parse,
    accordion: parse2,
    "cards-feature": parse3,
    "table-article": parse4,
    "compound-calculator": parse5
  };
  var PAGE_TEMPLATE = {
    name: "article-rich",
    description: 'Single post built with a rich Elementor layout inside the post content (nested accordion, carousel, grid boxes, HTML widgets, compound-interest calculator shortcode); same post chrome as "article"',
    urls: [
      "https://bradescobank.com/en/exploring-investment-products-in-the-u-s/",
      "https://bradescobank.com/en/investing-for-different-client-profiles/",
      "https://bradescobank.com/en/the-power-of-compounding/"
    ],
    blocks: [
      { name: "hero-article", instances: [".elementor-location-single > .elementor-element-b710887"] },
      { name: "accordion", instances: [".elementor-widget-theme-post-content .elementor-widget-n-accordion"] },
      {
        name: "cards-feature",
        instances: [
          ".elementor-widget-theme-post-content .elementor-widget-n-carousel",
          ".elementor-widget-theme-post-content .e-con.e-grid:has(> .e-con-inner > .e-con)",
          ".elementor-widget-theme-post-content .e-con.e-grid:has(> .e-con)",
          ".elementor-widget-theme-post-content .elementor-widget-html:has(.compounding-steps)",
          ".elementor-widget-theme-post-content .elementor-widget-html:has(.investment-options)"
        ]
      },
      {
        name: "table-article",
        instances: [
          ".elementor-widget-theme-post-content .elementor-widget-html table",
          ".elementor-widget-theme-post-content .elementor-widget-text-editor table"
        ]
      },
      { name: "compound-calculator", instances: [".elementor-widget-theme-post-content .elementor-widget-shortcode:has(.bdc-calc)"] }
    ],
    sections: [
      { id: "1", name: "post-title-banner", selector: [".elementor-location-single > .elementor-element-b710887"], style: null, blocks: ["hero-article"], defaultContent: [] },
      { id: "2", name: "decorative-gradient-line (dropped)", selector: [".elementor-location-single > .elementor-element-df751d4"], style: null, blocks: [], defaultContent: [] },
      { id: "3", name: "blog-sub-menu (dropped as chrome)", selector: [".elementor-location-single > .bb-blog-menu"], style: null, blocks: [], defaultContent: [] },
      {
        id: "4",
        name: "article-body",
        selector: [".elementor-location-single > .elementor-element-0fa6826"],
        style: null,
        blocks: ["accordion", "cards-feature", "table-article", "compound-calculator"],
        defaultContent: [
          ".elementor-element-235adcb .elementor-shortcode",
          ".elementor-widget-theme-post-content .elementor-widget-heading",
          ".elementor-widget-theme-post-content .elementor-widget-text-editor",
          ".elementor-widget-theme-post-content .elementor-widget-image"
        ]
      },
      {
        id: "5",
        name: "disclaimer (post-content divider + small print)",
        selector: [
          ".elementor-widget-theme-post-content .e-con:has(> .e-con-inner > .elementor-widget-divider)",
          ".elementor-widget-theme-post-content .e-con:has(> .elementor-widget-divider)"
        ],
        style: "disclaimer",
        blocks: [],
        defaultContent: [".elementor-widget-theme-post-content .e-con:has(> .e-con-inner > .elementor-widget-divider) .elementor-widget-text-editor"]
      }
    ]
  };
  var INSTANCE_OPTIONS = {
    accordion: {
      ".elementor-widget-theme-post-content .elementor-widget-n-accordion": ["article"]
    },
    "cards-feature": {
      ".elementor-widget-theme-post-content .elementor-widget-n-carousel": ["carousel", "slides"],
      ".elementor-widget-theme-post-content .e-con.e-grid:has(> .e-con-inner > .e-con)": ["elevated", "gradient", "centered"],
      ".elementor-widget-theme-post-content .e-con.e-grid:has(> .e-con)": ["elevated", "gradient", "centered"],
      ".elementor-widget-theme-post-content .elementor-widget-html:has(.compounding-steps)": ["steps", "compact"],
      ".elementor-widget-theme-post-content .elementor-widget-html:has(.investment-options)": ["filled"]
    },
    "table-article": {
      ".elementor-widget-theme-post-content .elementor-widget-html table": ["lined"]
    }
  };
  var BLOCK_ATTR2 = "data-excat-block";
  var transformers = [transform, transform2, transform3, transform4];
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
  function svgSignature(svg) {
    return [...svg.querySelectorAll("path[d]")].map((p) => p.getAttribute("d").replace(/\s+/g, "")).join("|");
  }
  function resolveInlineIcons(document) {
    return __async(this, null, function* () {
      const svgs = [...document.querySelectorAll(".elementor-widget-theme-post-content .elementor-widget-n-carousel .elementor-widget-icon svg")];
      if (!svgs.length) return;
      const wanted = /* @__PURE__ */ new Map();
      svgs.forEach((svg) => {
        const sig = svgSignature(svg);
        if (sig) wanted.set(sig, (wanted.get(sig) || []).concat(svg));
      });
      if (!wanted.size) return;
      const meta = document.querySelector('meta[property="article:published_time"]');
      const published = meta ? new Date(meta.getAttribute("content")) : null;
      const params = new URLSearchParams({ mime_type: "image/svg+xml", per_page: "100", _fields: "source_url" });
      if (published && !Number.isNaN(published.getTime())) {
        params.set("after", new Date(published.getTime() - 120 * 864e5).toISOString().slice(0, 19));
        params.set("before", new Date(published.getTime() + 30 * 864e5).toISOString().slice(0, 19));
      }
      let media = [];
      try {
        const res = yield fetch(`/wp-json/wp/v2/media?${params}`);
        if (res.ok) media = yield res.json();
      } catch (e) {
        console.warn(`Icons: media lookup failed: ${e.message}`);
      }
      const parser = new DOMParser();
      for (const m of media) {
        if (!wanted.size) break;
        try {
          const res = yield fetch(m.source_url);
          if (!res.ok) continue;
          const doc = parser.parseFromString(yield res.text(), "image/svg+xml");
          const sig = svgSignature(doc);
          const targets = wanted.get(sig);
          if (!targets) continue;
          targets.forEach((svg) => {
            const img = document.createElement("img");
            img.src = m.source_url;
            img.alt = "";
            svg.replaceWith(img);
          });
          wanted.delete(sig);
        } catch (e) {
        }
      }
      if (wanted.size) console.warn(`Icons: ${wanted.size} inline carousel icon(s) without an uploaded match`);
    });
  }
  function headingTheme(document) {
    const heading = document.querySelector(".elementor-widget-theme-post-content .elementor-widget-heading h2");
    if (!heading || !document.defaultView) return null;
    const color = document.defaultView.getComputedStyle(heading).color.replace(/\s/g, "");
    return color === "rgb(144,15,21)" ? "burgundy" : null;
  }
  var import_article_rich_default = {
    /** Runs on the live page (awaited) before the DOM is copied. */
    onLoad: (_0) => __async(void 0, [_0], function* ({ document }) {
      yield resolveInlineIcons(document);
    }),
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      const source = new URL(params.originalURL);
      const basePath = source.pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const theme = headingTheme(document);
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
      main.appendChild(document.createElement("hr"));
      const meta = WebImporter.Blocks.getMetadata(document) || {};
      meta.template = `article, ${PAGE_TEMPLATE.name}`;
      if (theme) meta.theme = theme;
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
  return __toCommonJS(import_article_rich_exports);
})();
