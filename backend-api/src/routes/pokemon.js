const express = require('express');
const axios = require('axios');
const router = express.Router();

const POKEAPI_URL = process.env.POKEAPI_URL || 'https://pokeapi.co/api/v2';

// Caché en memoria para la lista maestra de nombres
let masterPokemonList = [];
let isInitialised = false;

// Inicializar la lista maestra al arrancar (o primer uso)
async function initMasterList() {
  if (isInitialised && masterPokemonList.length > 0) return;
  try {
    console.log('📡 [Backend] Solicitando lista maestra a PokéAPI...');
    const { data } = await axios.get(`${POKEAPI_URL}/pokemon?limit=1025`, { timeout: 10000 });
    masterPokemonList = data.results.map((p, index) => ({
      id: index + 1,
      name: p.name,
      url: p.url
    }));
    isInitialised = true;
    console.log(`✅ [Backend] Lista maestra cargada con ${masterPokemonList.length} pokémon.`);
  } catch (error) {
    console.error('❌ [Backend] Error al cargar lista maestra:', error.message);
    // No marcamos como inicializado para reintentar en la próxima petición
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

    console.log(`🔍 [Backend] Obteniendo detalles para ${paginated.length} pokémon...`);
    let pokemonDetails = await Promise.all(
      paginated.map(async (p) => {
        try {
          const { data } = await axios.get(p.url, { timeout: 5000 });
          return data;
        } catch (e) {
          console.error(`⚠️ Error al obtener detalle de ${p.name}:`, e.message);
          return null;
        }
      })
    );
    pokemonDetails = pokemonDetails.filter(p => p !== null);

    // 5. Filtrar por TIPO (Si se requiere, sobre los detalles obtenidos)
    // Nota: El tipo es el único filtro que requiere detalles previos, o una llamada extra.
    // Para eficiencia, si el usuario selecciona SOLO tipo, podríamos usar axios.get(`${POKEAPI_URL}/type/${type}`)
    if (type && !name && !region) {
       const { data } = await axios.get(`${POKEAPI_URL}/type/${type.toLowerCase()}`);
       const typePokemonUrls = data.pokemon.map(p => p.pokemon.url);
       // Filtrar masterList por estas URLs y aplicar offset/limit
       const typeList = masterPokemonList.filter(p => typePokemonUrls.includes(p.url));
       const paginatedType = typeList.slice(Number(offset), Number(offset) + Number(limit));
       
       pokemonDetails = await Promise.all(
         paginatedType.map(p => axios.get(p.url).then(r => r.data))
       );
    } else if (type) {
      // Filtro combinado: ya tenemos detalles paginados, filtramos localmente
      pokemonDetails = pokemonDetails.filter(p => 
        p.types.some(t => t.type.name.toLowerCase() === type.toLowerCase())
      );
    }

    // Formatear respuesta
    const formatted = pokemonDetails.map(p => ({
      id: p.id,
      name: p.name,
      image: p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default,
      types: p.types.map(t => t.type.name),
      height: p.height,
      weight: p.weight,
      stats: p.stats.map(s => ({ name: s.stat.name, value: s.base_stat }))
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
