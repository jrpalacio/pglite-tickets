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
  <main>
    <div class="header">
      <button @click="volver" class="btn-volver">← Volver</button>
      <h1 v-if="ticket">Ticket #{{ ticket.id }}</h1>
      <div class="actions">
        <button class="btn-share" type="button" :disabled="sharing || copying" @click="compartir">
          <span v-if="sharing">Compartiendo...</span>
          <span v-else-if="copying">Copiando enlace...</span>
          <span v-else-if="copied">¡Copiado!</span>
          <span v-else>Compartir</span>
        </button>
        <button class="btn-capture" type="button" :disabled="capturing" @click="capturar">
          {{ capturing ? 'Capturando...' : 'Guardar captura' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando detalles del ticket...</div>

    <div v-else-if="!ticket" class="sin-items">Ticket no encontrado.</div>

    <div v-else class="ticket-detail" ref="ticketDetailRef">
      <section class="ticket-info">
        <div class="info-item">
          <span class="label">Fecha:</span>
          <span class="value">{{ new Date(ticket.created_at).toLocaleString() }}</span>
        </div>
        <div class="info-item">
          <span class="label">Total:</span>
          <span class="value total">${{ Number(ticket.total).toFixed(2) }}</span>
        </div>
      </section>

      <section v-if="detalles.length > 0" class="detalles">
        <h2>Productos</h2>
        <table class="detalles-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in detalles" :key="d.product_id" class="detail-row">
              <td class="product-name">{{ d.product_name }}</td>
              <td class="price">${{ Number(d.price).toFixed(2) }}</td>
              <td class="quantity">{{ d.quantity }}</td>
              <td class="subtotal">${{ Number(d.subtotal).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div v-else class="sin-items">No hay detalles en este ticket.</div>
    </div>
  </main>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-volver {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.btn-volver:hover {
  background: #e0e0e0;
}

.btn-share {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: #42b983;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.btn-share:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-share:not(:disabled):hover {
  background: #36a373;
}

.btn-capture {
  padding: 0.5rem 1rem;
  background: #2c3e50;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.btn-capture:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-capture:not(:disabled):hover {
  background: #1f2f3f;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.sin-items {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
  font-style: italic;
}

.ticket-detail {
  max-width: 800px;
  margin: 0 auto;
}

.ticket-info {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 600;
  color: #333;
}

.value {
  color: #666;
}

.total {
  color: #42b983;
  font-size: 1.2em;
  font-weight: 600;
}

.detalles {
  margin-bottom: 2rem;
}

.detalles h2 {
  margin-bottom: 1rem;
  color: #333;
}

.detalles-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.detalles-table thead {
  background: #f9f9f9;
}

.detalles-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #ddd;
}

.detalles-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.detail-row:last-child td {
  border-bottom: none;
}

.product-name {
  font-weight: 500;
  color: #333;
}

.price,
.quantity,
.subtotal {
  text-align: right;
  color: #666;
}

.subtotal {
  color: #42b983;
  font-weight: 600;
}

@media (max-width: 600px) {
  .ticket-info {
    grid-template-columns: 1fr;
  }

  .detalles-table {
    font-size: 14px;
  }

  .detalles-table th,
  .detalles-table td {
    padding: 0.5rem;
  }
}
</style>
