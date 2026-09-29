// Torque Care PWA Service Worker
// Cache management, network-first strategy, and push notification handling

const CACHE_NAME = 'torquecare-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/hero_car.jpg',
  '/images/honda_city_before.jpg',
  '/images/honda_city_after.jpg',
  '/images/washer_amit.jpg',
  '/images/app_icon.jpg',
  '/favicon.ico'
];

// 1. CACHE MANAGEMENT: Pre-cache core shell on installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. CACHE CLEANUP: Delete stale caches on activation and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. NETWORK-FIRST STRATEGY: Try network first, update cache, fallback to cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Network-First Strategy
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful GET responses for offline resilience
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Network request failed (offline) -> serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If HTML page navigation fails and not in cache, fallback to root shell
        if (request.mode === 'navigate') {
          return caches.match('/');
        }

        return new Response('Network error (Offline)', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});

// 4. PUSH NOTIFICATIONS: Handle push payloads & display notifications
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Torque Care';
  const options = {
    body: data.body || 'Your daily morning wash proof is ready for review.',
    icon: data.icon || '/images/app_icon.jpg',
    badge: data.badge || '/images/app_icon.jpg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: data.actions || [
      { action: 'open', title: 'View Proof' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. NOTIFICATION CLICKS: Focus existing window or open target URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
