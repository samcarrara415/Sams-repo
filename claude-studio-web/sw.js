// ---------------------------------------------------------------------------
// Claude Studio (static edition) service worker.
//
// Strategy:
//   * Code (navigations, index.html, app.js, styles.css): NETWORK-FIRST, so a
//     new deploy shows up immediately when online; falls back to cache offline.
//   * Other assets (icons, manifest, the JSCPP bundle): cache-first with a
//     background refresh — they're big and rarely change.
//   * Cross-origin (Monaco CDN, the Anthropic API) always passes through.
//
// Bump CACHE_VERSION whenever the shell changes to evict old caches.
// ---------------------------------------------------------------------------

const CACHE_VERSION = 'v8';
const CACHE = 'claude-studio-web-' + CACHE_VERSION;

const SHELL = [
  './', './index.html', './styles.css', './app.js',
  './manifest.webmanifest',
  './icon.svg', './icon-192.png', './icon-512.png', './icon-180.png',
];

// Files that contain code — always try the network first.
const CODE = /\/(index\.html|app\.js|styles\.css)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isCode = request.mode === 'navigate' || CODE.test(url.pathname);

  if (isCode) {
    // Network-first: fresh code when online, cached copy when offline.
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first with background revalidate for static assets.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((res) => { if (res && res.status === 200 && res.type === 'basic') cache.put(request, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
