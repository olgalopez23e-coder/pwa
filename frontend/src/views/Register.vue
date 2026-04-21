<template>
  <div class="auth-container">
    <div class="auth-card card glass">
      <div class="auth-header">
        <h1>Únete a la Aventura</h1>
        <p>Crea tu cuenta de Entrenador Pokémon</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Nombre de Usuario</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="Red, Ash, Misty..." 
            required 
            class="auth-input" 
          />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="entrenador@pokemon.com" 
            required 
            class="auth-input" 
          />
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            class="auth-input" 
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" :disabled="loading" class="auth-submit-btn">
          {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
        </button>

        <p class="auth-footer">
          ¿Ya tienes cuenta? <router-link to="/login">Inicia Sesión</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }
  
  loading.value = true;
  error.value = '';
  try {
    const res = await api.post('/auth/register', {
      email: email.value,
      password: password.value
    });
    
    // Guardar token y usuario
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al registrarse';
  } finally {
    loading.value = false;
  }
};
</script>
