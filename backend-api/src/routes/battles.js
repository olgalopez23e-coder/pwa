const express = require('express');
const { protect } = require('../middleware/auth');
const Battle = require('../models/Battle');
const User = require('../models/User');
const Team = require('../models/Team');
const Friend = require('../models/Friend');
const webpush = require('web-push');

// Configuración de web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:tu-email@ejemplo.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const router = express.Router();

// POST /api/battles/create - Crear nueva batalla (desafío)
router.post('/create', protect, async (req, res) => {
  try {
    const { friendId, player1TeamId, player2TeamId } = req.body;

    // Verificar que sean amigos
    const sonAmigos = await Friend.findOne({
      userId: req.userId,
      friendId
    });

    if (!sonAmigos) {
      return res.status(403).json({ error: 'Solo puedes batallar con amigos' });
    }

    // Obtener destinatario para notificación
    const rival = await User.findById(friendId);

    // Obtener equipos
    const equipoJugador1 = await Team.findOne({
      _id: player1TeamId,
      userId: req.userId
    });

    const equipoJugador2 = await Team.findOne({
      _id: player2TeamId,
      userId: friendId
    });

    if (!equipoJugador1 || !equipoJugador2) {
      return res.status(400).json({ error: 'Un equipo no fue encontrado' });
    }

    // Crear batalla
    const batalla = new Battle({
      player1Id: req.userId,
      player2Id: friendId,
      player1Team: equipoJugador1.pokemons,
      player2Team: equipoJugador2.pokemons,
      status: 'pending'
    });

    await batalla.save();

    // Notificación Push al rival
    if (rival && rival.pushSubscription) {
      const payload = JSON.stringify({
        title: '⚔️ ¡Nuevo Desafío!',
        body: `Has recibido un desafío de batalla.`
      });
      webpush.sendNotification(rival.pushSubscription, payload).catch(err => console.error('Error al enviar push batalla:', err));
    }

    res.status(201).json({
      message: 'Batalla creada',
      battle: batalla
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear batalla' });
  }
});

// GET /api/battles - Obtener batallas del usuario
router.get('/', protect, async (req, res) => {
  try {
    const batallas = await Battle.find({
      $or: [
        { player1Id: req.userId },
        { player2Id: req.userId }
      ]
    })
      .populate('player1Id', 'email username')
      .populate('player2Id', 'email username')
      .sort({ createdAt: -1 });

    res.json({ battles: batallas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener batallas' });
  }
});

// GET /api/battles/:id - Obtener detalles de batalla
router.get('/:id', protect, async (req, res) => {
  try {
    const batalla = await Battle.findById(req.params.id)
      .populate('player1Id', 'email username')
      .populate('player2Id', 'email username');

    if (!batalla) {
      return res.status(404).json({ error: 'Batalla no encontrada' });
    }

    res.json({ battle: batalla });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener batalla' });
  }
});

// POST /api/battles/:id/attack - Ejecutar ataque en batalla
router.post('/:id/attack', protect, async (req, res) => {
  try {
    const { attackerTeamIndex, defenderTeamIndex } = req.body;
    const batalla = await Battle.findById(req.params.id);

    if (!batalla) {
      return res.status(404).json({ error: 'Batalla no encontrada' });
    }

    if (batalla.status !== 'pending' && batalla.status !== 'ongoing') {
      return res.status(400).json({ error: 'La batalla ya ha terminado' });
    }

    // Determinar quién ataca
    const esJugador1 = batalla.player1Id.toString() === req.userId;
    const atacante = esJugador1 ? batalla.player1Team[attackerTeamIndex] : batalla.player2Team[attackerTeamIndex];
    const defensor = esJugador1 ? batalla.player2Team[defenderTeamIndex] : batalla.player1Team[defenderTeamIndex];

    if (!atacante || !defensor) {
      return res.status(400).json({ error: 'Pokémon inválido' });
    }

    // Calcular daño (simplificado)
    const ataque = Math.floor(Math.random() * 30) + 20;
    const defensa = Math.floor(Math.random() * 10) + 5;
    const daño = Math.max(1, ataque - defensa);

    // Registrar en log de batalla
    batalla.battleLog.push({
      turn: batalla.battleLog.length + 1,
      action: `${atacante.pokemonName} atacó a ${defensor.pokemonName}`,
      player: esJugador1 ? 1 : 2,
      damage: daño
    });

    batalla.status = 'ongoing';

    // Verificar si alguien ganó
    if (defenderTeamIndex === 0) {
      const equipoDefensor = esJugador1 ? batalla.player2Team : batalla.player1Team;
      if (equipoDefensor.length === 1) {
        batalla.status = 'completed';
        batalla.winner = esJugador1 ? batalla.player1Id : batalla.player2Id;
        batalla.completedAt = new Date();
      }
    }

    await batalla.save();

    res.json({
      message: 'Ataque ejecutado',
      battle: batalla
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al ejecutar ataque' });
  }
});

function calculateBattleWin(p1, p2) {
  // Simple logic based on attributes
  const score1 = (p1.stats?.find(s => s.name === 'attack')?.value || 50) +
                 (p1.stats?.find(s => s.name === 'speed')?.value || 50);
  const score2 = (p2.stats?.find(s => s.name === 'defense')?.value || 50) +
                 (p2.stats?.find(s => s.name === 'hp')?.value || 50);
  return score1 > score2;
}

module.exports = router;
