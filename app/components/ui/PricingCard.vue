<script setup lang="ts">
interface Props {
  name: string
  price: string
  features: string[]
  highlight?: boolean
  popularLabel?: string
  perMonthLabel?: string
  ctaLabel: string
  showPerMonth?: boolean
}

withDefaults(defineProps<Props>(), {
  highlight: false,
  popularLabel: 'Most Popular',
  showPerMonth: true,
})

defineEmits<{
  (e: 'select'): void
}>()
</script>

<template>
  <UCard
    :class="[
      'relative transition-all duration-300 bg-white dark:bg-slate-800 p-8 overflow-visible',
      highlight
        ? 'scale-105 z-20 ring-2 ring-indigo-500 shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/30'
        : 'hover:border-slate-300 dark:hover:border-slate-600 ring-1 ring-slate-100 dark:ring-slate-700 shadow-lg',
    ]"
  >
    <!-- Popular Badge -->
    <UBadge
      v-if="highlight"
      color="primary"
      variant="solid"
      class="absolute -top-3 left-1/2 -translate-x-1/2"
    >
      {{ popularLabel }}
    </UBadge>

    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
      {{ name }}
    </h3>

    <div class="flex items-baseline gap-1 mb-6">
      <span class="text-4xl font-extrabold text-slate-900 dark:text-white">
        {{ price }}
      </span>
      <span v-if="showPerMonth" class="text-slate-500 dark:text-slate-400">
        {{ perMonthLabel }}
      </span>
    </div>

    <ul class="space-y-4 mb-8">
      <li
        v-for="(feature, index) in features"
        :key="index"
        class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
      >
        <UIcon name="i-lucide-check" class="w-5 h-5 text-indigo-500 flex-shrink-0" />
        {{ feature }}
      </li>
    </ul>

    <UButton
      :color="highlight ? 'primary' : 'neutral'"
      :variant="highlight ? 'solid' : 'soft'"
      block
      size="lg"
      @click="$emit('select')"
    >
      {{ ctaLabel }} {{ name }}
    </UButton>
  </UCard>
</template>
