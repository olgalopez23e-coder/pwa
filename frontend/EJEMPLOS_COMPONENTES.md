# 💻 Ejemplos de Componentes - PWA Pokédex

Aquí encontrarás componentes Vue listos para usar en tu aplicación.

---

## 📌 Ejemplo 1: Card con Estado Offline

```vue
<template>
  <div class="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
        <p class="mt-2 text-gray-600">{{ description }}</p>
      </div>
      
      <!-- Indicador de estado -->
      <div v-if="!isOnline" class="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
        <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
        <span class="text-xs text-orange-700">Offline</span>
      </div>
    </div>

    <!-- Contenido -->
    <div class="mt-4">
      <slot></slot>
    </div>

    <!-- Acciones -->
    <div class="mt-4 flex gap-2">
      <button 
        @click="handlePrimary"
        :disabled="!isOnline && requiresConnection"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isOnline ? 'Enviar' : 'Pendiente' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useOffline } from '@/composables/useOffline'

defineProps({
  title: String,
  description: String,
  requiresConnection: { type: Boolean, default: false }
})

const { isOnline } = useOffline()

const handlePrimary = () => {
  if (isOnline.value) {
    emit('action');
  }
}

const emit = defineEmits(['action'])
</script>
```

**Uso:**
```vue
<OfflineCard title="Buscar Pokémon" description="Consulta el listado" :requires-connection="true">
  <input type="text" placeholder="Nombre del Pokémon...">
</OfflineCard>
```

---

## 📌 Ejemplo 2: Banner de Sincronización

```vue
<template>
  <transition name="slide-down">
    <div v-if="showSyncBanner" class="fixed top-0 left-0 right-0 z-50">
      <div class="bg-blue-500 text-white px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="animate-spin h-5 w-5" v-if="isSyncing" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSyncing ? 'Sincronizando cambios...' : 'Cambios pendientes' }}</span>
        </div>
        
        <button @click="syncNow" :disabled="isSyncing" class="px-4 py-1 bg-white text-blue-500 rounded hover:bg-blue-50 disabled:opacity-50 font-semibold">
          {{ isSyncing ? 'Sincronizando...' : 'Sincronizar ahora' }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOffline } from '@/composables/useOffline'

const { isOnline, isSyncing, syncData } = useOffline()

const hasPendingChanges = ref(false)
const showSyncBanner = computed(() => hasPendingChanges.value && !isOnline.value)

const syncNow = async () => {
  await syncData()
  hasPendingChanges.value = false
}

// Exponer para que otros componentes puedan marcar cambios
defineExpose({
  markAsChanged: () => {
    hasPendingChanges.value = true
  }
})
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
```

---

## 📌 Ejemplo 3: Tabla de Pokémon con Estado Offline

```vue
<template>
  <div class="overflow-x-auto">
    <!-- Notificación offline -->
    <div v-if="!isOnline" class="mb-4 p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
      <p class="text-orange-700 font-semibold">⚠️ Modo Offline</p>
      <p class="text-sm text-orange-600">Viendo datos en caché. Los datos nuevos aparecerán cuando vuelva la conexión.</p>
    </div>

    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-100 border-b">
          <th class="px-4 py-2 text-left">Nombre</th>
          <th class="px-4 py-2 text-left">Tipo</th>
          <th class="px-4 py-2 text-left">Nivel</th>
          <th class="px-4 py-2 text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pokemon in pokemon" :key="pokemon.id" class="border-b hover:bg-gray-50">
          <td class="px-4 py-2">
            <div class="flex items-center gap-2">
              <img :src="pokemon.image" :alt="pokemon.name" class="w-8 h-8">
              <span>{{ pokemon.name }}</span>
            </div>
          </td>
          <td class="px-4 py-2">
            <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
              {{ pokemon.type }}
            </span>
          </td>
          <td class="px-4 py-2">{{ pokemon.level }}</td>
          <td class="px-4 py-2 text-center">
            <button 
              @click="selectPokemon(pokemon)"
              :disabled="!isOnline"
              class="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
            >
              Ver detalles
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useOffline } from '@/composables/useOffline'

defineProps({
  pokemon: {
    type: Array,
    default: () => []
  }
})

const { isOnline } = useOffline()
const emit = defineEmits(['select'])

const selectPokemon = (pokemon) => {
  if (isOnline.value) {
    emit('select', pokemon)
  }
}
</script>
```

---

## 📌 Ejemplo 4: Formulario con Guardado Offline

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 max-w-md">
    <!-- Input de email -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input 
        v-model="form.email" 
        type="email" 
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
    </div>

    <!-- Input de nombre -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
      <input 
        v-model="form.name" 
        type="text"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
    </div>

    <!-- Alerta offline -->
    <div v-if="!isOnline" class="p-3 bg-yellow-50 border border-yellow-200 rounded">
      <p class="text-sm text-yellow-700">
        📴 <strong>Sin conexión</strong> - Los cambios se guardarán localmente y se sincronizarán después.
      </p>
    </div>

    <!-- Botón enviar -->
    <button 
      type="submit"
      :disabled="isSubmitting"
      class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 font-semibold transition"
    >
      {{ isSubmitting ? '⏳ Guardando...' : isOnline ? 'Guardar' : '💾 Guardar localmente' }}
    </button>

    <!-- Mensaje de éxito -->
    <transition name="fade">
      <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded">
        <p class="text-sm text-green-700">✅ {{ successMessage }}</p>
      </div>
    </transition>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useOffline } from '@/composables/useOffline'

const { isOnline, syncData } = useOffline()

const form = reactive({
  email: '',
  name: ''
})

const isSubmitting = ref(false)
const successMessage = ref('')

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    if (isOnline.value) {
      // Enviar al servidor
      await new Promise(resolve => setTimeout(resolve, 1000))
      successMessage.value = 'Datos guardados en el servidor'
    } else {
      // Guardar localmente con IndexedDB o localStorage
      localStorage.setItem('pendingForm', JSON.stringify(form))
      successMessage.value = 'Datos guardados localmente. Se sincronizarán después.'
    }
    
    // Limpiar formulario
    form.email = ''
    form.name = ''
    
    // Ocultar mensaje
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error:', error)
    successMessage.value = 'Error al guardar. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 📌 Ejemplo 5: Status Badge

```vue
<template>
  <div :class="['px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1', statusClass]">
    <div :class="['w-2 h-2 rounded-full', indicatorClass]"></div>
    {{ statusText }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useOffline } from '@/composables/useOffline'

const { isOnline, isSyncing } = useOffline()

const statusClass = computed(() => {
  if (!isOnline.value) return 'bg-orange-100 text-orange-700'
  if (isSyncing.value) return 'bg-blue-100 text-blue-700'
  return 'bg-green-100 text-green-700'
})

const indicatorClass = computed(() => {
  if (!isOnline.value) return 'bg-orange-500 animate-pulse'
  if (isSyncing.value) return 'bg-blue-500 animate-sync'
  return 'bg-green-500'
})

const statusText = computed(() => {
  if (!isOnline.value) return 'Offline'
  if (isSyncing.value) return 'Sincronizando...'
  return 'Online'
})
</script>
```

**Uso:**
```vue
<!-- En cualquier componente -->
<StatusBadge />
```

---

## 📌 Ejemplo 6: Modal de Confirmación Offline

```vue
<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <span class="text-xl">📴</span>
        </div>
        <h2 class="text-lg font-bold">Modo Offline</h2>
      </div>

      <p class="text-gray-600 mb-6">
        {{ message || 'Esta acción requiere conexión a internet. ¿Deseas intentar de nuevo?' }}
      </p>

      <div class="flex gap-2">
        <button 
          @click="onCancel"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button 
          @click="onRetry"
          :disabled="isRetrying"
          class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {{ isRetrying ? 'Reintentando...' : 'Reintentar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  isOpen: Boolean,
  message: String
})

const emit = defineEmits(['retry', 'cancel'])
const isRetrying = ref(false)

const onRetry = async () => {
  isRetrying.value = true
  emit('retry')
  setTimeout(() => {
    isRetrying.value = false
  }, 1000)
}

const onCancel = () => {
  emit('cancel')
}
</script>
```

---

## 🚀 Cómo Usar estos Ejemplos

1. **Copiar el código** del componente que necesites
2. **Guardar en `src/components/`** con un nombre descriptivo
3. **Importar en tus vistas:**

```vue
<script setup>
import OfflineCard from '@/components/OfflineCard.vue'
import SyncBanner from '@/components/SyncBanner.vue'
import PokemonTable from '@/components/PokemonTable.vue'
</script>

<template>
  <SyncBanner />
  <div class="space-y-4">
    <OfflineCard title="Buscar" description="Encuentra Pokémon">
      <!-- contenido -->
    </OfflineCard>
  </div>
</template>
```

---

## 📦 Tamaño de Componentes

| Componente | Líneas | Complejidad |
|-----------|--------|-----------|
| StatusBadge | 30 | ⭐ Simple |
| OfflineCard | 50 | ⭐⭐ Media |
| SyncBanner | 60 | ⭐⭐ Media |
| PokemonTable | 70 | ⭐⭐ Media |
| OfflineForm | 100 | ⭐⭐⭐ Alta |
| OfflineModal | 50 | ⭐⭐ Media |

---

**Documentación actualizada:** 05/02/2026
