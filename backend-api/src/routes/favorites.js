const express = require('express');
const { protect } = require('../middleware/auth');
const Favorite = require('../models/Favorite');

const router = express.Router();

// POST /api/favorites - Agregar favorito
router.post('/', protect, async (req, res) => {
  try {
    const { pokemonId, pokemonName, pokemonData } = req.body;

    if (!pokemonId || !pokemonName) {
      return res.status(400).json({ error: 'pokemonId y pokemonName son requeridos' });
    }

    const pokemonIdNum = Number(pokemonId);
    if (Number.isNaN(pokemonIdNum)) {
      return res.status(400).json({ error: 'pokemonId debe ser un número válido' });
    }

    let favorito = await Favorite.findOne({
      userId: req.userId,
      pokemonId: pokemonIdNum
    });

    if (favorito) {
      // Ya existe: no es un error grave; devolvemos el favorito existente para llamadas idempotentes
      return res.status(200).json({
        message: 'Pokémon ya estaba en favoritos',
        favorite: favorito
      });
    }

    favorito = new Favorite({
      userId: req.userId,
      pokemonId: pokemonIdNum,
      pokemonName,
      pokemonData
    });

    await favorito.save();
    res.status(201).json({
      message: 'Pokémon agregado a favoritos',
      favorite: favorito
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar favorito' });
  }
});

// GET /api/favorites - Obtener todos los favoritos (opcionalmente filtrado por nombre)
router.get('/', protect, async (req, res) => {
  try {
    const { name } = req.query;
    const filter = { userId: req.userId };

    if (name) {
      filter.pokemonName = { $regex: name, $options: 'i' };
    }

    const favoritos = await Favorite.find(filter).sort({ addedAt: -1 });
    res.json({ favorites: favoritos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// DELETE /api/favorites/:pokemonId - Eliminar favorito
router.delete('/:pokemonId', protect, async (req, res) => {
  try {
    const { pokemonId } = req.params;
    const pokemonIdNum = Number(pokemonId);

    if (Number.isNaN(pokemonIdNum)) {
      return res.status(400).json({ error: 'pokemonId debe ser un número válido' });
    }

    const resultado = await Favorite.deleteOne({ 
      userId: req.userId, 
      pokemonId: pokemonIdNum 
    });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ error: 'Favorito no encontrado' });
    }

    res.json({ message: 'Favorito eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
});
module.exports = router;
