<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { t } = useI18n()
const router = useRouter()

// Get user avatar URL from user metadata or generate initials
const avatarUrl = computed(() => {
  return user.value?.user_metadata?.avatar_url || undefined
})

const userInitials = computed(() => {
  const email = user.value?.email || ''
  return email.charAt(0).toUpperCase()
})

const userEmail = computed(() => {
  return user.value?.email || ''
})

const open = ref(false)

const goToProfile = (e: Event) => {
  e.preventDefault()
  open.value = false
  router.push('/profil')
}

const logout = async (e: Event) => {
  e.preventDefault()
  open.value = false
  await supabase.auth.signOut()
  await router.push('/')
}

const items = computed(() => [
  // [
  //   {
  //     label: userEmail.value,
  //     slot: 'account',
  //     disabled: true,
  //   },
  // ],
  [
    {
      label: t('auth.profile'),
      icon: 'i-lucide-user',
      onSelect: goToProfile,
    },
  ],
  [
    {
      label: t('auth.logout'),
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: logout,
    },
  ],
])
</script>

<template>
  <UDropdownMenu v-model:open="open" :items="items" :ui="{ content: 'w-56' }">
    <UAvatar
      :src="avatarUrl"
      :alt="userEmail"
      :fallback="userInitials"
      class="cursor-pointer ring-2 ring-slate-200 hover:ring-indigo-400 transition-all"
    />

    <template #account>
      <div class="text-left">
        <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ userEmail }}</p>
      </div>
    </template>
  </UDropdownMenu>
</template>
