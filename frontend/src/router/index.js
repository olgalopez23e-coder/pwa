import { createRouter, createWebHistory } from 'vue-router';

const routes = [
 /* Rutas públicas{ 
    path: '/', 
    name: 'Home',
    component: () => import('../views/Home.vue')
  },*/
  { 
    path: '/pokemon/:idOrName', 
    name: 'PokemonDetail',
    component: () => import('../views/PokemonDetail.vue') 
  },
  { 
    path: '/favoritos', 
    name: 'Favoritos',
    component: () => import('../views/Favoritos.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/equipos', 
    name: 'Equipos',
    component: () => import('../views/Equipos.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/amigos', 
    name: 'Amigos',
    component: () => import('../views/Amigos.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/batallas', 
    name: 'Batallas',
    component: () => import('../views/Batallas.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/login', 
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  { 
    path: '/register', 
    name: 'Register',
    component: () => import('../views/Register.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de navegación
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;