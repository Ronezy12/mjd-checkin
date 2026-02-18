const CACHE_NAME = "cteen-checkin-v1";
const ASSETS = [
  "/mjd-checkin/",
  "/mjd-checkin/login.html",
  "/mjd-checkin/signup.html",
  "/mjd-checkin/me.html",
  "/mjd-checkin/admin.html",
  "/mjd-checkin/scan.html",
  "/mjd-checkin/manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // cache les pages en “runtime”
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});
