// Offline-Fallback: immer zuerst das Netz (ohne Browser-Zwischenspeicher, damit geänderte Karten sofort
// ankommen), sonst der eigene Speicher. Neuer Name bei Formatwechsel, alte Speicher räumt activate weg.
const CACHE = "karten-v2";
// Gerüst und Daten gleich beim ersten Besuch speichern, damit die Karten auch ohne WLAN aufgehen;
// Bilder kommen erst in den Speicher, wenn sie einmal angesehen wurden.
self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE)
    .then(c => c.addAll(["./", "index.html", "daten.js", "manifest.webmanifest"].map(u => new Request(u, {cache: "reload"}))))
    .catch(() => {})
    .then(() => self.skipWaiting())
));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith("karten-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, {cache: "no-cache"}).then(r => {
      if (r.ok) { const k = r.clone(); caches.open(CACHE).then(c => c.put(e.request, k)); }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}))
  );
});
