# ⚡ Guía Rápida de Inicio - 5 Minutos

## 🎯 Objetivo Final
Tener la aplicación Pokédex PWA ejecutándose localmente con todas las funcionalidades.

---

## 📋 Pasos Previos (Si no están hechos)

### 1. Instalar MongoDB

**Windows:**
- Descargar de: https://www.mongodb.com/try/download/community
- Instalar y guardar en `C:\Program Files\MongoDB\Server\7.0`
- Abrir PowerShell como admin:
```powershell
# Crear carpeta de datos
mkdir C:\data\db

# Iniciar MongoDB
mongod --dbpath C:\data\db
```

**macOS/Linux:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

---

## 🚀 Iniciar la Aplicación (10 minutos)

### Terminal 1 - Backend

```bash
# Navegar al backend
cd backend

# Instalar dependencias
npm install

# Iniciar servidor (estará en puerto 5000)
npm run dev
```

**Salida esperada:**
```
✅ Conectado a MongoDB
🚀 Servidor ejecutándose en puerto 5000
```

**Prueba:** Abre http://localhost:5000/api/health en navegador

---

### Terminal 2 - Frontend

```bash
# Navegar al frontend
cd pokedex\ -\ copia

# Instalar dependencias
npm install

# Iniciar desarrollo (puerto 5173)
npm run dev
```

**Salida esperada:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## 🌐 Acceder a la App

Abre en navegador: **http://localhost:5173**

---

## 🧪 Prueba Rápida

### 1. Crear Cuenta
- Email: `test@example.com`
- Contraseña: `Password123`
- Click en "Registrarse"

### 2. Explorar Pokémon
- Click en "Pokémon" en la navbar
- Busca "Pikachu" o filtra por "electric"
- Click en una tarjeta para ver detalles

### 3. Agregar a Favoritos
- En detalles del pokémon, click en "❤️ Agregar a favoritos"
- Ir a "Favoritos" para verlo

### 4. Crear Equipo
- Ir a "Equipos" → "Crear equipo"
- Nombre: "Mi primer equipo"
- Click en "Crear"

### 5. Agregar Amigos
- Ir a "Amigos"
- Click en el código que aparece (se copia automático)
- Crear otra cuenta y usar el código para agregar como amigo

### 6. Batallar
- Con 2 usuarios amigos, ir a "Batallas"
- Click en "Batallar" junto al amigo
- Ejecutar ataques alternados

---

## 🔑 Variables de Entorno Configuradas

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/pokemon-app
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

**⚠️ Para producción:** Cambiar estos valores por URLs reales

---

## ❌ Si Algo Falla

### "Error conectando a MongoDB"
```powershell
# Verificar que MongoDB está corriendo
net start MongoDB

# O iniciar manualmente
mongod --dbpath C:\data\db
```

### "Puerto 5000 en uso"
```bash
# Cambiar puerto en backend/.env
PORT=5001

# Actualizar frontend/.env
VITE_API_URL=http://localhost:5001/api
```

### "CORS error en navegador"
- Asegurarse que backend está ejecutándose
- Revisar que CORS_ORIGIN en backend/.env sea correcto

### "Módulos no encontrados"
```bash
# Limpiar e reinstalar
rm -r node_modules package-lock.json
npm install
```

---

## 📦 Comandos Útiles

### Backend
```bash
npm run dev      # Iniciar con nodemon
npm start        # Iniciar sin watch
npm test         # Ejecutar pruebas
```

### Frontend
```bash
npm run dev      # Desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build
```

---

## 🎮 Características Disponibles

✅ Autenticación (registro y login)  
✅ Explorar pokémon con filtros  
✅ Ver detalles de pokémon  
✅ Favoritos persistentes  
✅ Crear múltiples equipos  
✅ Sistema de amigos con códigos únicos  
✅ Batallas entre amigos  
✅ PWA (funciona offline)  

---

## 🚀 Próximos Pasos Opcionales

1. **Mejorar Batallas:**
   - Sistema de IA más realista
   - Cálculo de tipología para daño

2. **Generar Build:**
   ```bash
   cd pokedex\ -\ copia
   npm run build
   # Abrir dist/index.html
   ```

3. **Deploy:**
   - Backend: Heroku, Railway, Render
   - Frontend: Vercel, Netlify

---

## 📞 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Aplicación en blanco | Abrir DevTools (F12) → Console, buscar errores |
| No carga pokémon | Backend no está ejecutándose |
| No puedo loguearme | MongoDB no está corriendo |
| Botón de favor. no funciona | Esperar a que termine carga de datos |

---

**¡Listo! Ya tienes tu Pokédex PWA funcionando** 🎮✨

Para documentación completa: ver [README.md](./README.md)
