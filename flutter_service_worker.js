// Service worker OFFLINE (generado automaticamente en cada publicacion).
// Guarda toda la app en el dispositivo para poder jugar SIN internet.
const BUILD = '20260806185933';
const CACHE = 'camino-bolsa-' + BUILD;
const PRECACHE = [
  "./",
  ".last_build_id",
  "favicon.png",
  "flutter.js",
  "flutter_bootstrap.js",
  "index.html",
  "main.dart.js",
  "manifest.json",
  "version.json",
  "assets/AssetManifest.bin",
  "assets/AssetManifest.bin.json",
  "assets/FontManifest.json",
  "assets/NOTICES",
  "assets/fonts/MaterialIcons-Regular.otf",
  "assets/packages/cupertino_icons/assets/CupertinoIcons.ttf",
  "assets/shaders/ink_sparkle.frag",
  "assets/shaders/stretch_effect.frag",
  "canvaskit/canvaskit.js",
  "canvaskit/canvaskit.wasm",
  "canvaskit/wimp.js",
  "canvaskit/wimp.wasm",
  "canvaskit/experimental_webparagraph/canvaskit.js",
  "canvaskit/experimental_webparagraph/canvaskit.wasm",
  "icons/Icon-192.png",
  "icons/Icon-512.png",
  "icons/Icon-maskable-192.png",
  "icons/Icon-maskable-512.png"
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) =>
    Promise.allSettled(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' }))))
  ));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Estrategia:
//  - La PAGINA (navegacion): red primero => si hay internet se ve siempre la
//    version mas nueva; sin internet, se sirve de la cache.
//  - Los RECURSOS (js/wasm/fuentes): cache primero => rapidos y disponibles
//    sin internet; si faltan, se bajan de la red y se guardan.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (req.mode === 'navigate') {
      try {
        const net = await fetch(req);
        if (net && net.status === 200) cache.put(req, net.clone());
        return net;
      } catch (err) {
        return (await cache.match(req)) || (await cache.match('index.html')) ||
               (await cache.match('./')) || Response.error();
      }
    }
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const net = await fetch(req);
      if (net && net.status === 200) cache.put(req, net.clone());
      return net;
    } catch (err) {
      return Response.error();
    }
  })());
});