<script setup lang="ts">
const { $t } = useI18n()

useHead({
  htmlAttrs: {
    class: 'no-scrollbar',
  },
  bodyAttrs: {
    class: import.meta.env.APP_DEBUG === 'on' ? 'debug-screens no-scrollbar' : 'no-scrollbar',
  },
  titleTemplate: (param?: string) => {
    return param ? `${param} - Nuxsup` : 'Nuxsup'
  },
  meta: [
    { name: 'description', content: $t('meta.description') as string },
    { name: 'og:description', content: $t('meta.description') as string },
    { name: 'twitter:description', content: $t('meta.description') as string },
    // SEO: Ensure search engines can index this page
    {
      name: 'robots',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
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
