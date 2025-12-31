<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-col h-dvh bg-slate-50">
    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>

    <!-- Navigation Footer -->
    <footer class="border-t border-slate-200 bg-white shadow-lg">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-center gap-8 py-6">
          <RouterLink
            to="/"
            class="group flex flex-col items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 hover:bg-slate-100 active:bg-emerald-50"
            :class="$route.path === '/' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700'"
          >
            <svg
              class="w-6 h-6 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span class="text-sm font-semibold">Crear Ticket</span>
          </RouterLink>

          <RouterLink
            to="/tickets"
            class="group flex flex-col items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 hover:bg-slate-100 active:bg-emerald-50"
            :class="$route.path === '/tickets' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700'"
          >
            <svg
              class="w-6 h-6 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span class="text-sm font-semibold">Mis Tickets</span>
          </RouterLink>
        </div>
      </nav>
    </footer>
  </div>
</template>
