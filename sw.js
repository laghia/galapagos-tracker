const CACHE='galapagos-tracker-v2';
// App shell only. Species photos are cached opportunistically at runtime
// (see the 'fetch' handler below) - for now they're hotlinked from
// Wikipedia (see README.md), later they'll be local files under images/;
// either way they get cached the first time each tile is viewed online.
const ASSETS=[
  './',
  './index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(ASSETS.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        // res.ok is false for cross-origin no-cors responses (e.g. <img>
        // loads to Wikimedia) even when they succeeded - res.type is
        // 'opaque' for those, and opaque responses are still cacheable.
        if (res.ok || res.type === 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
