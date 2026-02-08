<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

// Avatar Upload State
const avatarUrl = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const uploadLoading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref('')

// Password Change State
const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

// Load current avatar
onMounted(() => {
  if (user.value?.user_metadata?.avatar_url) {
    avatarUrl.value = user.value.user_metadata.avatar_url
  }
})

// Watch for user changes
watch(user, (newUser) => {
  if (newUser?.user_metadata?.avatar_url) {
    avatarUrl.value = newUser.user_metadata.avatar_url
  }
}, { immediate: true })

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
    uploadError.value = 'Hanya file JPG dan PNG yang diizinkan'
    return
  }
  
  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    uploadError.value = 'Ukuran file maksimal 2MB'
    return
  }
  
  uploadError.value = ''
  avatarFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Upload avatar
const uploadAvatar = async () => {
  if (!avatarFile.value || !user.value) return
  
  uploadLoading.value = true
  uploadError.value = ''
  uploadSuccess.value = ''
  
  try {
    const fileExt = avatarFile.value.name.split('.').pop()
    const fileName = `${user.value.id}-${Date.now()}.${fileExt}`
    
    // Upload to Supabase Storage (fileName only, bucket is already 'avatars')
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile.value, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadErr) {
      throw uploadErr
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    // Update user metadata
    const { error: updateErr } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    })
    
    if (updateErr) {
      throw updateErr
    }
    
    // Force refresh session to update useSupabaseUser() reactivity
    await supabase.auth.refreshSession()
    
    avatarUrl.value = publicUrl
    avatarPreview.value = null
    avatarFile.value = null
    uploadSuccess.value = 'Avatar berhasil diperbarui!'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      uploadSuccess.value = ''
    }, 3000)
    
  } catch (e: any) {
    uploadError.value = e.message || 'Gagal mengupload avatar'
  } finally {
    uploadLoading.value = false
  }
}

// Change password
const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''
  
  // Validation
  if (!oldPassword.value || !newPassword.value || !confirmNewPassword.value) {
    passwordError.value = 'Semua field harus diisi'
    return
  }
  
  if (newPassword.value !== confirmNewPassword.value) {
    passwordError.value = 'Password baru tidak cocok'
    return
  }
  
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password minimal 6 karakter'
    return
  }
  
  passwordLoading.value = true
  
  try {
    // Verify old password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail.value,
      password: oldPassword.value
    })
    
    if (signInError) {
      passwordError.value = 'Password lama tidak valid'
      return
    }
    
    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value
    })
    
    if (updateError) {
      throw updateError
    }
    
    passwordSuccess.value = 'Password berhasil diubah!'
    oldPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      passwordSuccess.value = ''
    }, 3000)
    
  } catch (e: any) {
    passwordError.value = e.message || 'Gagal mengubah password'
  } finally {
    passwordLoading.value = false
  }
}

// Redirect if not logged in
watchEffect(() => {
  if (!user.value) {
    router.push('/login')
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-12">
    <div class="container mx-auto px-4 md:px-6 max-w-2xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900">Profil Saya</h1>
        <p class="text-slate-600 mt-2">Kelola informasi akun dan keamanan Anda</p>
      </div>

      <!-- Avatar Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Foto Profil</h2>
        
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- Current/Preview Avatar -->
          <div class="flex-shrink-0">
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner">
              <img
                v-if="avatarPreview || avatarUrl"
                :src="avatarPreview || avatarUrl || ''"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold"
              >
                {{ userInitials }}
              </div>
            </div>
          </div>

          <!-- Upload Controls -->
          <div class="w-full md:flex-1 text-center md:text-left">
            <p class="text-sm text-slate-600 mb-3">
              Upload foto profil dalam format JPG atau PNG. Maksimal 2MB.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <label class="cursor-pointer flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-3 md:py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pilih Foto
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  class="hidden"
                  @change="handleFileSelect"
                />
              </label>
              
              <button
                v-if="avatarFile"
                @click="uploadAvatar"
                :disabled="uploadLoading"
                class="flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-3 md:py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <svg v-if="uploadLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ uploadLoading ? 'Mengupload...' : 'Simpan Foto' }}
              </button>
            </div>

            <!-- Messages -->
            <p v-if="uploadError" class="mt-3 text-sm text-red-600">{{ uploadError }}</p>
            <p v-if="uploadSuccess" class="mt-3 text-sm text-green-600">{{ uploadSuccess }}</p>
          </div>
        </div>
      </div>

      <!-- Account Info Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Informasi Akun</h2>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div class="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
            {{ userEmail }}
          </div>
          <p class="text-xs text-slate-400 mt-1">Email tidak dapat diubah</p>
        </div>
      </div>

      <!-- Password Change Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Ubah Password</h2>
        
        <!-- Messages -->
        <div v-if="passwordError" class="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p class="text-sm text-red-600">{{ passwordError }}</p>
        </div>
        <div v-if="passwordSuccess" class="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
          <p class="text-sm text-green-600">{{ passwordSuccess }}</p>
        </div>

        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label for="oldPassword" class="block text-sm font-medium text-slate-700 mb-1">
              Password Lama
            </label>
            <input
              v-model="oldPassword"
              type="password"
              id="oldPassword"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              placeholder="Masukkan password lama"
              :disabled="passwordLoading"
            />
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-slate-700 mb-1">
              Password Baru
            </label>
            <input
              v-model="newPassword"
              type="password"
              id="newPassword"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              placeholder="Masukkan password baru"
              :disabled="passwordLoading"
              minlength="6"
            />
          </div>

          <div>
            <label for="confirmNewPassword" class="block text-sm font-medium text-slate-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              v-model="confirmNewPassword"
              type="password"
              id="confirmNewPassword"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              placeholder="Konfirmasi password baru"
              :disabled="passwordLoading"
              minlength="6"
            />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="passwordLoading"
              class="flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 md:py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="passwordLoading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ passwordLoading ? 'Menyimpan...' : 'Ubah Password' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Back Link -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 md:hover:bg-transparent md:p-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
