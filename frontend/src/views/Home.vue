<template>
  <div class="home-view">
    <header class="view-header">
      <h1>Explorar Pokédex</h1>
      <p>Encuentra y colecciona todos tus Pokémon favoritos en esta PWA moderna.</p>
    </header>

    <!-- Dashboard de Filtros -->
    <section class="filters glass">
      <div class="search-box">
        <input 
          v-model="filters.name" 
          type="text" 
          placeholder="Nombre o ID del Pokémon..." 
          class="filter-input"
          @keyup.enter="handleSearch"
        />
        <button 
          @click="handleSearch" 
          class="search-btn"
          :disabled="loading"
        >
          <span>🔍</span> Buscar
        </button>
      </div>
      
      <div class="selectors-box">
        <select v-model="filters.type" class="filter-select" @change="handleSearch">
          <option value="">Todos los Tipos</option>
          <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
        </select>

        <select v-model="filters.region" class="filter-select" @change="handleSearch">
          <option value="">Todas las Regiones</option>
          <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
        </select>
      </div>
    </section>

    <!-- Grid de Resultados -->
    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
      <p>Buscando en la Pokédex...</p>
    </div>

    <div v-else-if="!pokemons || pokemons.length === 0" class="empty-state card">
      <span class="empty-icon">🚫</span>
      <h2>No se encontraron resultados</h2>
      <p>Intenta con otros términos o filtros.</p>
      <button @click="resetFilters" class="reset-btn">Ver todos los Pokémon</button>
    </div>

    <div v-else>
      <div class="results-meta">
        Mostrando {{ pokemons?.length || 0 }} Pokémon 
        <span v-if="totalResults > 0"> de {{ totalResults }}</span>
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
    <div v-if="!loading && pokemons?.length > 0 && totalResults > 20" class="pagination">
      <button 
        :disabled="offset === 0" 
        @click="changePage(-20)" 
        class="pagination-btn"
      >
        Anterior
      </button>
      
      <span class="page-info">{{ Math.floor(offset/20) + 1 }} / {{ Math.ceil(totalResults/20) }}</span>

      <button 
        :disabled="offset + 20 >= totalResults"
        @click="changePage(20)" 
        class="pagination-btn"
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
    types.value = res.data?.types || [];
  } catch (error) {
    console.error('Error al cargar tipos:', error);
  }
};

const fetchFavorites = async () => {
  try {
    const res = await api.get('/favorites');
    favorites.value = res.data?.favorites || [];
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
    pokemons.value = res.data?.pokemon || [];
    totalResults.value = res.data?.total || 1025;
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
.view-header {
  margin-bottom: 3rem;
  text-align: center;
}

.view-header h1 {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  text-shadow: 0 0 25px rgba(255, 77, 94, 0.3);
  font-weight: 900;
  letter-spacing: -1px;
}

.view-header p {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.filters {
  padding: 2.5rem;
  border-radius: 1.5rem;
  margin-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-box {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.filter-input {
  flex: 1;
  background: var(--color-bg-deep);
  border: 2px solid var(--color-border);
  color: var(--color-text-main);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  transition: var(--transition);
}

.filter-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(255, 77, 94, 0.15);
}

.search-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0 2rem;
  border-radius: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 77, 94, 0.3);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.selectors-box {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.filter-select {
  flex: 1;
  background: var(--color-bg-deep);
  border: 2px solid var(--color-border);
  color: var(--color-text-main);
  padding: 1rem;
  border-radius: 1rem;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
}

.filter-select:focus {
  border-color: var(--color-primary);
  outline: none;
}

.loader-container {
  text-align: center;
  padding: 6rem 0;
}

.loader {
  width: 64px;
  height: 64px;
  border: 5px solid var(--color-bg-card);
  border-top: 5px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.results-meta {
  margin-bottom: 2rem;
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.95rem;
}

.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.empty-icon {
  font-size: 5rem;
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.1));
}

.empty-state h2 {
  font-size: 2rem;
  color: var(--color-text-main);
}

.reset-btn {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.8rem 2rem;
  border-radius: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: var(--transition);
}

.reset-btn:hover {
  background: var(--color-primary);
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-top: 6rem;
  padding-bottom: 4rem;
}

.pagination-btn {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  padding: 0.8rem 2.5rem;
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(255, 77, 94, 0.05);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-weight: 800;
  color: var(--color-text-muted);
  font-family: monospace;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .selectors-box {
    flex-direction: column;
  }
  
  .view-header h1 {
    font-size: 2rem;
  }
  
  .filters {
    padding: 1.5rem;
  }
}
</style>