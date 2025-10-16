import { createRouter, createWebHistory } from 'vue-router'

// Carga perezosa de componentes
const Home = () => import('../views/Home.vue')
const User = () => import('../views/User.vue')
const RegistroAtleta = () => import('../views/RegistroAtleta.vue')
const HistorialMediciones = () => import('../views/HistorialMediciones.vue')
const HistorialMedicionesUser = () => import('../views/HistorialMedicionesUser.vue')
const Login = () => import('../views/Login.vue')
const Reservar = () => import('../views/Reservar.vue') 
const AdminReservas = () => import('../views/AdminReservas.vue') 
const AsignarRutinas = () => import('../views/AsignarRutinas.vue') 
const Rutinas = () => import('../views/Rutinas.vue') 
const Dieta = () => import('../views/Dieta.vue') 
const NotFound = () => import('../views/NotFound.vue') // <-- NotFound
const AsignarDieta = () => import('../views/AsignarDieta.vue') 

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/user', name: 'User', component: User, meta: { requiresAuth: true } },
  { path: '/Registro', name: 'RegistroAtleta', component: RegistroAtleta, meta: { requiresAuth: true } },
  { path: '/AgregarMediciones', name: 'Mediciones', component: HistorialMediciones, meta: { requiresAuth: true } },
  { path: '/MisMediciones', name: 'MedicionesUser', component: HistorialMedicionesUser, meta: { requiresAuth: true } },
  { path: '/reservar', name: 'Reservar', component: Reservar, meta: { requiresAuth: true } },
  { path: '/Rutinas', name: 'Rutinas', component: Rutinas, meta: { requiresAuth: true } },
  { path: '/Dieta', name: 'Dieta', component: Dieta, meta: { requiresAuth: true } },
  { path: '/admin/reservas', name: 'AdminReservas', component: AdminReservas, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/rutinas', name: 'AdminRutinas', component: AsignarRutinas, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/dietas', name: 'AsignarDieta', component: AsignarDieta, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/login', name: 'Login', component: Login },

  // Catch-all para rutas no definidas
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global seguro
router.beforeEach((to, from, next) => {
  try {
    const user = JSON.parse(localStorage.getItem('usuario'))

    // Rutas que requieren login
    if (to.meta.requiresAuth && !user) return next('/login')

    // Evitar volver a login si ya está logeado
    if (to.path === '/login' && user) return next('/')

    // Solo admin puede acceder a rutas admin
    if (to.meta.requiresAdmin && user?.rol !== 'admin') return next('/')

    // Si la ruta es NotFound
    if (to.name === 'NotFound') {
      return next(user ? '/' : '/login')
    }

    next()
  } catch (e) {
    console.error('Error en guard router:', e)
    next('/login')
  }
})

export default router
