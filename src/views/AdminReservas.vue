<template>
  <div>
    <h2>Reservas diarias (Administrador)</h2>

    <!-- Selección de día -->
    <div style="margin-bottom: 20px;">
      <label>Selecciona el día:</label>
      <input type="date" v-model="fechaSeleccionada" @change="cargarReservas" />
    </div>

    <!-- Tabla de reservas -->
    <div v-if="Object.keys(reservasAgrupadas).length">
      <h3>Reservas del {{ fechaSeleccionada }}</h3>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Atletas (máx 7)</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(grupo, hora) in reservasAgrupadas" :key="hora">
<td :data-label="'Hora'">{{ hora }}</td>
<td :data-label="'Atletas (máx 7)'">
  <ul>
    <li v-for="res in grupo" :key="res.id">{{ res.atleta_nombre }}</li>
  </ul>
</td>
<td :data-label="'Total'">{{ grupo.length }}/7</td>

          </tr>
        </tbody>
      </table>
    </div>

    <p v-else-if="fechaSeleccionada">No hay reservas para este día.</p>
    <p v-if="mensaje" style="color:red">{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../components/supebase' // Usa la misma ruta que tienes en tu proyecto

const fechaSeleccionada = ref('')
const reservas = ref([])
const reservasAgrupadas = ref({})
const mensaje = ref('')

// Cargar reservas del día seleccionado
const cargarReservas = async () => {
  mensaje.value = ''
  reservas.value = []
  reservasAgrupadas.value = {}

  if (!fechaSeleccionada.value) return

  // SELECT con la relación correcta: atletas(nombres, apellidos)
  const { data, error } = await supabase
    .from('reservas')
    .select('id, atleta_id, fecha, hora_inicio, hora_fin, atletas(nombres, apellidos)')
    .eq('fecha', fechaSeleccionada.value)
    .order('hora_inicio', { ascending: true })

  if (error) {
    mensaje.value = 'Error al cargar reservas: ' + error.message
    return
  }

  // Mapear nombre del atleta y hora para mostrar
  const reservasConNombre = (data || []).map(r => {
    const atleta = r.atletas // relación (puede venir undefined si no hay FK)
    const nombre = atleta ? `${atleta.nombres || ''} ${atleta.apellidos || ''}`.trim() : 'Sin nombre'
    return {
      ...r,
      atleta_nombre: nombre || 'Sin nombre',
      hora_mostrar: r.hora_inicio ? r.hora_inicio.slice(0,5) : '' // "HH:MM"
    }
  })

  reservas.value = reservasConNombre

  // Agrupar por hora_mostrar
  const agrupadas = {}
  reservasConNombre.forEach(r => {
    const key = r.hora_mostrar || 'Desconocida'
    if (!agrupadas[key]) agrupadas[key] = []
    agrupadas[key].push(r)
  })

  reservasAgrupadas.value = agrupadas
}
</script>

<style scoped>
/* Contenedor principal */
div {
  max-width: 900px;
  margin: 40px auto;
  padding: 25px;
  background-color: #ffffff;
  border-radius: 15px;
  color: #111827;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Títulos */
h2 {
  text-align: center;
  color: #1f2937;
  font-size: 26px;
  margin-bottom: 20px;
}

h3 {
  text-align: center;
  color: #1f2937;
  font-size: 22px;
  margin-bottom: 15px;
}

/* Input fecha */
input[type="date"] {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 15px;
  background-color: #ffffff;
  color: #111827;
}

/* Tabla */
table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000; /* borde negro */
  background-color: #f9fafb;
  margin-top: 15px;
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

ul {
  margin: 0;
  padding-left: 16px;
  text-align: left;
}

p {
  margin-top: 15px;
}

/* Mensajes */
p[mensaje] {
  color: red;
}

/* Responsive */
@media (max-width: 768px) {
  table,
  thead,
  tbody,
  th,
  td,
  tr {
    display: block;
  }

  div{
    margin-top: 170px;
  }
  thead tr {
    display: none;
  }

  tbody td {
    text-align: right;
    padding-left: 50%;
    position: relative;
  }

  tbody td::before {
    content: attr(data-label);
    position: absolute;
    left: 10px;
    width: 45%;
    padding-left: 5px;
    font-weight: bold;
    text-align: left;
  }
}

</style>
