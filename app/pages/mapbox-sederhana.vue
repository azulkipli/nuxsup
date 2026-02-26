<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const { $t } = useI18n()

// Map state
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<mapboxgl.Map | null>(null)
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

// Initialize map
const initMap = () => {
  if (!mapContainer.value) return

  // Set Mapbox access token from runtime config
  const config = useRuntimeConfig()
  mapboxgl.accessToken = config.public.mapboxPublicKey

  if (!mapboxgl.accessToken) {
    console.warn('Mapbox access token not configured. Please set NUXT_MAPBOX_ACCESS_TOKEN environment variable.')
    return
  }

  // Create map instance
  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [centerCoordinates.lng, centerCoordinates.lat],
    zoom: 12,
    minZoom: 1,
    maxZoom: 18,
    scrollZoom: true,
    doubleClickZoom: true,
    dragRotate: true,
    dragPan: true,
    keyboard: true,
    touchZoomRotate: true,
    touchPitch: true,
  })

  // Add navigation control
  map.value.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'top-left')

  // Add scale control
  map.value.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

  // Add fullscreen control
  map.value.addControl(new mapboxgl.FullscreenControl(), 'top-right')

  // Add geolocate control
  map.value.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true,
    }),
    'top-right',
  )

  // Add markers
  markers.value.forEach((marker) => {
    // Create marker element
    const el = document.createElement('div')
    el.className = 'marker'
    el.style.width = '20px'
    el.style.height = '20px'
    el.style.backgroundColor = '#3b82f6'
    el.style.border = '2px solid white'
    el.style.borderRadius = '50%'
    el.style.cursor = 'pointer'
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'

    // Create popup content
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<div style="padding: 4px; font-weight: 500;">${marker.name}</div>`,
    )

    // Add marker to map
    new mapboxgl.Marker(el)
      .setLngLat([marker.lng, marker.lat])
      .setPopup(popup)
      .addTo(map.value!)
  })

  // Listen to zoom events
  map.value.on('zoom', () => {
    currentZoom.value = map.value!.getZoom()
  })

  mapLoaded.value = true
}

// Fly to location
const flyToLocation = (lat: number, lng: number, zoom: number = 14) => {
  if (map.value) {
    map.value.flyTo({
      center: [lng, lat],
      zoom,
      essential: true,
      duration: 2000,
    })
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
          {{ $t('mapbox.title', 'Peta Mapbox Sederhana') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('mapbox.description', 'Contoh implementasi Mapbox dengan Nuxt 3') }}
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
                {{ $t('mapbox.controls', 'Kontrol') }}
              </h3>
            </template>

            <div class="space-y-3">
              <!-- Location Buttons -->
              <div>
                <label class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ $t('mapbox.locations', 'Lokasi') }}
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
                  :label="$t('mapbox.reset', 'Reset Tampilan')"
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
                    {{ $t('mapbox.zoom', 'Zoom') }}
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
                {{ $t('mapbox.info', 'Info') }}
              </h3>
            </template>

            <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                {{ $t('mapbox.infoCenter', 'Pusat: Jakarta, Indonesia') }}
              </p>
              <p>
                {{ $t('mapbox.infoMarkers', 'Penanda: 3 lokasi') }}
              </p>
              <p>
                {{ $t('mapbox.infoInteract', 'Klik dan geser peta untuk berinteraksi') }}
              </p>
            </div>
          </UCard>
        </div>

        <!-- Map -->
        <div class="lg:col-span-3">
          <div
            ref="mapContainer"
            class="w-full h-[600px] rounded-lg overflow-hidden"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.mapboxgl-ctrl-logo) {
  margin: 8px !important;
}

:deep(.mapboxgl-ctrl-bottom-right) {
  margin: 8px !important;
}

:deep(.mapboxgl-map) {
  border-radius: 0.5rem;
}

:deep(.marker:hover) {
  background-color: #2563eb !important;
  transform: scale(1.2);
  transition: all 0.2s ease;
}
</style>
