require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/battles', battlesRoutes);
app.use('/api/push', pushRoutes);

// Rutas de estado
app.get('/api/health', (req, res) => res.json({ status: 'operativo' }));
app.get('/api/auth', (req, res) => res.send('Backend Pokédex vivo 🚀'));
app.get('/api/pokemon', (req, res) => res.send('Backend Pokédex vivo 🚀'));
app.get('/api/favorites', (req, res) => res.send('Backend Pokédex vivo 🚀'));
app.get('/api/teams', (req, res) => res.send('Backend Pokédex vivo 🚀'));
app.get('/api/friends', (req, res) => res.send('Backend Pokédex vivo 🚀'));
app.get('/api/battles', (req, res) => res.send('Backend Pokédex vivo 🚀'));
app.get('/api/push', (req, res) => res.send('Backend Pokédex vivo 🚀'));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error.message);
    process.exit(1);
  }
};

startServer();
