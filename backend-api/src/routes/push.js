const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// POST /api/push/subscribe - Guardar suscripción del usuario
router.post('/subscribe', protect, async (req, res) => {
  try {
    const subscription = req.body;
    
    await User.findByIdAndUpdate(req.userId, {
      pushSubscription: subscription
    });
    
    res.status(200).json({ message: 'Suscripción guardada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar suscripción' });
  }
});

// GET /api/push/public-key - Obtener clave pública VAPID
router.get('/public-key', (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!publicKey) {
    console.warn('⚠️ [Backend] Se solicitó la clave VAPID pero no está configurada en .env');
    return res.status(404).send('Clave VAPID no configurada');
  }

  console.log('🔑 [Backend] Enviando clave pública VAPID');
  res.set('Content-Type', 'text/plain');
  res.send(publicKey);
});

module.exports = router;
