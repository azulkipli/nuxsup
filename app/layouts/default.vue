<script setup lang="ts">
const user = useSupabaseUser()
console.log('user:', user.value)
</script>

<template>
  <div
    class="flex flex-col min-h-screen text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900/50 dark:selection:text-indigo-200 transition-colors duration-300"
  >
    <header
      class="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all duration-300"
    >
      <nav class="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
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
        <ul class="hidden md:flex items-center gap-8">
          <li>
            <i18n-link
              to="/#hero"
              class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >{{ $t('nav.home') }}</i18n-link
            >
          </li>
          <li>
            <i18n-link
              to="/#features"
              class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >{{ $t('nav.features') }}</i18n-link
            >
          </li>
          <li>
            <i18n-link
              to="/#pricing"
              class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >{{ $t('nav.pricing') }}</i18n-link
            >
          </li>
          <li>
            <i18n-link
              to="/#contact"
              class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >{{ $t('nav.contact') }}</i18n-link
            >
          </li>
        </ul>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <ColorModeToggle />
          <!-- Show UserAvatar if logged in, otherwise show Login button -->
          <UserAvatar v-if="user" />
          <i18n-link
            v-else
            to="/login"
            class="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-lg hover:-translate-y-0.5"
          >
            {{ $t('auth.login') }}
          </i18n-link>
        </div>
      </nav>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer
      class="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 border-t border-slate-800 dark:border-slate-700"
    >
      <div class="container mx-auto px-4 md:px-6">
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
            <h4 class="font-semibold text-white mb-4">{{ $t('footer.product') }}</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <i18n-link to="/#features" class="hover:text-white transition-colors">{{
                  $t('nav.features')
                }}</i18n-link>
              </li>
              <li>
                <i18n-link to="/#pricing" class="hover:text-white transition-colors">{{
                  $t('nav.pricing')
                }}</i18n-link>
              </li>
              <li>
                <i18n-link to="/about" class="hover:text-white transition-colors">{{
                  $t('footer.about')
                }}</i18n-link>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">{{ $t('footer.company') }}</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <i18n-link to="/#contact" class="hover:text-white transition-colors">{{
                  $t('nav.contact')
                }}</i18n-link>
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors">{{
                  $t('footer.privacy')
                }}</a>
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors">{{ $t('footer.terms') }}</a>
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
