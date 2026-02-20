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

// Password strength
function checkPasswordStrength(str: string) {
  const requirements = [
    { regex: /.{8,}/, textKey: 'password.requirements.minLength' },
    { regex: /\d/, textKey: 'password.requirements.number' },
    { regex: /[a-z]/, textKey: 'password.requirements.lowercase' },
    { regex: /[A-Z]/, textKey: 'password.requirements.uppercase' },
  ]

  return requirements.map(req => ({ met: req.regex.test(str), textKey: req.textKey }))
}

const passwordStrength = computed(() => checkPasswordStrength(password.value))
const passwordScore = computed(() => passwordStrength.value.filter(req => req.met).length)

const passwordColor = computed(() => {
  if (passwordScore.value === 0) return 'neutral'
  if (passwordScore.value <= 1) return 'error'
  if (passwordScore.value <= 2) return 'warning'
  if (passwordScore.value === 3) return 'warning'
  return 'success'
})

const passwordStrengthText = computed(() => {
  if (passwordScore.value === 0) return $t('password.strength.enterPassword')
  if (passwordScore.value <= 2) return $t('password.strength.weak')
  if (passwordScore.value === 3) return $t('password.strength.medium')
  return $t('password.strength.strong')
})

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
      <UFormField class="w-full" :label="String($t('auth.emailLabel'))" name="email">
        <UInput
          v-model="email"
          class="w-full"
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
          class="w-full"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          placeholder="••••••••"
          size="lg"
          :disabled="loading"
          :color="passwordColor"
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

        <div v-if="password.length > 0" class="mt-2 space-y-2">
          <UProgress :color="passwordColor" :model-value="passwordScore" :max="4" size="sm" />

          <p class="text-sm font-medium">
            {{ passwordStrengthText }}. {{ $t('password.strength.requirements') }}
          </p>

          <ul class="space-y-1">
            <li
              v-for="(req, index) in passwordStrength"
              :key="index"
              class="flex items-center gap-0.5"
              :class="req.met ? 'text-success' : 'text-muted'"
            >
              <UIcon
                :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
                class="size-4 shrink-0"
              />

              <span class="text-xs font-light">
                {{ $t(req.textKey) }}
                <span class="sr-only">
                  {{
                    req.met
                      ? $t('password.strength.requirementMet')
                      : $t('password.strength.requirementNotMet')
                  }}
                </span>
              </span>
            </li>
          </ul>
        </div>
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
