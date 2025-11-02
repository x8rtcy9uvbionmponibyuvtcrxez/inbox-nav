const CACHE_NAME = 'inbox-nav-v6';

// Install event - cache resources (only cache actual files, not directories)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't cache favicons - always fetch fresh from network
      // Only cache pages, not static assets that might change
      const urlsToCache = [
        '/',
        '/dashboard',
        '/dashboard/products',
        '/dashboard/inboxes',
        '/dashboard/domains',
      ];
      
      // Use Promise.allSettled to avoid failing on individual cache misses
      return Promise.allSettled(
        urlsToCache.map(url => 
          cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}:`, err);
            return null;
          })
        )
      );
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // NEVER cache favicons - always fetch fresh from network, no cache fallback
  const isFavicon = event.request.url.includes('/favicon') || 
                    event.request.url.includes('/apple-touch-icon') ||
                    event.request.url.includes('/site.webmanifest') ||
                    event.request.url.includes('/icon.');
  
  if (isFavicon) {
    // Always fetch from network, never from cache
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .catch(() => {
          // If network fails, don't show anything - don't fallback to cache
          return new Response('', { status: 404 });
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