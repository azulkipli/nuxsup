<script setup lang="ts">
const { $getLocales, $switchLocale, $getLocale } = useI18n()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const currentLocale = computed(() => $getLocale())

const localeNames: Record<string, { name: string; flag: string }> = {
  id: { name: 'Indonesia', flag: '🇮🇩' },
  en: { name: 'English', flag: '🇬🇧' }
}

const currentLocaleInfo = computed(() => {
  return localeNames[currentLocale.value] || { name: currentLocale.value, flag: '🌐' }
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectLocale = (code: string) => {
  $switchLocale(code)
  closeDropdown()
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Dropdown Trigger Button -->
    <button
      @click="toggleDropdown"
      type="button"
      class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
      :class="{ 'ring-2 ring-indigo-200 dark:ring-indigo-800 border-indigo-300 dark:border-indigo-600': isOpen }"
    >
      <span class="text-base">{{ currentLocaleInfo.flag }}</span>
      <span>{{ currentLocaleInfo.name }}</span>
      <svg
        class="w-4 h-4 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 border border-slate-100 dark:border-slate-700 py-1 z-50"
      >
        <button
          v-for="locale in $getLocales()"
          :key="locale.code"
          @click="selectLocale(locale.code)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
            currentLocale === locale.code
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          ]"
        >
          <span class="text-base">{{ localeNames[locale.code]?.flag || '🌐' }}</span>
          <span class="flex-1">{{ localeNames[locale.code]?.name || locale.code }}</span>
          <svg
            v-if="currentLocale === locale.code"
            class="w-4 h-4 text-indigo-600 dark:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>
