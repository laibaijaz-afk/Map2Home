<template>
  <div class="dxf-viewer-container">
    <div class="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl p-8 border-2 border-indigo-100">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ mapTitle }}</h2>
          <p class="text-gray-600 text-sm mt-2 font-medium">{{ mapDescription }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          title="Back to form"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Close</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading DXF file...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-red-800 font-semibold mb-2">Failed to load DXF file</h3>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
        <div class="flex gap-4 justify-center">
          <button
            @click="loadDxf"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
          <a
            :href="dxfUrl"
            download
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download DXF File
          </a>
        </div>
        <p class="text-xs text-red-600 mt-4">Please check the browser console (F12) for detailed error information.</p>
      </div>

      <!-- DXF Viewer -->
      <div v-if="!error" class="space-y-4">
        <!-- Controls -->
        <div v-if="!loading" class="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 shadow-md border border-indigo-200">
          <div class="flex items-center gap-4">
            <button
              @click="zoomIn"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
              title="Zoom In"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              @click="zoomOut"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
              title="Zoom Out"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <button
              @click="resetZoom"
              class="p-2 bg-white hover:bg-indigo-100 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
              title="Reset Zoom"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <span class="text-sm font-semibold text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-sm">{{ Math.round(zoom * 100) }}%</span>
          </div>
          <div class="flex items-center gap-3">
            <!-- Color Legend -->
            <div class="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
              <span class="text-xs font-semibold text-gray-600 mr-1">Legend:</span>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded" style="background-color: #1e293b;"></div>
                <span class="text-xs text-gray-600">Walls</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded" style="background-color: #dc2626;"></div>
                <span class="text-xs text-gray-600">Doors</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded" style="background-color: #2563eb;"></div>
                <span class="text-xs text-gray-600">Windows</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 rounded" style="background-color: #7c3aed;"></div>
                <span class="text-xs text-gray-600">Labels</span>
              </div>
            </div>
            <a
              :href="dxfUrl"
              download
              class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download DXF
            </a>
          </div>
        </div>

        <!-- Canvas Container - Always render so ref is available -->
        <div class="bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 rounded-xl overflow-auto border-4 border-indigo-300 shadow-2xl" style="min-height: 600px; max-height: 900px;">
          <div
            ref="canvasContainer"
            class="w-full flex items-center justify-center relative p-8"
            style="min-height: 600px;"
          >
            <canvas
              ref="canvas"
              class="bg-white shadow-2xl rounded-lg border-2 border-gray-300"
              style="max-width: 100%; max-height: 100%; height: auto; display: block; object-fit: contain;"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/authStore'
import DxfParserModule from 'dxf-parser'

// Handle both default and named exports
let DxfParser
try {
  if (DxfParserModule.default) {
    DxfParser = DxfParserModule.default
  } else if (DxfParserModule.DxfParser) {
    DxfParser = DxfParserModule.DxfParser
  } else {
    DxfParser = DxfParserModule
  }
  console.log('DxfParser loaded:', DxfParser)
} catch (e) {
  console.error('Failed to load DxfParser:', e)
}

const authStore = useAuthStore()

const props = defineProps({
  dxfUrl: {
    type: String,
    required: true
  },
  mapTitle: {
    type: String,
    default: 'House Plan'
  },
  mapDescription: {
    type: String,
    default: 'Professional 2D house floor plan'
  }
})

const emit = defineEmits(['close', 'dxfParsed'])

const loading = ref(true)
const error = ref(null)
const canvas = ref(null)
const canvasContainer = ref(null)
const zoom = ref(1)

const loadDxf = async () => {
  loading.value = true
  error.value = null

  try {
    const token = authStore.token || localStorage.getItem('auth_token')
    const headers = {
      'Content-Type': 'text/plain'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(props.dxfUrl, {
      headers
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please login to view DXF files')
      }
      throw new Error(`Failed to fetch DXF file: ${response.statusText}`)
    }

    const dxfText = await response.text()
    console.log('DXF file loaded, length:', dxfText.length)
    console.log('DXF file preview (first 500 chars):', dxfText.substring(0, 500))
    
    try {
      if (!DxfParser) {
        throw new Error('DXF Parser not loaded. Please refresh the page.')
      }
      
      console.log('Creating DXF parser instance...')
      const parser = new DxfParser()
      console.log('Parser created:', parser)
      
      console.log('Attempting to parse DXF...')
      // Try parseSync first, fallback to parse if needed
      let dxf
      if (typeof parser.parseSync === 'function') {
        console.log('Using parseSync method')
        dxf = parser.parseSync(dxfText)
      } else if (typeof parser.parse === 'function') {
        console.log('Using parse method')
        dxf = parser.parse(dxfText)
      } else {
        console.error('Parser methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)))
        throw new Error('DXF parser does not have parseSync or parse method')
      }
      
      // Log detailed entity structure
      console.log('DXF parsed successfully:', {
        hasEntities: !!dxf.entities,
        entityCount: dxf.entities?.length || 0,
        entityTypes: dxf.entities?.slice(0, 20).map(e => e.type) || [],
        sampleEntity: dxf.entities?.[0] || null,
        dxfKeys: Object.keys(dxf || {})
      })
      
      // Log first few entities in detail to understand structure
      if (dxf.entities && dxf.entities.length > 0) {
        console.log('=== FIRST 5 ENTITIES DETAILED STRUCTURE ===')
        dxf.entities.slice(0, 5).forEach((entity, idx) => {
          console.log(`Entity ${idx}:`, {
            type: entity.type,
            typeString: String(entity.type),
            keys: Object.keys(entity),
            hasStart: !!entity.start,
            hasEnd: !!entity.end,
            hasVertices: !!entity.vertices,
            verticesLength: entity.vertices?.length,
            start: entity.start,
            end: entity.end,
            vertices: entity.vertices,
            fullEntity: JSON.parse(JSON.stringify(entity)) // Deep clone for logging
          })
        })
        console.log('=== END ENTITY STRUCTURE ===')
      }

      // Render DXF to canvas
      if (dxf && dxf.entities && dxf.entities.length > 0) {
        console.log('Starting render with', dxf.entities.length, 'entities...')
        // Wait for canvas to be ready, then render
        await nextTick()
        await renderDxf(dxf)
        console.log('Render completed')
        
        // Emit parsed DXF data so parent can use it for editing
        emit('dxfParsed', dxf)
      } else {
        console.warn('No entities found. DXF structure:', dxf)
        console.warn('Full DXF object keys:', Object.keys(dxf || {}))
        error.value = 'DXF file parsed but contains no entities. The file might be empty or in an unsupported format. Please check the browser console for details.'
      }
    } catch (parseError) {
      console.error('DXF parsing error:', parseError)
      console.error('Error stack:', parseError.stack)
      throw new Error(`Failed to parse DXF file: ${parseError.message}. The file might be corrupted or in an unsupported format.`)
    }
    
    loading.value = false
  } catch (err) {
    console.error('Error loading DXF:', err)
    error.value = err.message || 'Failed to load DXF file'
    loading.value = false
  }
}

const renderDxf = async (dxf) => {
  // Wait for DOM to update
  await nextTick()
  await nextTick() // Double nextTick to ensure Vue has updated
  
  // Try multiple times if canvas isn't ready - increase wait time
  let attempts = 0
  while (!canvas.value && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 150))
    attempts++
    console.log(`Waiting for canvas... attempt ${attempts}`)
  }
  
  if (!canvas.value) {
    console.error('Canvas element not found after waiting', {
      canvasRef: canvas.value,
      containerRef: canvasContainer.value,
      attempts
    })
    // Try to find canvas in DOM directly
    const canvasElement = document.querySelector('canvas')
    if (canvasElement) {
      console.log('Found canvas in DOM directly, using it')
      canvas.value = canvasElement
    } else {
      error.value = 'Canvas element not available. Please refresh the page.'
      return
    }
  }
  
  console.log('Canvas element found, proceeding with render', {
    canvas: canvas.value,
    width: canvas.value?.width,
    height: canvas.value?.height
  })

  const ctx = canvas.value.getContext('2d')
  const container = canvasContainer.value

  if (!dxf || !dxf.entities || dxf.entities.length === 0) {
    console.warn('No entities found in DXF file')
    error.value = 'No drawing entities found in DXF file'
    return
  }

  // Calculate bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let hasValidBounds = false

  // Process entities to find bounds
  console.log('Processing entities for bounds calculation...')
  let processedCount = 0
  
  dxf.entities.forEach((entity, index) => {
    try {
      // Log first few entities for debugging
      if (index < 5) {
        console.log(`Entity ${index}:`, 'type:', entity.type, 'full entity:', entity)
      }
      
      // Handle entity type - it might be "LINE Object" or just "LINE"
      const entityType = typeof entity.type === 'string' ? entity.type.split(' ')[0] : (entity.type?.toString() || '').split(' ')[0]
      
      // Handle LINE entities - check both start/end and vertices formats
      if (entityType === 'LINE') {
        let x1, y1, x2, y2
        
        // Try start/end format first
        if (entity.start && entity.end) {
          x1 = parseFloat(entity.start.x)
          y1 = parseFloat(entity.start.y)
          x2 = parseFloat(entity.end.x)
          y2 = parseFloat(entity.end.y)
        }
        // Try vertices format (array of points)
        else if (entity.vertices && Array.isArray(entity.vertices) && entity.vertices.length >= 2) {
          x1 = parseFloat(entity.vertices[0].x)
          y1 = parseFloat(entity.vertices[0].y)
          x2 = parseFloat(entity.vertices[1].x)
          y2 = parseFloat(entity.vertices[1].y)
        }
        // Try single vertex array format
        else if (entity.vertex && Array.isArray(entity.vertex) && entity.vertex.length >= 2) {
          x1 = parseFloat(entity.vertex[0].x)
          y1 = parseFloat(entity.vertex[0].y)
          x2 = parseFloat(entity.vertex[1].x)
          y2 = parseFloat(entity.vertex[1].y)
        }
        
        if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
          minX = Math.min(minX, x1, x2)
          minY = Math.min(minY, y1, y2)
          maxX = Math.max(maxX, x1, x2)
          maxY = Math.max(maxY, y1, y2)
          hasValidBounds = true
          processedCount++
        } else if (index < 5) {
          console.warn('LINE entity coordinates invalid:', entity)
        }
      } else if (entityType === 'CIRCLE' && entity.center && entity.radius !== undefined) {
        const cx = parseFloat(entity.center.x)
        const cy = parseFloat(entity.center.y)
        const r = parseFloat(entity.radius)
        if (!isNaN(cx) && !isNaN(cy) && !isNaN(r) && r > 0) {
          minX = Math.min(minX, cx - r)
          minY = Math.min(minY, cy - r)
          maxX = Math.max(maxX, cx + r)
          maxY = Math.max(maxY, cy + r)
          hasValidBounds = true
          processedCount++
        }
        } else if (entityType === 'ARC' && entity.center && entity.radius !== undefined) {
        const cx = parseFloat(entity.center.x)
        const cy = parseFloat(entity.center.y)
        const r = parseFloat(entity.radius)
        if (!isNaN(cx) && !isNaN(cy) && !isNaN(r) && r > 0) {
          minX = Math.min(minX, cx - r)
          minY = Math.min(minY, cy - r)
          maxX = Math.max(maxX, cx + r)
          maxY = Math.max(maxY, cy + r)
          hasValidBounds = true
          processedCount++
        }
        } else if ((entityType === 'POLYLINE' || entityType === 'LWPOLYLINE') && entity.vertices) {
        const vertices = entity.vertices || []
        let vertexProcessed = false
        vertices.forEach(vertex => {
          const vx = parseFloat(vertex.x)
          const vy = parseFloat(vertex.y)
          if (!isNaN(vx) && !isNaN(vy)) {
            minX = Math.min(minX, vx)
            minY = Math.min(minY, vy)
            maxX = Math.max(maxX, vx)
            maxY = Math.max(maxY, vy)
            hasValidBounds = true
            vertexProcessed = true
          }
        })
        if (vertexProcessed) processedCount++
      } else if (entityType === 'TEXT' || entityType === 'MTEXT') {
        // Include text entities in bounds calculation
        let x = 0, y = 0
        if (entityType === 'TEXT') {
          x = parseFloat(entity.position?.x || entity.startPoint?.x || entity.point?.x || 0)
          y = parseFloat(entity.position?.y || entity.startPoint?.y || entity.point?.y || 0)
        } else if (entityType === 'MTEXT') {
          x = parseFloat(entity.position?.x || entity.insertionPoint?.x || entity.point?.x || 0)
          y = parseFloat(entity.position?.y || entity.insertionPoint?.y || entity.point?.y || 0)
        }
        if (!isNaN(x) && !isNaN(y)) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
          hasValidBounds = true
          processedCount++
        }
      } else {
        // Log unhandled entity types
        if (index < 10) {
          console.log(`Unhandled entity type: ${entityType} (original: ${entity.type})`, entity)
        }
      }
    } catch (e) {
      console.warn('Error processing entity:', entity.type, e, entity)
    }
  })
  
  console.log(`Processed ${processedCount} entities for bounds calculation`)

  if (!hasValidBounds || !isFinite(minX) || !isFinite(maxX)) {
    console.error('Invalid bounds calculated:', { minX, minY, maxX, maxY })
    error.value = 'Could not determine drawing bounds. The DXF file may be empty or in an unsupported format.'
    return
  }

  // Calculate drawing bounds
  const drawingWidth = maxX - minX
  const drawingHeight = maxY - minY
  
  console.log('Drawing bounds:', { minX, minY, maxX, maxY, drawingWidth, drawingHeight })

  // Set canvas size - use a reasonable fixed size
  const canvasWidth = 2000
  const canvasHeight = 1400
  const padding = 80
  
  // Calculate scale to fit drawing in canvas while maintaining aspect ratio
  const scaleX = (canvasWidth - padding * 2) / drawingWidth
  const scaleY = (canvasHeight - padding * 2) / drawingHeight
  const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
  
  console.log('Canvas setup:', {
    canvasWidth,
    canvasHeight,
    drawingWidth,
    drawingHeight,
    scaleX,
    scaleY,
    finalScale: scale
  })

  // Set canvas size - use device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1
  canvas.value.width = canvasWidth * dpr
  canvas.value.height = canvasHeight * dpr
  canvas.value.style.width = canvasWidth + 'px'
  canvas.value.style.height = canvasHeight + 'px'
  
  // Scale context for high DPI displays
  ctx.scale(dpr, dpr)

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // Fill with white background first
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  // Draw subtle grid pattern on top for better visual appeal
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  const gridSize = 50
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight)
    ctx.stroke()
  }
  for (let y = 0; y <= canvasHeight; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth, y)
    ctx.stroke()
  }

  // Transform coordinates to center and scale the drawing
  ctx.save()
  
  // Move to center of canvas
  ctx.translate(canvasWidth / 2, canvasHeight / 2)
  
  // Scale the drawing
  ctx.scale(scale, -scale) // Negative Y to flip (DXF uses bottom-left origin)
  
  // Move drawing to center (offset by negative center of drawing)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  ctx.translate(-centerX, -centerY)
  
  console.log('Applied coordinate transformations:', {
    scale,
    centerX,
    centerY,
    canvasCenter: { x: canvasWidth / 2, y: canvasHeight / 2 },
    drawingBounds: { minX, minY, maxX, maxY },
    drawingDimensions: { width: drawingWidth, height: drawingHeight }
  })

  // Color mapping function based on entity type and layer
  const getEntityColor = (entityType, layer, entity) => {
    // First check if entity has a direct color property
    if (entity && entity.color !== undefined && entity.color !== null) {
      // DXF color index (0-256), convert to hex if needed
      const colorIndex = parseInt(entity.color)
      if (colorIndex > 0 && colorIndex <= 256) {
        // Use DXF color if available (basic color mapping)
        const dxfColors = {
          1: '#FF0000', 2: '#FFFF00', 3: '#00FF00', 4: '#00FFFF',
          5: '#0000FF', 6: '#FF00FF', 7: '#FFFFFF', 8: '#808080',
          9: '#C0C0C0', 10: '#FF0000', 11: '#FF7F00', 12: '#FFFF00',
          13: '#7FFF00', 14: '#00FF00', 15: '#00FF7F', 16: '#00FFFF'
        }
        if (dxfColors[colorIndex]) {
          return dxfColors[colorIndex]
        }
      }
    }
    
    const layerName = (layer || '').toLowerCase()
    const type = (entityType || '').toUpperCase()
    
    // Check for specific layer names that might indicate room types
    if (layerName.includes('wall') || layerName.includes('structure') || layerName.includes('outline')) {
      return '#0f172a' // Very dark slate for walls (more visible)
    }
    if (layerName.includes('door') || layerName.includes('entry')) {
      return '#ef4444' // Bright red for doors
    }
    if (layerName.includes('window') || layerName.includes('opening')) {
      return '#3b82f6' // Bright blue for windows
    }
    if (layerName.includes('dimension') || layerName.includes('dim')) {
      return '#10b981' // Bright green for dimensions
    }
    if (layerName.includes('text') || layerName.includes('label') || layerName.includes('room')) {
      return '#8b5cf6' // Bright purple for text
    }
    if (layerName.includes('furniture') || layerName.includes('fixture') || layerName.includes('equipment')) {
      return '#f97316' // Bright orange for furniture
    }
    if (layerName.includes('bathroom') || layerName.includes('toilet')) {
      return '#06b6d4' // Cyan for bathrooms
    }
    if (layerName.includes('kitchen')) {
      return '#f59e0b' // Amber for kitchen
    }
    if (layerName.includes('bedroom')) {
      return '#ec4899' // Pink for bedrooms
    }
    if (layerName.includes('living') || layerName.includes('drawing')) {
      return '#6366f1' // Indigo for living rooms
    }
    
    // Fallback to entity type-based colors
    switch(type) {
      case 'LINE':
      case 'LWPOLYLINE':
      case 'POLYLINE':
        return '#0f172a' // Very dark slate for lines (walls)
      case 'CIRCLE':
      case 'ARC':
        return '#ef4444' // Bright red for circles/arcs (doors/windows)
      case 'TEXT':
      case 'MTEXT':
        return '#8b5cf6' // Bright purple for text
      default:
        return '#1e40af' // Default indigo
    }
  }
  
  // Get line width based on entity type
  const getEntityLineWidth = (entityType, layer) => {
    const layerName = (layer || '').toLowerCase()
    if (layerName.includes('wall') || layerName.includes('structure')) {
      return 4 // Thicker for walls
    }
    if (layerName.includes('dimension')) {
      return 1 // Thinner for dimensions
    }
    return 3 // Default
  }

  // Draw entities with enhanced styling and color differentiation
  let drawnCount = 0
  const textEntities = [] // Store text entities to render after geometry
  
  if (dxf.entities) {
    // First pass: draw geometry entities
    dxf.entities.forEach((entity, index) => {
      try {
        // Handle entity type - it might be "LINE Object" or just "LINE"
        const entityType = typeof entity.type === 'string' ? entity.type.split(' ')[0] : (entity.type?.toString() || '').split(' ')[0]
        
        // Skip text entities for now - render them after geometry
        if (entityType === 'TEXT' || entityType === 'MTEXT') {
          textEntities.push(entity)
          return
        }
        
        ctx.beginPath()
        
        // Get color and line width based on entity type and layer
        const layer = entity.layer || entity.layerName || ''
        ctx.strokeStyle = getEntityColor(entityType, layer, entity)
        ctx.lineWidth = getEntityLineWidth(entityType, layer)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.fillStyle = getEntityColor(entityType, layer, entity)

        // Handle LINE entities - check both start/end and vertices formats
        if (entityType === 'LINE') {
          let x1, y1, x2, y2
          
          // Try start/end format first
          if (entity.start && entity.end) {
            x1 = parseFloat(entity.start.x)
            y1 = parseFloat(entity.start.y)
            x2 = parseFloat(entity.end.x)
            y2 = parseFloat(entity.end.y)
          }
          // Try vertices format (array of points)
          else if (entity.vertices && Array.isArray(entity.vertices) && entity.vertices.length >= 2) {
            x1 = parseFloat(entity.vertices[0].x)
            y1 = parseFloat(entity.vertices[0].y)
            x2 = parseFloat(entity.vertices[1].x)
            y2 = parseFloat(entity.vertices[1].y)
          }
          // Try single vertex array format
          else if (entity.vertex && Array.isArray(entity.vertex) && entity.vertex.length >= 2) {
            x1 = parseFloat(entity.vertex[0].x)
            y1 = parseFloat(entity.vertex[0].y)
            x2 = parseFloat(entity.vertex[1].x)
            y2 = parseFloat(entity.vertex[1].y)
          }
          
          if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()
            drawnCount++
          } else if (index < 5) {
            console.warn('LINE entity coordinates invalid:', entity)
          }
        } else if (entityType === 'CIRCLE' && entity.center && entity.radius !== undefined) {
          const cx = parseFloat(entity.center.x)
          const cy = parseFloat(entity.center.y)
          const r = parseFloat(entity.radius)
          if (!isNaN(cx) && !isNaN(cy) && !isNaN(r) && r > 0) {
            ctx.arc(cx, cy, r, 0, 2 * Math.PI)
            ctx.stroke()
            drawnCount++
          }
        } else if (entityType === 'ARC' && entity.center && entity.radius !== undefined) {
          const cx = parseFloat(entity.center.x)
          const cy = parseFloat(entity.center.y)
          const r = parseFloat(entity.radius)
          const startAngle = entity.startAngle ? (parseFloat(entity.startAngle) * Math.PI) / 180 : 0
          const endAngle = entity.endAngle ? (parseFloat(entity.endAngle) * Math.PI) / 180 : 2 * Math.PI
          if (!isNaN(cx) && !isNaN(cy) && !isNaN(r) && r > 0) {
            ctx.arc(cx, cy, r, startAngle, endAngle)
            ctx.stroke()
            drawnCount++
          }
        } else if ((entityType === 'POLYLINE' || entityType === 'LWPOLYLINE') && entity.vertices) {
          const vertices = entity.vertices || []
          if (vertices.length > 0) {
            const firstX = parseFloat(vertices[0].x)
            const firstY = parseFloat(vertices[0].y)
            if (!isNaN(firstX) && !isNaN(firstY)) {
              ctx.moveTo(firstX, firstY)
              for (let i = 1; i < vertices.length; i++) {
                const vx = parseFloat(vertices[i].x)
                const vy = parseFloat(vertices[i].y)
                if (!isNaN(vx) && !isNaN(vy)) {
                  ctx.lineTo(vx, vy)
                }
              }
              if (entity.closed) {
                ctx.closePath()
              }
              ctx.stroke()
              drawnCount++
            }
          }
        }
      } catch (e) {
        console.warn(`Error drawing entity ${index} (${entityType || entity.type}):`, e, entity)
      }
    })
    
    // Second pass: render text entities on top of geometry
    console.log(`Rendering ${textEntities.length} text entities`)
    textEntities.forEach((entity, index) => {
      try {
        const entityType = typeof entity.type === 'string' ? entity.type.split(' ')[0] : (entity.type?.toString() || '').split(' ')[0]
        const layer = entity.layer || entity.layerName || ''
        
        let text = ''
        let x = 0, y = 0
        let height = 12 // Default text height
        
        if (entityType === 'TEXT') {
          // Try multiple possible text property names
          text = entity.text || entity.string || entity.value || entity.textString || ''
          // Try multiple possible position property names
          x = parseFloat(
            entity.position?.x || 
            entity.startPoint?.x || 
            entity.point?.x || 
            entity.firstAlignmentPoint?.x ||
            entity.secondAlignmentPoint?.x ||
            0
          )
          y = parseFloat(
            entity.position?.y || 
            entity.startPoint?.y || 
            entity.point?.y || 
            entity.firstAlignmentPoint?.y ||
            entity.secondAlignmentPoint?.y ||
            0
          )
          height = parseFloat(entity.height || entity.textHeight || entity.charHeight || 12)
          
          if (index < 3) {
            console.log('TEXT entity:', { text, x, y, height, entity })
          }
        } else if (entityType === 'MTEXT') {
          // Try multiple possible text property names
          text = entity.text || entity.string || entity.value || entity.textString || ''
          // MTEXT can have multiple text lines
          if (Array.isArray(text)) {
            text = text.join(' ')
          }
          // Try multiple possible position property names
          x = parseFloat(
            entity.position?.x || 
            entity.insertionPoint?.x || 
            entity.point?.x ||
            entity.firstAlignmentPoint?.x ||
            0
          )
          y = parseFloat(
            entity.position?.y || 
            entity.insertionPoint?.y || 
            entity.point?.y ||
            entity.firstAlignmentPoint?.y ||
            0
          )
          height = parseFloat(entity.height || entity.charHeight || entity.textHeight || 12)
          
          if (index < 3) {
            console.log('MTEXT entity:', { text, x, y, height, entity })
          }
        }
        
        if (text && !isNaN(x) && !isNaN(y) && text.trim().length > 0) {
          // Set text style with better visibility
          ctx.save()
          
          // Calculate text size based on scale - ensure it's visible
          // Use absolute scale value (remove negative sign for size calculation)
          const absScale = Math.abs(scale)
          const textSize = Math.max(height * absScale * 1.2, 28) // Minimum 28px, scaled appropriately
          
          ctx.font = `bold ${textSize}px Arial, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          
          // Measure text for background
          const metrics = ctx.measureText(text)
          const textWidth = metrics.width
          const textHeight = textSize
          const padding = 6
          
          // Draw text background for better readability
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
          ctx.strokeStyle = '#1e293b'
          ctx.lineWidth = 2
          
          // Draw rounded rectangle background (using manual path)
          const bgX = x - textWidth/2 - padding
          const bgY = y - textHeight/2 - padding
          const bgW = textWidth + padding*2
          const bgH = textHeight + padding*2
          const radius = 4
          
          ctx.beginPath()
          ctx.moveTo(bgX + radius, bgY)
          ctx.lineTo(bgX + bgW - radius, bgY)
          ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + radius)
          ctx.lineTo(bgX + bgW, bgY + bgH - radius)
          ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - radius, bgY + bgH)
          ctx.lineTo(bgX + radius, bgY + bgH)
          ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - radius)
          ctx.lineTo(bgX, bgY + radius)
          ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY)
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          
          // Draw text with dark color
          ctx.fillStyle = '#1e293b'
          ctx.fillText(text, x, y)
          
          ctx.restore()
          drawnCount++
        }
      } catch (e) {
        console.warn(`Error drawing text entity ${index}:`, e, entity)
      }
    })
  }

  console.log(`Drew ${drawnCount} entities (including ${textEntities.length} text entities)`)
  ctx.restore()
  
  // Verify canvas is visible
  console.log('Canvas after render:', {
    width: canvas.value.width,
    height: canvas.value.height,
    styleWidth: canvas.value.style.width,
    styleHeight: canvas.value.style.height,
    offsetWidth: canvas.value.offsetWidth,
    offsetHeight: canvas.value.offsetHeight,
    visible: canvas.value.offsetWidth > 0 && canvas.value.offsetHeight > 0,
    bounds: { minX, minY, maxX, maxY },
    drawingDimensions: { width: drawingWidth, height: drawingHeight },
    canvasDimensions: { width: canvasWidth, height: canvasHeight },
    scale
  })
  
  // Reset zoom and apply initial transform
  resetZoom()
  
  // If nothing was drawn, show error
  if (drawnCount === 0) {
    error.value = 'No drawable entities found in DXF file'
  } else if (drawnCount > 0 && canvas.value.offsetWidth === 0) {
    console.warn('Canvas drawn but not visible - may be size issue')
    // Force canvas to be visible
    canvas.value.style.display = 'block'
    canvas.value.style.visibility = 'visible'
  } else if (drawnCount > 0) {
    console.log('✅ Rendering complete! Check canvas for drawing.')
  }
}

const zoomIn = () => {
  zoom.value = Math.min(zoom.value + 0.1, 3)
  if (canvas.value) {
    canvas.value.style.transform = `scale(${zoom.value})`
    canvas.value.style.transformOrigin = 'center'
  }
}

const zoomOut = () => {
  zoom.value = Math.max(zoom.value - 0.1, 0.5)
  if (canvas.value) {
    canvas.value.style.transform = `scale(${zoom.value})`
    canvas.value.style.transformOrigin = 'center'
  }
}

const resetZoom = () => {
  zoom.value = 1
  if (canvas.value) {
    canvas.value.style.transform = 'scale(1)'
    canvas.value.style.transformOrigin = 'center'
  }
}

onMounted(async () => {
  // Wait for DOM to be ready
  await nextTick()
  
  // Wait a bit more for canvas to be rendered
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Load the DXF file
  loadDxf()
})

watch(() => props.dxfUrl, () => {
  loadDxf()
})
</script>

<style scoped>
.dxf-viewer-container {
  width: 100%;
}

canvas {
  display: block;
  max-width: 100%;
  height: auto;
  transition: transform 0.3s ease;
}

canvas:hover {
  cursor: grab;
}

canvas:active {
  cursor: grabbing;
}

.dxf-viewer-container {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

