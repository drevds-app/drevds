// DREV DS service worker – gjør appen tilgjengelig uten nett.
// Ved ny versjon: endre VERSION, så henter telefonene alle filene på nytt.
const VERSION = "2.0";
const CACHE = "drevds-" + VERSION;
const ASSETS = ["./", "index.html", "manifest.webmanifest", "fonts/fonts.css", "lib/jspdf.umd.min.js", "lib/jspdf.plugin.autotable.min.js", "fonts/barlow-latin-400-normal.woff2", "fonts/barlow-latin-500-normal.woff2", "fonts/barlow-latin-600-normal.woff2", "fonts/barlow-condensed-latin-500-normal.woff2", "fonts/barlow-condensed-latin-600-normal.woff2", "fonts/barlow-condensed-latin-700-normal.woff2", "icons/apple-touch-icon.png", "icons/favicon-16.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-192.png", "icons/icon-maskable-512.png", "docs/drevproveregler-2026-2031.pdf", "docs/veileder-dommere-med-kandidater.pdf", "docs/veileder-hundepeiler.pdf"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: "reload"}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("drevds-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    // Appen selv: prøv nettet først (maks 3 sekunder), ellers lagret kopi
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const net = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej("timeout"), 3000))]);
        if (net && net.ok) cache.put("index.html", net.clone());
        return net;
      } catch (err) {
        return (await cache.match("index.html")) || (await cache.match("./")) || Response.error();
      }
    })());
    return;
  }
  // Øvrige filer: lagret kopi først, ellers nettet
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
