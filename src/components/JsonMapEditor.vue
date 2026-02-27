<template>
  <div class="json-map-editor h-full">
    <div :class="[
      'bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl border-2 border-indigo-100 h-full flex flex-col',
      compactMode ? 'p-2' : 'p-8'
    ]">
      <!-- Header -->
      <div :class="['flex items-center justify-between', compactMode ? 'mb-2' : 'mb-6']">
        <div>
          <h2 :class="[
            'font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent',
            compactMode ? 'text-lg' : 'text-3xl'
          ]">
            {{ mapData?.metadata?.name || 'JSON Map Editor' }}
          </h2>
          <p v-if="!compactMode" class="text-gray-600 text-sm mt-2 font-medium">
            Interactive floor plan editor - Click and drag to move objects
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Edit Mode Toggle -->
          <button
            @click="toggleEditMode"
            :class="[
              'px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-semibold',
              editMode
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            ]"
            :title="editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'"
          >
            <svg v-if="editMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {{ editMode ? 'Editing' : 'View Only' }}
          </button>
          
          <!-- Save Button -->
          <button
            v-if="hasUnsavedChanges"
            @click="saveChanges"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2 font-semibold"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Changes
          </button>
          
          <!-- Back to View Button -->
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Map View
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading map data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-red-800 font-semibold mb-2">Failed to load map</h3>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
        <button @click="loadMapData" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
          Retry
        </button>
      </div>

      <!-- Map Editor -->
      <div v-else class="space-y-4">
        <!-- Controls -->
        <div class="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 shadow-md border border-indigo-200">
          <div class="flex items-center gap-4">
            <!-- Zoom Controls -->
            <button
              @click="zoomIn"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Zoom In"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              @click="zoomOut"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Zoom Out"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <button
              @click="resetView"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Reset View"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <span class="text-sm font-semibold text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-sm">
              {{ Math.round(zoom * 100) }}%
            </span>
          </div>

          <!-- Layer Controls -->
          <div class="flex items-center gap-3">
            <div class="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
              <span class="text-xs font-semibold text-gray-600 mr-1">Layers:</span>
              <template v-for="layer in mapData?.layers" :key="layer.id">
                <button
                  @click="toggleLayer(layer.id)"
                  :class="[
                    'flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
                    layer.visible ? 'bg-gray-100' : 'bg-gray-50 opacity-50'
                  ]"
                  :title="layer.visible ? 'Hide ' + layer.name : 'Show ' + layer.name"
                >
                  <div class="w-3 h-3 rounded" :style="{ backgroundColor: layer.color }"></div>
                  <span class="text-gray-600">{{ layer.name }}</span>
                </button>
              </template>
            </div>
          </div>

          <!-- Selected Object Info -->
          <div v-if="selectedEntity" class="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <span class="text-xs font-semibold text-gray-600">Selected:</span>
            <span class="text-xs text-indigo-600 font-bold">{{ selectedEntity.id }}</span>
            <span class="text-xs text-gray-500">({{ selectedEntity.type }})</span>
          </div>
        </div>

        <!-- Canvas Container -->
        <div 
          ref="canvasContainer"
          :class="[
            'bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 rounded-xl overflow-hidden shadow-2xl relative',
            compactMode ? 'flex-1 border-2 border-indigo-200' : 'border-4 border-indigo-300'
          ]"
          :style="compactMode ? 'min-height: 350px; width: 100%;' : 'height: 700px; width: 100%;'"
        >
          <canvas
            ref="canvas"
            :width="compactMode ? 800 : 1200"
            :height="compactMode ? 450 : 700"
            style="display: block; width: 100%; height: 100%;"
            :class="{ 'cursor-move': isPanning, 'cursor-grab': !isPanning && !editMode, 'cursor-pointer': editMode && !isDragging, 'cursor-grabbing': isDragging }"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseLeave"
            @wheel="handleWheel"
            @contextmenu.prevent
          ></canvas>
          
          <!-- Instructions Overlay -->
          <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg text-xs text-gray-600">
            <p v-if="editMode">
              <span class="font-semibold text-green-600">Edit Mode:</span> 
              Click to select, drag to move objects
            </p>
            <p v-else>
              <span class="font-semibold text-gray-700">View Mode:</span> 
              Scroll to zoom, drag to pan
            </p>
          </div>
          
          <!-- Coordinates Display -->
          <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg text-xs font-mono">
            <p class="text-gray-600">
              World: ({{ mouseWorldCoords.x.toFixed(1) }}, {{ mouseWorldCoords.y.toFixed(1) }}) ft
            </p>
          </div>
        </div>

        <!-- Entity List (for debugging/documentation) -->
        <div v-if="showEntityList" class="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
          <h4 class="font-semibold text-gray-700 mb-2">Entities ({{ mapData?.entities?.length || 0 }})</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div 
              v-for="entity in mapData?.entities" 
              :key="entity.id"
              @click="selectEntity(entity)"
              :class="[
                'px-2 py-1 rounded cursor-pointer transition-all',
                selectedEntity?.id === entity.id ? 'bg-indigo-200 text-indigo-800' : 'bg-white hover:bg-gray-100'
              ]"
            >
              {{ entity.id }} ({{ entity.type }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * JsonMapEditor.vue - JSON-based Editable Map Component
 * 
 * This component provides an interactive canvas-based map editor that:
 * 1. Loads map data from a JSON file
 * 2. Renders entities (lines, rectangles, arcs, text, points) on a canvas
 * 3. Supports zoom and pan navigation
 * 4. Allows selecting and dragging objects in edit mode
 * 5. Saves changes back to JSON format
 * 
 * COORDINATE SYSTEMS:
 * - World Coordinates: The actual map space (in feet, as defined in JSON)
 * - Screen Coordinates: The canvas pixel coordinates
 * 
 * Transformation: screenCoord = (worldCoord - panOffset) * zoom * scale + canvasCenter
 */

import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'

// ============================================================================
// PROPS & EMITS
// ============================================================================

const props = defineProps({
  // URL to the JSON map file (optional if mapData is provided)
  mapUrl: {
    type: String,
    default: ''
  },
  // Direct map data object (optional if mapUrl is provided)
  mapData: {
    type: Object,
    default: null
  },
  // Title override
  mapTitle: {
    type: String,
    default: ''
  },
  // Initial edit mode state
  initialEditMode: {
    type: Boolean,
    default: false
  },
  compactMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'entitySelected', 'mapLoaded', 'mapChanged'])

// ============================================================================
// REACTIVE STATE
// ============================================================================

// Canvas and rendering
const canvasContainer = ref(null)
const canvas = ref(null)
const ctx = ref(null)
const canvasWidth = ref(1200)
const canvasHeight = ref(700)

// Map data
const mapData = ref(null)
const originalMapData = ref(null) // For tracking changes
const loading = ref(true)
const error = ref(null)

// View state (zoom and pan)
const zoom = ref(1)
const panOffset = ref({ x: 0, y: 0 })
const baseScale = ref(1) // Calculated to fit map in canvas

// Interaction state
const editMode = ref(false)
const selectedEntity = ref(null)
const hoveredEntity = ref(null)
const isDragging = ref(false)
const isPanning = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const entityDragStart = ref({ x: 0, y: 0 })

// Mouse tracking
const mouseScreenCoords = ref({ x: 0, y: 0 })
const mouseWorldCoords = ref({ x: 0, y: 0 })

// UI state
const showEntityList = ref(false)
const hasUnsavedChanges = ref(false)

// ============================================================================
// COORDINATE TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Convert world coordinates (map space) to screen coordinates (canvas pixels)
 * @param {number} worldX - X coordinate in world space
 * @param {number} worldY - Y coordinate in world space
 * @returns {{x: number, y: number}} Screen coordinates
 */
const worldToScreen = (worldX, worldY) => {
  const scale = baseScale.value * zoom.value
  const x = (worldX - panOffset.value.x) * scale + canvasWidth.value / 2
  // Flip Y axis: world Y increases upward, screen Y increases downward
  const y = canvasHeight.value / 2 - (worldY - panOffset.value.y) * scale
  return { x, y }
}

/**
 * Convert screen coordinates (canvas pixels) to world coordinates (map space)
 * @param {number} screenX - X coordinate in screen space
 * @param {number} screenY - Y coordinate in screen space
 * @returns {{x: number, y: number}} World coordinates
 */
const screenToWorld = (screenX, screenY) => {
  const scale = baseScale.value * zoom.value
  const x = (screenX - canvasWidth.value / 2) / scale + panOffset.value.x
  // Flip Y axis
  const y = (canvasHeight.value / 2 - screenY) / scale + panOffset.value.y
  return { x, y }
}

/**
 * Convert a distance in world units to screen pixels
 * @param {number} worldDistance - Distance in world units
 * @returns {number} Distance in screen pixels
 */
const worldDistanceToScreen = (worldDistance) => {
  return worldDistance * baseScale.value * zoom.value
}

// ============================================================================
// MAP DATA LOADING
// ============================================================================

/**
 * Load map data from URL or use provided data directly
 */
const loadMapData = async () => {
  loading.value = true
  error.value = null

  try {
    let data
    
    // If direct mapData is provided, use it
    if (props.mapData) {
      console.log('[JsonMapEditor] Using provided map data')
      data = props.mapData
    } 
    // Otherwise, fetch from URL
    else if (props.mapUrl) {
      console.log('[JsonMapEditor] Fetching map from:', props.mapUrl)
      const response = await fetch(props.mapUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch map: ${response.statusText}`)
      }
      data = await response.json()
    } else {
      throw new Error('No map data or URL provided')
    }
    
    mapData.value = data
    originalMapData.value = JSON.parse(JSON.stringify(data)) // Deep clone
    
    console.log('[JsonMapEditor] Map data loaded:', data.metadata?.name)
    console.log('[JsonMapEditor] Entities count:', data.entities?.length)
    
    emit('mapLoaded', data)
    
    // IMPORTANT: Set loading to false FIRST so the canvas element is rendered in DOM
    loading.value = false
    
    // Wait for DOM to update (canvas is now in DOM since loading is false)
    await nextTick()
    
    // Small delay to ensure browser has rendered the canvas
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Now initialize the canvas
    if (canvas.value) {
      initializeCanvas()
      calculateBaseScale()
      centerMap()
      render()
      console.log('[JsonMapEditor] Canvas initialized successfully')
    } else {
      console.error('[JsonMapEditor] Canvas element not found after DOM update')
    }
    
  } catch (err) {
    console.error('[JsonMapEditor] Error loading map:', err)
    error.value = err.message
    loading.value = false
  }
}

// ============================================================================
// CANVAS INITIALIZATION
// ============================================================================

/**
 * Initialize the canvas element and context
 */
const initializeCanvas = () => {
  if (!canvas.value) {
    console.error('[JsonMapEditor] Canvas element not found!')
    return
  }
  
  // Use canvasContainer ref or fallback to parent
  const container = canvasContainer.value || canvas.value.parentElement
  if (!container) {
    console.error('[JsonMapEditor] Canvas container not found!')
    return
  }
  
  const rect = container.getBoundingClientRect()
  console.log('[JsonMapEditor] Container dimensions:', rect.width, 'x', rect.height)
  
  // Use container dimensions, fallback to defaults if zero
  const containerWidth = rect.width > 0 ? rect.width : 1200
  const containerHeight = rect.height > 0 ? rect.height : 700
  
  // Set canvas size with device pixel ratio for sharp rendering
  const dpr = window.devicePixelRatio || 1
  canvasWidth.value = containerWidth
  canvasHeight.value = containerHeight
  
  // Set the actual canvas buffer size (for sharp rendering)
  canvas.value.width = canvasWidth.value * dpr
  canvas.value.height = canvasHeight.value * dpr
  
  // Set display size via CSS
  canvas.value.style.width = canvasWidth.value + 'px'
  canvas.value.style.height = canvasHeight.value + 'px'
  
  // Get context and scale for HiDPI displays
  ctx.value = canvas.value.getContext('2d')
  if (!ctx.value) {
    console.error('[JsonMapEditor] Failed to get canvas 2D context!')
    return
  }
  ctx.value.scale(dpr, dpr)
  
  console.log('[JsonMapEditor] Canvas initialized:', canvasWidth.value, 'x', canvasHeight.value, 'DPR:', dpr)
}

/**
 * Calculate the base scale to fit the map within the canvas
 */
const calculateBaseScale = () => {
  if (!mapData.value?.metadata?.bounds) {
    console.warn('[JsonMapEditor] No bounds in metadata, using default scale')
    baseScale.value = 1
    return
  }
  
  const bounds = mapData.value.metadata.bounds
  const mapWidth = bounds.maxX - bounds.minX
  const mapHeight = bounds.maxY - bounds.minY
  
  console.log('[JsonMapEditor] Map dimensions:', mapWidth, 'x', mapHeight)
  
  // Ensure valid dimensions
  if (mapWidth <= 0 || mapHeight <= 0 || !isFinite(mapWidth) || !isFinite(mapHeight)) {
    console.warn('[JsonMapEditor] Invalid map dimensions, using default scale')
    baseScale.value = 1
    return
  }
  
  // Add padding (10% on each side)
  const padding = 0.2
  const availableWidth = canvasWidth.value * (1 - padding)
  const availableHeight = canvasHeight.value * (1 - padding)
  
  // Calculate scale to fit map in canvas
  const scaleX = availableWidth / mapWidth
  const scaleY = availableHeight / mapHeight
  baseScale.value = Math.min(scaleX, scaleY)
  
  // Ensure scale is reasonable
  if (baseScale.value <= 0 || !isFinite(baseScale.value)) {
    console.warn('[JsonMapEditor] Invalid scale calculated, using default')
    baseScale.value = 0.01 // Very small scale for large maps
  }
  
  console.log('[JsonMapEditor] Base scale calculated:', baseScale.value, 'Canvas:', canvasWidth.value, 'x', canvasHeight.value)
}

/**
 * Center the map in the canvas
 */
const centerMap = () => {
  if (!mapData.value?.metadata?.bounds) return
  
  const bounds = mapData.value.metadata.bounds
  panOffset.value = {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2
  }
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

/**
 * Main render function - clears canvas and draws all entities
 */
const render = () => {
  if (!ctx.value) {
    console.warn('[JsonMapEditor] render() called but ctx is null')
    return
  }
  if (!mapData.value) {
    console.warn('[JsonMapEditor] render() called but mapData is null')
    return
  }
  
  const context = ctx.value
  const entityCount = mapData.value.entities?.length || 0
  console.log('[JsonMapEditor] Rendering map with', entityCount, 'entities')
  console.log('[JsonMapEditor] Bounds:', mapData.value.metadata?.bounds)
  console.log('[JsonMapEditor] BaseScale:', baseScale.value, 'Zoom:', zoom.value, 'PanOffset:', panOffset.value)
  
  // Clear canvas
  context.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Draw background
  drawBackground(context)
  
  // Draw grid
  drawGrid(context)
  
  // Draw entities by layer order
  const layers = mapData.value.layers || []
  const entities = mapData.value.entities || []
  
  // Group entities by layer
  const entitiesByLayer = {}
  for (const entity of entities) {
    const layerId = entity.layerId || 'default'
    if (!entitiesByLayer[layerId]) {
      entitiesByLayer[layerId] = []
    }
    entitiesByLayer[layerId].push(entity)
  }
  
  // Render each layer in order
  for (const layer of layers) {
    if (!layer.visible) continue
    
    const layerEntities = entitiesByLayer[layer.id] || []
    for (const entity of layerEntities) {
      renderEntity(context, entity, layer)
    }
  }
  
  // Draw selection highlight
  if (selectedEntity.value) {
    drawSelectionHighlight(context, selectedEntity.value)
  }
  
  // Draw hover highlight
  if (hoveredEntity.value && hoveredEntity.value !== selectedEntity.value) {
    drawHoverHighlight(context, hoveredEntity.value)
  }
}

/**
 * Draw canvas background
 */
const drawBackground = (context) => {
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
}

/**
 * Draw coordinate grid
 */
const drawGrid = (context) => {
  const gridSpacing = 5 // Grid every 5 feet
  const bounds = mapData.value?.metadata?.bounds
  if (!bounds) return
  
  context.strokeStyle = '#e5e7eb'
  context.lineWidth = 0.5
  
  // Calculate visible grid range
  const topLeft = screenToWorld(0, 0)
  const bottomRight = screenToWorld(canvasWidth.value, canvasHeight.value)
  
  const minX = Math.floor(Math.min(topLeft.x, bottomRight.x) / gridSpacing) * gridSpacing
  const maxX = Math.ceil(Math.max(topLeft.x, bottomRight.x) / gridSpacing) * gridSpacing
  const minY = Math.floor(Math.min(topLeft.y, bottomRight.y) / gridSpacing) * gridSpacing
  const maxY = Math.ceil(Math.max(topLeft.y, bottomRight.y) / gridSpacing) * gridSpacing
  
  // Draw vertical lines
  for (let x = minX; x <= maxX; x += gridSpacing) {
    const start = worldToScreen(x, minY)
    const end = worldToScreen(x, maxY)
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.stroke()
  }
  
  // Draw horizontal lines
  for (let y = minY; y <= maxY; y += gridSpacing) {
    const start = worldToScreen(minX, y)
    const end = worldToScreen(maxX, y)
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.stroke()
  }
}

/**
 * Render a single entity based on its type
 */
const renderEntity = (context, entity, layer) => {
  switch (entity.type) {
    case 'line':
      renderLine(context, entity, layer)
      break
    case 'rect':
      renderRect(context, entity, layer)
      break
    case 'arc':
      renderArc(context, entity, layer)
      break
    case 'text':
      renderText(context, entity, layer)
      break
    case 'point':
      renderPoint(context, entity, layer)
      break
    case 'polyline':
      renderPolyline(context, entity, layer)
      break
    default:
      console.warn('[JsonMapEditor] Unknown entity type:', entity.type)
  }
}

/**
 * Render a line entity
 */
const renderLine = (context, entity, layer) => {
  // Validate entity data
  if (!entity.start || !entity.end) {
    console.warn('[JsonMapEditor] Line entity missing start/end:', entity)
    return
  }
  
  const start = worldToScreen(entity.start.x, entity.start.y)
  const end = worldToScreen(entity.end.x, entity.end.y)
  
  // Skip lines that are too short to see
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length < 0.5) return // Skip very short lines
  
  context.beginPath()
  context.moveTo(start.x, start.y)
  context.lineTo(end.x, end.y)
  context.strokeStyle = layer.color || '#000000'
  // Use consistent line width that scales with zoom
  context.lineWidth = Math.max((layer.lineWidth || 2) * zoom.value, 1)
  context.lineCap = 'round'
  context.stroke()
}

/**
 * Render a rectangle entity
 */
const renderRect = (context, entity, layer) => {
  const topLeft = worldToScreen(entity.x, entity.y + entity.height)
  const width = worldDistanceToScreen(entity.width)
  const height = worldDistanceToScreen(entity.height)
  
  // Fill
  if (entity.fill) {
    context.fillStyle = entity.fill
    context.fillRect(topLeft.x, topLeft.y, width, height)
  }
  
  // Stroke
  if (entity.stroke !== null) {
    context.strokeStyle = entity.stroke || layer.color || '#000000'
    context.lineWidth = (layer.lineWidth || 2) * zoom.value
    context.strokeRect(topLeft.x, topLeft.y, width, height)
  }
}

/**
 * Render an arc entity (for doors)
 */
const renderArc = (context, entity, layer) => {
  const center = worldToScreen(entity.center.x, entity.center.y)
  const radius = worldDistanceToScreen(entity.radius)
  
  // Convert angles from degrees to radians
  // Adjust for flipped Y-axis: negate and swap angles
  const startAngleRad = -entity.endAngle * Math.PI / 180
  const endAngleRad = -entity.startAngle * Math.PI / 180
  
  context.beginPath()
  context.arc(center.x, center.y, radius, startAngleRad, endAngleRad)
  context.strokeStyle = layer.color || '#000000'
  context.lineWidth = (layer.lineWidth || 2) * zoom.value
  context.stroke()
}

/**
 * Render a text entity
 */
const renderText = (context, entity, layer) => {
  const pos = worldToScreen(entity.position.x, entity.position.y)
  const fontSize = worldDistanceToScreen(entity.fontSize || 1)
  
  context.font = `bold ${Math.max(fontSize, 10)}px ${entity.fontFamily || 'Arial'}`
  context.fillStyle = layer.color || '#000000'
  context.textAlign = entity.textAlign || 'center'
  context.textBaseline = 'middle'
  
  // Draw background for better readability
  const metrics = context.measureText(entity.text)
  const textWidth = metrics.width
  const textHeight = fontSize
  const padding = 4
  
  context.fillStyle = 'rgba(255, 255, 255, 0.9)'
  context.fillRect(
    pos.x - textWidth / 2 - padding,
    pos.y - textHeight / 2 - padding,
    textWidth + padding * 2,
    textHeight + padding * 2
  )
  
  // Draw text
  context.fillStyle = layer.color || '#000000'
  context.fillText(entity.text, pos.x, pos.y)
}

/**
 * Render a point entity
 */
const renderPoint = (context, entity, layer) => {
  const pos = worldToScreen(entity.position.x, entity.position.y)
  const radius = worldDistanceToScreen(entity.radius || 0.3)
  
  context.beginPath()
  context.arc(pos.x, pos.y, Math.max(radius, 3), 0, Math.PI * 2)
  context.fillStyle = layer.color || '#000000'
  context.fill()
}

/**
 * Render a polyline entity
 */
const renderPolyline = (context, entity, layer) => {
  if (!entity.points || entity.points.length < 2) return
  
  context.beginPath()
  const firstPoint = worldToScreen(entity.points[0].x, entity.points[0].y)
  context.moveTo(firstPoint.x, firstPoint.y)
  
  for (let i = 1; i < entity.points.length; i++) {
    const point = worldToScreen(entity.points[i].x, entity.points[i].y)
    context.lineTo(point.x, point.y)
  }
  
  if (entity.closed) {
    context.closePath()
  }
  
  context.strokeStyle = layer.color || '#000000'
  context.lineWidth = (layer.lineWidth || 2) * zoom.value
  context.stroke()
}

/**
 * Draw selection highlight around selected entity
 */
const drawSelectionHighlight = (context, entity) => {
  const bbox = getEntityBoundingBox(entity)
  if (!bbox) return
  
  const topLeft = worldToScreen(bbox.minX, bbox.maxY)
  const bottomRight = worldToScreen(bbox.maxX, bbox.minY)
  
  const padding = 5
  context.strokeStyle = '#3b82f6'
  context.lineWidth = 2
  context.setLineDash([5, 5])
  context.strokeRect(
    topLeft.x - padding,
    topLeft.y - padding,
    bottomRight.x - topLeft.x + padding * 2,
    bottomRight.y - topLeft.y + padding * 2
  )
  context.setLineDash([])
  
  // Draw corner handles in edit mode
  if (editMode.value) {
    const handleSize = 8
    context.fillStyle = '#3b82f6'
    
    // Top-left
    context.fillRect(topLeft.x - padding - handleSize / 2, topLeft.y - padding - handleSize / 2, handleSize, handleSize)
    // Top-right
    context.fillRect(bottomRight.x + padding - handleSize / 2, topLeft.y - padding - handleSize / 2, handleSize, handleSize)
    // Bottom-left
    context.fillRect(topLeft.x - padding - handleSize / 2, bottomRight.y + padding - handleSize / 2, handleSize, handleSize)
    // Bottom-right
    context.fillRect(bottomRight.x + padding - handleSize / 2, bottomRight.y + padding - handleSize / 2, handleSize, handleSize)
  }
}

/**
 * Draw hover highlight
 */
const drawHoverHighlight = (context, entity) => {
  if (!editMode.value) return
  
  const bbox = getEntityBoundingBox(entity)
  if (!bbox) return
  
  const topLeft = worldToScreen(bbox.minX, bbox.maxY)
  const bottomRight = worldToScreen(bbox.maxX, bbox.minY)
  
  const padding = 3
  context.strokeStyle = '#10b981'
  context.lineWidth = 1
  context.setLineDash([3, 3])
  context.strokeRect(
    topLeft.x - padding,
    topLeft.y - padding,
    bottomRight.x - topLeft.x + padding * 2,
    bottomRight.y - topLeft.y + padding * 2
  )
  context.setLineDash([])
}

// ============================================================================
// HIT TESTING
// ============================================================================

/**
 * Get the bounding box of an entity in world coordinates
 */
const getEntityBoundingBox = (entity) => {
  switch (entity.type) {
    case 'line':
      return {
        minX: Math.min(entity.start.x, entity.end.x),
        maxX: Math.max(entity.start.x, entity.end.x),
        minY: Math.min(entity.start.y, entity.end.y),
        maxY: Math.max(entity.start.y, entity.end.y)
      }
    case 'rect':
      return {
        minX: entity.x,
        maxX: entity.x + entity.width,
        minY: entity.y,
        maxY: entity.y + entity.height
      }
    case 'arc':
      return {
        minX: entity.center.x - entity.radius,
        maxX: entity.center.x + entity.radius,
        minY: entity.center.y - entity.radius,
        maxY: entity.center.y + entity.radius
      }
    case 'text':
      const textSize = entity.fontSize || 1
      return {
        minX: entity.position.x - textSize * 3,
        maxX: entity.position.x + textSize * 3,
        minY: entity.position.y - textSize,
        maxY: entity.position.y + textSize
      }
    case 'point':
      const r = entity.radius || 0.3
      return {
        minX: entity.position.x - r,
        maxX: entity.position.x + r,
        minY: entity.position.y - r,
        maxY: entity.position.y + r
      }
    default:
      return null
  }
}

/**
 * Check if a world point is inside an entity (hit test)
 */
const hitTestEntity = (entity, worldX, worldY) => {
  const layer = mapData.value?.layers?.find(l => l.id === entity.layerId)
  if (layer && layer.locked) return false
  
  const tolerance = 1 / (baseScale.value * zoom.value) * 10 // Scale tolerance with zoom
  
  switch (entity.type) {
    case 'line':
      return hitTestLine(entity, worldX, worldY, tolerance)
    case 'rect':
      return hitTestRect(entity, worldX, worldY)
    case 'arc':
      return hitTestArc(entity, worldX, worldY, tolerance)
    case 'text':
      return hitTestText(entity, worldX, worldY)
    case 'point':
      return hitTestPoint(entity, worldX, worldY, tolerance)
    default:
      return false
  }
}

/**
 * Hit test for line - checks distance from point to line segment
 */
const hitTestLine = (entity, worldX, worldY, tolerance) => {
  const { start, end } = entity
  
  // Calculate distance from point to line segment
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSq = dx * dx + dy * dy
  
  if (lengthSq === 0) {
    // Line is a point
    const dist = Math.sqrt((worldX - start.x) ** 2 + (worldY - start.y) ** 2)
    return dist <= tolerance
  }
  
  // Project point onto line
  let t = ((worldX - start.x) * dx + (worldY - start.y) * dy) / lengthSq
  t = Math.max(0, Math.min(1, t))
  
  const projX = start.x + t * dx
  const projY = start.y + t * dy
  
  const dist = Math.sqrt((worldX - projX) ** 2 + (worldY - projY) ** 2)
  return dist <= tolerance
}

/**
 * Hit test for rectangle
 */
const hitTestRect = (entity, worldX, worldY) => {
  return worldX >= entity.x && 
         worldX <= entity.x + entity.width &&
         worldY >= entity.y && 
         worldY <= entity.y + entity.height
}

/**
 * Hit test for arc - checks distance from point to arc
 */
const hitTestArc = (entity, worldX, worldY, tolerance) => {
  const dx = worldX - entity.center.x
  const dy = worldY - entity.center.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  // Check if near the arc radius
  if (Math.abs(dist - entity.radius) > tolerance) return false
  
  // Check if angle is within arc range
  let angle = Math.atan2(dy, dx) * 180 / Math.PI
  if (angle < 0) angle += 360
  
  const start = entity.startAngle
  const end = entity.endAngle
  
  if (start <= end) {
    return angle >= start && angle <= end
  } else {
    return angle >= start || angle <= end
  }
}

/**
 * Hit test for text
 */
const hitTestText = (entity, worldX, worldY) => {
  const bbox = getEntityBoundingBox(entity)
  return bbox && 
         worldX >= bbox.minX && worldX <= bbox.maxX &&
         worldY >= bbox.minY && worldY <= bbox.maxY
}

/**
 * Hit test for point
 */
const hitTestPoint = (entity, worldX, worldY, tolerance) => {
  const dx = worldX - entity.position.x
  const dy = worldY - entity.position.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return dist <= (entity.radius || 0.3) + tolerance
}

/**
 * Find entity at screen position
 */
const findEntityAtPosition = (screenX, screenY) => {
  const world = screenToWorld(screenX, screenY)
  const entities = mapData.value?.entities || []
  
  // Search in reverse order (top to bottom in render order)
  for (let i = entities.length - 1; i >= 0; i--) {
    const entity = entities[i]
    const layer = mapData.value?.layers?.find(l => l.id === entity.layerId)
    
    // Skip hidden layers
    if (layer && !layer.visible) continue
    
    if (hitTestEntity(entity, world.x, world.y)) {
      return entity
    }
  }
  
  return null
}

// ============================================================================
// MOUSE EVENT HANDLERS
// ============================================================================

/**
 * Handle mouse down event
 */
const handleMouseDown = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  
  if (event.button === 0) { // Left click
    if (editMode.value) {
      // Try to select an entity
      const entity = findEntityAtPosition(screenX, screenY)
      
      if (entity) {
        selectEntity(entity)
        isDragging.value = true
        dragStart.value = screenToWorld(screenX, screenY)
        entityDragStart.value = getEntityPosition(entity)
      } else {
        // Deselect if clicking empty space
        selectedEntity.value = null
        emit('entitySelected', null)
      }
    } else {
      // Pan mode
      isPanning.value = true
      dragStart.value = { x: screenX, y: screenY }
    }
  } else if (event.button === 2) { // Right click - always pan
    isPanning.value = true
    dragStart.value = { x: screenX, y: screenY }
  }
}

/**
 * Handle mouse move event
 */
const handleMouseMove = (event) => {
  const rect = canvas.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  
  // Update mouse coordinates
  mouseScreenCoords.value = { x: screenX, y: screenY }
  mouseWorldCoords.value = screenToWorld(screenX, screenY)
  
  if (isPanning.value) {
    // Pan the view
    const dx = screenX - dragStart.value.x
    const dy = screenY - dragStart.value.y
    
    const scale = baseScale.value * zoom.value
    panOffset.value = {
      x: panOffset.value.x - dx / scale,
      y: panOffset.value.y + dy / scale // Flip Y
    }
    
    dragStart.value = { x: screenX, y: screenY }
    render()
  } else if (isDragging.value && selectedEntity.value) {
    // Drag the selected entity
    const currentWorld = screenToWorld(screenX, screenY)
    const dx = currentWorld.x - dragStart.value.x
    const dy = currentWorld.y - dragStart.value.y
    
    moveEntity(selectedEntity.value, entityDragStart.value, dx, dy)
    hasUnsavedChanges.value = true
    render()
    
    // Emit change for real-time sync with 3D viewer
    emitMapChanged()
  } else if (editMode.value) {
    // Hover detection
    const entity = findEntityAtPosition(screenX, screenY)
    if (entity !== hoveredEntity.value) {
      hoveredEntity.value = entity
      render()
    }
  }
}

/**
 * Handle mouse up event
 */
const handleMouseUp = () => {
  isDragging.value = false
  isPanning.value = false
}

/**
 * Handle mouse leave event
 */
const handleMouseLeave = () => {
  isDragging.value = false
  isPanning.value = false
  hoveredEntity.value = null
  render()
}

/**
 * Handle mouse wheel event (zoom)
 */
const handleWheel = (event) => {
  event.preventDefault()
  
  const rect = canvas.value.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top
  
  // Get world position before zoom
  const worldBefore = screenToWorld(screenX, screenY)
  
  // Adjust zoom
  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.1, Math.min(10, zoom.value * zoomFactor))
  zoom.value = newZoom
  
  // Get world position after zoom
  const worldAfter = screenToWorld(screenX, screenY)
  
  // Adjust pan to keep the point under cursor fixed
  panOffset.value = {
    x: panOffset.value.x + (worldBefore.x - worldAfter.x),
    y: panOffset.value.y + (worldBefore.y - worldAfter.y)
  }
  
  render()
}

// ============================================================================
// ENTITY MANIPULATION
// ============================================================================

/**
 * Get the position of an entity (for drag start)
 */
const getEntityPosition = (entity) => {
  switch (entity.type) {
    case 'line':
      return { x: entity.start.x, y: entity.start.y }
    case 'rect':
      return { x: entity.x, y: entity.y }
    case 'arc':
      return { x: entity.center.x, y: entity.center.y }
    case 'text':
    case 'point':
      return { x: entity.position.x, y: entity.position.y }
    default:
      return { x: 0, y: 0 }
  }
}

/**
 * Move an entity by delta from its original position
 */
const moveEntity = (entity, originalPos, dx, dy) => {
  switch (entity.type) {
    case 'line':
      const lineDx = entity.end.x - entity.start.x
      const lineDy = entity.end.y - entity.start.y
      entity.start.x = originalPos.x + dx
      entity.start.y = originalPos.y + dy
      entity.end.x = entity.start.x + lineDx
      entity.end.y = entity.start.y + lineDy
      break
    case 'rect':
      entity.x = originalPos.x + dx
      entity.y = originalPos.y + dy
      break
    case 'arc':
      entity.center.x = originalPos.x + dx
      entity.center.y = originalPos.y + dy
      break
    case 'text':
    case 'point':
      entity.position.x = originalPos.x + dx
      entity.position.y = originalPos.y + dy
      break
  }
}

/**
 * Select an entity
 */
const selectEntity = (entity) => {
  selectedEntity.value = entity
  emit('entitySelected', entity)
}

// ============================================================================
// VIEW CONTROLS
// ============================================================================

/**
 * Zoom in
 */
const zoomIn = () => {
  zoom.value = Math.min(10, zoom.value * 1.2)
  render()
}

/**
 * Zoom out
 */
const zoomOut = () => {
  zoom.value = Math.max(0.1, zoom.value / 1.2)
  render()
}

/**
 * Reset view to default
 */
const resetView = () => {
  zoom.value = 1
  centerMap()
  render()
}

/**
 * Toggle edit mode
 */
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (!editMode.value) {
    selectedEntity.value = null
    hoveredEntity.value = null
  }
  render()
}

/**
 * Toggle layer visibility
 */
const toggleLayer = (layerId) => {
  const layer = mapData.value?.layers?.find(l => l.id === layerId)
  if (layer) {
    layer.visible = !layer.visible
    render()
  }
}

// ============================================================================
// SAVE FUNCTIONALITY
// ============================================================================

/**
 * Emit map changed event for real-time sync with 3D viewer
 * Debounced to avoid too many updates during drag operations
 */
let emitTimeout = null
const emitMapChanged = () => {
  if (!mapData.value) return
  
  // Debounce: wait 100ms before emitting to avoid flooding during drag
  if (emitTimeout) clearTimeout(emitTimeout)
  emitTimeout = setTimeout(() => {
    emit('mapChanged', JSON.parse(JSON.stringify(mapData.value)))
  }, 100)
}

/**
 * Save changes back to JSON
 */
const saveChanges = () => {
  if (!mapData.value) return
  
  // Update metadata
  mapData.value.metadata.updatedAt = new Date().toISOString()
  
  // Create a clean copy for saving
  const saveData = JSON.parse(JSON.stringify(mapData.value))
  
  // Emit save event with the data
  emit('save', saveData)
  
  // Update original data reference
  originalMapData.value = JSON.parse(JSON.stringify(mapData.value))
  hasUnsavedChanges.value = false
  
  // Log for debugging
  console.log('[JsonMapEditor] Changes saved:', saveData)
  
  // Also save to localStorage for persistence
  try {
    localStorage.setItem('map2home_edited_map', JSON.stringify(saveData))
    console.log('[JsonMapEditor] Map saved to localStorage')
  } catch (e) {
    console.warn('[JsonMapEditor] Failed to save to localStorage:', e)
  }
}

/**
 * Export map data as JSON file download
 */
const exportMapJson = () => {
  if (!mapData.value) return
  
  const dataStr = JSON.stringify(mapData.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${mapData.value.metadata?.name || 'map'}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(async () => {
  console.log('[JsonMapEditor] Component mounted')
  editMode.value = props.initialEditMode
  
  // Wait for DOM to be fully ready
  await nextTick()
  
  // Load map data (has built-in retry for canvas initialization)
  loadMapData()
  
  // Handle window resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

/**
 * Handle window resize
 */
const handleResize = () => {
  initializeCanvas()
  calculateBaseScale()
  render()
}

// Watch for mapUrl changes
// Watch for mapUrl or mapData changes
watch(() => props.mapUrl, () => {
  if (props.mapUrl) loadMapData()
})

watch(() => props.mapData, () => {
  if (props.mapData) loadMapData()
}, { deep: true })

// ============================================================================
// EXPOSE FOR PARENT COMPONENT
// ============================================================================

defineExpose({
  saveChanges,
  exportMapJson,
  selectEntity,
  resetView,
  mapData
})
</script>

<style scoped>
.json-map-editor {
  width: 100%;
}

canvas {
  display: block;
}

/* Prevent text selection while dragging */
.json-map-editor * {
  user-select: none;
}
</style>
