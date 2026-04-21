<template>
  <div class="favoritos-view anim-fade-in">
    <header class="view-header">
      <h1>Mis Favoritos</h1>
      <p>Tu colección personal de Pokémon destacados.</p>
    </header>

    <div v-if="loading" class="loader-container">
      <div class="loader"></div>
      <p>Cargando tus favoritos...</p>
    </div>

    <div v-else-if="favoritos.length === 0" class="empty-state card glass">
      <span class="empty-icon">❤️</span>
      <h2>Aún no tienes favoritos</h2>
      <p>Explora la Pokédex y captura a tus preferidos para verlos aquí.</p>
      <router-link to="/" class="explore-btn">Explorar Pokédex</router-link>
    </div>

    <div v-else class="pokemon-grid">
      <PokemonCard 
        v-for="fav in favoritos" 
        :key="fav.pokemonId" 
        :pokemon="formatFavorite(fav)"
        :is-favorite="true"
        @toggle-favorite="handleRemoveFavorite"
      />
    </div>
  </div>
</template>

<style scoped>
.favoritos-view {
  min-height: 80vh;
}

.view-header {
  text-align: center;
  margin-bottom: 4rem;
}

.view-header h1 {
  font-size: 3rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(255, 77, 94, 0.2);
}

.view-header p {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.loader-container {
  text-align: center;
  padding: 5rem 0;
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid var(--color-bg-card);
  border-top: 5px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.empty-icon {
  font-size: 5rem;
  filter: drop-shadow(0 0 15px rgba(255,255,255,0.1));
}

.empty-state h2 {
  font-size: 2rem;
  color: var(--color-text-main);
}

.explore-btn {
  background: var(--color-primary);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 1rem;
  text-decoration: none;
  font-weight: 800;
  transition: var(--transition);
}

.explore-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 77, 94, 0.3);
}

.anim-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>


<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import PokemonCard from '../components/PokemonCard.vue';

const favoritos = ref([]);
const loading = ref(true);

const fetchFavoritos = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    loading.value = false;
    return;
  }
  
  loading.value = true;
  try {
    const res = await api.get('/favorites');
    favoritos.value = res.data.favorites;
  } catch (error) {
    console.error('Error al cargar favoritos:', error);
  } finally {
    loading.value = false;
  }
};

const handleRemoveFavorite = async (pokemon) => {
  try {
    // En la vista de favoritos, el pokemon tiene el formato de formatFavorite
    await api.delete(`/favorites/${pokemon.id}`);
    favoritos.value = favoritos.value.filter(f => f.pokemonId !== pokemon.id);
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
  }
};

const formatFavorite = (fav) => {
  return {
    id: fav.pokemonId,
    name: fav.pokemonName,
    image: fav.pokemonData?.image,
    types: fav.pokemonData?.types || []
  };
};

onMounted(fetchFavoritos);
</script>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>