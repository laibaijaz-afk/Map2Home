<template>
  <div class="min-h-screen bg-white relative">
    <!-- Construction Site Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
        style="background-image: url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'); filter: grayscale(40%) brightness(1.2);"
      ></div>
      <div class="absolute inset-0 bg-gradient-to-br from-white/85 via-wood-50/80 to-construction-50/85"></div>
    </div>
    
    <!-- Hero Section -->
    <section class="relative overflow-hidden pt-20 pb-32 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-12">
          <h1 class="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Design your home<br/>
            <span class="bg-gradient-to-r from-construction-600 to-wood-700 bg-clip-text text-transparent">
              for free
            </span>
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Create stunning 2D floor plans, visualize in 3D, and estimate costs accurately
          </p>
          <p class="text-lg text-gray-500 mb-8">
            Professional home design tools in 10 seconds.
          </p>
          <div v-if="!isAuthenticated" class="flex gap-4 justify-center flex-wrap">
            <RouterLink
              to="/register"
              class="px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-all text-lg shadow-lg hover:shadow-xl"
            >
              Design your home for free
            </RouterLink>
            <RouterLink
              to="/login"
              class="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-full hover:border-gray-900 transition-all text-lg"
            >
              Sign In
            </RouterLink>
          </div>
        </div>

        <!-- Feature Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <!-- Floor Planner -->
          <RouterLink to="/user/design-2d-map" class="block">
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div class="aspect-[4/3] bg-gradient-to-br from-construction-100 to-construction-50 flex items-center justify-center p-8">
                <div class="w-full h-full bg-white rounded-2xl shadow-inner flex items-center justify-center">
                  <svg class="w-32 h-32" viewBox="0 0 200 200" fill="none">
                    <rect x="20" y="20" width="160" height="120" stroke="#D2691E" stroke-width="4" fill="white" rx="4"/>
                    <rect x="40" y="40" width="40" height="40" fill="#D2691E" opacity="0.6"/>
                    <rect x="90" y="40" width="40" height="40" fill="#D2691E" opacity="0.6"/>
                    <rect x="140" y="40" width="30" height="80" fill="#F5E6D3"/>
                    <path d="M20 150 L180 150" stroke="#D2691E" stroke-width="2"/>
                    <text x="100" y="175" text-anchor="middle" fill="#D2691E" font-size="14" font-weight="bold">2D Plan</text>
                  </svg>
                </div>
              </div>
              <div class="p-6 text-center">
                <h3 class="text-xl font-bold text-construction-600 mb-2">Design 2D Map</h3>
                <p class="text-gray-600 text-sm">Create professional 2D house maps with accurate precision tools</p>
              </div>
            </div>
          </RouterLink>

          <!-- Room Planner -->
          <RouterLink to="/register" class="block">
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div class="aspect-[4/3] bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center p-8">
                <div class="w-full h-full bg-white rounded-2xl shadow-inner flex items-center justify-center">
                  <svg class="w-32 h-32" viewBox="0 0 200 200" fill="none">
                    <path d="M30 120 L100 60 L170 120 L170 150 L30 150 Z" fill="#d1fae5" stroke="#10b981" stroke-width="3"/>
                    <path d="M100 60 L100 150" stroke="#10b981" stroke-width="2" stroke-dasharray="4"/>
                    <rect x="70" y="100" width="60" height="40" fill="#10b981" opacity="0.4"/>
                    <circle cx="60" cy="110" r="8" fill="#fbbf24"/>
                    <text x="100" y="175" text-anchor="middle" fill="#10b981" font-size="14" font-weight="bold">Room</text>
                  </svg>
                </div>
              </div>
              <div class="p-6 text-center">
                <h3 class="text-xl font-bold text-blue-600 mb-2">Edit 2D Map</h3>
                <p class="text-gray-600 text-sm">Modify existing 2D maps with customizable layout tools</p>
              </div>
            </div>
          </RouterLink>

          <!-- 3D Render -->
          <RouterLink to="/register" class="block">
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div class="aspect-[4/3] bg-gradient-to-br from-wood-100 to-wood-50 flex items-center justify-center p-8">
                <div class="w-full h-full bg-white rounded-2xl shadow-inner flex items-center justify-center">
                  <svg class="w-32 h-32" viewBox="0 0 200 200" fill="none">
                    <path d="M50 110 L100 70 L150 110 L150 150 L50 150 Z" fill="white" stroke="#9333ea" stroke-width="3"/>
                    <path d="M100 70 L100 40 L150 80 L150 110" fill="#f3e8ff" stroke="#9333ea" stroke-width="3"/>
                    <path d="M50 110 L100 70 L100 40 L50 80 Z" fill="#e9d5ff" stroke="#9333ea" stroke-width="3"/>
                    <rect x="70" y="115" width="25" height="35" fill="#9333ea" opacity="0.3"/>
                    <text x="100" y="175" text-anchor="middle" fill="#9333ea" font-size="14" font-weight="bold">3D View</text>
                  </svg>
                </div>
              </div>
              <div class="p-6 text-center">
                <h3 class="text-xl font-bold text-construction-600 mb-2">3D render home</h3>
                <p class="text-gray-600 text-sm">Visualize your design in stunning 3D reality</p>
              </div>
            </div>
          </RouterLink>

          <!-- Cost Estimation -->
          <RouterLink :to="isAuthenticated ? '/cost-estimation' : '/login'" class="block">
            <div class="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div class="aspect-[4/3] bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center p-8">
                <div class="w-full h-full bg-white rounded-2xl shadow-inner flex items-center justify-center">
                  <svg class="w-32 h-32" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="50" fill="#fed7aa" stroke="#f97316" stroke-width="3"/>
                    <text x="100" y="110" text-anchor="middle" fill="#f97316" font-size="32" font-weight="bold">Rs</text>
                    <path d="M60 60 L70 50 L80 60" stroke="#f97316" stroke-width="2" fill="none"/>
                    <path d="M140 140 L130 150 L120 140" stroke="#f97316" stroke-width="2" fill="none"/>
                    <text x="100" y="175" text-anchor="middle" fill="#f97316" font-size="14" font-weight="bold">Budget</text>
                  </svg>
                </div>
              </div>
              <div class="p-6 text-center">
                <h3 class="text-xl font-bold text-construction-600 mb-2">Cost estimation</h3>
                <p class="text-gray-600 text-sm">Get accurate budget estimates instantly</p>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-gray-50/90 relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to build your dream home
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools for planning, designing, and budgeting your construction project
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-construction-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-construction-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">2D Floor Planning</h3>
            <p class="text-gray-600">Design detailed floor plans with precision measurement tools and customizable layouts</p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-wood-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-wood-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">3D Visualization</h3>
            <p class="text-gray-600">See your designs come to life with realistic 3D rendering and walkthrough capabilities</p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-construction-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-construction-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Cost Estimation</h3>
            <p class="text-gray-600">Get accurate project cost estimates based on materials, labor, and current market rates</p>
          </div>

          <!-- Feature 4 -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Electrical Planning</h3>
            <p class="text-gray-600">Plan electrical wiring, outlets, and lighting fixtures with professional precision</p>
          </div>

          <!-- Feature 5 -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Ventilation System</h3>
            <p class="text-gray-600">Design efficient air circulation and ventilation systems for optimal comfort</p>
          </div>

          <!-- Feature 6 -->
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-12 h-12 bg-wood-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-wood-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Sanitary Planning</h3>
            <p class="text-gray-600">Plan plumbing layouts for bathrooms, kitchens, and water supply systems</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-24 bg-white/90 relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How Map2Home Works
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            From concept to completion in four simple steps
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Step 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-construction-600 to-construction-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              1
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Create Account</h3>
            <p class="text-gray-600">Sign up for free and access all design tools instantly</p>
          </div>

          <!-- Step 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-wood-600 to-wood-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              2
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Submit Requirements</h3>
            <p class="text-gray-600">Enter your plot size, preferences, and design specifications</p>
          </div>

          <!-- Step 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-construction-500 to-construction-400 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              3
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Design & Visualize</h3>
            <p class="text-gray-600">Create 2D plans, view in 3D, and get instant cost estimates</p>
          </div>

          <!-- Step 4 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-wood-700 to-wood-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
              4
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Download & Build</h3>
            <p class="text-gray-600">Download plans and estimates, ready for construction</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-gradient-to-r from-construction-600 via-construction-500 to-wood-700 relative z-10 overflow-hidden">
      <!-- Decorative construction elements -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-0 w-64 h-64 bg-wood-300 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-64 h-64 bg-construction-400 rounded-full blur-3xl"></div>
      </div>
      
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 class="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
          Ready to design your dream home?
        </h2>
        <p class="text-xl text-wood-100 mb-8 font-medium">
          Join thousands of homeowners who trust Map2Home for their construction projects
        </p>
        <div class="flex gap-4 justify-center flex-wrap">
          <RouterLink
            v-if="!isAuthenticated"
            to="/register"
            class="px-8 py-4 bg-white text-construction-600 font-bold rounded-full hover:bg-wood-50 transition-all text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Get Started Free
          </RouterLink>
          <button
            @click="showVideoModal = true"
            class="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/20 transition-all text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View Demo
          </button>
        </div>
      </div>
    </section>

    <!-- Video Modal -->
    <div
      v-if="showVideoModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      @click="showVideoModal = false"
    >
      <div class="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden" @click.stop>
        <button
          @click="showVideoModal = false"
          class="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div class="aspect-video bg-black">
          <video
            v-if="showVideoModal"
            ref="demoVideo"
            class="w-full h-full"
            controls
            autoplay
            src="/Map2Home.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="p-6 bg-white">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Map2Home Demo</h3>
          <p class="text-gray-600">See how easy it is to design your dream home with Map2Home</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900/95 text-white py-12 relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo :size="32" :showText="true" textClass="text-xl text-white" class="mb-4" />
            <p class="text-gray-400 text-sm">Professional home design and construction planning tools</p>
          </div>
          <div>
            <h4 class="font-bold mb-4">Product</h4>
            <ul class="space-y-2 text-gray-400">
              <li><RouterLink to="/register" class="hover:text-white">Features</RouterLink></li>
              <li><RouterLink to="/register" class="hover:text-white">Pricing</RouterLink></li>
              <li><RouterLink to="/login" class="hover:text-white">Sign In</RouterLink></li>
              <li><RouterLink to="/admin/login" class="hover:text-red-400 text-red-500 font-semibold">Admin Login</RouterLink></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Company</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">About</a></li>
              <li><a href="#" class="hover:text-white">Contact</a></li>
              <li><a href="#" class="hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white">Privacy</a></li>
              <li><a href="#" class="hover:text-white">Terms</a></li>
              <li><a href="#" class="hover:text-white">Security</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Map2Home. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Logo from '../components/Logo.vue'

const authStore = useAuthStore()
const showVideoModal = ref(false)
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
/* Smooth animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}
</style>
