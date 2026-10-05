/**
 * Embed (Video): YouTube / Vimeo embed from a single link cell.
 * The iframe is created only when the block nears the viewport.
 * @param {Element} block
 */

function getYouTubeId(url) {
  const host = url.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') return url.pathname.split('/')[1] || null;
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    if (url.searchParams.get('v')) return url.searchParams.get('v');
    const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
    return match ? match[1] : null;
  }
  return null;
}

function getVimeoId(url) {
  if (!url.hostname.endsWith('vimeo.com')) return null;
  const match = url.pathname.match(/(\d+)/);
  return match ? match[1] : null;
}

function buildEmbedSrc(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  const yt = getYouTubeId(url);
  if (yt) {
    const params = new URLSearchParams({ rel: '0' });
    const start = url.searchParams.get('t') || url.searchParams.get('start');
    if (start) params.set('start', parseInt(start, 10) || 0);
    return { src: `https://www.youtube.com/embed/${encodeURIComponent(yt)}?${params}`, provider: 'youtube' };
  }
  const vimeo = getVimeoId(url);
  if (vimeo) {
    return { src: `https://player.vimeo.com/video/${vimeo}`, provider: 'vimeo' };
  }
  return null;
}

export default function decorate(block) {
  const link = block.querySelector('a[href]');
  const raw = link ? link.href : block.textContent.trim();
  const embed = raw ? buildEmbedSrc(raw) : null;

  if (!embed) {
    // Unsupported or missing URL: leave the authored content (a plain link) in place.
    block.classList.add('embed-video-unsupported');
    return;
  }

  const title = (link && link.title) || (link && link.textContent.trim() !== raw && link.textContent.trim()) || 'Embedded video';

  const frame = document.createElement('div');
  frame.className = 'embed-video-frame';
  block.classList.add(`embed-video-${embed.provider}`);
  block.replaceChildren(frame);

  const load = () => {
    if (frame.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = embed.src;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
    iframe.setAttribute('allowfullscreen', '');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.append(iframe);
  };

  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '200px' });
  observer.observe(block);
}
