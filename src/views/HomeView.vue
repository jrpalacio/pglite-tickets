<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PGlite } from '@electric-sql/pglite'
import type { Producto } from '../types/types'

interface ItemSeleccionado {
  id: string
  productoId: number | null
  quantity: number
}

// Inyectar la instancia de PGlite
const db = inject<PGlite>('db')
const productos = ref<Producto[]>([])
const loading = ref(true)
const itemsSeleccionados = ref<ItemSeleccionado[]>([])
const guardando = ref(false)
const router = useRouter()

const getProducto = (id: number | null) => {
  if (!id) return null
  return productos.value.find((p) => p.id === id) || null
}

const totalPrecio = computed(() => {
  return itemsSeleccionados.value.reduce((sum, item) => {
    const producto = getProducto(item.productoId)
    const price = producto?.price ?? 0
    return sum + price * (item.quantity || 0)
  }, 0)
})

const totalPuntos = computed(() => {
  return itemsSeleccionados.value.reduce((sum, item) => {
    const producto = getProducto(item.productoId)
    const pts = producto?.poins ?? 0
    return sum + pts * (item.quantity || 0)
  }, 0)
})

const agregarSelect = () => {
  itemsSeleccionados.value.push({
    id: `item-${Date.now()}-${Math.random()}`,
    productoId: null,
    quantity: 1,
  })
}

const eliminarSelect = (index: number) => {
  itemsSeleccionados.value.splice(index, 1)
}

const guardarTicket = async () => {
  if (!db) {
    console.error('PGlite no está disponible')
    return
  }
  if (itemsSeleccionados.value.length === 0) {
    console.warn('No hay items para guardar')
    return
  }

  // Preparar datos de detalle
  const detalles = itemsSeleccionados.value
    .map((item) => {
      const p = getProducto(item.productoId)
      if (!p) return null
      const cantidad = Math.max(1, item.quantity || 1)
      const subtotal = p.price * cantidad
      return { product_id: p.id, quantity: cantidad, subtotal }
    })
    .filter(Boolean) as { product_id: number; quantity: number; subtotal: number }[]

  if (detalles.length === 0) {
    console.warn('Selecciona al menos un producto válido')
    return
  }

  guardando.value = true
  try {
    // Iniciar transacción
    await db.exec('BEGIN')

    // Insertar el ticket y obtener id
    const ticketRes = await db.query<{ id: number }>(
      'INSERT INTO tickets (total) VALUES ($1) RETURNING id',
      [totalPrecio.value],
    )
    const ticketId = ticketRes.rows[0]?.id
    if (!ticketId) throw new Error('No se pudo crear el ticket')

    // Insertar detalles
    for (const d of detalles) {
      await db.query(
        'INSERT INTO ticket_details (ticket_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)',
        [ticketId, d.product_id, d.quantity, d.subtotal],
      )
    }

    // Confirmar transacción
    await db.exec('COMMIT')

    // Reset y feedback
    itemsSeleccionados.value = []
    console.log('Ticket guardado correctamente, id:', ticketId)
    // Navegar al listado de tickets
    router.push({ name: 'tickets' })
  } catch (error) {
    console.error('Error guardando ticket:', error)
    try {
      await db.exec('ROLLBACK')
    } catch {}
  } finally {
    guardando.value = false
  }
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
  <header>
    <h1>Nuevo Ticket</h1>
  </header>
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
              <option v-for="p in productos" :key="p.id" :value="p.id">
                {{ p.name }} - ${{ p.price }} ({{ p.poins }} pts)
              </option>
            </select>
            <input type="number" min="1" v-model.number="item.quantity" class="qty-input" />
            <button @click="eliminarSelect(index)" class="btn-eliminar" type="button">
              Eliminar
            </button>
          </div>
        </div>
        <button @click="agregarSelect" class="btn-agregar" type="button">+ Agregar Producto</button>
      </section>

      <section class="resumen">
        <h2>Resumen</h2>
        <div class="resumen-item">
          <span>Total Precio:</span>
          <strong>${{ totalPrecio.toFixed(2) }}</strong>
        </div>
        <div class="resumen-item">
          <span>Total Puntos:</span>
          <strong>{{ totalPuntos }}</strong>
        </div>

        <button
          class="btn-guardar"
          type="button"
          :disabled="guardando || itemsSeleccionados.length === 0"
          @click="guardarTicket"
        >
          {{ guardando ? 'Guardando...' : 'Guardar Ticket' }}
        </button>
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

.qty-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.item-select select:focus,
.qty-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.btn-agregar,
.btn-eliminar,
.btn-guardar {
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

.btn-guardar {
  width: 100%;
  background: #2c3e50;
  color: white;
  font-weight: 600;
  margin-top: 1rem;
}

.btn-guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
