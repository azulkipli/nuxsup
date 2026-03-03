<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Map as MapboxMap, LngLatLike, Marker as MapboxMarker } from 'mapbox-gl'

definePageMeta({
  middleware: false, // Disable auth middleware for this page
})

const { $t } = useI18n()
const config = useRuntimeConfig()

// Mapbox access token from environment variable
const mapboxToken = config.public.mapboxPublicKey

// Toast for notifications
const toast = useToast()

// Geolocation state
const isGettingLocation = ref(false)
const showPermissionReset = ref(false)

// Pin mode state
const isPinMode = ref<'none' | 'origin' | 'destination'>('none')

// Map state
let map: MapboxMap | null = null
let originMarker: MapboxMarker | null = null
let destinationMarker: MapboxMarker | null = null
let originMarkerEl: HTMLElement | null = null
let destinationMarkerEl: HTMLElement | null = null

// Form state
const originQuery = ref('')
const destinationQuery = ref('')
const originSuggestions = ref<
  Array<{ name: string; place_name: string; center: [number, number] }>
>([])
const destinationSuggestions = ref<
  Array<{ name: string; place_name: string; center: [number, number] }>
>([])
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
const isOriginSelected = ref(false)
const isDestinationSelected = ref(false)
const isLoadingSuggestions = ref(false)

// Selected locations
const originLocation = ref<{ name: string; center: [number, number] } | null>(null)
const destinationLocation = ref<{ name: string; center: [number, number] } | null>(null)

// Debounce timer
let debounceTimer: NodeJS.Timeout | null = null

// Initialize map
onMounted(async () => {
  if (!mapboxToken) {
    console.error('Mapbox access token is not configured')
    return
  }

  // Initialize Mapbox
  const mapboxgl = await import('mapbox-gl')

  // Set access token BEFORE creating map instance
  mapboxgl.default.accessToken = mapboxToken

  map = new mapboxgl.default.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [106.8272, -6.1751], // Default to Jakarta
    zoom: 12,
  })

  map.addControl(new mapboxgl.default.NavigationControl())

  // Add click listener for drop pin
  map.on('click', async (e: { lngLat: { lng: number; lat: number } }) => {
    if (isPinMode.value !== 'none') {
      const { lng, lat } = e.lngLat
      await dropPin(lat, lng)
    }
  })

  mapLoaded.value = true
})

// Map loaded state
const mapLoaded = ref(false)

// Drop pin at location
const dropPin = async (lat: number, lng: number) => {
  if (!map) return

  const center: [number, number] = [lng, lat]

  if (isPinMode.value === 'origin') {
    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
          `access_token=${mapboxToken}&` +
          `language=id`
      )
      const data = await response.json()

      let locationName = 'Lokasi yang dipilih'
      if (data.features && data.features.length > 0) {
        locationName = data.features[0].place_name
        originQuery.value = data.features[0].place_name
      }

      originLocation.value = {
        name: locationName,
        center,
      }
      isOriginSelected.value = true
      isPinMode.value = 'none'

      await updateMap()

      toast.add({
        title: 'Lokasi awal diatur',
        description: locationName,
        color: 'success',
      })
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      originLocation.value = {
        name: 'Lokasi yang dipilih',
        center,
      }
      isOriginSelected.value = true
      isPinMode.value = 'none'

      await updateMap()

      toast.add({
        title: 'Lokasi awal diatur',
        description: `Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        color: 'success',
      })
    }
  } else if (isPinMode.value === 'destination') {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
          `access_token=${mapboxToken}&` +
          `language=id`
      )
      const data = await response.json()

      let locationName = 'Lokasi yang dipilih'
      if (data.features && data.features.length > 0) {
        locationName = data.features[0].place_name
        destinationQuery.value = data.features[0].place_name
      }

      destinationLocation.value = {
        name: locationName,
        center,
      }
      isDestinationSelected.value = true
      isPinMode.value = 'none'

      await updateMap()

      toast.add({
        title: 'Lokasi akhir diatur',
        description: locationName,
        color: 'success',
      })
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      destinationLocation.value = {
        name: 'Lokasi yang dipilih',
        center,
      }
      isDestinationSelected.value = true
      isPinMode.value = 'none'

      await updateMap()

      toast.add({
        title: 'Lokasi akhir diatur',
        description: `Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        color: 'success',
      })
    }
  }
}

// Enable pin mode
const enablePinMode = (type: 'origin' | 'destination') => {
  isPinMode.value = type
  toast.add({
    title: 'Mode drop pin aktif',
    description:
      type === 'origin'
        ? 'Klik pada peta untuk menentukan lokasi awal'
        : 'Klik pada peta untuk menentukan lokasi akhir',
    color: 'info',
    duration: 5000,
  })

  // Close suggestions
  showOriginSuggestions.value = false
  showDestinationSuggestions.value = false
}

// Cancel pin mode
const cancelPinMode = () => {
  isPinMode.value = 'none'
  toast.add({
    title: 'Mode drop pin dibatalkan',
    color: 'info',
  })
}

// Search locations with geocoding
const searchLocations = async (query: string, type: 'origin' | 'destination') => {
  if (query.length < 3) {
    if (type === 'origin') {
      originSuggestions.value = []
    } else {
      destinationSuggestions.value = []
    }
    return
  }

  isLoadingSuggestions.value = true

  try {
    // Use bbox for Indonesia region to improve local results
    const indonesiaBbox = '95.008,-11.014,141.022,6.075'

    // Build proximity parameter from current map center if available
    let proximityParam = ''
    if (map) {
      const center = map.getCenter()
      proximityParam = `proximity=${center.lng},${center.lat}`
    }

    // Don't filter by types to include POIs (points of interest)
    // This allows searching for specific places like shops, buildings, etc.
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&` +
        `language=id&` +
        `country=id&` +
        `bbox=${indonesiaBbox}&` +
        (proximityParam ? `${proximityParam}&` : '') +
        `limit=5`
    )

    const data = await response.json()

    if (!data.features || !Array.isArray(data.features)) {
      console.warn('No features found in geocoding response')
      if (type === 'origin') {
        originSuggestions.value = []
        showOriginSuggestions.value = false
      } else {
        destinationSuggestions.value = []
        showDestinationSuggestions.value = false
      }
      isLoadingSuggestions.value = false
      return
    }

    if (type === 'origin') {
      originSuggestions.value = data.features.map(
        (feature: { place_name: string; center: [number, number]; text: string }) => ({
          name: feature.text,
          place_name: feature.place_name,
          center: feature.center,
        })
      )
      showOriginSuggestions.value = true
    } else {
      destinationSuggestions.value = data.features.map(
        (feature: { place_name: string; center: [number, number]; text: string }) => ({
          name: feature.text,
          place_name: feature.place_name,
          center: feature.center,
        })
      )
      showDestinationSuggestions.value = true
    }
  } catch (error) {
    console.error('Error searching locations:', error)
    if (type === 'origin') {
      originSuggestions.value = []
      showOriginSuggestions.value = false
    } else {
      destinationSuggestions.value = []
      showDestinationSuggestions.value = false
    }
  } finally {
    isLoadingSuggestions.value = false
  }
}

// Debounced search
const debouncedSearch = (query: string, type: 'origin' | 'destination') => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    searchLocations(query, type)
  }, 300)
}

// Handle origin input
const handleOriginInput = () => {
  if (originQuery.value.length >= 3) {
    debouncedSearch(originQuery.value, 'origin')
  } else {
    originSuggestions.value = []
    showOriginSuggestions.value = false
  }
}

// Handle destination input
const handleDestinationInput = () => {
  if (destinationQuery.value.length >= 3) {
    debouncedSearch(destinationQuery.value, 'destination')
  } else {
    destinationSuggestions.value = []
    showDestinationSuggestions.value = false
  }
}

// Select origin location
const selectOrigin = (location: { name: string; place_name: string; center: [number, number] }) => {
  originLocation.value = { name: location.name, center: location.center }
  originQuery.value = location.place_name
  showOriginSuggestions.value = false
  isOriginSelected.value = true

  // Update map
  updateMap()
}

// Select destination location
const selectDestination = (location: {
  name: string
  place_name: string
  center: [number, number]
}) => {
  destinationLocation.value = { name: location.name, center: location.center }
  destinationQuery.value = location.place_name
  showDestinationSuggestions.value = false
  isDestinationSelected.value = true

  // Update map
  updateMap()
}

// Update map with markers
const updateMap = async () => {
  if (!map) return

  const mapboxgl = await import('mapbox-gl')
  const MapboxLib = mapboxgl.default

  // Remove existing markers
  if (originMarker) {
    originMarker.remove()
    originMarker = null
    originMarkerEl = null
  }
  if (destinationMarker) {
    destinationMarker.remove()
    destinationMarker = null
    destinationMarkerEl = null
  }

  // Add origin marker with custom SVG icon
  if (originLocation.value) {
    originMarkerEl = document.createElement('div')
    originMarkerEl.className = 'origin-marker'
    originMarkerEl.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#3B82F6" stroke="white" stroke-width="2"/>
        <text x="12" y="14" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial, sans-serif">A</text>
      </svg>
    `
    originMarkerEl.style.cursor = 'grab'

    originMarker = new MapboxLib.Marker({
      element: originMarkerEl,
      draggable: true,
      anchor: 'bottom',
    })
      .setLngLat(originLocation.value.center)
      .setPopup(
        new MapboxLib.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <p class="font-semibold text-sm">${$t('route.origin')}</p>
            <p class="text-xs text-gray-600">${originLocation.value.name}</p>
          </div>
        `)
      )
      .addTo(map)

    // Handle drag events
    originMarker.on('drag', (e: { target: { getLngLat: () => { lng: number; lat: number } } }) => {
      const lngLat = e.target.getLngLat()
      updateLocationFromDrag('origin', [lngLat.lng, lngLat.lat])
    })

    originMarker.on(
      'dragend',
      async (e: { target: { getLngLat: () => { lng: number; lat: number } } }) => {
        const lngLat = e.target.getLngLat()
        const newCenter: [number, number] = [lngLat.lng, lngLat.lat]

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?` +
              `access_token=${mapboxToken}&` +
              `language=id`
          )
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            originLocation.value = {
              name: data.features[0].text,
              center: newCenter,
            }
            originQuery.value = data.features[0].place_name
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error)
        }
      }
    )

    // Fly to origin if only origin is selected
    if (!destinationLocation.value) {
      map.flyTo({
        center: originLocation.value.center,
        zoom: 14,
        duration: 1500,
      })
    }
  }

  // Add destination marker with custom SVG icon
  if (destinationLocation.value) {
    destinationMarkerEl = document.createElement('div')
    destinationMarkerEl.className = 'destination-marker'
    destinationMarkerEl.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#EF4444" stroke="white" stroke-width="2"/>
        <text x="12" y="14" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="Arial, sans-serif">B</text>
      </svg>
    `
    destinationMarkerEl.style.cursor = 'grab'

    destinationMarker = new MapboxLib.Marker({
      element: destinationMarkerEl,
      draggable: true,
      anchor: 'bottom',
    })
      .setLngLat(destinationLocation.value.center)
      .setPopup(
        new MapboxLib.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <p class="font-semibold text-sm">${$t('route.destination')}</p>
            <p class="text-xs text-gray-600">${destinationLocation.value.name}</p>
          </div>
        `)
      )
      .addTo(map)

    // Handle drag events
    destinationMarker.on(
      'drag',
      (e: { target: { getLngLat: () => { lng: number; lat: number } } }) => {
        const lngLat = e.target.getLngLat()
        updateLocationFromDrag('destination', [lngLat.lng, lngLat.lat])
      }
    )

    destinationMarker.on(
      'dragend',
      async (e: { target: { getLngLat: () => { lng: number; lat: number } } }) => {
        const lngLat = e.target.getLngLat()
        const newCenter: [number, number] = [lngLat.lng, lngLat.lat]

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?` +
              `access_token=${mapboxToken}&` +
              `language=id`
          )
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            destinationLocation.value = {
              name: data.features[0].text,
              center: newCenter,
            }
            destinationQuery.value = data.features[0].place_name
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error)
        }
      }
    )

    // Fit bounds to show both markers
    if (originLocation.value) {
      const bounds = new MapboxLib.LngLatBounds()
      bounds.extend(originLocation.value.center as LngLatLike)
      bounds.extend(destinationLocation.value.center as LngLatLike)

      map.fitBounds(bounds, {
        padding: 50,
        duration: 1500,
        maxZoom: 14,
      })
    } else {
      // Fly to destination if only destination is selected
      map.flyTo({
        center: destinationLocation.value.center,
        zoom: 14,
        duration: 1500,
      })
    }
  }
}

// Update location from drag (temporary, without reverse geocoding)
const updateLocationFromDrag = (type: 'origin' | 'destination', center: [number, number]) => {
  if (type === 'origin' && originLocation.value) {
    originLocation.value = { ...originLocation.value, center }
  } else if (type === 'destination' && destinationLocation.value) {
    destinationLocation.value = { ...destinationLocation.value, center }
  }
}

// Clear origin selection
const clearOrigin = () => {
  originLocation.value = null
  originQuery.value = ''
  isOriginSelected.value = false
  originSuggestions.value = []
  showOriginSuggestions.value = false

  if (originMarker) {
    originMarker.remove()
    originMarker = null
    originMarkerEl = null
  }

  // Reset map view if only origin was selected
  if (map && !destinationLocation.value) {
    map.flyTo({
      center: [106.8272, -6.1751],
      zoom: 12,
      duration: 1000,
    })
  }
}

// Clear destination selection
const clearDestination = () => {
  destinationLocation.value = null
  destinationQuery.value = ''
  isDestinationSelected.value = false
  destinationSuggestions.value = []
  showDestinationSuggestions.value = false

  if (destinationMarker) {
    destinationMarker.remove()
    destinationMarker = null
    destinationMarkerEl = null
  }

  // Reset map view if only destination was selected
  if (map && !originLocation.value) {
    map.flyTo({
      center: [106.8272, -6.1751],
      zoom: 12,
      duration: 1000,
    })
  }
}

// Close suggestions when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.suggestions-container')) {
    showOriginSuggestions.value = false
    showDestinationSuggestions.value = false
  }
}

// Get current GPS location
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.add({
      title: 'Geolocation tidak didukung',
      description: 'Browser Anda tidak mendukung geolocation',
      color: 'error',
    })
    return
  }

  isGettingLocation.value = true

  navigator.geolocation.getCurrentPosition(
    async position => {
      const { latitude, longitude } = position.coords
      const center: [number, number] = [longitude, latitude]

      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
            `access_token=${mapboxToken}&` +
            `language=id`
        )
        const data = await response.json()

        let locationName = 'Lokasi Anda'
        if (data.features && data.features.length > 0) {
          locationName = data.features[0].text
          originQuery.value = data.features[0].place_name
        }

        // Set as origin
        originLocation.value = {
          name: locationName,
          center,
        }
        isOriginSelected.value = true
        showPermissionReset.value = false

        // Update map
        await updateMap()

        toast.add({
          title: 'Lokasi ditemukan',
          description: 'Lokasi Anda telah diatur sebagai titik awal',
          color: 'success',
        })
      } catch (error) {
        console.error('Error reverse geocoding:', error)
        // Set without name if geocoding fails
        originLocation.value = {
          name: 'Lokasi Anda',
          center,
        }
        isOriginSelected.value = true

        await updateMap()

        toast.add({
          title: 'Lokasi ditemukan',
          description: 'Koordinat: ' + latitude.toFixed(4) + ', ' + longitude.toFixed(4),
          color: 'success',
        })
      }
    },
    error => {
      isGettingLocation.value = false
      let message = 'Gagal mendapatkan lokasi Anda'

      if (error.code === error.PERMISSION_DENIED) {
        message = 'Akses ke geolocation ditolak'
        showPermissionReset.value = true
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = 'Informasi lokasi tidak tersedia'
      } else if (error.code === error.TIMEOUT) {
        message = 'Waktu permintaan lokasi habis'
      }

      toast.add({
        title: 'Error Geolocation',
        description: message,
        color: 'error',
        actions: showPermissionReset.value
          ? [
              {
                label: 'Reset Permission',
                onClick: () => resetGeolocationPermission(),
              },
            ]
          : undefined,
      })
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  )
}

// Reset geolocation permission
const resetGeolocationPermission = () => {
  // Note: Browser permission reset is limited
  // This shows instructions to the user
  toast.add({
    title: 'Reset Permission',
    description:
      'Untuk reset permission: Buka Settings > Site Settings > Location > Hapus nuxsup dari blocked list',
    color: 'info',
    duration: 8000,
  })

  // Try to request again after a short delay
  setTimeout(() => {
    getCurrentLocation()
  }, 1000)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('route.title') }}
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ $t('route.description') }}
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Input Panel -->
        <div class="lg:col-span-1 space-y-4">
          <!-- Origin Input -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 suggestions-container relative"
          >
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <span class="flex items-center gap-2">
                  <span
                    class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    A
                  </span>
                  {{ $t('route.origin') }}
                </span>
              </label>

              <div class="flex gap-1">
                <UButton
                  size="xs"
                  :color="isPinMode === 'origin' ? 'warning' : 'primary'"
                  variant="outline"
                  :disabled="isPinMode !== 'none' && isPinMode !== 'origin'"
                  @click="isPinMode === 'origin' ? cancelPinMode() : enablePinMode('origin')"
                >
                  <template #leading>
                    <Icon
                      :name="isPinMode === 'origin' ? 'lucide:x' : 'lucide:map-pin'"
                      class="w-4 h-4"
                    />
                  </template>
                  {{ isPinMode === 'origin' ? 'Batal' : 'Pin' }}
                </UButton>

                <UButton
                  size="xs"
                  color="primary"
                  variant="outline"
                  :loading="isGettingLocation"
                  :disabled="isPinMode !== 'none'"
                  @click="getCurrentLocation"
                >
                  <template #leading>
                    <Icon name="lucide:crosshair" class="w-4 h-4" />
                  </template>
                  Lokasi
                </UButton>
              </div>
            </div>

            <div class="relative">
              <input
                v-model="originQuery"
                type="text"
                :placeholder="$t('route.searchOrigin')"
                class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                :disabled="isPinMode !== 'none'"
                @input="handleOriginInput"
                @focus="showOriginSuggestions = originSuggestions.length > 0"
              />

              <button
                v-if="isOriginSelected"
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="clearOrigin"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <!-- Pin Mode Info -->
            <div
              v-if="isPinMode === 'origin'"
              class="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
            >
              <Icon name="lucide:info" class="w-3 h-3" />
              Klik pada peta untuk menentukan lokasi awal
            </div>

            <!-- Suggestions Dropdown -->
            <div
              v-if="showOriginSuggestions && originSuggestions.length > 0"
              class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(suggestion, index) in originSuggestions"
                :key="index"
                class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                @click="selectOrigin(suggestion)"
              >
                <p class="font-medium text-sm text-gray-900 dark:text-white">
                  {{ suggestion.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {{ suggestion.place_name }}
                </p>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingSuggestions" class="mt-2 text-center text-sm text-gray-500">
              {{ $t('common.loading') }}...
            </div>
          </div>

          <!-- Destination Input -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 suggestions-container relative"
          >
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span class="flex items-center gap-2">
                <span
                  class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                >
                  B
                </span>
                {{ $t('route.destination') }}
              </span>
            </label>

            <div class="flex gap-2 mb-2">
              <UButton
                size="xs"
                :color="isPinMode === 'destination' ? 'warning' : 'primary'"
                variant="outline"
                :disabled="isPinMode !== 'none' && isPinMode !== 'destination'"
                @click="
                  isPinMode === 'destination' ? cancelPinMode() : enablePinMode('destination')
                "
              >
                <template #leading>
                  <Icon
                    :name="isPinMode === 'destination' ? 'lucide:x' : 'lucide:map-pin'"
                    class="w-4 h-4"
                  />
                </template>
                {{ isPinMode === 'destination' ? 'Batal' : 'Pin' }}
              </UButton>
            </div>

            <div class="relative">
              <input
                v-model="destinationQuery"
                type="text"
                :placeholder="$t('route.searchDestination')"
                class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                :disabled="isPinMode !== 'none'"
                @input="handleDestinationInput"
                @focus="showDestinationSuggestions = destinationSuggestions.length > 0"
              />

              <button
                v-if="isDestinationSelected"
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="clearDestination"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <!-- Pin Mode Info -->
            <div
              v-if="isPinMode === 'destination'"
              class="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
            >
              <Icon name="lucide:info" class="w-3 h-3" />
              Klik pada peta untuk menentukan lokasi akhir
            </div>

            <!-- Suggestions Dropdown -->
            <div
              v-if="showDestinationSuggestions && destinationSuggestions.length > 0"
              class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(suggestion, index) in destinationSuggestions"
                :key="index"
                class="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                @click="selectDestination(suggestion)"
              >
                <p class="font-medium text-sm text-gray-900 dark:text-white">
                  {{ suggestion.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {{ suggestion.place_name }}
                </p>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingSuggestions" class="mt-2 text-center text-sm text-gray-500">
              {{ $t('common.loading') }}...
            </div>
          </div>

          <!-- Selected Locations Summary -->
          <div
            v-if="originLocation || destinationLocation"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
          >
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">
              {{ $t('route.selectedLocations') }}
            </h3>

            <div class="space-y-3">
              <div v-if="originLocation" class="flex items-start gap-3">
                <span
                  class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                >
                  A
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ originLocation.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('route.origin') }}
                  </p>
                </div>
              </div>

              <div v-if="destinationLocation" class="flex items-start gap-3">
                <span
                  class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                >
                  B
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {{ destinationLocation.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('route.destination') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Container -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-[600px]">
            <div id="map" class="w-full h-full" />
          </div>

          <!-- Map Instructions -->
          <div
            class="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div class="flex items-start gap-3">
              <Icon
                name="lucide:info"
                class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              />
              <div class="text-sm text-blue-800 dark:text-blue-200">
                <p class="font-semibold mb-1">{{ $t('route.instructions') }}</p>
                <ul class="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>{{ $t('route.instruction1') }}</li>
                  <li>{{ $t('route.instruction2') }}</li>
                  <li>{{ $t('route.instruction3') }}</li>
                  <li>{{ $t('route.instruction4') }}</li>
                  <li>{{ $t('route.instruction5') }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#map {
  min-height: 600px;
}

/* Custom marker styles */
:deep(.origin-marker),
:deep(.destination-marker) {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s ease;
}

:deep(.origin-marker):hover,
:deep(.destination-marker):hover {
  transform: scale(1.1);
}

:deep(.mapboxgl-marker) {
  touch-action: none;
}

/* Mapbox marker styles */
:deep(.mapboxgl-popup-content) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border: 1px solid #e5e7eb;
  background-color: white;
  padding: 0.75rem 0.5rem;
}

:deep(.dark .mapboxgl-popup-content) {
  background-color: #1f2937;
  border-color: #374151;
}

:deep(.mapboxgl-popup-close-button) {
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

:deep(.mapboxgl-popup-close-button:hover) {
  color: #374151;
}

:deep(.dark .mapboxgl-popup-close-button) {
  color: #9ca3af;
}

:deep(.dark .mapboxgl-popup-close-button:hover) {
  color: #e5e7eb;
}

/* Suggestions dropdown animation */
div[v-if].absolute {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
