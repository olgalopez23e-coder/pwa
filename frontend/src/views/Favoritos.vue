<template>
  <div class="favoritos-view">
    <header class="view-header" style="margin-bottom: 2rem;">
      <h1 style="font-size: 2.5rem; color: var(--color-primary); margin-bottom: 0.5rem;">Mis Favoritos</h1>
      <p style="color: var(--color-text-muted);">Pokémon que has marcado como preferidos.</p>
    </header>

    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <div class="loader" style="width: 50px; height: 50px; border: 5px solid #2a344b; border-top: 5px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: auto;"></div>
      <p style="margin-top: 1rem; color: var(--color-text-muted);">Cargando tus favoritos...</p>
    </div>

    <div v-else-if="favoritos.length === 0" style="text-align: center; padding: 5rem; background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border: 1px solid var(--color-border); border-radius: 20px; box-shadow: var(--shadow);">
      <span style="font-size: 4rem;">⭐</span>
      <h2 style="margin-top: 1rem; color: var(--color-text);">Aún no tienes favoritos</h2>
      <p style="color: var(--color-text-muted); margin-bottom: 2rem;">Explora la Pokédex y marca los que más te gusten.</p>
      <router-link to="/" class="nav-link" style="background: var(--color-primary); display: inline-block;">Explorar Pokédex</router-link>
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