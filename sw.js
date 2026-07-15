/*============================================
SERVICE WORKER - MEDIO URBANO V3
Network-first for HTML, cache-first for assets
=============================================*/

const CACHE="medio-urbano-v4";

const STATIC_FILES=[
  "/css/variables.css",
  "/css/themes.css",
  "/css/menu.css",
  "/css/admin-v3.css",
  "/css/dashboard.css",
  "/css/promos-carousel.css",
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
  "/js/promos-carousel.js",
  "/js/brand-identity.js",
  "/img/logo-marca.png",
  "/img/logo-cocina.png",
  "/img/logo-salad.png",
  "/img/logo-burgers.png",
  "/img/logo-pasta.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(STATIC_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(keys.map(key=>{
        if(key!==CACHE) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  const isHTML=event.request.mode==="navigate"||url.pathname.endsWith(".html")||url.pathname==="/";
  if(isHTML){
    event.respondWith(
      fetch(event.request).then(response=>{
        const clone=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,clone));
        return response;
      }).catch(()=>caches.match(event.request))
    );
  }else{
    event.respondWith(
      caches.match(event.request).then(response=>response||fetch(event.request))
    );
  }
});
