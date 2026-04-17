require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Rutas
const authRoutes = require('./routes/auth');
const pokemonRoutes = require('./routes/pokemon');
const favoritesRoutes = require('./routes/favorites');
const teamsRoutes = require('./routes/teams');
const friendsRoutes = require('./routes/friends');
const battlesRoutes = require('./routes/battles');
const pushRoutes = require('./routes/push');

const app = express();
let memoryMongoServer;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

const cleanupLegacyFriendsData = async () => {
  try {
    const collection = mongoose.connection.db.collection('friends');
    const indexes = await collection.indexes();
    if (indexes.some(index => index.name === 'friendCode_1')) {
      await collection.dropIndex('friendCode_1');
      console.log('🧹 Eliminado índice antiguo friendCode_1 de friends');
    }
    await collection.updateMany({ friendCode: { $exists: true } }, { $unset: { friendCode: '' } });
    console.log('🧹 Limpiado campo friendCode de documentos antiguos en friends');
  } catch (cleanupError) {
    console.warn('⚠️ No se pudo limpiar índices antiguos de friends:', cleanupError.message);
  }
};

const connectDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemonpru';

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Conectado a MongoDB');
    await cleanupLegacyFriendsData();
  } catch (err) {
    console.warn('⚠️ Falló conexión a MongoDB externa. Usando MongoDB en memoria.');
    console.warn(`Detalle: ${err.message}`);

    memoryMongoServer = await MongoMemoryServer.create();
    const memoryUri = memoryMongoServer.getUri('pokemonpru');
    await mongoose.connect(memoryUri);
    console.log('✅ Conectado a MongoDB en memoria (modo local)');
    await cleanupLegacyFriendsData();
  }
};

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/battles', battlesRoutes);
app.use('/api/push', pushRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend Pokédex operativo' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ esta mal en algo, en que¿ esta mal No se pudo iniciar el backend:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  if (memoryMongoServer) {
    await memoryMongoServer.stop();
  }
  process.exit(0);
});

startServer();
