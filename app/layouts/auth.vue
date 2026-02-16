<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
    <!-- Abstract Background -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-800/20 rounded-full blur-3xl -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/40 dark:bg-violet-800/20 rounded-full blur-3xl translate-y-1/2"></div>
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>

    <!-- Top Right Controls -->
    <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
      <LanguageSwitcher />
      <ColorModeToggle />
    </div>

    <!-- Content Wrapper -->
    <div class="w-full max-w-md p-6 relative z-10">
      <!-- Logo/Brand (Optional, keeps it clean) -->
      <div class="flex justify-center mb-8">
        <i18n-link to="/" class="flex items-center gap-2 group">
          <div class="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-300">N</div>
          <span class="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Nuxsup</span>
        </i18n-link>
      </div>

      <!-- Main Card Slot -->
      <slot />

      <!-- Footer/Links -->
      <div class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>{{ $t('footer.copyright') }}</p>
        <div class="mt-2 space-x-4">
          <a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{{ $t('footer.privacy') }}</a>
          <a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{{ $t('footer.terms') }}</a>
          <a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{{ $t('footer.help') }}</a>
        </div>
      </div>
    </div>
  </div>
</template>
