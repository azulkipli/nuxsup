<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

definePageMeta({
  middleware: false, // Disable auth middleware for this page
})

const { $t } = useI18n()
const config = useRuntimeConfig()

// Google Maps API key
const apiKey = config.public.googleMapsApiKey

// Toast for notifications
const toast = useToast()

// Map state
let map: google.maps.Map | null = null
let originMarker: google.maps.Marker | null = null
let destinationMarker: google.maps.Marker | null = null
const mapLoaded = ref(false)

// Pin mode state
const isPinMode = ref<'none' | 'origin' | 'destination'>('none')

// Form state
const originQuery = ref('')
const destinationQuery = ref('')
const originSuggestions = ref<
  Array<{ name: string; place_name: string; center: { lat: number; lng: number } }>
>([])
const destinationSuggestions = ref<
  Array<{ name: string; place_name: string; center: { lat: number; lng: number } }>
>([])
const showOriginSuggestions = ref(false)
const showDestinationSuggestions = ref(false)
const isOriginSelected = ref(false)
const isDestinationSelected = ref(false)
const isLoadingSuggestions = ref(false)

// Selected locations
const originLocation = ref<{ name: string; center: { lat: number; lng: number } } | null>(null)
const destinationLocation = ref<{ name: string; center: { lat: number; lng: number } } | null>(null)

// Debounce timer
let debounceTimer: NodeJS.Timeout | null = null

// Geolocation state
const isGettingLocation = ref(false)

// Load Google Maps script
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    if (!apiKey) {
      console.error('Google Maps API key is not configured')
      reject(new Error('Google Maps API key not configured'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
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
  if (!apiKey) {
    console.error('Google Maps API key is not configured')
    return
  }

  try {
    await loadGoogleMapsScript()

    map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: -6.1751, lng: 106.8272 },
      zoom: 12,
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

    // Add click listener for drop pin
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (isPinMode.value !== 'none' && e.latLng) {
        const latlng = e.latLng
        dropPin(latlng.lat(), latlng.lng())
      }
    })

    mapLoaded.value = true
  } catch (error) {
    console.error('Error initializing Google Maps:', error)
  }
}

// Drop pin at location
const dropPin = (lat: number, lng: number) => {
  if (!map) return

  const clickedLocation = { lat, lng }

  if (isPinMode.value === 'origin') {
    // Reverse geocode to get address
    const service = new google.maps.Geocoder()
    service.geocode({ location: clickedLocation }, (results, status) => {
      let name = 'Lokasi yang dipilih'
      if (status === 'OK' && results && results[0]) {
        name = results[0].formatted_address
        originQuery.value = results[0].formatted_address
      }

      originLocation.value = {
        name,
        center: clickedLocation,
      }
      isOriginSelected.value = true
      isPinMode.value = 'none'

      updateMap()

      toast.add({
        title: 'Lokasi awal diatur',
        description: name,
        color: 'success',
      })
    })
  } else if (isPinMode.value === 'destination') {
    const service = new google.maps.Geocoder()
    service.geocode({ location: clickedLocation }, (results, status) => {
      let name = 'Lokasi yang dipilih'
      if (status === 'OK' && results && results[0]) {
        name = results[0].formatted_address
        destinationQuery.value = results[0].formatted_address
      }

      destinationLocation.value = {
        name,
        center: clickedLocation,
      }
      isDestinationSelected.value = true
      isPinMode.value = 'none'

      updateMap()

      toast.add({
        title: 'Lokasi akhir diatur',
        description: name,
        color: 'success',
      })
    })
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

// Search locations with Places API
const searchLocations = async (query: string, type: 'origin' | 'destination') => {
  if (query.length < 3 || !window.google?.maps?.places) {
    if (type === 'origin') {
      originSuggestions.value = []
      showOriginSuggestions.value = false
    } else {
      destinationSuggestions.value = []
      showDestinationSuggestions.value = false
    }
    return
  }

  isLoadingSuggestions.value = true

  try {
    const service = new google.maps.places.PlacesService(map!)

    const request: google.maps.places.PlaceSearchRequest = {
      query,
      language: 'id',
      locationBias: map?.getCenter()
        ? { lat: map.getCenter()!.lat(), lng: map.getCenter()!.lng() }
        : undefined,
      fields: ['place_id', 'name', 'formatted_address', 'geometry'],
    }

    service.findPlaceFromQuery(request, (results, status) => {
      isLoadingSuggestions.value = false

      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const suggestions = results.map(place => ({
          name: place.name || 'Unknown',
          place_name: place.formatted_address || '',
          center: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          },
        }))

        if (type === 'origin') {
          originSuggestions.value = suggestions
          showOriginSuggestions.value = true
        } else {
          destinationSuggestions.value = suggestions
          showDestinationSuggestions.value = true
        }
      } else {
        if (type === 'origin') {
          originSuggestions.value = []
          showOriginSuggestions.value = false
        } else {
          destinationSuggestions.value = []
          showDestinationSuggestions.value = false
        }
      }
    })
  } catch (error) {
    console.error('Error searching locations:', error)
    isLoadingSuggestions.value = false
    if (type === 'origin') {
      originSuggestions.value = []
      showOriginSuggestions.value = false
    } else {
      destinationSuggestions.value = []
      showDestinationSuggestions.value = false
    }
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
const selectOrigin = (location: {
  name: string
  place_name: string
  center: { lat: number; lng: number }
}) => {
  originLocation.value = { name: location.name, center: location.center }
  originQuery.value = location.place_name
  showOriginSuggestions.value = false
  isOriginSelected.value = true
  isPinMode.value = 'none'

  updateMap()
}

// Select destination location
const selectDestination = (location: {
  name: string
  place_name: string
  center: { lat: number; lng: number }
}) => {
  destinationLocation.value = { name: location.name, center: location.center }
  destinationQuery.value = location.place_name
  showDestinationSuggestions.value = false
  isDestinationSelected.value = true
  isPinMode.value = 'none'

  updateMap()
}

// Create custom marker icon with SVG
const createMarkerIcon = (color: string, label: string) => {
  const svgLabel = encodeURIComponent(
    `<text x="12" y="17" text-anchor="middle" fill="white" font-size="14" font-weight="900" font-family="Arial, sans-serif" stroke="black" stroke-width="0.4" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${label}</text>`
  )
  const svgPath = encodeURIComponent(
    `<path d="M12 2C6.48 2 2 6.48 2 12s10 18 10 18 10-12.48 10-18S17.52 2 12 2z" fill="${color}" stroke="white" stroke-width="1.5"/>`
  )

  return {
    url: `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.4))">${svgPath}${svgLabel}</svg>`,
    scaledSize: new google.maps.Size(28, 36),
    anchor: new google.maps.Point(14, 32),
  } as google.maps.Icon
}

// Update map with markers
const updateMap = () => {
  if (!map) return

  // Remove existing markers
  if (originMarker) {
    originMarker.setMap(null)
    originMarker = null
  }
  if (destinationMarker) {
    destinationMarker.setMap(null)
    destinationMarker = null
  }

  // Add origin marker
  if (originLocation.value) {
    originMarker = new google.maps.Marker({
      position: originLocation.value.center,
      map,
      title: originLocation.value.name,
      icon: createMarkerIcon('#1E3A8A', 'A'),
      draggable: true,
      animation: google.maps.Animation.DROP,
    })

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 250px;">
          <p style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #1e40af;">${$t('route.origin')}</p>
          <p style="font-size: 12px; color: #666;">${originLocation.value.name}</p>
        </div>
      `,
    })

    originMarker.addListener('click', () => {
      infoWindow.open(map, originMarker)
    })

    // Handle drag start
    originMarker.addListener('dragstart', () => {
      toast.add({
        title: 'Memindahkan lokasi awal',
        description: 'Lepaskan marker di posisi yang diinginkan',
        color: 'info',
        duration: 3000,
      })
    })

    // Handle drag end - update location
    originMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newLat = e.latLng.lat()
        const newLng = e.latLng.lng()

        // Update location
        originLocation.value = {
          ...originLocation.value,
          center: { lat: newLat, lng: newLng },
        }

        // Reverse geocode to get new address
        const service = new google.maps.Geocoder()
        service.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            originLocation.value = {
              name: results[0].formatted_address,
              center: { lat: newLat, lng: newLng },
            }
            originQuery.value = results[0].formatted_address
          }

          toast.add({
            title: 'Lokasi awal diperbarui',
            description: originLocation.value.name,
            color: 'success',
          })
        })
      }
    })

    // Fly to origin if only origin is selected
    if (!destinationLocation.value) {
      map.panTo(originLocation.value.center)
      map.setZoom(14)
    }
  }

  // Add destination marker
  if (destinationLocation.value) {
    destinationMarker = new google.maps.Marker({
      position: destinationLocation.value.center,
      map,
      title: destinationLocation.value.name,
      icon: createMarkerIcon('#991B1B', 'B'),
      draggable: true,
      animation: google.maps.Animation.DROP,
    })

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 250px;">
          <p style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #991b1b;">${$t('route.destination')}</p>
          <p style="font-size: 12px; color: #666;">${destinationLocation.value.name}</p>
        </div>
      `,
    })

    destinationMarker.addListener('click', () => {
      infoWindow.open(map, destinationMarker)
    })

    // Handle drag start
    destinationMarker.addListener('dragstart', () => {
      toast.add({
        title: 'Memindahkan lokasi akhir',
        description: 'Lepaskan marker di posisi yang diinginkan',
        color: 'info',
        duration: 3000,
      })
    })

    // Handle drag end - update location
    destinationMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newLat = e.latLng.lat()
        const newLng = e.latLng.lng()

        // Update location
        destinationLocation.value = {
          ...destinationLocation.value,
          center: { lat: newLat, lng: newLng },
        }

        // Reverse geocode to get new address
        const service = new google.maps.Geocoder()
        service.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            destinationLocation.value = {
              name: results[0].formatted_address,
              center: { lat: newLat, lng: newLng },
            }
            destinationQuery.value = results[0].formatted_address
          }

          toast.add({
            title: 'Lokasi akhir diperbarui',
            description: destinationLocation.value.name,
            color: 'success',
          })
        })
      }
    })

    // Fit bounds to show both markers
    if (originLocation.value) {
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(originLocation.value.center)
      bounds.extend(destinationLocation.value.center)
      map.fitBounds(bounds)
    } else {
      map.panTo(destinationLocation.value.center)
      map.setZoom(14)
    }
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
    originMarker.setMap(null)
    originMarker = null
  }

  if (map && !destinationLocation.value) {
    map.panTo({ lat: -6.1751, lng: 106.8272 })
    map.setZoom(12)
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
    destinationMarker.setMap(null)
    destinationMarker = null
  }

  if (map && !originLocation.value) {
    map.panTo({ lat: -6.1751, lng: 106.8272 })
    map.setZoom(12)
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
    position => {
      const { latitude, longitude } = position.coords
      const center = { lat: latitude, lng: longitude }

      const service = new google.maps.Geocoder()
      service.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
        isGettingLocation.value = false

        if (status === 'OK' && results && results[0]) {
          originLocation.value = {
            name: results[0].formatted_address || 'Lokasi Anda',
            center,
          }
          originQuery.value = results[0].formatted_address || ''
          isOriginSelected.value = true

          updateMap()

          toast.add({
            title: 'Lokasi ditemukan',
            description: 'Lokasi Anda telah diatur sebagai titik awal',
            color: 'success',
          })
        } else {
          originLocation.value = {
            name: 'Lokasi Anda',
            center,
          }
          isOriginSelected.value = true

          updateMap()

          toast.add({
            title: 'Lokasi ditemukan',
            description: `Koordinat: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            color: 'success',
          })
        }
      })
    },
    error => {
      isGettingLocation.value = false
      let message = 'Gagal mendapatkan lokasi Anda'

      if (error.code === error.PERMISSION_DENIED) {
        message = 'Akses ke geolocation ditolak'
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = 'Informasi lokasi tidak tersedia'
      } else if (error.code === error.TIMEOUT) {
        message = 'Waktu permintaan lokasi habis'
      }

      toast.add({
        title: 'Error Geolocation',
        description: message,
        color: 'error',
      })
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  )
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  initMap()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  if (map) {
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
            <div
              id="map"
              class="w-full h-full"
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
                  <li class="text-amber-700 dark:text-amber-300 font-medium">
                    Atau gunakan tombol "Pin" untuk drop pin manual pada peta
                  </li>
                  <li class="text-green-700 dark:text-green-300 font-medium">
                    Marker dapat digeser (drag & drop) untuk menyesuaikan posisi
                  </li>
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

/* Google Maps info window styles */
:deep(.gm-style-iw) {
  padding: 8px;
}

:deep(.gm-style-iw-d) {
  overflow: hidden;
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

/* Pin mode cursor */
:deep(.gm-style) {
  cursor: crosshair;
}

:deep(.gm-style):not(.gm-style-pinning) {
  cursor: grab;
}

:deep(.gm-style:active) {
  cursor: grabbing;
}

/* Draggable marker cursor */
:deep(.gm-style .gm-marker-draggable) {
  cursor: move;
}

:deep(.gm-marker:active) {
  cursor: grabbing;
}
</style>
