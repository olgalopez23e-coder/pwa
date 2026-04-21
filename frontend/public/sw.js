importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/umd.js');

// ============================================
// CONFIGURACIÓN DE CACHÉS
// ============================================
const CACHE_VERSION = 'v4';
const CACHE_NAMES = {
  appShell: `app-shell-${CACHE_VERSION}`,
  api: `api-cache-${CACHE_VERSION}`,
  images: `images-cache-${CACHE_VERSION}`,
  static: `static-cache-${CACHE_VERSION}`
};

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// ============================================
// INSTALACIÓN
// ============================================
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: instalando...');

  event.waitUntil(
    Promise.all([
      // Cachear App Shell
      caches.open(CACHE_NAMES.appShell).then(cache => {
        console.log('📦 App Shell cacheado');
        return cache.addAll(APP_SHELL);
      }).catch(err => console.error('Error al cachear App Shell:', err)),

      // Pre-cachear recursos estáticos clave
      caches.open(CACHE_NAMES.static).then(cache => {
        const staticAssets = [
          '/manifest.json',
          '/favicon.ico'
        ];
        return cache.addAll(staticAssets).catch(() => {
          console.log('⚠️ Algunos assets estáticos no pudieron ser cacheados');
        });
      })
    ]).then(() => {
      self.skipWaiting(); // Activar inmediatamente
    })
  );
});

// ============================================
// ACTIVACIÓN Y LIMPIEZA
// ============================================
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: activando...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar cachés viejos
          const isOld = !Object.values(CACHE_NAMES).includes(cacheName);
          if (isOld) {
            console.log(`🗑️ Eliminando caché antiguo: ${cacheName}`);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    }).then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: 'La aplicación ha sido actualizada'
          });
        });
      });
    })
  );
});

// ============================================
// INTERCEPCIÓN DE SOLICITUDES
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Ignorar solicitudes no-GET
  if (request.method !== 'GET') {
    return;
  }

  // 2. API - Network First (intenta red, cae a caché)
  // 2. API - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.api));
    return;
  }

  // 3. Imágenes PokéAPI - Cache First con red de fallback
  if (url.hostname.includes('raw.githubusercontent.com') ||
    url.hostname.includes('pokeapi.co')) {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.images));
    return;
  }

  // 4. Recursos estáticos (.js, .css, etc) - Network First (para asegurar actualizaciones)
  if (/\.(js|css|woff|woff2|png|jpg|jpeg|svg|gif)$/.test(url.pathname)) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.static));
    return;
  }

  // 5. HTML - Network First
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.appShell));
    return;
  }

  // 6. Por defecto - Cache First
  event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.static));
});

// ============================================
// ESTRATEGIA: NETWORK FIRST
// ============================================
async function networkFirstStrategy(request, cacheName) {
  try {
    // Intentar obtener de la red
    const response = await fetch(request);

    // Cachear la respuesta válida
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Si la red falla, usar caché
    const cached = await caches.match(request);
    if (cached) {
      console.log(`📦 Usando caché (offline): ${request.url}`);
      return cached;
    }

    // Si tampoco hay caché, guardar para sincronizar después
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      await saveOfflineRequest(request);
    }

    // Retornar respuesta genérica de error
    return new Response(
      JSON.stringify({ error: 'No hay conexión', offline: true }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ============================================
// ESTRATEGIA: CACHE FIRST
// ============================================
async function cacheFirstStrategy(request, cacheName) {
  // Intentar obtener del caché primero
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    // Si no está en caché, obtener de la red
    const response = await fetch(request);

    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn(`⚠️ Error al cargar: ${request.url}`, error);

    // Retornar un placeholder o error
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }

    return new Response('Recurso no disponible', { status: 404 });
  }
}

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);

  if (event.tag === 'sync-offline-requests') {
    event.waitUntil(retrySyncOfflineRequests());
  }
});

async function retrySyncOfflineRequests() {
  try {
    const db = await idb.openDB('poke-db', 1);
    const requests = await db.getAll('requests');

    console.log(`📤 Intentando sincronizar ${requests.length} solicitudes offline...`);

    for (let req of requests) {
      try {
        const response = await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.data ? JSON.stringify(req.data) : undefined
        });

        if (response.ok) {
          await db.delete('requests', req.id);
          console.log(`✅ Sincronizado: ${req.url}`);

          // Notificar al cliente
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'REQUEST_SYNCED',
                url: req.url,
                success: true
              });
            });
          });
        }
      } catch (err) {
        console.error(`❌ Error al sincronizar ${req.url}:`, err);
      }
    }
  } catch (err) {
    console.error('Error en Background Sync:', err);
    throw err;
  }
}

// ============================================
// GUARDADO DE SOLICITUDES OFFLINE
// ============================================
async function saveOfflineRequest(request) {
  try {
    const db = await idb.openDB('poke-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('requests')) {
          db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
        }
      }
    });

    let body = null;
    if (request.method !== 'GET') {
      try {
        body = await request.clone().text();
      } catch (e) {
        body = null;
      }
    }

    await db.add('requests', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      data: body,
      timestamp: Date.now()
    });

    console.log(`💾 Solicitud guardada offline: ${request.method} ${request.url}`);

    // Registrar Background Sync si está disponible
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await self.registration;
      await registration.sync.register('sync-offline-requests');
    }
  } catch (err) {
    console.error('Error al guardar solicitud offline:', err);
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Notificación de Pokédex',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100, 50, 200],
    tag: 'pokemon-notification',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Abrir', icon: '/favicon.ico' },
      { action: 'close', title: 'Cerrar', icon: '/favicon.ico' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🎮 Pokédex', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event.action);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Buscar si ya existe una ventana abierta
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no existe, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada');
});

console.log('✅ Service Worker cargado completamente');