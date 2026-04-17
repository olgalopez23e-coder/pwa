# 📱 Documentación: Implementación PWA con Service Worker
**Fecha:** 05/02/2026  
**Proyecto:** Pokédex PWA  
**Desarrollador:** Sistema de IA

---

## 📋 Resumen de Cambios

Se ha implementado un **Service Worker completo** con caché inteligente, detección de modo offline y sincronización automática. La aplicación ahora funciona completamente sin conexión a internet.

---

## 🎯 Características Implementadas

### 1. ✅ APP SHELL CACHE (Rutas Fijas)

**Archivo:** `public/sw.js`

El APP SHELL contiene todas las rutas principales de la aplicación que deben estar siempre disponibles:

```javascript
const APP_SHELL = [
  '/',                          // Página principal
  '/index.html',                // Documento principal
  '/manifest.json',             // Manifiesto PWA
  '/favicon.ico',               // Ícono
  '/assets/',                   // Recursos compilados
  '/about',                     // Rutas de navegación
  '/contacto',
  '/login',
  '/informacion-legal',
  '/registro',
  '/dashboardAdmin'
];
```

**¿Cómo funciona?**
- Se cachean automáticamente durante la instalación del SW (`evento install`)
- Si falla la red, se sirven desde caché sin demora
- Son críticas para que la app funcione siempre

---

### 2. 💾 CACHÉ DINÁMICO

**Archivos:**
- `API_CACHE`: Almacena respuestas de APIs (Pokémon, datos)
- `DYNAMIC_CACHE`: Almacena assets y documentos

**Estrategias de caché implementadas:**

#### A) **API Requests** (Cache First → Network)
```javascript
// Si la API está en caché, usarla inmediatamente
// Si no, hacer request y guardar en caché para uso futuro
```
- **Ventaja:** Las APIs se cargan instantáneamente
- **Uso:** Llamadas a PokéAPI, datos de usuario
- **Sincronización:** Cuando vuelve la conexión, se actualiza

#### B) **Assets** (Network First → Cache)
```javascript
// Intentar descargar recurso nuevo
// Si falla, servir desde caché
```
- **Ventaja:** Siempre tienes la última versión
- **Uso:** JS, CSS, imágenes de la app
- **Fallback:** Si no está en caché, mostrar placeholder

#### C) **HTML Documents** (Network First con APP SHELL fallback)
```javascript
// Intentar cargar página nueva
// Si falla, servir desde caché dinámico
// Si no está, servir homepage desde APP SHELL
```

---

### 3. 🗑️ LIMPIEZA DE CACHÉ ANTIGUA

**Evento:** `activate` del Service Worker

```javascript
self.addEventListener('activate', (event) => {
  // Buscar todos los cachés
  caches.keys().then((cacheNames) => {
    // Eliminar cachés que no sean de la versión actual
    cacheNames.map((cacheName) => {
      if (!cacheName.includes(CACHE_VERSION)) {
        console.log(`Eliminando: ${cacheName}`);
        caches.delete(cacheName);
      }
    });
  });
});
```

**Control de versiones:**
```javascript
const CACHE_VERSION = 'pokédex-v1.0.0';
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;
```

**¿Cómo actualizar el caché?**  
Simplemente cambiar `v1.0.0` a `v1.0.1` y el SW eliminará automáticamente los cachés antiguos.

---

### 4. ♻️ ACTIVACIÓN AUTOMÁTICA DEL SW NUEVO

**Archivo:** `src/main.js`

```javascript
navigator.serviceWorker.register('/sw.js')
  .then((registration) => {
    // Buscar actualizaciones cada 60 segundos
    setInterval(() => {
      registration.update();
    }, 60000);

    // Cuando se encuentra una nueva versión
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Mostrar notificación al usuario
          if (confirm('Nueva versión disponible. ¿Deseas recargar?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });
  });
```

**Ventajas:**
- ✅ Usuario elige cuándo actualizar
- ✅ Sin interrupciones forzadas
- ✅ Limpieza automática de cachés viejos

---

### 5. 📴 CARGA OFFLINE CON TAILWIND CSS

#### A) **Componente OfflineIndicator.vue**

Muestra un indicador visual cuando no hay conexión:

```vue
<template>
  <div v-if="!isOnline" class="fixed bottom-0 left-0 right-0 z-50">
    <!-- Barra naranja indicando modo offline -->
    <div class="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500">
      <!-- Indicador pulsante -->
      <div class="w-3 h-3 bg-white rounded-full animate-pulse"></div>
      <!-- Botón para reintentar sincronización -->
      <button @click="syncData" :disabled="isSyncing">
        {{ isSyncing ? 'Sincronizando...' : 'Reintentar' }}
      </button>
    </div>
  </div>
</template>
```

**Características:**
- 🟠 Barra degradada en naranja/rojo (offline)
- 🟢 Indicador verde en esquina (online)
- 🔄 Botón de reintentar sincronización
- ⏳ Animación de sincronización

#### B) **Composable useOffline.js**

Gestiona el estado online/offline:

```javascript
export function useOffline() {
  const isOnline = ref(navigator.onLine)
  const isSyncing = ref(false)

  // Detecta cuando vuelve la conexión
  window.addEventListener('online', () => {
    isOnline.value = true
    syncData() // Sincronizar automáticamente
  })

  // Detecta cuando se pierde conexión
  window.addEventListener('offline', () => {
    isOnline.value = false
  })

  return { isOnline, isSyncing, syncData }
}
```

**Uso en componentes:**
```vue
<script setup>
import { useOffline } from '@/composables/useOffline'
const { isOnline, isSyncing } = useOffline()
</script>

<template>
  <div v-if="!isOnline" class="p-4 bg-orange-100 border-l-4 border-orange-500">
    Estás en modo offline
  </div>
</template>
```

#### C) **Tailwind CSS Configuration**

**Archivo:** `tailwind.config.js`

```javascript
export default {
  theme: {
    extend: {
      colors: {
        offline: { /* colores para estado offline */ }
      },
      animation: {
        'sync': 'sync 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  }
}
```

**Clases Tailwind usadas:**
- `bg-gradient-to-r`: Gradiente naranja para offline
- `animate-pulse`: Indicador pulsante
- `animate-sync`: Animación de sincronización personalizada
- `fixed bottom-0`: Posición fija en la parte inferior

---

## 📁 Estructura de Archivos Modificados/Creados

```
pokedex - copia/
├── public/
│   └── sw.js                          [MODIFICADO] Service Worker completo
├── src/
│   ├── App.vue                        [MODIFICADO] Incluye OfflineIndicator
│   ├── main.js                        [MODIFICADO] Registro mejorado del SW
│   ├── composables/
│   │   └── useOffline.js              [NUEVO] Composable para estado offline
│   └── components/
│       └── OfflineIndicator.vue       [NUEVO] Indicador visual de offline
├── package.json                        [MODIFICADO] Agregados Tailwind + PostCSS
├── tailwind.config.js                 [NUEVO] Configuración de Tailwind
├── postcss.config.js                  [NUEVO] Configuración de PostCSS
└── vite.config.js                     [SIN CAMBIOS] Compatible con todo
```

---

## 🔧 Instalación de Dependencias

```bash
# Instalar Tailwind CSS, PostCSS y Autoprefixer
npm install -D tailwindcss postcss autoprefixer

# O si usas yarn
yarn add -D tailwindcss postcss autoprefixer
```

---

## 🚀 Cómo Funciona el Flujo

### 1️⃣ **Usuario abre la app**
```
1. Se registra el Service Worker (main.js)
2. SW descarga y cachea el APP SHELL (install event)
3. Aplicación lista para usar
```

### 2️⃣ **Usuario navega y carga datos**
```
1. Hace click en un enlace → Intenta network primero
2. Se cachean automáticamente rutas visitadas (dynamic cache)
3. Se cachean APIs de Pokémon consultadas
```

### 3️⃣ **Se pierde la conexión**
```
1. Navigator detecta cambio: navigator.onLine = false
2. OfflineIndicator muestra barra naranja
3. SW sirve desde caché automáticamente
4. Usuario puede seguir navegando
```

### 4️⃣ **Vuelve la conexión**
```
1. Navigator detecta: navigator.onLine = true
2. OfflineIndicator invita a sincronizar
3. Usuario elige "Reintentar"
4. Se actualizan datos desde servidor
5. Barra desaparece (vuelve a mostrar verde)
```

### 5️⃣ **Hay actualización del app**
```
1. Cada 60 segundos se buscan actualizaciones
2. Si hay nuevo SW: mostrar modal
3. Usuario elige recargar
4. Nuevo SW toma control
5. Cachés viejos se eliminan automáticamente
```

---

## 📊 Diagrama de Caché

```
┌─────────────────────────────────────────┐
│     NAVEGADOR - CACHE API               │
└─────────────────────────────────────────┘
         │
         ├─ APP_SHELL_CACHE (pokédex-v1.0.0-app-shell)
         │  └─ / , /about, /contacto, /login, etc.
         │
         ├─ DYNAMIC_CACHE (pokédex-v1.0.0-dynamic)
         │  └─ Assets nuevos, documentos visitados
         │
         └─ API_CACHE (pokédex-v1.0.0-api)
            └─ Respuestas de APIs (Pokémon, usuarios, etc.)
```

---

## 🔐 Consideraciones de Seguridad

1. **HTTPS requerido:** Los Service Workers solo funcionan en HTTPS (excepto localhost)
2. **Scope del SW:** Solo cachea recursos en su mismo origen
3. **Validación de respuestas:** No cachea errores (status !== 200)
4. **Tamaño de caché:** No hay límite explícito, pero el navegador maneja cuotas

---

## 🎨 Personalización

### Cambiar colores offline
En `OfflineIndicator.vue`:
```vue
<!-- Cambiar de naranja a rojo -->
<div class="bg-gradient-to-r from-red-500 to-red-700">
```

### Cambiar intervalo de actualización
En `main.js`:
```javascript
// Cambiar de 60000ms (60s) a 30000ms (30s)
setInterval(() => {
  registration.update();
}, 30000);
```

### Agregar más rutas al APP SHELL
En `public/sw.js`:
```javascript
const APP_SHELL = [
  '/',
  '/mi-nueva-ruta',  // ← Agregar aquí
  // ...
];
```

---

## 🐛 Debugging

### Ver caché en DevTools
1. Abre DevTools (F12)
2. Ve a: **Application → Cache Storage**
3. Verás tres cachés:
   - `pokédex-v1.0.0-app-shell`
   - `pokédex-v1.0.0-dynamic`
   - `pokédex-v1.0.0-api`

### Ver Service Worker
1. DevTools → **Application → Service Workers**
2. Ver estado: "activated and is running"

### Simular modo offline
1. DevTools → **Network → Offline** (checkbox)
2. Actualizar página
3. La app sigue funcionando desde caché

### Ver logs del SW
```javascript
// El SW imprime en consola:
console.log('✅ SW: ...')  // Info
console.log('⚠️ SW: ...')  // Advertencia
console.log('📦 SW: ...')  // Caché
console.log('🗑️ SW: ...')  // Limpieza
```

---

## 📈 Ventajas de esta Implementación

| Característica | Ventaja |
|---|---|
| **APP SHELL** | ⚡ Carga instantánea de UI principal |
| **Dynamic Cache** | 📱 Funciona sin conexión después de 1ª visita |
| **API Cache** | 🚀 APIs responden en millisegundos |
| **Limpieza Auto** | 🧹 Ahorra espacio borrando cachés viejos |
| **Updates Auto** | ♻️ Usuarios siempre con versión más reciente |
| **Offline UI** | 🎨 UX clara indicando estado de conexión |
| **Tailwind CSS** | 🎯 Estilos consistentes y responsive |

---

## ✅ Checklist de Implementación

- [x] Service Worker completo instalado
- [x] APP SHELL cacheado
- [x] Caché dinámico funcionando
- [x] Limpieza de caché antigua automática
- [x] Detección de nuevas versiones del SW
- [x] Actualizaciones automáticas
- [x] Indicador visual de offline
- [x] Composable useOffline
- [x] Tailwind CSS configurado
- [x] Documentación completa

---

## 🔄 Próximos Pasos Opcionales

1. **Sinkronización en background:**
   ```javascript
   // Usar Background Sync API para sincronizar cuando vuelva conexión
   registration.sync.register('sync-pokémon-data');
   ```

2. **Web Push Notifications:**
   ```javascript
   // Notificar al usuario cuando hay actualizaciones disponibles
   ```

3. **Storage API:**
   ```javascript
   // Guardar datos de usuario de forma persistente
   ```

4. **IndexedDB:**
   ```javascript
   // Base de datos local para datos complejos
   ```

---

**Fecha de implementación:** 05/02/2026  
**Versión del caché:** v1.0.0  
**Estado:** ✅ Producción
** se usa npm install dotenv para lleer lo del archivo de . env