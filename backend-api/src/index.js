require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Rutas
const authRoutes = require('./routes/auth');
const pokemonRoutes = require('./routes/pokemon');
const favoritesRoutes = require('./routes/favorites');
const teamsRoutes = require('./routes/teams');
const friendsRoutes = require('./routes/friends');
const battlesRoutes = require('./routes/battles');
const pushRoutes = require('./routes/push');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://127.0.0.1:5173'];
    if (!origin || allowed.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido'));
    }
  },
  credentials: true
}));

// Función de limpieza de datos antiguos
const cleanupLegacyFriendsData = async () => {
  try {
    const collection = mongoose.connection.db.collection('friends');
    const indexes = await collection.indexes();
    if (indexes.some(index => index.name === 'friendCode_1')) {
      await collection.dropIndex('friendCode_1');
      console.log('🧹 Índice antiguo eliminado');
    }
    await collection.updateMany({ friendCode: { $exists: true } }, { $unset: { friendCode: '' } });
  } catch (error) {
    console.warn('⚠️ Nota: No se requirió limpieza de índices.');
  }
};

// Conexión a Base de Datos (Solo Atlas)
const connectDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ ERROR: No se encontró MONGODB_URI en las variables de entorno.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado exitosamente a MongoDB Atlas');
    await cleanupLegacyFriendsData();
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};
app.get('/api/health', (req, res) => res.json({ status: 'operativo' }));
// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/battles', battlesRoutes);
app.use('/api/push', pushRoutes);

// --- DIAGNÓSTICOS DE PRODUCCIÓN (RAILWAY) ---
const checkEnvVars = () => {
  const criticalVars = ['MONGODB_URI', 'JWT_SECRET', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'];
  const missing = criticalVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn('\n⚠️ [DIAGNÓSTICO] Faltan las siguientes variables de entorno:');
    missing.forEach(v => console.warn(`   ❌ ${v}`));
    console.warn('   Asegúrate de configurarlas en el panel de Railway (Settings > Variables).\n');
  } else {
    console.log('\n✅ [DIAGNÓSTICO] Todas las variables críticas están presentes.\n');
  }
};

// Servir archivos estáticos del frontend en producción
const frontendPath = path.join(__dirname, '../../frontend/dist');
console.log(`📦 [Backend] Buscando frontend en: ${frontendPath}`);

if (require('fs').existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log('✅ [Backend] Directorio /dist encontrado. Serviendo frontend...');
} else {
  console.warn('⚠️ [Backend] Directorio /dist NO encontrado. Asegúrate de compilar el frontend con "npm run build".');
}

// Para cualquier otra ruta, servir el index.html del frontend (Vue Router)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend no compilado. Ejecuta npm run build en la carpeta frontend.' });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;

// Iniciar servidor primero, conectar DB después para evitar bloqueos
app.listen(PORT, () => {
  console.log(`🚀 [Backend] Servidor encendido en el puerto ${PORT}`);
  console.log(`🔗 [URL Local] http://localhost:${PORT}`);
  
  // Una vez encendido, intentamos conectar a la base de datos
  console.log('🔄 [Backend] Intentando conectar a MongoDB Atlas...');
  checkEnvVars();
  connectDatabase();
});
