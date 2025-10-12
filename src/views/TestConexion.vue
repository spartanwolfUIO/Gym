<template>
    <div>
      <h2>Registro de Atletas</h2>
  
      <form @submit.prevent="registrarAtleta">
        <div>
          <label>Nombres:</label>
          <input v-model="nombres" required />
        </div>
        <div>
          <label>Apellidos:</label>
          <input v-model="apellidos" required />
        </div>
        <div>
          <label>Fecha de nacimiento:</label>
          <input type="date" v-model="fechaNacimiento" required />
        </div>
        <div>
          <label>Peso inicial (kg):</label>
          <input type="number" v-model.number="pesoInicial" step="0.01" />
        </div>
        <div>
          <label>Estatura inicial (m):</label>
          <input type="number" v-model.number="estaturaInicial" step="0.01" />
        </div>
        <button type="submit">Registrar</button>
      </form>
  
      <hr />
  
      <h3>Lista de atletas registrados</h3>
      <button @click="obtenerAtletas">Refrescar</button>
      <ul v-if="atletas.length">
        <li v-for="atleta in atletas" :key="atleta.id">
          {{ atleta.nombres }} {{ atleta.apellidos }} -
          Edad: {{ calcularEdad(atleta.fecha_nacimiento) }} años
        </li>
      </ul>
      <p v-else>No hay atletas registrados.</p>
  
      <div v-if="error" style="color:red;">
        Error: {{ error }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { supabase } from '../components/supebase'
  
  // Campos del formulario
  const nombres = ref('')
  const apellidos = ref('')
  const fechaNacimiento = ref('')
  const pesoInicial = ref(null)
  const estaturaInicial = ref(null)
  
  // Estado
  const atletas = ref([])
  const error = ref(null)
  
  // Función para insertar atleta
  const registrarAtleta = async () => {
    const { error: err } = await supabase.from('atletas').insert([{
      nombres: nombres.value,
      apellidos: apellidos.value,
      fecha_nacimiento: fechaNacimiento.value,
      peso_inicial: pesoInicial.value,
      estatura_inicial: estaturaInicial.value,
    }])
  
    if (err) {
      error.value = err.message
    } else {
      limpiarFormulario()
      await obtenerAtletas()
    }
  }
  
  const limpiarFormulario = () => {
    nombres.value = ''
    apellidos.value = ''
    fechaNacimiento.value = ''
    pesoInicial.value = null
    estaturaInicial.value = null
  }
  
  // Función para obtener atletas
  const obtenerAtletas = async () => {
    const { data, error: err } = await supabase.from('atletas').select('*').order('fecha_inscripcion', { ascending: false })
  
    if (err) {
      error.value = err.message
    } else {
      atletas.value = data
      error.value = null
    }
  }
  
  // Calcular edad en base a fecha de nacimiento
  const calcularEdad = (fecha) => {
    const hoy = new Date()
    const nac = new Date(fecha)
    let edad = hoy.getFullYear() - nac.getFullYear()
    const m = hoy.getMonth() - nac.getMonth()
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--
    }
    return edad
  }
  
  // Obtener atletas al cargar
  onMounted(obtenerAtletas)
  </script>
  
  <style scoped>
  form > div {
    margin-bottom: 8px;
  }
  </style>
  