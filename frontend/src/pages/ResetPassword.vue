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
          <h2 class="text-3xl font-bold text-dark mb-2">Reset Password</h2>
          <p class="text-gray-600">Enter your new password</p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-4">
          <!-- New Password Input -->
          <div>
            <Input
              v-model="form.password"
              type="password"
              label="New Password"
              placeholder="••••••••"
              required
              :error="errors.password"
            />
            <div class="mt-2 space-y-1">
              <div class="flex items-center gap-2">
                <div :class="['h-1 flex-1 rounded', isStrong ? 'bg-green-500' : 'bg-gray-300']"></div>
                <span class="text-xs font-semibold" :class="isStrong ? 'text-green-600' : 'text-gray-600'">
                  {{ passwordStrength }}
                </span>
              </div>
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
          />

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            :loading="authStore.loading"
            class="w-full"
          >
            Reset Password
          </Button>
        </form>

        <!-- Back to Login -->
        <p class="text-center text-gray-600 mt-6">
          <RouterLink to="/login" class="text-primary font-semibold hover:underline">
            Back to login
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'
import Alert from '../components/Alert.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  password: '',
  confirmPassword: ''
})

const errors = ref({
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

onMounted(() => {
  if (!route.query.token) {
    alert.value = {
      show: true,
      type: 'error',
      title: 'Invalid Link',
      message: 'Password reset link is invalid or expired'
    }
    setTimeout(() => {
      router.push({ name: 'forgot-password' })
    }, 2000)
  }
})

const validateForm = () => {
  errors.value = { password: '', confirmPassword: '' }
  let isValid = true

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

const handleResetPassword = async () => {
  if (!validateForm()) return

  try {
    const token = route.query.token
    await authStore.resetPassword(token, form.value.password)
    alert.value = {
      show: true,
      type: 'success',
      title: 'Password Reset!',
      message: 'Your password has been reset. Redirecting to login...'
    }
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  } catch (err) {
    alert.value = {
      show: true,
      type: 'error',
      title: 'Reset Failed',
      message: err
    }
  }
}
</script>
