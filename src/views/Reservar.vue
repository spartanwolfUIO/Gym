<template>
  <div>
    <h2>Reservar Horario</h2>

    <!-- Selección de día -->
    <div>
      <label>Selecciona el día:</label>
      <input type="date" v-model="fechaSeleccionada" @change="cargarHorasReservadas" />
    </div>

    <!-- Selección de hora -->
    <div v-if="fechaSeleccionada">
      <label>Selecciona hora de inicio:</label>
      <select v-model.number="horaInicio">
        <option
          v-for="h in horasDisponibles"
          :key="h"
          :value="h"
          :disabled="!puedeReservar(h)"
        >
          {{ h }}:00
        </option>
      </select>
      <button @click="reservar" :disabled="!horaInicio">Aceptar</button>
    </div>

    <!-- Tabla de reservas del usuario -->
    <div v-if="reservasUsuario.length">
      <h3>Mis reservas para {{ fechaSeleccionada }}</h3>
      <table border="1" cellpadding="5">
        <tr>
          <th>Hora de inicio</th>
          <th>Hora fin</th>
        </tr>
        <tr v-for="res in reservasUsuario" :key="res.id">
          <td>{{ res.hora_inicio.slice(0,2) }}:00</td>
          <td>{{ res.hora_fin.slice(0,2) }}:00</td>
        </tr>
      </table>
    </div>

    <p v-if="mensaje" style="color:red">{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../components/supebase'

const usuario = JSON.parse(localStorage.getItem('usuario'))

const fechaSeleccionada = ref('')
const horaInicio = ref(null)
const reservasUsuario = ref([])
const mensaje = ref('')

// Horas de 5am a 10pm
const horasDisponibles = Array.from({ length: 16 }, (_, i) => i + 5) // [5,6,...22]

const horaANumeroAStr = (h) => {
  return h.toString().padStart(2, '0') + ':00:00'
}

// Cargar reservas del usuario para el día seleccionado
const cargarHorasReservadas = async () => {
  horaInicio.value = null
  mensaje.value = ''
  if (!fechaSeleccionada.value) return

  const { data } = await supabase
    .from('reservas')
    .select('*')
    .eq('atleta_id', usuario.id)
    .eq('fecha', fechaSeleccionada.value)
    .order('hora_inicio', { ascending: true })

  reservasUsuario.value = data || []
}

// Verificar si la hora es válida para reservar
const puedeReservar = (h) => {
  const hoy = new Date();
  const fecha = new Date(fechaSeleccionada.value + 'T00:00:00'); // fuerza hora local

  const esHoy =
    hoy.getFullYear() === fecha.getFullYear() &&
    hoy.getMonth() === fecha.getMonth() &&
    hoy.getDate() === fecha.getDate();

  // Bloquea horas anteriores si es el mismo día
  if (esHoy && h <= hoy.getHours()) return false;

  // Si la fecha seleccionada es anterior a hoy → bloquear todo
  if (fecha < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) return false;

  return true;
};


// Función para reservar
const reservar = async () => {
  mensaje.value = ''

  // Validar si ya tiene una reserva ese día
  const { count: yaReservo } = await supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })
    .eq('atleta_id', usuario.id)
    .eq('fecha', fechaSeleccionada.value)

  if (yaReservo > 0) {
    mensaje.value = 'Ya tienes una reserva para este día.'
    return
  }

  if (!horaInicio.value) {
    mensaje.value = 'Selecciona una hora válida.'
    return
  }

  const horaFinReserva = horaInicio.value + 2

  // Contar cuántos usuarios ya reservados para esas 2 horas
  const { count: count1 } = await supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })
    .eq('fecha', fechaSeleccionada.value)
    .eq('hora_inicio', horaANumeroAStr(horaInicio.value))

  const { count: count2 } = await supabase
    .from('reservas')
    .select('*', { count: 'exact', head: true })
    .eq('fecha', fechaSeleccionada.value)
    .eq('hora_inicio', horaANumeroAStr(horaInicio.value + 1))

  if (count1 >= 7 || count2 >= 7) {
    mensaje.value = 'Alguna de las horas ya tiene el máximo de 7 reservas.'
    return
  }

  // Insertar reservas de las 2 horas consecutivas
  const { error } = await supabase.from('reservas').insert([
    {
      atleta_id: usuario.id,
      fecha: fechaSeleccionada.value,
      hora_inicio: horaANumeroAStr(horaInicio.value),
      hora_fin: horaANumeroAStr(horaInicio.value + 1)
    },
    {
      atleta_id: usuario.id,
      fecha: fechaSeleccionada.value,
      hora_inicio: horaANumeroAStr(horaInicio.value + 1),
      hora_fin: horaANumeroAStr(horaInicio.value + 2)
    }
  ])

  if (error) {
    mensaje.value = 'Error al reservar: ' + error.message
  } else {
    mensaje.value = 'Reserva realizada correctamente'
    await cargarHorasReservadas()
    horaInicio.value = null
  }
}

// Recargar reservas cuando se cambie el día
watch(fechaSeleccionada, () => cargarHorasReservadas())
</script>
<style scoped>
/* Contenedor principal */
div {
  max-width: 800px;
  margin: 40px auto;
  background: #ffffff;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #111827;
}

/* Títulos */
h2, h3 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 20px;
}

/* Inputs y select */
input[type="date"],
select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 15px;
  background-color: #ffffff; /* fondo claro */
  color: #111827;
}

/* Botones */
button {
  background-color: #1f2937;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.3s;
  margin-top: 10px;
}

button:hover {
  background-color: #374151;
}

button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Mensajes */
p {
  margin-top: 10px;
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

.mensaje-error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #f87171;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
}

/* Tabla */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th {
  background-color: #1f2937;
  color: white;
  padding: 10px;
  text-align: center;
}

td {
  padding: 8px;
  text-align: center;
  border: 1px solid #ccc;
}

/* Responsive */
@media (max-width: 768px) {
  div {
    padding: 20px;
    margin: 20px;
    margin-top: 170px;
  }

  input[type="date"], select, button {
    width: 100%;
  }

  table, th, td {
    font-size: 14px;
  }
}
</style>
