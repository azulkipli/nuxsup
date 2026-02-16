<script setup lang="ts">
const { $t } = useI18n()

const features = computed(() => {
  const items = $t('features.items') as unknown as any[]
  if (!Array.isArray(items)) return []
  return items.map((item: any, i: number) => ({
    ...item,
    icon: ['⚡', '🎨', '🛡️'][i]
  }))
})

const pricing = computed(() => {
  const plans = $t('pricing.plans') as unknown as any[]
  if (!Array.isArray(plans)) return []
  return plans.map((plan: any, i: number) => ({
    ...plan,
    highlight: i === 1,
    showPerMonth: i !== 2
  }))
})
</script>

<template>
    <div class="flex flex-col gap-0">
        <!-- Hero Section -->
        <section
            id="hero"
            class="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900"
        >
            <!-- Background Decorative Elements -->
            <div class="absolute inset-0 z-0">
                <div
                    class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-full blur-3xl -translate-y-1/2"
                ></div>
                <div
                    class="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/40 dark:bg-violet-800/20 rounded-full blur-3xl translate-y-1/2"
                ></div>
                <div
                    class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
                ></div>
            </div>

            <div
                class="container relative z-10 px-4 md:px-6 text-center max-w-4xl mx-auto"
            >
                <div
                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in-up"
                >
                    <span
                        class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"
                    ></span>
                    {{ $t('hero.badge') }}
                </div>

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
                    <i18n-link
                        to="/#pricing"
                        class="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:-translate-y-1"
                    >
                        {{ $t('hero.getStarted') }}
                    </i18n-link>
                    <i18n-link
                        to="/#features"
                        class="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md"
                    >
                        {{ $t('hero.learnMore') }}
                    </i18n-link>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-24 bg-white dark:bg-slate-900 relative">
            <div class="container mx-auto px-4 md:px-6">
                <div class="text-center max-w-3xl mx-auto mb-16">
                    <h2
                        class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
                    >
                        {{ $t('features.title') }}
                    </h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400">
                        {{ $t('features.description') }}
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div
                        v-for="(feature, index) in features"
                        :key="index"
                        class="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/30 transition-all duration-300 group"
                    >
                        <div
                            class="w-14 h-14 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                        >
                            {{ feature.icon }}
                        </div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">
                            {{ feature.title }}
                        </h3>
                        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {{ feature.description }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Pricing Section -->
        <section
            id="pricing"
            class="py-24 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800"
        >
            <div class="container mx-auto px-4 md:px-6">
                <div class="text-center max-w-3xl mx-auto mb-16">
                    <h2
                        class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
                    >
                        {{ $t('pricing.title') }}
                    </h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400">
                        {{ $t('pricing.description') }}
                    </p>
                </div>

                <div
                    class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center"
                >
                    <div
                        v-for="(plan, index) in pricing"
                        :key="index"
                        :class="[
                            'relative p-8 rounded-2xl transition-all duration-300',
                            plan.highlight
                                ? 'bg-white dark:bg-slate-800 shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/30 border-2 border-indigo-500 scale-105 z-10'
                                : 'bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
                        ]"
                    >
                        <div
                            v-if="plan.highlight"
                            class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-md"
                        >
                            {{ $t('pricing.mostPopular') }}
                        </div>

                        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {{ plan.name }}
                        </h3>
                        <div class="flex items-baseline gap-1 mb-6">
                            <span
                                class="text-4xl font-extrabold text-slate-900 dark:text-white"
                                >{{ plan.price }}</span
                            >
                            <span
                                v-if="plan.showPerMonth"
                                class="text-slate-500 dark:text-slate-400"
                                >{{ $t('pricing.perMonth') }}</span
                            >
                        </div>

                        <ul class="space-y-4 mb-8">
                            <li
                                v-for="(feat, fIndex) in plan.features"
                                :key="fIndex"
                                class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                            >
                                <svg
                                    class="w-5 h-5 text-indigo-500 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 13l4 4L19 7"
                                    ></path>
                                </svg>
                                {{ feat }}
                            </li>
                        </ul>

                        <button
                            :class="[
                                'w-full py-3 px-6 rounded-lg font-semibold transition-all',
                                plan.highlight
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600',
                            ]"
                        >
                            {{ $t('pricing.choose') }} {{ plan.name }}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="py-24 bg-white dark:bg-slate-900">
            <div class="container mx-auto px-4 md:px-6">
                <div
                    class="bg-indigo-900 dark:bg-indigo-950 rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    <!-- Abstract Shapes -->
                    <div
                        class="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"
                    ></div>
                    <div
                        class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50"
                    ></div>

                    <div
                        class="relative z-10 px-8 py-16 md:p-16 text-center max-w-3xl mx-auto"
                    >
                        <h2
                            class="text-3xl md:text-4xl font-bold text-white mb-6"
                        >
                            {{ $t('contact.title') }}
                        </h2>
                        <p
                            class="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto"
                        >
                            {{ $t('contact.description') }}
                        </p>

                        <form
                            class="max-w-md mx-auto space-y-4 text-left bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10"
                        >
                            <div>
                                <label for="email" class="sr-only"
                                    >{{ $t('contact.emailSrOnly') }}</label
                                >
                                <input
                                    type="email"
                                    id="email"
                                    :placeholder="String($t('contact.emailPlaceholder'))"
                                    class="w-full px-4 py-3 bg-white/90 dark:bg-white/80 border-0 rounded-lg text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-shadow"
                                />
                            </div>
                            <button
                                type="button"
                                class="w-full py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors shadow-lg"
                            >
                                {{ $t('contact.cta') }}
                            </button>
                            <p
                                class="text-center text-xs text-indigo-200/80 mt-4"
                            >
                                {{ $t('contact.disclaimer') }}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
/* Simple animation classes if not using a library */
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
    opacity: 0; /* Start hidden */
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
