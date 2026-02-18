const CACHE_NAME = "cteen-checkin-v3"; // ✅ change la version à chaque update
const ASSETS = [
  "/mjd-checkin/",
  "/mjd-checkin/login.html",
  "/mjd-checkin/signup.html",
  "/mjd-checkin/me.html",
  "/mjd-checkin/admin.html",
  "/mjd-checkin/scan.html",
  "/mjd-checkin/student.html",
  "/mjd-checkin/manifest.webmanifest",
  "/mjd-checkin/css/style.css",
  "/mjd-checkin/icons/icon-192.png",
  "/mjd-checkin/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ✅ Network-first pour les navigations (pages HTML)
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || caches.match("/mjd-checkin/login.html");
      }
    })());
    return;
  }

  // ✅ Cache-first pour les assets
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const res = await fetch(req);
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, res.clone());
    return res;
  })());
});
