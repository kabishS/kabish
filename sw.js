// Shows offline.html (the panda page) when a page cannot be loaded. Bump CACHE when you edit offline.html.
const CACHE = 'kabish-offline-v1';
const PRECACHE = ['offline.html', 'assets/img/illustrations/panda-offline.svg', 'assets/img/icons/favicon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') e.respondWith(fetch(e.request).catch(() => caches.match('offline.html')));
});
