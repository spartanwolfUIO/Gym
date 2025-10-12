<template>
  <div id="app">
    <Nav v-if="usuario" />
    <router-view />
  </div>
</template>

<script setup>
import Nav from './views/Nav.vue'
import { ref } from 'vue'

const usuario = ref(JSON.parse(localStorage.getItem('usuario')))
</script>


<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
