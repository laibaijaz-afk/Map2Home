<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
    <!-- Header -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <router-link to="/dashboard" class="flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <h1 class="text-2xl font-bold text-blue-600">Map2Home</h1>
        </router-link>
        <button
          @click="logout"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Controls Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-lg p-6 sticky top-6">
            <h3 class="text-xl font-bold text-gray-800 mb-6">Map Controls</h3>

            <!-- Location Input -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Location Address
              </label>
              <input
                v-model="mapControls.address"
                type="text"
                class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder=""
              />
            </div>

            <!-- Zoom Level -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Zoom Level: {{ mapControls.zoomLevel }}x
              </label>
              <input
                v-model.number="mapControls.zoomLevel"
                type="range"
                min="1"
                max="20"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <!-- Map Type -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Map Type
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="mapControls.mapType"
                    type="radio"
                    value="satellite"
                    class="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span class="ml-2 text-gray-700 cursor-pointer">Satellite</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="mapControls.mapType"
                    type="radio"
                    value="terrain"
                    class="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span class="ml-2 text-gray-700 cursor-pointer">Terrain</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="mapControls.mapType"
                    type="radio"
                    value="street"
                    class="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span class="ml-2 text-gray-700 cursor-pointer">Street Map</span>
                </label>
              </div>
            </div>

            <!-- Area Selection -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Selection Tool
              </label>
              <div class="space-y-2">
                <button
                  @click="activateTool('rectangle')"
                  :class="['w-full px-4 py-2 rounded-lg font-semibold transition text-left', mapControls.activeTool === 'rectangle' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
                >
                  📐 Rectangle Select
                </button>
                <button
                  @click="activateTool('polygon')"
                  :class="['w-full px-4 py-2 rounded-lg font-semibold transition text-left', mapControls.activeTool === 'polygon' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
                >
                  🔷 Polygon Select
                </button>
                <button
                  @click="activateTool('circle')"
                  :class="['w-full px-4 py-2 rounded-lg font-semibold transition text-left', mapControls.activeTool === 'circle' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200']"
                >
                  ⭕ Circle Select
                </button>
              </div>
            </div>

            <!-- Generate Button -->
            <button
              @click="generateMap"
              :disabled="isGenerating"
              class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isGenerating ? 'Generating...' : 'Generate Partial Map' }}
            </button>

            <!-- Divider -->
            <div class="my-6 border-t border-gray-200"></div>

            <!-- Layer Toggle -->
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Map Layers
              </label>
              <div class="space-y-2">
                <label class="flex items-center">
                  <input
                    v-model="mapControls.layers.roads"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <span class="ml-2 text-gray-700 cursor-pointer">Roads</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="mapControls.layers.buildings"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <span class="ml-2 text-gray-700 cursor-pointer">Buildings</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="mapControls.layers.water"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <span class="ml-2 text-gray-700 cursor-pointer">Water</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="mapControls.layers.vegetation"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <span class="ml-2 text-gray-700 cursor-pointer">Vegetation</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Display Area -->
        <div class="lg:col-span-3">
          <!-- Map Viewer -->
          <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div
              id="mapContainer"
              class="w-full h-96 lg:h-screen bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative"
            >
              <!-- Placeholder Map -->
              <div class="text-center">
                <svg
                  class="w-24 h-24 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 4"
                  />
                </svg>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">2D Map View</h3>
                <p class="text-gray-500 mb-4">Enter an address and click "Generate Partial Map" to view</p>
                <p class="text-sm text-gray-400">Map integration with {{ mapControls.mapType }} view</p>
              </div>

              <!-- Generated Map Info -->
              <transition name="fade">
                <div
                  v-if="mapGenerated"
                  class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center"
                >
                  <div class="bg-white rounded-lg shadow-2xl p-8 text-center">
                    <svg
                      class="w-16 h-16 mx-auto text-green-500 mb-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">Map Generated!</h4>
                    <p class="text-gray-600">{{ mapControls.address }}</p>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Map Details -->
          <transition name="fade">
            <div v-if="mapGenerated" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Map Info Card -->
              <div class="bg-white rounded-lg shadow-lg p-6">
                <h4 class="text-lg font-bold text-gray-800 mb-4">Map Information</h4>
                <div class="space-y-3">
                  <div class="flex justify-between pb-3 border-b border-gray-200">
                    <span class="text-gray-700">Address</span>
                    <span class="font-semibold text-gray-900">{{ mapControls.address }}</span>
                  </div>
                  <div class="flex justify-between pb-3 border-b border-gray-200">
                    <span class="text-gray-700">Map Type</span>
                    <span class="font-semibold text-gray-900 capitalize">{{ mapControls.mapType }}</span>
                  </div>
                  <div class="flex justify-between pb-3 border-b border-gray-200">
                    <span class="text-gray-700">Zoom Level</span>
                    <span class="font-semibold text-gray-900">{{ mapControls.zoomLevel }}x</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-700">Generated</span>
                    <span class="font-semibold text-gray-900">{{ generatedTime }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions Card -->
              <div class="bg-white rounded-lg shadow-lg p-6">
                <h4 class="text-lg font-bold text-gray-800 mb-4">Actions</h4>
                <div class="space-y-3">
                  <button
                    @click="downloadMap"
                    class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Map (PNG)
                  </button>
                  <button
                    @click="shareMap"
                    class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C9.589 12.938 10 12.052 10 11c0-1.657-.895-3-2-3s-2 1.343-2 3 .895 3 2 3c.348 0 .646-.051.924-.154m12.768-6.618A9 9 0 009.002 12c0 .998.158 1.97.46 2.908m0 0a15.326 15.326 0 01-4.77 3.646m16.31-6.554A9.001 9.001 0 009 2.049c-4.418 0-8.402 2.02-11.084 5.099m0 0a15.33 15.33 0 015.3 4.613m11.084-5.099a8.994 8.994 0 01-7.679 3.957" />
                    </svg>
                    Share Map
                  </button>
                  <button
                    @click="printMap"
                    class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm2-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Print Map
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const mapControls = ref({
  address: '',
  zoomLevel: 15,
  mapType: 'satellite',
  activeTool: 'rectangle',
  layers: {
    roads: true,
    buildings: true,
    water: true,
    vegetation: false
  }
})

const mapGenerated = ref(false)
const isGenerating = ref(false)
const generatedTime = ref('')

const activateTool = (tool) => {
  mapControls.value.activeTool = tool
}

const generateMap = async () => {
  if (!mapControls.value.address.trim()) {
    alert('Please enter an address')
    return
  }

  isGenerating.value = true
  try {
    // Simulate API call to generate map
    await new Promise(resolve => setTimeout(resolve, 1500))

    mapGenerated.value = true
    generatedTime.value = new Date().toLocaleString()

    // Save to backend (optional)
    const apiUrl = import.meta.env.VITE_API_URL
    try {
      const response = await fetch(`${apiUrl}/maps/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({
          address: mapControls.value.address,
          zoomLevel: mapControls.value.zoomLevel,
          mapType: mapControls.value.mapType,
          tools: mapControls.value.activeTool,
          layers: mapControls.value.layers
        })
      })
      if (!response.ok) console.error('Failed to save map')
    } catch (error) {
      console.error('Error saving map:', error)
    }
  } catch (error) {
    console.error('Error generating map:', error)
    alert('Error generating map. Please try again.')
  } finally {
    isGenerating.value = false
  }
}

const downloadMap = () => {
  // Create a simple SVG as placeholder
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#e0e7ff"/>
      <text x="400" y="300" font-size="24" text-anchor="middle" fill="#666">
        2D Map: ${mapControls.value.address}
      </text>
      <text x="400" y="340" font-size="16" text-anchor="middle" fill="#999">
        Generated: ${generatedTime.value}
      </text>
    </svg>
  `
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `map-${Date.now()}.svg`
  link.click()
}

const shareMap = () => {
  const text = `Map2Home 2D Map: ${mapControls.value.address}`
  if (navigator.share) {
    navigator.share({
      title: 'Map2Home Map',
      text: text
    })
  } else {
    alert(text)
  }
}

const printMap = () => {
  window.print()
}

const logout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
