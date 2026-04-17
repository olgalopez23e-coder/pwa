const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pokemonId: {
    type: Number,
    required: true
  },
  pokemonName: {
    type: String,
    required: true
  },
  pokemonData: {
    type: Object,
    default: {}
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Índice única combinación de usuario y pokémon
favoriteSchema.index({ userId: 1, pokemonId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
