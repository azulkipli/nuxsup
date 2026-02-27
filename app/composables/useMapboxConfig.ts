import { ref } from 'vue'

export const useMapboxConfig = () => {
  const config = useRuntimeConfig()

  // Mapbox access token from environment variable
  const mapboxToken = config.public.mapboxPublicKey
  // Use environment variable or fallback to default public token (development only)
  // IMPORTANT: Replace with your own token in production
  const accessToken = ref(config.public.mapboxPublicKey || mapboxToken)

  return {
    accessToken,
  }
}
