<template>
  <div class="amigos-view">
    <header class="view-header" style="margin-bottom: 2rem;">
      <h1 style="font-size: 2.5rem; color: var(--color-primary); margin-bottom: 0.5rem;">Mis Amigos</h1>
      <p style="color: var(--color-text-muted);">Conecta con otros entrenadores para combatir y compartir.</p>
    </header>

    <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 3rem;">
      <!-- Mi Código y Agregar Amigo -->
      <section style="display: flex; flex-direction: column; gap: 2rem;">
        <div class="my-code-card" style="background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border: 1px solid var(--color-border); padding: 2rem; border-radius: 20px; box-shadow: var(--shadow); text-align: center;">
          <h2 style="margin-bottom: 1rem; color: var(--color-text);">Mi Código de Amigo</h2>
          <div v-if="myFriendCode" style="font-size: 2rem; font-weight: bold; padding: 1rem; background: #0f1422; border-radius: 12px; border: 2px dashed var(--color-primary); color: var(--color-primary); letter-spacing: 5px; margin-bottom: 1rem;">
            {{ myFriendCode }}
          </div>
          <button @click="generateCode" class="nav-link" style="width: 100%; border: none; cursor: pointer;">{{ myFriendCode ? 'Regenerar Código' : 'Generar mi código' }}</button>
          <p v-if="myFriendCode" style="font-size: 0.8rem; color: var(--color-text-muted);">Comparte este código para que te agreguen.</p>
        </div>

        <div class="add-friend-card" style="background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border: 1px solid var(--color-border); padding: 2rem; border-radius: 20px; box-shadow: var(--shadow);">
          <h2 style="margin-bottom: 1.5rem; color: var(--color-text);">Agregar Amigo</h2>
          <div style="display: flex; gap: 0.5rem;">
            <input v-model="friendCodeInput" type="text" placeholder="Código de 8 dígitos" class="filter-input" style="flex: 1; text-transform: uppercase;" maxlength="8" />
            <button @click="addFriendByCode" :disabled="!friendCodeInput || friendCodeInput.length < 4" class="nav-link" style="border: none; cursor: pointer;" :style="{ opacity: (!friendCodeInput || friendCodeInput.length < 4) ? 0.5 : 1 }">Agregar</button>
          </div>
          <p v-if="addError" style="color: var(--color-primary); font-size: 0.9rem; margin-top: 0.5rem;">{{ addError }}</p>
        </div>
      </section>

      <!-- Lista de Amigos -->
      <section class="friends-list" style="background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border: 1px solid var(--color-border); padding: 2rem; border-radius: 20px; box-shadow: var(--shadow);">
        <h2 style="margin-bottom: 1.5rem; color: var(--color-text); border-bottom: 2px solid #2a344b; padding-bottom: 0.5rem;">Lista de Amigos ({{ friends?.length || 0 }})</h2>
        
        <div v-if="loading" style="text-align: center; padding: 3rem;">
          <div class="loader" style="width: 40px; height: 40px; border: 4px solid #2a344b; border-top: 4px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: auto;"></div>
        </div>

        <div v-else-if="!friends || friends.length === 0" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">
          <span style="font-size: 3rem;">👋</span>
          <p style="margin-top: 1rem;">Aún no tienes amigos agregados.</p>
        </div>

        <div v-else style="display: flex; flex-direction: column; gap: 1rem;">
          <div v-for="friend in friends" :key="friend.id" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: #0f1422; border-radius: 12px; border: 1px solid #2a344b;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 45px; height: 45px; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">
                {{ friend.username?.[0]?.toUpperCase() || '?' }}
              </div>
              <div>
                <div style="font-weight: bold; font-size: 1.1rem; color: var(--color-text);">{{ friend.username }}</div>
                <div style="color: var(--color-text-muted); font-size: 0.8rem;">{{ friend.email }}</div>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button @click="inviteToBattle(friend)" class="nav-link" style="background: #1f2a40; border: 1px solid #36415a; cursor: pointer; padding: 0.4rem 0.8rem; font-size: 0.8rem;">Batallar ⚔️</button>
              <button @click="removeFriend(friend.id)" style="background: #1b2233; border: 1px solid #36415a; border-radius: 8px; cursor: pointer; padding: 0.4rem 0.6rem; color: var(--color-text);">🗑️</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const friends = ref([]);
const loading = ref(true);
const myFriendCode = ref(localStorage.getItem('myFriendCode') || '');
const friendCodeInput = ref('');
const addError = ref('');

const fetchFriends = async () => {
  loading.value = true;
  try {
    const res = await api.get('/friends');
    friends.value = res.data?.friends || [];
    if (res.data.myFriendCode && !myFriendCode.value) {
      myFriendCode.value = res.data.myFriendCode;
      localStorage.setItem('myFriendCode', myFriendCode.value);
    }
  } catch (error) {
    console.error('Error al cargar amigos:', error);
  } finally {
    loading.value = false;
  }
};

const generateCode = async () => {
  try {
    const res = await api.post('/friends/generate-code');
    myFriendCode.value = res.data.friendCode;
    localStorage.setItem('myFriendCode', myFriendCode.value);
  } catch (error) {
    alert('Error al generar código');
  }
};

const addFriendByCode = async () => {
  addError.value = '';
  try {
    const res = await api.post('/friends/add-by-code', { 
      friendCode: friendCodeInput.value.toUpperCase() 
    });
    alert(res.data.message);
    friendCodeInput.value = '';
    fetchFriends();
  } catch (error) {
    addError.value = error.response?.data?.error || 'Error al agregar amigo';
  }
};

const removeFriend = async (id) => {
  if (confirm('¿Eliminar de tu lista de amigos?')) {
    try {
      await api.delete(`/friends/${id}`);
      fetchFriends();
    } catch (error) {
      alert('Error al eliminar amigo');
    }
  }
};

const inviteToBattle = (friend) => {
  // Redirigir a batalla con este amigo o abrir un selector de equipo
  alert(`Invitación de batalla enviada a ${friend.username} (Simulación)`);
};

onMounted(() => {
  fetchFriends();
  // Si no tenemos código, intentamos obtenerlo del perfil si ya existe en DB
  if (!myFriendCode.value) {
    api.get('/friends').then(res => {
        // En un sistema real, el código vendría con el perfil o habría un endpoint dedicado
    });
  }
});
</script>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>