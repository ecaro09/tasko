const CACHE_NAME = 'tasko-pwa-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/main.tsx', // Main entry point for React app
    '/src/globals.css', // Global CSS
    '/logo.jpg', // Your logo image
    '/favicon.jpg', // Your favicon image
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', // Font Awesome
    // Add other critical assets and images used in the initial load
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Sample task image
    'https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Sample task image
    'https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', // Sample task image
    'https://randomuser.me/api/portraits/women/32.jpg', // Sample avatar
    'https://randomuser.me/api/portraits/men/54.jpg', // Sample avatar
    'https://randomuser.me/api/portraits/women/65.jpg', // Sample avatar
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We need to consume it once
                        // to cache it and once for the browser to fetch it.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});