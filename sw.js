/*============================================
SERVICE WORKER - MEDIO URBANO V3
=============================================*/

const CACHE="medio-urbano-v3";

const FILES=[
  "/",
  "/test.html",
  "/pedido.html",
  "/404.html",
  "/css/variables.css",
  "/css/themes.css",
  "/css/menu.css",
  "/css/admin-v3.css",
  "/css/dashboard.css",
  "/js/app.js",
  "/js/cart.js",
  "/js/menu.js",
  "/js/search.js",
  "/js/slider.js",
  "/js/effects.js",
  "/js/lazyload.js",
  "/js/notifications.js",
  "/js/pedidos.js",
  "/js/dashboard.js",
  "/img/logo-marca.png",
  "/img/background.webp"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(FILES))
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(keys.map(key=>{
        if(key!==CACHE) return caches.delete(key);
      }));
    })
  );
});

self.addEventListener("fetch",event=>{
  event.respondWith(
    caches.match(event.request).then(response=>response||fetch(event.request))
  );
});