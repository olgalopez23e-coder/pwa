<template>
  <div class="equipos-view">
    <header class="view-header" style="margin-bottom: 2rem;">
      <h1 style="font-size: 2.5rem; color: var(--color-primary); margin-bottom: 0.5rem;">Mis Equipos</h1>
      <p style="color: var(--color-text-muted);">Crea equipos estratégicos de hasta 6 Pokémon.</p>
    </header>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
      <!-- Constructor de Equipo -->
      <section class="team-builder" style="background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border: 1px solid var(--color-border); padding: 2rem; border-radius: 20px; box-shadow: var(--shadow);">
        <h2 style="margin-bottom: 1.5rem; color: var(--color-text); border-bottom: 2px solid #2a344b; padding-bottom: 0.5rem;">Nuevo Equipo</h2>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: var(--color-text);">Nombre del Equipo</label>
          <input v-model="newTeamName" type="text" placeholder="Ej: Equipo Maestro" class="filter-input" style="width: 100%; border: 1px solid #2f3a52;" />
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: var(--color-text);">Pokémon Seleccionados ({{ selectedPokemons.length }}/6)</label>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; min-height: 100px; border: 2px dashed #2a344b; border-radius: 12px; padding: 1rem;">
            <div v-for="poke in selectedPokemons" :key="poke.id" style="position: relative; width: 60px; height: 60px; background: #0f1422; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid #2f3a52;">
              <img :src="poke.image" style="width: 50px; height: 50px;" />
              <button @click="removeFromTeam(poke)" style="position: absolute; -top: 5px; -right: 5px; background: var(--color-primary); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold;">×</button>
            </div>
            <div v-if="selectedPokemons.length === 0" style="color: var(--color-text-muted); margin: auto;">Selecciona de tus favoritos</div>
          </div>
        </div>

        <button @click="saveTeam" :disabled="!newTeamName || selectedPokemons.length === 0" class="nav-link" style="width: 100%; text-align: center; border: none; cursor: pointer; font-size: 1.1rem; padding: 1rem;" :style="{ opacity: (!newTeamName || selectedPokemons.length === 0) ? 0.5 : 1 }">
          Guardar Equipo
        </button>
      </section>

      <!-- Lista de Favoritos para Seleccionar -->
      <section class="favorites-selection">
        <h2 style="margin-bottom: 1.5rem; color: var(--color-text);">Tus Favoritos</h2>
        <div v-if="favoritos.length === 0" style="text-align: center; padding: 3rem; background: #121928; border: 1px solid #2a344b; border-radius: 20px; color: var(--color-text-muted);">
          <p>No tienes favoritos para agregar.</p>
          <router-link to="/" style="color: var(--color-primary);">Ir a explorar</router-link>
        </div>
        <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem; max-height: 600px; overflow-y: auto; padding-right: 0.5rem;">
          <div v-for="poke in favoritos" :key="poke.pokemonId" @click="addToTeam(poke)" 
               :class="{ 'already-selected': isSelected(poke.pokemonId) }" 
               style="background: #121928; border: 1px solid #2a344b; border-radius: 15px; padding: 1rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.25); cursor: pointer; transition: all 0.2s;"
               onmouseover="this.style.boxShadow='0 4px 8px rgba(0,0,0,0.1)';" 
               onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)';"
               :style="{ opacity: isSelected(poke.pokemonId) ? 0.4 : 1, pointerEvents: isSelected(poke.pokemonId) || selectedPokemons.length >= 6 ? 'none' : 'auto' }">
            <img :src="poke.pokemonData?.image" style="width: 70px; height: 70px;" />
            <div style="text-transform: capitalize; font-weight: bold; font-size: 0.9rem; color: var(--color-text);">{{ poke.pokemonName }}</div>
          </div>
        </div>
      </section>
    </div>

    <!-- Mis Equipos Guardados -->
    <section class="saved-teams" style="margin-top: 4rem;">
      <h2 style="margin-bottom: 1.5rem; color: var(--color-text);">Mis Equipos Guardados</h2>
      <div v-if="teams.length === 0" style="padding: 2rem; background: #121928; border: 1px solid #2a344b; border-radius: 20px; text-align: center; color: var(--color-text-muted);">
        Todavía no has creado ningún equipo.
      </div>
      <div v-else style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
        <div v-for="team in teams" :key="team._id" style="background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border: 1px solid var(--color-border); border-radius: 20px; padding: 1.5rem; box-shadow: var(--shadow); border-top: 8px solid var(--color-primary);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="text-transform: capitalize; color: var(--color-text);">{{ team.name }}</h3>
            <button @click="deleteTeam(team._id)" style="background: none; border: none; color: var(--color-text-muted); cursor: pointer;">🗑️</button>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <div v-for="poke in team.pokemons" :key="poke.pokemonId" style="width: 45px; height: 45px; background: #0f1422; border: 1px solid #2f3a52; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <img :src="poke.image" style="width: 40px; height: 40px;" :title="poke.name" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const favoritos = ref([]);
const teams = ref([]);
const newTeamName = ref('');
const selectedPokemons = ref([]);

const fetchFavoritos = async () => {
  try {
    const res = await api.get('/favorites');
    favoritos.value = res.data.favorites;
  } catch (error) {
    console.error('Error al cargar favoritos:', error);
  }
};

const fetchTeams = async () => {
  try {
    const res = await api.get('/teams');
    teams.value = res.data.teams;
  } catch (error) {
    console.error('Error al cargar equipos:', error);
  }
};

const addToTeam = (poke) => {
  if (selectedPokemons.value.length < 6 && !isSelected(poke.pokemonId)) {
    selectedPokemons.value.push({
      id: poke.pokemonId,
      name: poke.pokemonName,
      image: poke.pokemonData?.image
    });
  }
};

const removeFromTeam = (poke) => {
  selectedPokemons.value = selectedPokemons.value.filter(p => p.id !== poke.id);
};

const isSelected = (id) => {
  return selectedPokemons.value.some(p => p.id === id);
};

const saveTeam = async () => {
  try {
    await api.post('/teams', {
      name: newTeamName.value,
      pokemons: selectedPokemons.value.map(p => ({
        pokemonId: p.id,
        pokemonName: p.name,
        image: p.image
      }))
    });
    newTeamName.value = '';
    selectedPokemons.value = [];
    fetchTeams();
  } catch (error) {
    alert('Error al guardar equipo');
  }
};

const deleteTeam = async (id) => {
  if (confirm('¿Eliminar este equipo?')) {
    try {
      await api.delete(`/teams/${id}`);
      fetchTeams();
    } catch (error) {
      alert('Error al eliminar equipo');
    }
  }
};

onMounted(() => {
  fetchFavoritos();
  fetchTeams();
});
</script>

<style scoped>
.already-selected {
  cursor: not-allowed;
}
</style>