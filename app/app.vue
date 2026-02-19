<script setup lang="ts">
const { $t } = useI18n()

// Use computed property to avoid hydration mismatch
// Only add debug class on client side after hydration
const bodyClass = computed(() => {
  if (import.meta.client && import.meta.env.APP_DEBUG === 'on') {
    return 'debug-screens no-scrollbar'
  }
  return 'no-scrollbar'
})

useHead({
  htmlAttrs: {
    class: 'no-scrollbar',
  },
  bodyAttrs: {
    class: bodyClass,
  },
  titleTemplate: (param?: string) => {
    return param ? `${param} - Nuxsup` : 'Nuxsup'
  },
  meta: [
    {
      name: 'description',
      content: String($t('footer.description')),
    },
    {
      name: 'og:description',
      content: String($t('footer.description')),
    },
  ],
})

// Dynamic imports for non-critical PWA components
const InstallPrompt = defineAsyncComponent(() => import('./components/InstallPrompt.vue'))
const ReloadPrompt = defineAsyncComponent(() => import('./components/ReloadPrompt.vue'))

// Disable attribute inheritance for VitePwaManifest to prevent warning
defineOptions({
  inheritAttrs: false,
})
</script>
<template>
  <!-- VitePwaManifest as web component - wrap to avoid attribute inheritance warning -->
  <div style="display: contents">
    <VitePwaManifest />
  </div>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <!-- Lazy load non-critical PWA components -->
    <InstallPrompt />
    <ReloadPrompt />
  </ClientOnly>
</template>
