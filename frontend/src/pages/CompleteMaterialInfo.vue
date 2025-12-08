<template>
  <div class="min-h-screen py-8 relative overflow-hidden">
    <!-- Construction Site Background -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-20">
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'); filter: grayscale(30%) brightness(1.1);"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-br from-wood-50/60 via-wood-100/50 to-construction-50/60"></div>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 relative z-20">
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-construction-500 to-construction-600 rounded-2xl shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-wood-800 via-construction-600 to-wood-700 bg-clip-text text-transparent">
          Complete Material Info
        </h1>
        <p class="text-xl text-wood-700 mb-6">Detailed breakdown of all construction materials by category</p>
        <RouterLink
          to="/cost-estimation"
          class="inline-flex items-center gap-2 px-6 py-3 bg-wood-600 hover:bg-wood-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Cost Estimation
        </RouterLink>
      </div>

      <!-- Material Breakdown Cards by Category - Vertical Stack -->
      <div v-if="materialCategories && materialCategories.length > 0" class="space-y-6">
        <!-- Header with Total -->
        <div class="construction-card p-6 bg-gradient-to-r from-construction-500 to-construction-600">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-extrabold text-white mb-1">Material Breakdown by Category</h3>
              <p class="text-wood-100 text-sm">Complete breakdown of all construction materials</p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-extrabold text-white">{{ formatCurrencyInLakhs(totalMaterialCost) }}</p>
              <p class="text-wood-100 text-xs mt-1">Total Material Cost</p>
            </div>
          </div>
        </div>

        <!-- Category Cards Stacked Vertically -->
        <div 
          v-for="category in materialCategories" 
          :key="category.id"
          class="construction-card p-0 overflow-hidden"
        >
          <!-- Category Header -->
          <div class="bg-gradient-to-r from-wood-50 to-wood-100 px-6 py-5 border-b-2 border-wood-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div :class="getCategoryIconBg(category.id)" class="w-12 h-12 rounded-lg flex items-center justify-center shadow-md">
                  <svg v-if="category.id === 'foundation'" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  <svg v-else-if="category.id === 'wood-metal-tile'" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <svg v-else-if="category.id === 'electrical'" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <svg v-else-if="category.id === 'plumbing'" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                  <svg v-else-if="category.id === 'fittings'" class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-wood-900 mb-1">{{ category.name }}</h3>
                  <p class="text-sm text-wood-700">{{ category.description }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-3xl font-extrabold text-construction-600">{{ formatCurrencyInLakhs(category.total) }}</p>
                <p class="text-xs text-wood-600 mt-1">Category Total</p>
              </div>
            </div>
          </div>

          <!-- Materials Table Section -->
          <div v-if="category.materials && category.materials.length > 0" class="px-6 py-5 bg-gray-50">
            <!-- Table -->
            <div class="bg-white rounded-lg overflow-hidden border border-wood-200 shadow-sm">
              <table class="w-full">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">ITEM</th>
                    <th class="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">RATE</th>
                    <th class="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">QUANTITY</th>
                    <th class="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">COST</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr 
                    v-for="(material, index) in category.materials" 
                    :key="index"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900">
                      {{ material.name }}
                      <span v-if="material.name === 'Bricks' || material.name.toLowerCase().includes('brick')" class="text-gray-600 font-normal"> + Rorhi</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 text-right">
                      {{ formatCurrency(material.unitPrice) }}/{{ material.unit }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 text-right">
                      {{ formatNumber(material.quantity) }}
                    </td>
                    <td class="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                      {{ formatCurrency(material.totalPrice) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          
            <!-- Category Total Row -->
            <div class="mt-4 pt-4 border-t-2 border-gray-300 bg-white rounded-lg px-4 py-3 flex justify-between items-center shadow-sm">
              <span class="text-base font-extrabold text-gray-900">{{ category.name }} Total</span>
              <span class="text-xl font-extrabold text-construction-600">{{ formatCurrencyInLakhs(category.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-construction-500 border-t-transparent mx-auto mb-4"></div>
          <p class="text-wood-700 font-semibold">Loading material information...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="construction-card p-6 text-center">
        <svg class="w-16 h-16 text-wood-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-xl font-bold text-wood-800 mb-2">No Material Information Available</h3>
        <p class="text-wood-600 mb-6">Please calculate a cost estimation first to view material breakdown.</p>
        <RouterLink
          to="/cost-estimation"
          class="inline-flex items-center gap-2 px-6 py-3 btn-primary"
        >
          Go to Cost Estimation
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

const route = useRoute()
const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const materialCategories = ref([])
const totalMaterialCost = ref(0)
const loading = ref(true)

// Helper function to format currency in Lakhs
const formatCurrencyInLakhs = (value) => {
  if (!value || isNaN(value)) return '0.00 Lakh'
  const lakhs = value / 100000
  return `${lakhs.toFixed(2)} Lakh`
}

// Helper function to format numbers with commas
const formatNumber = (value) => {
  if (!value || isNaN(value)) return '0'
  return parseFloat(value).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

// Helper function to format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0
  }).format(value)
}

// Helper function to get icon background class for category
const getCategoryIconBg = (categoryId) => {
  const bgClasses = {
    'foundation': 'bg-gradient-to-br from-construction-500 to-construction-600',
    'wood-metal-tile': 'bg-gradient-to-br from-wood-600 to-wood-700',
    'electrical': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'plumbing': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'fittings': 'bg-gradient-to-br from-purple-500 to-purple-600'
  }
  return bgClasses[categoryId] || 'bg-gradient-to-br from-gray-500 to-gray-600'
}

// Helper function to categorize materials
const getMaterialCategories = (materialBreakdown, featureBreakdown) => {
  if (!materialBreakdown || !Array.isArray(materialBreakdown)) return []
  
  const categories = []
  
  // 1. Foundation & Structure
  const foundationMaterials = materialBreakdown.filter(m => {
    const name = m.name.toLowerCase()
    return name.includes('cement') || name.includes('brick') || name.includes('sand') || 
           name.includes('gravel') || name.includes('crush') || name.includes('stone') ||
           name.includes('steel') || name.includes('reinforcement')
  })
  if (foundationMaterials.length > 0) {
    const total = foundationMaterials.reduce((sum, m) => sum + (m.totalPrice || 0), 0)
    categories.push({
      id: 'foundation',
      name: 'Foundation & Structure',
      description: 'Foundation & Structure includes materials for the basic house structure including foundation, floors, walls, roofing, and plastering.',
      materials: foundationMaterials,
      total: total
    })
  }
  
  // 2. Wood Metal and Tile Work
  const woodMetalTileMaterials = materialBreakdown.filter(m => {
    const name = m.name.toLowerCase()
    return name.includes('tile') || name.includes('paint') || name.includes('glass') || 
           name.includes('aluminum') || name.includes('wood')
  })
  if (woodMetalTileMaterials.length > 0) {
    const total = woodMetalTileMaterials.reduce((sum, m) => sum + (m.totalPrice || 0), 0)
    categories.push({
      id: 'wood-metal-tile',
      name: 'Wood Metal and Tile Work',
      description: 'Wood Metal and Tile Work includes finishing materials like tiles, paint, glass, aluminum windows/doors, and woodwork.',
      materials: woodMetalTileMaterials,
      total: total
    })
  }
  
  // 3. Electrical Work
  const electricalMaterials = materialBreakdown.filter(m => {
    const name = m.name.toLowerCase()
    return name.includes('electrical') || name.includes('wire')
  })
  if (electricalMaterials.length > 0) {
    const total = electricalMaterials.reduce((sum, m) => sum + (m.totalPrice || 0), 0)
    categories.push({
      id: 'electrical',
      name: 'Electrical Work',
      description: 'Electrical Work includes all electrical wiring, cables, and related materials for power distribution throughout the house.',
      materials: electricalMaterials,
      total: total
    })
  }
  
  // 4. Plumbing Work
  const plumbingMaterials = materialBreakdown.filter(m => {
    const name = m.name.toLowerCase()
    return name.includes('plumbing') || name.includes('pipe')
  })
  if (plumbingMaterials.length > 0) {
    const total = plumbingMaterials.reduce((sum, m) => sum + (m.totalPrice || 0), 0)
    categories.push({
      id: 'plumbing',
      name: 'Plumbing Work',
      description: 'Plumbing Work includes all pipes, fittings, and materials required for water supply and drainage systems.',
      materials: plumbingMaterials,
      total: total
    })
  }
  
  // 5. Fitting and Fixtures (from feature breakdown)
  if (featureBreakdown && Array.isArray(featureBreakdown) && featureBreakdown.length > 0) {
    const total = featureBreakdown.reduce((sum, f) => sum + (f.totalPrice || 0), 0)
    categories.push({
      id: 'fittings',
      name: 'Fitting and Fixtures',
      description: 'Fitting and Fixtures includes boundary walls, gates, electrical fixtures, plumbing fixtures, and other installations.',
      materials: featureBreakdown.map(f => ({
        name: f.name,
        quantity: f.quantity,
        unit: f.unit,
        unitPrice: f.unitPrice,
        totalPrice: f.totalPrice
      })),
      total: total
    })
  }
  
  return categories
}

// Load material data from route params or localStorage
onMounted(async () => {
  loading.value = true
  
  try {
    // Try to get from route query params first
    const estimateId = route.query.estimateId
    
    if (estimateId) {
      // Fetch estimate from API
      const response = await axios.get(
        `${API_URL}/cost-estimation/${estimateId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )
      
      if (response.data.success && response.data.estimate) {
        const estimate = response.data.estimate
        materialCategories.value = getMaterialCategories(
          estimate.materialBreakdown || [],
          estimate.featureBreakdown || []
        )
        totalMaterialCost.value = estimate.materialBreakdownTotal || estimate.materialCost || 0
      }
    } else {
      // Try to get from localStorage (from cost estimation page)
      const storedEstimate = localStorage.getItem('lastEstimate')
      if (storedEstimate) {
        try {
          const estimate = JSON.parse(storedEstimate)
          materialCategories.value = getMaterialCategories(
            estimate.materialBreakdown || [],
            estimate.featureBreakdown || []
          )
          totalMaterialCost.value = estimate.materialBreakdownTotal || estimate.materialCost || 0
        } catch (e) {
          console.error('Error parsing stored estimate:', e)
        }
      }
    }
  } catch (error) {
    console.error('Error loading material info:', error)
  } finally {
    loading.value = false
  }
})
</script>

