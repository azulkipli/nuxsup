export default defineNuxtRouteMiddleware((_to, _from) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Check session synchronously - user.value will be populated by Supabase module
  // from localStorage/cookie automatically on app mount
  if (!user.value) {
    // Double-check with getSession for edge cases
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigateTo('/login')
      }
    })
    return
  }

  // User is authenticated, allow access
  return
})
