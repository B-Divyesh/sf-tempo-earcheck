const VERSION = 'tempo-earcheck-v1';
const PRECACHE = self.__PRECACHE__;
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL_CACHE, ASSET_CACHE].includes(key)).map((key) => caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.hostname === 'api.sociobot.in') {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(SHELL_CACHE).then((cache) => cache.put('/', copy));
        return response;
      })
      .catch(async () => (await caches.match('/')) || (await caches.match('/offline.html'))));
    return;
  }

  event.respondWith(caches.match(url.pathname, { ignoreSearch: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && url.origin === new URL(self.registration.scope).origin) {
      caches.open(ASSET_CACHE).then((cache) => cache.put(event.request, response.clone()));
    }
    return response;
  })));
});
