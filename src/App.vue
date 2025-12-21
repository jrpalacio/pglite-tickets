<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <h1>Tickets</h1>
    <nav>
      <RouterLink to="/">Tickets</RouterLink>
      <RouterLink to="/productos">Productos</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
