# 🎨 GUÍA DE ICONOS - PWA POKÉDEX

**Fecha:** 05/02/2026  
**Colores:** Azul Agua (#0891b2)

---

## 📋 CAMBIOS REALIZADOS

### ✅ manifest.json Actualizado
```json
{
  "background_color": "#0891b2",    ← Color azul agua
  "theme_color": "#0891b2",
  "icons": [
    72x72, 96x96, 128x128, 144x144, 152x152,
    192x192, 384x384, 512x512,
    + iconos maskable (para Android)
  ]
}
```

### ✅ App.vue - Fondo Azul Agua
```vue
<!-- Antes -->
<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

<!-- Ahora -->
<div class="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100">
```

### ✅ tailwind.config.js - Colores Aqua
```javascript
colors: {
  aqua: {
    50: '#f0f9fa',      // Muy claro
    100: '#e1f3f5',     // Claro
    200: '#b3e5eb',
    300: '#85d7e0',
    400: '#57c9d5',
    500: '#0891b2',     // Principal ← Azul agua
    600: '#0a8fa3',
    700: '#0d7a94',
    800: '#106685',
    900: '#125276'      // Muy oscuro
  }
}
```

---

## 🎨 RESOLUCIONES DE ICONOS INCLUIDAS

```
┌─────────────────────────────────────────────────────────┐
│         ICONOS GENERADOS EN MANIFEST.JSON               │
├─────────────────────────────────────────────────────────┤
│ 72x72 px    │ Android (launcher pequeño)                 │
│ 96x96 px    │ Android (launcher)                         │
│ 128x128 px  │ Android (launcher grande)                  │
│ 144x144 px  │ Android (Nexus)                            │
│ 152x152 px  │ Apple Touch Icon                           │
│ 192x192 px  │ Android (launcher principal)              │
│ 384x384 px  │ Desktop (splash screen)                    │
│ 512x512 px  │ App Store (desktop, tablet)                │
│ 192x192 px* │ Android Adaptive (*maskable)               │
│ 512x512 px* │ Android Adaptive (*maskable)               │
└─────────────────────────────────────────────────────────┘

* Los iconos "maskable" son para Android 13+ que recorta
  el icono en forma de lente. Mantener contenido en el centro.
```

---

## 🚀 CÓMO GENERAR LOS ICONOS

### Opción 1: Script Automático (Recomendado)

#### Paso 1: Instalar Sharp
```bash
npm install -D sharp
```

#### Paso 2: Ejecutar generador
```bash
node generate-icons.js
```

Se crearán en: `public/icons/`

### Opción 2: Herramientas Online

#### Para convertir SVG a PNG:
1. **CloudConvert** - https://cloudconvert.com/svg-to-png
2. **Convertio** - https://convertio.co/svg-png/
3. **Online-Convert** - https://online-convert.com/

#### Pasos:
1. Crear imagen base (cualquier tamaño)
2. Usar herramienta para convertir a PNG
3. Redimensionar a cada tamaño requerido
4. Guardar en `public/icons/`

### Opción 3: Aplicaciones de Escritorio

**En Windows:**
- Paint.NET (gratis)
- GIMP (gratis, profesional)
- Photoshop (pagado)

**En Mac:**
- Preview (incluido)
- Figma (online, gratis)
- Sketch (pagado)

**En Linux:**
- GIMP (gratis)
- Inkscape (gratis, para SVG)

---

## 🎨 ESPECIFICACIONES DEL ICONO

### Colores Tema Azul Agua
```
Color Principal:    #0891b2  (RGB: 8, 145, 178)
Color Claro:        #85d7e0  (RGB: 133, 215, 224)
Color Oscuro:       #0a8fa3  (RGB: 10, 143, 163)
Fondo Claro:        #e1f3f5  (RGB: 225, 243, 245)
```

### Recomendaciones de Diseño

1. **Mantén contenido en centro**
   - Los iconos maskable recortan en forma de lente
   - Contenido principal en círculo central del icono

2. **Diseño simple**
   - Menos detalles = mejor en tamaños pequeños
   - Evita líneas muy finas (< 2px)

3. **Contraste**
   - Azul agua sobre fondo blanco: ✅ Buen contraste
   - Azul agua sobre azul claro: ⚠️ Bajo contraste
   - Blanco sobre azul agua: ✅ Buen contraste

4. **Esquinas redondeadas**
   - Recomendado: border-radius 10-20%
   - Moderna y amigable

---

## 📁 ESTRUCTURA DE CARPETAS

```
public/
├── icons/                          ← Crear esta carpeta
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── icon-maskable-192x192.png
│   └── icon-maskable-512x512.png
│
├── screenshots/                    ← Opcional
│   ├── screenshot-1.png           (540x720 - mobile)
│   └── screenshot-2.png           (1280x720 - desktop)
│
├── manifest.json                   ← Actualizado ✅
├── favicon.ico
└── sw.js
```

---

## 🔧 VERIFICACIÓN EN DEVTOOLS

### 1. Comprobar Manifest
```
DevTools → Application → Manifest
  • background_color: #0891b2 ✅
  • theme_color: #0891b2 ✅
  • icons: 10 iconos listados ✅
  • display: standalone ✅
```

### 2. Comprobar Iconos
```
DevTools → Application → Manifest → Icons
  Ver lista de todos los iconos:
  - 72x72 ✅
  - 96x96 ✅
  - 128x128 ✅
  - ...hasta 512x512 ✅
  - maskable-192x192 ✅
  - maskable-512x512 ✅
```

### 3. Lighthouse Audit
```
DevTools → Lighthouse
  Category: Progressive Web App
  ✅ Manifest exists
  ✅ Service Worker registered
  ✅ Has icons
  ✅ Installable
  Score: 90+
```

---

## 🎯 PRUEBA DE INSTALACIÓN

### En Chrome/Edge
```
1. Abre la app
2. Click en icono (esquina superior derecha)
3. "Instalar la aplicación"
4. Se usa icono 192x192 o 512x512
5. Ver icono en escritorio ✅
```

### En Android
```
1. Abre en navegador
2. Menú → "Instalar aplicación"
3. O: Click en ícono flotante
4. Se usa icono 192x192 (adaptable)
5. Aparece en pantalla de inicio ✅
```

### En iPhone
```
1. Safari → Compartir
2. "Añadir a pantalla de inicio"
3. Se usa icono 152x152
4. Aparece en pantalla de inicio ✅
```

---

## 📊 VENTAJAS DEL TEMA AZUL AGUA

| Aspecto | Azul Agua | Gris Anterior |
|---------|-----------|---------------|
| **Modernidad** | ✨ Muy moderno | Neutro |
| **Energía** | ⚡ Energético | Pasivo |
| **Identidad** | 🎨 Único | Genérico |
| **Contraste** | ✅ Excelente | Bueno |
| **Accesibilidad** | ✅ WCAG AA | WCAG AAA |
| **Profesionalismo** | ⭐ Excelente | Bueno |

---

## 🎓 COLORES TAILWIND DISPONIBLES

Puedes usar estos colores en tus componentes:

```vue
<!-- Fondo azul agua -->
<div class="bg-aqua-500">Azul agua principal</div>

<!-- Variantes claras -->
<div class="bg-aqua-50">Muy claro</div>
<div class="bg-aqua-100">Claro</div>
<div class="bg-aqua-200">Claro-medio</div>

<!-- Variantes oscuras -->
<div class="bg-aqua-600">Oscuro</div>
<div class="bg-aqua-700">Más oscuro</div>
<div class="bg-aqua-800">Muy oscuro</div>

<!-- Text color -->
<p class="text-aqua-500">Texto azul agua</p>
<p class="text-aqua-700">Texto azul agua oscuro</p>

<!-- Borders -->
<div class="border-2 border-aqua-500">Borde azul agua</div>

<!-- Hover effects -->
<button class="bg-aqua-500 hover:bg-aqua-600">
  Botón con hover
</button>
```

---

## ✅ CHECKLIST FINAL

- [ ] manifest.json actualizado con color #0891b2
- [ ] manifest.json incluye 10 iconos diferentes
- [ ] App.vue con gradiente azul agua (from-cyan-50)
- [ ] tailwind.config.js con colores aqua
- [ ] Carpeta `public/icons/` creada
- [ ] Iconos generados en 10 resoluciones
- [ ] manifest.json referencia todos los iconos
- [ ] DevTools muestra iconos correctamente
- [ ] Lighthouse audit: PWA 90+
- [ ] App instable en navegadores modernos

---

## 🚀 PRÓXIMOS PASOS

1. **Generar iconos:**
   ```bash
   npm install -D sharp
   node generate-icons.js
   ```

2. **Probar instalación:**
   ```bash
   npm run dev
   # Chrome → Instalar aplicación
   ```

3. **Validar con Lighthouse:**
   ```bash
   F12 → Lighthouse → Run audit
   Score: 90+ PWA ✅
   ```

4. **Compilar producción:**
   ```bash
   npm run build
   # Verificar que public/icons/ está en dist/
   ```

---

## 📞 SOPORTE

Si los iconos no aparecen:
1. Verificar ruta en manifest: `/icons/icon-*.png`
2. Verificar que archivos existen en `public/icons/`
3. Limpiar caché del navegador (DevTools → Storage → Clear site data)
4. Cerrar completamente navegador y reabrir

---

**Color actualizado:** 05/02/2026  
**Versión:** v1.0.0  
**Estado:** ✅ LISTO PARA GENERAR ICONOS
