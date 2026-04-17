<template>
  <div class="home-view">
    <header class="view-header" style="margin-bottom: 2rem;">
      <h1 style="font-size: 2.3rem; color: #ff4d5e; margin-bottom: 0.8rem; text-shadow: 0 0 18px rgba(225,29,47,0.25);">Explorar Pokédex</h1>
      <p style="color: var(--color-text-muted);">Encuentra y colecciona todos tus Pokémon favoritos.</p>
    </header>

    <!-- Dashboard de Filtros -->
    <section class="filters" style="background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border: 1px solid var(--color-border); padding: 2rem; border-radius: 20px; box-shadow: var(--shadow); margin-bottom: 3rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
      <div style="flex: 2; display: flex; gap: 0.5rem; min-width: 300px;">
        <input 
          v-model="filters.name" 
          type="text" 
          placeholder="Ej: 'pika', 'char', '1'..." 
          class="filter-input"
          style="flex: 1; border-radius: 12px; padding: 0.8rem 1.2rem; border: 2px solid #2f3a52; outline: none; transition: border-color 0.3s;"
          @keyup.enter="handleSearch"
        />
        <button 
          @click="handleSearch" 
          class="nav-link" 
          style="background: var(--color-primary); border: none; padding: 0.8rem 1.5rem; border-radius: 12px; cursor: pointer; color: white; font-weight: bold; display: flex; align-items: center; gap: 0.5rem;"
          :disabled="loading"
        >
          <span>🔍</span> Buscar
        </button>
      </div>
      
      <div style="flex: 1; display: flex; gap: 1rem; min-width: 300px;">
        <select v-model="filters.type" class="filter-select" style="flex: 1; padding: 0.8rem; border-radius: 12px; border: 2px solid #2f3a52;" @change="handleSearch">
          <option value="">Todos los Tipos</option>
          <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
        </select>

        <select v-model="filters.region" class="filter-select" style="flex: 1; padding: 0.8rem; border-radius: 12px; border: 2px solid #2f3a52;" @change="handleSearch">
          <option value="">Todas las Regiones</option>
          <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
        </select>
      </div>
    </section>

    <!-- Grid de Resultados -->
    <div v-if="loading" style="text-align: center; padding: 5rem;">
      <div class="loader" style="width: 60px; height: 60px; border: 6px solid #2a344b; border-top: 6px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: auto;"></div>
      <p style="margin-top: 1.5rem; font-size: 1.2rem; color: var(--color-text-muted);">Buscando en la Pokédex...</p>
    </div>

    <div v-else-if="pokemons.length === 0" style="text-align: center; padding: 5rem; background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border: 1px solid var(--color-border); border-radius: 20px;">
      <span style="font-size: 4rem;">🚫</span>
      <h2 style="margin-top: 1rem; color: #f2f5ff;">No se encontraron resultados</h2>
      <p style="color: var(--color-text-muted);">Intenta con otros términos o filtros.</p>
      <button @click="resetFilters" style="margin-top: 1.5rem; color: var(--color-primary); background: none; border: 2px solid var(--color-primary); padding: 0.8rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: bold;">Ver todos los Pokémon</button>
    </div>

    <div v-else>
      <div style="margin-bottom: 1.5rem; color: var(--color-text-muted); font-size: 0.9rem;">
        Mostrando {{ pokemons.length }} Pokémon 
        <span v-if="totalResults > 0">(Total encontrados: {{ totalResults }})</span>
      </div>
      
      <div class="pokemon-grid">
        <PokemonCard 
          v-for="poke in pokemons" 
          :key="poke.id" 
          :pokemon="poke"
          :is-favorite="isFavorite(poke.id)"
          @click="goToDetail(poke)"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>
    </div>

    <!-- Paginación Mejorada -->
    <div v-if="!loading && pokemons.length > 0 && totalResults > 20" style="display: flex; justify-content: center; align-items: center; gap: 2rem; margin-top: 4rem;">
      <button 
        :disabled="offset === 0" 
        @click="changePage(-20)" 
        class="nav-link" 
        style="width: 150px; text-align: center; border: none;"
        :style="{ opacity: offset === 0 ? 0.5 : 1, cursor: offset === 0 ? 'default' : 'pointer', background: 'var(--color-primary)' }"
      >
        Anterior
      </button>
      
      <span style="font-weight: bold; color: var(--color-text-muted);">{{ Math.floor(offset/20) + 1 }} / {{ Math.ceil(totalResults/20) }}</span>

      <button 
        :disabled="offset + 20 >= totalResults"
        @click="changePage(20)" 
        class="nav-link" 
        style="width: 150px; text-align: center; border: none;"
        :style="{ opacity: offset + 20 >= totalResults ? 0.5 : 1, cursor: offset + 20 >= totalResults ? 'default' : 'pointer', background: 'var(--color-primary)' }"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import PokemonCard from '../components/PokemonCard.vue';

const router = useRouter();
const pokemons = ref([]);
const types = ref([]);
const favorites = ref([]);
const loading = ref(true);
const offset = ref(0);
const totalResults = ref(0);

const filters = reactive({
  name: '',
  type: '',
  region: ''
});

const regions = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];

const fetchTypes = async () => {
  try {
    const res = await api.get('/pokemon/types/list');
    types.value = res.data.types;
  } catch (error) {
    console.error('Error al cargar tipos:', error);
  }
};

const fetchFavorites = async () => {
  try {
    const res = await api.get('/favorites');
    favorites.value = res.data.favorites;
  } catch (error) {
    console.warn('No se pudieron cargar favoritos');
  }
};

const fetchPokemons = async () => {
  loading.value = true;
  try {
    const params = {
      limit: 20,
      offset: offset.value,
      name: filters.name || undefined,
      type: filters.type || undefined,
      region: filters.region || undefined
    };
    
    const res = await api.get('/pokemon', { params });
    pokemons.value = res.data.pokemon;
    totalResults.value = res.data.total || 1025;
  } catch (error) {
    console.error('Error al cargar pokémon:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  offset.value = 0;
  fetchPokemons();
};

const handleToggleFavorite = async (pokemon) => {
  const favorite = favorites.value.find(f => f.pokemonId === pokemon.id);
  
  try {
    if (favorite) {
      await api.delete(`/favorites/${pokemon.id}`);
      favorites.value = favorites.value.filter(f => f.pokemonId !== pokemon.id);
    } else {
      const newFav = {
        pokemonId: pokemon.id,
        pokemonName: pokemon.name,
        pokemonData: { 
          image: pokemon.image,
          types: pokemon.types
        }
      };
      await api.post('/favorites', newFav);
      favorites.value.push(newFav);
    }
  } catch (error) {
    console.error('Error al cambiar favorito:', error);
  }
};

const isFavorite = (id) => {
  return favorites.value.some(f => f.pokemonId === id);
};

const goToDetail = (poke) => {
  router.push(`/pokemon/${poke.id}`);
};

const changePage = (diff) => {
  offset.value = Math.max(0, offset.value + diff);
  fetchPokemons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetFilters = () => {
  filters.name = '';
  filters.type = '';
  filters.region = '';
  offset.value = 0;
  fetchPokemons();
};

onMounted(() => {
  fetchTypes();
  fetchFavorites();
  fetchPokemons();
});
</script>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.filter-input:focus {
  border-color: var(--color-primary) !important;
}

.filter-select:focus {
  border-color: var(--color-primary) !important;
  outline: none;
}
</style>