<template>
  <div class="contenedor">
    <h2 class="titulo">🏋️ Gestión de Rutinas</h2>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="mensajeExito" class="mensaje-exito">{{ mensajeExito }}</div>

    <!-- Selección de atleta -->
    <div class="campo">
      <label>Selecciona Atleta:</label>
      <select v-model="atletaSeleccionado" @change="cargarRutina">
        <option value="">--Seleccione--</option>
        <option v-for="atleta in atletas" :key="atleta.id" :value="atleta.id">
          {{ atleta.nombres }} {{ atleta.apellidos }}
        </option>
      </select>
    </div>

    <!-- Rutina -->
    <div v-if="atletaSeleccionado" class="formulario">
      <div class="campo" v-for="dia in diasSemana" :key="dia">
        <label>{{ dia }}:</label>
        <input type="text" v-model="rutina[dia]" placeholder="Ej: Pecho y bíceps" />
      </div>
      <button @click="guardarRutina" class="btn-guardar">Guardar Rutina</button>
    </div>

    <!-- Tabla de rutina del atleta -->
    <div v-if="rutinaActual.length">
      <h3 class="subtitulo">📋 Rutina de {{ nombreAtleta }}</h3>
      <table class="tabla">
        <thead>
          <tr>
            <th>Día</th>
            <th>Rutina</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rutinaActual" :key="r.dia">
            <td>{{ r.dia }}</td>
            <td>{{ r.descripcion }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../components/supebase'

const atletas = ref([])
const atletaSeleccionado = ref('')
const rutina = ref({})
const rutinaActual = ref([])
const mensajeExito = ref('')
const error = ref('')
const nombreAtleta = ref('')

const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

// Inicializa la rutina vacía
diasSemana.forEach(dia => rutina.value[dia] = '')

// Cargar atletas
const cargarAtletas = async () => {
  const { data, error: err } = await supabase
    .from('atletas')
    .select('*')
    .order('nombres', { ascending: true })

  if (err) error.value = err.message
  else atletas.value = data
}

// Cargar rutina de un atleta
const cargarRutina = async () => {
  if (!atletaSeleccionado.value) return

  const atleta = atletas.value.find(a => a.id === atletaSeleccionado.value)
  nombreAtleta.value = atleta ? `${atleta.nombres} ${atleta.apellidos}` : ''

  // Limpiar inputs
  diasSemana.forEach(dia => rutina.value[dia] = '')

  const { data, error: err } = await supabase
    .from('rutinas')
    .select('*')
    .eq('atleta_id', atletaSeleccionado.value)

  if (err) {
    error.value = err.message
    return
  }

  rutinaActual.value = data || []

  // Llenar inputs con la rutina existente
  data?.forEach(r => {
    if (diasSemana.includes(r.dia)) rutina.value[r.dia] = r.descripcion
  })
}

// Guardar rutina usando upsert
const guardarRutina = async () => {
  if (!atletaSeleccionado.value) {
    error.value = 'Selecciona un atleta'
    return
  }

  error.value = ''
  mensajeExito.value = ''

  // Convertir a array para Supabase
  const rutinasArray = diasSemana.map(dia => ({
    atleta_id: atletaSeleccionado.value,
    dia,
    descripcion: rutina.value[dia] || ''
  }))

  const { error: err } = await supabase
    .from('rutinas')
    .upsert(rutinasArray, { onConflict: ['atleta_id','dia'] })

  if (err) {
    error.value = 'Error al guardar rutinas: ' + err.message
  } else {
    mensajeExito.value = 'Rutina guardada correctamente ✅'
    // Limpiar inputs
    diasSemana.forEach(dia => rutina.value[dia] = '')
    // Recargar tabla
    await cargarRutina()
    setTimeout(() => mensajeExito.value = '', 3000)
  }
}

onMounted(cargarAtletas)
</script>

<style scoped>
.contenedor {
  max-width: 800px;
  margin: 40px auto;
  background: #ffffff;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.titulo {
  text-align: center;
  font-size: 26px;
  margin-bottom: 20px;
  color: #1f2937;
}

.subtitulo {
  text-align: center;
  font-size: 22px;
  margin-top: 30px;
  color: #1f2937;
}

.formulario {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.campo {
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
}

.campo label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #1f2937;
}

.campo input, .campo select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  background: #fff;
    color: #111827;
}

.btn-guardar {
  background-color: #1f2937;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s;
}

.btn-guardar:hover {
  background-color: #374151;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.tabla th, .tabla td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.tabla th {
  background: #f3f3f3;
}

.mensaje-exito {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
}

.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #f87171;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
}

/* 📱 Responsive */
@media (max-width: 768px) {
  .formulario {
    flex-direction: column;
  }
  .campo {
    flex: 1 1 100%;
  }
  .contenedor {
    margin-top: 170px;
  }
}
</style>
