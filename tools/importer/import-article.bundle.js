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

  // tools/importer/import-article.js
  var import_article_exports = {};
  __export(import_article_exports, {
    default: () => import_article_default
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
    const text = EL.norm(cell.textContent);
    const icon = cell.querySelector('svg, .check-icon, img[src*="check" i], img[alt*="check" i], .icon-check');
    if (!text && icon || /^(✓|✔|✔️|:check:)$/u.test(text)) return CHECK;
    if (!text) return "";
    const div = EL.make(document, "div", cell.innerHTML);
    EL.clean(div);
    div.querySelectorAll("*").forEach((n) => {
      if (!n.childNodes.length && !/^(BR|IMG)$/.test(n.tagName)) n.remove();
    });
    [...div.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.textContent = n.textContent.replace(/\s+/g, " ");
    });
    const blocks = div.querySelectorAll("p, ul, ol");
    if (!blocks.length) return EL.norm(div.innerHTML) === EL.norm(div.textContent) ? text : [...div.childNodes];
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
    const headerCells = [...element.querySelectorAll(".card-tabs-header > *")].map((n) => EL.norm(n.textContent));
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
      if (!cells.length || cells.every((c) => !EL.norm(c.textContent) && !c.querySelector("svg, img"))) return;
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
  function parseLanding(element, { document, options }) {
    const rows = landingRows(document, element);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const colCount = Math.max(...rows.map((r) => r.length));
    rows.forEach((r) => {
      while (r.length < colCount) r.push("");
    });
    const block = WebImporter.Blocks.createBlock(document, { name: EL.blockName("table-article", options), cells: rows });
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
  function parse2(element, { document, options, basePath } = {}) {
    if (element.closest(EL.LEGACY_ROOTS)) {
      parseLegacy(element, { document });
      return;
    }
    parseLanding(element, { document, options: options || [], basePath: basePath || "" });
  }

  // tools/importer/parsers/embed-video.js
  function canonicalUrl(raw) {
    if (!raw) return null;
    let url;
    try {
      url = new URL(raw, "https://www.youtube.com");
    } catch (e) {
      return null;
    }
    const host = url.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/")[1];
      return id ? `https://www.youtube.com/watch?v=${id}` : null;
    }
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) {
      const id = url.searchParams.get("v") || (url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/) || [])[1];
      return id && id !== "videoseries" ? `https://www.youtube.com/watch?v=${id}` : null;
    }
    if (/(^|\.)vimeo\.com$/.test(host)) {
      const id = (url.pathname.match(/(\d{5,})/) || [])[1];
      return id ? `https://vimeo.com/${id}` : null;
    }
    return null;
  }
  function parse3(element, { document }) {
    const iframe = element.tagName === "IFRAME" ? element : element.querySelector("iframe");
    const raw = iframe && (iframe.getAttribute("src") || iframe.getAttribute("data-src") || iframe.getAttribute("data-lazy-src"));
    const href = canonicalUrl(raw);
    if (!href) {
      element.remove();
      return;
    }
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    const cells = [[a]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-video", cells });
    const p = element.parentElement;
    const onlyChild = p && p.tagName === "P" && !p.textContent.replace(/\u00a0/g, " ").trim() && [...p.children].every((c) => c === element || c.tagName === "BR");
    if (onlyChild) {
      p.replaceWith(block);
    } else {
      element.replaceWith(block);
    }
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
  function transform2(hookName, element, payload) {
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

  // tools/importer/import-article.js
  var parsers = {
    "hero-article": parse,
    "table-article": parse2,
    "embed-video": parse3
  };
  var PAGE_TEMPLATE = {
    name: "article",
    description: "Blog/insight article (single post, theme post content)",
    urls: [
      "https://bradescobank.com/en/financial-habits/",
      "https://bradescobank.com/en/gold-as-a-portfolio-diversifier/",
      "https://bradescobank.com/en/how-to-buy-assets/",
      "https://bradescobank.com/en/how-to-sell-assets/",
      "https://bradescobank.com/en/investments-at-bradesco-bank/",
      "https://bradescobank.com/en/mutual-funds/",
      "https://bradescobank.com/en/open-an-investment-account/",
      "https://bradescobank.com/en/portfolio-considerations-the-role-of-staying-invested/",
      "https://bradescobank.com/en/reits/",
      "https://bradescobank.com/en/thematic-etfs/",
      "https://bradescobank.com/en/u-s-stocks/",
      "https://bradescobank.com/en/what-are-asset-allocation-and-diversification/",
      "https://bradescobank.com/en/why-invest-abroad/"
    ],
    blocks: [
      { name: "hero-article", instances: [".elementor-location-single > .elementor-element-b710887"] },
      { name: "table-article", instances: [".elementor-widget-theme-post-content table"] },
      {
        name: "embed-video",
        instances: [
          '.elementor-widget-theme-post-content iframe[src*="youtube.com"]',
          '.elementor-widget-theme-post-content iframe[src*="youtu.be"]',
          '.elementor-widget-theme-post-content iframe[src*="vimeo.com"]'
        ]
      }
    ],
    sections: [
      { id: "1", name: "post-title-banner", selector: [".elementor-location-single > .elementor-element-b710887"], style: null, blocks: ["hero-article"], defaultContent: [] },
      { id: "2", name: "decorative-gradient-line", selector: [".elementor-location-single > .elementor-element-df751d4"], style: null, blocks: [], defaultContent: [] },
      { id: "3", name: "blog-sub-menu", selector: [".elementor-location-single > .bb-blog-menu"], style: null, blocks: [], defaultContent: [] },
      {
        id: "4",
        name: "article-body",
        selector: [".elementor-location-single > .elementor-element-0fa6826"],
        style: null,
        blocks: ["table-article", "embed-video"],
        defaultContent: [
          ".elementor-element-235adcb .elementor-shortcode",
          ".elementor-widget-theme-post-content h1",
          ".elementor-widget-theme-post-content h2",
          ".elementor-widget-theme-post-content h3",
          ".elementor-widget-theme-post-content h4",
          ".elementor-widget-theme-post-content h5",
          ".elementor-widget-theme-post-content h6",
          ".elementor-widget-theme-post-content p",
          ".elementor-widget-theme-post-content ul",
          ".elementor-widget-theme-post-content ol"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_article_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      const meta = WebImporter.Blocks.getMetadata(document) || {};
      meta.template = PAGE_TEMPLATE.name;
      main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
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
  return __toCommonJS(import_article_exports);
})();
