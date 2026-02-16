<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const isSettingPassword = ref(false)

// Check if user arrived via email confirmation (has session but might need password)
onMounted(async () => {
  // Wait a bit for the auth state to settle after redirect
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (user.value) {
    // User is authenticated, check if they need to set password
    // Users who signed up via OTP will have identities but no password set
    isSettingPassword.value = true
  }
})

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    isSettingPassword.value = true
  }
})

const setPassword = async () => {
  if (!password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    // Refresh session first to ensure it's still valid
    // OTP/magic link sessions can become stale quickly
    const { error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError) {
      errorMessage.value = 'Session expired. Please register again.'
      loading.value = false
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password.value
    })
    
    if (error) {
      errorMessage.value = error.message
    } else {
      // Password set successfully, redirect to dashboard or home
      await router.push('/')
    }
  } catch (e: any) {
    errorMessage.value = e.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 max-w-sm w-full mx-auto relative overflow-hidden">
    <div class="absolute inset-0 z-0">
      <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-violet-50/50 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
    </div>

    <div class="relative z-10">
      <!-- Loading State -->
      <template v-if="!isSettingPassword && !user">
        <div class="text-center py-8">
          <div class="w-12 h-12 mx-auto mb-4">
            <svg class="animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-slate-500 text-sm">Confirming your email...</p>
        </div>
      </template>

      <!-- Set Password Form -->
      <template v-else-if="isSettingPassword">
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 mb-2">Email confirmed!</h2>
          <p class="text-slate-500 text-sm">Now set your password to complete registration.</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <form @submit.prevent="setPassword" class="space-y-5">
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              v-model="password"
              type="password" 
              id="password" 
              name="password"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              placeholder="••••••••"
              required
              :disabled="loading"
              minlength="6"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              placeholder="••••••••"
              required
              :disabled="loading"
              minlength="6"
            />
          </div>

          <button 
            type="submit" 
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            :disabled="loading"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Setting up...' : 'Complete Registration' }}
          </button>
        </form>
      </template>

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
