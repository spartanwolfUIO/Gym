<template>
  <div class="admin-home">
    <h1 class="gym-name">SPARTAN WOLF</h1>

    <img
      src="../assets/logo-spartan.jpg"
      alt="Logo del gimnasio"
      class="gym-logo"
    />

    <h2 class="welcome">
      Bienvenido, {{ nombreAtleta || 'Administrador' }}
    </h2>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../components/supebase'

const nombreAtleta = ref('')
const usuario = JSON.parse(localStorage.getItem('usuario'))

onMounted(async () => {
  if (usuario?.id) {
    const { data, error } = await supabase
      .from('atletas')
      .select('nombres, apellidos')
      .eq('id', usuario.id)
      .single()

    if (!error && data) {
      nombreAtleta.value = `${data.nombres} ${data.apellidos}`
    } else {
      nombreAtleta.value = 'Administrador'
      console.error('Error al cargar atleta:', error?.message)
    }
  }
})
</script>

<style scoped>
.admin-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  background-color: #f8f8f8;
}

.gym-name {
  font-size: 3rem;
  color: #d62828;
  margin-bottom: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 800;
}

.gym-logo {
  width: 180px;
  height: auto;
  margin-bottom: 1.5rem;
}

.welcome {
  font-size: 1.6rem;
  color: #333;
  font-weight: 500;
}
</style>
