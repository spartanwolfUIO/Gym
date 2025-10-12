<template>
  <div class="contenedor">
    <h2 class="titulo">📋 Mis Rutinas</h2>

    <div v-if="mensaje" class="error">{{ mensaje }}</div>

    <div v-if="rutinas.length">
      <table class="tabla-rutinas">
        <thead>
          <tr>
            <th>Día</th>
            <th>Rutina</th>
          </tr>
        </thead>
        <tbody>
  <tr v-for="r in rutinas" :key="r.id">
    <td :data-label="'Día'">{{ r.dia }}</td>
    <td :data-label="'Rutina'">{{ r.descripcion }}</td>
  </tr>
</tbody>

      </table>
    </div>

    <p v-else class="mensaje-vacio">No tienes rutinas asignadas.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../components/supebase'

const usuario = JSON.parse(localStorage.getItem('usuario'))

const rutinas = ref([])
const mensaje = ref('')

// Verifica que haya usuario logueado
if (!usuario) {
  mensaje.value = 'Debes iniciar sesión para ver tus rutinas.'
}

const cargarRutinas = async () => {
  if (!usuario) return

  const { data, error } = await supabase
    .from('rutinas')
    .select('*')
    .eq('atleta_id', usuario.id)
    .order('dia', { ascending: true })

  if (error) {
    mensaje.value = 'Error al cargar rutinas: ' + error.message
  } else {
    rutinas.value = data
  }
}

onMounted(cargarRutinas)
</script>

<style scoped>
.contenedor {
  max-width: 800px;
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

.tabla-rutinas {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.tabla-rutinas th,
.tabla-rutinas td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.tabla-rutinas th {
  background-color: #f3f3f3;
  color: #111827;
}

.mensaje-vacio {
  text-align: center;
  color: #6b7280;
  font-style: italic;
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
  .contenedor {
    padding: 20px;
    margin: 20px;
    margin-top: 170px;
  }

  .titulo {
    font-size: 22px;
  }

  .tabla-rutinas th,
  .tabla-rutinas td {
    padding: 6px;
    font-size: 14px;
  }
}

/* Para pantallas muy pequeñas */
@media (max-width: 480px) {
  .tabla-rutinas {
    border: 0;
  }

  .tabla-rutinas thead {
    display: none; /* ocultar encabezados originales */
  }

  .tabla-rutinas tr {
    display: block;
    margin-bottom: 15px;
    background: #f9fafb;
    padding: 10px;
    border-radius: 8px;
  }

  .tabla-rutinas td {
    display: flex;
    justify-content: space-between;
    padding: 6px 8px;
    border: 0;
    font-size: 14px;
  }

  .tabla-rutinas td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #1f2937;
  }
}

</style>
