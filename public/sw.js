const CACHE_NAME = 'inbox-nav-static-v1';

// Install event - cache resources (only cache actual files, not directories)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache only core static assets that rarely change
      const urlsToCache = [];

      return Promise.allSettled(
        urlsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err);
            return null;
          }),
        ),
      );
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests for static assets.
  if (request.method !== 'GET') {
    return;
  }

  // Allow navigations to bypass the service worker so we always get fresh HTML.
  if (request.mode === 'navigate') {
    return;
  }

  const isAPI = request.url.includes('/api/');
  if (isAPI) {
    // Let API traffic hit the network directly; no caching to avoid stale data.
    return;
  }

  const cacheableDestinations = new Set(['style', 'script', 'image', 'font']);
  if (!cacheableDestinations.has(request.destination)) {
    // For everything else (e.g., fetch/XHR), defer to the network.
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request, { redirect: 'follow' }).then((networkResponse) => {
        if (!networkResponse || !networkResponse.ok) {
          return networkResponse;
        }

        // Skip caching chrome-extension:// URLs and other unsupported schemes
        const url = new URL(request.url);
        if (url.protocol === 'chrome-extension:' || url.protocol === 'chrome:' || url.protocol === 'moz-extension:') {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone).catch((err) => {
            console.warn(`Failed to cache ${request.url}:`, err);
          });
        });

        return networkResponse;
      });
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force skip waiting to activate new service worker immediately
      return self.clients.claim();
    })
  );
});
