<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <!-- Alert -->
      <div
        v-if="alert.show"
        :class="[
          'mb-6 p-4 rounded-lg border-l-4 animate-slideUp',
          alert.type === 'error' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
        ]"
      >
        <div class="flex items-center">
          <svg v-if="alert.type === 'error'" class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <p :class="alert.type === 'error' ? 'text-red-700' : 'text-green-700'" class="font-medium">
            {{ alert.message }}
          </p>
        </div>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
          <p class="text-gray-600">Sign in to access admin dashboard</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email Input -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition"
              placeholder=""
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 transition"
              placeholder=""
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Back to Home -->
        <div class="mt-6 text-center">
          <router-link to="/login" class="text-red-600 hover:text-red-700 font-semibold text-sm">
            ← Back to User Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const alert = ref({
  show: false,
  type: 'error',
  message: ''
})

const handleLogin = async () => {
  loading.value = true
  alert.value.show = false

  try {
    console.log('Admin login attempt:', form.value.email)
    
    // Use authStore.login() which properly sets token, role, and user
    const response = await authStore.login(form.value.email, form.value.password)
    
    console.log('Login response:', response)
    console.log('AuthStore role:', authStore.role)
    console.log('AuthStore user:', authStore.user)

    // Check if user is admin
    if (authStore.role !== 'admin') {
      console.log('Not an admin, rejecting login')
      alert.value = {
        show: true,
        type: 'error',
        message: 'Access denied. Admin credentials required.'
      }
      loading.value = false
      
      // Logout non-admin user
      authStore.logout()
      return
    }

    console.log('Admin verified, redirecting to admin-materials')
    // Redirect to admin materials dashboard
    await router.push({ name: 'admin-materials' })
    console.log('Redirect complete')
  } catch (error) {
    console.error('Login error:', error)
    alert.value = {
      show: true,
      type: 'error',
      message: error || 'Invalid email or password'
    }
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
</style>
