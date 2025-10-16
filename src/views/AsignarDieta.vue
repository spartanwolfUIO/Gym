<template>
  <div class="contenedor">
    <h2>📋 Asignar Dieta</h2>

    <div class="campo">
      <label>Selecciona Atleta:</label>
      <select v-model="atletaSeleccionado" @change="cargarDietas">
        <option disabled value="">-- Selecciona --</option>
        <option v-for="atleta in atletas" :key="atleta.id" :value="atleta.id">
          {{ atleta.nombres }} {{ atleta.apellidos }}
        </option>
      </select>
    </div>

    <div v-if="atletaSeleccionado">
      <div class="campo">
        <label>Día:</label>
        <select v-model="dia">
          <option disabled value="">-- Selecciona --</option>
          <option v-for="d in dias" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>

      <div class="campo">
        <label>Comida:</label>
        <select v-model="comida">
          <option disabled value="">-- Selecciona --</option>
          <option v-for="c in comidas" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="campo">
        <label>Descripción:</label>
        <input v-model="descripcion" type="text" placeholder="Escribe la dieta..." />
      </div>

      <button @click="guardarDieta">Guardar Dieta</button>
    </div>

    <hr />

    <h3>🍽 Dieta del Atleta</h3>
    <table v-if="dietasAtleta.length">
      <thead>
        <tr>
          <th>Día</th>
          <th>Comida</th>
          <th>Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in dietasAtleta" :key="d.id">
          <td>{{ d.dia }}</td>
          <td>{{ d.comida }}</td>
          <td>{{ d.descripcion }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay dietas asignadas para este atleta.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../components/supebase'

const atletas = ref([])
const atletaSeleccionado = ref('')
const dia = ref('')
const comida = ref('')
const descripcion = ref('')
const dietasAtleta = ref([])

const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const comidas = ['Desayuno','Almuerzo','Cena','Snack']

onMounted(async () => {
  const { data } = await supabase.from('atletas').select('*').order('nombres')
  atletas.value = data || []
})

const cargarDietas = async () => {
  if (!atletaSeleccionado.value) return
  const { data } = await supabase
    .from('dietas')
    .select('*')
    .eq('atleta_id', atletaSeleccionado.value)
    .order('dia')
  dietasAtleta.value = data || []
}

const guardarDieta = async () => {
  if (!atletaSeleccionado.value || !dia.value || !comida.value || !descripcion.value) return

  const { error } = await supabase
    .from('dietas')
    .upsert([
      {
        atleta_id: atletaSeleccionado.value,
        dia,
        comida,
        descripcion: descripcion.value.trim()
      }
    ], { onConflict: ['atleta_id','dia','comida'] })

  if (error) {
    alert('Error al guardar dieta: ' + error.message)
  } else {
    descripcion.value = ''
    cargarDietas()
  }
}
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

.campo {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.campo label {
  font-weight: 600;
  margin-bottom: 5px;
}

.campo input, .campo select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
}

button {
  background-color: #1f2937;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #374151;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

th {
  background: #f3f3f3;
}
</style>
