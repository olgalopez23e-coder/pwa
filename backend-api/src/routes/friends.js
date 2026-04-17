const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { protect } = require('../middleware/auth');
const Friend = require('../models/Friend');
const User = require('../models/User');

//24¿
const webpush = require('web-push');

// Las claves VAPID deben estar en el .env. Aquí solo configuramos si están disponibles.
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:tu-email@ejemplo.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const router = express.Router();
// POST /api/friends/add-by-code - Agregar amigo por código
router.post('/add-by-code', protect, async (req, res) => {
  try {
    const { friendCode } = req.body;

    if (!friendCode) {
      return res.status(400).json({ error: 'El código de amigo es requerido' });
    }

    // Buscar el usuario que tiene ese código
    const userWithCode = await User.findOne({ friendCode });

    if (!userWithCode) {
      return res.status(404).json({ error: 'Código de amigo inválido' });
    }

    // Verificar que no sea el propio código
    if (userWithCode._id.toString() === req.userId) {
      return res.status(400).json({ error: 'No puedes agregarte a ti mismo' });
    }

    // Verificar si ya son amigos (en cualquier dirección)
    const existente = await Friend.findOne({
      $or: [
        { userId: req.userId, friendId: userWithCode._id },
        { userId: userWithCode._id, friendId: req.userId }
      ]
    });

    if (existente) {
      return res.status(400).json({ error: 'Ya son amigos' });
    }

    // Crear registro de amistad bidireccional
    const amistadNew1 = new Friend({
      userId: req.userId,
      friendId: userWithCode._id,
      status: 'accepted'
    });

    const amistadNew2 = new Friend({
      userId: userWithCode._id,
      friendId: req.userId,
      status: 'accepted'
    });

    await amistadNew1.save();
    await amistadNew2.save();

    const usuarioActual = await User.findById(req.userId);

    // Enviar notificación push al amigo (opcional)
    if (userWithCode && userWithCode.pushSubscription && usuarioActual) {
      const payload = JSON.stringify({
        title: '¡Nueva Amistad!',
        body: `Ahora eres amigo de ${usuarioActual.username}`
      });
      webpush.sendNotification(userWithCode.pushSubscription, payload).catch(err => console.error('Error al enviar push:', err));
    }

    res.status(201).json({
      message: 'Amigo agregado exitosamente',
      friend: {
        id: userWithCode._id,
        email: userWithCode.email,
        username: userWithCode.username
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar amigo', detail: error.message });
  }
});

// POST /api/friends/generate-code - Obtener código personal (no regenerar)
router.post('/generate-code', protect, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si no tiene código aún (usuarios antiguos), generar uno
    if (!usuario.friendCode) {
      usuario.friendCode = uuidv4().split('-')[0].toUpperCase();
      await usuario.save();
    }

    res.json({
      message: 'Código obtenido',
      friendCode: usuario.friendCode
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener código' });
  }
});

// GET /api/friends - Obtener lista de amigos
router.get('/', protect, async (req, res) => {
  try {
    const amigos = await Friend.find({
      userId: req.userId,
      status: 'accepted'
    }).populate('friendId', 'email username');

    // Obtener el código de amigo del usuario
    const usuario = await User.findById(req.userId);

    res.json({
      friends: amigos.map(a => ({
        id: a.friendId._id,
        email: a.friendId.email,
        username: a.friendId.username
      })),
      myFriendCode: usuario ? usuario.friendCode : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener amigos' });
  }
});

// DELETE /api/friends/:friendId - Eliminar amigo
router.delete('/:friendId', protect, async (req, res) => {
  try {
    const { friendId } = req.params;

    await Friend.deleteMany({
      $or: [
        { userId: req.userId, friendId },
        { userId: friendId, friendId: req.userId }
      ]
    });

    res.json({ message: 'Amigo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar amigo' });
  }
});

module.exports = router;
