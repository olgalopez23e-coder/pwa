const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Verificar si el usuario ya existe
    let usuario = await User.findOne({ email });
    if (usuario) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    usuario = new User({
      email,
      password,
      username: email.split('@')[0],
      friendCode: uuidv4().split('-')[0].toUpperCase()
    });

    await usuario.save();

    const token = generateToken(usuario._id);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: usuario.toJSON()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const esValido = await usuario.comparePassword(password);
    if (!esValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(usuario._id);
    res.json({
      message: 'Sesión iniciada',
      token,
      user: usuario.toJSON()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/auth/me - Obtener datos del usuario autenticado
router.get('/me', protect, async (req, res) => {
  try {
    const usuario = await User.findById(req.userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario.toJSON());
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
