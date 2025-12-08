<template>
  <div class="min-h-screen text-dark antialiased relative">
    <!-- Construction Background Overlay -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-wood-50/90 via-wood-100/85 to-construction-50/90"></div>
    </div>
    
    <!-- Show Navbar only when not on authentication pages -->
    <Navbar v-if="!isAuthPage" />

    <!-- Page content container -->
    <main class="w-full relative z-10">
      <RouterView />
    </main>

    <!-- subtle floating corner accent (visual only) -->
    <div class="pointer-events-none fixed right-6 bottom-6 hidden md:block z-20">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary opacity-10 blur-xl"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/Navbar.vue'

const route = useRoute()
const authStore = useAuthStore()

// Names of routes that are considered authentication pages and should hide the Navbar
// List of route names where the Navbar should be hidden (authentication pages)
const authPages = ['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'verify', 'admin-login']

// route.name can be undefined during initial navigation; coerce to string
const isAuthPage = computed(() => authPages.includes(String(route.name)))

// Initialize auth store from localStorage on app mount
onMounted(() => {
  authStore.initialize()
})
</script>