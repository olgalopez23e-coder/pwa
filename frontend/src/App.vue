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
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.brand-shell {
  padding: 0.15rem;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-text-main);
  font-weight: 800;
  font-size: 1.5rem;
  transition: var(--transition);
}

.brand-link:hover {
  opacity: 0.9;
}

.brand-ball {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #ff9a95 0%, #ff3b30 45%, #b91c15 100%);
  border: 2px solid var(--color-text-main);
  box-shadow: 0 0 15px rgba(255, 59, 48, 0.4);
}

.pikachu-run {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 8px rgba(255, 214, 10, 0.5));
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text-muted);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  transition: var(--transition);
}

.nav-link:hover, .nav-link.router-link-active {
  color: var(--color-text-main);
  background: var(--color-bg-card);
}

.logout-btn {
  background: rgba(255, 77, 94, 0.1);
  color: #ff4d5e;
  border: 1px solid rgba(255, 77, 94, 0.3);
  cursor: pointer;
}

.logout-btn:hover {
  background: rgba(255, 77, 94, 0.2);
  border-color: #ff4d5e;
}

.register-btn {
  background: var(--color-primary) !important;
  color: white !important;
  border: none;
}

.register-btn:hover {
  background: var(--color-primary-hover) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 77, 94, 0.4);
}

.offline-banner {
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%);
  border: 1px solid #991b1b;
  box-shadow: var(--shadow-lg);
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.offline-text {
  margin: 0;
  color: #fecaca;
  font-weight: 700;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem 0;
    gap: 1.5rem;
  }

  .navbar-links {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .nav-link {
    font-size: 0.9rem;
    padding: 0.4rem 0.75rem;
  }
}
</style>