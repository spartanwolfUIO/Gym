<template>
  <div class="contenedor">
    <h2 class="titulo">📊 Mis Mediciones</h2>

    <div v-if="misMediciones.length" class="tabla-container">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Peso (Kg)</th>
            <th>Estatura (Mts)</th>
            <th>BMI</th>
            <th>% Grasa</th>
            <th>% Músculo</th>
            <th>Kcal</th>
            <th>Edad Metabólica</th>
            <th>Grasa Visceral</th>
            <th>Bíceps I/D</th>
            <th>Piernas I/D</th>
            <th>Gluteos</th>
            <th>Abdomen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in misMediciones" :key="m.id">
            <td>{{ formatFecha(m.fecha_medicion) }}</td>
            <td>{{ m.peso }}</td>
            <td>{{ m.estatura }}</td>
            <td>{{ m.bmi || '-' }}</td>
            <td>{{ m.porcentaje_grasa || '-' }}</td>
            <td>{{ m.porcentaje_musculo || '-' }}</td>
            <td>{{ m.kcal || '-' }}</td>
            <td>{{ m.edad_metabolica || '-' }}</td>
            <td>{{ m.grasa_visceral || '-' }}</td>
            <td>{{ m.bicep_izquierdo || '-' }}/{{ m.bicep_derecho || '-' }}</td>
            <td>{{ m.pierna_izquierda || '-' }}/{{ m.pierna_derecha || '-' }}</td>
            <td>{{ m.gluteos || '-' }}</td>
            <td>{{ m.abdomen || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="mensaje-vacio">No hay mediciones registradas.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../components/supebase'

const usuario = JSON.parse(localStorage.getItem('usuario'))
const misMediciones = ref([])

const cargarMisMediciones = async () => {
  if (!usuario) return
  const { data, error } = await supabase
    .from('mediciones')
    .select('*')
    .eq('atleta_id', usuario.id)
    .order('fecha_medicion', { ascending: false })
  if (error) console.error(error)
  misMediciones.value = data || []
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

onMounted(() => {
  if (usuario) cargarMisMediciones()
})
</script>

<style scoped>
.contenedor {
  max-width: 1200px;
  margin: 50px auto;
  padding: 25px;
  background-color: #ffffff;
  border-radius: 15px;
  color: #111827;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.titulo {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #1f2937; /* azul oscuro principal */
  margin-bottom: 30px;
}

.tabla-container table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000000; /* borde negro de la tabla */
  background-color: #f9fafb;
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
/* Responsive para móviles */
@media (max-width: 768px) {
  .contenedor {
    padding: 15px;
    margin: 20px auto;
  }

  .titulo {
    font-size: 22px;
    margin-bottom: 20px;
  }

  /* Hacer la tabla scrollable horizontal */
  .tabla-container {
    overflow-x: auto;
  }

  table {
    min-width: 800px; /* fuerza scroll si no cabe */
    font-size: 12px;
  }

  thead th,
  tbody td {
    padding: 6px;
  }
}

</style>
