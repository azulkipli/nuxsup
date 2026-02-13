<script setup lang="ts">
const user = useSupabaseUser();
console.log("user:", user.value);
</script>

<template>
  <div
    class="flex flex-col min-h-screen text-slate-800 bg-white selection:bg-indigo-100 selection:text-indigo-900"
  >
    <header
      class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300"
    >
      <nav
        class="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between"
      >
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div
            class="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-300"
          >
            N
          </div>
          <span
            class="font-bold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors"
            >Nuxsup</span
          >
        </NuxtLink>

        <!-- Desktop Navigation -->
        <ul class="hidden md:flex items-center gap-8">
          <li>
            <NuxtLink
              to="/#hero"
              class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >Home</NuxtLink
            >
          </li>
          <li>
            <NuxtLink
              to="/#features"
              class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >Features</NuxtLink
            >
          </li>
          <li>
            <NuxtLink
              to="/#pricing"
              class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >Pricing</NuxtLink
            >
          </li>
          <li>
            <NuxtLink
              to="/#contact"
              class="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >Contact</NuxtLink
            >
          </li>
        </ul>

        <!-- Action Button -->
        <div class="flex items-center gap-4">
          <!-- Show UserAvatar if logged in, otherwise show Login button -->
          <UserAvatar v-if="user" />
          <NuxtLink
            v-else
            to="/login"
            class="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            Log in
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
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
              Building the future of web development with Nuxt 4 and Tailwind
              CSS v4. Fast, scalable, and beautiful.
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Product</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <NuxtLink
                  to="/#features"
                  class="hover:text-white transition-colors"
                  >Features</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/#pricing"
                  class="hover:text-white transition-colors"
                  >Pricing</NuxtLink
                >
              </li>
              <li>
                <NuxtLink to="/about" class="hover:text-white transition-colors"
                  >About</NuxtLink
                >
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white mb-4">Company</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <NuxtLink
                  to="/#contact"
                  class="hover:text-white transition-colors"
                  >Contact</NuxtLink
                >
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors"
                  >Privacy</a
                >
              </li>
              <li>
                <a href="#" class="hover:text-white transition-colors">Terms</a>
              </li>
            </ul>
          </div>
        </div>
        <div
          class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
        >
          <p>© 2026 Nuxsup. All rights reserved.</p>
          <div class="flex gap-4">
            <a href="#" class="hover:text-white transition-colors">Twitter</a>
            <a href="#" class="hover:text-white transition-colors">GitHub</a>
            <a href="#" class="hover:text-white transition-colors">Discord</a>
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
