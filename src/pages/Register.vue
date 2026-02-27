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
          <h2 class="text-3xl font-bold text-dark mb-2">Create Account</h2>
          <p class="text-gray-600">Join Map2Home today</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Username Input -->
          <Input
            v-model="form.username"
            label="Username"
            placeholder=""
            required
            :error="errors.username"
            hint="Letters, numbers and underscore only. Min 4 characters."
          />

          <!-- Name Input -->
          <Input
            v-model="form.name"
            label="Full Name"
            placeholder=""
            required
            :error="errors.name"
          />

          <!-- Email Input -->
          <Input
            v-model="form.email"
            type="email"
            label="Email Address"
            placeholder=""
            required
            :error="errors.email"
            hint="We'll send a verification link"
          />

          <!-- Password Input -->
          <div>
            <Input
              v-model="form.password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              :error="errors.password"
              show-password-toggle
            />
            <div class="mt-2 space-y-1">
              <div class="flex items-center gap-2">
                <div :class="['h-1 flex-1 rounded', isStrong ? 'bg-green-500' : 'bg-gray-300']"></div>
                <span class="text-xs font-semibold" :class="isStrong ? 'text-green-600' : 'text-gray-600'">
                  {{ passwordStrength }}
                </span>
              </div>
              <p class="text-xs text-gray-600">
                Min 8 chars, 1 uppercase, 1 number, 1 special char
              </p>
            </div>
          </div>

          <!-- Confirm Password Input -->
          <Input
            v-model="form.confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            required
            :error="errors.confirmPassword"
            show-password-toggle
          />

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            :loading="authStore.loading"
            class="w-full"
          >
            Create Account
          </Button>
        </form>

        <!-- Divider -->
        <div class="my-6 flex items-center gap-4">
          <div class="flex-1 h-px bg-gray-300"></div>
          <span class="text-sm text-gray-600">or</span>
          <div class="flex-1 h-px bg-gray-300"></div>
        </div>

        <!-- Google Sign Up -->
        <button
          @click="handleGoogleSignUp"
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

        <!-- Login Link -->
        <p class="text-center text-gray-600 mt-6">
          Already have an account?
          <RouterLink to="/login" class="text-primary font-semibold hover:underline">
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'
import Alert from '../components/Alert.vue'

const router = useRouter()
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
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const alert = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

const passwordStrength = computed(() => {
  const pwd = form.value.password
  if (pwd.length < 8) return 'Weak'
  if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[!@#$%^&*]/.test(pwd)) return 'Fair'
  return 'Strong'
})

const isStrong = computed(() => passwordStrength.value === 'Strong')

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

const validateForm = () => {
  errors.value = { username: '', name: '', email: '', password: '', confirmPassword: '' }
  let isValid = true

  // Username validation
  const username = form.value.username?.trim() || ''
  if (!username) {
    errors.value.username = 'Username is required'
    isValid = false
  } else if (username.length < 4) {
    errors.value.username = 'Username must be at least 4 characters long'
    isValid = false
  } else if (/\s/.test(username)) {
    errors.value.username = 'Username cannot contain spaces'
    isValid = false
  } else if (!USERNAME_REGEX.test(username)) {
    errors.value.username = 'Username can only contain letters, numbers, and underscore (_)'
    isValid = false
  }

  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required'
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email'
    isValid = false
  }

  if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
    isValid = false
  }

  if (!/[A-Z]/.test(form.value.password) || !/[0-9]/.test(form.value.password) || !/[!@#$%^&*]/.test(form.value.password)) {
    errors.value.password = 'Password must include uppercase, number, and special character'
    isValid = false
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    await authStore.register(form.value.username, form.value.name, form.value.email, form.value.password)
    alert.value = {
      show: true,
      type: 'success',
      title: 'Account Created!',
      message: 'Please check your email for a verification link to activate your account.'
    }
    // Clear the form
    form.value = {
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  } catch (err) {
    // Check if error message indicates email already exists
    const errorMessage = err || 'Registration failed'
    const isEmailExists = errorMessage.toLowerCase().includes('email already registered') || 
                          errorMessage.toLowerCase().includes('already exists')
    const isUsernameExists = errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('taken')
    
    alert.value = {
      show: true,
      type: 'error',
      title: isEmailExists ? 'Email Already Registered' : isUsernameExists ? 'Username Taken' : 'Registration Failed',
      message: errorMessage
    }
  }
}

const handleGoogleSignUp = async () => {
  if (isGoogleLoading.value) return
  
  isGoogleLoading.value = true
  
  // Simulate Google authentication process (1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Show success message
  alert.value = {
    show: true,
    type: 'success',
    title: 'Success!',
    message: 'Signed up with Google. Redirecting...'
  }
  
  // Brief delay to show success message
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Redirect to dashboard
  router.push({ name: 'dashboard' })
}
</script>

