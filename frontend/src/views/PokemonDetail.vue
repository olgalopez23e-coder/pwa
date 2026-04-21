<template>
  <div v-if="loading" class="loading-state">
    <div class="loader"></div>
    <p>Buscando datos del Pokémon...</p>
  </div>

  <div v-else-if="pokemon" class="pokemon-detail anim-fade-in">
    <div class="detail-container glass">
      
      <!-- Lado Izquierdo: Imagen y Tipos -->
      <div class="detail-header" :class="`type-bg-${pokemon.types[0]}`">
        <button @click="$router.back()" class="back-btn">
          <span class="back-icon">←</span> Volver
        </button>
        
        <div class="hero-image-container">
          <img :src="pokemon.image" :alt="pokemon.name" class="hero-image" />
        </div>
        <div class="header-content">
          <span class="header-id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
          <h1 class="hero-name">{{ pokemon.name }}</h1>
          <div class="pokemon-types hero-types">
            <span v-for="type in pokemon.types" :key="type" :class="['type-badge', `type-${type}`]" class="hero-type-badge">
              {{ type }}
            </span>
          </div>
        </div>
      </div>

      <!-- Lado Derecho: Info y Stats -->
      <div class="detail-body">
        <div class="detail-top">
          <div class="description-section">
            <h2 class="section-title">Descripción</h2>
            <p class="description">{{ pokemon.description }}</p>
          </div>
          <button @click="toggleFavorito" :class="['fav-action-btn', { 'is-fav': esFavorito }]">
            <span class="heart-icon">{{ esFavorito ? '❤️' : '🤍' }}</span>
            {{ esFavorito ? 'En Favoritos' : 'Añadir a Favoritos' }}
          </button>
        </div>

        <div class="detail-grid">
          <!-- Datos Básicos -->
          <div class="data-section">
            <h3 class="subsection-title">Ficha Técnica</h3>
            <div class="data-list card">
              <div class="data-row">
                <span class="label">Altura</span>
                <span class="value">{{ pokemon.height / 10 }} m</span>
              </div>
              <div class="data-row">
                <span class="label">Peso</span>
                <span class="value">{{ pokemon.weight / 10 }} kg</span>
              </div>
              <div class="data-row">
                <span class="label">Especie</span>
                <span class="value capitalize">{{ pokemon.species }}</span>
              </div>
              <div class="data-row">
                <span class="label">Habilidades</span> 
                <div class="abilities-list">
                  <div v-for="a in pokemon.abilities" :key="a.name" class="ability-tag capitalize">
                    {{ a.name }} <span v-if="a.isHidden" class="hidden-tag">Oculta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="stats-section">
            <h3 class="subsection-title">Estadísticas Base</h3>
            <div class="stats-card card">
              <div v-for="stat in pokemon.stats" :key="stat.name" class="stat-item">
                <div class="stat-head">
                  <span class="stat-label">{{ stat.name }}</span>
                  <span class="stat-value">{{ stat.value }}</span>
                </div>
                <div class="stat-track">
                  <div 
                    :style="{ width: `${(stat.value / 255) * 100}%`, backgroundColor: getStatColor(stat.name) }" 
                    class="stat-fill"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Línea Evolutiva -->
        <div v-if="pokemon.evolutionChain && pokemon.evolutionChain.length > 1" class="evolution-section">
          <h3 class="subsection-title">Línea Evolutiva</h3>
          <div class="evolution-row glass">
            <template v-for="(name, index) in pokemon.evolutionChain" :key="name">
              <div class="evolution-node" @click="$router.push(`/pokemon/${name}`)">
                <div class="evolution-img-wrap">
                  <img :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getEvolutionId(name)}.png`" class="evolution-img" />
                </div>
                <div class="evolution-name">{{ name }}</div>
              </div>
              <div v-if="index < pokemon.evolutionChain.length - 1" class="evolution-connector">
                <span class="arrow">➜</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const pokemon = ref(null);
const loading = ref(true);
const esFavorito = ref(false);

const fetchPokemon = async () => {
  loading.value = true;
  try {
    const { idOrName } = route.params;
    const res = await api.get(`/pokemon/${idOrName}`);
    pokemon.value = res.data;
    await checkFavorito();
  } catch (error) {
    console.error('Error al cargar detalles del pokémon:', error);
  } finally {
    loading.value = false;
  }
};

const checkFavorito = async () => {
  try {
    const res = await api.get('/favorites');
    esFavorito.value = res.data.favorites.some(f => f.pokemonId === pokemon.value.id);
  } catch (error) {
    console.warn('No se pudo verificar favoritos');
  }
};

const toggleFavorito = async () => {
  try {
    if (esFavorito.value) {
      await api.delete(`/favorites/${pokemon.value.id}`);
      esFavorito.value = false;
    } else {
      await api.post('/favorites', {
        pokemonId: pokemon.value.id,
        pokemonName: pokemon.value.name,
        pokemonData: { 
          image: pokemon.value.image,
          types: pokemon.value.types
        }
      });
      esFavorito.value = true;
    }
  } catch (error) {
    console.error('Error al cambiar favorito:', error);
  }
};

const getStatColor = (name) => {
  const colors = {
    hp: '#ff4422',
    attack: '#f08030',
    defense: '#f8d030',
    'special-attack': '#6890f0',
    'special-defense': '#78c850',
    speed: '#f85888'
  };
  return colors[name] || '#a8a878';
};

const getEvolutionId = (name) => {
  return name; 
};

// Recargar si cambia el parámetro de la ruta (navegación entre evoluciones)
watch(() => route.params.idOrName, () => {
  fetchPokemon();
});

onMounted(fetchPokemon);
</script>

<style scoped>
.loading-state {
  text-align: center;
  padding: 8rem 0;
  color: var(--color-text-muted);
}

.loader {
  width: 64px;
  height: 64px;
  border: 5px solid var(--color-bg-card);
  border-top: 5px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin: 0 auto 2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.anim-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-container {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  border-radius: 2rem;
  overflow: hidden;
  margin-top: 2rem;
}

.detail-header {
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
}

.back-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 2rem;
  cursor: pointer;
  font-weight: 700;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: translateX(-4px);
}

.hero-image-container {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image {
  width: 260px;
  height: 260px;
  object-fit: contain;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.4));
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.header-id {
  font-family: monospace;
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--color-text-muted);
  letter-spacing: 2px;
}

.hero-name {
  font-size: 3.5rem;
  font-weight: 900;
  text-transform: capitalize;
  color: var(--color-text-main);
  margin: 0.5rem 0 1.5rem;
  line-height: 1;
}

.hero-types {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.hero-type-badge {
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
}

.detail-body {
  padding: 3rem;
}

.detail-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.75rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
  font-weight: 800;
}

.description {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--color-text-main);
  max-width: 500px;
}

.fav-action-btn {
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  border: 2px solid var(--color-primary);
  background: transparent;
  color: var(--color-text-main);
  font-weight: 800;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
}

.fav-action-btn:hover {
  background: rgba(255, 77, 94, 0.1);
  transform: translateY(-2px);
}

.fav-action-btn.is-fav {
  background: var(--color-primary);
  color: white;
}

.subsection-title {
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  color: var(--color-text-muted);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 2.5rem;
}

.data-list, .stats-card {
  padding: 2rem;
}

.data-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.data-row:last-child {
  border-bottom: none;
}

.data-row .label {
  color: var(--color-text-muted);
  font-weight: 700;
}

.data-row .value {
  color: var(--color-text-main);
  font-weight: 800;
}

.abilities-list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.ability-tag {
  background: var(--color-bg-deep);
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.9rem;
}

.hidden-tag {
  font-size: 0.7rem;
  background: var(--color-secondary);
  color: white;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.stat-item {
  margin-bottom: 1.25rem;
}

.stat-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-text-muted);
}

.stat-value {
  font-weight: 900;
  color: var(--color-text-main);
}

.stat-track {
  height: 12px;
  background: var(--color-bg-deep);
  border-radius: 6px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.evolution-section {
  margin-top: 3.5rem;
}

.evolution-row {
  padding: 2rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1rem;
}

.evolution-node {
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
}

.evolution-node:hover {
  transform: translateY(-8px);
}

.evolution-img-wrap {
  width: 100px;
  height: 100px;
  background: var(--color-bg-deep);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border: 2px solid var(--color-border);
}

.evolution-node:hover .evolution-img-wrap {
  border-color: var(--color-primary);
  box-shadow: 0 0 20px rgba(255, 77, 94, 0.2);
}

.evolution-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.evolution-name {
  font-weight: 800;
  text-transform: capitalize;
}

.evolution-connector {
  color: var(--color-border);
  font-size: 1.5rem;
}

.capitalize { text-transform: capitalize; }

/* Backgrounds por tipo para la cabecera */
.type-bg-fire { background: linear-gradient(135deg, #421010 0%, #111827 100%); }
.type-bg-water { background: linear-gradient(135deg, #102a43 0%, #111827 100%); }
.type-bg-grass { background: linear-gradient(135deg, #103010 0%, #111827 100%); }
/* ... se pueden añadir más gradientes por cada tipo ... */

@media (max-width: 1100px) {
  .detail-container { grid-template-columns: 1fr; }
  .detail-header { border-right: none; border-bottom: 1px solid var(--color-border); padding: 3rem 1rem; }
  .hero-name { font-size: 2.75rem; }
}

@media (max-width: 768px) {
  .detail-body { padding: 2rem 1.5rem; }
  .detail-top { flex-direction: column; }
  .fav-action-btn { width: 100%; justify-content: center; }
  .detail-grid { grid-template-columns: 1fr; }
  .evolution-row { flex-direction: column; gap: 2rem; }
  .evolution-connector { transform: rotate(90deg); }
}
</style>
