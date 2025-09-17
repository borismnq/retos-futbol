// Service Worker for Retos Fútbol PWA

const CACHE_NAME = 'retos-futbol-v1';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/maskable-icon.png',
  '/safari-pinned-tab.svg',
  // Add other static assets that should be cached
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  // Cache all static assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell and content');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => {
        console.error('Failed to cache:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients
  event.waitUntil(clients.claim());
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests, like those for Google Fonts, analytics, etc.
  if (!event.request.url.startsWith(self.location.origin) || 
      !(event.request.url.startsWith('http'))) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If the request was successful, return it
          if (response.status === 200) {
            // Clone the response to save it to the cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For all other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response to save it to the cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            // For other requests, return a fallback response
            return new Response('You are offline, and no cached data is available.', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const data = event.data?.json() || {};
  const title = data.title || 'Retos Fútbol';
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: data.data || {},
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle the notification click
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a Window tab matching the targeted URL already exists, focus it
      const hadWindowToFocus = clientList.some((windowClient) => {
        if (windowClient.url === event.notification.data.url) {
          return windowClient.focus();
        }
        return false;
      });
      
      // Otherwise, open a new tab
      if (!hadWindowToFocus) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement your background sync logic here
  console.log('Syncing data in the background...');
}
