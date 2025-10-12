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

  const { data: user, error: err } = await supabase
    .from('usuarios')
    .select('*')
    .eq('cedula', cedula.value)
    .single()

  if (err || !user) {
    error.value = 'Usuario no encontrado'
    return
  }

  if (user.password !== password.value) {
    error.value = 'Contraseña incorrecta'
    return
  }

  localStorage.setItem('usuario', JSON.stringify(user))
  window.location.href = '/' // redirige al home
}
</script>
<style scoped>
/* Contenedor principal */
div {
  max-width: 400px;
  margin: 80px auto 0;
  background: #ffffff;
  padding: 25px;
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
