// ---------------------------------------------------------------------------
// Claude Studio service worker
//
// Makes the app installable and instant/offline-capable by caching the static
// app shell. Dynamic endpoints — auth, projects, AI chat (SSE), C++ run, and
// live previews — are never cached: those requests always hit the network.
// ---------------------------------------------------------------------------

const CACHE = 'claude-studio-shell-v1';
const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
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

  // Only manage same-origin GETs. Everything else (POSTs, the AI SSE stream,
  // cross-origin CDN requests) passes straight through to the network.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never intercept dynamic app data or user previews.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/preview/')) return;

  // Stale-while-revalidate for the shell: serve cache instantly, refresh in bg.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached || cache.match('/index.html'));
      return cached || network;
    })
  );
});
