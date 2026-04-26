/* QuotaLab PWA Service Worker */
const CACHE_NAME = 'quotalab-pwa-v1.0.0';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './install.js',
  './icons/icon-72x72.png',
  './icons/icon-76x76.png',
  './icons/icon-114x114.png',
  './icons/icon-120x120.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-180x180.png',
  './icons/icon-192x192.png',
  './icons/icon-256x256.png',
  './icons/icon-512x512.png',
  './splashes/splash-android-fhd.png',
  './splashes/splash-iphone.png',
  './splashes/splash-iphone-max.png',
  './splashes/splash-ipad-pro.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(APP_SHELL).catch(() => cache.addAll(['./', './index.html', './manifest.json', './install.js']))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          if (requestURL.pathname.endsWith('.png')) {
            return caches.match('./icons/icon-192x192.png');
          }
        });
    })
  );
});
