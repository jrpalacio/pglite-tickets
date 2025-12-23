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
const productos = ref<Producto[]>([])
const loading = ref(true)
const itemsSeleccionados = ref<ItemSeleccionado[]>([])

const getProducto = (id: number | null) => {
  if (!id) return null
  return productos.value.find((p) => p.id === id)
}

const totalPrecio = computed(() => {
  return itemsSeleccionados.value.reduce((sum, item) => {
    const producto = getProducto(item.productoId)
    return sum + (parseFloat(producto?.price as unknown as string) || 0)
  }, 0)
})

const totalPuntos = computed(() => {
  return itemsSeleccionados.value.reduce((sum, item) => {
    const producto = getProducto(item.productoId)
    return sum + (producto?.poins || 0)
  }, 0)
})

const agregarSelect = () => {
  itemsSeleccionados.value.push({
    id: `item-${Date.now()}-${Math.random()}`,
    productoId: null,
  })
}

const eliminarSelect = (index: number) => {
  itemsSeleccionados.value.splice(index, 1)
}

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
  <main>
    <div v-if="loading" class="loading">Cargando productos...</div>
    <div v-else class="tickets-container">
      <section class="selecciones">
        <h2>Productos Seleccionados</h2>
        <div v-if="itemsSeleccionados.length === 0" class="sin-items">
          No hay productos seleccionados. ¡Agrega uno!
        </div>
        <div v-else class="items-list">
          <div v-for="(item, index) in itemsSeleccionados" :key="item.id" class="item-select">
            <select v-model.number="item.productoId">
              <option :value="null">-- Selecciona un producto --</option>
              <option v-for="producto in productos" :key="producto.id" :value="producto.id">
                {{ producto.name }} - ${{ producto.price }} ({{ producto.poins }} pts)
              </option>
            </select>
            <button @click="eliminarSelect(index)" class="btn-eliminar" type="button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-trash-icon lucide-trash"
              >
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
        <button @click="agregarSelect" class="btn-agregar" type="button">+ Agregar Producto</button>
      </section>

      <section class="resumen">
        <h2>Resumen del Ticket</h2>
        <div class="resumen-item">
          <span>Total Precio:</span>
          <strong>${{ totalPrecio.toFixed(2) }}</strong>
        </div>
        <div class="resumen-item">
          <span>Total Puntos:</span>
          <strong>{{ totalPuntos }}</strong>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.tickets-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.selecciones {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.selecciones h2,
.resumen h2 {
  margin-top: 0;
  color: #333;
}

.sin-items {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
  font-style: italic;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.item-select {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.item-select select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.item-select select:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.btn-agregar,
.btn-eliminar {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-agregar {
  width: 100%;
  background: #42b983;
  color: white;
  font-weight: 600;
}

.btn-agregar:hover {
  background: #36a373;
}

.btn-eliminar {
  background: #ff6b6b;
  color: white;
  padding: 0.5rem 0.75rem;
  font-size: 13px;
}

.btn-eliminar:hover {
  background: #ee5a52;
}

.resumen {
  background: white;
  border: 2px solid #42b983;
  padding: 1.5rem;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 1rem;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.resumen-item:last-child {
  border-bottom: none;
}

.resumen-item span {
  color: #666;
}

.resumen-item strong {
  color: #42b983;
  font-size: 1.2em;
}

@media (max-width: 768px) {
  .tickets-container {
    grid-template-columns: 1fr;
  }

  .resumen {
    position: static;
  }
}
</style>
