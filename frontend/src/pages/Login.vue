<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/10 via-light to-secondary/10 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <Alert
        v-if="alert.show"
        :type="alert.type"
        :message="alert.message"
        :title="alert.title"
        @close="alert.show = false"
      />

      <div class="card animate-slideUp">
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-dark mb-2">Welcome Back</h2>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Input -->
          <Input
            v-model="form.email"
            type="email"
            label="Email Address"
            placeholder=""
            required
            :error="errors.email"
          />

          <!-- Password Input -->
          <Input
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            :error="errors.password"
          />

          <!-- Forgot Password Link -->
          <div class="text-right">
            <RouterLink
              to="/forgot-password"
              class="text-sm text-primary font-semibold hover:underline"
            >
              Forgot Password?
            </RouterLink>
          </div>

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            :loading="authStore.loading"
            class="w-full"
          >
            Sign In
          </Button>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center gap-4">
          <div class="flex-1 h-px bg-gray-300"></div>
          <span class="text-sm text-gray-600">or</span>
          <div class="flex-1 h-px bg-gray-300"></div>
        </div>

        <!-- Google Sign In -->
        <button
          @click="handleGoogleSignIn"
          :disabled="isGoogleLoading"
          :class="[
            'relative w-full px-4 py-3 border-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2',
            isGoogleLoading 
              ? 'border-blue-500 bg-blue-50 cursor-not-allowed' 
              : 'border-gray-300 text-dark hover:bg-gray-50 hover:border-blue-400'
          ]"
        >
          <!-- Google Logo -->
          <img 
            v-if="!isGoogleLoading"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E" 
            alt="Google" 
            class="w-5 h-5" 
          />
          
          <!-- Loading Spinner -->
          <svg 
            v-if="isGoogleLoading" 
            class="animate-spin w-5 h-5 text-blue-600" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          
          <span :class="isGoogleLoading ? 'text-blue-700' : ''">
            {{ isGoogleLoading ? 'Signing in...' : 'Continue with Google' }}
          </span>
          
          <!-- Glow effect -->
          <span 
            v-if="isGoogleLoading" 
            class="absolute inset-0 rounded-lg bg-blue-400 opacity-20 animate-pulse"
          ></span>
        </button>

        <!-- Register Link -->
        <p class="text-center text-gray-600 mt-6">
          Don't have an account?
          <RouterLink to="/register" class="text-primary font-semibold hover:underline">
            Sign up
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'
import Alert from '../components/Alert.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Redirect if already authenticated
onMounted(() => {
  if (authStore.isAuthenticated) {
    const target = authStore.isAdmin ? '/admin/materials' : '/dashboard'
    router.push(target)
  }
})

const isGoogleLoading = ref(false)

const form = ref({
  email: '',
  password: ''
})

const errors = ref({
  email: '',
  password: ''
})

const alert = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

const validateForm = () => {
  errors.value = { email: '', password: '' }
  let isValid = true

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email'
    isValid = false
  }

  if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return

  try {
    // perform login (this saves token synchronously via setToken)
    await authStore.login(form.value.email, form.value.password)

    // optional UX: show success message but navigate immediately so route guard works
    alert.value = {
      show: true,
      type: 'success',
      title: 'Welcome!',
      message: 'Redirecting to dashboard...'
    }

    // Ensure token is persisted before navigation — setToken already wrote to localStorage.
    // Redirect by route name per requirements so route guards pick the right route.
    const desiredRedirect = route.query.redirect || null
    if (desiredRedirect) {
      // If a redirect path was provided in query, prefer it
      router.push({ path: desiredRedirect })
    } else {
      // Default: go to named dashboard route
      router.push({ name: 'dashboard' })
    }
    return
  } catch (err) {
    console.error('Login error:', err)
    
    // Show more specific error messages
    let errorMessage = err
    let errorTitle = 'Login Failed'
    
    if (typeof err === 'string') {
      if (err.includes('verify your email') || err.includes('email first')) {
        errorTitle = 'Email Verification Required'
        errorMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.'
      } else if (err.includes('Invalid email') || err.includes('password')) {
        errorTitle = 'Invalid Credentials'
        errorMessage = 'The email or password you entered is incorrect. Please try again.'
      } else if (err.includes('Network') || err.includes('Failed to fetch')) {
        errorTitle = 'Connection Error'
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
      }
    }
    
    alert.value = {
      show: true,
      type: 'error',
      title: errorTitle,
      message: errorMessage
    }
  }
}

const handleGoogleSignIn = async () => {
  if (isGoogleLoading.value) return
  
  isGoogleLoading.value = true
  
  // Simulate Google authentication process (1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Show success message
  alert.value = {
    show: true,
    type: 'success',
    title: 'Success!',
    message: 'Signed in with Google. Redirecting...'
  }
  
  // Brief delay to show success message
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Redirect to dashboard
  router.push({ name: 'dashboard' })
}
</script>
