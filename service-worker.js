const CACHE_NAME = 'crm-taller-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/index.css',
    '/js/app.js',
    '/js/router.js',
    '/js/modules/ui/core.ui.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request).then((fetchResponse) => {
                return fetchResponse;
            });
        }).catch(() => {
            // En offline, si no está en cache no hacemos nada por ahora.
            // PWA funcionará sobre los datos de IndexedDB.
        })
    );
});
