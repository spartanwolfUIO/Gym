<template>
  <div class="contenedor">
    <h2>🍽 Mis Dietas</h2>

    <div v-if="dietasUsuario.length">
      <table>
        <thead>
          <tr>
            <th>Día</th>
            <th>Comida</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in dietasUsuario" :key="d.id">
            <td>{{ d.dia }}</td>
            <td>{{ d.comida }}</td>
            <td>{{ d.descripcion }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <p v-else>No tienes dietas asignadas aún.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../components/supebase'

const usuario = JSON.parse(localStorage.getItem('usuario'))
const dietasUsuario = ref([])

const cargarDietas = async () => {
  if (!usuario?.id) return
  const { data, error } = await supabase
    .from('dietas')
    .select('*')
    .eq('atleta_id', usuario.id)
    .order('dia')

  if (error) {
    console.error('Error al cargar dietas:', error.message)
  } else {
    dietasUsuario.value = data || []
  }
}

onMounted(cargarDietas)
</script>

<style scoped>
.contenedor {
  max-width: 700px;
  margin: 40px auto;
  padding: 25px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

th {
  background: #f3f3f3;
}

@media (max-width: 768px) {
  .contenedor {
    margin: 20px;
    padding: 15px;
  }

  th, td {
    font-size: 14px;
    padding: 6px;
  }
}
</style>
