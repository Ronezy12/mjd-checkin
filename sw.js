const CACHE_NAME = "cteen-checkin-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./login.html",
  "./signup.html",
  "./me.html",
  "./admin.html",
  "./scan.html",
  "./student.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // On ignore Firebase & CDN
  if (
    req.url.includes("firebase") ||
    req.url.includes("gstatic") ||
    req.url.includes("unpkg") ||
    req.url.includes("api.qrserver") ||
    req.url.includes("quickchart")
  ) {
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => {
        return caches.match("./login.html");
      });
    })
  );
});
