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
      'INSERT INTO tickets (total, acumulated_poins) VALUES ($1, $2 ) RETURNING id',
      [totalPrecio.value, totalPuntos.value],
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
  <main
    class="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl sm:text-5xl font-bold text-white mb-2">Crear Ticket</h1>
        <p class="text-slate-400 text-lg">Selecciona productos y gestiona tu compra</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p class="ml-4 text-slate-300 text-lg">Cargando productos...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Productos Seleccionados -->
        <section class="lg:col-span-2">
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <svg class="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Productos Seleccionados
            </h2>

            <!-- Empty State -->
            <div
              v-if="itemsSeleccionados.length === 0"
              class="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center"
            >
              <div class="text-5xl mb-4">🛒</div>
              <h3 class="text-lg font-semibold text-white mb-2">No hay productos seleccionados</h3>
              <p class="text-slate-400">Agrega productos para empezar tu compra</p>
            </div>

            <!-- Items List -->
            <div v-else class="space-y-4 mb-6">
              <div
                v-for="(item, index) in itemsSeleccionados"
                :key="item.id"
                class="bg-linear-to-r from-slate-700 to-slate-600 border border-slate-500 hover:border-emerald-500 rounded-lg p-4 transition-all"
              >
                <div class="flex flex-col sm:flex-row gap-3 items-center">
                  <!-- Select Product -->
                  <select
                    v-model.number="item.productoId"
                    class="flex-1 bg-slate-800 border border-slate-500 text-white rounded px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option :value="null" class="bg-slate-800">-- Selecciona un producto --</option>
                    <option v-for="p in productos" :key="p.id" :value="p.id" class="bg-slate-800">
                      {{ p.name }} - ${{ p.price }} ({{ p.poins }} pts)
                    </option>
                  </select>

                  <!-- Quantity Input -->
                  <div class="flex items-center gap-2">
                    <label class="text-slate-300 text-sm whitespace-nowrap">Cantidad:</label>
                    <input
                      type="number"
                      min="1"
                      v-model.number="item.quantity"
                      class="w-20 bg-slate-800 border border-slate-500 text-white rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <!-- Delete Button -->
                  <button
                    @click="eliminarSelect(index)"
                    class="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 hover:text-red-300 rounded px-3 py-2 transition-all"
                    type="button"
                    title="Eliminar producto"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Product Info -->
                <div v-if="getProducto(item.productoId)" class="mt-2 text-sm text-slate-300">
                  Subtotal:
                  <span class="text-emerald-400 font-semibold"
                    >${{
                      ((getProducto(item.productoId)?.price || 0) * (item.quantity || 1)).toFixed(2)
                    }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Add Button -->
            <button
              @click="agregarSelect"
              class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg px-6 py-3 transition-all duration-300 flex items-center justify-center gap-2"
              type="button"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clip-rule="evenodd"
                />
              </svg>
              Agregar Producto
            </button>
          </div>
        </section>

        <!-- Resumen Lateral -->
        <section class="h-fit">
          <div
            class="sticky top-4 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-lg p-8 text-white shadow-2xl shadow-emerald-500/20 border border-emerald-400/30"
          >
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
              Resumen
            </h2>

            <!-- Total Items -->
            <div class="mb-6 p-4 bg-white/10 rounded-lg">
              <p class="text-emerald-100 text-sm">Items seleccionados</p>
              <p class="text-3xl font-bold">{{ itemsSeleccionados.length }}</p>
            </div>

            <!-- Total Precio -->
            <div class="mb-4 pb-4 border-b border-emerald-400/30">
              <p class="text-emerald-100 text-sm mb-1">Total Precio</p>
              <p class="text-4xl font-bold">${{ totalPrecio.toFixed(2) }}</p>
            </div>

            <!-- Total Puntos -->
            <div class="mb-8">
              <p class="text-emerald-100 text-sm mb-1">Total Puntos</p>
              <p class="text-3xl font-bold">{{ totalPuntos }}</p>
            </div>

            <!-- Save Button -->
            <button
              class="w-full bg-white text-emerald-600 font-bold rounded-lg px-6 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="button"
              :disabled="guardando || itemsSeleccionados.length === 0"
              @click="guardarTicket"
            >
              <svg v-if="!guardando" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M5 13a3 3 0 105 5H5a1 1 0 110-2h5v-2H5a1 1 0 110-2h5V5H5a1 1 0 110-2h5a3 3 0 00-3-3H5a5 5 0 000 10z"
                />
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ guardando ? 'Guardando...' : 'Guardar Ticket' }}
            </button>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
