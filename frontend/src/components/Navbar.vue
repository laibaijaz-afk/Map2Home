<template>
  <nav class="sticky top-4 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="construction-card flex items-center justify-between gap-4 p-4 md:p-5 backdrop-blur-md">
        <!-- Left: Logo -->
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="flex items-center gap-3">
            <Logo :size="44" :showText="true" textClass="text-lg md:text-2xl" />
          </RouterLink>
        </div>

        <!-- Center: simple nav links on md+ -->
        <div class="hidden md:flex flex-1 justify-center px-4">
          <ul class="flex items-center gap-2 text-sm font-semibold">
            <li>
              <RouterLink to="/" class="px-4 py-2 rounded-lg text-wood-700 hover:bg-wood-200/50 hover:text-construction-600 transition-all duration-200 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Home
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/services" class="px-4 py-2 rounded-lg text-wood-700 hover:bg-wood-200/50 hover:text-construction-600 transition-all duration-200 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Services
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/cost-estimation" class="px-4 py-2 rounded-lg text-wood-700 hover:bg-wood-200/50 hover:text-construction-600 transition-all duration-200 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                Estimation
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/material-prices" class="px-4 py-2 rounded-lg text-wood-700 hover:bg-wood-200/50 hover:text-construction-600 transition-all duration-200 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                Material Prices
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Right: actions -->
        <div class="flex items-center gap-3">
          <template v-if="!authStore.isAuthenticated">
            <RouterLink to="/admin/login" class="text-red-700 hover:text-red-800 font-semibold text-sm border-2 border-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 transition shadow-sm">
              Admin
            </RouterLink>
            <RouterLink to="/login" class="text-wood-700 hover:text-construction-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-wood-100 transition">Login</RouterLink>
            <RouterLink to="/register" class="bg-gradient-to-r from-construction-500 to-construction-600 hover:from-construction-600 hover:to-construction-700 text-white font-bold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              Register
            </RouterLink>
          </template>

          <template v-else>
            <div class="flex items-center gap-3">
              <div v-if="authStore.user?.avatar" class="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80">
                <img :src="authStore.user.avatar" :alt="authStore.user.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-construction-500 to-wood-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-wood-300">
                {{ authStore.user?.name?.charAt(0)?.toUpperCase() }}
              </div>

              <div class="hidden sm:flex items-center gap-3">
                <template v-if="authStore.isAdmin">
                  <RouterLink to="/admin/materials" class="text-dark hover:text-primary font-semibold">Materials</RouterLink>
                  <RouterLink to="/admin/dashboard" class="text-dark hover:text-primary font-semibold">Analytics</RouterLink>
                </template>
                <template v-else>
                  <RouterLink to="/dashboard" class="text-wood-700 hover:text-construction-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-wood-100 transition">Dashboard</RouterLink>
                </template>
                <button @click="handleLogout" class="px-4 py-2 border-2 border-wood-300 text-wood-700 font-semibold rounded-lg hover:bg-wood-100 hover:border-wood-400 transition shadow-sm">Logout</button>
              </div>
            </div>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button @click="showMobile = !showMobile" aria-label="Toggle menu" class="p-2 rounded-lg hover:bg-white/10">
            <svg v-if="!showMobile" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <transition name="fade">
      <div v-if="showMobile" class="md:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
        <div class="bg-gradient-to-br from-wood-50 to-wood-100 border-2 border-wood-300/50 shadow-lg p-4 flex flex-col gap-3 rounded-xl">
          <RouterLink to="/" class="font-semibold text-wood-800 hover:text-construction-600 hover:bg-wood-200/50 px-3 py-2 rounded-lg transition">Home</RouterLink>
          <RouterLink to="/services" class="text-wood-700 hover:text-construction-600 hover:bg-wood-200/50 px-3 py-2 rounded-lg transition">Services</RouterLink>
          <RouterLink to="/cost-estimation" class="text-wood-700 hover:text-construction-600 hover:bg-wood-200/50 px-3 py-2 rounded-lg transition">Estimation</RouterLink>
          <RouterLink to="/material-prices" class="text-wood-700 hover:text-construction-600 hover:bg-wood-200/50 px-3 py-2 rounded-lg transition">Material Prices</RouterLink>

          <div class="border-t border-white/20 mt-2 pt-3 flex flex-col gap-2">
            <template v-if="!authStore.isAuthenticated">
              <RouterLink to="/admin/login" class="text-red-600 hover:text-red-700 font-semibold text-sm border border-red-300 px-3 py-2 rounded-lg hover:bg-red-50 transition text-center">
                Admin Login
              </RouterLink>
              <RouterLink to="/login" class="font-semibold">Login</RouterLink>
              <RouterLink to="/register" class="btn-primary w-full text-center">Register</RouterLink>
            </template>
            <template v-else>
              <div class="flex items-center gap-3">
                <div v-if="authStore.user?.avatar" class="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80">
                  <img :src="authStore.user.avatar" :alt="authStore.user.name" class="w-full h-full object-cover" />
                </div>
                <div class="font-semibold">{{ authStore.user?.name }}</div>
              </div>
              <div class="flex gap-2">
                <RouterLink v-if="authStore.isAdmin" to="/admin/dashboard" class="btn-secondary flex-1 text-center">Admin</RouterLink>
                <button @click="handleLogout" class="btn-outline flex-1">Logout</button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import Logo from './Logo.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const showMobile = ref(false)

watch(route, () => {
  // close mobile menu on navigation
  showMobile.value = false
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'landing' })
}
</script>
