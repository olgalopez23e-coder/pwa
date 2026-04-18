<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-brand brand-shell">
        <router-link to="/" class="brand-link">
          <span class="brand-ball" aria-hidden="true"></span>
          <span class="brand-text">PokéPWA</span>
          <img
            class="pikachu-run"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif"
            alt="Pikachu corriendo"
          />
        </router-link>
      </div>

      <div class="navbar-links links-shell">
        <router-link to="/" class="nav-link">Explorar</router-link>

        <div v-if="isLoggedIn" class="auth-links">
          <router-link to="/favoritos" class="nav-link">Favoritos</router-link>
          <router-link to="/equipos" class="nav-link">Equipos</router-link>
          <router-link to="/amigos" class="nav-link">Amigos</router-link>
          <router-link to="/batallas" class="nav-link">Batallas</router-link>
          <button @click="handleLogout" class="nav-link logout-btn">
            Salir
          </button>
        </div>

        <div v-else class="auth-links">
          <router-link to="/login" class="nav-link">Entrar</router-link>
          <router-link to="/register" class="nav-link register-btn">
            Unirse
          </router-link>
        </div>
      </div>
    </nav>

    <section v-if="isOffline" class="offline-banner" role="status" aria-live="polite">
      <img
        class="offline-ivysaur"
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/2.gif"
        alt="Ivysaur agarrando un cable"
      />
      <p class="offline-text">Se perdio la conexion, conectate para guardar cambios.</p>
    </section>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { requestNotificationPermission } from './services/notifications';

const router = useRouter();
const isLoggedIn = ref(!!localStorage.getItem('token'));
const isOffline = ref(false);

const handleOffline = () => {
  isOffline.value = true;
};

const handleOnline = () => {
  isOffline.value = false;
};

const updateAuth = () => {
  isLoggedIn.value = !!localStorage.getItem('token');
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateAuth();
  router.push('/login');
};

onMounted(async () => {
  window.addEventListener('auth-change', updateAuth);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);
  isOffline.value = !navigator.onLine;
  
  const granted = await requestNotificationPermission();
  if (granted) {
    console.log('Permiso de notificaciones concedido');
  }
});

onUnmounted(() => {
  window.removeEventListener('auth-change', updateAuth);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('online', handleOnline);
});
</script>

<style>
/* Navbar refinado para una estética Pokemon más moderna */
.brand-shell {
  padding: 0.15rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: var(--color-white);
  padding: 0.25rem 0.35rem;
}

.brand-ball {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ff9a95 0%, #ff3b30 45%, #b91c15 100%);
  border: 1.5px solid rgba(255, 214, 10, 0.9);
  box-shadow: 0 0 0 2px rgba(255, 214, 10, 0.18);
}

.brand-text {
  letter-spacing: 1px;
}

.pikachu-run {
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 6px rgba(255, 214, 10, 0.45));
}

.links-shell {
  padding: 0.2rem;
  border-radius: 12px;
  background: rgba(7, 14, 26, 0.22);
  display: flex;
  justify-content: center;
}

.nav-link {
  min-width: 82px;
  text-align: center;
}

.navbar {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.navbar-links {
  justify-content: center;
}

.logout-btn {
  background: rgba(255, 59, 48, 0.14);
  border: 1px solid rgba(255, 59, 48, 0.45);
  cursor: pointer;
}

.logout-btn:hover {
  background-color: rgba(255, 59, 48, 0.24) !important;
}

.register-btn {
  background: linear-gradient(135deg, #ffe072 0%, #ffd60a 100%) !important;
  color: #1b2a45 !important;
  border: 1px solid rgba(255, 214, 10, 0.95) !important;
}

.register-btn:hover {
  background: linear-gradient(135deg, #ffe98f 0%, #ffdf3c 100%) !important;
  color: #14213d !important;
}

.offline-banner {
  margin: 0.75rem auto 0;
  width: min(980px, calc(100% - 2rem));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 59, 48, 0.55);
  background: linear-gradient(90deg, rgba(86, 16, 16, 0.9) 0%, rgba(120, 18, 18, 0.9) 100%);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
}

.offline-ivysaur {
  width: 34px;
  height: 34px;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.35));
}

.offline-text {
  margin: 0;
  color: #ffe5e5;
  font-weight: 700;
  letter-spacing: 0.2px;
}

@media (max-width: 900px) {
  .navbar {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
  }

  .links-shell {
    width: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    justify-content: center;
  }

  .nav-link {
    min-width: 74px;
  }

  .offline-banner {
    margin-top: 0.55rem;
    width: calc(100% - 1rem);
    padding: 0.6rem 0.75rem;
    justify-content: flex-start;
  }

  .offline-text {
    font-size: 0.9rem;
    line-height: 1.25;
  }
}
</style>