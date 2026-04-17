<template>
  <div class="auth-view" style="max-width: 420px; margin: 4rem auto; padding: 2rem; background: linear-gradient(170deg, #161d2d 0%, #111827 100%); border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--color-border);">
    <h1 style="text-align: center; color: #ff4d5e; margin-bottom: 2rem; text-shadow: 0 0 16px rgba(225,29,47,0.25);">Iniciar Sesión</h1>
    
    <form @submit.prevent="handleLogin" style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="form-group">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: var(--color-text);">Email</label>
        <input v-model="email" type="email" placeholder="entrenador@pokemon.com" required class="filter-input" style="width: 100%;" />
      </div>
      
      <div class="form-group">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; color: var(--color-text);">Contraseña</label>
        <input v-model="password" type="password" placeholder="••••••••" required class="filter-input" style="width: 100%;" />
      </div>

      <div v-if="error" style="color: var(--color-primary); font-size: 0.9rem; text-align: center;">{{ error }}</div>

      <button type="submit" :disabled="loading" class="nav-link" style="width: 100%; border: none; cursor: pointer; text-align: center; padding: 1rem;">
        {{ loading ? 'Iniciando...' : 'Entrar' }}
      </button>

      <p style="text-align: center; color: var(--color-text-muted); font-size: 0.9rem;">
        ¿No tienes cuenta? <router-link to="/register" style="color: var(--color-primary); text-decoration: none;">Regístrate</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });
    
    // Guardar token y usuario
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
};
</script>
