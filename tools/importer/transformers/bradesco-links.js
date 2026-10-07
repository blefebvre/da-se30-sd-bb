/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: rewrite links to bradescobank.com pages as site-relative paths so
 * they point at the migrated pages instead of the source site.
 *
 *   https://bradescobank.com/en/private-bank/  -> /en/private-bank
 *   https://bradescobank.com/en/               -> /   (source homepage = migrated index)
 *   https://bradescobank.com/help/             -> /en/help   (source redirect, resolved)
 *
 * Kept absolute (not migrated / not pages): /wp-content/ and /assets/ files (PDFs,
 * videos), /wp-admin/, /wp-json/, feeds, and the /pt/ + /es/ locales (not migrated
 * yet). Query strings and #hashes are preserved.
 * Runs in afterTransform, LAST in each import's transformer list.
 */
const SOURCE_HOSTS = ['bradescobank.com', 'www.bradescobank.com'];

// Legacy paths that 301 on the source; mapped straight to the final page.
const REDIRECTS = {
  '/privacy-and-security.html': '/en/privacy-and-cookies',
  '/opt-out-form.html': '/en/opt-out-form',
  '/real-estate': '/en/real-estate',
  '/help': '/en/help',
  '/en/signature-gold': '/en/credit-card-signature-gold',
  '/en/investments': '/en/personal-bank/investments',
  '/certificate-of-deposit-bradesco': '/en/certificate-of-deposit-bradesco',
  '/en/credit-card': '/en/credit-cards',
  '/apex-fee-schedule': 'https://bradescobank.com/wp-content/uploads/2026/01/APEX-Fee-Schedule-01.2026.pdf',
};

const KEEP_ABSOLUTE = /^\/(assets|wp-content|wp-admin|wp-includes|wp-json|feed)(\/|$)/;

function toSitePath(href) {
  if (!href) return null;
  let url;
  try {
    url = new URL(href, 'https://bradescobank.com/');
  } catch (e) {
    return null;
  }
  if (!SOURCE_HOSTS.includes(url.hostname)) return null;
  if (!/^https?:$/.test(url.protocol)) return null;
  if (KEEP_ABSOLUTE.test(url.pathname)) return null;

  let path = url.pathname.replace(/\/+$/, '') || '/';
  if (REDIRECTS[path]) path = REDIRECTS[path];
  if (/^https?:/.test(path)) return path;
  if (path === '/en' || path === '/index') path = '/';
  if (/^\/(pt|es)(\/|$)/.test(path)) return null;
  return `${path}${url.search}${url.hash}`;
}

// eslint-disable-next-line no-unused-vars
export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  element.querySelectorAll('a[href]').forEach((a) => {
    const raw = a.getAttribute('href');
    // leave in-page anchors, mailto:, tel:, javascript: alone
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return;
    const path = toSitePath(raw);
    if (path) a.setAttribute('href', path);
  });
}
