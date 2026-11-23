// Offline support: the app shell and CodeMirror are cached on install.
// Running code always needs the network (requests to wandbox.org are POSTs
// and pass straight through).
const CACHE = 'cpp-academy-v2';
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './curriculum.js',
  './manifest.json',
  './icon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  CDN + 'codemirror.min.css',
  CDN + 'codemirror.min.js',
  CDN + 'mode/clike/clike.min.js',
  CDN + 'addon/edit/matchbrackets.min.js'
];

self.addEventListener('install', (e) => {
  // Cache files one by one so a single failure doesn't leave the cache empty.
  e.waitUntil(caches.open(CACHE).then((cache) => Promise.all(ASSETS.map((url) => cache.add(url).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // CDN files are versioned in the URL, so the cached copy is always right.
  if (req.url.startsWith(CDN)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
      return res;
    })));
    return;
  }

  // Own files: network first so updates show up right away, cache when offline.
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
    );
  }
});
