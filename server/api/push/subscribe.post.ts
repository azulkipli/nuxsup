export default defineEventHandler(async event => {
  const subscription = await readBody(event)

  // Store subscription using Nitro storage
  const storage = useStorage('push-subscriptions')
  const id = crypto.randomUUID()

  await storage.setItem(id, subscription)

  return { success: true, id }
})
