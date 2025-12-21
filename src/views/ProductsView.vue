<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
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
  <section>
    <header>
      <h1>Productos</h1>
    </header>
    <div v-if="loading">Cargando productos...</div>
    <div v-else>
      <div v-if="!productos || productos.length === 0">No hay productos disponibles</div>
      <ul v-else class="productos-grid">
        <li v-for="producto in productos" :key="producto.id" class="producto-card">
          <h3>{{ producto.name }}</h3>
          <p><strong>Precio:</strong> ${{ producto.price }}</p>
          <p><strong>Contenido:</strong> {{ producto.contents }}</p>
          <p><strong>Puntos:</strong> {{ producto.poins }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
