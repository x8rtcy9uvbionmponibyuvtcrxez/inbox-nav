const CACHE_NAME = 'inbox-nav-v8';

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
  // Don't intercept navigation requests - let them go directly to network
  // This prevents redirect issues with authentication and routing
  if (event.request.mode === 'navigate') {
    // Let navigation requests pass through without service worker interception
    return;
  }
  
  // NEVER cache favicons - always fetch fresh from network, no cache fallback
  const isFavicon = event.request.url.includes('/favicon') || 
                    event.request.url.includes('/apple-touch-icon') ||
                    event.request.url.includes('/site.webmanifest') ||
                    event.request.url.includes('/icon.');
  
  if (isFavicon) {
    // Always fetch from network, never from cache
    event.respondWith(
      fetch(event.request, { cache: 'no-store', redirect: 'follow' })
        .catch(() => {
          // If network fails, don't show anything - don't fallback to cache
          return new Response('', { status: 404 });
        })
    );
    return;
  }
  
  // For API requests, always use network with redirect: 'follow'
  const isAPI = event.request.url.includes('/api/');
  
  if (isAPI) {
    event.respondWith(
      fetch(event.request, { redirect: 'follow', cache: 'no-cache' })
        .then((response) => {
          // Only cache successful non-redirect responses
          if (response.ok && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response('Network error', { status: 503 });
          });
        })
    );
    return;
  }
  
  // For other requests (static assets), use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network with redirect handling
        return response || fetch(event.request, { redirect: 'follow' });
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