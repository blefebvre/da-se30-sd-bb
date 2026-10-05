import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

const VIDEO_FILE = /\.(mp4|webm|ogg)(\?|#|$)/i;

/**
 * Returns the first authored link that points at a background video source.
 * @param {Element} block
 * @returns {HTMLAnchorElement|null}
 */
function findVideoLink(block) {
  return [...block.querySelectorAll('a[href]')].find((a) => {
    const href = a.getAttribute('href') || '';
    return /vimeo\.com|youtube\.com|youtu\.be/i.test(href) || VIDEO_FILE.test(href);
  }) || null;
}

/**
 * Builds a muted, looping, chrome-less background video element for the given URL.
 * @param {string} href
 * @returns {Element|null}
 */
function buildBackgroundVideo(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }

  if (VIDEO_FILE.test(url.pathname)) {
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    const source = document.createElement('source');
    source.src = url.href;
    video.append(source);
    return video;
  }

  let src;
  if (/vimeo\.com/i.test(url.hostname)) {
    const id = url.pathname.split('/').filter(Boolean).pop();
    if (!id) return null;
    src = `https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&muted=1`;
  } else {
    const id = url.hostname.includes('youtu.be')
      ? url.pathname.slice(1)
      : url.searchParams.get('v') || url.pathname.split('/').pop();
    if (!id) return null;
    src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&playlist=${id}`;
  }

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = 'Background video';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
  iframe.setAttribute('frameborder', '0');
  // mid-page banner: defer the player until it nears the viewport
  iframe.loading = 'lazy';
  return iframe;
}

/**
 * Removes the element and any ancestors (inside the block) left empty by its removal.
 * @param {Element} el
 * @param {Element} block
 */
function removeAndPrune(el, block) {
  let parent = el.parentElement;
  el.remove();
  while (parent && parent !== block && !parent.textContent.trim() && !parent.querySelector('picture, img, video, iframe')) {
    const next = parent.parentElement;
    parent.remove();
    parent = next;
  }
}

export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const media = document.createElement('div');
  media.className = 'hero-statement-media';

  // Optional poster / fallback image (any authored picture).
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : picture;
    media.append(optimized);
    removeAndPrune(picture, block);
  }

  const link = findVideoLink(block);
  if (link) {
    const video = buildBackgroundVideo(link.href);
    if (video) {
      media.append(video);
      block.classList.add('has-video');
    }
    removeAndPrune(link.closest('p') || link, block);
  }

  const content = document.createElement('div');
  content.className = 'hero-statement-content';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  if (!media.children.length) block.classList.add('no-media');

  block.replaceChildren(media, content);
}
