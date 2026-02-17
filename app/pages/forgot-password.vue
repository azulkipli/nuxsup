<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { $t } = useI18n()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const success = ref(false)

// Redirect if already logged in
watch(
  user,
  newUser => {
    if (newUser) {
      router.push('/')
    }
  },
  { immediate: true }
)

const resetPassword = async () => {
  if (!email.value) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('enterEmail')),
      color: 'error',
    })
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.add({
        title: String($t('common.error')),
        description: error.message,
        color: 'error',
      })
    } else {
      success.value = true
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
  <UiAuthCard
    :title="String($t('title'))"
    :description="String($t('subtitle'))"
    :success="success"
    :success-title="String($t('checkEmail'))"
  >
    <template #success-description>
      {{ $t('resetLinkSent') }}<br />
      <span class="font-medium text-slate-700 dark:text-slate-300">{{ email }}</span>
    </template>

    <template #success-extra>
      <p class="text-xs text-slate-400">
        {{ $t('clickResetLink') }}
      </p>
    </template>

    <template v-if="!success">
      <UForm class="space-y-5" @submit="resetPassword">
        <UFormField :label="$t('auth.emailLabel')" name="email">
          <UInput
            v-model="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            size="lg"
            :disabled="loading"
            autocomplete="email"
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
          {{ loading ? $t('sending') : $t('sendResetLink') }}
        </UButton>
      </UForm>

      <div class="mt-6 text-center text-sm text-slate-500">
        {{ $t('rememberPassword') }}
        <i18n-link
          to="/login"
          class="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          {{ $t('auth.login') }}
        </i18n-link>
      </div>
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
