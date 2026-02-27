# Mapbox Integration - Dokumentasi

## Overview

Nuxsup mengintegrasikan **Mapbox GL JS** untuk fitur pemetaan interaktif dengan autocomplete location search, draggable markers, dan geolocation support.

## Fitur

### 1. **Route Planner** (`/rute`)
Halaman perencanaan rute dengan fitur:
- ✅ Autocomplete search untuk Lokasi Awal dan Lokasi Akhir
- ✅ Marker interaktif dengan custom SVG icons
- ✅ Draggable markers dengan auto-update input field
- ✅ Reverse geocoding saat marker dilepas
- ✅ Geolocation button untuk deteksi GPS当前位置
- ✅ Toast notifications untuk permission handling
- ✅ i18n support (Bahasa Indonesia & English)

### 2. **Simple Map Demo** (`/mapbox-sederhana`)
Contoh implementasi dasar Mapbox untuk referensi.

---

## Setup & Konfigurasi

### 1. Install Dependencies

```bash
bun install
```

Package yang digunakan:
- `mapbox-gl` - Mapbox GL JS library
- `nuxt-mapbox` - Nuxt module untuk Mapbox (optional)

### 2. Environment Variables

Tambahkan ke `.env`:

```env
# Mapbox Access Token
# Dapatkan dari: https://account.mapbox.com
NUXT_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijo...
```

**Update `nuxt.config.ts`:**

```ts
export default defineNuxtConfig({
  mapbox: {
    accessToken: process.env.NUXT_MAPBOX_ACCESS_TOKEN || '',
  },
  
  runtimeConfig: {
    public: {
      mapboxPublicKey: process.env.NUXT_MAPBOX_ACCESS_TOKEN || '',
    },
  },
})
```

### 3. Mendapatkan Mapbox Token

1. Daftar/Login di [account.mapbox.com](https://account.mapbox.com)
2. Copy **Default public token**
3. Paste ke `.env`

**Token Scopes yang dibutuhkan:**
- `styles:read` - Load map styles
- `fonts:read` - Load map fonts
- `geocoding:read` - Search locations (autocomplete)

---

## Struktur File

```
app/
├── composables/
│   └── useMapboxConfig.ts       # Composable untuk Mapbox config (optional)
├── pages/
│   ├── rute.vue                 # Main route planner page
│   └── mapbox-sederhana.vue     # Simple map demo
└── assets/
    └── css/
        └── main.css             # Global styles (Mapbox CSS import)
```

---

## Implementasi Detail

### 1. Import Mapbox CSS & Library

```vue
<script setup lang="ts">
import 'mapbox-gl/dist/mapbox-gl.css'
import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl'
</script>
```

### 2. Inisialisasi Peta

```typescript
const map = ref<MapboxMap | null>(null)
const mapboxToken = 'pk.eyJ1Ijo...' // dari env

onMounted(async () => {
  const mapboxgl = await import('mapbox-gl')
  mapboxgl.default.accessToken = mapboxToken

  map.value = new mapboxgl.default.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [106.8272, -6.1751], // Jakarta
    zoom: 12,
  })

  map.value.addControl(new mapboxgl.default.NavigationControl())
})
```

### 3. Autocomplete Location Search

**API Endpoint:**
```
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json
```

**Parameters:**
- `access_token` - Mapbox token
- `language=id` - Bahasa Indonesia
- `country=id` - Filter Indonesia
- `bbox=95.008,-11.014,141.022,6.075` - Bounding box Indonesia
- `proximity={lng},{lat}` - Bias hasil ke lokasi peta saat ini
- `limit=5` - Jumlah hasil maksimal

**Contoh Request:**
```typescript
const response = await fetch(
  `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
    `access_token=${mapboxToken}&` +
    `language=id&` +
    `country=id&` +
    `bbox=95.008,-11.014,141.022,6.075&` +
    `limit=5`
)

const data = await response.json()
// data.features = [{ text, place_name, center, ... }]
```

**Tips untuk Hasil Lebih Baik:**
- Tambahkan `proximity` berdasarkan center peta saat ini
- Hapus filter `types` untuk include POI (Point of Interest)
- Gunakan bounding box untuk batasi wilayah

### 4. Custom Markers

**SVG Marker Icon:**
```typescript
const markerEl = document.createElement('div')
markerEl.innerHTML = `
  <svg width="32" height="32" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
          fill="#3B82F6" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="9" r="3" fill="white"/>
  </svg>
`

const marker = new MapboxLib.Marker({
  element: markerEl,
  draggable: true,
  anchor: 'bottom',
})
  .setLngLat(center)
  .addTo(map)
```

### 5. Draggable Markers dengan Reverse Geocoding

**Handle Drag Events:**
```typescript
// Saat drag (real-time update)
marker.on('drag', (e) => {
  const lngLat = e.target.getLngLat()
  updateLocationFromDrag('origin', [lngLat.lng, lngLat.lat])
})

// Saat drag selesai (reverse geocoding)
marker.on('dragend', async (e) => {
  const lngLat = e.target.getLngLat()
  
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?` +
      `access_token=${mapboxToken}&` +
      `language=id`
  )
  
  const data = await response.json()
  if (data.features?.length > 0) {
    // Update input field dengan nama lokasi baru
    originQuery.value = data.features[0].place_name
  }
})
```

### 6. Geolocation (GPS Location)

```typescript
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    toast.add({ title: 'Geolocation tidak didukung', color: 'error' })
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      
      // Reverse geocoding
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
          `access_token=${mapboxToken}&language=id`
      )
      
      const data = await response.json()
      // Set sebagai origin
      originLocation.value = {
        name: data.features?.[0]?.text || 'Lokasi Anda',
        center: [longitude, latitude],
      }
    },
    (error) => {
      // Handle permission denied
      if (error.code === error.PERMISSION_DENIED) {
        toast.add({
          title: 'Akses ke geolocation ditolak',
          color: 'error',
          actions: [{ label: 'Reset Permission', onClick: resetPermission }]
        })
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  )
}
```

### 7. Toast Notifications

```typescript
const toast = useToast()

// Success
toast.add({
  title: 'Lokasi ditemukan',
  description: 'Lokasi Anda telah diatur sebagai titik awal',
  color: 'success',
})

// Error dengan action button
toast.add({
  title: 'Error Geolocation',
  description: 'Akses ke geolocation ditolak',
  color: 'error',
  actions: [
    {
      label: 'Reset Permission',
      onClick: () => resetGeolocationPermission(),
    },
  ],
})
```

---

## API Reference

### Mapbox Geocoding API

**Forward Geocoding** (Search):
```
GET /geocoding/v5/mapbox.places/{query}.json
```

**Reverse Geocoding** (Coordinates to Address):
```
GET /geocoding/v5/mapbox.places/{longitude},{latitude}.json
```

**Response Format:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "id": "address.1234567890",
      "type": "Feature",
      "text": "Buah Batu",
      "place_name": "Buah Batu, Bandung, West Java, Indonesia",
      "center": [107.635764, -6.963711],
      "geometry": {
        "type": "Point",
        "coordinates": [107.635764, -6.963711]
      },
      "place_type": ["place"],
      "relevance": 1
    }
  ]
}
```

### Mapbox GL JS API

**Map Instance:**
```typescript
const map = new mapboxgl.Map({
  container: string | HTMLElement,
  style: string | object,
  center?: [number, number],
  zoom?: number,
})
```

**Marker:**
```typescript
const marker = new mapboxgl.Marker({
  element?: HTMLElement,
  draggable?: boolean,
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right',
})
  .setLngLat([lng, lat])
  .setPopup(popup)
  .addTo(map)
```

**Events:**
```typescript
marker.on('drag', (e) => { ... })
marker.on('dragend', (e) => { ... })
map.on('load', () => { ... })
```

---

## Best Practices

### 1. Performance

- **Lazy load Mapbox**: Import hanya saat dibutuhkan
  ```typescript
  const mapboxgl = await import('mapbox-gl')
  ```

- **Debounce search**: Tunggu user selesai mengetik (300ms)
  ```typescript
  const debouncedSearch = (query: string) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      searchLocations(query)
    }, 300)
  }
  ```

- **Limit results**: Gunakan `limit=5` untuk mengurangi payload

### 2. Error Handling

- Selalu cek `data.features` sebelum mengakses array
- Handle semua error types (PERMISSION_DENIED, TIMEOUT, dll)
- Fallback ke default values jika geocoding gagal

### 3. User Experience

- Tampilkan loading state saat fetching data
- Berikan feedback visual (toast) untuk setiap action
- Enable high accuracy untuk geolocation
- Sediakan instruksi jelas untuk reset permission

### 4. Security

- Jangan commit token ke Git (gunakan `.env`)
- Gunakan token dengan scope minimal yang diperlukan
- Rotate token secara berkala

---

## Troubleshooting

### Error: "An API access token is required"

**Penyebab:** Token tidak di-set atau invalid

**Solusi:**
```typescript
// Pastikan token di-set SEBELUM membuat map instance
const mapboxgl = await import('mapbox-gl')
mapboxgl.default.accessToken = mapboxToken // Set dulu!

const map = new mapboxgl.default.Map({ ... }) // Baru buat map
```

### Error: "401 Unauthorized"

**Penyebab:** Token expired atau tidak memiliki scope yang tepat

**Solusi:**
1. Cek token di [Mapbox Account](https://account.mapbox.com)
2. Pastikan scope `geocoding:read` enabled
3. Generate token baru jika perlu

### Error: "Type 'street' is not a known type"

**Penyebab:** Invalid `types` parameter di Geocoding API

**Solusi:**
```typescript
// Valid types:
types=country,region,place,district,locality,postcode,neighborhood,address
```

### Geolocation Permission Denied

**Penyebab:** User menolak akses atau browser memblokir

**Solusi:**
1. Chrome: `Settings > Privacy > Site Settings > Location`
2. Hapus `localhost:3000` dari blocked list
3. Refresh halaman dan allow permission

### POI Tidak Muncul di Hasil Search

**Penyebab:** Filter `types` terlalu ketat atau data tidak tersedia

**Solusi:**
- Hapus parameter `types` untuk include semua tipe
- Tambahkan `proximity` untuk bias hasil ke lokasi saat ini
- Zoom peta lebih dekat ke area yang dicari

---

## Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/guides/)
- [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)
- [Mapbox Access Tokens](https://docs.mapbox.com/api/overview/#access-tokens-and-token-scopes)
- [Nuxt Mapbox Module](https://nuxt.com/modules/mapbox)

---

## Changelog

### v1.0.0 (2026-02-27)
- ✅ Initial Mapbox integration
- ✅ Route planner page (`/rute`)
- ✅ Autocomplete location search
- ✅ Draggable markers with reverse geocoding
- ✅ Geolocation support with permission handling
- ✅ Custom SVG markers
- ✅ i18n support (ID/EN)
- ✅ Toast notifications
