/* ================================================================
   Service Worker — VARIUS
   Cachea toda la app para funcionar offline
   ================================================================ */

const CACHE = 'varius-v7';
const OFFLINE_URL = '/offline.html';

// Recursos críticos que se cachean AL INSTALAR el service worker
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/brand/isotipo.svg',
  '/sw.js',
];

// Extensiones que NO se cachean (generadas dinámicamente)
const DYNAMIC_PATTERNS = [
  /\?/,                // Queries URLs
  /\/_next\/data/,      // Next.js data requests
];

// ================================================================
// INSTALL — Cachear recursos críticos ANTES de que el usuario haga nada
// ================================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      console.log('[SW] Instalando y cacheando recursos críticos');
      return cache.addAll(CRITICAL_ASSETS).catch(err => {
        console.warn('[SW] Algunos recursos no se pudieron pre-cachear:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ================================================================
// ACTIVATE — Limpiar cachés antiguas
// ================================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => {
            console.log('[SW] Eliminando caché antigua:', key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      console.log('[SW] Activado, usando caché:', CACHE);
      return self.clients.claim();
    })
  );
});

// ================================================================
// FETCH — Interceptar TODAS las solicitudes
// ================================================================
self.addEventListener('fetch', event => {
  const req = event.request;

  // Solo GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ================================================================
  // NAVIGATE requests (carga de páginas HTML)
  // ================================================================
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(response => {
          // Online: cachear la respuesta y devolverla
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(req, copy));
          }
          return response;
        })
        .catch(() => {
          // OFFLINE: buscar en caché
          console.log('[SW] Offline detectado, buscando en caché:', url.pathname);
          return caches.match(req).then(cached => {
            if (cached) {
              console.log('[SW] Sirviendo desde caché:', url.pathname);
              return cached;
            }
            // No hay caché de esta página específica, devolver offline genérico
            console.log('[SW] Sin caché, mostrando página offline');
            return caches.match(OFFLINE_URL).then(offlinePage => {
              if (offlinePage) return offlinePage;
              // Ni siquiera offline.html está cacheado
              return new Response(
                `<!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Sin conexión — Varius</title>
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      background: #FEF8F5;
                      min-height: 100vh;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      padding: 24px;
                    }
                    .container { text-align: center; max-width: 320px; }
                    .icon { font-size: 64px; margin-bottom: 20px; }
                    h1 { color: #b45935; font-size: 22px; margin-bottom: 12px; }
                    p { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
                    button {
                      background: #b45935;
                      color: white;
                      border: none;
                      border-radius: 10px;
                      padding: 12px 28px;
                      font-size: 15px;
                      font-weight: 600;
                      cursor: pointer;
                    }
                    button:active { opacity: 0.85; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="icon">📡</div>
                    <h1>Sin conexión</h1>
                    <p>Parece que no estás conectado o existen problemas en la red o internet.</p>
                    <button onclick="location.reload()">Reintentar</button>
                  </div>
                </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              );
            });
          });
        })
    );
    return;
  }

  // ================================================================
  // STATIC ASSETS (imágenes, JS, CSS, fuentes)
  // ================================================================
  // Solo cachear del mismo origen y del CDN de Vercel
  if (url.origin !== self.location.origin &&
      !url.hostname.endsWith('.vercel.app') &&
      !url.hostname.endsWith('.now.sh')) return;

  // No cachear requests dinámicos (API, RSC, etc.)
  if (DYNAMIC_PATTERNS.some(p => p.test(url.pathname))) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return response;
      }).catch(() => {
        // Fallback para recursos estáticos que fallan offline
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
      });
    })
  );
});