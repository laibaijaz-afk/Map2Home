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

      <div class="card animate-slideUp text-center">
        <!-- Status Icon -->
        <div class="mb-6">
          <svg
            v-if="verified"
            class="w-16 h-16 mx-auto text-green-500 animate-bounce"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg
            v-else-if="loading"
            class="w-16 h-16 mx-auto text-primary animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg
            v-else
            class="w-16 h-16 mx-auto text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- Message -->
        <h2 class="text-3xl font-bold text-dark mb-2">
          {{ verified ? 'Email Verified!' : loading ? 'Verifying...' : 'Verification Failed' }}
        </h2>
        <p class="text-gray-600 mb-8">
          {{ verified ? 'Your account is now active' : loading ? 'Please wait while we verify your email' : 'The verification link may have expired' }}
        </p>

        <!-- Action Button -->
        <template v-if="verified">
          <RouterLink
            to="/login"
            class="btn-primary inline-block"
          >
            Go to Login
          </RouterLink>
        </template>
        <template v-else-if="!loading">
          <RouterLink
            to="/register"
            class="btn-primary inline-block"
          >
            Sign Up Again
          </RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Alert from '../components/Alert.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const verified = ref(false)

const alert = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

onMounted(async () => {
  const token = route.query.token

  if (!token) {
    loading.value = false
    alert.value = {
      show: true,
      type: 'error',
      title: 'Invalid Link',
      message: 'Verification link is invalid'
    }
    return
  }

  try {
    await authStore.verifyEmail(token)
    verified.value = true
    alert.value = {
      show: true,
      type: 'success',
      title: 'Success',
      message: 'Email verified successfully'
    }
  } catch (err) {
    alert.value = {
      show: true,
      type: 'error',
      title: 'Verification Failed',
      message: err
    }
  } finally {
    loading.value = false
  }
})
</script>
