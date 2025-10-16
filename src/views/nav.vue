<template>
  <!-- Solo se muestra si hay usuario logueado -->
  <nav v-if="usuario" class="navbar">
    <div class="nav-container">
      
      <!-- Logo o Título (opcional) -->
      <div class="nav-logo">🏋️ Gym</div>

      <!-- Menú hamburguesa para móvil -->
      <button class="menu-toggle" @click="menuAbierto = !menuAbierto">
        ☰
      </button>

      <!-- Menú de enlaces -->
      <div :class="['nav-links', { abierto: menuAbierto }]">
        <router-link to="/">Inicio</router-link>

        <template v-if="usuario?.rol === 'admin'">
          <router-link to="/Registro">Registro Atletas</router-link>
          <router-link to="/AgregarMediciones">Agregar Mediciones</router-link>
          <router-link to="/admin/reservas">Reservas</router-link>
          <router-link to="/admin/rutinas">Rutinas</router-link>
          <router-link to="/admin/dietas">Dietas</router-link>
        </template>

        <template v-else-if="usuario?.rol === 'usuario'">
          <router-link to="/reservar">Reservar Horario</router-link>
          <router-link to="/Rutinas">Mis Rutinas</router-link>
          <router-link to="/MisMediciones">Mis Mediciones</router-link>
          <router-link to="/Dieta">Mis Dietas</router-link>
        </template>
      </div>

      <!-- Botón Salir a la derecha -->
      <button @click="cerrarSesion" class="btn-salir">Salir</button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const usuario = ref(JSON.parse(localStorage.getItem('usuario')))
const menuAbierto = ref(false)

const cerrarSesion = () => {
  localStorage.removeItem('usuario')
  router.push('/login')
  window.location.reload()
}
</script>

<style scoped>
/* --- Navbar --- */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #1f2937;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 40px;
}

.nav-logo {
  font-weight: bold;
  font-size: 20px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #60a5fa;
}

.btn-salir {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-salir:hover {
  background-color: #dc2626;
}

/* --- Botón hamburguesa --- */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 26px;
  cursor: pointer;
}

/* 📱 Responsive */
@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    padding: 12px 20px;
  }

  .menu-toggle {
    display: block;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    display: none;
    margin-top: 10px;
    gap: 15px;
    background-color: #1f2937;
    border-radius: 8px;
    padding: 10px 0;
  }

  .nav-links.abierto {
    display: flex;
  }

  .btn-salir {
    margin-top: 10px;
    width: 100%;
  }
}
</style>
