import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(router)

app.mount('#app')

// ============================================
// REGISTRO DEL SERVICE WORKER
// ============================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('✅ Service Worker registrado correctamente');
      
      // Escuchar mensajes del SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SW_UPDATED') {
          console.log('🔄 Service Worker actualizado');
        } else if (event.data.type === 'REQUEST_SYNCED') {
          console.log('📤 Solicitud sincronizada:', event.data.url);
        }
      });
    })
    .catch(err => {
      console.error('❌ Error al registrar Service Worker:', err);
    });
} else {
  console.warn('⚠️ Service Workers no están soportados en este navegador');
}

// ============================================
// INICIALIZAR SUSCRIPCIONES A PUSH
// ============================================
import { subscribeUserToPush } from './services/notifications';

if ('serviceWorker' in navigator && 'PushManager' in window) {
  // No ejecutar inmediatamente, esperar a que el usuario inicie sesión
  window.addEventListener('auth-change', async () => {
    const isLoggedIn = !!localStorage.getItem('token');
    if (isLoggedIn) {
      try {
        await subscribeUserToPush();
        console.log('✅ Usuario suscrito a notificaciones push');
      } catch (err) {
        console.warn('⚠️ No se pudo suscribir a push:', err);
      }
    }
  });
}

console.log('🎮 PokéPWA inicializada correctamente');