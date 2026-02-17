<script setup lang="ts">
const { $t } = useI18n()

interface FeatureItem {
  title: string
  description: string
}

interface PlanItem {
  name: string
  price: string
  features: string[]
}

const features = computed(() => {
  const items = $t('features.items') as unknown as FeatureItem[]
  if (!Array.isArray(items)) return []
  const iconColors: string[] = ['indigo', 'violet', 'emerald']
  const icons: string[] = ['i-lucide-zap', 'i-lucide-palette', 'i-lucide-shield-check']
  return items.map((item: FeatureItem, i: number) => ({
    ...item,
    icon: icons[i] || 'i-lucide-zap',
    iconColor: iconColors[i] || 'indigo',
  }))
})

const pricing = computed(() => {
  const plans = $t('pricing.plans') as unknown as PlanItem[]
  if (!Array.isArray(plans)) return []
  return plans.map((plan: PlanItem, i: number) => ({
    ...plan,
    highlight: i === 1,
    showPerMonth: i !== 2,
  }))
})

const toast = useToast()

const onSubscribe = (planName: string) => {
  toast.add({
    title: String($t('common.comingSoon')),
    description: `${String($t('pricing.choose'))} ${planName}`,
    color: 'info',
  })
}

const onContactSubmit = () => {
  toast.add({
    title: String($t('common.success')),
    description: String($t('contact.successMessage')),
    color: 'success',
  })
}
</script>

<template>
  <div class="flex flex-col gap-0">
    <!-- Hero Section -->
    <section
      id="hero"
      class="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900"
    >
      <!-- Background Decorative Elements -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div
          class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-full blur-3xl -translate-y-1/2"
        />
        <div
          class="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/40 dark:bg-violet-800/20 rounded-full blur-3xl translate-y-1/2"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        />
      </div>

      <div class="container relative z-10 px-4 md:px-6 text-center max-w-4xl mx-auto">
        <UBadge color="primary" variant="soft" size="md" class="mb-6 animate-fade-in-up">
          <template #leading>
            <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </template>
          {{ $t('hero.badge') }}
        </UBadge>

        <h1
          class="text-4xl md:text-6xl/tight font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 animate-fade-in-up delay-100"
        >
          {{ $t('hero.title1') }} <br class="hidden md:block" />
          <span
            class="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent"
            >{{ $t('hero.title2') }}</span
          >
        </h1>

        <p
          class="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200"
        >
          {{ $t('hero.description') }}
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300"
        >
          <UButton to="/#pricing" color="primary" size="lg" class="w-full sm:w-auto">
            {{ $t('hero.getStarted') }}
          </UButton>
          <UButton
            to="/#features"
            variant="outline"
            color="neutral"
            size="lg"
            class="w-full sm:w-auto"
          >
            {{ $t('hero.learnMore') }}
          </UButton>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-24 bg-white dark:bg-slate-900 relative">
      <div class="container mx-auto px-4 md:px-6">
        <UiSectionHeader
          :title="String($t('features.title'))"
          :description="String($t('features.description'))"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <UiFeatureCard
            v-for="(feature, index) in features"
            :key="index"
            :icon="feature.icon"
            :icon-color="feature.iconColor"
            :title="feature.title"
            :description="feature.description"
          />
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section
      id="pricing"
      class="py-24 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800"
    >
      <div class="container mx-auto px-4 md:px-6">
        <UiSectionHeader
          :title="String($t('pricing.title'))"
          :description="String($t('pricing.description'))"
        />

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          <UiPricingCard
            v-for="(plan, index) in pricing"
            :key="index"
            :name="plan.name"
            :price="plan.price"
            :features="plan.features"
            :highlight="plan.highlight"
            :popular-label="String($t('pricing.mostPopular'))"
            :per-month-label="String($t('pricing.perMonth'))"
            :cta-label="String($t('pricing.choose'))"
            :show-per-month="plan.showPerMonth"
            @select="onSubscribe(plan.name)"
          />
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-24 bg-white dark:bg-slate-900">
      <div class="container mx-auto px-4 md:px-6">
        <UCard
          class="max-w-3xl mx-auto overflow-hidden bg-indigo-900 dark:bg-indigo-950 ring-0 shadow-2xl rounded-3xl [&>div]:relative [&>div]:px-8 [&>div]:py-16 [&>div]:md:p-16 [&>div]:text-center"
        >
          <!-- Abstract Shapes -->
          <div
            class="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"
          />
          <div
            class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none"
          />

          <div class="relative z-10">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
              {{ $t('contact.title') }}
            </h2>
            <p class="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
              {{ $t('contact.description') }}
            </p>

            <UCard
              class="max-w-md mx-auto text-left bg-white/10 backdrop-blur-sm border-white/10 ring-1 ring-white/10 rounded-2xl [&>div]:p-6"
            >
              <UForm class="space-y-4">
                <UFormField
                  :label="String($t('contact.emailSrOnly'))"
                  name="email"
                  class="sr-only"
                />
                <UInput
                  type="email"
                  :placeholder="String($t('contact.emailPlaceholder'))"
                  size="lg"
                  class="w-full"
                />
                <UButton color="neutral" variant="solid" size="lg" block @click="onContactSubmit">
                  {{ $t('contact.cta') }}
                </UButton>
                <p class="text-center text-xs text-indigo-200/80 mt-4">
                  {{ $t('contact.disclaimer') }}
                </p>
              </UForm>
            </UCard>
          </div>
        </UCard>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}
</style>
