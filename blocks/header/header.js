// desktop layout starts where the source header switches to its desktop row
const isDesktop = window.matchMedia('(width >= 1000px)');

const CHEVRON_SVG = '<svg viewBox="0 0 15 15" aria-hidden="true" focusable="false"><path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"></path></svg>';

/**
 * Fetches the nav fragment (metadata independent):
 * /content/nav.plain.html locally, /nav.plain.html on DA/EDS.
 * @returns {Promise<Element[]|null>} top-level section divs
 */
async function fetchNavSections() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  // resolve relative media against the fragment location, not the page
  doc.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  doc.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = new URL(source.getAttribute('srcset'), resp.url).href;
  });
  return [...doc.body.children].filter((el) => el.tagName === 'DIV');
}

/**
 * Classifies a nav section by its content so authors can reorder/omit sections.
 * @param {Element} section
 * @returns {string} top | brand | sections | tools
 */
function classifySection(section) {
  const list = section.querySelector('ul');
  if (list) {
    const items = [...list.children];
    const imageOnly = items.length && items.every((li) => li.querySelector('img') && !li.textContent.trim());
    return imageOnly ? 'tools' : 'sections';
  }
  if (section.querySelector('a img, a picture')) return 'brand';
  return 'top';
}

function createEl(tag, className, attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function isExternal(href) {
  try {
    const url = new URL(href, window.location.href);
    return url.origin !== window.location.origin && !/bradescobank\.com$/.test(url.hostname);
  } catch (e) {
    return false;
  }
}

/**
 * Closes every open dropdown inside the menu
 * @param {Element} menu
 * @param {Element} [except] item to keep open
 */
function closeAll(menu, except) {
  menu.querySelectorAll(':scope > .nav-item.is-open').forEach((item) => {
    if (item === except) return;
    item.classList.remove('is-open');
    item.querySelector(':scope > .nav-trigger').setAttribute('aria-expanded', 'false');
  });
}

/**
 * Builds the primary menu (<nav><ul>) from the authored nested list
 * @param {Element} section authored section containing the nested list
 * @returns {Element} nav element
 */
function buildMenu(section) {
  const nav = createEl('nav', 'nav-menu-container', { id: 'nav', 'aria-label': 'Main' });
  const menu = createEl('ul', 'nav-menu');
  const source = section.querySelector('ul');
  if (!source) return nav;

  [...source.children].forEach((srcItem, idx) => {
    const item = createEl('li', 'nav-item');
    const subList = srcItem.querySelector(':scope > ul');
    if (subList) {
      // label is whatever the author wrote before the sub list
      const labelNode = srcItem.querySelector(':scope > p') || srcItem.firstChild;
      const isCta = !!srcItem.querySelector(':scope > p strong, :scope > strong');
      const label = (labelNode ? labelNode.textContent : '').trim();
      const subId = `nav-sub-${idx}`;
      item.classList.add('has-submenu');
      if (isCta) item.classList.add('nav-cta');
      // link-styled toggle (mirrors the source markup), exposed as a button
      const trigger = createEl('a', 'nav-trigger', {
        href: '#', role: 'button', 'aria-expanded': 'false', 'aria-controls': subId,
      });
      trigger.append(label);
      const chevron = createEl('span', 'nav-chevron');
      chevron.innerHTML = CHEVRON_SVG;
      trigger.append(chevron);

      const sub = createEl('ul', 'nav-submenu', { id: subId });
      [...subList.children].forEach((srcSub) => {
        const link = srcSub.querySelector('a');
        if (!link) return;
        const li = createEl('li');
        const a = createEl('a', 'nav-sublink', { href: link.getAttribute('href') });
        a.textContent = link.textContent.trim();
        if (isExternal(a.href)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        li.append(a);
        sub.append(li);
      });

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const open = !item.classList.contains('is-open');
        closeAll(menu, item);
        item.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
      item.append(trigger, sub);
    } else {
      const link = srcItem.querySelector('a');
      if (!link) return;
      const a = createEl('a', 'nav-link', { href: link.getAttribute('href') });
      a.textContent = link.textContent.trim();
      item.append(a);
    }
    menu.append(item);
  });

  nav.append(menu);
  return nav;
}

/**
 * Builds the inline language switcher from an authored list of flag images
 * @param {Element} section
 * @returns {Element} li element appended to the menu
 */
function buildLanguages(section) {
  const item = createEl('li', 'nav-item nav-lang');
  const list = createEl('ul', 'nav-lang-list');
  section.querySelectorAll(':scope ul > li').forEach((srcItem) => {
    const li = createEl('li', 'nav-lang-option');
    const img = srcItem.querySelector('img');
    if (!img) return;
    const flag = createEl('img', '', {
      src: img.src, alt: img.alt, width: 21, height: 16,
    });
    const link = srcItem.querySelector('a');
    if (link) {
      const a = createEl('a', '', { href: link.getAttribute('href') });
      a.append(flag);
      li.append(a);
    } else {
      // an unlinked flag marks the current language
      li.classList.add('is-active');
      li.setAttribute('aria-current', 'true');
      li.append(flag);
    }
    list.append(li);
  });
  item.append(list);
  return item;
}

/**
 * Builds the brand (logo) link. First image = default (over hero), second = solid header.
 * @param {Element} section
 */
function buildBrand(section) {
  const brand = createEl('div', 'nav-brand');
  const link = section.querySelector('a');
  const a = createEl('a', 'nav-brand-link', { href: link ? link.getAttribute('href') : '/' });
  const imgs = [...section.querySelectorAll('img')];
  imgs.forEach((img, i) => {
    const logo = createEl('img', i === 0 ? 'logo-default' : 'logo-alt', {
      src: img.src, alt: img.alt, width: 140, height: 50,
    });
    logo.loading = 'eager';
    a.append(logo);
  });
  if (!imgs.length && link) a.textContent = link.textContent;
  brand.append(a);
  return brand;
}

/**
 * Builds the top utility bar (FDIC notice). First image = desktop, second = mobile.
 * @param {Element} section
 */
function buildTopBar(section) {
  const bar = createEl('div', 'nav-top');
  const inner = createEl('div', 'nav-top-inner');
  [...section.querySelectorAll('img')].forEach((img, i) => {
    inner.append(createEl('img', i === 0 ? 'nav-top-desktop' : 'nav-top-mobile', { src: img.src, alt: img.alt }));
  });
  bar.append(inner);
  return bar;
}

/**
 * True when the page starts with a hero block the header can overlay
 */
function startsWithHero() {
  const first = document.querySelector('main > .section:first-child, main > div:first-child');
  if (!first) return false;
  const block = first.querySelector('[class*="-wrapper"] > .block, .block');
  return !!block && /(^|\s)hero/.test(block.className);
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const sections = await fetchNavSections();
  block.textContent = '';
  if (!sections) return;

  const roles = {};
  sections.forEach((s) => {
    const role = classifySection(s);
    if (!roles[role]) roles[role] = s;
  });

  const wrapper = createEl('div', 'nav-wrapper');
  const transparent = startsWithHero();
  wrapper.classList.add(transparent ? 'is-transparent' : 'is-solid');

  if (roles.top) wrapper.append(buildTopBar(roles.top));

  const main = createEl('div', 'nav-main');
  const inner = createEl('div', 'nav-main-inner');
  if (roles.brand) inner.append(buildBrand(roles.brand));

  const nav = buildMenu(roles.sections || createEl('div'));
  const menu = nav.querySelector('.nav-menu');
  if (roles.tools && menu) menu.append(buildLanguages(roles.tools));
  inner.append(nav);

  // basic mobile toggle (full mobile behaviour is implemented in the mobile phase)
  const hamburger = createEl('button', 'nav-hamburger', {
    type: 'button', 'aria-controls': 'nav', 'aria-expanded': 'false', 'aria-label': 'Open navigation',
  });
  hamburger.innerHTML = '<span class="nav-hamburger-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
  hamburger.addEventListener('click', () => {
    const open = wrapper.classList.toggle('menu-open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.style.overflowY = open ? 'hidden' : '';
  });
  inner.append(hamburger);
  main.append(inner);
  wrapper.append(main);
  block.append(wrapper);

  // close dropdowns on outside click / Escape (source behaviour)
  document.addEventListener('click', (e) => {
    if (menu && !e.target.closest('.nav-item.has-submenu')) closeAll(menu);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !menu) return;
    const open = menu.querySelector(':scope > .nav-item.is-open > .nav-trigger');
    closeAll(menu);
    if (open) open.focus();
  });

  // sticky main row once the top bar has scrolled away
  const onScroll = () => {
    const top = wrapper.querySelector('.nav-top');
    const threshold = top ? top.offsetHeight : 0;
    wrapper.classList.toggle('is-sticky', window.scrollY > 0 && window.scrollY >= threshold);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    if (menu) closeAll(menu);
    wrapper.classList.remove('menu-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflowY = '';
  });
}
