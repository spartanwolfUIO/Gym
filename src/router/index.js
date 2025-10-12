import { createRouter, createWebHistory } from 'vue-router'

// Carga perezosa de componentes
const Home = () => import('../views/Home.vue')
const User = () => import('../views/User.vue')
const RegistroAtleta = () => import('../views/RegistroAtleta.vue')
const HistorialMediciones = () => import('../views/HistorialMediciones.vue')
const HistorialMedicionesUser = () => import('../views/HistorialMedicionesUser.vue')   // solo usuario
const Login = () => import('../views/Login.vue')
const Reservar = () => import('../views/Reservar.vue') 
const AdminReservas = () => import('../views/AdminReservas.vue') 
const AsignarRutinas = () => import('../views/AsignarRutinas.vue') 
const Rutinas = () => import('../views/Rutinas.vue') 

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/user', name: 'User', component: User},
  { path: '/Registro', name: 'RegistroAtleta', component: RegistroAtleta, meta: { requiresAuth: true } },
  { path: '/AgregarMediciones', name: 'Mediciones', component: HistorialMediciones, meta: { requiresAuth: true } },
  { path: '/MisMediciones', name: 'MedicionesUser', component: HistorialMedicionesUser, meta: { requiresAuth: true } },
  { path: '/reservar', name: 'Reservar', component: Reservar, meta: { requiresAuth: true } },
  { path: '/Rutinas', name: 'Rutinas', component: Rutinas, meta: { requiresAuth: true } },
  { path: '/admin/reservas', name: 'AdminReservas', component: AdminReservas, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/rutinas', name: 'AdminRutinas', component: AsignarRutinas, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/login', name: 'Login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global seguro
router.beforeEach((to, from, next) => {
  try {
    const user = JSON.parse(localStorage.getItem('usuario'))

    if (to.meta.requiresAuth && !user) return next('/login')
    if (to.path === '/login' && user) return next('/')
    if (to.meta.requiresAdmin && user?.rol !== 'admin') return next('/') // solo admin
    next()
  } catch (e) {
    console.error('Error en guard router:', e)
    next('/login')
  }
})

export default router
