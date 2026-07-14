// ---------------------------------------------------------------------------
// Claude Studio (static edition) service worker.
// Caches the app shell (relative paths, so it works under a GitHub Pages
// subpath) for instant, offline-capable startup. Cross-origin requests — the
// Monaco/JSCPP CDNs and the Anthropic API — always go to the network.
// ---------------------------------------------------------------------------

const CACHE = 'claude-studio-web-v1';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './vendor/JSCPP.min.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
];

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
  // Only manage same-origin GETs; let cross-origin (CDN, Anthropic API) pass through.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((res) => { if (res && res.status === 200 && res.type === 'basic') cache.put(request, res.clone()); return res; })
        .catch(() => cached || cache.match('./index.html'));
      return cached || network;
    })
  );
});
