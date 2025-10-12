<template>
  <div class="contenedor">
    <h2 class="titulo">🏋️ Historial de Mediciones</h2>

    <!-- Selección de atleta -->
    <div class="selector-atleta">
      <label>Seleccionar atleta:</label>
      <select v-model="atletaId" @change="obtenerMediciones">
        <option value="" disabled selected>Selecciona un atleta</option>
        <option v-for="atleta in atletas" :key="atleta.id" :value="atleta.id">
          {{ atleta.nombres }} {{ atleta.apellidos }}
        </option>
      </select>
    </div>

    <!-- Formulario de registro -->
    <form v-if="atletaId" @submit.prevent="registrarMedicion" class="form-mediciones">
      <div v-for="campo in campos" :key="campo.key" class="campo-form">
        <label>{{ campo.label }}:</label>
        <input
          type="number"
          v-model.number="medicion[campo.key]"
          step="0.01"
          :placeholder="campo.placeholder"
          required
        />
      </div>
      <div class="boton-container">
        <button type="submit">Registrar medición</button>
      </div>
    </form>

    <!-- Tabla de mediciones -->
    <div v-if="atletaId" class="tabla-container">
      <h3>📋 Mediciones registradas</h3>
      <table v-if="mediciones.length">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Peso</th>
            <th>Estatura</th>
            <th>BMI</th>
            <th>% Grasa</th>
            <th>% Músculo</th>
            <th>Kcal</th>
            <th>Edad Metabólica</th>
            <th>Grasa Visceral</th>
            <th>Bíceps I/D</th>
            <th>Piernas I/D</th>
            <th>Abdomen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in mediciones" :key="m.id">
            <td>{{ formatFecha(m.fecha_medicion) }}</td>
            <td>{{ m.peso }} kg</td>
            <td>{{ m.estatura }} m</td>
            <td>{{ m.bmi || '-' }}</td>
            <td>{{ m.porcentaje_grasa || '-' }}%</td>
            <td>{{ m.porcentaje_musculo || '-' }}%</td>
            <td>{{ m.kcal || '-' }}</td>
            <td>{{ m.edad_metabolica || '-' }}</td>
            <td>{{ m.grasa_visceral || '-' }}</td>
            <td>{{ m.bicep_izquierdo || '-' }}/{{ m.bicep_derecho || '-' }}</td>
            <td>{{ m.pierna_izquierda || '-' }}/{{ m.pierna_derecha || '-' }}</td>
            <td>{{ m.abdomen || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="mensaje-vacio">No hay mediciones registradas para este atleta.</p>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../components/supebase'

const atletas = ref([])
const atletaId = ref('')
const mediciones = ref([])
const error = ref(null)

const medicion = ref({
  peso: null,
  estatura: null,
  bmi: null,
  porcentaje_grasa: null,
  porcentaje_musculo: null,
  kcal: null,
  edad_metabolica: null,
  grasa_visceral: null,
  bicep_izquierdo: null,
  bicep_derecho: null,
  pierna_izquierda: null,
  pierna_derecha: null,
  abdomen: null
})

const campos = [
  { key: 'peso', label: 'Peso (kg)', placeholder: 'Ej: 72.5' },
  { key: 'estatura', label: 'Estatura (m)', placeholder: 'Ej: 1.75' },
  { key: 'bmi', label: 'BMI', placeholder: 'Ej: 23.5' },
  { key: 'porcentaje_grasa', label: '% Grasa', placeholder: 'Ej: 15.2' },
  { key: 'porcentaje_musculo', label: '% Músculo', placeholder: 'Ej: 42.3' },
  { key: 'kcal', label: 'Kcal', placeholder: 'Ej: 1800' },
  { key: 'edad_metabolica', label: 'Edad Metabólica', placeholder: 'Ej: 28' },
  { key: 'grasa_visceral', label: 'Grasa Visceral', placeholder: 'Ej: 9.5' },
  { key: 'bicep_izquierdo', label: 'Bíceps Izquierdo', placeholder: 'Ej: 34.2' },
  { key: 'bicep_derecho', label: 'Bíceps Derecho', placeholder: 'Ej: 34.8' },
  { key: 'pierna_izquierda', label: 'Pierna Izquierda', placeholder: 'Ej: 54.3' },
  { key: 'pierna_derecha', label: 'Pierna Derecha', placeholder: 'Ej: 54.1' },
  { key: 'abdomen', label: 'Abdomen', placeholder: 'Ej: 80.5' }
]

const obtenerAtletas = async () => {
  const { data, error: err } = await supabase.from('atletas').select('id, nombres, apellidos').order('nombres', { ascending: true })
  if (err) error.value = err.message
  else atletas.value = data
}

const obtenerMediciones = async () => {
  if (!atletaId.value) return
  const { data, error: err } = await supabase
    .from('mediciones')
    .select('*')
    .eq('atleta_id', atletaId.value)
    .order('fecha_medicion', { ascending: false })
  if (err) error.value = err.message
  else mediciones.value = data || []
}

const registrarMedicion = async () => {
  const nuevaMedicion = { atleta_id: atletaId.value, fecha_medicion: new Date().toISOString().split('T')[0], ...medicion.value }
  const { error: err } = await supabase.from('mediciones').insert([nuevaMedicion])
  if (err) error.value = err.message
  else {
    for (const key in medicion.value) medicion.value[key] = null
    error.value = null
    await obtenerMediciones()
  }
}

// Formatear fecha a DD-MM-AAAA
const formatFecha = (fecha) => {
  if (!fecha) return '-'
  const f = new Date(fecha)
  const dia = String(f.getDate()).padStart(2, '0')
  const mes = String(f.getMonth() + 1).padStart(2, '0')
  const anio = f.getFullYear()
  return `${dia}-${mes}-${anio}`
}

onMounted(obtenerAtletas)
</script>

<style scoped>
.contenedor {
  max-width: 1200px;
  margin: 50px auto;
  padding: 25px;
  background-color: #ffffff; /* fondo blanco */
  border-radius: 15px;
  color: #1f2937; /* azul oscuro principal */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.titulo {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 30px;
}

.selector-atleta {
  margin-bottom: 25px;
}
.selector-atleta label {
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
}
.selector-atleta select {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #1f2937;
  background-color: #ffffff;
  color: #1f2937;
}

.form-mediciones {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  background-color: #f9fafb; /* fondo claro */
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.campo-form label {
  margin-bottom: 5px;
  font-weight: 600;
}
.campo-form input {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #1f2937;
  background-color: #ffffff;
  color: #1f2937;
}

.boton-container {
  grid-column: span 3;
  display: flex;
  justify-content: center;
}
.boton-container button {
  padding: 10px 25px;
  border-radius: 10px;
  font-weight: bold;
  background-color: #1f2937;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}
.boton-container button:hover {
  background-color: #374151;
}

.tabla-container h3 {
  font-size: 22px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000; /* borde negro */
}

thead th {
  padding: 12px;
  background-color: #1f2937; /* azul oscuro principal */
  color: #ffffff;
  text-align: center;
  border: 1px solid #000000;
}

tbody td {
  padding: 10px;
  text-align: center;
  border: 1px solid #000000;
}

tbody tr:hover {
  background-color: #e0e7ff;
  transition: 0.2s;
}

.mensaje-vacio {
  text-align: center;
  margin-top: 15px;
  font-style: italic;
  color: #6b7280;
}

.error {
  text-align: center;
  margin-top: 20px;
  color: #f87171;
  font-weight: 600;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .contenedor {
    padding: 15px;
    margin: 20px auto;
    margin-top: 170px;
  }

  .titulo {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .form-mediciones {
    grid-template-columns: 1fr; /* cada input ocupa toda la fila */
    gap: 12px;
    padding: 15px;
  }

  .boton-container {
    grid-column: span 1;
  }

  .selector-atleta select {
    padding: 8px;
    font-size: 14px;
  }

  table {
    font-size: 12px;
  }

  thead th,
  tbody td {
    padding: 6px;
  }

  .tabla-container h3 {
    font-size: 18px;
    margin-bottom: 10px;
  }
}


</style>
