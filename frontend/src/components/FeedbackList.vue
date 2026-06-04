<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
    <!-- Header -->
    <div class="mb-8">
      <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">User Reviews</h3>
      <p class="text-gray-600">See what our users have to say about Map2Home</p>
    </div>

    <!-- Statistics -->
    <div v-if="stats" class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Average Rating -->
        <div class="text-center">
          <div class="flex items-center justify-center mb-2">
            <span class="text-4xl font-bold text-gray-900">{{ stats.average }}</span>
            <svg class="w-8 h-8 text-yellow-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <p class="text-gray-600 font-medium">Average Rating</p>
        </div>

        <!-- Total Reviews -->
        <div class="text-center">
          <p class="text-4xl font-bold text-gray-900 mb-2">{{ stats.total }}</p>
          <p class="text-gray-600 font-medium">Total Reviews</p>
        </div>

        <!-- Rating Distribution -->
        <div class="space-y-1">
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center text-sm">
            <span class="w-8 text-gray-600">{{ star }}★</span>
            <div class="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-yellow-400 transition-all duration-500"
                :style="{ width: `${getDistributionPercentage(star)}%` }"
              ></div>
            </div>
            <span class="w-8 text-right text-gray-600">{{ stats.distribution[star] }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-6">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="border border-gray-200 rounded-xl p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="ml-4 flex-1">
              <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded"></div>
            <div class="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && feedbackList.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h4 class="text-xl font-semibold text-gray-600 mb-2">No Reviews Yet</h4>
      <p class="text-gray-500">Be the first to share your experience!</p>
    </div>

    <!-- Feedback List -->
    <div v-else class="space-y-6">
      <div
        v-for="(item, index) in feedbackList"
        :key="item.id"
        class="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        :style="{ animationDelay: `${index * 100}ms` }"
      >
        <!-- User Info -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center">
            <!-- Avatar -->
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {{ getInitials(item.name) }}
            </div>
            <div class="ml-4">
              <h4 class="font-semibold text-gray-900">{{ item.name }}</h4>
              <p class="text-sm text-gray-500">{{ formatDate(item.created_at) }}</p>
            </div>
          </div>

          <!-- Rating Stars -->
          <div class="flex items-center">
            <svg
              v-for="star in 5"
              :key="star"
              class="w-5 h-5"
              :class="star <= item.rating ? 'text-yellow-400' : 'text-gray-300'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        <!-- Comment -->
        <p class="text-gray-700 leading-relaxed">{{ item.comment }}</p>

        <!-- Helpful Badge (Optional) -->
        <div v-if="item.rating === 5" class="mt-4 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          Verified Review
        </div>
      </div>

      <!-- Load More Button (if you implement pagination) -->
      <div v-if="hasMore" class="text-center pt-6">
        <button
          @click="loadMore"
          class="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300"
        >
          Load More Reviews
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const feedbackList = ref([])
const stats = ref(null)
const loading = ref(true)
const hasMore = ref(false) // For pagination

const getInitials = (name) => {
  if (!name) return '?'
  const names = name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const getDistributionPercentage = (star) => {
  if (!stats.value || stats.value.total === 0) return 0
  return (stats.value.distribution[star] / stats.value.total) * 100
}

const loadFeedback = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_URL}/feedback/all`)
    
    if (response.data.success) {
      feedbackList.value = response.data.feedback
    }
  } catch (error) {
    console.error('Error loading feedback:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/feedback/stats`)
    
    if (response.data.success) {
      stats.value = response.data.stats
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadMore = () => {
  // Implement pagination if needed
  console.log('Load more clicked')
}

const refresh = async () => {
  await Promise.all([loadFeedback(), loadStats()])
}

onMounted(() => {
  refresh()
})

// Expose refresh method to parent
defineExpose({ refresh })
</script>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.border:hover {
  animation: slideIn 0.3s ease-out;
}
</style>
