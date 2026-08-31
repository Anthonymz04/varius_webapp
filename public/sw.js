const CACHE='varius-v4';
const CORE=['/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png'];
const IMMUTABLE=/^\/(_next\/static|icons)\//;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||req.mode==='navigate')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(url.searchParams.has('_rsc')||req.headers.has('RSC')||req.headers.has('Next-Router-Prefetch')||req.headers.has('Next-Router-State-Tree'))return;
  if(!IMMUTABLE.test(url.pathname))return;
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
    return res;
  })));
});
