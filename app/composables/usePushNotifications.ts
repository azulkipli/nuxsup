export const usePushNotifications = () => {
  const isSupported = ref(false)
  const isSubscribed = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const subscriptionId = ref<string | null>(null)
  
  const { $pwa } = useNuxtApp()
  const config = useRuntimeConfig()
  
  // Check browser support
  onMounted(() => {
    isSupported.value = 'Notification' in window && 
                        'serviceWorker' in navigator && 
                        'PushManager' in window
  })
  
  // Request notification permission
  const requestPermission = async () => {
    if (!isSupported.value) {
      error.value = 'Push notifications not supported'
      return false
    }
    
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  // Subscribe to push notifications
  const subscribe = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // Request permission first
      const hasPermission = await requestPermission()
      if (!hasPermission) {
        error.value = 'Notification permission denied'
        return false
      }
      
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready
      
      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.public.pushVapidPublicKey as string)
      })
      
      // Send subscription to server
      const response = await $fetch<{ success: boolean; id: string }>('/api/push/subscribe', {
        method: 'POST',
        body: subscription.toJSON()
      })
      
      subscriptionId.value = response.id
      isSubscribed.value = true
      
      // Store subscription ID in localStorage
      localStorage.setItem('push-subscription-id', response.id)
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to subscribe'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
      }
      
      // Clear stored subscription ID
      localStorage.removeItem('push-subscription-id')
      subscriptionId.value = null
      isSubscribed.value = false
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to unsubscribe'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Check existing subscription on mount
  onMounted(async () => {
    if (!isSupported.value) return
    
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      isSubscribed.value = !!subscription
      
      // Restore subscription ID from localStorage
      const storedId = localStorage.getItem('push-subscription-id')
      if (storedId) {
        subscriptionId.value = storedId
      }
    } catch (err) {
      console.error('Failed to check subscription:', err)
    }
  })
  
  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscriptionId,
    subscribe,
    unsubscribe,
    requestPermission
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}
