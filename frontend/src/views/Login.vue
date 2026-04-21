<template>
  <div class="auth-container">
    <div class="auth-card card glass">
      <div class="auth-header">
        <h1>Iniciar Sesión</h1>
        <p>¡Bienvenido de nuevo, Entrenador!</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
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
          {{ loading ? 'Iniciando...' : 'Entrar' }}
        </button>

        <p class="auth-footer">
          ¿No tienes cuenta? <router-link to="/register">Regístrate</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 3rem 2.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-header h1 {
  font-size: 2.25rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-weight: 900;
}

.auth-header p {
  color: var(--color-text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 700;
  color: var(--color-text-main);
  font-size: 0.9rem;
  padding-left: 0.25rem;
}

.auth-input {
  background: var(--color-bg-deep);
  border: 2px solid var(--color-border);
  color: var(--color-text-main);
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  font-size: 1rem;
  transition: var(--transition);
}

.auth-input:focus {
  border-color: var(--color-secondary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
}

.error-message {
  color: var(--color-primary);
  background: rgba(255, 77, 94, 0.1);
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  text-align: center;
  border: 1px solid rgba(255, 77, 94, 0.2);
}

.auth-submit-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 1rem;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 1rem;
}

.auth-submit-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 77, 94, 0.3);
}

.auth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-top: 1rem;
}

.auth-footer a {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: 700;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>


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
