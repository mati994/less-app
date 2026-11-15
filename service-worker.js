/* less. Live-PWA: cache scope stays separate from the preview. */
const PREFIX='less-pwa-v';
const CACHE_NAME=PREFIX+'03-icon-20261115';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request,url=new URL(req.url),scope=new URL(self.registration.scope);
 if(req.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||url.pathname.startsWith(scope.pathname+'preview/'))return;
 e.respondWith(fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(req,copy)));}
   return response;
 }).catch(()=>caches.match(req).then(cached=>cached||(req.mode==='navigate'?caches.match('./index.html'):undefined))));
});
