<script setup lang="ts">
interface Props {
  icon: string
  iconColor?: string
  title: string
  description: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'indigo',
})

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    icon: 'text-indigo-600 dark:text-indigo-400',
    border: 'group-hover:border-indigo-200 dark:group-hover:border-indigo-800',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    icon: 'text-violet-600 dark:text-violet-400',
    border: 'group-hover:border-violet-200 dark:group-hover:border-violet-800',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    icon: 'text-amber-600 dark:text-amber-400',
    border: 'group-hover:border-amber-200 dark:group-hover:border-amber-800',
  },
}
</script>

<template>
  <div
    class="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/30 transition-all duration-300 group"
    :class="colorClasses[iconColor]?.border"
  >
    <div
      class="w-14 h-14 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
      :class="colorClasses[iconColor]?.bg"
    >
      <UIcon :name="icon" :class="colorClasses[iconColor]?.icon" />
    </div>
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">
      {{ title }}
    </h3>
    <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>
