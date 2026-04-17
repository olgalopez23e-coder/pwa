require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemonpru';
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');

    // Eliminar documentos de Friend sin friendId válido
    const result = await mongoose.connection.collection('friends').deleteMany({
      $or: [
        { friendId: null },
        { friendId: { $exists: false } },
        { userId: null }
      ]
    });

    console.log(`🗑️  Documentos eliminados: ${result.deletedCount}`);

    // Eliminar cualquier índice antiguo de friendCode y limpiar el campo
    await mongoose.connection.collection('friends').dropIndex('friendCode_1').catch(() => null);
    await mongoose.connection.collection('friends').updateMany(
      { friendCode: { $exists: true } },
      { $unset: { friendCode: '' } }
    );
    console.log('🧹 Campo friendCode eliminado y índice antiguo borrado');

    // Recrear índices
    await mongoose.connection.collection('friends').dropIndex('userId_1_friendId_1').catch(() => null);
    await mongoose.connection.collection('friends').createIndex({ userId: 1, friendId: 1 }, { unique: true });
    console.log('🔧 Índices recreados');

    console.log('✨ Limpieza completada');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupDatabase();
