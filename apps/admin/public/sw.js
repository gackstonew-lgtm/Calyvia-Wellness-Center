// ========================================================
// CALYVIA WELLNESS CENTER — SERVICE WORKER
// App Shell & Static Asset Caching Engine
// ========================================================

const CACHE_NAME = 'calyvia-shell-v1.0.0';

// Critical static app shell assets (safe for public caching)
const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/brand/calyvia-emblem-light.svg',
  '/brand/calyvia-emblem-dark.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
];

// Install Event: Precaches App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Prevent service worker installation failure if single optional asset fails
        console.warn('[SW] Precache completed with non-fatal warnings:', err);
      })
  );
});

// Activate Event: Cleans Up Stale Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Strict Healthcare Security & Safe Shell Caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NON-GET REQUESTS: Always bypass service worker (pass-through to network)
  if (request.method !== 'GET') {
    return;
  }

  // 2. CRITICAL HEALTHCARE SECURITY BOUNDARY:
  // Strictly NEVER cache API requests, Supabase database queries, or auth tokens!
  // Any medical records, patients, or vitals must always be fetched live.
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/auth') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('pooler.supabase.com')
  ) {
    return; // Direct network fetch, no cache
  }

  // 3. STATIC ASSETS (_next/static, /icons, /brand): Cache-first with network fallback
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/brand/') ||
    url.pathname === '/favicon.svg'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. HTML NAVIGATION REQUESTS: Network-first with cached shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If network succeeded, keep shell fresh in cache
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback to precached root shell
          return caches.match('/');
        })
    );
    return;
  }
});
