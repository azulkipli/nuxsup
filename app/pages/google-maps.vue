<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const { $t } = useI18n()

// Map state
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)
const mapLoaded = ref(false)
const currentZoom = ref(12)

// Map center coordinates (Jakarta, Indonesia)
const centerCoordinates = reactive({
  lat: -6.2088,
  lng: 106.8456,
})

// Markers data
const markers = ref([
  { id: 1, name: 'Monas', lat: -6.1751, lng: 106.8272 },
  { id: 2, name: 'Bundaran HI', lat: -6.1944, lng: 106.8229 },
  { id: 3, name: 'Kota Tua', lat: -6.1352, lng: 106.8133 },
])

// Marker instances
const markerInstances = ref<google.maps.Marker[]>([])

// Load Google Maps script
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    const config = useRuntimeConfig()
    const apiKey = config.public.googleMapsApiKey

    if (!apiKey) {
      console.warn(
        'Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY environment variable.'
      )
      reject(new Error('Google Maps API key not configured'))
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`
    script.async = true
    script.defer = true

    script.onload = () => {
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'))
    }

    document.head.appendChild(script)
  })
}

// Initialize map
const initMap = async () => {
  if (!mapContainer.value) return

  try {
    // Load Google Maps script
    await loadGoogleMapsScript()

    // Create map instance
    map.value = new google.maps.Map(mapContainer.value, {
      center: { lat: centerCoordinates.lat, lng: centerCoordinates.lng },
      zoom: 12,
      minZoom: 1,
      maxZoom: 20,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      gestureHandling: 'auto',
      mapTypeId: 'roadmap',
    })

    // Add markers
    markers.value.forEach(marker => {
      // Create marker with advanced marker options
      const googleMarker = new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: map.value,
        title: marker.name,
        animation: google.maps.Animation.DROP,
      })

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-weight: 500; font-family: system-ui;">
            ${marker.name}
          </div>
        `,
      })

      // Add click listener
      googleMarker.addListener('click', () => {
        infoWindow.open(map.value, googleMarker)
      })

      // Add hover effect
      googleMarker.addListener('mouseover', () => {
        googleMarker.setAnimation(google.maps.Animation.BOUNCE)
      })

      googleMarker.addListener('mouseout', () => {
        googleMarker.setAnimation(null)
      })

      markerInstances.value.push(googleMarker)
    })

    // Listen to zoom events
    map.value.addListener('zoom_changed', () => {
      currentZoom.value = map.value!.getZoom() || 12
    })

    mapLoaded.value = true
  } catch (error) {
    console.error('Error initializing Google Maps:', error)
  }
}

// Fly to location
const flyToLocation = (lat: number, lng: number, zoom: number = 14) => {
  if (map.value) {
    map.value.panTo({ lat, lng })
    map.value.setZoom(zoom)
  }
}

// Reset view to default
const resetView = () => {
  flyToLocation(centerCoordinates.lat, centerCoordinates.lng, 12)
}

// Initialize map on mount
onMounted(() => {
  initMap()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('googleMaps.title', 'Peta Google Maps Sederhana') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('googleMaps.description', 'Contoh implementasi Google Maps dengan Nuxt 3') }}
        </p>
      </div>
    </div>

    <!-- Map Container -->
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar Controls -->
        <div class="lg:col-span-1 space-y-4">
          <UCard>
            <template #header>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ $t('googleMaps.controls', 'Kontrol') }}
              </h3>
            </template>

            <div class="space-y-3">
              <!-- Location Buttons -->
              <div>
                <label
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {{ $t('googleMaps.locations', 'Lokasi') }}
                </label>
                <div class="mt-2 space-y-2">
                  <UButton
                    v-for="marker in markers"
                    :key="marker.id"
                    :label="marker.name"
                    color="blue"
                    variant="outline"
                    size="sm"
                    block
                    @click="flyToLocation(marker.lat, marker.lng)"
                  />
                </div>
              </div>

              <!-- Reset Button -->
              <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                <UButton
                  :label="$t('googleMaps.reset', 'Reset Tampilan')"
                  color="gray"
                  variant="solid"
                  size="sm"
                  block
                  @click="resetView"
                />
              </div>

              <!-- Zoom Info -->
              <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ $t('googleMaps.zoom', 'Zoom') }}
                  </span>
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ currentZoom.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Info Card -->
          <UCard>
            <template #header>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ $t('googleMaps.info', 'Info') }}
              </h3>
            </template>

            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                {{ $t('googleMaps.infoCenter', 'Pusat: Jakarta, Indonesia') }}
              </p>
              <p>
                {{ $t('googleMaps.infoMarkers', 'Penanda: 3 lokasi') }}
              </p>
              <p>
                {{ $t('googleMaps.infoInteract', 'Klik dan geser peta untuk berinteraksi') }}
              </p>
            </div>
          </UCard>
        </div>

        <!-- Map -->
        <div class="lg:col-span-3">
          <div
            ref="mapContainer"
            class="w-full h-[600px] rounded-lg overflow-hidden"
            :class="{ 'bg-gray-200 dark:bg-gray-700': !mapLoaded }"
          >
            <div v-if="!mapLoaded" class="flex items-center justify-center w-full h-full">
              <div class="text-center">
                <div
                  class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
                />
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('googleMaps.loading', 'Memuat peta...') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.gm-style) {
  border-radius: 0.5rem;
}

:deep(.gm-style .gm-style-mtc),
:deep(.gm-style .gm-svpc),
:deep(.gm-style .gmn-sm) {
  margin: 8px !important;
}

:deep(.gm-marker-pin) {
  transition: all 0.2s ease;
}

:deep(.gm-marker-pin:hover) {
  transform: scale(1.1);
}
</style>
