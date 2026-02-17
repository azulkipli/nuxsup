<template>
  <div
    v-if="showInstallPrompt"
    class="fixed bottom-5 left-5 right-5 z-[9998] animate-slide-up sm:left-auto sm:right-5 sm:max-w-[380px]"
  >
    <div
      class="bg-linear-to-br from-[#667eea] to-[#764ba2] text-white px-5 py-4 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-start gap-3">
        <span class="text-[32px] leading-none">📱</span>
        <div>
          <p class="font-semibold text-base mb-1">{{ $t('pwa.installTitle') }}</p>
          <p class="text-[13px] opacity-90">{{ $t('pwa.installDescription') }}</p>
        </div>
      </div>
      <div class="flex gap-2 sm:min-w-[200px]">
        <button
          class="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-white text-[#667eea] hover:bg-gray-100 hover:-translate-y-px"
          @click="install"
        >
          {{ $t('pwa.install') }}
        </button>
        <button
          class="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-white/20 text-white border border-white/30 hover:bg-white/30"
          @click="dismiss"
        >
          {{ $t('pwa.later') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => void
  userChoice: Promise<{ outcome: string }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const showInstallPrompt = ref(false)

// Listen for beforeinstallprompt event
onMounted(() => {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later
    deferredPrompt = e
    // Show our custom install prompt
    showInstallPrompt.value = true
  })

  // Listen for successful install
  window.addEventListener('appinstalled', () => {
    showInstallPrompt.value = false
    deferredPrompt = null
    console.log('PWA installed successfully')
  })
})

const install = async () => {
  if (!deferredPrompt) return

  // Show the install prompt
  deferredPrompt.prompt()

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice

  console.log(`User response to install prompt: ${outcome}`)

  // We've used the prompt, and can't use it again
  deferredPrompt = null
  showInstallPrompt.value = false
}

const dismiss = () => {
  showInstallPrompt.value = false
  // Keep deferredPrompt for potential later use
}
</script>
