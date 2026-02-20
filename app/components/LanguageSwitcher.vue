<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { $getLocales, $switchLocale, $getLocale } = useI18n()

const currentLocale = computed(() => $getLocale())

const localeNames: Record<string, { name: string; flag: string }> = {
  id: { name: 'ID', flag: '🇮🇩' },
  en: { name: 'EN', flag: '🇬🇧' },
}

const currentLocaleInfo = computed(() => {
  return localeNames[currentLocale.value] || { name: currentLocale.value, flag: '🌐' }
})

const selectLocale = (code: string) => {
  $switchLocale(code)
}

const items = computed(() => {
  return $getLocales().map(locale => ({
    label: localeNames[locale.code]?.name || locale.code,
    flag: localeNames[locale.code]?.flag || '🌐',
    checked: currentLocale.value === locale.code,
    onSelect: () => selectLocale(locale.code),
  })) as DropdownMenuItem[]
})
</script>

<template>
  <UDropdownMenu :items="items" :ui="{ content: 'w-48' }">
    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      class="gap-2"
    >
      <span class="text-base">{{ currentLocaleInfo.flag }}</span>
      <span>{{ currentLocaleInfo.name }}</span>
      <template #trailing>
        <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-slate-400" />
      </template>
    </UButton>

    <template #item="{ item }">
      <div class="flex items-center gap-3">
        <span class="text-base">{{ item.flag }}</span>
        <span class="flex-1">{{ item.label }}</span>
        <UIcon
          v-if="item.checked"
          name="i-lucide-check"
          class="w-4 h-4 text-indigo-600 dark:text-indigo-400"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
