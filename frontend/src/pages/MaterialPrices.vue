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
    
    <!-- Decorative Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute top-0 right-0 w-96 h-96 bg-construction-400/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-wood-400/10 rounded-full blur-3xl"></div>
    </div>
    
    <main class="container mx-auto px-4 py-8 relative z-20">
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-construction-500 to-construction-600 rounded-2xl shadow-xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
        <h1 class="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-wood-800 via-construction-600 to-wood-700 bg-clip-text text-transparent">
          Construction Material Prices
        </h1>
        <p class="text-xl text-wood-700">Latest material prices from CostZone.org - Updated regularly for accurate cost estimation</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-construction-500 border-t-transparent mx-auto mb-4"></div>
          <p class="text-wood-700 font-semibold">Loading material prices...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="construction-card p-6 mb-6 border-red-300 bg-red-50">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-red-800 font-semibold">Error Loading Prices</h3>
            <p class="text-red-600">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Material Prices Table -->
      <div v-else class="construction-card overflow-hidden">
        <!-- Filters -->
        <div class="bg-gradient-to-r from-wood-100 to-wood-50 px-6 py-4 border-b-2 border-wood-300/50">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search materials..."
                class="w-full px-4 py-2 border-2 border-wood-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 bg-white shadow-sm"
              />
            </div>
            <div class="flex gap-2">
              <select
                v-model="filterCategory"
                class="px-4 py-2 border-2 border-wood-300 rounded-lg focus:ring-2 focus:ring-construction-500 focus:border-construction-500 bg-white shadow-sm"
              >
                <option value="all">All Categories</option>
                <option value="construction">Construction</option>
                <option value="finishing">Finishing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gradient-to-r from-wood-300 to-wood-200">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-wood-800 uppercase tracking-wider">
                  Material Name
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-wood-800 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-4 text-right text-xs font-bold text-wood-800 uppercase tracking-wider">
                  Price
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-wood-800 uppercase tracking-wider">
                  Unit
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-wood-800 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody class="bg-white/90 divide-y divide-wood-200">
              <tr
                v-for="material in filteredMaterials"
                :key="material.id"
                class="hover:bg-wood-50/70 transition-all duration-200 transform hover:scale-[1.01]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-wood-900">{{ material.name }}</div>
                  <div v-if="material.description" class="text-sm text-wood-600 mt-1">{{ material.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-blue-100 text-blue-800': material.category === 'construction',
                      'bg-purple-100 text-purple-800': material.category === 'finishing',
                      'bg-wood-200 text-wood-800': material.category === 'other'
                    }"
                    class="px-2 py-1 text-xs font-semibold rounded-full"
                  >
                    {{ material.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-lg font-extrabold text-construction-600">
                    Rs {{ formatPrice(material.cost_per_unit) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-wood-700 font-semibold">per {{ material.unit }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-wood-600 font-medium">
                    {{ formatDate(material.updated_at) }}
                  </div>
                  <div v-if="material.last_scraped_at" class="text-xs text-wood-500 font-medium">
                    Scraped: {{ formatDate(material.last_scraped_at) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredMaterials.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-wood-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-2 text-sm font-bold text-wood-800">No materials found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>

        <!-- Summary -->
        <div v-if="filteredMaterials.length > 0" class="bg-gradient-to-r from-wood-100 to-wood-50 px-6 py-4 border-t-2 border-wood-300/50">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="text-sm text-gray-600">
              Showing <span class="font-semibold">{{ filteredMaterials.length }}</span> of 
              <span class="font-semibold">{{ materials.length }}</span> materials
            </div>
            <div v-if="lastScraped" class="text-xs text-gray-500">
              Last scraped from CostZone.org: {{ formatDate(lastScraped) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="mt-8 bg-gradient-to-br from-construction-50 to-wood-50 border-2 border-construction-300/50 rounded-xl p-6 shadow-md">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <div>
            <h4 class="font-semibold text-blue-900 mb-2">About Material Prices</h4>
            <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Prices are scraped from <a href="https://costzone.org" target="_blank" class="underline font-semibold">CostZone.org</a> - Pakistan's trusted construction cost platform</li>
              <li>Prices are updated regularly to reflect current market rates</li>
              <li>These prices are used in our cost estimation calculator for accurate calculations</li>
              <li>Prices may vary by location and are subject to market fluctuations</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const materials = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const filterCategory = ref('all')
const lastScraped = ref(null)

const filteredMaterials = computed(() => {
  let result = materials.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m => 
      m.name.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query))
    )
  }

  // Filter by category
  if (filterCategory.value !== 'all') {
    result = result.filter(m => m.category === filterCategory.value)
  }

  return result
})

const fetchMaterials = async () => {
  loading.value = true
  error.value = null

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    
    const response = await axios.get(`${apiUrl}/materials/prices`)
    
    if (response.data.success) {
      materials.value = response.data.materials || []
      
      // Find the most recent scraped date
      const scrapedDates = materials.value
        .map(m => m.last_scraped_at)
        .filter(date => date)
        .sort()
        .reverse()
      
      if (scrapedDates.length > 0) {
        lastScraped.value = scrapedDates[0]
      }
    }
  } catch (err) {
    console.error('Error fetching materials:', err)
    error.value = err.response?.data?.message || 'Failed to load material prices'
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(() => {
  fetchMaterials()
})
</script>

