const express = require('express');
const axios = require('axios');
const router = express.Router();

const POKEAPI_URL = process.env.POKEAPI_URL || 'https://pokeapi.co/api/v2';

// Lista de Pokémon de emergencia (por si la API falla o está lenta)
const fallbackPokemon = [
  { id: 1, name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1' },
  { id: 4, name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4' },
  { id: 7, name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7' },
  { id: 25, name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25' },
  { id: 133, name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon/133' },
  { id: 150, name: 'mewtwo', url: 'https://pokeapi.co/api/v2/pokemon/150' },
  { id: 6, name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6' },
  { id: 3, name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3' },
  { id: 9, name: 'blastoise', url: 'https://pokeapi.co/api/v2/pokemon/9' },
  { id: 39, name: 'jigglypuff', url: 'https://pokeapi.co/api/v2/pokemon/39' },
  { id: 52, name: 'meowth', url: 'https://pokeapi.co/api/v2/pokemon/52' },
  { id: 1, name: 'bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', types: ['grass', 'poison'] },
  { id: 4, name: 'charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', types: ['fire'] },
  { id: 7, name: 'squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', types: ['water'] },
  { id: 25, name: 'pikachu', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', types: ['electric'] },
  { id: 6, name: 'charizard', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', types: ['fire', 'flying'] },
  { id: 133, name: 'eevee', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', types: ['normal'] },
  { id: 150, name: 'mewtwo', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', types: ['psychic'] },
  { id: 3, name: 'venusaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png', types: ['grass', 'poison'] },
  { id: 9, name: 'blastoise', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png', types: ['water'] },
  { id: 39, name: 'jigglypuff', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png', types: ['normal', 'fairy'] }
];

let masterPokemonList = fallbackPokemon.map(p => ({
  id: p.id,
  name: p.name,
  url: `${POKEAPI_URL}/pokemon/${p.id}`,
  isFallback: true,
  ...p
}));
let isInitialised = false;
let isRefreshing = false;

// Inicializar la lista maestra al arrancar (o primer uso)
async function initMasterList() {
  if (isRefreshing || (isInitialised && masterPokemonList.length > 22)) return;
  
  isRefreshing = true;
  try {
    console.log('📡 [Backend] Solicitando lista maestra completa a PokéAPI...');
    const { data } = await axios.get(`${POKEAPI_URL}/pokemon?limit=1025`, { timeout: 8000 });
    
    if (data && data.results && data.results.length > 0) {
      // Solo sobreescribimos si recibimos datos reales
      masterPokemonList = data.results.map((p, index) => ({
        id: index + 1,
        name: p.name,
        url: p.url,
        isFallback: false
      }));
      isInitialised = true;
      console.log(`✅ [Backend] Lista maestra actualizada: ${masterPokemonList.length} pokémon.`);
    } else {
      throw new Error('La API respondió con una lista vacía');
    }
  } catch (error) {
    console.error('⚠️ [Backend] No se pudo actualizar la lista completa, manteniendo lista de emergencia:', error.message);
    // IMPORTANTE: Si falla, NO vaciamos masterPokemonList, se queda con los fallbacks
    if (masterPokemonList.length === 0) {
      masterPokemonList = [...fallbackPokemon];
    }
  } finally {
    isRefreshing = false;
  }
}

// Iniciar carga en segundo plano
initMasterList();

// GET /api/pokemon/types/list - Obtener lista de tipos
router.get('/types/list', async (req, res) => {
  try {
    const { data } = await axios.get(`${POKEAPI_URL}/type`);
    res.json({ types: data.results.map(t => t.name) });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos' });
  }
});

// GET /api/pokemon - Obtener lista de pokémon con filtros inteligentes
router.get('/', async (req, res) => {
  try {
    await initMasterList(); // Asegurar inicialización
    const { limit = 20, offset = 0, name, type, region } = req.query;

    let filteredList = [...masterPokemonList];

    // 1. Filtrar por NOMBRE (Búsqueda Parcial)
    if (name) {
      const searchTerm = name.toLowerCase();
      filteredList = filteredList.filter(p => 
        p.name.includes(searchTerm) || p.id.toString() === searchTerm
      );
    }

    // 2. Filtrar por REGIÓN (Rango de IDs)
    if (region) {
      const regions = {
        kanto: { min: 1, max: 151 },
        johto: { min: 152, max: 251 },
        hoenn: { min: 252, max: 386 },
        sinnoh: { min: 387, max: 493 },
        unova: { min: 494, max: 649 },
        kalos: { min: 650, max: 721 },
        alola: { min: 722, max: 809 },
        galar: { min: 810, max: 898 },
        paldea: { min: 899, max: 1025 }
      };
      const range = regions[region.toLowerCase()];
      if (range) {
        filteredList = filteredList.filter(p => p.id >= range.min && p.id <= range.max);
      }
    }

    // 3. Paginación ANTES de obtener detalles (para evitar 1000 requests)
    const paginated = filteredList.slice(Number(offset), Number(offset) + Number(limit));

    // 4. Obtener DETALLES de los resultados paginados
    console.log(`🔍 [Backend] Procesando detalles para ${paginated.length} pokémon...`);
    let pokemonDetails = await Promise.all(
      paginated.map(async (p) => {
        // Si ya es un dato de emergencia completo, lo usamos directamente
        if (p.isFallback) return p;
        
        try {
          const { data } = await axios.get(p.url, { timeout: 4000 });
          return {
            id: data.id,
            name: data.name,
            image: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default,
            types: data.types.map(t => t.type.name),
            height: data.height,
            weight: data.weight,
            stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat }))
          };
        } catch (e) {
          console.error(`⚠️ Error al obtener detalle de ${p.name}, usando datos parciales:`, e.message);
          return p.id ? p : null;
        }
      })
    );
    pokemonDetails = pokemonDetails.filter(p => p !== null);

    // Formatear respuesta (ya vienen formateados o son fallbacks)
    const formatted = pokemonDetails.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
      types: p.types || ['unknown'],
      height: p.height || 0,
      weight: p.weight || 0,
      stats: p.stats || []
    }));

    res.json({ 
      pokemon: formatted,
      total: filteredList.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pokémon' });
  }
});

// GET /api/pokemon/:idOrName - Obtener detalles de un pokémon
router.get('/:idOrName', async (req, res) => {
  try {
    const { idOrName } = req.params;
    const { data: pokemon } = await axios.get(`${POKEAPI_URL}/pokemon/${idOrName.toLowerCase()}`);
    
    // Obtener información de la especie (para línea evolutiva y descripción)
    const { data: species } = await axios.get(pokemon.species.url);
    const { data: evolution } = await axios.get(species.evolution_chain.url);

    const detalles = {
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default,
      types: pokemon.types.map(t => t.type.name),
      height: pokemon.height,
      weight: pokemon.weight,
      abilities: pokemon.abilities.map(a => ({
        name: a.ability.name,
        isHidden: a.is_hidden
      })),
      stats: pokemon.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      moves: pokemon.moves.slice(0, 10).map(m => m.move.name),
      species: species.name,
      description: species.flavor_text_entries
        .find(e => e.language.name === 'es')?.flavor_text || 'Sin descripción',
      evolutionChain: extractEvolutionChain(evolution.chain)
    };

    res.json(detalles);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Pokémon no encontrado' });
  }
});

function extractEvolutionChain(chain) {
  const evolutions = [];
  function traverse(node) {
    evolutions.push(node.species.name);
    if (node.evolves_to.length > 0) {
      node.evolves_to.forEach(child => traverse(child));
    }
  }
  traverse(chain);
  return evolutions;
}

module.exports = router;
