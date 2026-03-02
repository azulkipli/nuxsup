// Google Maps TypeScript declarations
// Reference: https://developers.google.com/maps/documentation/javascript/reference

export {}

declare global {
  interface Window {
    google?: {
      maps: typeof google.maps
    }
  }
}

declare namespace google.maps {
  // Map options
  interface MapOptions {
    center?: LatLng | LatLngLiteral
    zoom?: number
    minZoom?: number
    maxZoom?: number
    disableDefaultUI?: boolean
    zoomControl?: boolean
    mapTypeControl?: boolean
    scaleControl?: boolean
    streetViewControl?: boolean
    rotateControl?: boolean
    fullscreenControl?: boolean
    gestureHandling?: 'auto' | 'greedy' | 'cooperative' | 'none'
    mapTypeId?: string
  }

  // Map class
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions)
    setCenter(latLng: LatLng | LatLngLiteral): void
    setZoom(zoom: number): void
    getZoom(): number | undefined
    panTo(latLng: LatLng | LatLngLiteral): void
    addControl(control: ControlPosition | unknown, position?: ControlPosition): void
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener
  }

  // LatLng
  interface LatLngLiteral {
    lat: number
    lng: number
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean)
    lat(): number
    lng(): number
    toString(): string
  }

  // Marker
  interface MarkerOptions {
    position?: LatLng | LatLngLiteral
    map?: Map | null
    title?: string
    animation?: Animation | null
    icon?: string | Icon | Symbol
    label?: string | MarkerLabel
    draggable?: boolean
    clickable?: boolean
  }

  class Marker {
    constructor(opts?: MarkerOptions)
    setMap(map: Map | null): void
    getPosition(): LatLng | undefined
    setTitle(title: string): void
    getTitle(): string
    setAnimation(animation: Animation | null): void
    getAnimation(): Animation | undefined
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener
  }

  // Marker animations
  enum Animation {
    BOUNCE,
    DROP,
  }

  // InfoWindow
  interface InfoWindowOptions {
    content?: string | Element | Node
    position?: LatLng | LatLngLiteral
    maxWidth?: number
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions)
    open(map?: Map | StreetViewPanorama, anchor?: MVCObject | null): void
    close(): void
    setContent(content: string | Node): void
    getPosition(): LatLng | undefined
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener
  }

  // Control positions
  enum ControlPosition {
    TOP_LEFT,
    TOP_CENTER,
    TOP,
    TOP_RIGHT,
    RIGHT_CENTER,
    RIGHT,
    RIGHT_BOTTOM,
    BOTTOM_RIGHT,
    BOTTOM_CENTER,
    BOTTOM,
    BOTTOM_LEFT,
    LEFT_CENTER,
    LEFT,
    LEFT_TOP,
  }

  // Event listener
  interface MapsEventListener {
    remove(): void
  }

  // MVCObject (base class for markers, etc.)
  class MVCObject {
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapsEventListener
    bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void
    get(key: string): unknown
    notify(key: string): void
    set(key: string, value: unknown): void
    setValues(values: unknown): void
    unbind(key: string): void
    unbindAll(): void
  }

  // Icon
  interface Icon {
    url: string
    size?: Size
    origin?: Point
    anchor?: Point
    scaledSize?: Size
    labelOrigin?: Point
  }

  // Symbol
  interface Symbol {
    path: SymbolPath | string
    anchor?: Point
    fillColor?: string
    fillOpacity?: number
    rotation?: number
    scale?: number
    strokeColor?: string
    strokeOpacity?: number
    strokeWeight?: number
  }

  // Symbol paths
  enum SymbolPath {
    BACKWARD_CLOSED_ARROW,
    BACKWARD_OPEN_ARROW,
    CIRCLE,
    FORWARD_CLOSED_ARROW,
    FORWARD_OPEN_ARROW,
  }

  // Size
  class Size {
    constructor(
      width: number | string,
      height: number | string,
      widthUnit?: string,
      heightUnit?: string
    )
    width: number | string
    height: number | string
    toString(): string
  }

  // Point
  class Point {
    constructor(x: number, y: number)
    x: number
    y: number
    equals(other: Point): boolean
    toString(): string
  }

  // Marker label
  interface MarkerLabel {
    text: string
    color?: string
    fontSize?: string
    fontWeight?: string
  }

  // StreetViewPanorama
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  class StreetViewPanorama {}
}
