<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon?: string
}

defineProps<Props>()
</script>

<template>
  <div class="text-center max-w-3xl mx-auto mb-16">
    <UAvatar
      v-if="icon"
      :icon="icon"
      size="md"
      class="mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900"
      :ui="{
        icon: 'text-indigo-600 dark:text-indigo-400',
      }"
    />
    <h2 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
      {{ title }}
    </h2>
    <p v-if="description" class="text-lg text-slate-600 dark:text-slate-400">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
