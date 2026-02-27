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
      <div v-else :class="['flex flex-col', compactMode ? 'flex-1 gap-2' : 'space-y-4']">
        <!-- Controls Panel - Compact for split view -->
        <div v-show="!loading" :class="[
          'flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-md border border-indigo-200',
          compactMode ? 'p-2 gap-2' : 'p-4 rounded-xl'
        ]">
          <div :class="['flex items-center flex-wrap', compactMode ? 'gap-2' : 'gap-4']">
            <!-- Time of Day -->
            <div class="flex items-center gap-1">
              <span :class="['font-medium text-gray-700', compactMode ? 'text-xs' : 'text-sm']">Light:</span>
              <select v-model="timeOfDay" @change="updateLighting" :class="['border border-gray-300 rounded px-1', compactMode ? 'text-xs py-0.5' : 'text-sm py-1']">
                <option value="day">Day</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
            
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

            <!-- Wall Height - Only in full mode -->
            <div v-if="!compactMode" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">Wall Height:</span>
              <input 
                type="range" 
                min="100" 
                max="500" 
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

            <!-- Show Furniture Toggle - Only in full mode -->
            <label v-if="!compactMode" class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="showFurniture" @change="toggleFurniture" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm font-medium text-gray-700">Furniture</span>
            </label>
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
            'rounded-xl overflow-hidden shadow-2xl relative cursor-pointer',
            compactMode ? 'flex-1 border-2 border-indigo-200' : 'border-4 border-indigo-300'
          ]"
          :style="compactMode ? 'min-height: 400px;' : 'height: 650px;'"
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
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
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
            <p>Speed: {{ walkSpeed.toFixed(0) }} • Height: {{ Math.round(camera?.position.y || 0) }}</p>
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
                min="50" 
                max="500" 
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
const wallHeight = ref(280)
const rooms = ref([]) // Detected rooms for navigation
const showFloor = ref(true)
const showCeiling = ref(false)
const showGrid = ref(true)
const showFurniture = ref(true)
const showMiniMap = ref(true)
const timeOfDay = ref('day')
const stats = ref({ wallCount: 0, vertexCount: 0 })

// Walk mode state
const isWalkMode = ref(false)
const isPointerLocked = ref(false)
const walkSpeed = ref(200)

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
let furnitureMeshes = []
let animationFrameId = null
let miniMapRenderer = null
let miniMapCamera = null
let clock = null
let mapBounds = null

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
let playerHeight = 170 // Eye level height
let canJump = true

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
    
    // Create scene with fog for atmosphere
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB) // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 1000, 10000)

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

    // Add environment
    addLights()
    addSkybox()

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

// Add skybox for immersion
const addSkybox = () => {
  // Create gradient sky
  const skyGeo = new THREE.SphereGeometry(20000, 32, 32)
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 400 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide
  })
  const sky = new THREE.Mesh(skyGeo, skyMat)
  scene.add(sky)
}

// Add lighting to the scene
const addLights = () => {
  // Remove existing lights
  scene.children = scene.children.filter(child => !(child instanceof THREE.Light))
  
  const lightSettings = {
    day: { ambient: 0.6, directional: 1.0, skyColor: 0x87CEEB, sunColor: 0xffffcc },
    evening: { ambient: 0.3, directional: 0.5, skyColor: 0xff7700, sunColor: 0xff6600 },
    night: { ambient: 0.1, directional: 0.2, skyColor: 0x1a1a2e, sunColor: 0x4444ff }
  }
  
  const settings = lightSettings[timeOfDay.value]
  
  // Update scene background
  scene.background = new THREE.Color(settings.skyColor)
  if (scene.fog) {
    scene.fog.color = new THREE.Color(settings.skyColor)
  }
  
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, settings.ambient)
  scene.add(ambientLight)

  // Main directional light (sun)
  const sunLight = new THREE.DirectionalLight(settings.sunColor, settings.directional)
  sunLight.position.set(2000, 3000, 1000)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 4096
  sunLight.shadow.mapSize.height = 4096
  // Adjust shadow camera bounds based on map size
  const shadowSize = mapBounds ? Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY) * 1.5 : 10000
  sunLight.shadow.camera.near = 100
  sunLight.shadow.camera.far = shadowSize * 2
  sunLight.shadow.camera.left = -shadowSize
  sunLight.shadow.camera.right = shadowSize
  sunLight.shadow.camera.top = shadowSize
  sunLight.shadow.camera.bottom = -shadowSize
  scene.add(sunLight)

  // Fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0xffffff, settings.directional * 0.3)
  fillLight.position.set(-1000, 1000, -1000)
  scene.add(fillLight)

  // Hemisphere light for natural feel
  const hemiLight = new THREE.HemisphereLight(settings.skyColor, 0x444444, 0.4)
  scene.add(hemiLight)

  // Add point lights for interior (simulate room lighting)
  if (timeOfDay.value === 'night') {
    addInteriorLights()
  }
}

// Add interior lights for night mode
const addInteriorLights = () => {
  if (!mapBounds) return
  
  const centerX = (mapBounds.minX + mapBounds.maxX) / 2
  const centerZ = (mapBounds.minY + mapBounds.maxY) / 2
  const mapSize = Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY)
  
  // Warm interior light - distance proportional to map size
  const interiorLight = new THREE.PointLight(0xffaa44, 1.5, mapSize * 2)
  interiorLight.position.set(centerX, wallHeight.value * 0.8, centerZ)
  interiorLight.castShadow = true
  scene.add(interiorLight)
}

// Initialize mini map
const initMiniMap = () => {
  if (!miniMapRef.value) return
  
  const canvas = miniMapRef.value
  miniMapRenderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  miniMapRenderer.setSize(160, 160)
  
  miniMapCamera = new THREE.OrthographicCamera(-1000, 1000, 1000, -1000, 1, 10000)
  miniMapCamera.position.set(0, 5000, 0)
  miniMapCamera.lookAt(0, 0, 0)
}

// Add grid helper
const addGridHelper = () => {
  if (!scene || !mapBounds) return
  
  if (gridHelper) {
    scene.remove(gridHelper)
    gridHelper = null
  }
  
  if (!showGrid.value) return
  
  const size = Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY) * 1.5
  const divisions = 30
  
  gridHelper = new THREE.GridHelper(size, divisions, 0x4f46e5, 0x334155)
  gridHelper.position.y = 1
  gridHelper.position.x = (mapBounds.minX + mapBounds.maxX) / 2
  gridHelper.position.z = (mapBounds.minY + mapBounds.maxY) / 2
  scene.add(gridHelper)
}

// Build 3D model from map data
const buildModel = () => {
  if (!props.mapData?.entities) {
    error.value = 'No map data available'
    return
  }

  console.log('[3DViewer] Building model from', props.mapData.entities.length, 'entities')

  // Calculate bounds from all entities
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let entityCount = 0
  
  props.mapData.entities.forEach(entity => {
    if (entity.type === 'line' && entity.start && entity.end) {
      minX = Math.min(minX, entity.start.x, entity.end.x)
      maxX = Math.max(maxX, entity.start.x, entity.end.x)
      minY = Math.min(minY, entity.start.y, entity.end.y)
      maxY = Math.max(maxY, entity.start.y, entity.end.y)
      entityCount++
    }
  })
  
  // Use metadata bounds as fallback or if they're more complete
  if (!isFinite(minX) || entityCount === 0) {
    const metaBounds = props.mapData.metadata?.bounds
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
  
  // Calculate map size
  const mapWidth = maxX - minX
  const mapHeight = maxY - minY
  const mapSize = Math.max(mapWidth, mapHeight)
  
  console.log('[3DViewer] Map bounds:', mapBounds)
  console.log('[3DViewer] Map size:', mapWidth, 'x', mapHeight)
  console.log('[3DViewer] Entity count:', entityCount)
  
  // Adjust wall height proportionally to map size
  // For a typical house (1000 units), wall height should be ~280
  // Scale proportionally for larger/smaller maps
  const scaleFactor = mapSize / 1000
  const calculatedWallHeight = Math.max(280 * scaleFactor, 100) // minimum 100 units
  wallHeight.value = Math.round(calculatedWallHeight)
  console.log('[3DViewer] Calculated wall height:', wallHeight.value, '(scale factor:', scaleFactor.toFixed(2), ')')
  
  // Also update player height for walk mode
  playerHeight = wallHeight.value * 0.6 // Eye level at 60% of wall height
  
  // Adjust fog based on map size
  if (scene.fog) {
    scene.fog.near = mapSize * 0.3
    scene.fog.far = mapSize * 3
  }

  clearMeshes()
  createFloor(mapBounds)
  createCeiling(mapBounds)
  
  // Create walls
  let wallCount = 0
  let vertexCount = 0

  props.mapData.entities.forEach(entity => {
    if (entity.type === 'line' && entity.start && entity.end) {
      const wall = createWall(entity)
      if (wall) {
        scene.add(wall)
        wallMeshes.push(wall)
        wallCount++
        vertexCount += wall.geometry.attributes.position.count
      }
    }
  })

  // Add sample furniture
  if (showFurniture.value) {
    addFurniture()
  }

  stats.value = { wallCount, vertexCount }
  
  addGridHelper()
  centerCamera(mapBounds)
  updateMiniMapCamera()
  
  // Detect rooms for navigation
  rooms.value = detectRooms()
  console.log('[3DViewer] Detected rooms:', rooms.value.length)
}

// Create textured floor
const createFloor = (bounds) => {
  const width = (bounds.maxX - bounds.minX) * 1.3
  const depth = (bounds.maxY - bounds.minY) * 1.3
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minY + bounds.maxY) / 2

  // Create wood floor texture procedurally
  const floorCanvas = document.createElement('canvas')
  floorCanvas.width = 512
  floorCanvas.height = 512
  const ctx = floorCanvas.getContext('2d')
  
  // Wood pattern
  ctx.fillStyle = '#d4a574'
  ctx.fillRect(0, 0, 512, 512)
  
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#c49a6c' : '#deb887'
    ctx.fillRect(0, i * 64, 512, 62)
    ctx.strokeStyle = '#a0522d'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, i * 64)
    ctx.lineTo(512, i * 64)
    ctx.stroke()
  }
  
  const floorTexture = new THREE.CanvasTexture(floorCanvas)
  floorTexture.wrapS = THREE.RepeatWrapping
  floorTexture.wrapT = THREE.RepeatWrapping
  floorTexture.repeat.set(width / 500, depth / 500)

  const geometry = new THREE.PlaneGeometry(width, depth)
  const material = new THREE.MeshStandardMaterial({
    map: floorTexture,
    side: THREE.DoubleSide,
    roughness: 0.8,
    metalness: 0.1
  })

  floorMesh = new THREE.Mesh(geometry, material)
  floorMesh.rotation.x = -Math.PI / 2
  floorMesh.position.set(centerX, 0, centerZ)
  floorMesh.receiveShadow = true
  floorMesh.visible = showFloor.value

  scene.add(floorMesh)
}

// Create ceiling
const createCeiling = (bounds) => {
  const width = (bounds.maxX - bounds.minX) * 1.1
  const depth = (bounds.maxY - bounds.minY) * 1.1
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minY + bounds.maxY) / 2

  const geometry = new THREE.PlaneGeometry(width, depth)
  const material = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    side: THREE.DoubleSide,
    roughness: 0.9,
    metalness: 0
  })

  ceilingMesh = new THREE.Mesh(geometry, material)
  ceilingMesh.rotation.x = Math.PI / 2
  ceilingMesh.position.set(centerX, wallHeight.value, centerZ)
  ceilingMesh.receiveShadow = true
  ceilingMesh.visible = showCeiling.value

  scene.add(ceilingMesh)
}

// Create a wall with better materials
const createWall = (entity) => {
  const { start, end } = entity
  if (!start || !end) return null

  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  
  // Skip very short walls (relative to map size)
  const mapSize = mapBounds ? Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY) : 1000
  const minLength = mapSize * 0.001 // 0.1% of map size
  if (length < minLength) return null

  const height = wallHeight.value
  // Wall thickness proportional to map size
  const thickness = Math.max(mapSize * 0.005, 5) // At least 5 units

  // Create wall texture
  const wallCanvas = document.createElement('canvas')
  wallCanvas.width = 256
  wallCanvas.height = 256
  const ctx = wallCanvas.getContext('2d')
  
  // Determine color based on layer
  let baseColor = '#e8e4e0'
  if (entity.layerId === 'doors') {
    baseColor = '#8b4513'
  } else if (entity.layerId === 'windows') {
    baseColor = '#87ceeb'
  }
  
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, 256, 256)
  
  // Add subtle texture
  ctx.globalAlpha = 0.1
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff'
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3)
  }

  const wallTexture = new THREE.CanvasTexture(wallCanvas)
  wallTexture.wrapS = THREE.RepeatWrapping
  wallTexture.wrapT = THREE.RepeatWrapping
  wallTexture.repeat.set(length / 200, height / 200)

  const geometry = new THREE.BoxGeometry(length, height, thickness)
  const material = new THREE.MeshStandardMaterial({
    map: wallTexture,
    roughness: 0.9,
    metalness: 0
  })

  const wall = new THREE.Mesh(geometry, material)
  wall.castShadow = true
  wall.receiveShadow = true
  wall.userData = { originalHeight: height } // Store for scaling

  const centerX = (start.x + end.x) / 2
  const centerZ = (start.y + end.y) / 2
  wall.position.set(centerX, height / 2, centerZ)
  wall.rotation.y = -Math.atan2(dy, dx)

  return wall
}

// Add sample furniture
const addFurniture = () => {
  if (!mapBounds) return
  
  const centerX = (mapBounds.minX + mapBounds.maxX) / 2
  const centerZ = (mapBounds.minY + mapBounds.maxY) / 2
  const size = Math.min(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY)
  
  // Scale furniture proportionally to map size
  const scale = size / 1000 // Base scale for 1000-unit map
  const tableWidth = 100 * scale
  const tableDepth = 60 * scale
  const tableHeight = 5 * scale
  const tableTopY = 75 * scale
  const legRadius = 3 * scale
  const legHeight = 70 * scale
  const chairSize = 40 * scale
  const chairY = 45 * scale
  const chairDistance = 100 * scale
  
  // Add a simple table
  const tableGeometry = new THREE.BoxGeometry(tableWidth, tableHeight, tableDepth)
  const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 })
  const table = new THREE.Mesh(tableGeometry, tableMaterial)
  table.position.set(centerX, tableTopY, centerZ)
  table.castShadow = true
  table.receiveShadow = true
  scene.add(table)
  furnitureMeshes.push(table)
  
  // Table legs
  const legGeometry = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 8)
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 })
  const legOffsetX = tableWidth * 0.4
  const legOffsetZ = tableDepth * 0.4
  const legPositions = [[-legOffsetX, -legOffsetZ], [legOffsetX, -legOffsetZ], [-legOffsetX, legOffsetZ], [legOffsetX, legOffsetZ]]
  
  legPositions.forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set(centerX + x, legHeight / 2, centerZ + z)
    leg.castShadow = true
    scene.add(leg)
    furnitureMeshes.push(leg)
  })
  
  // Add chairs
  const chairGeometry = new THREE.BoxGeometry(chairSize, tableHeight, chairSize)
  const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
  
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    const chair = new THREE.Mesh(chairGeometry, chairMaterial)
    chair.position.set(
      centerX + Math.cos(angle) * chairDistance,
      chairY,
      centerZ + Math.sin(angle) * chairDistance
    )
    chair.castShadow = true
    scene.add(chair)
    furnitureMeshes.push(chair)
  }
}

// Center camera on the model
const centerCamera = (bounds) => {
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerZ = (bounds.minY + bounds.maxY) / 2
  const size = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY)

  if (isWalkMode.value) {
    // Position at entrance for walk mode
    camera.position.set(centerX, playerHeight, centerZ + size * 0.3)
    camera.lookAt(centerX, playerHeight, centerZ)
  } else {
    camera.position.set(centerX + size * 0.6, size * 0.5, centerZ + size * 0.6)
    if (orbitControls) {
      orbitControls.target.set(centerX, wallHeight.value / 3, centerZ)
      orbitControls.update()
    }
  }
}

// Update mini map camera
const updateMiniMapCamera = () => {
  if (!miniMapCamera || !mapBounds) return
  
  const centerX = (mapBounds.minX + mapBounds.maxX) / 2
  const centerZ = (mapBounds.minY + mapBounds.maxY) / 2
  const size = Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY) * 0.6
  
  miniMapCamera.left = -size
  miniMapCamera.right = size
  miniMapCamera.top = size
  miniMapCamera.bottom = -size
  miniMapCamera.position.set(centerX, 5000, centerZ)
  miniMapCamera.lookAt(centerX, 0, centerZ)
  miniMapCamera.updateProjectionMatrix()
}

// Clear all meshes
const clearMeshes = () => {
  wallMeshes.forEach(mesh => {
    scene.remove(mesh)
    mesh.geometry.dispose()
    if (mesh.material.map) mesh.material.map.dispose()
    mesh.material.dispose()
  })
  wallMeshes = []

  furnitureMeshes.forEach(mesh => {
    scene.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
  })
  furnitureMeshes = []

  if (floorMesh) {
    scene.remove(floorMesh)
    floorMesh.geometry.dispose()
    if (floorMesh.material.map) floorMesh.material.map.dispose()
    floorMesh.material.dispose()
    floorMesh = null
  }

  if (ceilingMesh) {
    scene.remove(ceilingMesh)
    ceilingMesh.geometry.dispose()
    ceilingMesh.material.dispose()
    ceilingMesh = null
  }
}

// Animation loop
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  
  const delta = Math.min(clock ? clock.getDelta() : 0.016, 0.1) // Cap delta to prevent huge jumps
  
  // Handle walk mode movement
  if (isWalkMode.value && isPointerLocked.value) {
    // Apply friction
    velocity.x -= velocity.x * 10.0 * delta
    velocity.z -= velocity.z * 10.0 * delta
    
    // Scaled gravity based on map size
    const gravityScale = mapBounds ? Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY) / 1000 : 1
    velocity.y -= 9.8 * 100.0 * gravityScale * delta

    // Get movement direction
    direction.z = Number(moveState.forward) - Number(moveState.backward)
    direction.x = Number(moveState.right) - Number(moveState.left)
    direction.normalize()

    // Scale speed based on map size
    const baseSpeed = walkSpeed.value * gravityScale
    const speed = moveState.sprint ? baseSpeed * 2 : baseSpeed

    if (moveState.forward || moveState.backward) {
      velocity.z -= direction.z * speed * delta * 10
    }
    if (moveState.left || moveState.right) {
      velocity.x -= direction.x * speed * delta * 10
    }

    // Clamp velocity to prevent extreme speeds
    const maxVelocity = speed * 5
    velocity.x = Math.max(-maxVelocity, Math.min(maxVelocity, velocity.x))
    velocity.z = Math.max(-maxVelocity, Math.min(maxVelocity, velocity.z))
    velocity.y = Math.max(-maxVelocity * 2, Math.min(maxVelocity, velocity.y))

    // Apply movement
    pointerControls.moveRight(-velocity.x * delta)
    pointerControls.moveForward(-velocity.z * delta)

    // Handle jumping
    camera.position.y += velocity.y * delta

    // Ground collision
    if (camera.position.y < playerHeight) {
      velocity.y = 0
      camera.position.y = playerHeight
      canJump = true
    }
    
    // Boundary clamping - keep camera within map bounds with padding
    if (mapBounds) {
      const padding = (mapBounds.maxX - mapBounds.minX) * 0.05 // 5% padding
      camera.position.x = Math.max(mapBounds.minX - padding, Math.min(mapBounds.maxX + padding, camera.position.x))
      camera.position.z = Math.max(mapBounds.minY - padding, Math.min(mapBounds.maxY + padding, camera.position.z))
      
      // Clamp height to reasonable range
      const maxHeight = wallHeight.value * 2
      camera.position.y = Math.max(playerHeight * 0.5, Math.min(maxHeight, camera.position.y))
    }
  } else if (orbitControls) {
    orbitControls.update()
  }
  
  // Render main scene
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
  
  // Render mini map
  if (miniMapRenderer && miniMapCamera && scene && showMiniMap.value) {
    miniMapRenderer.render(scene, miniMapCamera)
  }
}

// Handle window resize
const handleResize = () => {
  if (!containerRef.value || !camera || !renderer) return

  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// Handle canvas click for pointer lock
const onCanvasClick = () => {
  if (isWalkMode.value && pointerControls && !isPointerLocked.value) {
    pointerControls.lock()
  }
}

// Set mode (orbit or walk)
const setMode = (mode) => {
  isWalkMode.value = mode === 'walk'
  
  if (isWalkMode.value) {
    // Switch to walk mode
    if (orbitControls) orbitControls.enabled = false
    if (mapBounds) {
      const centerX = (mapBounds.minX + mapBounds.maxX) / 2
      const centerZ = (mapBounds.minY + mapBounds.maxY) / 2
      camera.position.set(centerX, playerHeight, centerZ)
    }
  } else {
    // Switch to orbit mode
    if (pointerControls && isPointerLocked.value) {
      pointerControls.unlock()
    }
    if (orbitControls) orbitControls.enabled = true
    if (mapBounds) centerCamera(mapBounds)
  }
}

// View presets
const setView = (view) => {
  if (!camera || !mapBounds) return

  const centerX = (mapBounds.minX + mapBounds.maxX) / 2
  const centerZ = (mapBounds.minY + mapBounds.maxY) / 2
  const size = Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY)

  currentView.value = view
  setMode('orbit')

  switch (view) {
    case 'top':
      camera.position.set(centerX, size * 1.2, centerZ + 1)
      break
    case 'front':
      camera.position.set(centerX, size * 0.3, centerZ + size)
      break
    case 'perspective':
    default:
      camera.position.set(centerX + size * 0.6, size * 0.5, centerZ + size * 0.6)
      break
  }

  if (orbitControls) {
    orbitControls.target.set(centerX, wallHeight.value / 4, centerZ)
    orbitControls.update()
  }
}

const resetView = () => setView('perspective')

// Detect rooms from map data (based on labels/layer names)
const detectRooms = () => {
  if (!props.mapData?.entities) return []
  
  const detectedRooms = []
  const roomNames = new Set()
  
  // Look for text labels that might indicate rooms
  props.mapData.entities.forEach(entity => {
    if (entity.type === 'text' && entity.text) {
      const text = entity.text.toLowerCase()
      // Common room names
      const roomKeywords = ['bedroom', 'bathroom', 'kitchen', 'living', 'dining', 'garage', 'store', 'lounge', 'hall', 'entrance', 'balcony', 'terrace', 'drawing', 'servant', 'porch', 'lobby', 'corridor']
      
      for (const keyword of roomKeywords) {
        if (text.includes(keyword) && !roomNames.has(text)) {
          roomNames.add(text)
          detectedRooms.push({
            id: `room-${detectedRooms.length}`,
            name: entity.text.slice(0, 15),
            position: entity.position || entity.center || { x: entity.x, y: entity.y }
          })
          break
        }
      }
    }
  })
  
  // If no labeled rooms found, create navigation points based on map quadrants
  if (detectedRooms.length === 0 && mapBounds) {
    const cx = (mapBounds.minX + mapBounds.maxX) / 2
    const cy = (mapBounds.minY + mapBounds.maxY) / 2
    const qw = (mapBounds.maxX - mapBounds.minX) / 4
    const qh = (mapBounds.maxY - mapBounds.minY) / 4
    
    detectedRooms.push(
      { id: 'area-nw', name: 'Area NW', position: { x: cx - qw, y: cy + qh } },
      { id: 'area-ne', name: 'Area NE', position: { x: cx + qw, y: cy + qh } },
      { id: 'area-sw', name: 'Area SW', position: { x: cx - qw, y: cy - qh } },
      { id: 'area-se', name: 'Area SE', position: { x: cx + qw, y: cy - qh } }
    )
  }
  
  return detectedRooms
}

// Teleport camera to a specific room
const teleportToRoom = (room) => {
  if (!camera || !room.position) return
  
  const x = room.position.x
  const z = room.position.y // Y in 2D becomes Z in 3D
  
  if (isWalkMode.value) {
    camera.position.set(x, playerHeight, z)
    console.log('[3DViewer] Teleported to room:', room.name, 'at', x, z)
  } else {
    const size = mapBounds ? Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY) * 0.3 : 500
    camera.position.set(x + size * 0.3, size * 0.4, z + size * 0.3)
    if (orbitControls) {
      orbitControls.target.set(x, wallHeight.value / 4, z)
      orbitControls.update()
    }
  }
}

// Teleport to preset positions
const teleportToPosition = (preset) => {
  if (!camera || !mapBounds) return
  
  const cx = (mapBounds.minX + mapBounds.maxX) / 2
  const cz = (mapBounds.minY + mapBounds.maxY) / 2
  const size = Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY)
  
  let targetX = cx, targetZ = cz
  
  switch (preset) {
    case 'center':
      targetX = cx
      targetZ = cz
      break
    case 'entrance':
      targetX = cx
      targetZ = mapBounds.maxY - size * 0.1 // Bottom center (typical entrance)
      break
    case 'corner1':
      targetX = mapBounds.minX + size * 0.15
      targetZ = mapBounds.minY + size * 0.15
      break
    case 'corner2':
      targetX = mapBounds.maxX - size * 0.15
      targetZ = mapBounds.maxY - size * 0.15
      break
  }
  
  if (isWalkMode.value) {
    camera.position.set(targetX, playerHeight, targetZ)
  } else {
    camera.position.set(targetX + size * 0.3, size * 0.4, targetZ + size * 0.3)
    if (orbitControls) {
      orbitControls.target.set(targetX, wallHeight.value / 4, targetZ)
      orbitControls.update()
    }
  }
  
  console.log('[3DViewer] Teleported to', preset, 'at', targetX, targetZ)
}

// Click on mini-map to teleport
const onMiniMapClick = (event) => {
  if (!mapBounds || !camera) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  
  // Convert click position to world coordinates
  const worldX = mapBounds.minX + (mapBounds.maxX - mapBounds.minX) * x
  const worldZ = mapBounds.minY + (mapBounds.maxY - mapBounds.minY) * (1 - y) // Invert Y
  
  if (isWalkMode.value) {
    camera.position.set(worldX, playerHeight, worldZ)
  } else {
    const size = Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY)
    camera.position.set(worldX + size * 0.2, size * 0.3, worldZ + size * 0.2)
    if (orbitControls) {
      orbitControls.target.set(worldX, wallHeight.value / 4, worldZ)
      orbitControls.update()
    }
  }
  
  console.log('[3DViewer] Mini-map teleport to', worldX.toFixed(0), worldZ.toFixed(0))
}

const updateWallHeight = () => {
  if (!wallMeshes || wallMeshes.length === 0) return
  
  // Get original height from first wall (stored in userData)
  const originalHeight = wallMeshes[0]?.userData?.originalHeight || 280
  const scale = wallHeight.value / originalHeight
  
  wallMeshes.forEach(wall => {
    wall.scale.y = scale
    wall.position.y = wallHeight.value / 2
  })
  if (ceilingMesh) {
    ceilingMesh.position.y = wallHeight.value
  }
}

const updateLighting = () => addLights()
const toggleFloor = () => { if (floorMesh) floorMesh.visible = showFloor.value }
const toggleCeiling = () => { if (ceilingMesh) ceilingMesh.visible = showCeiling.value }
const toggleGrid = () => addGridHelper()
const toggleFurniture = () => {
  furnitureMeshes.forEach(mesh => mesh.visible = showFurniture.value)
}

// Keyboard handlers
const onKeyDown = (event) => {
  if (!isWalkMode.value || !isPointerLocked.value) return
  
  switch (event.code) {
    case 'KeyW': case 'ArrowUp': moveState.forward = true; break
    case 'KeyS': case 'ArrowDown': moveState.backward = true; break
    case 'KeyA': case 'ArrowLeft': moveState.left = true; break
    case 'KeyD': case 'ArrowRight': moveState.right = true; break
    case 'Space':
      if (canJump) {
        // Scale jump based on map size
        const jumpScale = mapBounds ? Math.max(mapBounds.maxX - mapBounds.minX, mapBounds.maxY - mapBounds.minY) / 1000 : 1
        velocity.y += 350 * jumpScale
        canJump = false
      }
      break
    case 'ShiftLeft': case 'ShiftRight': moveState.sprint = true; break
  }
}

const onKeyUp = (event) => {
  switch (event.code) {
    case 'KeyW': case 'ArrowUp': moveState.forward = false; break
    case 'KeyS': case 'ArrowDown': moveState.backward = false; break
    case 'KeyA': case 'ArrowLeft': moveState.left = false; break
    case 'KeyD': case 'ArrowRight': moveState.right = false; break
    case 'ShiftLeft': case 'ShiftRight': moveState.sprint = false; break
  }
}

// Lifecycle
onMounted(async () => {
  console.log('[3DViewer] Component mounted')
  
  await nextTick()
  
  setTimeout(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (initThree()) {
        buildModel()
        animate()
        loading.value = false
      } else {
        error.value = error.value || 'Failed to initialize 3D renderer'
        loading.value = false
      }
    } catch (err) {
      console.error('[3DViewer] Error:', err)
      error.value = err.message
      loading.value = false
    }
  }, 200)

  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
  
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  
  clearMeshes()
  
  if (gridHelper) scene?.remove(gridHelper)
  if (orbitControls) orbitControls.dispose()
  if (pointerControls) pointerControls.dispose()
  if (renderer) renderer.dispose()
  if (miniMapRenderer) miniMapRenderer.dispose()

  scene = null
  camera = null
  renderer = null
})

watch(() => props.mapData, () => {
  if (props.mapData && scene) buildModel()
}, { deep: true })
</script>

<style scoped>
.three-d-viewer {
  width: 100%;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #d1d5db;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: none;
}

select {
  background: white;
}
</style>
