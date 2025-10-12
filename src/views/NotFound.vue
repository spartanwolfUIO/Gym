<template>
  <div class="not-found">
    <h1>404 - Página no encontrada</h1>
    <p>La ruta que buscaste no existe.</p>
    <router-link v-if="user" to="/">Volver al inicio</router-link>
    <router-link v-else to="/login">Ir al login</router-link>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const user = ref(JSON.parse(localStorage.getItem('usuario')))
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}
.not-found h1 {
  font-size: 2em;
  margin-bottom: 20px;
}
.not-found a {
  color: #3490dc;
  text-decoration: underline;
}
</style>
