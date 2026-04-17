const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  player1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player1Team: [{
    pokemonId: Number,
    pokemonName: String,
    stats: Object
  }],
  player2Team: [{
    pokemonId: Number,
    pokemonName: String,
    stats: Object
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  battleLog: [{
    turn: Number,
    action: String,
    player: Number,
    damage: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'ongoing', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Battle', battleSchema);
