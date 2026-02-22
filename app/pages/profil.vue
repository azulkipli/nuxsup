<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { $t } = useI18n()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

// Session loading state - wait for session to be restored before rendering
const sessionLoading = ref(true)

// Avatar Upload State
const avatarUrl = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const uploadLoading = ref(false)

// Password Change State
const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordLoading = ref(false)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Computed properties for showing/hiding password fields progressively
const showNewPasswordField = computed(() => oldPassword.value.length > 3)
const showConfirmPasswordField = computed(() => newPassword.value.length > 3)

// Password strength for new password
function checkPasswordStrength(str: string) {
  const requirements = [
    { regex: /.{8,}/, textKey: 'password.requirements.minLength' },
    { regex: /\d/, textKey: 'password.requirements.number' },
    { regex: /[a-z]/, textKey: 'password.requirements.lowercase' },
    { regex: /[A-Z]/, textKey: 'password.requirements.uppercase' },
  ]

  return requirements.map(req => ({ met: req.regex.test(str), textKey: req.textKey }))
}

const newPasswordStrength = computed(() => checkPasswordStrength(newPassword.value))
const newPasswordScore = computed(() => newPasswordStrength.value.filter(req => req.met).length)

const newPasswordColor = computed(() => {
  if (newPasswordScore.value === 0) return 'neutral'
  if (newPasswordScore.value <= 1) return 'error'
  if (newPasswordScore.value <= 2) return 'warning'
  if (newPasswordScore.value === 3) return 'warning'
  return 'success'
})

const newPasswordStrengthText = computed(() => {
  if (newPasswordScore.value === 0) return $t('password.strength.enterPassword')
  if (newPasswordScore.value <= 2) return $t('password.strength.weak')
  if (newPasswordScore.value === 3) return $t('password.strength.medium')
  return $t('password.strength.strong')
})

// Check if password form is valid and strong enough to enable submit button
const isPasswordFormValid = computed(() => {
  const hasOldPassword = oldPassword.value.length > 0
  const hasNewPassword = newPassword.value.length >= 8
  const hasConfirmPassword = confirmNewPassword.value === newPassword.value
  const isPasswordStrong = newPasswordScore.value >= 3 // Medium or Strong

  return hasOldPassword && hasNewPassword && hasConfirmPassword && isPasswordStrong
})

// Watch old password to reset new password fields when cleared
watch(
  oldPassword,
  val => {
    // Reset new password fields when old password is cleared
    if (!val || val.length <= 3) {
      newPassword.value = ''
      confirmNewPassword.value = ''
    }
  },
  { immediate: true }
)

// Watch new password to reset confirm field when cleared
watch(
  newPassword,
  val => {
    // Reset confirm field when new password is cleared or too short
    if (!val || val.length <= 3) {
      confirmNewPassword.value = ''
    }
  },
  { immediate: true }
)

// Template refs
const fileInput = ref<HTMLInputElement | null>(null)

// Initialize page after session is restored
onMounted(async () => {
  // Wait for session to be restored from localStorage/cookie
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Session not found, redirect to login
    await navigateTo('/login')
    return
  }

  sessionLoading.value = false

  // Load current avatar
  if (user.value?.user_metadata?.avatar_url) {
    avatarUrl.value = user.value.user_metadata.avatar_url
  }
})

// Watch for user changes
watch(
  user,
  newUser => {
    if (newUser?.user_metadata?.avatar_url) {
      avatarUrl.value = newUser.user_metadata.avatar_url
    }
  },
  { immediate: true }
)

const userEmail = computed(() => user.value?.email || '')

const userInitials = computed(() => {
  return userEmail.value.charAt(0).toUpperCase()
})

// Handle file selection
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('avatar.onlyJpgPng')),
      color: 'error',
    })
    return
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('avatar.maxSize')),
      color: 'error',
    })
    return
  }

  avatarFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = e => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Upload avatar
const uploadAvatar = async () => {
  if (!avatarFile.value || !user.value) return

  uploadLoading.value = true

  try {
    const fileExt = avatarFile.value.name.split('.').pop()
    const filePath = `${user.value.sub}/avatar-${Date.now()}.${fileExt}`

    // Delete old avatar if exists (ignore errors)
    if (avatarUrl.value) {
      const oldPath = avatarUrl.value.split('/avatars/').pop()
      if (oldPath) {
        await supabase.storage.from('avatars').remove([decodeURIComponent(oldPath)])
      }
    }

    // Upload to Supabase Storage (user_id/filename)
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile.value, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadErr) {
      throw uploadErr
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath)

    // Update user metadata
    const { error: updateErr } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    })

    if (updateErr) {
      throw updateErr
    }

    // Force refresh session to update useSupabaseUser() reactivity
    await supabase.auth.refreshSession()

    avatarUrl.value = publicUrl
    avatarPreview.value = null
    avatarFile.value = null

    toast.add({
      title: String($t('common.success')),
      description: String($t('avatar.success')),
      color: 'success',
    })
  } catch (e: unknown) {
    toast.add({
      title: String($t('common.error')),
      description: e instanceof Error ? e.message : String($t('avatar.failedUpload')),
      color: 'error',
    })
  } finally {
    uploadLoading.value = false
  }
}

// Change password
const changePassword = async () => {
  // Validation
  if (!oldPassword.value || !newPassword.value || !confirmNewPassword.value) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('password.fillAllFields')),
      color: 'error',
    })
    return
  }

  if (newPassword.value !== confirmNewPassword.value) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('password.noMatch')),
      color: 'error',
    })
    return
  }

  if (newPassword.value.length < 6) {
    toast.add({
      title: String($t('common.error')),
      description: String($t('password.minLength')),
      color: 'error',
    })
    return
  }

  passwordLoading.value = true

  try {
    // Verify old password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail.value,
      password: oldPassword.value,
    })

    if (signInError) {
      toast.add({
        title: String($t('common.error')),
        description: String($t('password.oldInvalid')),
        color: 'error',
      })
      return
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (updateError) {
      throw updateError
    }

    toast.add({
      title: String($t('common.success')),
      description: String($t('password.success')),
      color: 'success',
    })

    oldPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
  } catch (e: unknown) {
    toast.add({
      title: String($t('common.error')),
      description: e instanceof Error ? e.message : String($t('password.failedChange')),
      color: 'error',
    })
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
    <!-- Loading State -->
    <div v-if="sessionLoading" class="flex items-center justify-center min-h-screen">
      <UProgress :indeterminate="true" size="md" class="w-64" />
    </div>

    <!-- Content -->
    <div v-else class="container mx-auto px-4 md:px-6 max-w-2xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ $t('title') }}</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">{{ $t('subtitle') }}</p>
      </div>

      <!-- Avatar Section -->
      <UCard class="mb-6 [&>div]:p-6">
        <template #header>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ $t('account.title') }}
          </h2>
        </template>

        <div class="flex flex-col gap-3">
          <!-- Current/Preview Avatar -->
          <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <UAvatar
              :src="avatarPreview || avatarUrl || undefined"
              :alt="userEmail"
              :fallback="userInitials"
              size="15xl"
              class="border-2 border-slate-100 dark:border-slate-700"
            />
            <!-- Email -->
            <div class="mb-4 text-sm">
              <span class="font-semibold text-slate-800 dark:text-white">Email</span>
              <p class="font-medium text-slate-600 dark:text-slate-400">{{ userEmail }}</p>
            </div>
          </div>

          <!-- Upload Controls -->
          <div class="w-full">
            <div class="flex flex-col sm:flex-row gap-3">
              <UButton
                color="neutral"
                variant="outline"
                class="cursor-pointer"
                @click="fileInput?.click()"
              >
                <UIcon name="i-lucide-image" class="w-5 h-5 mr-2" />
                {{ $t('avatar.selectPhoto') }}
              </UButton>
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png"
                class="hidden"
                @change="handleFileSelect"
              />

              <UButton
                v-if="avatarFile"
                color="primary"
                :loading="uploadLoading"
                :disabled="uploadLoading"
                @click="uploadAvatar"
              >
                {{ uploadLoading ? $t('avatar.uploading') : $t('avatar.savePhoto') }}
              </UButton>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 my-3">
              {{ $t('avatar.uploadHint') }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Password Change Section -->
      <UCard class="[&>div]:p-6">
        <template #header>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ $t('password.title') }}
          </h2>
        </template>

        <UForm class="space-y-4" @submit="changePassword">
          <UFormField :label="String($t('password.oldPassword'))" name="oldPassword">
            <UInput
              v-model="oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              :placeholder="String($t('password.oldPasswordPlaceholder'))"
              size="lg"
              class="w-full"
              :disabled="passwordLoading"
              autocomplete="current-password"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showOldPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  @click="showOldPassword = !showOldPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <UFormField
            v-show="showNewPasswordField"
            :label="String($t('password.newPassword'))"
            name="newPassword"
          >
            <UInput
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              :placeholder="String($t('password.newPasswordPlaceholder'))"
              size="lg"
              class="w-full"
              :disabled="passwordLoading"
              :color="newPasswordColor"
              autocomplete="new-password"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  @click="showNewPassword = !showNewPassword"
                />
              </template>
            </UInput>

            <div v-if="newPassword.length > 0" class="mt-2 space-y-2">
              <UProgress
                :color="newPasswordColor"
                :model-value="newPasswordScore"
                :max="4"
                size="sm"
              />

              <p class="text-sm font-medium">
                {{ newPasswordStrengthText }}. {{ $t('password.strength.requirements') }}
              </p>

              <ul class="space-y-1">
                <li
                  v-for="(req, index) in newPasswordStrength"
                  :key="index"
                  class="flex items-center gap-0.5"
                  :class="req.met ? 'text-success' : 'text-slate-400 dark:text-slate-500'"
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

          <UFormField
            v-show="showConfirmPasswordField"
            :label="String($t('password.confirmPassword'))"
            name="confirmNewPassword"
          >
            <UInput
              v-model="confirmNewPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="String($t('password.confirmPasswordPlaceholder'))"
              size="lg"
              class="w-full"
              :disabled="passwordLoading"
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
          </UFormField>

          <div class="pt-2">
            <UButton
              type="submit"
              color="primary"
              :loading="passwordLoading"
              :disabled="passwordLoading || !isPasswordFormValid"
            >
              {{ passwordLoading ? $t('password.saving') : $t('password.changePassword') }}
            </UButton>
          </div>
        </UForm>
      </UCard>

      <!-- Back Link -->
      <div class="mt-8 text-center">
        <i18n-link
          to="/"
          class="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          {{ $t('backToHome') }}
        </i18n-link>
      </div>
    </div>
  </div>
</template>
