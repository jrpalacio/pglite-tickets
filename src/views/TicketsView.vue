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
  <main
    class="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl sm:text-5xl font-bold text-white mb-2">Mis Tickets</h1>
        <p class="text-slate-400 text-lg">
          Gestiona y visualiza todos tus tickets en un solo lugar
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p class="ml-4 text-slate-300 text-lg">Cargando tickets...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="tickets.length === 0"
        class="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center"
      >
        <div class="text-6xl mb-4">📋</div>
        <h3 class="text-xl font-semibold text-white mb-2">No hay tickets disponibles</h3>
        <p class="text-slate-400">Crea tu primer ticket para comenzar</p>
      </div>

      <!-- Tickets Grid -->
      <div v-else class="space-y-4">
        <div
          v-for="t in tickets"
          :key="t.id"
          @click="verDetalles(t.id)"
          class="group bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600 hover:border-emerald-500 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- ID -->
            <div class="flex items-center gap-3">
              <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
                <span class="text-emerald-400 font-bold text-lg">#{{ t.id }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="flex items-center gap-2">
              <span class="text-slate-400">Total:</span>
              <span class="text-2xl font-bold text-emerald-400"
                >${{ Number(t.total).toFixed(2) }}</span
              >
            </div>

            <!-- Date -->
            <div class="flex items-center gap-2 text-slate-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span class="text-sm">{{
                new Date(t.created_at).toLocaleDateString('es-MX', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              }}</span>
            </div>

            <!-- Arrow Icon -->
            <div class="shrink-0">
              <svg
                class="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
