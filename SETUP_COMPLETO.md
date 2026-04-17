# 🚀 GUÍA COMPLETA DE CONFIGURACIÓN - PokéPWA

## Paso 1: Instalação de dependencias

### Backend
```bash
cd backend-api
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Paso 2: Generar claves VAPID para Push Notifications

Las claves VAPID son necesarias para enviar notificaciones push. Ejecuta en la carpeta `backend-api`:

```bash
npx web-push generate-vapid-keys
```

Esto generará dos claves. Copia estos valores en el archivo `.env`:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

## Paso 3: Verificar configuración de variables de entorno

### Backend (backend-api/.env)
- ✅ MONGODB_URI - Conexión a MongoDB
- ✅ JWT_SECRET - Secreto para tokens (cambiar en producción)
- ✅ PORT - Puerto del servidor (default: 5000)
- ✅ CORS_ORIGIN - URL del frontend (default: http://localhost:5173)
- ✅ VAPID_PUBLIC_KEY - Tu clave pública
- ✅ VAPID_PRIVATE_KEY - Tu clave privada

### Frontend (frontend/.env)
- ✅ VITE_API_URL - URL de la API backend (default: http://localhost:5000/api)

## Paso 4: Iniciar la aplicación en desarrollo

### Terminal 1: Backend
```bash
cd backend-api
npm run dev
```

Debe mostrar: `🚀 Servidor ejecutándose en puerto 5000`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Debe mostrar: URL como `Local: http://localhost:5173/`

## Paso 5: Pruebas básicas

1. **Abrir la app**: Ve a http://localhost:5173/
2. **Registrate**: Email test y contraseña
3. **Explorar Pokémon**: Busca "pikachu" o "charizard"
4. **Agregar a favoritos**: Click en el corazón en una tarjeta
5. **Ver detalles**: Click en "Ver detalles"
6. **Offline**: Abre DevTools > Network > set to Offline, verifica que los datos en caché se cargan

## Paso 6: Habilitar notificaciones

1. Cuando la app pregunte por permisos de notificaciones, clickea "Permitir"
2. En Dev Mode, las notificaciones aparecerán en la bandeja del sistema

## Paso 7: Crear Equipos y Batallas

1. **Crear un equipo**: 
   - Ve a "Equipos"
   - Selecciona 1-6 Pokémon de tus favoritos
   - Guarda el equipo

2. **Agregar amigos**:
   - Ve a "Amigos"
   - Genera tu código
   - Comparte con otro usuario (en la misma máquina, usa otra cuenta)
   - El otro usuario agrega tu código

3. **Batallar**:
   - Ve a "Batallas"
   - Selecciona tu equipo
   - Selecciona un amigo para batallar
   - ¡Batalla!

## Paso 8: Construir para Producción

### Frontend
```bash
cd frontend
npm run build
```

Generará carpeta `dist/` lista para desplegar.

### Backend
Para producción, configura variables en tu servidor/host:
- Cambiar `NODE_ENV` a "production"
- Usar una BD MongoDB remota
- Cambiar `JWT_SECRET` a un valor seguro
- Configurar CORS_ORIGIN con tu dominio real

## 🧪 Testing con PWA

### Probar Service Worker
1. Abre DevTools > Application > Service Workers
2. Verifica que esté "activated and running"
3. Abre Network y marca "Offline"
4. Navega por la app - debe cargar desde caché

### Probar Background Sync (offline requests)
1. Ve a Favoritos y agrega un Pokémon OFFLINE
2. El navegador lo guardará en IndexedDB
3. Cuando recuperes conexión, se sincronizará automáticamente

### Probar Notificaciones
1. Desde DevTools > Console, ejecuta:
```javascript
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.getSubscription();
console.log(subscription);
```

## 📝 Comandos útiles

### Ver logs del Service Worker
```javascript
// En la consola del DevTools
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations))
```

### Limpiar caché
```javascript
caches.keys().then(names => names.forEach(name => caches.delete(name)))
```

### Ver IndexedDB
En DevTools > Application > IndexedDB > poke-db > requests

## ⚙️ Solución de problemas

### "No se conecta a MongoDB"
- Verificar MONGODB_URI en .env
- Verificar que MongoDB esté corriéndose
- Verificar credenciales de MongoDB Atlas

### "CORS error"
- Verificar CORS_ORIGIN coincida con la URL del frontend
- Estar en http://localhost:5173 (no https en desarrollo)

### "Servicio Worker no se registra"
- Pasar sobre HTTPS (localhost funciona)
- Limpiar caché y recargar
- Verificar que `/sw.js` sea accesible

### "Sin notificaciones push"
- Verificar VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY están en .env
- Verificar que el usuario esté autenticado
- Permitir notificaciones en el navegador

## 🎉 Felicidades!

Tu PokéPWA está lista. Ahora puedes:
- ✅ Explorar Pokémon offline
- ✅ Recibir notificaciones
- ✅ Batallar con amigos
- ✅ Disfrutar de una experiencia PWA completa
