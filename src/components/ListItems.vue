<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import IconChevronDown from './icons/IconChevronDown.vue'

const props = withDefaults(
  defineProps<{
    products: Array<{ id: number; name: string }>
    modelValue?: number | null
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: 'Selecciona un producto',
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', item: { id: number; name: string } | null): void
}>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const selectedId = ref<number | null>(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    selectedId.value = v
  },
)

const selectedItem = computed(() => {
  return props.products.find((p) => p.id === selectedId.value) ?? null
})

function toggleList() {
  if (props.disabled) return
  open.value = !open.value
}

function selectItem(item: { id: number; name: string }) {
  selectedId.value = item.id
  emit('update:modelValue', item.id)
  emit('change', item)
  open.value = false
}

const activeIndex = ref<number>(-1)

watch(open, (val) => {
  if (val) {
    const idx = props.products.findIndex((p) => p.id === selectedId.value)
    activeIndex.value = idx >= 0 ? idx : props.products.length > 0 ? 0 : -1
  } else {
    activeIndex.value = -1
  }
})

function onButtonKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  switch (e.key) {
    case 'Enter':
    case ' ': {
      e.preventDefault()
      if (!open.value) {
        open.value = true
      } else if (activeIndex.value >= 0) {
        const item = props.products[activeIndex.value]
        if (item) selectItem(item)
      }
      break
    }
    case 'ArrowDown': {
      e.preventDefault()
      if (!open.value) open.value = true
      if (props.products.length > 0) {
        activeIndex.value =
          activeIndex.value < props.products.length - 1
            ? Math.max(0, activeIndex.value + 1)
            : props.products.length - 1
      }
      break
    }
    case 'ArrowUp': {
      e.preventDefault()
      if (!open.value) open.value = true
      if (props.products.length > 0) {
        activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : 0
      }
      break
    }
    case 'Escape':
    case 'Tab': {
      open.value = false
      break
    }
  }
}

function onDocumentClick(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as Node | null
  if (root.value && target && !root.value.contains(target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="group flex justify-between items-center w-full bg-linear-to-r from-slate-800 to-slate-700 border border-slate-600 hover:border-emerald-500/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-emerald-500/10"
      :aria-haspopup="'listbox'"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="products-listbox"
      :disabled="props.disabled"
      @click="toggleList"
      @keydown="onButtonKeydown"
    >
      <span :class="selectedItem ? 'text-white font-medium' : 'text-slate-400'">
        {{ selectedItem?.name ?? props.placeholder }}
      </span>
      <IconChevronDown
        class="transition-transform duration-300 text-emerald-400 group-hover:text-emerald-300"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="open"
        class="absolute mt-2 left-0 w-full bg-linear-to-br from-slate-800 via-slate-750 to-slate-800 z-50 text-white rounded-xl shadow-2xl shadow-emerald-500/20 border border-slate-600 backdrop-blur-sm overflow-hidden"
        role="listbox"
        id="products-listbox"
      >
        <ul
          class="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        >
          <li
            v-for="(item, index) in props.products"
            :key="item.id"
            role="option"
            :aria-selected="selectedId === item.id ? 'true' : 'false'"
            class="relative border-b border-slate-700/50 last:border-0 p-4 cursor-pointer transition-all duration-200 hover:bg-linear-to-r hover:from-emerald-500/20 hover:to-emerald-600/20 hover:pl-6"
            :class="{
              'bg-linear-to-r from-emerald-500/10 to-emerald-600/10': activeIndex === index,
              'font-semibold text-emerald-400 bg-slate-700/30': selectedId === item.id,
            }"
            @click="selectItem(item)"
            @mouseenter="activeIndex = index"
          >
            <div class="flex items-center justify-between">
              <span class="flex-1">{{ item.name }}</span>
              <svg
                v-if="selectedId === item.id"
                class="w-5 h-5 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div
              v-if="activeIndex === index || selectedId === item.id"
              class="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-emerald-400 to-emerald-600"
            ></div>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
