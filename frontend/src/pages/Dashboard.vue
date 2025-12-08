<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-light to-white py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">Welcome back, {{ userName }}!</h1>
        <p class="text-gray-600">Here's your dashboard</p>
      </div>

      <!-- User Profile Section -->
      <div class="glass rounded-3xl p-6 md:p-8 mb-8">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {{ userInitial }}
          </div>
          <div class="flex-1">
            <h3 class="text-2xl md:text-3xl font-extrabold text-gray-900">{{ userName }}</h3>
            <p class="text-gray-600 mb-2">{{ userEmail }}</p>
            <div class="mt-2">
              <span v-if="isVerified" class="inline-flex items-center px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">
                <svg class="w-4 h-4 mr-1 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Verified
              </span>
            </div>
          </div>
          <div class="mt-4 md:mt-0">
            <RouterLink to="/dashboard" class="btn-outline">Go to Dashboard</RouterLink>
          </div>
        </div>
      </div>

      <!-- Services & Planning Section -->
      <div class="glass rounded-3xl p-6 md:p-8 mb-8">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Services & Planning</h1>
            <p class="text-gray-600">Manage your property planning, visualization, and cost estimation</p>
          </div>
          <RouterLink to="/" class="btn-primary">View All Services</RouterLink>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-8">
          <div class="flex gap-8">
            <button
              @click="activeTab = '2d'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2',
                activeTab === '2d'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              ]"
            >
              2D Floor Plan
            </button>
            <button
              @click="activeTab = '3d'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2',
                activeTab === '3d'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              ]"
            >
              3D Visualization
            </button>
            <button
              @click="activeTab = 'cost'"
              :class="[
                'pb-4 px-2 font-medium text-base transition-colors border-b-2',
                activeTab === 'cost'
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              ]"
            >
              Cost Estimation
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div>
          <!-- 2D Floor Plan Tab -->
          <div v-if="activeTab === '2d'" class="space-y-6">
            <!-- Room Dimensions Form -->
            <div class="max-w-4xl mx-auto">
              <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">Enter Your Room Dimensions</h2>
              
              <div class="card rounded-2xl p-6 md:p-8 space-y-6">
                <!-- Room Dimensions Section -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Room Length -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Room Length (in feet)</label>
                    <input
                      v-model.number="roomDimensions.length"
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="Enter length"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <!-- Room Width -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Room Width (in feet)</label>
                    <input
                      v-model.number="roomDimensions.width"
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="Enter width"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <!-- Room Specifications Section -->
                <div class="border-t pt-6">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">Room Specifications</h3>
                  </div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <!-- Bedrooms -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                      <input
                        v-model.number="roomSpecifications.bedrooms"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Bathrooms -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                      <input
                        v-model.number="roomSpecifications.bathrooms"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Kitchen -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Kitchen</label>
                      <input
                        v-model.number="roomSpecifications.kitchen"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Drawing Room -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Drawing Room</label>
                      <input
                        v-model.number="roomSpecifications.drawingRoom"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Dining Room -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Dining Room</label>
                      <input
                        v-model.number="roomSpecifications.diningRoom"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Store Room -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Store Room</label>
                      <input
                        v-model.number="roomSpecifications.storeRoom"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Garage (Cars) -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Garage (Cars)</label>
                      <input
                        v-model.number="roomSpecifications.garage"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- Servant Quarter -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Servant Quarter</label>
                      <input
                        v-model.number="roomSpecifications.servantQuarter"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <!-- TV Lounge -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">TV Lounge</label>
                      <input
                        v-model.number="roomSpecifications.tvLounge"
                        type="number"
                        min="0"
                        placeholder="0"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                <!-- Generate Maps Button -->
                <div class="pt-4 border-t">
                  <button
                    @click="generateMaps"
                    :disabled="!canGenerateMaps || generatingMaps"
                    class="w-full btn-primary"
                  >
                    <span v-if="generatingMaps" class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Maps...
                    </span>
                    <span v-else>Generate Maps</span>
                  </button>
                </div>
              </div>

              <!-- Maps Display Area (only shown after generation) -->
              <div v-if="generatedMaps.length > 0" class="mt-8 space-y-6">
                <h3 class="text-2xl font-bold text-gray-800 text-center">Available Maps</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div
                    v-for="(map, index) in generatedMaps"
                    :key="map.id || index"
                    class="card overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <!-- Map Image -->
                    <div class="aspect-video bg-gray-100 overflow-hidden">
                      <img
                        v-if="map.file_path"
                        :src="map.file_path"
                        :alt="map.title"
                        class="w-full h-full object-cover"
                        @error="handleImageError($event)"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
                        <p class="text-gray-400 text-sm">No image available</p>
                      </div>
                    </div>
                    
                    <!-- Map Info -->
                    <div class="p-4">
                      <div class="flex items-center justify-between mb-2">
                        <h4 class="text-lg font-semibold text-gray-800">{{ map.title }}</h4>
                        <span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                          {{ formatRoomType(map.room_type) }}
                        </span>
                      </div>
                      <p v-if="map.description" class="text-sm text-gray-600 mt-2">{{ map.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Maps Message -->
              <div v-else-if="!generatingMaps && generatedMaps.length === 0 && (roomDimensions.length || roomDimensions.width)" class="mt-8 text-center py-8">
                <p class="text-gray-500">No maps found for the specified room specifications.</p>
              </div>
            </div>
          </div>

          <!-- 3D Visualization Tab -->
          <div v-if="activeTab === '3d'" class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-800">3D Visualization</h2>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">3D Model Viewer</h3>
              <p class="text-gray-500 mb-4">Interactive 3D visualization area</p>
              <p class="text-sm text-gray-400">In production, integrate with Three.js or Babylon.js for real-time 3D rendering</p>
            </div>

            <!-- Model Settings -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-6">Model Settings</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Rotation -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Rotation</label>
                  <input type="range" min="0" max="360" v-model="rotation" class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer">
                  <p class="text-sm text-gray-600 mt-1">{{ rotation }}°</p>
                </div>

                <!-- Zoom -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Zoom</label>
                  <input type="range" min="50" max="200" v-model="zoom" class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer">
                  <p class="text-sm text-gray-600 mt-1">{{ zoom }}%</p>
                </div>

                <!-- Lighting -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Lighting</label>
                  <select v-model="lighting" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Studio</option>
                    <option>Natural</option>
                    <option>Sunset</option>
                    <option>Night</option>
                  </select>
                </div>
              </div>

              <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-800"><strong>Model Status:</strong> Ready to render (ready)</p>
              </div>
            </div>
          </div>

          <!-- Cost Estimation Tab -->
          <div v-if="activeTab === 'cost'" class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-800">Cost Estimation</h2>
            
            <!-- Cost Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-indigo-50 rounded-lg p-6">
                <p class="text-sm text-gray-600 mb-1">Base Cost (per m²)</p>
                <p class="text-4xl font-bold text-indigo-600 mb-2">Rs 0.00</p>
                <p class="text-sm text-gray-500">Area: 0 m²</p>
              </div>

              <div class="bg-purple-50 rounded-lg p-6">
                <p class="text-sm text-gray-600 mb-1">Total Base Cost</p>
                <p class="text-4xl font-bold text-purple-600 mb-2">Rs 0.00</p>
                <p class="text-sm text-gray-500">For 0 m²</p>
              </div>
            </div>

            <!-- Estimated Total Cost -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-lg font-medium mb-1">Estimated Total Cost</p>
                  <p class="text-sm opacity-90">Based on 0 m² with 0 active layer(s)</p>
                </div>
                <p class="text-5xl font-bold">Rs 0.00</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
              <button class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                Download Estimate
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Section -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-6">Share Your Feedback</h3>
        <FeedbackForm />
        <div class="mt-8">
          <h4 class="text-xl font-semibold text-gray-800 mb-4">Recent Feedback</h4>
          <FeedbackList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import FeedbackForm from '../components/FeedbackForm.vue'
import FeedbackList from '../components/FeedbackList.vue'

const authStore = useAuthStore()
const route = useRoute()

// Active tab state - set to '2d' if route is design-2d-map, otherwise default to 'cost'
const activeTab = ref(route.name === 'design-2d-map' ? '2d' : 'cost')

// Watch for route changes to update active tab
watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'design-2d-map') {
    activeTab.value = '2d'
  }
})

// 3D Model settings
const rotation = ref(45)
const zoom = ref(100)
const lighting = ref('Studio')

// 2D Map Design state
const roomDimensions = ref({
  length: null,
  width: null
})

const roomSpecifications = ref({
  bedrooms: null,
  bathrooms: null,
  kitchen: null,
  drawingRoom: null,
  diningRoom: null,
  storeRoom: null,
  garage: null,
  servantQuarter: null,
  tvLounge: null
})

const generatingMaps = ref(false)
const generatedMaps = ref([])

// User profile computed properties
const userName = computed(() => authStore.user?.name || 'User')
const userEmail = computed(() => authStore.user?.email || 'user@example.com')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const isVerified = computed(() => authStore.user?.is_verified === 1)

// Check if form can be submitted
const canGenerateMaps = computed(() => {
  return roomDimensions.value.length > 0 &&
         roomDimensions.value.width > 0
})

// Generate maps function
const generateMaps = async () => {
  if (!canGenerateMaps.value) {
    return
  }

  generatingMaps.value = true
  generatedMaps.value = []

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = localStorage.getItem('token')

    // Send dimensions and room specifications to backend
    const response = await fetch(`${API_URL}/maps/generate-2d`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        length: roomDimensions.value.length,
        width: roomDimensions.value.width,
        roomSpecifications: {
          bedrooms: roomSpecifications.value.bedrooms || 0,
          bathrooms: roomSpecifications.value.bathrooms || 0,
          kitchen: roomSpecifications.value.kitchen || 0,
          drawingRoom: roomSpecifications.value.drawingRoom || 0,
          diningRoom: roomSpecifications.value.diningRoom || 0,
          storeRoom: roomSpecifications.value.storeRoom || 0,
          garage: roomSpecifications.value.garage || 0,
          servantQuarter: roomSpecifications.value.servantQuarter || 0,
          tvLounge: roomSpecifications.value.tvLounge || 0
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch maps')
    }

    const data = await response.json()
    
    // Store generated maps from backend
    if (data.success && data.maps && Array.isArray(data.maps)) {
      generatedMaps.value = data.maps
    } else {
      generatedMaps.value = []
    }
  } catch (error) {
    console.error('Error generating maps:', error)
    generatedMaps.value = []
  } finally {
    generatingMaps.value = false
  }
}

// Helper function to format room type for display
const formatRoomType = (roomType) => {
  if (!roomType) return ''
  return roomType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Handle image loading errors
const handleImageError = (event) => {
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent && !parent.querySelector('.error-placeholder')) {
    const placeholder = document.createElement('div')
    placeholder.className = 'error-placeholder w-full h-full flex items-center justify-center bg-gray-100'
    placeholder.innerHTML = '<p class="text-gray-400 text-sm">Image not found</p>'
    parent.appendChild(placeholder)
  }
}
</script>

<style scoped>
/* Minimal styles - most styling is done via Tailwind classes */
</style>
