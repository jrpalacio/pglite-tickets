<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import type { PGlite } from '@electric-sql/pglite'
import type { Producto } from '../types/types'

interface ItemSeleccionado {
  id: string
  productoId: number | null
}

// Inyectar la instancia de PGlite usando inject nativo de Vue
const db = inject<PGlite>('db')
const tickets = ref<Producto[]>([])
const loading = ref(true)

const getTicket = (id: number | null) => {
  if (!id) return null
  return tickets.value.find((p) => p.id === id)
}

onMounted(async () => {
  if (!db) {
    console.error('PGlite no está disponible')
    loading.value = false
    return
  }

  try {
    const result = await db.query<Producto>('SELECT * FROM tickets ORDER BY id')
    tickets.value = result.rows
  } catch (error) {
    console.error('Error al cargar productos:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1>Tickets</h1>
    <div v-if="loading">Cargando tickets...</div>
    <div v-else>
      <template v-if="tickets.length === 0">
        <p>No hay tickets disponibles.</p>
      </template>
      <template v-else>
        <pre
          >{{ tickets }}
        </pre>
      </template>
    </div>
  </div>
</template>
