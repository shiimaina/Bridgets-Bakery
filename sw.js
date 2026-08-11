// sw.js – Bridget's Bakery PWA

const CACHE_NAME = 'bakery-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event – cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Try to add all, but if one fails, still continue (don't break the whole install)
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Some assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event – serve from cache, fallback to network, then offline fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit – return the cached response
        if (response) return response;
        // Otherwise, try fetching from network
        return fetch(event.request).catch(() => {
          // If network fails, return a fallback (e.g., the homepage)
          return caches.match('/');
        });
      })
  );
});