// Service worker OFFLINE (generado automaticamente en cada publicacion).
// Guarda toda la app en el dispositivo para poder jugar SIN internet.
const BUILD = '20260806160019';
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

// Estrategia: servir de la cache al instante (rapido y offline) y actualizar en
// segundo plano cuando hay internet (stale-while-revalidate).
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const net = fetch(req).then((res) => {
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (cached) { e.waitUntil(net); return cached; }
    const res = await net;
    if (res) return res;
    if (req.mode === 'navigate') {
      return (await cache.match('index.html')) || (await cache.match('./')) || Response.error();
    }
    return Response.error();
  })());
});