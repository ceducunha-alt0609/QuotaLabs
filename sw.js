/* QuotaLab PWA Service Worker */
const CACHE_NAME = 'quotalab-pwa-v69-22';
const APP_SHELL = [
  "./icons/apple-touch-icon.png",
  "./icons/icon-120x120.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-150x150.png",
  "./icons/icon-152x152.png",
  "./icons/icon-167x167.png",
  "./icons/icon-16x16.png",
  "./icons/icon-180x180.png",
  "./icons/icon-192x192.png",
  "./icons/icon-256x256.png",
  "./icons/icon-32x32.png",
  "./icons/icon-384x384.png",
  "./icons/icon-48x48.png",
  "./icons/icon-512x512.png",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/maskable-icon-192x192.png",
  "./icons/maskable-icon-512x512.png",
  "./icons/monograma-q-premium-master.png",
  "./splashes/splash-ipad-pro.png",
  "./splashes/splash-iphone-max.png",
  "./splashes/splash-iphone.png",
  "./",
  "./index.html",
  "./manifest.json",
  "./manifest.webmanifest",
  "./favicon.ico",
  "./apple-touch-icon.png"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});
