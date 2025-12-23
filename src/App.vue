<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/tickets">Tickets</RouterLink>
      <RouterLink to="/productos">Productos</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
