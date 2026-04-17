require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

async function addMissingFriendCodes() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pokemonpru';
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');

    const User = require('./src/models/User');

    // Encontrar usuarios sin friendCode
    const usuariosSinCodigo = await User.find({ $or: [{ friendCode: null }, { friendCode: { $exists: false } }] });
    console.log(`📊 Usuarios sin código: ${usuariosSinCodigo.length}`);

    for (let usuario of usuariosSinCodigo) {
      usuario.friendCode = uuidv4().split('-')[0].toUpperCase();
      await usuario.save();
      console.log(`✅ ${usuario.email}: ${usuario.friendCode}`);
    }

    console.log('✨ Actualización completada');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addMissingFriendCodes();
