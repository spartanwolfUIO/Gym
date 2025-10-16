<template>
  <div class="contenedor">
    <h2 class="titulo">🏋️ Registro de Atletas</h2>

    <!-- ✅ Mensaje de éxito -->
    <div v-if="mensajeExito" class="mensaje-exito">
      {{ mensajeExito }}
    </div>

    <!-- ❌ Mensaje de error -->
    <div v-if="error" class="error">
      {{ error }}
    </div>

    <form @submit.prevent="registrarAtleta" class="formulario">
      <div class="campo">
        <label>Nombres:</label>
        <input v-model="nombres" required />
      </div>

      <div class="campo">
        <label>Apellidos:</label>
        <input v-model="apellidos" required />
      </div>

      <div class="campo">
        <label>Cédula:</label>
        <input
          type="text"
          v-model="cedula"
          @input="soloNumeros"
          maxlength="10"
          placeholder="Ingrese su cédula"
          required
        />
        <p v-if="cedula.length > 0 && !esCedulaValida" class="error-texto">
          La cédula debe tener exactamente 10 dígitos.
        </p>
      </div>

      <div class="campo">
        <label>Fecha de nacimiento:</label>
        <input type="date" v-model="fechaNacimiento" required />
      </div>

      <div class="campo">
        <label>Celular:</label>
        <input
          type="text"
          v-model="celular"
          @input="soloNumeros"
          maxlength="10"
          placeholder="Ingrese su celular"
          required
        />
        <p v-if="celular.length > 0 && !esCelularValido" class="error-texto">
          El celular debe tener exactamente 10 dígitos.
        </p>
      </div>

      <div class="campo">
        <label>Peso inicial (Kg):</label>
        <input type="number" v-model.number="pesoInicial" step="0.01" />
      </div>

      <div class="campo">
        <label>Estatura inicial (Mts):</label>
        <input type="number" v-model.number="estaturaInicial" step="0.01" />
      </div>

      <div class="campo">
        <label>Fecha de inicio de membresía:</label>
        <input type="date" v-model="fechaInicioMembresia" required />
      </div>

      <div class="campo">
        <label>Plan de membresía (Meses):</label>
        <input
          type="text"
          v-model.number="mesesMembresia"
          @input="soloNumeros"
          placeholder="Ej: 6"
          required
        />
      </div>

      <button type="submit" class="btn-registrar">Registrar</button>
    </form>

    <hr class="separador" />

    <h3 class="subtitulo">📋 Lista de Atletas Registrados</h3>
    <button class="btn-refrescar" @click="obtenerAtletas">🔄 Refrescar</button>

    <div v-if="atletas.length" class="tabla-contenedor">
      <table class="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Inicio Membresía</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="atleta in atletas" :key="atleta.id">
            <td>{{ atleta.nombres }} {{ atleta.apellidos }}</td>
            <td>{{ calcularEdad(atleta.fecha_nacimiento) }} años</td>
            <td>{{ formatFecha(atleta.fecha_inicio_membresia) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="mensaje-vacio">No hay atletas registrados.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../components/supebase'

const nombres = ref('')
const apellidos = ref('')
const fechaNacimiento = ref('')
const pesoInicial = ref(null)
const estaturaInicial = ref(null)
const fechaInicioMembresia = ref('')
const mesesMembresia = ref('')
const cedula = ref('')
const celular = ref('')

const atletas = ref([])
const error = ref(null)
const mensajeExito = ref('')

const soloNumeros = () => {
  cedula.value = cedula.value.replace(/\D/g, '')
  mesesMembresia.value = mesesMembresia.value.replace(/\D/g, '')
  celular.value = celular.value.replace(/\D/g, '')
}

const esCedulaValida = computed(() => cedula.value.length === 10)
const esCelularValido = computed(() => celular.value.length === 10)

const calcularEdad = (fecha) => {
  const hoy = new Date()
  const nac = new Date(fecha)
  let edad = hoy.getFullYear() - nac.getFullYear()
  const m = hoy.getMonth() - nac.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad
}

const calcularMembresia = (fechaInicio, meses) => {
  const fecha = new Date(fechaInicio)
  fecha.setMonth(fecha.getMonth() + parseInt(meses))
  return fecha.toISOString().split('T')[0]
}

const formatFecha = (fecha) => {
  if (!fecha) return '-'
  const f = new Date(fecha)
  return `${String(f.getDate()).padStart(2, '0')}-${String(f.getMonth() + 1).padStart(2, '0')}-${f.getFullYear()}`
}

const registrarAtleta = async () => {
  error.value = ''
  mensajeExito.value = ''
  const cedulaTrim = cedula.value.trim()
  const nombresTrim = nombres.value.trim()
  const apellidosTrim = apellidos.value.trim()
  const celularTrim = celular.value.trim()

  // 1️⃣ Validar que la cédula no esté registrada en atletas
const { data: atletasExistentes, error: errCheck } = await supabase
  .from('atletas')
  .select('*')
  .eq('cedula', cedulaTrim)

if (errCheck) {
  error.value = 'Error al verificar cédula: ' + errCheck.message
  return
}

// Si ya existe al menos un atleta con esa cédula
if (atletasExistentes && atletasExistentes.length > 0) {
  error.value = '❌ Esta cédula ya está registrada para otro atleta.'
  return
}

  // 2️⃣ Crear el usuario primero
  const { data: usuarioCreado, error: errUsuario } = await supabase
    .from('usuarios')
    .insert([{ cedula: cedulaTrim, password: cedulaTrim, rol: 'usuario' }])
    .select()
    .single()

  if (errUsuario || !usuarioCreado) {
    error.value = `Error al crear usuario: ${errUsuario?.message || 'Desconocido'}`
    return
  }

  // 3️⃣ Crear el atleta y asignarle el id del usuario recién creado
  const { error: errAtleta } = await supabase.from('atletas').insert([
    {
      nombres: nombresTrim,
      apellidos: apellidosTrim,
      fecha_nacimiento: fechaNacimiento.value,
      peso_inicial: pesoInicial.value,
      edad: calcularEdad(fechaNacimiento.value),
      estatura_inicial: estaturaInicial.value,
      fecha_inicio_membresia: fechaInicioMembresia.value,
      fecha_fin_membresia: calcularMembresia(fechaInicioMembresia.value, mesesMembresia.value),
      cedula: cedulaTrim,
      celular: celularTrim,
      usuario_id: usuarioCreado.id
    },
  ])

  if (errAtleta) {
    error.value = `Usuario creado, pero error al crear atleta: ${errAtleta.message}`
    return
  }

  mensajeExito.value = '✅ Atleta registrado correctamente.'
  setTimeout(() => (mensajeExito.value = ''), 4000)
  limpiarFormulario()
  await obtenerAtletas()
}

const limpiarFormulario = () => {
  nombres.value = ''
  apellidos.value = ''
  fechaNacimiento.value = ''
  pesoInicial.value = null
  estaturaInicial.value = null
  cedula.value = ''
  celular.value = ''
  mesesMembresia.value = ''
  fechaInicioMembresia.value = ''
}

const obtenerAtletas = async () => {
  const { data, error: err } = await supabase
    .from('atletas')
    .select('*')
    .order('fecha_inscripcion', { ascending: false })

  if (err) error.value = err.message
  else atletas.value = data
}

onMounted(obtenerAtletas)
</script>

<style scoped>
.contenedor {
  max-width: 900px;
  margin: 40px auto;
  background: #ffffff;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  color: #111827;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.titulo {
  text-align: center;
  color: #1f2937;
  font-size: 26px;
  margin-bottom: 20px;
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

.formulario {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
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


.campo input {
  padding: 10px;
  border: 1px solid #ccc; /* borde gris claro */
  border-radius: 8px;
  font-size: 15px;
  background-color: #ffffff; /* fondo blanco */
  color: #111827; /* texto oscuro */
  transition: 0.2s;
}

.campo input:focus {
  border-color: #1f2937; /* borde azul oscuro al enfocar */
  outline: none;
  box-shadow: 0 0 0 2px rgba(31, 41, 55, 0.2);
}

.btn-registrar,
.btn-refrescar {
  background-color: #1f2937;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s;
}

.btn-registrar:hover,
.btn-refrescar:hover {
  background-color: #374151;
}

.subtitulo {
  text-align: center;
  margin-top: 30px;
  color: #1f2937;
  font-size: 22px;
}

.tabla-contenedor {
  overflow-x: auto;
  margin-top: 15px;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  border: 2px solid #1f2937;
}

.tabla th {
  background-color: #1f2937;
  color: white;
  padding: 10px;
  font-weight: 600;
}

.tabla td {
  padding: 10px;
  border-top: 1px solid #ccc;
}

.mensaje-vacio {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.error-texto {
  color: red;
  font-size: 13px;
}

.separador {
  margin: 25px 0;
  border: none;
  border-top: 1px solid #e5e7eb;
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
    padding: 20px;
    margin: 20px;
    margin-top: 170px;
  }

  .titulo {
    font-size: 22px;
  }

  .tabla th, .tabla td {
    font-size: 14px;
    padding: 8px;
  }

  .btn-registrar,
  .btn-refrescar {
    width: 100%;
  }
}
</style>
