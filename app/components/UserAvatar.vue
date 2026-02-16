<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Get user avatar URL from user metadata or generate initials
const avatarUrl = computed(() => {
  return user.value?.user_metadata?.avatar_url || null
})

const userInitials = computed(() => {
  const email = user.value?.email || ''
  return email.charAt(0).toUpperCase()
})

const userEmail = computed(() => {
  return user.value?.email || ''
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

const goToProfile = () => {
  closeDropdown()
  navigateTo('/profil')
}

const logout = async () => {
  closeDropdown()
  await supabase.auth.signOut()
  await navigateTo('/')
} 

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <!-- Avatar Button -->
    <button
      @click="toggleDropdown"
      class="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      :title="userEmail"
    >
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="userEmail"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm"
      >
        {{ userInitials }}
      </div>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/5 border border-slate-100 py-1 z-50"
      >
        <!-- User Info -->
        <div class="px-4 py-3 border-b border-slate-100">
          <p class="text-sm font-medium text-slate-900 truncate">{{ userEmail }}</p>
        </div>

        <!-- Menu Items -->
        <div class="py-1">
          <button
            @click="goToProfile"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profil
          </button>

          <button
            @click="logout"
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
