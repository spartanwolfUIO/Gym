<template>
  <div class="max-w-md mx-auto mt-20 p-6 border rounded shadow">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login">
      <div>
        <label>Cédula:</label>
        <input v-model="cedula" type="text" required />
      </div>
      <div>
        <label>Contraseña:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Ingresar</button>
    </form>
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
  import { supabase } from '../components/supebase'

const cedula = ref('')
const password = ref('')
const error = ref(null)

const login = async () => {
  error.value = null

  // 1️⃣ Buscar usuario (incluye rol)
  const { data: user, error: errUser } = await supabase
    .from('usuarios')
    .select('id, password, rol')
    .eq('cedula', cedula.value)
    .single()

  if (errUser || !user) {
    error.value = 'Usuario no encontrado'
    return
  }

  // 2️⃣ Validar contraseña
  if (user.password !== password.value) {
    error.value = 'Contraseña incorrecta'
    return
  }

  // 3️⃣ Buscar atleta asociado
  const { data: atleta, error: errAtleta } = await supabase
    .from('atletas')
    .select('*')
    .eq('usuario_id', user.id)
    .single()

  if (errAtleta || !atleta) {
    error.value = 'El usuario no tiene atleta asociado'
    return
  }

  // 4️⃣ Unir rol del usuario con la data del atleta
  const atletaSession = {
    ...atleta,
    rol: user.rol
  }

  // 5️⃣ Guardar sesión
  localStorage.setItem('usuario', JSON.stringify(atletaSession))

  // 6️⃣ Redirigir
  window.location.href = '/'
}


</script>
<style scoped>
/* Contenedor principal */
div {
  max-width: 400px;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #111827;
}

/* Título */
h2 {
  text-align: center;
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 20px;
}

/* Formulario */
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Campos del formulario */
label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
  color: #1f2937;
}

input[type="text"],
input[type="password"] {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  width: 100%;
  background-color: #ffffff; /* fondo claro */
  color: #111827;
}

/* Botón */
button {
  background-color: #1f2937;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.3s;
}

button:hover {
  background-color: #374151;
}

/* Mensajes de error */
p {
  margin-top: 10px;
  text-align: center;
  color: #991b1b;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 480px) {
  div {
    margin: 40px 20px 0;
    padding: 20px;
  }

  input[type="text"],
  input[type="password"],
  button {
    width: 100%;
    font-size: 14px;
  }
}
</style>
