export default defineNuxtPlugin({
  name: 'supabase-auth',
  enforce: 'pre', // Run before other plugins
  async setup() {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    // Restore session immediately on plugin init
    // This ensures session is available before any middleware/page runs
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Plugin: Session restored:', !!session)
    } catch (error) {
      console.error('Plugin: Failed to restore session:', error)
    }

    // Listen to auth state changes and sync with Vue reactivity
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'Session:', !!session)

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in')
          break
        case 'SIGNED_OUT':
          console.log('User signed out')
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed')
          break
        case 'USER_UPDATED':
          console.log('User updated')
          break
        case 'PASSWORD_RECOVERY':
          console.log('Password recovery initiated')
          break
        default:
          break
      }
    })

    // Cleanup subscription on plugin unmount
    onUnmounted(() => {
      subscription.unsubscribe()
    })

    return {
      provide: {
        supabaseAuth: {
          // Helper to check if user is authenticated
          isAuthenticated: () => !!user.value,
          // Helper to get current session
          getSession: () => supabase.auth.getSession(),
          // Helper to sign out
          signOut: () => supabase.auth.signOut(),
        },
      },
    }
  },
})
