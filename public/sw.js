const CACHE_NAME = 'inbox-nav-v4';
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/products',
  '/dashboard/inboxes',
  '/dashboard/domains',
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.svg',
  '/site.webmanifest',
  '/_next/static/css/',
  '/_next/static/js/',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Always fetch favicons from network to ensure they're up-to-date
  const isFavicon = event.request.url.includes('/favicon') || 
                    event.request.url.includes('/apple-touch-icon') ||
                    event.request.url.includes('/site.webmanifest');
  
  if (isFavicon) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Fallback to cache only if network fails
        return caches.match(event.request);
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
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