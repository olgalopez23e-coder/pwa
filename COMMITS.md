# 📝 GUÍA DE COMMITS - PokéPWA

## Commits recomendados según funcionalidad

Después de implementar estos commits, la aplicación estará lista para producción.

---

## Commit 1: Setup Inicial - Configuración de Proyecto
```bash
git add .env backend-api/.env frontend/.env
git commit -m "setup: agregar archivos .env con configuración base

- Configurar variables de entorno para backend (MongoDB, JWT, CORS)
- Configurar variables de entorno para frontend (API URL)
- Documentar variables necesarias (VAPID keys opcionales)"
```

---

## Commit 2: PWA - Service Worker Mejorado
```bash
git add frontend/public/sw.js
git commit -m "feat(pwa): mejorar service worker con caché estratégico

- Implementar cuatro capas de caché (app-shell, api, images, static)
- Network-First para API (intenta red, cae a caché)
- Cache-First para imágenes y assets
- Background Sync para sincronizar requests offline
- Eliminar caché antiguo en activation
- Manejo completo de push notifications"
```

---

## Commit 3: PWA - Manifest y Metadatos
```bash
git add frontend/public/manifest.json
git commit -m "feat(pwa): mejorar manifest.json con schema completo

- Agregar iconos en múltiples tamaños 
- Agregar shortcuts para acceso directo
- Configurar orientación (portrait-primary)
- Agregar descripciones y categorías
- Soporte para maskable icons"
```

---

## Commit 4: Frontend - Inicialización de Service Worker
```bash
git add frontend/src/main.js
git commit -m "feat(app): mejorar inicialización del service worker

- Registrar SW con mejor manejo de errores
- Escuchar mensajes del SW (updates, syncs)
- Auto-suscribirse a push cuando usuario inicia sesión
- Dashboard de logs mejorado"
```

---

## Commit 5: Backend - Ambiente y Configuración
```bash
git add backend-api/.env backend-api/.env.example
git commit -m "docs(backend): documentar variables de entorno necesarias

- MongoDB URI para base de datos
- JWT secret y expiración configurables
- CORS origin configurable
- VAPID keys para push notifications"
```

---

## Commit 6: Documentación - Setup Completo
```bash
git add SETUP_COMPLETO.md
git commit -m "docs: agregar guía completa de setup

- Instrucciones paso a paso para instalar dependencias
- Generación de claves VAPID
- Verificación de configuración
- Inicio de desarrollo con dos servicios
- Testing y troubleshooting"
```

---

## Commit 7: Documentación - Estado Final
```bash
git add ESTADO_FINAL.md
git commit -m "docs: agregar resumen ejecutivo del proyecto

- Listar todas las características implementadas
- Indicar qué está listo para usar
- Documentar características opcionales (push)
- Estadísticas del proyecto
- Próximos pasos de deployment"
```

---

## ORDEN RECOMENDADO DE COMMITS

Ejecutar en este orden:

```bash
# 1. Base de proyecto
git commit -m "setup: ambiente inicial"

# 2. PWA - Funcionalidades offline
git commit -m "feat(pwa): service worker estratégico"
git commit -m "feat(pwa): manifest con esquema completo"

# 3. Inicialización
git commit -m "feat(app): service worker registration"

# 4. Documentación
git commit -m "docs: setup completo"
git commit -m "docs: estado final del proyecto"
```

---

## COMMITS ALTERNATIVOS (Si quieres ser más granular)

```bash
# PWA en múltiples commits
git commit -m "feat(pwa): cache layers architecture"
git commit -m "feat(pwa): network-first strategy"
git commit -m "feat(pwa): cache-first strategy"
git commit -m "feat(pwa): background sync"
git commit -m "feat(pwa): push notifications"

# Frontend mejoras
git commit -m "feat(app): sw registration mejorado"
git commit -m "feat(app): push subscription automática"
git commit -m "style(app): mejor logging con emojis"

# Configuración
git commit -m "config: environment variables"
git commit -m "config: manifest.json PWA"
git commit -m "config: tailwind y vite setup"

# Documentación
git commit -m "docs: guía de setup"
git commit -m "docs: troubleshooting"
git commit -m "docs: estado final"
```

---

## TEMPLATE DE COMMIT MESSAGE (Convencional)

### Formato
```
<tipo>(<scope>): <subject>

<body>

<footer>
```

### Tipos permitidos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Cambios en documentación
- `style`: Cambios de código sin lógica (formato, espacios)
- `refactor`: Cambios sin nueva funcionalidad
- `perf`: Mejoras de performance
- `test`: Pruebas unitarias
- `chore`: Cambios de configuración
- `ci`: CI/CD changes
- `config`: Configuración del proyecto

### Scope (ubicación del cambio):
- `pwa`: Service Worker, Manifest, PWA
- `app`: Main app (Vue, router)
- `auth`: Autenticación
- `api`: Servicios de API
- `ui`: Componentes UI
- `backend`: Cambios en servidor
- `docs`: Documentación

### Ejemplos completos:
```
feat(pwa): mejorar service worker con caché estratégico

- Network-First para API
- Cache-First para imágenes
- Limpieza de caché antiguo
- Push notifications completo

Closes #42
```

---

## VERIFICAR ANTES DE HACER COMMITS

```bash
# 1. Verifica que no haya errores
npm run build  # frontend
npm run dev    # backend (verificar que funciona)

# 2. Verifica los cambios que subes
git diff
git status

# 3. Agrupa archivos relacionados
git add <archivo> <archivo>
git commit -m "..."

# 4. Verifica el historio
git log --oneline -n 5
```

---

## DESPUÉS DE HACER LOS COMMITS

```bash
# Ver historio
git log --graph --oneline --all

# Crear un tag para release
git tag -a v1.0.0 -m "Primera versión de PokéPWA"

# Preparar para deploy
git push origin main
```

---

## 🎯 RESUMEN

Tu proyecto está **completamente funcional**. Los commits que sugerimos son para:
1. ✅ Documentar los cambios realizados
2. ✅ Mantener un historial limpio y profesional
3. ✅ Facilitar el rollback si es necesario
4. ✅ Preparar para agregar más features en futuro

¡Ejecuta los commits y tu PokéPWA estará listo para producción! 🚀
