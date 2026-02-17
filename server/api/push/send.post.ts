import webpush from 'web-push'

export default defineEventHandler(async event => {
  const { title, body, subscriptionId } = await readBody(event)

  const config = useRuntimeConfig()

  // Configure web-push
  webpush.setVapidDetails(
    'mailto:noreply@nuxsup.app',
    config.public.pushVapidPublicKey,
    config.pushVapidPrivateKey
  )

  // Get subscription from storage
  const storage = useStorage('push-subscriptions')
  const subscription = await storage.getItem(subscriptionId)

  if (!subscription) {
    throw createError({
      statusCode: 404,
      message: 'Subscription not found',
    })
  }

  try {
    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({ title, body })
    )
    return { success: true }
  } catch {
    throw createError({
      statusCode: 500,
      message: 'Failed to send notification',
    })
  }
})
