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
