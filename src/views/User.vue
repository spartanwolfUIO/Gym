<template>
    <h3>Lista de atletas registrados</h3>
    <div>
        <label>Cédula:</label>
        <input type="text" v-model="cedula" @input="soloNumeros" maxlength="10" placeholder="Ingrese su cédula" />
      <p v-if="cedula.length > 0 && !esCedulaValida" style="color: red">
        La cédula debe tener exactamente 10 dígitos.
      </p>        
    </div>    
      <button @click="obtenerAtletaPorCedula">BUSCAR</button>
      <ul v-if="atletas.length">
        <li v-for="atleta in atletas" :key="atleta.id">
          {{ atleta.nombres }}  -
          {{ tiempoRestanteMembresia(atleta.fecha_fin_membresia) }}
        </li>
      </ul>
      <p v-else>No hay atletas registrados.</p>
  
      <div v-if="error" style="color:red;">
        Error: {{ error }}
      </div>
</template>

<script setup>
import { ref, onMounted ,computed  } from 'vue'
import { supabase } from '../components/supebase'

const cedula = ref("")

  // Estado
  const atletas = ref([])
  const error = ref(null)

    const soloNumeros = () => {
    cedula.value = cedula.value.replace(/\D/g, '') // elimina todo lo que no sea dígito
    }

    // Validar longitud exacta
    const esCedulaValida = computed(() => {
    return cedula.value.length === 10
    })

const obtenerAtletaPorCedula = async () => {
    const cedulaBuscada = cedula.value;
    const { data, error: err } = await supabase
    .from('atletas')
    .select('*')
    .eq('cedula', cedulaBuscada)

  if (err) {
    error.value = err.message
  } else {
    atletas.value = data // puede tener uno o más resultados
    error.value = null
  }
}

const tiempoRestanteMembresia = (fechaFin) => {
  const hoy = new Date()
  const fin = new Date(fechaFin)

  // Validación de fecha
  if (isNaN(fin)) return 'Fecha inválida'

  hoy.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)

  const msPorDia = 1000 * 60 * 60 * 24
  const diffDiasTotal = Math.ceil((fin - hoy) / msPorDia)

  // 🟥 Caso 1: Ya finalizó
  if (diffDiasTotal < 0) {
    return 'Su membresía ha finalizado'
  }

  // 🟨 Caso 2: Quedan 3 días o menos → renovar
  if (diffDiasTotal <= 3) {
    return `Renovar membresía, le quedan ${diffDiasTotal} día${diffDiasTotal !== 1 ? 's' : ''}`
  }

  // 🟩 Caso 3: Calcular meses y días restantes
  let años = fin.getFullYear() - hoy.getFullYear()
  let meses = años * 12 + fin.getMonth() - hoy.getMonth()
  let dias = fin.getDate() - hoy.getDate()

  if (dias < 0) {
    meses--
    const ultimoDiaMesAnterior = new Date(fin.getFullYear(), fin.getMonth(), 0)
    dias = ultimoDiaMesAnterior.getDate() + dias
  }

  // Construcción de texto
  if (meses > 0 && dias > 0) {
    return `Le quedan ${meses} mes${meses > 1 ? 'es' : ''} y ${dias} día${dias > 1 ? 's' : ''}`
  }
  if (meses > 0) {
    return `Le quedan ${meses} mes${meses > 1 ? 'es' : ''}`
  }
  return `Le quedan ${dias} día${dias > 1 ? 's' : ''}`
}


</script>
