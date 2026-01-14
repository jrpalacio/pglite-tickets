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
      class="flex justify-between items-center w-full bg-slate-800 border border-slate-500 text-white rounded px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      :aria-haspopup="'listbox'"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="products-listbox"
      :disabled="props.disabled"
      @click="toggleList"
      @keydown="onButtonKeydown"
    >
      <span>{{ selectedItem?.name ?? props.placeholder }}</span>
      <IconChevronDown />
    </button>

    <div
      v-if="open"
      class="absolute mt-2 left-0 w-full bg-neutral-800 z-50 text-white rounded-2xl shadow-lg border border-slate-600"
      role="listbox"
      id="products-listbox"
    >
      <ul class="max-h-64 overflow-y-auto">
        <li
          v-for="(item, index) in props.products"
          :key="item.id"
          role="option"
          :aria-selected="selectedId === item.id ? 'true' : 'false'"
          class="border-b last:border-0 p-3 cursor-pointer hover:bg-slate-700"
          :class="{
            'bg-slate-700': activeIndex === index,
            'font-semibold': selectedId === item.id,
          }"
          @click="selectItem(item)"
          @mouseenter="activeIndex = index"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>
