<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { $t } = useI18n()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const toast = useToast()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
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
watch(user, newUser => {
  if (newUser) {
    isSettingPassword.value = true
  }
})

const setPassword = async () => {
  if (!password.value || !confirmPassword.value) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('fillAllFields')),
      color: 'error',
    })
    return
  }

  if (password.value !== confirmPassword.value) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('passwordsNoMatch')),
      color: 'error',
    })
    return
  }

  if (password.value.length < 6) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('passwordMinLength')),
      color: 'error',
    })
    return
  }

  loading.value = true

  try {
    // Refresh session first to ensure it's still valid
    // OTP/magic link sessions can become stale quickly
    const { error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError) {
      toast.add({
        title: String($t('common.error')),
        description: String($t('sessionExpired')),
        color: 'error',
      })
      loading.value = false
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })

    if (error) {
      toast.add({
        title: String($t('common.error')),
        description: error.message,
        color: 'error',
      })
    } else {
      toast.add({
        title: String($t('common.success')),
        description: String($t('passwordSet')),
        color: 'success',
      })
      // Password set successfully, redirect to dashboard or home
      await router.push('/')
    }
  } catch (e: unknown) {
    toast.add({
      title: String($t('common.error')),
      description: e instanceof Error ? e.message : String($t('common.error')),
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UiAuthCard :title="String($t('title'))" :description="String($t('subtitle'))">
    <!-- Loading State -->
    <template v-if="!isSettingPassword && !user">
      <div class="text-center py-8">
        <UProgress animation="swing" class="w-12 h-12 mx-auto mb-4" />
        <p class="text-slate-500 text-sm">{{ $t('confirming') }}</p>
      </div>
    </template>

    <!-- Set Password Form -->
    <template v-else-if="isSettingPassword">
      <div class="text-center mb-6">
        <UAvatar
          icon="i-lucide-check"
          size="lg"
          class="mx-auto mb-4 bg-green-100 dark:bg-green-900"
          :ui="{ icon: 'text-green-600 dark:text-green-400' }"
        />
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {{ $t('emailConfirmed') }}
        </h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">
          {{ $t('setPasswordDesc') }}
        </p>
      </div>

      <UForm class="space-y-5" @submit="setPassword">
        <UFormField :label="String($t('password'))" name="password">
          <UInput
            v-model="password"
            type="password"
            name="password"
            placeholder="••••••••"
            size="lg"
            :disabled="loading"
            autocomplete="new-password"
          />
        </UFormField>

        <UFormField :label="String($t('confirmPassword'))" name="confirmPassword">
          <UInput
            v-model="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            size="lg"
            :disabled="loading"
            autocomplete="new-password"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="loading"
          :disabled="loading"
        >
          {{ loading ? $t('settingUp') : $t('completeRegistration') }}
        </UButton>
      </UForm>
    </template>

    <template #footer>
      <div class="text-center pt-6">
        <i18n-link
          to="/"
          class="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          {{ $t('auth.backToHome') }}
        </i18n-link>
      </div>
    </template>
  </UiAuthCard>
</template>
