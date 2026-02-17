export default defineNuxtRouteMiddleware((_to, _from) => {
  const user = useSupabaseUser()
  console.log('user:', user.value)

  if (!user.value) {
    return navigateTo('/login')
  }
})
