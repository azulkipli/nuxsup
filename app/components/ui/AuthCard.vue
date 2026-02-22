<script setup lang="ts">
interface Props {
  title: string
  description?: string
  success?: boolean
  successTitle?: string
  successDescription?: string
}

defineProps<Props>()
</script>

<template>
  <UCard
    class="max-w-sm w-full mx-auto relative overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 shadow-xl rounded-2xl"
  >
    <!-- Background Decorative Elements -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-800/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
      />
      <div
        class="absolute bottom-0 left-0 w-32 h-32 bg-violet-50/50 dark:bg-violet-800/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"
      />
    </div>

    <!-- Success State -->
    <template v-if="success">
      <div class="text-center py-4 p-8 relative z-10">
        <UAvatar
          icon="i-lucide-check"
          size="lg"
          class="mx-auto mb-4 bg-green-100 dark:bg-green-900"
          :ui="{
            icon: 'text-green-600 dark:text-green-400',
          }"
        />
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {{ successTitle }}
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">
          <slot name="success-description">
            {{ successDescription }}
          </slot>
        </p>
        <slot name="success-extra" />
      </div>
    </template>

    <!-- Default State -->
    <template v-else>
      <div class="p-8 relative z-10">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {{ title }}
        </h2>
        <p v-if="description" class="text-slate-500 dark:text-slate-400 mb-8 text-sm">
          {{ description }}
        </p>

        <slot />
      </div>
    </template>

    <!-- Footer Slot -->
    <template #footer>
      <slot name="footer" />
    </template>
  </UCard>
</template>
