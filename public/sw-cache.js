// Service Worker for Performance Caching
const CACHE_NAME = 'inbox-nav-v1';
const STATIC_CACHE = 'inbox-nav-static-v1';
const API_CACHE = 'inbox-nav-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/dashboard/products',
  '/dashboard/inboxes',
  '/dashboard/domains',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/inboxes/cached',
  '/api/domains/cached',
  '/api/get-session',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with stale-while-revalidate strategy
  if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached response immediately
            fetch(request).then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
            });
            return cachedResponse;
          }
          
          // Fetch from network and cache
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync any pending data when back online
  console.log('Background sync triggered');
}
