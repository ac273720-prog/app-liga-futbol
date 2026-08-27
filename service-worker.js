const CACHE='linares-score-pwa-v4';
const FALLBACK=['/','/manifest.webmanifest','/app-icon-192.png','/app-icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FALLBACK)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('/'))));
});
