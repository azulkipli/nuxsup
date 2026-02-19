<script setup lang="ts">
const { t } = useI18n()

// Use Supabase user composable - it's already optimized by the module
const user = useSupabaseUser()

const navLinks = computed(() => [
  { label: String(t('nav.home')), to: '/#hero' },
  { label: String(t('nav.features')), to: '/#features' },
  { label: String(t('nav.pricing')), to: '/#pricing' },
  { label: String(t('nav.contact')), to: '/#contact' },
])

const footerLinks = computed(() => ({
  product: [
    { label: String(t('nav.features')), to: '/#features' },
    { label: String(t('nav.pricing')), to: '/#pricing' },
    { label: String(t('footer.about')), to: '/about' },
  ],
  company: [
    { label: String(t('nav.contact')), to: '/#contact' },
    { label: String(t('footer.privacy')), to: '#' },
    { label: String(t('footer.terms')), to: '#' },
  ],
}))
</script>

<template>
  <div
    class="flex flex-col min-h-screen text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-200 transition-colors duration-300"
  >
    <!-- Header -->
    <header
      class="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm"
    >
      <div class="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <!-- Logo -->
        <i18n-link to="/" class="flex items-center gap-2 group">
          <div
            class="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-300"
          >
            N
          </div>
          <span
            class="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
            >Nuxsup</span
          >
        </i18n-link>

        <!-- Desktop Navigation -->
        <UNavigationMenu :items="navLinks" variant="link" class="hidden md:flex" />

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <ColorModeToggle />
          <!-- Show UserAvatar if logged in, otherwise show Login button -->
          <UserAvatar v-if="user" />
          <UButton v-else to="/login" color="primary" size="sm">
            {{ $t('auth.login') }}
          </UButton>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer
      class="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800 dark:border-slate-700"
    >
      <div class="container mx-auto px-4 md:px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div
                class="bg-indigo-500 text-white w-6 h-6 rounded flex items-center justify-center font-bold text-sm"
              >
                N
              </div>
              <span class="font-bold text-lg text-white">Nuxsup</span>
            </div>
            <p class="text-sm max-w-xs text-slate-400 leading-relaxed">
              {{ $t('footer.description') }}
            </p>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-4">{{ $t('footer.product') }}</h3>
            <ul class="space-y-2 text-sm">
              <li v-for="link in footerLinks.product" :key="link.to">
                <i18n-link :to="link.to" class="hover:text-white transition-colors">
                  {{ link.label }}
                </i18n-link>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="font-semibold text-white mb-4">{{ $t('footer.company') }}</h3>
            <ul class="space-y-2 text-sm">
              <li v-for="link in footerLinks.company" :key="link.to">
                <i18n-link :to="link.to" class="hover:text-white transition-colors">
                  {{ link.label }}
                </i18n-link>
              </li>
            </ul>
          </div>
        </div>
        <div
          class="border-t border-slate-800 dark:border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
        >
          <p>{{ $t('footer.copyright') }}</p>
          <div class="flex gap-4">
            <a href="#" class="hover:text-white transition-colors">{{ $t('footer.twitter') }}</a>
            <a href="#" class="hover:text-white transition-colors">{{ $t('footer.github') }}</a>
            <a href="#" class="hover:text-white transition-colors">{{ $t('footer.discord') }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>
