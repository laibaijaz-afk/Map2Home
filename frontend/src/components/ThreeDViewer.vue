<template>
  <div class="three-d-viewer h-full">
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
            {{ mapTitle || '3D Floor Plan View' }}
          </h2>
          <p v-if="!compactMode" class="text-gray-600 text-sm mt-2 font-medium">
            {{ isWalkMode ? 'Walk Mode: WASD to move, Mouse to look, ESC to exit' : 'Orbit Mode: Drag to rotate, scroll to zoom' }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Mode Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="setMode('orbit')"
              :class="['px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1', !isWalkMode ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800']"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
              </svg>
              Orbit
            </button>
            <button
              @click="setMode('walk')"
              :class="['px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1', isWalkMode ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800']"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Walk
            </button>
          </div>

          <!-- View Presets -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="setView('top')"
              :class="['px-3 py-1.5 rounded text-sm font-medium transition-all', currentView === 'top' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800']"
            >
              Top
            </button>
            <button
              @click="setView('front')"
              :class="['px-3 py-1.5 rounded text-sm font-medium transition-all', currentView === 'front' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800']"
            >
              Front
            </button>
            <button
              @click="setView('perspective')"
              :class="['px-3 py-1.5 rounded text-sm font-medium transition-all', currentView === 'perspective' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-800']"
            >
              3D
            </button>
          </div>
          
          <!-- Reset View -->
          <button
            @click="resetView"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>

          <!-- Full Screen -->
          <button
            @click="toggleFullscreen"
            class="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg v-if="!isFullscreen" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4H4m0 0l5 5M9 15v5H4m0 0l5-5m6-6V4h5m0 0l-5 5m5 6v5h-5m0 0l5-5" />
            </svg>
            {{ isFullscreen ? 'Exit' : 'Full Screen' }}
          </button>
          
          <!-- Close Button -->
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-red-800 font-semibold mb-2">Failed to create 3D view</h3>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
      </div>

      <!-- 3D Viewer -->
      <div v-else :class="['flex flex-col', compactMode || isFullscreen ? 'flex-1 gap-2' : 'space-y-4']">
        <!-- Controls Panel - Compact for split view -->
        <div v-show="!loading" :class="[
          'flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-md border border-indigo-200',
          compactMode ? 'p-2 gap-2' : 'p-4 rounded-xl'
        ]">
          <div :class="['flex items-center flex-wrap', compactMode ? 'gap-2' : 'gap-4']">
            <!-- Show Floor Toggle -->
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" v-model="showFloor" @change="toggleFloor" :class="['rounded border-gray-300 text-indigo-600', compactMode ? 'w-3 h-3' : 'w-4 h-4']" />
              <span :class="['font-medium text-gray-700', compactMode ? 'text-xs' : 'text-sm']">Floor</span>
            </label>
            
            <!-- Show Grid Toggle -->
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" v-model="showGrid" @change="toggleGrid" :class="['rounded border-gray-300 text-indigo-600', compactMode ? 'w-3 h-3' : 'w-4 h-4']" />
              <span :class="['font-medium text-gray-700', compactMode ? 'text-xs' : 'text-sm']">Grid</span>
            </label>

            <!-- Floor View Selector (multi-floor only) -->
            <div v-if="floorCountRef > 1" class="flex items-center gap-1 bg-white/70 rounded-lg p-1 border border-indigo-200">
              <span v-if="!compactMode" class="text-xs font-semibold text-indigo-700 px-1">Show:</span>
              <button
                @click="setVisibleFloor('all')"
                :class="['px-2 py-1 rounded font-medium transition-all', compactMode ? 'text-[10px]' : 'text-xs', visibleFloor === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-indigo-100']"
                title="Show all floors stacked"
              >
                All
              </button>
              <button
                v-for="(label, idx) in floorLabels"
                :key="'fv-' + idx"
                @click="setVisibleFloor(idx)"
                :class="['px-2 py-1 rounded font-medium transition-all', compactMode ? 'text-[10px]' : 'text-xs', visibleFloor === idx ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-indigo-100']"
                :title="'Show ' + label + ' only'"
              >
                {{ label }}
              </button>
            </div>

            <!-- Wall Height - Only in full mode -->
            <div v-if="!compactMode" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">Wall Height:</span>
              <input 
                type="range" 
                min="30" 
                max="200" 
                v-model="wallHeight"
                @input="updateWallHeight"
                class="w-20 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
              <span class="text-sm text-gray-600 w-10">{{ wallHeight }}</span>
            </div>

            <!-- Show Ceiling Toggle - Only in full mode -->
            <label v-if="!compactMode" class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="showCeiling" @change="toggleCeiling" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm font-medium text-gray-700">Ceiling</span>
            </label>

            <!-- Furniture toggle removed: 3D only renders walls, doors, windows -->
          </div>
          
          <div v-if="!compactMode" class="text-sm text-gray-600 hidden md:block">
            <span v-if="isWalkMode" class="font-medium text-indigo-600">
              Click canvas to enter • WASD move • Mouse look
            </span>
            <span v-else class="font-medium">
              Drag rotate • Scroll zoom • Right-drag pan
            </span>
          </div>
        </div>

        <!-- 3D Canvas Container -->
        <div 
          ref="containerRef"
          :class="[
            'overflow-hidden shadow-2xl relative cursor-pointer',
            compactMode ? 'flex-1 border-2 border-indigo-200 rounded-xl' : 'border-4 border-indigo-300 rounded-xl',
            isFullscreen ? 'fullscreen-canvas' : ''
          ]"
          :style="isFullscreen ? '' : (compactMode ? 'min-height: 400px;' : 'height: 650px;')"
          @click="onCanvasClick"
        >
          <canvas ref="canvasRef" class="w-full h-full"></canvas>
          
          <!-- Loading Overlay -->
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-slate-900/90">
            <div class="text-center">
              <svg class="animate-spin h-16 w-16 text-indigo-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-white text-lg font-medium">Building 3D model...</p>
              <p class="text-gray-400 text-sm mt-2">Creating immersive walkthrough experience</p>
            </div>
          </div>

          <!-- Walk Mode Instructions -->
          <div v-if="isWalkMode && !isPointerLocked && !loading" class="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
            <div class="text-center text-white">
              <svg class="w-16 h-16 mx-auto mb-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p class="text-xl font-bold mb-2">Click to Enter Walk Mode</p>
              <p class="text-gray-300">Use WASD to move around • Mouse to look • ESC to exit</p>
            </div>
          </div>

          <!-- Crosshair for Walk Mode -->
          <div v-if="isWalkMode && isPointerLocked" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-6 h-6 border-2 border-white/50 rounded-full"></div>
            <div class="absolute w-1 h-1 bg-white rounded-full"></div>
          </div>
          
          <!-- Stats Overlay -->
          <div v-show="!loading" class="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 text-sm text-white">
            <p class="font-semibold text-indigo-300">{{ mapTitle || 'Floor Plan' }}</p>
            <p class="text-xs text-gray-400 mt-1">Walls: {{ stats.wallCount }} • Vertices: {{ stats.vertexCount }}</p>
          </div>

          <!-- Mini Map (clickable for teleport) -->
          <div v-show="!loading && showMiniMap" class="absolute bottom-4 right-4 w-40 h-40 bg-black/70 backdrop-blur-sm rounded-lg border-2 border-indigo-400 overflow-hidden cursor-crosshair" @click="onMiniMapClick">
            <canvas ref="miniMapRef" class="w-full h-full pointer-events-none"></canvas>
            <div
              class="absolute w-3 h-3 pointer-events-none"
              :style="{ left: miniMapDotX + '%', top: miniMapDotY + '%', transform: 'translate(-50%, -50%)' }"
            >
              <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white shadow"></div>
            </div>
            <div class="absolute bottom-1 left-1 text-[8px] text-white/70 pointer-events-none">Click to teleport</div>
          </div>

          <!-- Room Navigation Panel -->
          <div v-show="!loading && rooms.length > 0" class="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white max-w-48">
            <p class="text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Quick Navigate
            </p>
            <div class="flex flex-wrap gap-1">
              <button 
                v-for="room in rooms" 
                :key="room.id"
                @click="teleportToRoom(room)"
                class="px-2 py-1 text-[10px] bg-indigo-600/80 hover:bg-indigo-500 rounded transition-colors truncate max-w-full"
                :title="room.name"
              >
                {{ room.name }}
              </button>
            </div>
          </div>

          <!-- Quick Position Buttons -->
          <div v-show="!loading" class="absolute top-4 right-4 flex flex-col gap-1" :class="rooms.length > 0 ? 'mt-24' : ''">
            <button @click="teleportToPosition('center')" class="px-2 py-1 text-[10px] bg-black/60 hover:bg-black/80 text-white rounded backdrop-blur-sm">Center</button>
            <button @click="teleportToPosition('entrance')" class="px-2 py-1 text-[10px] bg-black/60 hover:bg-black/80 text-white rounded backdrop-blur-sm">Entrance</button>
            <button @click="teleportToPosition('corner1')" class="px-2 py-1 text-[10px] bg-black/60 hover:bg-black/80 text-white rounded backdrop-blur-sm">Corner 1</button>
            <button @click="teleportToPosition('corner2')" class="px-2 py-1 text-[10px] bg-black/60 hover:bg-black/80 text-white rounded backdrop-blur-sm">Corner 2</button>
          </div>

          <!-- Speed Indicator for Walk Mode -->
          <div v-if="isWalkMode && isPointerLocked" class="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white">
            <p v-if="floorCountRef > 1" class="font-semibold text-indigo-300 mb-0.5">On: {{ currentFloorLabel }}</p>
            <p>Speed: {{ walkSpeed.toFixed(0) }} • Height: {{ Math.round(camera?.position.y || 0) }}</p>
            <p v-if="floorCountRef > 1" class="text-[10px] text-gray-300 mt-0.5">Walk onto the stairs to go up a floor</p>
          </div>
        </div>

        <!-- Bottom Controls -->
        <div v-show="!loading" class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Walk Speed -->
            <div v-if="isWalkMode" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">Walk Speed:</span>
              <input 
                type="range" 
                min="20" 
                max="150" 
                v-model="walkSpeed"
                class="w-24 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <!-- Mini Map Toggle -->
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="showMiniMap" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm font-medium text-gray-700">Mini Map</span>
            </label>
          </div>

          <!-- Keyboard Shortcuts -->
          <div class="text-xs text-gray-500">
            <span class="font-medium">Shortcuts:</span> 
            <span class="ml-2">W/S - Forward/Back</span>
            <span class="ml-2">A/D - Left/Right</span>
            <span class="ml-2">Space - Jump</span>
            <span class="ml-2">Shift - Sprint</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'

// Props
const props = defineProps({
  mapData: {
    type: Object,
    default: null
  },
  // Array of per-floor map data (index 0 = ground floor). When provided with
  // length > 1, floors are stacked vertically and connected by stairs.
  floorsData: {
    type: Array,
    default: null
  },
  // Optional display labels for floors, e.g. ['Ground Floor', 'First Floor'].
  floorNames: {
    type: Array,
    default: null
  },
  mapTitle: {
    type: String,
    default: ''
  },
  compactMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// Refs
const containerRef = ref(null)
const canvasRef = ref(null)
const miniMapRef = ref(null)

// State
const loading = ref(true)
const error = ref(null)
const currentView = ref('perspective')
const wallHeight = ref(120)
const rooms = ref([]) // Detected rooms for navigation
const showFloor = ref(true)
const showCeiling = ref(false)
const showGrid = ref(true)
const showFurniture = ref(true)
const showMiniMap = ref(true)
const stats = ref({ wallCount: 0, vertexCount: 0 })
const isFullscreen = ref(false)
const miniMapDotX = ref(50)
const miniMapDotY = ref(50)

// Walk mode state
const isWalkMode = ref(false)
const isPointerLocked = ref(false)
const walkSpeed = ref(60)

// Three.js objects
let scene = null
let camera = null
let renderer = null
let orbitControls = null
let pointerControls = null
let wallMeshes = []
let floorMesh = null
let ceilingMesh = null
let gridHelper = null
const miniMapOverrideMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e })
let furnitureMeshes = []
let labelMeshes = []
let stairMeshes = []
let stairRamps = []
let extraFloorCeilingMeshes = []
let animationFrameId = null
let miniMapRenderer = null
let miniMapCamera = null
let clock = null
let mapBounds = null
let expandedBounds = null
/** Number of floors actually built into the scene (>=1). */
let builtFloorCount = 1

// Reactive mirrors for the UI (builtFloorCount is a plain let)
const floorCountRef = ref(1)
const visibleFloor = ref('all') // 'all' | floorIndex number
const currentFloorRef = ref(0)  // which floor the player is standing on (walk mode)

const currentFloorLabel = computed(() => floorLabels.value[currentFloorRef.value] || `Floor ${currentFloorRef.value + 1}`)

// Returns the array of per-floor map data. Multi-floor when floorsData has
// more than one valid entry; otherwise falls back to the single mapData prop.
const getFloorsArray = () => {
  const fd = (props.floorsData || []).filter(Boolean)
  if (fd.length > 0) return fd
  return props.mapData ? [props.mapData] : []
}

const getEffectiveFloorCount = () => builtFloorCount

// Human-readable floor labels for the selector
const floorLabels = computed(() => {
  const n = floorCountRef.value
  const defaults = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor', 'Fifth Floor']
  const out = []
  for (let i = 0; i < n; i++) {
    const provided = props.floorNames && props.floorNames[i]
    out.push(provided || defaults[i] || `Floor ${i + 1}`)
  }
  return out
})

// Movement state
const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false
}
let velocity = new THREE.Vector3()
let direction = new THREE.Vector3()
let tempForward = new THREE.Vector3()
let tempRight = new THREE.Vector3()
let playerHeight = 170 // Eye level height (cm) - camera stays at floor + this
let canJump = true
const PLAYER_RADIUS = 3 // Very slim collision body — must fit through narrow doorways and passages

// The floor the player is currently committed to (0 = ground). This latch is
// the reliable way to tell "climbing up" from "going down" on a staircase:
// while it equals a stair's lower floor the player is going up; once they reach
// the last steps they are snapped onto the floor above and the latch advances.
let committedFloor = 0
let _lastStairLog = 0

// Check if position (x,z) would collide with any wall on the player's current floor
const wallBox = new THREE.Box3()

/** Which floor slab the player is on (for collision). Uses foot height + small bias so upper-floor
 *  walls apply as soon as you step off the stair landing — ground-floor walls no longer block XZ
 *  when the camera is at first-floor eye level (that overlap caused getting stuck on stairs). */
const getPlayerFloorIndexForCollision = () => {
  const py = camera ? camera.position.y : 0
  const h = wallHeight.value
  if (h < 1) return 0
  const footY = py - playerHeight
  const numFloors = getEffectiveFloorCount()
  const bias = h * 0.06
  return Math.max(0, Math.min(numFloors - 1, Math.floor((footY + bias) / h)))
}

const checkWallCollision = (x, z) => {
  if (!wallMeshes || wallMeshes.length === 0) return false
  const floorIdx = getPlayerFloorIndexForCollision()
  for (const wall of wallMeshes) {
    if (!wall.visible) continue
    const wf = wall.userData.floorIndex ?? 0
    if (wf !== floorIdx) continue
    wallBox.setFromObject(wall).expandByScalar(PLAYER_RADIUS)
    if (x >= wallBox.min.x && x <= wallBox.max.x && z >= wallBox.min.z && z <= wallBox.max.z) return true
  }
  return false
}

// Check WebGL support
const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch (e) {
    return false
  }
}

// Initialize Three.js scene
const initThree = () => {
  console.log('[3DViewer] Initializing Three.js...')
  
  if (!isWebGLAvailable()) {
    error.value = 'WebGL is not supported in your browser.'
    return false
  }
  
  if (!canvasRef.value || !containerRef.value) {
    console.error('[3DViewer] Canvas or container not found')
    return false
  }

  const container = containerRef.value
  const canvas = canvasRef.value
  let width = container.clientWidth || 800
  let height = container.clientHeight || 600

  try {
    clock = new THREE.Clock()
    
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)

    // Create camera with very large far plane for architectural drawings
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000000)
    camera.position.set(0, playerHeight, 500)

    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0

    // Create Orbit Controls
    orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 0.05
    orbitControls.screenSpacePanning = true
    orbitControls.minDistance = 100
    orbitControls.maxDistance = 20000
    orbitControls.maxPolarAngle = Math.PI / 2

    // Create Pointer Lock Controls for walk mode
    pointerControls = new PointerLockControls(camera, document.body)
    
    pointerControls.addEventListener('lock', () => {
      isPointerLocked.value = true
    })
    
    pointerControls.addEventListener('unlock', () => {
      isPointerLocked.value = false
    })

    addLights()

    // Initialize mini map
    initMiniMap()

    console.log('[3DViewer] Three.js initialized successfully')
    return true
  } catch (err) {
    console.error('[3DViewer] Error:', err)
    error.value = err.message
    return false
  }
}

// Add lighting to the scene
const addLights = () => {
  scene.children = scene.children.filter(child => !(child instanceof THREE.Light))
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.9)
  sunLight.position.set(2000, 3000, 1000)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 4096
  sunLight.shadow.mapSize.height = 4096
  const shadowSize = expandedBounds ? Math.max(expandedBounds.maxX - expandedBounds.minX, expandedBounds.maxY - expandedBounds.minY) * 1.5 : 10000
  sunLight.shadow.camera.near = 100
  sunLight.shadow.camera.far = shadowSize * 2
  sunLight.shadow.camera.left = -shadowSize
  sunLight.shadow.camera.right = shadowSize
  sunLight.shadow.camera.top = shadowSize
  sunLight.shadow.camera.bottom = -shadowSize
  scene.add(sunLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
  fillLight.position.set(-1000, 1000, -1000)
  scene.add(fillLight)

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4)
  scene.add(hemiLight)
}

// Initialize mini map
const initMiniMap = () => {
  if (!miniMapRef.value) return
  
  const canvas = miniMapRef.value
  miniMapRenderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  miniMapRenderer.setSize(160, 160)
  
  miniMapCamera = new THREE.OrthographicCamera(-1000, 1000, 1000, -1000, 1, 10000)
  miniMapCamera.up.set(0, 0, -1)
  miniMapCamera.position.set(0, 5000, 0)
  miniMapCamera.lookAt(0, 0, 0)
}

// Add grid helper
const addGridHelper = () => {
  if (!scene || !expandedBounds) return
  
  if (gridHelper) {
    scene.remove(gridHelper)
    gridHelper = null
  }
  
  if (!showGrid.value) return
  
  const size = Math.max(expandedBounds.maxX - expandedBounds.minX, expandedBounds.maxY - expandedBounds.minY) * 1.3
  const divisions = 30
  
  gridHelper = new THREE.GridHelper(size, divisions, 0x4f46e5, 0x334155)
  gridHelper.position.y = 1
  gridHelper.position.x = (expandedBounds.minX + expandedBounds.maxX) / 2
  gridHelper.position.z = (expandedBounds.minY + expandedBounds.maxY) / 2
  scene.add(gridHelper)
}

// Build 3D model from map data
const buildModel = () => {
  const floors = getFloorsArray()
  if (floors.length === 0 || !floors[0]?.entities) {
    error.value = 'No map data available'
    return
  }

  console.log('[3DViewer] Building model:', floors.length, 'floor(s)')

  // Calculate bounds across ALL floors so stacked floors stay aligned
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let entityCount = 0

  floors.forEach(floorData => {
    (floorData.entities || []).forEach(entity => {
      if (entity.type === 'line' && entity.start && entity.end) {
        minX = Math.min(minX, entity.start.x, entity.end.x)
        maxX = Math.max(maxX, entity.start.x, entity.end.x)
        minY = Math.min(minY, entity.start.y, entity.end.y)
        maxY = Math.max(maxY, entity.start.y, entity.end.y)
        entityCount++
      }
    })
  })

  // Use metadata bounds as fallback or if they're more complete
  if (!isFinite(minX) || entityCount === 0) {
    const metaBounds = floors[0].metadata?.bounds
    if (metaBounds && isFinite(metaBounds.minX)) {
      minX = metaBounds.minX
      minY = metaBounds.minY
      maxX = metaBounds.maxX
      maxY = metaBounds.maxY
    } else {
      minX = 0; minY = 0; maxX = 1000; maxY = 1000
    }
  }

  mapBounds = { minX, minY, maxX, maxY }

  const EXP = 6.0
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  expandedBounds = {
    minX: cx + (minX - cx) * EXP,
    maxX: cx + (maxX - cx) * EXP,
    minY: cy + (minY - cy) * EXP,
    maxY: cy + (maxY - cy) * EXP
  }

  // Calculate map size
  const mapWidth = maxX - minX
  const mapHeight = maxY - minY
  const mapSize = Math.max(mapWidth, mapHeight)

  // Wall height proportional to map size — kept short for a realistic look
  const scaleFactor = mapSize / 1000
  const calculatedWallHeight = Math.max(120 * scaleFactor, 40)
  wallHeight.value = Math.round(Math.min(calculatedWallHeight, 200))

  // Camera height for walk mode - lower = nearer to floor, more grounded view
  playerHeight = wallHeight.value * 0.38 // ~38% of wall = perspective closer to floor

  clearMeshes()

  const h = wallHeight.value
  const allowed3DLayers = new Set(['walls', 'doors', 'windows'])
  let wallCount = 0
  let vertexCount = 0

  // Build each floor stacked vertically: floor f occupies [f*h, (f+1)*h]
  floors.forEach((floorData, f) => {
    const yOffset = f * h
    const entities = floorData.entities || []

    // Floor slab. Ground floor gets the rich textured floor; upper floors get a
    // plain slab with a hole punched where the stairwell rises through it.
    if (f === 0) {
      createFloor(mapBounds)
    } else {
      // Stairwell opening for this floor = footprint of stairs on the floor BELOW
      const wellRect = getStairFootprintWorld(floors[f - 1].entities || [])
      createFloorPlane(mapBounds, yOffset, f, wellRect ? [wellRect] : [])
    }

    // Walls / doors / windows
    entities.forEach(entity => {
      if (entity.type === 'line' && entity.start && entity.end) {
        const lid = entity.layerId || 'other'
        if (!allowed3DLayers.has(lid)) return
        const wall = createWall(entity, yOffset)
        if (wall) {
          wall.userData.layerId = lid
          wall.userData.floorIndex = f
          scene.add(wall)
          wallMeshes.push(wall)
          wallCount++
          wall.traverse(child => {
            if (child.isMesh) vertexCount += child.geometry.attributes.position.count
          })
        }
      }
    })

    // Stairs: build only when there's a floor above to connect to
    if (f < floors.length - 1) {
      buildStairs(entities, yOffset, f)
    }

    // Room labels for this floor
    addFloorLabels(entities, yOffset, f)
  })

  // Roof ceiling above the top floor
  createCeiling(mapBounds)
  if (ceilingMesh) ceilingMesh.position.y = floors.length * h

  stats.value = { wallCount, vertexCount }

  addGridHelper()
  updateMiniMapCamera()

  rooms.value = detectRooms(floors[0].entities)
  builtFloorCount = floors.length
  floorCountRef.value = floors.length

  // Apply current floor-view filter (and clamp if floor count shrank)
  if (visibleFloor.value !== 'all' && visibleFloor.value >= floors.length) {
    visibleFloor.value = 'all'
  }
  applyFloorView()

  console.log('[3DViewer] Built', floors.length, 'floor(s),', wallCount, 'walls,', rooms.value.length, 'rooms')
  console.log('[3DViewer] wallHeight =', wallHeight.value, '| stairRamps =', stairRamps.length)
  stairRamps.forEach((r, i) => {
    console.log(`[3DViewer] ramp#${i} floor=${r.floorIndex} baseY=${r.baseY.toFixed(1)} topY=${r.topY.toFixed(1)} axis=${r.runAxis} run=${r.runStart.toFixed(0)}→${r.runEnd.toFixed(0)} foot=[${r.minX.toFixed(0)},${r.minZ.toFixed(0)}]..[${r.maxX.toFixed(0)},${r.maxZ.toFixed(0)}]`)
  })
  if (stairRamps.length === 0 && floors.length > 1) {
    console.warn('[3DViewer] NO STAIRS BUILT — the ground floor has no "stairs" layer, so the player cannot climb. Use the floor buttons to jump between floors.')
  }
}

// Create textured floor
const createFloor = (bounds) => {
  const SPACE_EXPANSION = 6.0
  // Size to the wall span exactly (walls occupy bounds × SPACE_EXPANSION around
  // the centre) so the slab fits inside the boundary walls, not past them.
  const width = (bounds.maxX - bounds.minX) * SPACE_EXPANSION
  const depth = (bounds.maxY - bounds.minY) * SPACE_EXPANSION
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minY + bounds.maxY) / 2

  const S = 1024
  const floorCanvas = document.createElement('canvas')
  floorCanvas.width = S
  floorCanvas.height = S
  const ctx = floorCanvas.getContext('2d')
  
  // Warm oak base
  ctx.fillStyle = '#c8a26e'
  ctx.fillRect(0, 0, S, S)

  const plankH = S / 10
  const plankColors = ['#c49a6c', '#d4a574', '#b8935c', '#cfa870', '#bfa068', '#d0aa78']

  for (let row = 0; row < 10; row++) {
    const y = row * plankH
    // Staggered plank joints
    const offset = (row % 2 === 0) ? 0 : S * 0.4
    let x = -offset

    while (x < S) {
      const pw = S * 0.35 + Math.random() * S * 0.3
      const baseColor = plankColors[Math.floor(Math.random() * plankColors.length)]
      ctx.fillStyle = baseColor
      ctx.fillRect(x, y + 1, pw - 2, plankH - 2)

      // Wood grain lines within each plank
      ctx.save()
    ctx.beginPath()
      ctx.rect(x, y + 1, pw - 2, plankH - 2)
      ctx.clip()
      const grainCount = 8 + Math.floor(Math.random() * 6)
      for (let g = 0; g < grainCount; g++) {
        const gy = y + 2 + (g / grainCount) * (plankH - 4)
        ctx.strokeStyle = `rgba(120, 80, 40, ${0.06 + Math.random() * 0.08})`
        ctx.lineWidth = 0.5 + Math.random() * 1
        ctx.beginPath()
        ctx.moveTo(x, gy)
        // Slight wave for natural grain
        const wave = Math.random() * 3
        for (let gx = x; gx < x + pw; gx += 8) {
          ctx.lineTo(gx, gy + Math.sin(gx * 0.02 + row) * wave)
        }
    ctx.stroke()
      }

      // Occasional knot
      if (Math.random() < 0.15) {
        const kx = x + pw * 0.3 + Math.random() * pw * 0.4
        const ky = y + plankH * 0.3 + Math.random() * plankH * 0.4
        const kr = 3 + Math.random() * 5
        const kGrad = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr)
        kGrad.addColorStop(0, 'rgba(90, 55, 25, 0.5)')
        kGrad.addColorStop(0.6, 'rgba(110, 70, 35, 0.25)')
        kGrad.addColorStop(1, 'rgba(140, 90, 50, 0)')
        ctx.fillStyle = kGrad
        ctx.beginPath()
        ctx.ellipse(kx, ky, kr, kr * 0.7, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }

      // Subtle shade variation per plank
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '0,0,0' : '255,255,255'}, ${0.02 + Math.random() * 0.03})`
      ctx.fillRect(x, y + 1, pw - 2, plankH - 2)

      ctx.restore()
      x += pw
    }

    // Horizontal gap between rows
    ctx.fillStyle = 'rgba(60, 35, 15, 0.35)'
    ctx.fillRect(0, y, S, 1.5)
  }

  // Vertical joint lines (drawn per-row to get stagger)
  ctx.strokeStyle = 'rgba(60, 35, 15, 0.3)'
  ctx.lineWidth = 1
  for (let row = 0; row < 10; row++) {
    const y = row * plankH
    const offset = (row % 2 === 0) ? 0 : S * 0.4
    let x = -offset
    while (x < S) {
      const pw = S * 0.35 + Math.random() * S * 0.3
      if (x > 0) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + plankH)
        ctx.stroke()
      }
      x += pw
    }
  }
  
  const floorTexture = new THREE.CanvasTexture(floorCanvas)
  floorTexture.wrapS = THREE.RepeatWrapping
  floorTexture.wrapT = THREE.RepeatWrapping
  floorTexture.repeat.set(width / 600, depth / 600)
  floorTexture.anisotropy = 4

  // Normal map for subtle depth (bump illusion)
  const bumpCanvas = document.createElement('canvas')
  bumpCanvas.width = S
  bumpCanvas.height = S
  const bCtx = bumpCanvas.getContext('2d')
  bCtx.fillStyle = '#808080'
  bCtx.fillRect(0, 0, S, S)
  for (let row = 0; row < 10; row++) {
    const y = row * plankH
    bCtx.fillStyle = '#606060'
    bCtx.fillRect(0, y, S, 1.5)
  }
  const bumpTex = new THREE.CanvasTexture(bumpCanvas)
  bumpTex.wrapS = THREE.RepeatWrapping
  bumpTex.wrapT = THREE.RepeatWrapping
  bumpTex.repeat.set(width / 600, depth / 600)

  const geometry = new THREE.PlaneGeometry(width, depth)
  const material = new THREE.MeshStandardMaterial({
    map: floorTexture,
    bumpMap: bumpTex,
    bumpScale: 0.8,
    side: THREE.DoubleSide,
    roughness: 0.65,
    metalness: 0.05
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(centerX, 0, centerZ)
  mesh.receiveShadow = true
  mesh.visible = showFloor.value

  floorMesh = mesh
  floorMesh.userData.floorIndex = 0
  scene.add(mesh)
}

// Compute the world-space footprint rectangle of the staircase from a floor's
// entities (used to punch a stairwell hole in the floor slab above it).
const getStairFootprintWorld = (entities) => {
  if (!entities || !mapBounds) return null
  const SPACE_EXPANSION = 6.0
  const stairEnts = entities.filter(e => e.type === 'line' &&
    (e.layerId === 'stairs' || e.layerId === 'stair-up' || e.layerId === 'stair-down') &&
    e.start && e.end)
  if (!stairEnts.length) return null

  let sMinX = Infinity, sMinY = Infinity, sMaxX = -Infinity, sMaxY = -Infinity
  for (const e of stairEnts) {
    sMinX = Math.min(sMinX, e.start.x, e.end.x)
    sMinY = Math.min(sMinY, e.start.y, e.end.y)
    sMaxX = Math.max(sMaxX, e.start.x, e.end.x)
    sMaxY = Math.max(sMaxY, e.start.y, e.end.y)
  }
  if (!isFinite(sMinX)) return null

  const mapCX = (mapBounds.minX + mapBounds.maxX) / 2
  const mapCZ = (mapBounds.minY + mapBounds.maxY) / 2
  const toWorldX = (rx) => mapCX + (rx - mapCX) * SPACE_EXPANSION
  const toWorldZ = (ry) => mapCZ + (ry - mapCZ) * SPACE_EXPANSION

  // Slightly enlarge the opening so the player can comfortably emerge
  const pad = 0.05
  const wMinX = toWorldX(sMinX), wMaxX = toWorldX(sMaxX)
  const wMinZ = toWorldZ(sMinY), wMaxZ = toWorldZ(sMaxY)
  const ex = (wMaxX - wMinX) * pad
  const ez = (wMaxZ - wMinZ) * pad
  return {
    minX: Math.min(wMinX, wMaxX) - ex, maxX: Math.max(wMinX, wMaxX) + ex,
    minZ: Math.min(wMinZ, wMaxZ) - ez, maxZ: Math.max(wMinZ, wMaxZ) + ez
  }
}

const createFloorPlane = (bounds, yOffset, floorIndex = 0, holes = []) => {
  const SPACE_EXPANSION = 6.0
  // Size to the wall span exactly (walls occupy bounds × SPACE_EXPANSION around
  // the centre) so the slab fits inside the boundary walls, not past them.
  const width = (bounds.maxX - bounds.minX) * SPACE_EXPANSION
  const depth = (bounds.maxY - bounds.minY) * SPACE_EXPANSION
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minY + bounds.maxY) / 2

  let geometry
  if (holes && holes.length > 0) {
    // Build a rectangular slab in local (x,y) space with rectangular holes.
    // After rotation.x = -90°, local (x,y) maps to world (centerX + x, yOffset, centerZ - y).
    const shape = new THREE.Shape()
    shape.moveTo(-width / 2, -depth / 2)
    shape.lineTo(width / 2, -depth / 2)
    shape.lineTo(width / 2, depth / 2)
    shape.lineTo(-width / 2, depth / 2)
    shape.lineTo(-width / 2, -depth / 2)

    holes.forEach(hr => {
      // World rect → local coords: lx = worldX - centerX, ly = centerZ - worldZ
      const lxA = hr.minX - centerX, lxB = hr.maxX - centerX
      const lyA = centerZ - hr.minZ, lyB = centerZ - hr.maxZ
      const x0 = Math.min(lxA, lxB), x1 = Math.max(lxA, lxB)
      const y0 = Math.min(lyA, lyB), y1 = Math.max(lyA, lyB)
      const hole = new THREE.Path()
      hole.moveTo(x0, y0)
      hole.lineTo(x1, y0)
      hole.lineTo(x1, y1)
      hole.lineTo(x0, y1)
      hole.lineTo(x0, y0)
      shape.holes.push(hole)
    })
    geometry = new THREE.ShapeGeometry(shape)
  } else {
    geometry = new THREE.PlaneGeometry(width, depth)
  }

  const material = new THREE.MeshStandardMaterial({