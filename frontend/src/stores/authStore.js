import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Track whether the global 401 interceptor has been installed (once per app)
let _interceptorInstalled = false

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
  const register = async (name, email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
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
      setRole(response.data.user?.role || 'user')
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Google login failed'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Verify Email (no token is returned — user must login after verification)
  const verifyEmail = async (verificationToken) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, {
        token: verificationToken
      })
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

  // Initialize from localStorage and set up global interceptor
  const initialize = () => {
    // restore token and headers if available
    restoreFromStorage()

    // Install global axios response interceptor (once) to handle 401/403 uniformly
    if (!_interceptorInstalled) {
      _interceptorInstalled = true
      axios.interceptors.response.use(
        (response) => response,
        (err) => {
          const status = err.response?.status
          // On 401 (token expired/invalid) or 403 (forbidden), auto-logout
          // Skip for login/register endpoints to avoid clearing state during auth flow
          const requestUrl = err.config?.url || ''
          const isAuthEndpoint = requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/register') ||
            requestUrl.includes('/auth/forgot-password') ||
            requestUrl.includes('/auth/reset-password') ||
            requestUrl.includes('/auth/verify-email')

          if ((status === 401 || status === 403) && !isAuthEndpoint && token.value) {
            console.warn(`[Auth] Received ${status} — logging out and redirecting to login`)
            logout()
            // Redirect to login page (use window.location since we don't have router here)
            const currentPath = window.location.pathname
            if (currentPath !== '/login' && currentPath !== '/admin/login') {
              window.location.href = '/login?session=expired'
            }
          }
          return Promise.reject(err)
        }
      )
    }
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
