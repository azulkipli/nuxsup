<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 max-w-sm w-full mx-auto relative overflow-hidden">
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-violet-50/50 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
    </div>

    <div class="relative z-10">
      <h2 class="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
      <p class="text-slate-500 mb-8 text-sm">Please sign in to your account.</p>

      <form @submit.prevent class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email address</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
            <a href="#" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Forgot password?</a>
          </div>
          <input 
            type="password" 
            id="password" 
            name="password"
            class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <div class="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
          <label for="remember-me" class="ml-2 block text-sm text-slate-600">Remember me</label>
        </div>

        <button 
          type="submit" 
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          Sign in
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-500">
        Don't have an account? 
        <NuxtLink to="/#pricing" class="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Sign up</NuxtLink>
      </div>

      <div class="mt-8 border-t border-slate-100 pt-6 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
