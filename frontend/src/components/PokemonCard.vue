<template>
  <div class="pokemon-card card" @click="$emit('click', pokemon)">
    <!-- Botón de Favorito -->
    <button 
      class="fav-btn" 
      @click.stop="$emit('toggle-favorite', pokemon)"
      :title="isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'"
    >
      <span v-if="isFavorite" class="heart-icon">❤️</span>
      <span v-else class="star-icon">⭐</span>
    </button>

    <div class="img-container">
      <img :src="pokemon.image || defaultImage" :alt="pokemon.name" class="pokemon-image" />
    </div>
    
    <div class="card-info">
      <span class="pokemon-id">#{{ String(pokemon.id).padStart(3, '0') }}</span>
      <h3 class="pokemon-name">{{ pokemon.name }}</h3>
      
      <div class="pokemon-types">
        <span 
          v-for="type in pokemon.types" 
          :key="type" 
          :class="['type-badge', `type-${type}`]"
        >
          {{ type }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  pokemon: {
    type: Object,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click', 'toggle-favorite']);

const defaultImage = computed(() => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${props.pokemon.id}.png`;
});
</script>

<style scoped>
.pokemon-card {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  overflow: hidden;
}

.fav-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: var(--color-bg-deep);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: var(--transition);
}

.fav-btn:hover {
  transform: scale(1.15);
  border-color: var(--color-primary);
  background: rgba(255, 77, 94, 0.1);
}

.img-container {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
  margin-bottom: 1rem;
}

.pokemon-image {
  width: 130px;
  height: 130px;
  object-fit: contain;
  transition: var(--transition);
  filter: drop-shadow(0 0 10px rgba(0,0,0,0.2));
}

.pokemon-card:hover .pokemon-image {
  transform: scale(1.1) translateY(-5px);
  filter: drop-shadow(0 15px 25px rgba(0,0,0,0.4));
}

.card-info {
  width: 100%;
  text-align: center;
}

.pokemon-id {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.pokemon-name {
  font-size: 1.35rem;
  color: var(--color-text-main);
  text-transform: capitalize;
  margin-bottom: 0.75rem;
  font-weight: 800;
}

.pokemon-types {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.type-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: white;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

/* Colores de tipos Pokémon */
.type-fire { background: #ff4422; box-shadow: 0 4px 12px rgba(255, 68, 34, 0.4); }
.type-water { background: #3399ff; box-shadow: 0 4px 12px rgba(51, 153, 255, 0.4); }
.type-grass { background: #77cc55; box-shadow: 0 4px 12px rgba(119, 204, 85, 0.4); }
.type-electric { background: #ffcc33; color: #333; }
.type-psychic { background: #ff5599; }
.type-ice { background: #66ccff; color: #333; }
.type-dragon { background: #7766ee; }
.type-dark { background: #775544; }
.type-fairy { background: #ee99ee; color: #333; }
.type-normal { background: #aaaa99; }
.type-fighting { background: #bb5544; }
.type-flying { background: #8899ff; }
.type-poison { background: #aa5599; }
.type-ground { background: #ddbb55; }
.type-rock { background: #bbaa66; }
.type-bug { background: #aabb22; }
.type-ghost { background: #6666bb; }
.type-steel { background: #aaaabb; }
</style>