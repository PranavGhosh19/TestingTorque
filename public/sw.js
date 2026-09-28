// Torque Care Service Worker for Offline PWA Capabilities
const CACHE_NAME = 'torquecare-cache-v1';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/images/hero_car.jpg',
  '/images/honda_city_before.jpg',
  '/images/honda_city_after.jpg',
  '/images/washer_amit.jpg',
  '/images/app_icon.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => {
          // Fallback if offline
          return caches.match('/');
        });
    })
  );
});
