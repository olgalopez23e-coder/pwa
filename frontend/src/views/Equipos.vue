<template>
  <div class="equipos-view anim-fade-in">
    <header class="view-header">
      <h1>Mis Equipos</h1>
      <p>Diseña alineaciones estratégicas para tus batallas.</p>
    </header>

    <div class="teams-container">
      <!-- Constructor de Equipo -->
      <section class="team-builder card glass">
        <h2 class="section-title">Nuevo Equipo</h2>
        
        <div class="form-group">
          <label>Nombre del Equipo</label>
          <input 
            v-model="newTeamName" 
            type="text" 
            placeholder="Ej: Equipo Maestro" 
            class="auth-input" 
          />
        </div>

        <div class="selection-display">
          <label>Alineación ({{ selectedPokemons.length }}/6)</label>
          <div class="slots-container card">
            <div v-for="poke in selectedPokemons" :key="poke.id" class="poke-slot">
              <img :src="poke.image" class="slot-img" />
              <button @click="removeFromTeam(poke)" class="remove-slot-btn">×</button>
            </div>
            <div v-if="selectedPokemons.length === 0" class="empty-slots">
              Selecciona de tus favoritos
            </div>
          </div>
        </div>

        <button 
          @click="saveTeam" 
          :disabled="!newTeamName || selectedPokemons.length === 0" 
          class="save-team-btn"
        >
          Guardar Equipo
        </button>
      </section>

      <!-- Lista de Favoritos para Seleccionar -->
      <section class="favorites-selection">
        <h2 class="section-title">Tus Favoritos</h2>
        <div v-if="favoritos.length === 0" class="empty-favs card">
          <p>No tienes favoritos para agregar.</p>
          <router-link to="/" class="link-btn">Ir a explorar</router-link>
        </div>
        <div v-else class="favs-grid card">
          <div v-for="poke in favoritos" :key="poke.pokemonId" @click="addToTeam(poke)" 
               :class="['fav-pick', { 'already-selected': isSelected(poke.pokemonId) }, { 'full-team': selectedPokemons.length >= 6 }]">
            <img :src="poke.pokemonData?.image" class="fav-pick-img" />
            <div class="fav-pick-name">{{ poke.pokemonName }}</div>
          </div>
        </div>
      </section>
    </div>

    <!-- Mis Equipos Guardados -->
    <section class="saved-teams-section">
      <h2 class="section-title">Equipos Guardados</h2>
      <div v-if="teams.length === 0" class="empty-saved card">
        Todavía no has creado ningún equipo experto.
      </div>
      <div v-else class="teams-grid">
        <div v-for="team in teams" :key="team._id" class="team-result-card card">
          <div class="team-card-header">
            <h3>{{ team.name }}</h3>
            <button @click="deleteTeam(team._id)" class="delete-team-btn" title="Eliminar equipo">🗑️</button>
          </div>
          <div class="team-pokemons">
            <div v-for="poke in team.pokemons" :key="poke.pokemonId" class="team-poke-icon card">
              <img :src="poke.image" :title="poke.name" />
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
    console.warn('No se pudo cargar favoritos');
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
  if (confirm('¿Deseas eliminar este equipo?')) {
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
.equipos-view {
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
}

.view-header p {
  color: var(--color-text-muted);
  font-size: 1.1rem;
}

.teams-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 5rem;
}

.section-title {
  font-size: 1.5rem;
  color: var(--color-text-main);
  margin-bottom: 2rem;
  font-weight: 800;
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
}

.team-builder {
  padding: 2.5rem;
  border-radius: 20px;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.auth-input {
  width: 100%;
  background: var(--color-bg-deep);
  border: 2px solid var(--color-border);
  color: var(--color-text-main);
  padding: 1rem;
  border-radius: 1rem;
  font-size: 1rem;
  transition: var(--transition);
}

.auth-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.selection-display label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.slots-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  min-height: 120px;
  background: var(--color-bg-deep);
  padding: 1.5rem;
  border-radius: 1rem;
  border: 2px dashed var(--color-border);
}

.poke-slot {
  position: relative;
  width: 70px;
  height: 70px;
  background: var(--color-bg-card);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.slot-img {
  width: 60px;
  height: 60px;
}

.remove-slot-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  box-shadow: 0 2px 8px rgba(255, 77, 94, 0.4);
}

.empty-slots {
  color: var(--color-text-muted);
  margin: auto;
  font-weight: 600;
}

.save-team-btn {
  width: 100%;
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1.25rem;
  border-radius: 1rem;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 2rem;
}

.save-team-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}

.save-team-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.favs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
}

.fav-pick {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
}

.fav-pick:hover:not(.already-selected):not(.full-team) {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.fav-pick.already-selected {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(1);
}

.fav-pick.full-team {
  cursor: not-allowed;
}

.fav-pick-img {
  width: 80px;
  height: 80px;
}

.fav-pick-name {
  text-transform: capitalize;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-text-main);
  margin-top: 0.5rem;
}

.saved-teams-section {
  padding-bottom: 6rem;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.team-result-card {
  padding: 2rem;
  border-top: 10px solid var(--color-primary);
}

.team-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.team-card-header h3 {
  font-size: 1.5rem;
  color: var(--color-text-main);
}

.delete-team-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  filter: grayscale(1);
  transition: var(--transition);
}

.delete-team-btn:hover {
  filter: grayscale(0);
  transform: scale(1.2);
}

.team-pokemons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.team-poke-icon {
  width: 55px;
  height: 55px;
  background: var(--color-bg-deep);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-poke-icon img {
  width: 50px;
  height: 50px;
}

.anim-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 980px) {
  .teams-container { grid-template-columns: 1fr; }
}
</style>


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