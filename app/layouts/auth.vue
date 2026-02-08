<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
    <!-- Abstract Background -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl translate-y-1/2"></div>
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>

    <!-- Content Wrapper -->
    <div class="w-full max-w-md p-6 relative z-10">
      <!-- Logo/Brand (Optional, keeps it clean) -->
      <div class="flex justify-center mb-8">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-300">N</div>
          <span class="font-bold text-2xl tracking-tight text-slate-900">Nuxsup</span>
        </NuxtLink>
      </div>

      <!-- Main Card Slot -->
      <slot />

      <!-- Footer/Links -->
      <div class="mt-8 text-center text-sm text-slate-500">
        <p>&copy; 2026 Nuxsup. All rights reserved.</p>
        <div class="mt-2 space-x-4">
          <a href="#" class="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" class="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" class="hover:text-indigo-600 transition-colors">Help</a>
        </div>
      </div>
    </div>
  </div>
</template>
