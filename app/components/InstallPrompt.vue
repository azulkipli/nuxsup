<template>
  <div v-if="showInstallPrompt" class="install-prompt">
    <div class="install-prompt-content">
      <div class="install-prompt-text">
        <span class="install-prompt-icon">📱</span>
        <div>
          <p class="install-prompt-title">Install Nuxsup</p>
          <p class="install-prompt-subtitle">Add to Home Screen for better experience</p>
        </div>
      </div>
      <div class="install-prompt-actions">
        <button @click="install" class="install-btn">
          Install
        </button>
        <button @click="dismiss" class="dismiss-btn">
          Later
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showInstallPrompt = ref(false)
let deferredPrompt: any = null

// Listen for beforeinstallprompt event
onMounted(() => {
  if (typeof window === 'undefined') return
  
  window.addEventListener('beforeinstallprompt', (e: any) => {
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

<style scoped>
.install-prompt {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 9998;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.install-prompt-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.install-prompt-text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.install-prompt-icon {
  font-size: 32px;
  line-height: 1;
}

.install-prompt-title {
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 4px 0;
}

.install-prompt-subtitle {
  font-size: 13px;
  margin: 0;
  opacity: 0.9;
}

.install-prompt-actions {
  display: flex;
  gap: 8px;
}

.install-btn,
.dismiss-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.install-btn {
  background: white;
  color: #667eea;
}

.install-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.dismiss-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (min-width: 640px) {
  .install-prompt {
    left: auto;
    right: 20px;
    max-width: 380px;
  }
  
  .install-prompt-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .install-prompt-actions {
    flex-direction: row;
    min-width: 200px;
  }
}
</style>
