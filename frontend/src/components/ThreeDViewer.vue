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
  