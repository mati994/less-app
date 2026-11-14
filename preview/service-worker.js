/* Offline-Cache nur für diese Vorschau; den Live-Cache nie löschen. */
const PREFIX='less-preview-';
const CACHE_NAME=PREFIX+'2026-11-14-v1';
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./preview.css","./styles/base.css","./styles/layout.css","./styles/ring.css","./src/config.js","./src/storage.js","./src/ring.js","./src/views.js","./src/app.js","./src/register-sw.js"];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url),scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin || !url.pathname.startsWith(scope.pathname))return;
  event.respondWith(fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));}
    return response;
  }).catch(()=>caches.match(request).then(cached=>cached|| (request.mode==='navigate'?caches.match('./index.html'):undefined))));
});
