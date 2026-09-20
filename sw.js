const CACHE_NAME = 'quotalab-v1343-fresh-assets';
const STATIC_SHELL = [
  './manifest.webmanifest',
  './manifest.json',
  './apple-touch-icon.png',
  './favicon.ico',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_SHELL).catch(() => undefined)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('quotalab-') && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const dest = event.request.destination;
  const isFreshAsset = sameOrigin && (
    event.request.mode === 'navigate' ||
    dest === 'document' ||
    dest === 'script' ||
    dest === 'style' ||
    /(?:index\.html|install\.js|dashboard-refino-.*\.js|mobile-v.*\.css)$/i.test(url.pathname)
  );

  if (isFreshAsset) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(response => response)
        .catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => undefined);
      return response;
    }))
  );
});
