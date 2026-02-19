<script setup lang="ts">
const { $t } = useI18n()

// Use reactive ref for body class to avoid hydration mismatch
const bodyClass = ref('no-scrollbar')

onMounted(() => {
  // Set debug class only on client side
  if (import.meta.env.APP_DEBUG === 'on') {
    bodyClass.value = 'debug-screens no-scrollbar'
  }
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
</script>
<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <!-- Lazy load non-critical PWA components -->
    <InstallPrompt />
    <ReloadPrompt />
  </ClientOnly>
</template>
