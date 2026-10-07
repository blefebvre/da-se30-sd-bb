import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [
  'boxed', 'elevated', 'overlap', 'posts', 'product', 'icon-left',
  'links', 'icons', 'carousel', 'circle', 'steps',
  'accent', 'divided', 'highlight', 'gradient',
  'featured', 'list', 'text', 'slides', 'autoplay',
];

/** `slides` + `autoplay`: delay between slides, as on the source carousel. */
const AUTOPLAY_DELAY = 5000;

/** `paged-<n>` option: show n items per page with numbered page buttons. */
const PAGED_OPTION = /^paged-(\d+)$/;

/** Post byline ("By Admin"). */
const BYLINE = /^by\s+\S/i;

/** Options whose single link should make the whole tile clickable. */
const STRETCH_LINK_OPTIONS = ['links', 'posts'];

/**
 * True when the element holds picture(s) and no text.
 * @param {Element} el
 */
function isImageOnly(el) {
  return !!el.querySelector('picture') && !el.textContent.trim();
}

/**
 * True when the paragraph holds a single text link and nothing else.
 * @param {Element} p
 */
function isLinkOnly(p) {
  const links = p.querySelectorAll('a[href]');
  return links.length === 1 && !!links[0].textContent.trim()
    && p.textContent.trim() === links[0].textContent.trim();
}

/**
 * Builds one card <li> from an authored row: image cell(s) + body cell(s), any order.
 * A leading image-only paragraph inside a mixed cell is lifted into the image slot.
 * @param {Element} row
 * @param {string[]} active
 * @returns {HTMLLIElement|null}
 */
function buildItem(row, active) {
  const cells = [...row.children].filter((c) => c.innerHTML.trim());
  if (!cells.length) return null;

  const li = document.createElement('li');
  li.className = 'cards-feature-item';
  const image = document.createElement('div');
  image.className = 'cards-feature-image';
  const body = document.createElement('div');
  body.className = 'cards-feature-body';

  cells.forEach((cell) => {
    if (isImageOnly(cell)) {
      while (cell.firstChild) image.append(cell.firstChild);
      return;
    }
    // mixed cell: lift a leading picture (or image-only paragraph) into the image slot
    const first = cell.firstElementChild;
    if (!image.childNodes.length && first
      && (first.tagName === 'PICTURE' || (first.tagName === 'P' && isImageOnly(first)))) {
      image.append(first);
    }
    while (cell.firstChild) body.append(cell.firstChild);
  });

  // drop whitespace-only text nodes / empty paragraphs
  [image, body].forEach((slot) => {
    [...slot.childNodes].forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && !n.textContent.trim()) n.remove();
      else if (n.nodeType === Node.ELEMENT_NODE && n.tagName === 'P'
        && !n.textContent.trim() && !n.querySelector('picture, img')) n.remove();
    });
  });

  image.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
  });

  if (image.childNodes.length) li.append(image);
  else li.classList.add('no-image');
  if (body.childNodes.length) li.append(body);

  // "Coming soon" style badge: a paragraph holding only emphasised text
  body.querySelectorAll(':scope > p').forEach((p) => {
    const em = p.querySelector(':scope > em');
    if (em && p.childElementCount === 1 && p.textContent.trim() === em.textContent.trim()) {
      p.classList.add('cards-feature-badge');
      li.classList.add('has-badge');
    }
  });

  // posts: date / category badge before the title share a meta row; "By <author>" byline
  if (active.includes('posts')) {
    const heading = body.querySelector(':scope > :is(h2, h3, h4)');
    const lead = heading ? [...body.children].slice(0, [...body.children].indexOf(heading))
      .filter((el) => el.tagName === 'P') : [];
    if (lead.length) {
      const meta = document.createElement('div');
      meta.className = 'cards-feature-meta';
      lead[0].before(meta);
      meta.append(...lead);
    }
    const last = body.lastElementChild;
    if (heading && last && last !== heading && last.tagName === 'P'
      && !last.querySelector('a') && BYLINE.test(last.textContent.trim())) {
      last.classList.add('cards-feature-byline');
    }
  }

  // last link-only paragraph is the item CTA
  const cta = [...body.querySelectorAll(':scope > p')].reverse().find(isLinkOnly);
  if (cta) cta.classList.add('cards-feature-cta');

  // whole-tile link (FAQ link tiles, post cards) when the item carries exactly one link
  if (active.some((o) => STRETCH_LINK_OPTIONS.includes(o))) {
    const links = li.querySelectorAll('a[href]');
    if (links.length === 1) links[0].classList.add('cards-feature-stretched');
  }

  return li;
}

/**
 * Wraps the list in a scroll viewport with prev/next buttons.
 * @param {Element} block
 * @param {HTMLUListElement} ul
 */
function buildCarousel(block, ul) {
  const viewport = document.createElement('div');
  viewport.className = 'cards-feature-viewport';
  viewport.append(ul);

  const nav = document.createElement('div');
  nav.className = 'cards-feature-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-feature-prev';
  prev.setAttribute('aria-label', 'Previous');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-feature-next';
  next.setAttribute('aria-label', 'Next');
  nav.append(prev, next);

  const step = () => {
    const item = ul.querySelector('li');
    if (!item) return ul.clientWidth;
    const gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
    return item.getBoundingClientRect().width + gap;
  };
  const update = () => {
    const max = ul.scrollWidth - ul.clientWidth - 1;
    prev.disabled = ul.scrollLeft <= 0;
    next.disabled = ul.scrollLeft >= max;
    nav.hidden = max <= 0;
  };
  prev.addEventListener('click', () => ul.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => ul.scrollBy({ left: step(), behavior: 'smooth' }));
  ul.addEventListener('scroll', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(ul);

  block.replaceChildren(viewport, nav);
  update();
}

/**
 * `carousel slides`: one full-width slide at a time. Each slide shows a row of position
 * bars under its image (its own bar highlighted; click to jump), prev/next arrows sit
 * centred below, the viewport takes the active slide's height, and the last slide
 * wraps to the first. `autoplay` advances every 5s, pausing on hover/focus and when
 * the user prefers reduced motion.
 * @param {Element} block
 * @param {HTMLUListElement} ul
 * @param {string[]} active option classes
 */
function buildSlides(block, ul, active) {
  const slides = [...ul.children];
  const viewport = document.createElement('div');
  viewport.className = 'cards-feature-viewport';
  viewport.append(ul);
  let index = 0;

  const go = (to) => {
    index = (to + slides.length) % slides.length;
    ul.style.transform = `translateX(${-100 * index}%)`;
    viewport.style.height = `${slides[index].offsetHeight}px`;
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      slide.inert = i !== index;
    });
  };

  slides.forEach((slide, i) => {
    // intro row: heading beside its description (paragraphs up to the next heading/list)
    const body = slide.querySelector('.cards-feature-body');
    const heading = body && body.querySelector(':scope > :is(h2, h3)');
    if (heading) {
      const desc = [];
      let el = heading.nextElementSibling;
      while (el && el.tagName === 'P') {
        desc.push(el);
        el = el.nextElementSibling;
      }
      const intro = document.createElement('div');
      intro.className = 'cards-feature-intro';
      const text = document.createElement('div');
      text.className = 'cards-feature-desc';
      heading.before(intro);
      text.append(...desc);
      intro.append(heading, text);
    }

    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    const bars = document.createElement('div');
    bars.className = 'cards-feature-bars';
    slides.forEach((target, j) => {
      const bar = document.createElement('button');
      bar.type = 'button';
      bar.className = 'cards-feature-bar';
      const label = target.querySelector('h2, h3, h4');
      bar.setAttribute('aria-label', label ? label.textContent.trim() : `Slide ${j + 1}`);
      if (j === i) bar.setAttribute('aria-current', 'true');
      bar.addEventListener('click', () => go(j));
      bars.append(bar);
    });
    const image = slide.querySelector('.cards-feature-image');
    if (image) image.after(bars);
    else slide.prepend(bars);
  });

  const nav = document.createElement('div');
  nav.className = 'cards-feature-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'cards-feature-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'cards-feature-next';
  next.setAttribute('aria-label', 'Next slide');
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  nav.append(prev, next);

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.replaceChildren(viewport, nav);
  go(0);
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => go(index));
    slides.forEach((slide) => observer.observe(slide));
  }
  window.addEventListener('resize', () => go(index));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!active.includes('autoplay') || reduced || slides.length < 2) return;
  let timer;
  const stop = () => clearInterval(timer);
  const start = () => {
    stop();
    timer = setInterval(() => go(index + 1), AUTOPLAY_DELAY);
  };
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', (e) => { if (!block.contains(e.relatedTarget)) start(); });
  start();
}

/**
 * Client-side pagination: `size` items per page, numbered page buttons below the list.
 * @param {Element} block
 * @param {HTMLUListElement} ul
 * @param {number} size
 */
function buildPagination(block, ul, size) {
  const items = [...ul.children];
  const pages = Math.ceil(items.length / size);
  if (pages < 2) return;

  const nav = document.createElement('nav');
  nav.className = 'cards-feature-pagination';
  nav.setAttribute('aria-label', 'Pagination');
  const buttons = [];

  const show = (page, focus) => {
    items.forEach((item, i) => {
      item.hidden = Math.floor(i / size) !== page;
    });
    buttons.forEach((btn, i) => {
      if (i === page) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
    if (focus) {
      if (block.getBoundingClientRect().top < 0) block.scrollIntoView({ behavior: 'smooth' });
      buttons[page].focus({ preventScroll: true });
    }
  };

  for (let i = 0; i < pages; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cards-feature-page';
    btn.textContent = `${i + 1}`;
    btn.setAttribute('aria-label', `Page ${i + 1}`);
    btn.addEventListener('click', () => show(i, true));
    buttons.push(btn);
  }
  nav.append(...buttons);
  block.append(nav);
  show(0, false);
}

/**
 * Cards (Feature): repeated feature items.
 * Content model: one row per item, [icon/image | heading + text / list / link];
 * the image cell and the heading are optional.
 * @param {Element} block
 */
export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  ul.className = 'cards-feature-list';
  [...block.children].forEach((row) => {
    const li = buildItem(row, active);
    if (li) ul.append(li);
  });

  if (active.includes('carousel') && active.includes('slides')) {
    buildSlides(block, ul, active);
    return;
  }
  if (active.includes('carousel')) {
    buildCarousel(block, ul);
    return;
  }
  block.replaceChildren(ul);

  const paged = [...block.classList].map((c) => c.match(PAGED_OPTION)).find(Boolean);
  const size = paged ? parseInt(paged[1], 10) : 0;
  if (size > 0) buildPagination(block, ul, size);
}
