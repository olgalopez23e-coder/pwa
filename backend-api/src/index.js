require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Rutas
const authRoutes = require('./routes/auth');
const pokemonRoutes = require('./routes/pokemon');
const favoritesRoutes = require('./routes/favorites');
const teamsRoutes = require('./routes/teams');
const friendsRoutes = require('./routes/friends');
const battlesRoutes = require('./routes/battles');
const pushRoutes = require('./routes/push');

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://127.0.0.1:5173'];

    if (!origin || allowed.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS Bloqueado para origen: ${origin}`);
      console.log(`📡 Orígenes permitidos: ${allowed.join(', ')}`);
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// ================= FUNCIONES =================

// Limpieza opcional
const cleanupLegacyFriendsData = async () => {
  try {
    const collection = mongoose.connection.db.collection('friends');
    const indexes = await collection.indexes();

    if (indexes.some(index => index.name === 'friendCode_1')) {
      await collection.dropIndex('friendCode_1');
      console.log('🧹 Índice antiguo eliminado');
    }

    await collection.updateMany(
      { friendCode: { $exists: true } },
      { $unset: { friendCode: '' } }
    );

  } catch {
    console.warn('⚠️ No se requirió limpieza');
  }
};

// Conexión Mongo
const connectDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('❌ Falta MONGODB_URI');
    return;
  }

  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB conectado');
    await cleanupLegacyFriendsData();
  } catch (err) {
    console.error('❌ Error MongoDB:', err.message);
  }
};

// Verificar PokéAPI
const checkExternalApis = async () => {
  let pokeApiUrl = process.env.POKEAPI_URL || 'https://pokeapi.co/api/v2';
  if (pokeApiUrl.endsWith('pokeapi.co')) {
    pokeApiUrl = `${pokeApiUrl}/api/v2`;
  }
  try {
    const axios = require('axios');
    await axios.get(`${pokeApiUrl}/pokemon/1`, { timeout: 3000 });
    console.log('✅ PokéAPI OK');
  } catch (err) {
    console.error('❌ Error PokéAPI:', err.message);
  }
};

// Variables críticas
const checkEnvVars = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.warn('⚠️ Faltan variables:', missing);
  } else {
    console.log('✅ Variables OK');
  }
};

// ================= RUTAS API =================

app.get('/api/health', (req, res) => {
  res.json({ status: 'operativo' });
});

app.use('/api/auth', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/battles', battlesRoutes);
app.use('/api/push', pushRoutes);

// 🚨 IMPORTANTE: evitar que frontend intercepte API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada' });
});

// ================= FRONTEND =================

const frontendPath = path.join(__dirname, '../../frontend/dist');

console.log(`📦 Buscando frontend en: ${frontendPath}`);

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log('✅ Frontend encontrado');

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

} else {
  console.warn('⚠️ Frontend NO compilado');

  app.get('*', (req, res) => {
    res.status(404).json({
      error: 'Frontend no compilado. Ejecuta npm run build en /frontend'
    });
  });
}

// ================= ERRORES =================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);

  checkEnvVars();
  checkExternalApis();
  connectDatabase();
});