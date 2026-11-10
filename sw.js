// DREV DS service worker – gjør appen tilgjengelig uten nett.
// Ved ny versjon: endre VERSION, så henter telefonene alle filene på nytt.
// Forespørsler til databasen (Supabase) går utenom, siden de har en annen adresse.
const VERSION = "3.1";
const CACHE = "drevds-" + VERSION;
const ASSETS = ["./", "index.html", "manifest.webmanifest", "fonts/fonts.css", "lib/jspdf.umd.min.js", "lib/jspdf.plugin.autotable.min.js", "lib/supabase.min.js", "lib/qrcode.min.js", "lib/jsqr.min.js", "fonts/barlow-latin-400-normal.woff2", "fonts/barlow-latin-500-normal.woff2", "fonts/barlow-latin-600-normal.woff2", "fonts/barlow-condensed-latin-500-normal.woff2", "fonts/barlow-condensed-latin-600-normal.woff2", "fonts/barlow-condensed-latin-700-normal.woff2", "icons/apple-touch-icon.png", "icons/favicon-16.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-192.png", "icons/icon-maskable-512.png", "docs/drevproveregler-2026-2031.pdf", "docs/veileder-dommere-med-kandidater.pdf", "docs/veileder-hundepeiler.pdf", "docs/sider/regler-01.webp", "docs/sider/regler-02.webp", "docs/sider/regler-03.webp", "docs/sider/regler-04.webp", "docs/sider/regler-05.webp", "docs/sider/regler-06.webp", "docs/sider/regler-07.webp", "docs/sider/regler-08.webp", "docs/sider/regler-09.webp", "docs/sider/regler-10.webp", "docs/sider/regler-11.webp", "docs/sider/regler-12.webp", "docs/sider/regler-13.webp", "docs/sider/regler-14.webp", "docs/sider/regler-15.webp", "docs/sider/regler-16.webp", "docs/sider/regler-17.webp", "docs/sider/regler-18.webp", "docs/sider/regler-19.webp", "docs/sider/regler-20.webp", "docs/sider/regler-21.webp", "docs/sider/regler-22.webp", "docs/sider/peiler-01.webp", "docs/sider/kandidater-01.webp", "docs/sider/kandidater-02.webp"];

self.addEventListener("install", e => {
  // Hver fil lagres for seg. En enkelt fil som mangler, stopper ikke oppdateringen.
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(ASSETS.map(u => fetch(new Request(u, {cache: "reload"})).then(r => { if (r.ok) return c.put(u, r); throw new Error(u); }))))
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
