export default defineNuxtRouteMiddleware((to, _from) => {
  const user = useSupabaseUser()
  console.log('user:', user.value)

  if (!user.value) {
    return navigateTo('/login')
  }
})
