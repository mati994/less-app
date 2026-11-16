/* Offline-Cache nur für diese Vorschau; den Live-Cache nie löschen. */
const PREFIX='less-preview-';
const CACHE_NAME=PREFIX+'2026-11-16-storage1';
const ASSETS=["./","./index.html","./manifest.webmanifest","./icon.svg","./icon-512.png","./preview.css?v=20261116-storage1","./styles/base.css","./styles/layout.css?v=20261116-pearl21","./styles/ring.css?v=20261116-pearl21","./src/config.js","./src/storage.js?v=20261116-storage1","./src/ring.js?v=20261116-pearl21","./src/views.js?v=20261116-pearl21","./src/app.js?v=20261116-storage1","./src/register-sw.js"];
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
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try {
      const response=await fetch(request);
      if(response.ok){
        await cache.put(request,response.clone()).catch(()=>{});
        return response;
      }
      const cached=await cache.match(request);
      return cached||response;
    } catch {
      const cached=await cache.match(request);
      if(cached)return cached;
      if(request.mode==='navigate'){
        const entry=await cache.match(new URL('./index.html',scope).href);
        if(entry)return entry;
      }
      return Response.error();
    }
  })());
});
