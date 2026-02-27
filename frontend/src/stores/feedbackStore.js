import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useFeedbackStore = defineStore('feedback', () => {
  const feedbackList = ref([])
  const stats = ref(null)
  const myFeedback = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Get all public feedback
   */
  const getAllFeedback = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/feedback/all`)
      
      if (response.data.success) {
        feedbackList.value = response.data.feedback
        return response.data.feedback
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load feedback'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Get feedback statistics
   */
  const getFeedbackStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/feedback/stats`)
      
      if (response.data.success) {
        stats.value = response.data.stats
        return response.data.stats
      }
    } catch (err) {
      console.error('Failed to load feedback stats:', err)
      return null
    }
  }

  /**
   * Get user's own feedback
   */
  const getMyFeedback = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      error.value = 'Authentication required'
      return null
    }

    try {
      const response = await axios.get(`${API_URL}/feedback/my-feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        myFeedback.value = response.data.feedback
        return response.data.feedback
      }
    } catch (err) {
      console.error('Failed to load my feedback:', err)
      return null
    }
  }

  /**
   * Add or update feedback
   */
  const addFeedback = async (rating, comment) => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      error.value = 'Please login to submit feedback'
      throw error.value
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await axios.post(
        `${API_URL}/feedback/add`,
        { rating, comment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      if (response.data.success) {
        // Refresh feedback list and stats
        await Promise.all([
          getAllFeedback(),
          getFeedbackStats(),
          getMyFeedback()
        ])
        
        return response.data
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to submit feedback'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh all feedback data
   */
  const refresh = async () => {
    await Promise.all([
      getAllFeedback(),
      getFeedbackStats()
    ])
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    feedbackList,
    stats,
    myFeedback,
    loading,
    error,
    
    // Actions
    getAllFeedback,
    getFeedbackStats,
    getMyFeedback,
    addFeedback,
    refresh,
    clearError
  }
})
