import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('auth_token'))
  const role = ref(localStorage.getItem('role') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => role.value === 'admin')
  const isUser = computed(() => role.value === 'user')

  // Set auth token
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('auth_token')
      delete axios.defaults.headers.common['Authorization']
    }
  }

  // Restore token from localStorage (idempotent)
  const restoreFromStorage = () => {
    const stored = localStorage.getItem('auth_token')
    if (stored && !token.value) {
      token.value = stored
      axios.defaults.headers.common['Authorization'] = `Bearer ${stored}`
    }
    // also restore role if present in localStorage
    const storedRole = localStorage.getItem('role')
    if (storedRole && !role.value) {
      role.value = storedRole
    }
  }

  // Set role
  const setRole = (newRole) => {
    role.value = newRole
    if (newRole) {
      localStorage.setItem('role', newRole)
    } else {
      localStorage.removeItem('role')
    }
  }

  // Set user data
  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  // Fetch user profile from backend to ensure role and user are populated
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`)
      if (response.data.user) {
        setUser(response.data.user)
        setRole(response.data.user.role)
      }
      return response.data
    } catch (err) {
      // If /auth/me fails, do not throw; allow login to proceed with what we have
      console.warn('fetchUser failed:', err.message)
      return null
    }
  }

  // Register
  const register = async (username, name, email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        name,
        email,
        password
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Registration failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Login
  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      })
      // Ensure token saved synchronously before returning
      setToken(response.data.token)
      setRole(response.data.user.role)
      setUser(response.data.user)

      // Fetch fresh user profile so role/user are guaranteed populated before route guard
      await fetchUser()

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Google Login
  const googleLogin = async (idToken) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/auth/google-login`, {
        idToken
      })
      setToken(response.data.token)
      setUser(response.data.user)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Google login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Verify Email
  const verifyEmail = async (token) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, {
        token
      })
      setUser(response.data.user)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Email verification failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Forgot Password
  const forgotPassword = async (email) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send reset email'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Reset Password
  const resetPassword = async (token, newPassword) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword
      })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reset password'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    setToken(null)
    setRole(null)
    error.value = null
  }

  // Initialize from localStorage
  const initialize = () => {
    // restore token and headers if available
    restoreFromStorage()
  }

  return {
    user,
    token,
    role,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isUser,
    register,
    login,
    googleLogin,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    setToken,
    setRole,
    initialize,
    restoreFromStorage,
    fetchUser
  }
})
