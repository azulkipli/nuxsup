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
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isReady = ref(false)

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  if (user.value) {
    isReady.value = true
  }
})

watch(user, newUser => {
  if (newUser) {
    isReady.value = true
  }
})

const resetPassword = async () => {
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
        description: String($t('passwordUpdated')),
        color: 'success',
      })
      await router.push('/')
    }
  } catch (e: unknown) {
    toast.add({
      title: String($t('common.error')),
      description: e instanceof Error ? e.message : String($t('failedUpdate')),
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
    <template v-if="!isReady && !user">
      <div class="text-center py-8">
        <UProgress animation="swing" class="w-12 h-12 mx-auto mb-4" />
        <p class="text-slate-500 text-sm">{{ $t('processing') }}</p>
      </div>
    </template>

    <!-- Password Form -->
    <template v-else-if="isReady">
      <div class="text-center mb-6">
        <UAvatar
          icon="i-lucide-lock"
          size="lg"
          class="mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900"
          :ui="{ icon: 'text-indigo-600 dark:text-indigo-400' }"
        />
      </div>

      <UForm class="space-y-5" @submit="resetPassword">
        <UFormGroup :label="$t('newPassword')" name="password">
          <UInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            placeholder="••••••••"
            size="lg"
            :disabled="loading"
            autocomplete="new-password"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormGroup>

        <UFormGroup :label="$t('confirmPassword')" name="confirmPassword">
          <UInput
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            name="confirmPassword"
            placeholder="••••••••"
            size="lg"
            :disabled="loading"
            autocomplete="new-password"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </UInput>
        </UFormGroup>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="loading"
          :disabled="loading"
        >
          {{ loading ? $t('updating') : $t('updatePassword') }}
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
