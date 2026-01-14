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
    <footer
      class="relative border-t border-slate-700/50 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-slate-900/50 backdrop-blur-sm"
    >
      <!-- Gradient overlay -->
      <div
        class="absolute inset-0 bg-linear-to-b from-transparent to-slate-900/20 pointer-events-none"
      ></div>

      <nav class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-center gap-4 py-4">
          <RouterLink
            to="/"
            class="group relative flex flex-col items-center gap-2 px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
            :class="
              $route.path === '/'
                ? 'bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            "
          >
            <!-- Active indicator bar -->
            <div
              v-if="$route.path === '/'"
              class="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-linear-to-r from-emerald-400 to-emerald-300 rounded-full"
            ></div>

            <svg
              class="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
              :class="$route.path === '/' ? 'drop-shadow-lg' : ''"
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
            <span class="text-sm font-bold tracking-wide">Crear Ticket</span>

            <!-- Glow effect on hover -->
            <div
              class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-emerald-500/20 to-transparent pointer-events-none"
            ></div>
          </RouterLink>

          <RouterLink
            to="/tickets"
            class="group relative flex flex-col items-center gap-2 px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105"
            :class="
              $route.path === '/tickets'
                ? 'bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            "
          >
            <!-- Active indicator bar -->
            <div
              v-if="$route.path === '/tickets'"
              class="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-linear-to-r from-emerald-400 to-emerald-300 rounded-full"
            ></div>

            <svg
              class="w-7 h-7 transition-transform duration-300 group-hover:scale-110"
              :class="$route.path === '/tickets' ? 'drop-shadow-lg' : ''"
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
            <span class="text-sm font-bold tracking-wide">Mis Tickets</span>

            <!-- Glow effect on hover -->
            <div
              class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-emerald-500/20 to-transparent pointer-events-none"
            ></div>
          </RouterLink>
        </div>
      </nav>
    </footer>
  </div>
</template>
