// Offline-schil voor de reisgids: bewaart alleen de eigen pagina's van deze site.
// Weer, koersen en plaatszoekopdrachten (andere herkomst) gaan nooit via de cache.
const NAAM = 'reisgids-v1';
const SCHIL = ['reisgids.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(NAAM).then(c => c.addAll(SCHIL).catch(() => { }))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== NAAM).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const k = r.clone(); caches.open(NAAM).then(c => c.put(e.request, k)); return r; }).catch(() => caches.match(e.request)));
});
