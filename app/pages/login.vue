<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { $t } = useI18n()
const supabase = useSupabaseClient()
const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

const signIn = async () => {
  if (!email.value || !password.value) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('fillAllFields')),
      color: 'error',
    })
    return
  }

  loading.value = true

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      toast.add({
        title: String($t('common.error')),
        description: error.message,
        color: 'error',
      })
    } else {
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
    <UForm class="space-y-5" @submit="signIn">
      <UFormField :label="String($t('auth.emailLabel'))" name="email">
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

      <UFormField :label="String($t('auth.passwordLabel'))" name="password">
        <template #hint>
          <i18n-link
            to="/forgot-password"
            class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {{ $t('forgotPassword') }}
          </i18n-link>
        </template>
        <UInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          placeholder="••••••••"
          size="lg"
          :disabled="loading"
          autocomplete="current-password"
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
      </UFormField>

      <UButton type="submit" color="primary" size="lg" block :loading="loading" :disabled="loading">
        {{ loading ? $t('signingIn') : $t('signIn') }}
      </UButton>
    </UForm>

    <div class="mt-6 text-center text-sm text-slate-500">
      {{ $t('noAccount') }}
      <i18n-link
        to="/register"
        class="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
      >
        {{ $t('auth.signUp') }}
      </i18n-link>
    </div>

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
