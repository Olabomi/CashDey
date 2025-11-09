const CACHE_NAME = 'cashdey-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json'
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
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // Basic offline fallback
            if (event.request.mode === 'navigate') {
                 return new Response(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Offline - CashDey</title>
                        <style>
                            body { 
                                background-color: #000; color: #fff; font-family: sans-serif; 
                                display: flex; justify-content: center; align-items: center; 
                                height: 100vh; margin: 0; text-align: center;
                            }
                            .container { max-width: 300px; }
                            h1 { color: #10b981; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>You are Offline</h1>
                            <p>Please check your internet connection. Some features may not be available.</p>
                        </div>
                    </body>
                    </html>`, 
                    { headers: { 'Content-Type': 'text/html' } }
                );
            }
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});