<template>
  <div class="pokemon-card" @click="$emit('click', pokemon)" style="position: relative;">
    <!-- Botón de Favorito -->
    <button 
      class="fav-badge" 
      @click.stop="$emit('toggle-favorite', pokemon)"
      :title="isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'"
    >
      {{ isFavorite ? '❤️' : '⭐' }}
    </button>

    <img :src="pokemon.image || defaultImage" :alt="pokemon.name" class="pokemon-image" />
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

    <div style="margin-top: 1rem; display: flex; justify-content: center;">
      <router-link 
        :to="`/pokemon/${pokemon.id || pokemon.name}`" 
        class="nav-link" 
        style="color: #ffd6dc; font-size: 0.8rem; padding: 0.3rem 0.8rem; border: 1px solid var(--color-primary); border-radius: 20px; background: rgba(225,29,47,0.12);"
        @click.stop
      >
        Ver detalles
      </router-link>
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
.fav-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #0f1422;
  border: 1px solid #2f3a52;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  z-index: 2;
  font-size: 1.2rem;
}

.fav-badge:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.35);
}

.pokemon-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.pokemon-card:hover {
  transform: translateY(-5px);
}
</style>