const express = require('express');
const { protect } = require('../middleware/auth');
const Team = require('../models/Team');

const router = express.Router();

// POST /api/teams - Crear equipo
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, pokemons } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del equipo es requerido' });
    }

    if (pokemons && pokemons.length > 6) {
      return res.status(400).json({ error: 'Un equipo puede tener máximo 6 pokémon' });
    }

    const team = new Team({
      userId: req.userId,
      name,
      description: description || '',
      pokemons: pokemons || []
    });

    await team.save();
    res.status(201).json({
      message: 'Equipo creado exitosamente',
      team
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear equipo' });
  }
});

// GET /api/teams - Obtener todos los equipos del usuario
router.get('/', protect, async (req, res) => {
  try {
    const teams = await Team.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

// GET /api/teams/:id - Obtener equipo específico
router.get('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json({ team });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipo' });
  }
});

// PUT /api/teams/:id - Actualizar equipo
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, pokemons } = req.body;

    if (pokemons && pokemons.length > 6) {
      return res.status(400).json({ error: 'Un equipo puede tener máximo 6 pokémon' });
    }

    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        $set: {
          name: name || undefined,
          description: description !== undefined ? description : undefined,
          pokemons: pokemons || undefined,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json({
      message: 'Equipo actualizado',
      team
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar equipo' });
  }
});

// DELETE /api/teams/:id - Eliminar equipo
router.delete('/:id', protect, async (req, res) => {
  try {
    const resultado = await Team.deleteOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    res.json({ message: 'Equipo eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar equipo' });
  }
});

module.exports = router;
