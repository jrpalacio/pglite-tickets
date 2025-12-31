<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { PGlite } from '@electric-sql/pglite'
import html2canvas from 'html2canvas'

interface TicketDetail {
  ticket_id: number
  product_id: number
  product_name: string
  quantity: number
  subtotal: number
  price: number
}

interface Ticket {
  id: number
  total: number
  created_at: string
}

const db = inject<PGlite>('db')
const router = useRouter()
const route = useRoute()
const ticketDetailRef = ref<HTMLElement | null>(null)
const ticketId = ref<number>(Number(route.params.id))
const ticket = ref<Ticket | null>(null)
const detalles = ref<TicketDetail[]>([])
const loading = ref(true)
const sharing = ref(false)
const copying = ref(false)
const copied = ref(false)
const capturing = ref(false)
const canShare = typeof navigator !== 'undefined' && 'share' in navigator
const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText

onMounted(async () => {
  if (!db) {
    console.error('PGlite no está disponible')
    loading.value = false
    return
  }

  try {
    // Obtener ticket
    const ticketRes = await db.query<Ticket>(
      'SELECT id, total, created_at FROM tickets WHERE id = $1',
      [ticketId.value],
    )
    if (ticketRes.rows.length === 0) {
      console.warn('Ticket no encontrado')
      loading.value = false
      return
    }
    ticket.value = ticketRes.rows[0] || null

    // Obtener detalles con información de productos
    const detallesRes = await db.query<TicketDetail>(
      `SELECT
        td.ticket_id,
        td.product_id,
        p.name as product_name,
        td.quantity,
        td.subtotal,
        p.price
      FROM ticket_details td
      JOIN productos p ON td.product_id = p.id
      WHERE td.ticket_id = $1`,
      [ticketId.value],
    )
    detalles.value = detallesRes.rows
  } catch (error) {
    console.error('Error al cargar detalles del ticket:', error)
  } finally {
    loading.value = false
  }
})

const volver = () => {
  router.back()
}

const copyLink = async () => {
  if (!canCopy) {
    console.warn('Copiado no está disponible en este navegador')
    return
  }
  copying.value = true
  copied.value = false
  try {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1500)
  } catch (error) {
    console.error('Error al copiar enlace:', error)
  } finally {
    copying.value = false
  }
}

const compartir = async () => {
  if (!ticket.value) return
  if (!canShare) {
    await copyLink()
    return
  }
  sharing.value = true
  try {
    const shareData = {
      title: `Ticket #${ticket.value.id}`,
      text: `Total: $${Number(ticket.value.total).toFixed(2)}`,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
    await (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share?.(
      shareData,
    )
  } catch (error) {
    console.error('Error al compartir:', error)
  } finally {
    sharing.value = false
  }
}

const capturar = async () => {
  const node = ticketDetailRef.value
  if (!node) return
  capturing.value = true
  try {
    const canvas = await html2canvas(node, { scale: 2 })

    // Convertir canvas a blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png')
    })

    const fileName = `ticket-${ticketId.value}.png`
    const file = new File([blob], fileName, { type: 'image/png' })

    // Intentar compartir si está disponible
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Ticket #${ticketId.value}`,
        text: `Ticket - Total: $${Number(ticket.value?.total).toFixed(2)}`,
      })
    } else {
      // Fallback: descargar la imagen
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = fileName
      link.click()
    }
  } catch (error) {
    console.error('Error al capturar la imagen:', error)
  } finally {
    capturing.value = false
  }
}
</script>

<template>
  <main
    class="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 sm:p-6"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button
          @click="volver"
          class="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium w-fit"
        >
          ← Volver
        </button>
        <h1 v-if="ticket" class="text-2xl sm:text-3xl font-bold text-emerald-400">
          Ticket #{{ ticket.id }}
        </h1>
        <div v-else class="text-2xl sm:text-3xl font-bold text-slate-400">Detalles</div>

        <div class="flex gap-2 flex-wrap sm:flex-nowrap">
          <button
            class="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-sm"
            type="button"
            :disabled="sharing || copying"
            @click="compartir"
          >
            <span v-if="sharing">Compartiendo...</span>
            <span v-else-if="copying">Copiando enlace...</span>
            <span v-else-if="copied">¡Copiado!</span>
            <span v-else>📤 Compartir</span>
          </button>
          <button
            class="flex-1 sm:flex-none px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-sm"
            type="button"
            :disabled="capturing"
            @click="capturar"
          >
            {{ capturing ? '⏳ Capturando...' : '📸 Guardar captura' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <p class="text-slate-400">Cargando detalles del ticket...</p>
      </div>

      <!-- Not Found State -->
      <div
        v-else-if="!ticket"
        class="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center"
      >
        <p class="text-slate-300">📋 Ticket no encontrado.</p>
      </div>

      <!-- Ticket Details -->
      <div v-else ref="ticketDetailRef" class="space-y-6">
        <!-- Ticket Info Card -->
        <div
          class="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition-colors"
        >
          <h2 class="text-lg font-semibold mb-4 text-emerald-400">Información del Ticket</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span class="font-medium text-slate-300">Fecha:</span>
              <span class="text-white">{{ new Date(ticket.created_at).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
              <span class="font-medium text-slate-300">Total:</span>
              <span class="text-xl font-bold text-emerald-400"
                >${{ Number(ticket.total).toFixed(2) }}</span
              >
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div
          v-if="detalles.length > 0"
          class="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-slate-700 bg-slate-700/50">
            <h2 class="text-lg font-semibold text-emerald-400">📦 Productos</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-700/50 border-b border-slate-700">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-slate-300">Producto</th>
                  <th class="px-6 py-3 text-right text-sm font-semibold text-slate-300">Precio</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                    Cantidad
                  </th>
                  <th class="px-6 py-3 text-right text-sm font-semibold text-slate-300">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700">
                <tr
                  v-for="d in detalles"
                  :key="d.product_id"
                  class="hover:bg-slate-700/30 transition-colors"
                >
                  <td class="px-6 py-4 text-sm font-medium text-white">{{ d.product_name }}</td>
                  <td class="px-6 py-4 text-sm text-right text-slate-300">
                    ${{ Number(d.price).toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center text-slate-300">{{ d.quantity }}</td>
                  <td class="px-6 py-4 text-sm text-right font-semibold text-emerald-400">
                    ${{ Number(d.subtotal).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty Details State -->
        <div v-else class="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <p class="text-slate-400">📭 No hay detalles en este ticket.</p>
        </div>
      </div>
    </div>
  </main>
</template>
