<template>
  <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
    <h3 class="text-2xl font-bold text-gray-900 mb-6">Share Your Experience</h3>

    <!-- Success Message -->
    <div 
      v-if="successMessage" 
      class="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-fadeIn"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <p class="text-green-700 font-medium">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Error Message -->
    <div 
      v-if="errorMessage" 
      class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-fadeIn"
    >
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-red-700 font-medium">{{ errorMessage }}</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Rating Selector -->
      <div class="mb-6">
        <label class="block text-gray-700 font-semibold mb-3">
          Your Rating <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center space-x-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="rating = star"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
            class="transition-all duration-200 transform hover:scale-110 focus:outline-none"
          >
            <svg
              class="w-10 h-10 md:w-12 md:h-12"
              :class="star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        </div>
        <p class="mt-2 text-sm text-gray-500">
          {{ ratingLabels[rating - 1] || 'Click to rate' }}
        </p>
      </div>

      <!-- Comment Textarea -->
      <div class="mb-6">
        <label for="comment" class="block text-gray-700 font-semibold mb-3">
          Your Feedback <span class="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          v-model="comment"
          rows="5"
          placeholder=""
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
          :class="{ 'border-red-500': commentError }"
        ></textarea>
        <div class="mt-2 flex justify-between items-center">
          <p v-if="commentError" class="text-red-500 text-sm">{{ commentError }}</p>
          <p class="text-gray-500 text-sm ml-auto">
            {{ comment.length }} / 1000 characters
          </p>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || !rating || !comment.trim()"
        class="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Submitting...
        </span>
        <span v-else>
          {{ existingFeedback ? 'Update Feedback' : 'Submit Feedback' }}
        </span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const emit = defineEmits(['feedback-submitted'])

const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const existingFeedback = ref(null)

const ratingLabels = [
  'Poor',
  'Fair',
  'Good',
  'Very Good',
  'Excellent'
]

const commentError = computed(() => {
  if (comment.value.trim() && comment.value.trim().length < 10) {
    return 'Comment must be at least 10 characters'
  }
  if (comment.value.length > 1000) {
    return 'Comment cannot exceed 1000 characters'
  }
  return null
})

const loadExistingFeedback = async () => {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return

    const response = await axios.get(`${API_URL}/feedback/my-feedback`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.data.success && response.data.feedback) {
      existingFeedback.value = response.data.feedback
      rating.value = response.data.feedback.rating
      comment.value = response.data.feedback.comment
    }
  } catch (error) {
    console.error('Error loading existing feedback:', error)
  }
}

const handleSubmit = async () => {
  // Clear previous messages
  successMessage.value = ''
  errorMessage.value = ''

  // Validation
  if (!rating.value) {
    errorMessage.value = 'Please select a rating'
    return
  }

  if (commentError.value) {
    errorMessage.value = commentError.value
    return
  }

  loading.value = true

  try {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      errorMessage.value = 'Please login to submit feedback'
      loading.value = false
      return
    }

    const response = await axios.post(
      `${API_URL}/feedback/add`,
      {
        rating: rating.value,
        comment: comment.value.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (response.data.success) {
      successMessage.value = response.data.message
      
      // Emit event to parent to refresh feedback list
      emit('feedback-submitted')

      // Clear form if it was a new submission
      if (!existingFeedback.value) {
        rating.value = 0
        comment.value = ''
      }

      // Update existing feedback reference
      existingFeedback.value = {
        rating: rating.value,
        comment: comment.value
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 5000)
    }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    errorMessage.value = error.response?.data?.error || 'Failed to submit feedback. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadExistingFeedback()
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
