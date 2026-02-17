<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'no-scrollbar',
  },
  bodyAttrs: {
    class: import.meta.env.APP_DEBUG === 'on' ? 'debug-screens no-scrollbar' : 'no-scrollbar',
  },
  titleTemplate: (param: string) => {
    return param ? `${param} - Nuxsup` : ''
  },
})

// useServerSeoMeta({
//   title: "Internal Dashboard",
//   keywords: "flik, internal, dashboard",
//   ogTitle: "Internal Dashboard",
//   description: desc,
//   ogDescription: desc,
//   ogImage: `/img/flik-og-img.jpeg`,
//   twitterTitle: "Internal Dashboard",
// });
</script>
<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <InstallPrompt />
    <ReloadPrompt />
  </ClientOnly>
</template>
