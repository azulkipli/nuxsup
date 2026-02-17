<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v: boolean) => {
    colorMode.preference = v ? 'dark' : 'light'
  },
})
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
    :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
    @click="isDark = !isDark"
  />
</template>
