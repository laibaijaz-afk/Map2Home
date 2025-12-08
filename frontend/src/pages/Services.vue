<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/10 via-light to-secondary/10 py-12">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Alert notification -->
      <Alert
        v-if="alert.show"
        :type="alert.type"
        :message="alert.message"
        :title="alert.title"
        @close="alert.show = false"
      />

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-dark mb-2">Services & Planning</h1>
        <p class="text-lg text-gray-600">Manage your property planning, visualization, and cost estimation</p>
      </div>

      <!-- Tabs Navigation -->
      <div class="flex gap-4 mb-8 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-semibold transition-colors border-b-2',
            activeTab === tab.id
              ? 'text-primary border-primary'
              : 'text-gray-600 border-transparent hover:text-primary'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content Container -->
      <div class="card min-h-96">
        <!-- 2D Map Tab -->
        <div v-show="activeTab === '2d-map'" class="space-y-6">
          <h2 class="text-2xl font-bold text-dark">2D Floor Plan Editor</h2>

          <!-- Loading State -->
          <div v-if="loading2d" class="flex items-center justify-center py-12">
            <p class="text-gray-600">Loading 2D editor...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error2d" class="bg-red-50 border border-red-200 p-4 rounded">
            <h3 class="text-red-800 font-semibold mb-2">Failed to load 2D editor</h3>
            <p class="text-sm text-red-700 mb-4">{{ error2d }}</p>
            <Button @click="load2dPlan" variant="outline">Retry</Button>
          </div>

          <!-- 2D Editor Content -->
          <div v-else class="space-y-6">
            <!-- Layer Controls -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-dark mb-4">Layer Controls</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="planData.layers.electrical"
                    type="checkbox"
                    class="w-4 h-4 text-primary rounded"
                  />
                  <span class="text-sm font-medium text-dark">Electrical Layer</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="planData.layers.sanitary"
                    type="checkbox"
                    class="w-4 h-4 text-primary rounded"
                  />
                  <span class="text-sm font-medium text-dark">Sanitary Layer</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="planData.layers.ventilation"
                    type="checkbox"
                    class="w-4 h-4 text-primary rounded"
                  />
                  <span class="text-sm font-medium text-dark">Ventilation Layer</span>
                </label>
              </div>
            </div>

            <!-- Canvas for 2D Floor Plan Editor -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white min-h-96 flex flex-col items-center justify-center">
              <div class="text-center">
                <p class="text-gray-600 font-medium mb-2">2D Floor Plan Editor</p>
                <p class="text-sm text-gray-500 mb-4">
                  Canvas area for editable floor plan
                </p>
                <div class="flex gap-2 justify-center flex-wrap">
                  <span v-if="planData.layers.electrical" class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                    ⚡ Electrical
                  </span>
                  <span v-if="planData.layers.sanitary" class="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    💧 Sanitary
                  </span>
                  <span v-if="planData.layers.ventilation" class="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                    🌀 Ventilation
                  </span>
                </div>
              </div>
            </div>

            <!-- Plan Metadata -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-dark mb-4">Plan Metadata</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">Plan Name</label>
                  <input
                    v-model="planData.name"
                    type="text"
                    placeholder=""
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1">Dimensions (m²)</label>
                  <input
                    v-model.number="planData.area"
                    type="number"
                    placeholder=""
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    v-model="planData.description"
                    placeholder=""
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t">
              <Button @click="updatePlan" variant="primary">Save Plan</Button>
              <Button @click="resetPlan" variant="outline">Reset</Button>
            </div>
          </div>
        </div>

        <!-- 3D Visualization Tab -->
        <div v-show="activeTab === '3d-viz'" class="space-y-6">
          <h2 class="text-2xl font-bold text-dark">3D Visualization</h2>

          <!-- Loading State -->
          <div v-if="loading3d" class="flex items-center justify-center py-12">
            <p class="text-gray-600">Loading 3D visualization...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error3d" class="bg-red-50 border border-red-200 p-4 rounded">
            <h3 class="text-red-800 font-semibold mb-2">Failed to load 3D visualization</h3>
            <p class="text-sm text-red-700 mb-4">{{ error3d }}</p>
            <Button @click="load3dModel" variant="outline">Retry</Button>
          </div>

          <!-- 3D Viewer -->
          <div v-else class="space-y-6">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white min-h-96 flex flex-col items-center justify-center">
              <div class="text-center">
                <p class="text-gray-600 font-medium mb-2">3D Model Viewer</p>
                <p class="text-sm text-gray-500 mb-4">
                  Interactive 3D visualization area
                </p>
              </div>
            </div>

            <!-- Model Controls -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-dark mb-4">Model Settings</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">Rotation</label>
                  <input
                    v-model.number="modelData.rotation"
                    type="range"
                    min="0"
                    max="360"
                    class="w-full"
                  />
                  <span class="text-xs text-gray-500">{{ modelData.rotation }}°</span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">Zoom</label>
                  <input
                    v-model.number="modelData.zoom"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    class="w-full"
                  />
                  <span class="text-xs text-gray-500">{{ (modelData.zoom * 100).toFixed(0) }}%</span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">Lighting</label>
                  <select
                    v-model="modelData.lighting"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="day">Day</option>
                    <option value="night">Night</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Model Info -->
            <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p class="text-sm text-blue-800">
                <strong>Model Status:</strong> Ready to render ({{ modelData.status }})
              </p>
            </div>
          </div>
        </div>

        <!-- Cost Estimation Tab -->
        <div v-show="activeTab === 'cost'" class="space-y-6">
          <h2 class="text-2xl font-bold text-dark">Cost Estimation</h2>

          <!-- Loading State -->
          <div v-if="loadingCost" class="flex items-center justify-center py-12">
            <p class="text-gray-600">Calculating costs...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="errorCost" class="bg-red-50 border border-red-200 p-4 rounded">
            <h3 class="text-red-800 font-semibold mb-2">Failed to calculate costs</h3>
            <p class="text-sm text-red-700 mb-4">{{ errorCost }}</p>
            <Button @click="calculateCosts" variant="outline">Retry</Button>
          </div>

          <!-- Cost Estimation Content -->
          <div v-else class="space-y-6">
            <!-- Cost Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Base Cost -->
              <div class="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Base Cost (per m²)</h3>
                <p class="text-3xl font-bold text-primary">
                  ${{ costData.baseCostPerSqm.toFixed(2) }}
                </p>
                <p class="text-xs text-gray-500 mt-2">Area: {{ planData.area }} m²</p>
              </div>

              <!-- Total Base Cost -->
              <div class="bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 rounded-lg border border-secondary/20">
                <h3 class="text-sm font-medium text-gray-600 mb-2">Total Base Cost</h3>
                <p class="text-3xl font-bold text-secondary">
                  ${{ totalBaseCost.toFixed(2) }}
                </p>
                <p class="text-xs text-gray-500 mt-2">For {{ planData.area }} m²</p>
              </div>
            </div>

            <!-- Layer Costs -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-semibold text-dark mb-4">Cost Breakdown by Layer</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <div class="flex items-center gap-3">
                    <span class="text-yellow-500">⚡</span>
                    <div>
                      <p class="font-medium text-dark">Electrical Installation</p>
                      <p class="text-xs text-gray-500" v-if="planData.layers.electrical">Included in plan</p>
                      <p class="text-xs text-gray-400" v-else>Not selected</p>
                    </div>
                  </div>
                  <p class="font-semibold" :class="planData.layers.electrical ? 'text-primary' : 'text-gray-400'">
                    ${{ planData.layers.electrical ? costData.electricalCost.toFixed(2) : '0.00' }}
                  </p>
                </div>

                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <div class="flex items-center gap-3">
                    <span class="text-blue-500">💧</span>
                    <div>
                      <p class="font-medium text-dark">Sanitary System</p>
                      <p class="text-xs text-gray-500" v-if="planData.layers.sanitary">Included in plan</p>
                      <p class="text-xs text-gray-400" v-else>Not selected</p>
                    </div>
                  </div>
                  <p class="font-semibold" :class="planData.layers.sanitary ? 'text-primary' : 'text-gray-400'">
                    ${{ planData.layers.sanitary ? costData.sanitaryCost.toFixed(2) : '0.00' }}
                  </p>
                </div>

                <div class="flex justify-between items-center p-3 bg-white rounded border">
                  <div class="flex items-center gap-3">
                    <span class="text-green-500">🌀</span>
                    <div>
                      <p class="font-medium text-dark">Ventilation System</p>
                      <p class="text-xs text-gray-500" v-if="planData.layers.ventilation">Included in plan</p>
                      <p class="text-xs text-gray-400" v-else>Not selected</p>
                    </div>
                  </div>
                  <p class="font-semibold" :class="planData.layers.ventilation ? 'text-primary' : 'text-gray-400'">
                    ${{ planData.layers.ventilation ? costData.ventilationCost.toFixed(2) : '0.00' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Total Cost -->
            <div class="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-lg">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Estimated Total Cost</h3>
                <p class="text-3xl font-bold">${{ totalCost.toFixed(2) }}</p>
              </div>
              <p class="text-sm text-white/80">
                Based on {{ planData.area }} m² with {{ selectedLayersCount }} active layer(s)
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4 border-t">
              <Button @click="downloadEstimate" variant="primary">Download Estimate</Button>
              <Button @click="requestQuote" variant="outline">Request Quote</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Services.vue
 *
 * Purpose:
 * - Provides three main services: 2D Floor Plan editing, 3D Visualization, and Cost Estimation
 * - Manages state for editable floor plans with layer support (Electrical, Sanitary, Ventilation)
 * - Calculates and displays cost estimates based on plan data and selected layers
 * - Allows users to switch between tabs and interact with each service
 *
 * Key Features:
 * - Tab-based navigation (2D, 3D, Cost)
 * - Layer toggle controls for 2D planning
 * - Real-time cost calculation based on active layers
 * - 3D viewer controls (rotation, zoom, lighting)
 * - Loading, error, and empty states for each tab
 * - Reusable Alert and Button components
 *
 * Uses Vue 3 Composition API with <script setup> syntax.
 */

import { ref, computed, onMounted } from 'vue'
import Button from '../components/Button.vue'
import Alert from '../components/Alert.vue'

// ===== Constants =====
const tabs = [
  { id: '2d-map', label: '2D Floor Plan' },
  { id: '3d-viz', label: '3D Visualization' },
  { id: 'cost', label: 'Cost Estimation' }
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ===== Reactive State =====

// Tab state
const activeTab = ref('2d-map')

// Alert state
const alert = ref({ show: false, type: 'info', title: '', message: '' })

// 2D Plan state
const loading2d = ref(false)
const error2d = ref(null)
const planData = ref({
  id: null,
  name: '',
  area: 0,
  description: '',
  layers: {
    electrical: false,
    sanitary: false,
    ventilation: false
  }
})

// 3D Model state
const loading3d = ref(false)
const error3d = ref(null)
const modelData = ref({
  id: null,
  status: 'ready',
  rotation: 45,
  zoom: 1,
  lighting: 'studio'
})

// Cost Estimation state
const loadingCost = ref(false)
const errorCost = ref(null)
const costData = ref({
  baseCostPerSqm: 150,
  electricalCost: 5000,
  sanitaryCost: 8000,
  ventilationCost: 3500
})

// ===== Computed Properties =====

/**
 * totalBaseCost: Calculate total base cost from area and per-unit cost
 */
const totalBaseCost = computed(() => {
  return planData.value.area * costData.value.baseCostPerSqm
})

/**
 * selectedLayersCount: Count how many layers are currently selected
 */
const selectedLayersCount = computed(() => {
  return Object.values(planData.value.layers).filter(Boolean).length
})

/**
 * totalCost: Calculate total cost including all selected layers
 */
const totalCost = computed(() => {
  let total = totalBaseCost.value

  if (planData.value.layers.electrical) {
    total += costData.value.electricalCost
  }
  if (planData.value.layers.sanitary) {
    total += costData.value.sanitaryCost
  }
  if (planData.value.layers.ventilation) {
    total += costData.value.ventilationCost
  }

  return total
})

// ===== Methods =====

/**
 * load2dPlan: Fetch 2D plan data from backend (optional)
 * Currently loads default data; in production, fetch from API
 */
const load2dPlan = async () => {
  loading2d.value = true
  error2d.value = null

  try {
    // Simulated load; in production, call backend API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Plan data already initialized in ref above
    // No automatic success notification on page load
  } catch (err) {
    error2d.value = err.message || 'Failed to load 2D plan'
  } finally {
    loading2d.value = false
  }
}

/**
 * updatePlan: Save edited 2D plan to backend or local state
 * Validates plan data before saving
 */
const updatePlan = async () => {
  // Validate plan
  if (!planData.value.name || planData.value.name.trim() === '') {
    alert.value = { show: true, type: 'error', title: 'Error', message: 'Plan name is required' }
    return
  }
  if (planData.value.area <= 0) {
    alert.value = { show: true, type: 'error', title: 'Error', message: 'Area must be greater than 0' }
    return
  }

  try {
    loading2d.value = true

    // In production, send to backend: POST /api/plans or PUT /api/plans/:id
    // const response = await axios.post(`${API_URL}/plans`, planData.value)
    // planData.value.id = response.data.id

    await new Promise(resolve => setTimeout(resolve, 500))

    alert.value = {
      show: true,
      type: 'success',
      title: 'Plan Saved',
      message: `Floor plan "${planData.value.name}" saved successfully`
    }

    // Recalculate costs when plan changes
    await calculateCosts()
  } catch (err) {
    alert.value = { show: true, type: 'error', title: 'Error', message: err.message || 'Failed to save plan' }
  } finally {
    loading2d.value = false
  }
}

/**
 * resetPlan: Reset plan data to defaults
 */
const resetPlan = () => {
  planData.value = {
    id: null,
    name: '',
    area: 0,
    description: '',
    layers: {
      electrical: false,
      sanitary: false,
      ventilation: false
    }
  }
  alert.value = { show: true, type: 'info', title: 'Reset', message: 'Plan reset to defaults' }
}

/**
 * load3dModel: Fetch 3D model data from backend
 * Currently loads default data; in production, fetch model file/metadata from API
 */
const load3dModel = async () => {
  loading3d.value = true
  error3d.value = null

  try {
    // Simulated load; in production, fetch 3D model from backend
    await new Promise(resolve => setTimeout(resolve, 500))

    // No automatic success notification on page load
  } catch (err) {
    error3d.value = err.message || 'Failed to load 3D model'
  } finally {
    loading3d.value = false
  }
}

/**
 * calculateCosts: Fetch or recalculate cost estimation based on current plan
 */
const calculateCosts = async () => {
  loadingCost.value = true
  errorCost.value = null

  try {
    // In production, send plan data to backend for cost calculation
    // const response = await axios.post(`${API_URL}/costs/estimate`, {
    //   area: planData.value.area,
    //   layers: planData.value.layers
    // })
    // costData.value = response.data

    await new Promise(resolve => setTimeout(resolve, 300))

    // No automatic success notification on page load
  } catch (err) {
    errorCost.value = err.message || 'Failed to calculate costs'
  } finally {
    loadingCost.value = false
  }
}

/**
 * downloadEstimate: Generate and download cost estimate as PDF/CSV
 */
const downloadEstimate = () => {
  const estimateData = {
    planName: planData.value.name,
    area: planData.value.area,
    baseCost: totalBaseCost.value,
    electricalCost: planData.value.layers.electrical ? costData.value.electricalCost : 0,
    sanitaryCost: planData.value.layers.sanitary ? costData.value.sanitaryCost : 0,
    ventilationCost: planData.value.layers.ventilation ? costData.value.ventilationCost : 0,
    totalCost: totalCost.value,
    timestamp: new Date().toISOString()
  }

  // In production, send to backend to generate PDF or CSV file
  // const response = await axios.post(`${API_URL}/estimates/download`, estimateData)

  console.log('Estimate download:', estimateData)
  alert.value = {
    show: true,
    type: 'info',
    title: 'Download',
    message: `Estimate for "${planData.value.name}" prepared for download`
  }
}

/**
 * requestQuote: Send a quote request to backend with current plan data
 */
const requestQuote = async () => {
  try {
    const quoteRequest = {
      planName: planData.value.name,
      area: planData.value.area,
      description: planData.value.description,
      layers: planData.value.layers,
      estimatedCost: totalCost.value
    }

    // In production, send to backend: POST /api/quotes
    // const response = await axios.post(`${API_URL}/quotes`, quoteRequest)

    console.log('Quote request:', quoteRequest)

    alert.value = {
      show: true,
      type: 'success',
      title: 'Quote Requested',
      message: 'Your quote request has been submitted. We\'ll contact you soon.'
    }
  } catch (err) {
    alert.value = {
      show: true,
      type: 'error',
      title: 'Error',
      message: err.message || 'Failed to submit quote request'
    }
  }
}

// ===== Lifecycle =====

/**
 * onMounted: Initialize component by loading data for all tabs
 */
onMounted(async () => {
  await Promise.all([load2dPlan(), load3dModel(), calculateCosts()])
})
</script>

<style scoped>
/**
 * Component-scoped styles using Tailwind + custom CSS
 * Most styling is provided by Tailwind utility classes in the template
 */

/* Custom styles for tab highlighting */
button[class*="border-primary"] {
  @apply transition-all duration-200;
}

/* Input focus states */
input[type="text"],
input[type="number"],
textarea,
select {
  @apply focus:outline-none focus:ring-2 focus:ring-primary/50;
}

/* Card shadow and rounded corners */
.card {
  @apply shadow-sm rounded-lg border border-gray-200 bg-white;
}
</style>
