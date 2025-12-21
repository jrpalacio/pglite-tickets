<script lang="ts" setup>
import { ref, inject, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { PGlite } from '@electric-sql/pglite'

interface Producto {
  id: number
  name: string
  price: number
  category: number
  poins: number
  contents: string
  created_at: string
}

// Inyectar la instancia de PGlite usando inject nativo de Vue
const db = inject<PGlite>('db')
const productos = ref<Producto[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!db) {
    console.error('PGlite no está disponible')
    loading.value = false
    return
  }

  try {
    const result = await db.query<Producto>('SELECT * FROM productos ORDER BY id')
    productos.value = result.rows
  } catch (error) {
    console.error('Error al cargar productos:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <header>
    <h1>Sistema de Tickets - PGlite</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>

  <main>
    <h2>Productos Disponibles</h2>

    <div v-if="!productos || productos.length === 0">No hay productos disponibles</div>

    <div v-else class="productos-grid">
      <div v-for="producto in productos" :key="producto.id" class="producto-card">
        <h3>{{ producto.name }}</h3>
        <p><strong>Precio:</strong> ${{ producto.price }}</p>
        <p><strong>Contenido:</strong> {{ producto.contents }}</p>
        <p><strong>Puntos:</strong> {{ producto.poins }}</p>
      </div>
    </div>

    <RouterView />
  </main>
</template>

<style scoped>
header {
  padding: 1rem;
  border-bottom: 1px solid #ccc;
}

nav {
  margin-top: 1rem;
}

nav a {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
}

nav a.router-link-exact-active {
  font-weight: bold;
  color: #42b983;
}

main {
  padding: 2rem;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.producto-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: #f9f9f9;
}

.producto-card h3 {
  margin-top: 0;
  color: #42b983;
}
</style>
