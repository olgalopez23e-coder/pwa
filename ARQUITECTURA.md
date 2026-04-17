# 🏗️ ARQUITECTURA - Pokédex PWA

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (Cliente)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          Vue 3 + Vite (Puerto 5173)                        │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  views/         router/         composables/         │  │ │
│  │  ├─ HomeView.vue   ├─ index.js     ├─ useAuth.js        │  │ │
│  │  ├─ LoginView.vue  └─ Guards       ├─ usePokemon.js     │  │ │
│  │  ├─ RegisterView   (Protección)    ├─ useFavorites.js   │  │ │
│  │  ├─ PokemonList                    ├─ useTeams.js       │  │ │
│  │  ├─ FavoritesView                  ├─ useFriends.js     │  │ │
│  │  ├─ TeamsView                      └─ useBattles.js     │  │ │
│  │  ├─ FriendsView                                         │  │ │
│  │  └─ BattlesView                                         │  │ │
│  │                                                          │  │ │
│  │  services/api.js (Axios HTTP Client)                     │  │ │
│  └──────────────────────────────────────────────────────────┘  │ │
│                          │                                      │ │
│     ┌────────────────────┼────────────────────┐                │ │
│     │    localStorage    │                    │                │ │
│     ├─ authToken        │                    │                │ │
│     └─ user             │                    │                │ │
│                         ▼                    ▼                │ │
└─────────────────────────────────────────────────────────────────┘
                          │
              HTTP Requests │ (Bearer Token)
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌─────────────────────────────────┐  ┌──────────────────┐
│  Node.js + Express              │  │   PokeAPI        │
│  (Puerto 5000)                  │  │ (Datos Pokémon)  │
│  ┌─────────────────────────────┐│  └──────────────────┘
│  │      routes/                 ││
│  ├─ auth.js (3 endpoints)       ││
│  ├─ pokemon.js (3 endpoints)    ││  
│  ├─ favorites.js (3 endpoints)  ││
│  ├─ teams.js (5 endpoints)      ││
│  ├─ friends.js (4 endpoints)    ││
│  └─ battles.js (4 endpoints)    ││
│                                  │
│  middleware/                    │
│  └─ auth.js (JWT Validation)    │
│                                  │
│  models/                        │
│  ├─ User.js                     │
│  ├─ Favorite.js                 │
│  ├─ Team.js                     │
│  ├─ Friend.js                   │
│  └─ Battle.js                   │
│                                  │
│  index.js (Server Setup)        │
└─────────────────────────────────┘
        │
        │ Mongoose ODM
        │
        ▼
┌─────────────────────────────────┐
│      MongoDB                     │
│  (Local o MongoDB Atlas)        │
│  ┌─────────────────────────────┐│
│  │ Database: pokemon-app        ││
│  ├─ users_collection            ││
│  ├─ favorites_collection        ││
│  ├─ teams_collection            ││
│  ├─ friends_collection          ││
│  └─ battles_collection          ││
│                                  │
└─────────────────────────────────┘
```

---

## Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                    │
└─────────────────────────────────────────────────────────────┘

1. REGISTRO
   Usuario ingresa email/password
   │
   ▼
   POST /api/auth/register
   {email: "user@test.com", password: "123456"}
   │
   ▼
   Backend:
   - Validar email
   - Hash password con bcrypt
   - Crear usuario en MongoDB
   - Generar JWT token
   │
   ▼
   Response: {token: "jwt...", user: {...}}
   │
   ▼
   Frontend:
   - Guardar token en localStorage
   - Guardar usuario en localStorage
   - Redirigir a /pokemon
   │
   ▼
   isAuthenticated = true ✅

2. LOGIN
   Usuario ingresa email/password
   │
   ▼
   POST /api/auth/login
   │
   ▼
   Backend:
   - Buscar usuario por email
   - Comparar password con hash
   - Si coincide: generar JWT
   │
   ▼
   Response: {token: "jwt...", user: {...}}
   │
   ▼
   Frontend: (Igual que registro)
   │
   ▼
   Acceso a rutas protegidas ✅

3. REQUESTS AUTENTICADOS
   GET /api/favorites
   │
   ▼
   Frontend agrega header:
   Authorization: Bearer <token>
   │
   ▼
   Backend middleware:
   - Extraer token del header
   - Verificar con JWT_SECRET
   - Si válido: continuar
   - Si inválido: error 401
   │
   ▼
   req.userId disponible ✅
   │
   ▼
   Operación completada

4. LOGOUT
   Click en botón "Salir"
   │
   ▼
   - Limpiar localStorage
   - isAuthenticated = false
   - Redirigir a /login
```

---

## Flujo de Datos - Favoritos

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE FAVORITOS                        │
└─────────────────────────────────────────────────────────────┘

AGREGAR A FAVORITOS:

PokemonDetailView.vue
│
├─ Click en "Agregar a favoritos"
│
├─ useFavorites.addFavorite()
│
├─ POST /api/favorites
│  {pokemonId: 25, pokemonName: "pikachu", pokemonData: {...}}
│
├─ Backend:
│  ├─ Verificar autenticación
│  ├─ Crear Favorite document
│  ├─ Guardar en MongoDB
│  └─ Retornar documento
│
├─ Frontend:
│  ├─ Guardar en estado local
│  └─ Actualizar UI (❤️)
│
└─ Estado sincronizado ✅


VER FAVORITOS:

FavoritesView.vue
│
├─ onMounted() → loadFavorites()
│
├─ GET /api/favorites
│  (Bearer token en header)
│
├─ Backend:
│  ├─ Verificar token JWT
│  ├─ Find Favorites where userId = req.userId
│  ├─ Retornar array de favoritos
│  └─ Order por addedAt desc
│
├─ Frontend:
│  ├─ Recibir array
│  ├─ Renderizar grid
│  └─ Mostrar pokémon con botones
│
└─ Galería completa ✅


ELIMINAR FAVORITO:

FavoritesView.vue → Click en "Eliminar"
│
├─ useFavorites.removeFavorite(pokemonId)
│
├─ DELETE /api/favorites/25
│  (Bearer token en header)
│
├─ Backend:
│  ├─ Verificar token
│  ├─ Encontrar documento
│  ├─ Eliminar de MongoDB
│  └─ Retornar confirmation
│
├─ Frontend:
│  ├─ Actualizar estado
│  ├─ Refrescar lista
│  └─ Mostrar feedback
│
└─ Sincronización completa ✅
```

---

## Flujo de Batallas

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE BATALLAS                         │
└─────────────────────────────────────────────────────────────┘

CREAR BATALLA:

1. Usuario A vs Usuario B
   │
   ├─ User A elige equipo P1
   ├─ User B elige equipo P2
   │
   └─ POST /api/battles/create
     {friendId: "B", player1TeamId: "...", player2TeamId: "..."}
     │
     ├─ Validar que sean amigos
     ├─ Obtener equipos de B.D.
     ├─ Crear Battle document
     ├─ status = "pending"
     │
     └─ Response: {battle: {...}}

2. BATALLA PENDIENTE
   │
   ├─ BattlesView muestra lista
   ├─ User A o B pueden hacer click
   │
   └─ GET /api/battles/:id
     │
     └─ BattleDetailView carga datos

3. DURANTE LA BATALLA
   │
   ├─ Turno 1: User A ataca
   │  │
   │  ├─ POST /api/battles/:id/attack
   │  │  {attackerTeamIndex: 0, defenderTeamIndex: 0}
   │  │
   │  ├─ Backend:
   │  │  ├─ Calcular daño: (ATK - DEF)
   │  │  ├─ Registrar en battleLog
   │  │  ├─ status = "ongoing"
   │  │  └─ Response: {battle: {...updated}}
   │  │
   │  └─ Frontend:
   │     ├─ Mostrar animación de ataque
   │     ├─ Actualizar información
   │     └─ Habilitar turno de User B
   │
   ├─ Turno 2: User B ataca
   │  └─ (Repite mismo proceso)
   │
   └─ Turnos alternados...

4. FIN DE LA BATALLA
   │
   ├─ Un equipo llega a 0 pokémon
   │
   ├─ Backend:
   │  ├─ Determinar ganador
   │  ├─ status = "completed"
   │  ├─ winner = userId del ganador
   │  ├─ completedAt = Date.now()
   │
   └─ Frontend:
      ├─ Mostrar "¡Ganaste!"
      ├─ Mostrar historial
      └─ Botón para volver

ID DE BATALLA EN MONGODB:
{
  _id: ObjectId,
  player1Id: ObjectId,
  player2Id: ObjectId,
  player1Team: [{pokemonId, pokemonName, stats}],
  player2Team: [{pokemonId, pokemonName, stats}],
  battleLog: [
    {turn: 1, action: "Pikachu atacó a Raichu", player: 1, damage: 15},
    {turn: 2, action: "Raichu contraatacó", player: 2, damage: 20},
    ...
  ],
  winner: ObjectId,
  status: "completed",
  createdAt: Date,
  completedAt: Date
}
```

---

## Stack de Tecnologías en Capas

```
┌────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                      │
├────────────────────────────────────────────────────────────┤
│  Vue 3                                                       │
│  - Componentes reutilizables                               │
│  - Reactividad automática                                   │
│  - Single File Components (.vue)                           │
├────────────────────────────────────────────────────────────┤
│                   CAPA DE ENRUTAMIENTO                      │
├────────────────────────────────────────────────────────────┤
│  Vue Router 4                                               │
│  - 11 rutas protegidas                                     │
│  - Navigation guards (requiresAuth)                        │
│  - Lazy loading de componentes                             │
├────────────────────────────────────────────────────────────┤
│                   CAPA DE LÓGICA (State)                    │
├────────────────────────────────────────────────────────────┤
│  Composables (Vue 3 Composition API)                       │
│  - useAuth.js              (Gestión de sesión)            │
│  - usePokemon.js           (Datos de pokémon)             │
│  - useFavorites.js         (Favoritos persistente)        │
│  - useTeams.js             (Equipos)                       │
│  - useFriends.js           (Sistema de amigos)            │
│  - useBattles.js           (Batallas)                      │
├────────────────────────────────────────────────────────────┤
│                   CAPA DE COMUNICACIÓN                      │
├────────────────────────────────────────────────────────────┤
│  Axios + API Service                                        │
│  - Interceptores para token                                │
│  - Manejo centralizado de errores                          │
│  - Endpoints organizados por módulo                        │
├────────────────────────────────────────────────────────────┤
│                   CAPA DE ESTILIZACIÓN                      │
├────────────────────────────────────────────────────────────┤
│  Tailwind CSS + PostCSS                                     │
│  - Utility-first CSS                                       │
│  - Responsive design                                       │
│  - Dark mode ready                                         │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVIDOR                         │
├────────────────────────────────────────────────────────────┤
│  Express.js                                                 │
│  - Middleware de CORS                                      │
│  - Middleware de autenticación                             │
│  - Rutas REST (23 endpoints)                               │
├────────────────────────────────────────────────────────────┤
│                   CAPA DE DATOS (ODM)                       │
├────────────────────────────────────────────────────────────┤
│  Mongoose                                                   │
│  - Schemas con validación                                  │
│  - Índices para optimización                               │
│  - Hooks (pre-save)                                        │
├────────────────────────────────────────────────────────────┤
│                   CAPA DE PERSISTENCIA                      │
├────────────────────────────────────────────────────────────┤
│  MongoDB                                                    │
│  - 5 colecciones principais                                │
│  - Documentos con estructura flexible                      │
│  - Índices únicos para relaciones                          │
├────────────────────────────────────────────────────────────┤
│                   CAPA EXTERNA                              │
├────────────────────────────────────────────────────────────┤
│  PokeAPI                                                    │
│  - REST API pública                                        │
│  - Rate limit: 100 req/min                                 │
│  - Caché en memoria (1 hora)                               │
└────────────────────────────────────────────────────────────┘
```

---

## Ciclo de Vida de Solicitud HTTP

```
CLIENTE (Frontend)          SERVIDOR (Backend)         BASE DE DATOS

User Input
   │
   ▼
[Validación
 Frontend]
   │
   ▼
axios.post()                ──────────────► Express Router
(API Service)                              │
   │                                       ▼
   │                                   Middleware:
   │                                   - CORS check
   │ ◄──────────────────────── Parse body
   │                                   - Validación
   │                                       │
   │                                       ▼
   │                                   Auth Middleware
   │                                   - JWT verify
   │                                   - req.userId
   │                                       │
   │                                       ▼
   │                                   Route Handler
   │                                   - Lógica
   │                                       │
   │                                       ▼
Response Interceptors                 Mongoose Query ──► MongoDB
   │                                       │
   ▼                                       │ ◄────── Documento
Update State                               │
   │                                       ▼
   ▼                                   Procesar
Re-render Vue                          Transformar
   │                                       │
   ▼                                       ▼
User ve cambios                        JSON Response ───► [Status 200/400/401]
                                           │
                                           ◄─── Response Interceptor
                                           │
                                           ▼
                                       Error Handler
                                       (si aplica)
```

---

## Modelo de Datos (MongoDB)

```
USERS COLLECTION:
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  username: String (unique),
  createdAt: Date,
  updatedAt: Date
}

FAVORITES COLLECTION:
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  pokemonId: Number,
  pokemonName: String,
  pokemonData: Object,
  addedAt: Date
}

TEAMS COLLECTION:
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  name: String,
  description: String,
  pokemons: [
    {pokemonId: Number, pokemonName: String, pokemonData: Object, position: Number}
  ],
  createdAt: Date,
  updatedAt: Date
}

FRIENDS COLLECTION:
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  friendId: ObjectId (ref: Users),
  friendCode: String (unique),
  status: String (pending|accepted|blocked),
  createdAt: Date
}

BATTLES COLLECTION:
{
  _id: ObjectId,
  player1Id: ObjectId (ref: Users),
  player2Id: ObjectId (ref: Users),
  player1Team: [{pokemonId: Number, pokemonName: String, stats: Object}],
  player2Team: [{pokemonId: Number, pokemonName: String, stats: Object}],
  battleLog: [
    {turn: Number, action: String, player: Number, damage: Number}
  ],
  winner: ObjectId (ref: Users),
  status: String (pending|ongoing|completed),
  createdAt: Date,
  completedAt: Date
}
```

---

## Seguridad - Capa de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                   SEGURIDAD JWT                              │
└─────────────────────────────────────────────────────────────┘

GENERACIÓN DE TOKEN:
┌──────────────────────────────────────────────────────────────┐
│ Payload:         {id: userId}                                │
│ Secret:          process.env.JWT_SECRET                      │
│ Algoritmo:       HS256 (HMAC-SHA256)                          │
│ Expiración:      7 días                                      │
│ Resultado:       "eyJhbGc..." (3 partes separadas por puntos)│
└──────────────────────────────────────────────────────────────┘

VALIDACIÓN DE TOKEN:
┌──────────────────────────────────────────────────────────────┐
│ 1. Extraer de header: Authorization: Bearer <token>         │
│ 2. Dividir en 3 partes (header.payload.signature)           │
│ 3. Verificar signature con JWT_SECRET                        │
│ 4. Decodificar payload                                       │
│ 5. Verificar expiración                                      │
│ 6. Si todo ok → req.userId disponible                        │
└──────────────────────────────────────────────────────────────┘

CONTRASEÑAS:
┌──────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa: "Password123"                            │
│ 2. En backend:                                               │
│    - Generar salt: bcrypt.genSalt(10)                        │
│    - Hash: bcrypt.hash(password, salt) → "$2a$10$..."       │
│    - Guardar hash en BD                                      │
│ 3. En login:                                                 │
│    - bcrypt.compare(inputPassword, storedHash)              │
│    - Retorna true/false                                      │
│ 4. Nunca se almacena password en texto plano               │
└──────────────────────────────────────────────────────────────┘

FLUJO SEGURO:
┌──────────────────────────────────────────────────────────────┐
│ Usuario            │ Backend             │ Base de Datos     │
├────────────────────┼─────────────────────┼───────────────────┤
│ Ingresa email/pass │                     │                   │
│       ▼            │                     │                   │
│       └────────────► Validar entrada    │                   │
│                    │       ▼             │                   │
│                    │ Hash password       │                   │
│                    │ Buscar usuario ────────► Consultar      │
│                    │       ◄────────────────── Usuario       │
│                    │ Comparar hashes     │                   │
│                    │       ▼             │                   │
│                    │ Generar JWT          │                   │
│       ◄────────────┤ Retornar token      │                   │
│ Token almacenado   │                     │                   │
│ en localStorage    │                     │                   │
└──────────────────────────────────────────────────────────────┘
```

---

**Documentación técnica completa de la arquitectura del proyecto.**
