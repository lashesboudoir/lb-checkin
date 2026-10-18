// Static-host fallback only: caches the app shell so the iPad can reopen it offline.
// Apps Script calls (script.google.com) are cross-origin and never cached; queued check-ins live in IndexedDB.
const CACHE = 'lb-gas-gas-1.0.0';
const SHELL = ["./", "index.html", "lb-checkin.js", "lb-logo.png", "lb-logo-header@2x.png", "lb-logo-72@2x.png", "lb-cormorant.woff2", "lb-cormorant-italic.woff2", "lb-jost.woff2", "lb-sarabun-300.woff2", "lb-sarabun-400.woff2", "lb-sarabun-500.woff2", "lb-ex-1_before.jpg", "lb-ex-2_after.jpg", "lb-ex-3_split.jpg", "lb-ex-4_stacked.jpg"];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
