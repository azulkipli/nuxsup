<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { $t } = useI18n()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

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

// Template refs
const fileInput = ref<HTMLInputElement | null>(null)

// Load current avatar
onMounted(() => {
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
  <div class="min-h-screen bg-slate-50 py-12">
    <div class="container mx-auto px-4 md:px-6 max-w-2xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ $t('title') }}</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">{{ $t('subtitle') }}</p>
      </div>

      <!-- Avatar Section -->
      <UCard class="mb-6 [&>div]:p-6">
        <template #header>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ $t('avatar.title') }}
          </h2>
        </template>

        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Current/Preview Avatar -->
          <div class="flex-shrink-0">
            <UAvatar
              :src="avatarPreview || avatarUrl || undefined"
              :alt="userEmail"
              :fallback="userInitials"
              size="3xl"
              class="border-4 border-slate-100 dark:border-slate-700"
            />
          </div>

          <!-- Upload Controls -->
          <div class="w-full md:flex-1 text-center md:text-left">
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {{ $t('avatar.uploadHint') }}
            </p>

            <div class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
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
          </div>
        </div>
      </UCard>

      <!-- Account Info Section -->
      <UCard class="mb-6 [&>div]:p-6">
        <template #header>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ $t('account.title') }}
          </h2>
        </template>

        <UFormField :label="$t('account.emailLabel')" name="email">
          <UInput
            :model-value="userEmail"
            disabled
            size="lg"
            :ui="{ base: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400' }"
          />
          <template #hint>
            <p class="text-xs text-slate-400">{{ $t('account.emailReadonly') }}</p>
          </template>
        </UFormField>
      </UCard>

      <!-- Password Change Section -->
      <UCard [&>div]:p-6>
        <template #header>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ $t('password.title') }}
          </h2>
        </template>

        <UForm class="space-y-4" @submit="changePassword">
          <UFormField :label="$t('password.oldPassword')" name="oldPassword">
            <UInput
              v-model="oldPassword"
              :type="showOldPassword ? 'text' : 'password'"
              :placeholder="String($t('password.oldPasswordPlaceholder'))"
              size="lg"
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

          <UFormField :label="$t('password.newPassword')" name="newPassword">
            <UInput
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              :placeholder="String($t('password.newPasswordPlaceholder'))"
              size="lg"
              :disabled="passwordLoading"
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
          </UFormField>

          <UFormField :label="$t('password.confirmPassword')" name="confirmNewPassword">
            <UInput
              v-model="confirmNewPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="String($t('password.confirmPasswordPlaceholder'))"
              size="lg"
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
              :disabled="passwordLoading"
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
          class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          {{ $t('backToHome') }}
        </i18n-link>
      </div>
    </div>
  </div>
</template>
