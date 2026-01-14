<script setup lang="ts">
import { ref } from 'vue'
import IconChevronDown from './icons/IconChevronDown.vue'

// recibe una lista de productos como props
const props = defineProps<{
  products: Array<{ id: number; name: string }>
}>()

const showList = ref(false)

function toggleList() {
  showList.value = !showList.value
}
</script>

<template>
  <article
    class="flex justify-between items-center bg-slate-800 border border-slate-500 text-white rounded px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    @click="toggleList"
  >
    <p>Selecciona un producto</p>
    <IconChevronDown />
  </article>
  <!-- mostrar un panel por encima de todo y que cubra toda la pantalla de forma dinamica-->
  <article
    v-if="showList"
    class="absolute top-0 left-0 w-full h-dvh bg-neutral-800 z-50 text-black"
  >
    <div class="h-dvh overflow-y-auto border border-blue-600">
      <section class="">
        <div class="flex justify-end p-4">
          <button @click="toggleList" class="p-2 bg-red-600 text-white rounded">Cerrar</button>
        </div>
      </section>

      <section class="p-4">
        <ul class="bg-neutral-600 max-w-md mx-auto rounded-2xl shadow-lg">
          <li
            v-for="item in props.products"
            :key="item.id"
            class="border-b last:border-0 p-4 hover:bg-slate-200 cursor-pointer"
          >
            Producto {{ item.name }}
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>
