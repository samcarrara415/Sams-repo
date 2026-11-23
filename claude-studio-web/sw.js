// Service worker for the mcode app shell.
//
// HTML, JS and CSS are network-first so a new deploy shows up on the next
// load; the cached copy is used offline. Icons and the manifest are
// cache-first. Cross-origin requests (Monaco from the CDN, Wandbox) are not
// handled here. Bump VERSION when the shell file list changes.

const VERSION = 'v13';
const PREFIX = 'mcode-';
const CACHE = PREFIX + VERSION;
// Caches this app created under its old name.
const LEGACY_PREFIX = 'claude-studio-web-';

const SHELL = [
  './', './index.html', './styles.css', './app.js',
  './manifest.webmanifest',
  './icon.svg', './icon-192.png', './icon-512.png', './icon-180.png',
];

const CODE = /\/(index\.html|app\.js|styles\.css)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  // Other apps are served from the same origin (github.io), so only delete
  // caches that belong to this one.
  const ours = (k) => k !== CACHE && (k.startsWith(PREFIX) || k.startsWith(LEGACY_PREFIX));
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter(ours).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' || CODE.test(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(request, { ignoreSearch: true })
          .then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((res) => { if (res.ok) cache.put(request, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
