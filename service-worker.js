/* less. Live – network-first offline PWA. Never delete preview caches. */
const PREFIX='less-pwa-v';
const CACHE_NAME=PREFIX+'04-20261115-live1';
const ASSETS=[
 './','./index.html','./manifest.webmanifest','./icon.svg','./icon-512.png',
 './styles/base.css','./styles/layout.css?v=20261115-live1','./styles/ring.css?v=20261115-live1',
 './src/config.js','./src/storage.js','./src/ring.js?v=20261115-live1',
 './src/views.js?v=20261115-live1','./src/app.js?v=20261115-live1','./src/register-sw.js'
];
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
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||url.pathname.startsWith(scope.pathname+'preview/'))return;
 event.respondWith(fetch(request).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));}
   return response;
 }).catch(()=>caches.match(request).then(cached=>cached||(request.mode==='navigate'?caches.match('./index.html'):undefined))));
});
