<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { PGlite } from '@electric-sql/pglite'

// Inyectar la instancia de PGlite y cargar tickets
const db = inject<PGlite>('db')
const router = useRouter()
type TicketRow = { id: number; total: number; created_at: string }
const tickets = ref<TicketRow[]>([])
const loading = ref(true)

const verDetalles = (ticketId: number) => {
  router.push({ name: 'ticket-detail', params: { id: ticketId } })
}

onMounted(async () => {
  if (!db) {
    console.error('PGlite no está disponible')
    loading.value = false
    return
  }

  try {
    const result = await db.query<TicketRow>(
      'SELECT id, total, created_at FROM tickets ORDER BY created_at DESC',
    )
    tickets.value = result.rows
  } catch (error) {
    console.error('Error al cargar tickets:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main>
    <h1>Tickets</h1>
    <div v-if="loading" class="loading">Cargando tickets...</div>
    <div v-else>
      <div v-if="tickets.length === 0" class="sin-items">No hay tickets disponibles.</div>
      <ul v-else class="tickets-list">
        <li
          v-for="t in tickets"
          :key="t.id"
          class="ticket-item"
          @click="verDetalles(t.id)"
          role="button"
          tabindex="0"
        >
          <span class="ticket-id">#{{ t.id }}</span>
          <span class="ticket-total">${{ Number(t.total).toFixed(2) }}</span>
          <span class="ticket-date">{{ new Date(t.created_at).toLocaleString() }}</span>
        </li>
      </ul>
    </div>
  </main>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.tickets-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.ticket-item {
  display: grid;
  grid-template-columns: 100px 1fr 240px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background 0.2s ease;
}

.ticket-item:hover {
  background: #f9f9f9;
}

.ticket-item:last-child {
  border-bottom: none;
}

.ticket-id {
  font-weight: 600;
}

.ticket-total {
  color: #42b983;
}

.ticket-date {
  color: #666;
  text-align: right;
}

.sin-items {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
  font-style: italic;
}
</style>
