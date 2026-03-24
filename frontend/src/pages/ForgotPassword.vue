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
          <h2 class="text-3xl font-bold text-dark mb-2">Forgot Password?</h2>
          <p class="text-gray-600">Enter your email to reset it</p>
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <!-- Email Input -->
          <Input
            v-model="form.email"
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            required
            :error="errors.email"
            hint="We'll send a password reset link"
          />

          <!-- Submit Button -->
          <Button
            type="submit"
            variant="primary"
            :loading="authStore.loading"
            class="w-full"
          >
            Send Reset Link
          </Button>
        </form>

        <!-- Back to Login -->
        <p class="text-center text-gray-600 mt-6">
          Remember your password?
          <RouterLink to="/login" class="text-primary font-semibold hover:underline">
            Sign in
          </RouterLink>
        </p>
      </div>

      <!-- Info Box -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-sm text-blue-800">
          ℹ️ Check your email (including spam folder) for the password reset link. The link will expire in 24 hours.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'
import Alert from '../components/Alert.vue'

const authStore = useAuthStore()

const form = ref({
  email: ''
})

const errors = ref({
  email: ''
})

const alert = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

const validateForm = () => {
  errors.value = { email: '' }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email'
    return false
  }
  return true
}

const handleForgotPassword = async () => {
  if (!validateForm()) return

  try {
    await authStore.forgotPassword(form.value.email)
    alert.value = {
      show: true,
      type: 'success',
      title: 'Email Sent!',
      message: 'Check your email for the password reset link'
    }
    form.value.email = ''
  } catch (err) {
    alert.value = {
      show: true,
      type: 'error',
      title: 'Failed',
      message: err
    }
  }
}
</script>
