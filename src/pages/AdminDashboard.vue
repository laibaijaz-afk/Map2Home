<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-light to-white">
    <!-- Header -->
    <nav class="glass">
      <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Map2Home</h1>
          <p class="text-sm text-gray-500">Admin Dashboard</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
            {{ authStore.user?.name || 'Admin' }}
          </span>
          <button
            @click="logout"
            class="px-4 py-2 btn-outline"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-6 py-12">
      <!-- Welcome Section -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h2>
        <p class="text-gray-600">Manage system settings and configurations</p>
      </div>

      <!-- Admin Controls Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Cost Configuration -->
        <div class="card overflow-hidden">
          <div class="p-6 bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
            <h3 class="text-2xl font-bold flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cost Configuration
            </h3>
          </div>
          <div class="p-6">
            <form @submit.prevent="updateCosts" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Base Cost per Sq Meter
                </label>
                <div class="flex gap-2">
                  <input
                    v-model.number="costConfig.baseCost"
                    type="number"
                    step="0.01"
                    class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span class="px-4 py-2 bg-gray-50 rounded-lg">₹</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Material Markup %
                </label>
                <input
                  v-model.number="costConfig.materialMarkup"
                  type="number"
                  step="0.1"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Labor Cost per Sq Meter
                </label>
                <div class="flex gap-2">
                  <input
                    v-model.number="costConfig.laborCost"
                    type="number"
                    step="0.01"
                    class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span class="px-4 py-2 bg-gray-50 rounded-lg">₹</span>
                </div>
              </div>

              <button
                type="submit"
                class="w-full btn-primary"
              >
                Update Costs
              </button>
            </form>
          </div>
        </div>

        <!-- System Statistics -->
        <div class="space-y-6">
          <!-- User Statistics -->
          <div class="card p-6">
            <h4 class="text-lg font-bold text-gray-800 mb-4">System Statistics</h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <span class="text-gray-600">Total Users</span>
                <span class="text-2xl font-bold text-primary">{{ systemStats.totalUsers }}</span>
              </div>
              <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <span class="text-gray-600">Total Estimates</span>
                <span class="text-2xl font-bold text-secondary">{{ systemStats.totalEstimates }}</span>
              </div>
              <div class="flex justify-between items-center pb-3 border-b border-gray-100">
                <span class="text-gray-600">Total Maps Generated</span>
                <span class="text-2xl font-bold text-blue-600">{{ systemStats.totalMaps }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Active Today</span>
                <span class="text-2xl font-bold text-green-600">{{ systemStats.activeToday }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card p-6">
            <h4 class="text-lg font-bold text-gray-800 mb-4">Recent Activity</h4>
            <div class="space-y-3 max-h-60 overflow-y-auto">
              <div
                v-for="(activity, idx) in systemStats.recentActivity"
                :key="idx"
                class="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0"
              >
                <div class="w-2 h-2 bg-primary rounded-full"></div>
                <div class="text-sm text-gray-600">{{ activity }}</div>
              </div>
              <div v-if="systemStats.recentActivity.length === 0" class="text-center py-8 text-gray-400">
                No recent activity
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="mt-12 bg-white rounded-lg shadow-md overflow-hidden border-2 border-red-200">
        <div class="bg-red-50 p-6 border-b border-red-200">
          <h3 class="text-xl font-bold text-red-800">Danger Zone</h3>
          <p class="text-sm text-red-700 mt-1">Irreversible actions</p>
        </div>
        <div class="p-6">
          <button
            class="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold rounded-lg transition"
          >
            Reset All Statistics
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const costConfig = ref({
  baseCost: 0,
  materialMarkup: 0,
  laborCost: 0
})

const systemStats = ref({
  totalUsers: 0,
  totalEstimates: 0,
  totalMaps: 0,
  activeToday: 0,
  recentActivity: []
})

onMounted(async () => {
  await loadSystemStats()
})

const loadSystemStats = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const response = await axios.get(
      `${apiUrl}/admin/stats`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
    
    if (response.data.success && response.data.stats) {
      systemStats.value = {
        totalUsers: response.data.stats.totalUsers || 0,
        totalEstimates: response.data.stats.totalEstimates || 0,
        totalMaps: response.data.stats.totalMaps || 0,
        activeToday: response.data.stats.activeToday || 0,
        recentActivity: response.data.stats.recentActivity || []
      }
    }
  } catch (error) {
    console.error('Failed to load system stats:', error)
    // Keep default zeros
  }
}

const updateCosts = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const response = await axios.post(
      `${apiUrl}/admin/update-costs`,
      costConfig.value,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
    
    if (response.data.success) {
      console.log('Cost configuration updated successfully')
    }
  } catch (error) {
    console.error('Failed to update costs:', error)
  }
}

const logout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>