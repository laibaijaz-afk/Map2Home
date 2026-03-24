<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-light to-white text-dark">
    
    <!-- Video Demo Modal -->
    <div v-if="showVideoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" @click.self="showVideoModal = false">
      <div class="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl">
        <button @click="showVideoModal = false" class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <video 
          ref="demoVideo"
          class="w-full aspect-video" 
          controls 
          autoplay
          src="/Map2Home.mp4"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
    
    <!-- Hero Section -->
    <header class="relative overflow-hidden">
      <!-- Background Decorative Blobs -->
      <div class="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-gradient-to-br from-primary to-secondary opacity-10 blur-3xl pointer-events-none animate-pulse"></div>
      <div class="absolute -right-20 top-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-accent to-secondary opacity-10 blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Left Column: Headline & CTA -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-3">
              <span class="accent-pill">New · Premium</span>
              <span class="text-sm text-gray-500">Trusted by homeowners & professionals</span>
            </div>

            <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight">
              Design. Visualize. Estimate —
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mt-2">
                Build your dream home with confidence
              </span>
            </h1>

            <p class="text-xl text-gray-600 max-w-2xl leading-relaxed">
              Map2Home combines intelligent 2D map design, immersive 3D previews, and accurate cost estimation to streamline your entire building journey from concept to construction.
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-4">
              <button @click="navigateToLogin" class="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4">
                Get Started Free
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </button>
              <button @click="scrollToServices" class="btn-outline text-lg px-8 py-4">
                Explore Services
              </button>
            </div>

            <div class="text-sm text-gray-500 pt-2">
              ✓ No credit card required · ✓ Free to start · ✓ Export anytime
            </div>

            <!-- Feature Pills -->
            <div class="flex flex-wrap gap-3 pt-6">
              <div v-for="(feature, i) in quickFeatures" :key="i" class="chip">
                {{ feature }}
              </div>
            </div>
          </div>

          <!-- Right Column: Visual Showcase -->
          <div class="lg:col-span-5">
            <div class="relative">
              <!-- Main Featured Card -->
              <div class="hero-plate bg-gradient-to-br from-primary to-secondary p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                    📍
                  </div>
                  <div>
                    <div class="text-sm text-white/80">Featured Project</div>
                    <div class="text-2xl font-bold">Modern Villa Design</div>
                  </div>
                </div>

                <p class="text-white/90 mb-6">
                  Complete 2D floor plan with 3D visualization and detailed cost breakdown — all generated in minutes.
                </p>

                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                    <div class="text-2xl font-bold">1,850</div>
                    <div class="text-xs text-white/80 mt-1">sq. ft</div>
                  </div>
                  <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                    <div class="text-2xl font-bold">$6,200</div>
                    <div class="text-xs text-white/80 mt-1">Est. Cost</div>
                  </div>
                  <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20">
                    <div class="text-2xl font-bold">3D</div>
                    <div class="text-xs text-white/80 mt-1">Ready</div>
                  </div>
                </div>
              </div>

              <!-- Floating Mini Cards -->
              <div class="mt-6 grid grid-cols-2 gap-4">
                <div class="card p-4 hover:shadow-lg transition-shadow">
                  <div class="text-sm text-gray-500 mb-1">Smart Feature</div>
                  <div class="font-bold text-gray-900">Auto Layout</div>
                  <div class="text-xs text-primary mt-2">→ Try Now</div>
                </div>
                <div class="card p-4 hover:shadow-lg transition-shadow">
                  <div class="text-sm text-gray-500 mb-1">Market Data</div>
                  <div class="font-bold text-gray-900">Live Pricing</div>
                  <div class="text-xs text-primary mt-2">→ View</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Showcase Carousel (horizontal scroll on mobile) -->
    <section class="py-12 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <div v-for="(card, i) in showcaseCards" :key="i" class="hero-plate min-w-[280px] flex-shrink-0 hover:shadow-xl transition-shadow">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                {{ card.icon }}
              </div>
              <div class="flex-1">
                <div class="text-xs text-gray-500 uppercase tracking-wide">{{ card.label }}</div>
                <div class="font-bold text-gray-900 text-lg">{{ card.title }}</div>
              </div>
              <div class="accent-pill">{{ card.tag }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-20">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-extrabold mb-4">Our Core Services</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to design, visualize, and estimate your construction project — all in one powerful platform.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard 
            :icon="MapIcon" 
            title="2D Map Designing" 
            description="Create detailed, professional floor plans with our intelligent design tools and smart layout assistance." 
            :features="['Smart layout generator', 'Partial & full maps', 'Export to multiple formats', 'Real-time collaboration']" 
          />
          <ServiceCard 
            :icon="CubeIcon" 
            title="3D Visualization" 
            description="Transform your 2D designs into stunning, interactive 3D previews with realistic textures and lighting." 
            :features="['Real-time 3D rendering', 'Multiple camera views', 'VR-ready exports', 'Interactive walkthroughs']" 
          />
          <ServiceCard 
            :icon="CalculatorIcon" 
            title="Cost Estimation" 
            description="Get accurate, material-based cost estimates with live market pricing and detailed breakdowns." 
            :features="['Live material pricing', 'Custom plot sizes', 'Detailed cost breakdown', 'Export estimates as PDF']" 
          />
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="py-20 bg-gradient-to-b from-white to-gray-50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-extrabold mb-4">Why Choose Map2Home?</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Built by professionals, designed for everyone — from homeowners to architects.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="(reason, i) in whyChooseUs" :key="i" class="card p-6 text-center hover-lift">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-3xl mb-4 shadow-lg">
              {{ reason.icon }}
            </div>
            <h3 class="text-xl font-bold mb-2">{{ reason.title }}</h3>
            <p class="text-gray-600">{{ reason.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Meet the Team -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-extrabold mb-4">Meet Our Expert Team</h2>
          <p class="text-xl text-gray-600">
            Passionate architects, designers, and engineers dedicated to building the future of home construction.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="(member, i) in team" :key="i" class="card p-6 text-center hover-lift">
            <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-4">
              {{ member.initials }}
            </div>
            <h3 class="font-bold text-lg">{{ member.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ member.role }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 bg-gradient-to-br from-primary via-secondary to-accent text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-grid-white/10"></div>
      <div class="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <h2 class="text-4xl md:text-5xl font-extrabold mb-6">
          Ready to Build Your Dream Home?
        </h2>
        <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Join thousands of homeowners and professionals who trust Map2Home for their construction projects. Start designing today — it's free!
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button @click="navigateToLogin" class="bg-white text-primary hover:bg-light font-bold px-10 py-5 rounded-full text-lg shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Get Started Free
          </button>
          <button @click="showVideoModal = true" class="border-2 border-white text-white hover:bg-white/10 font-bold px-10 py-5 rounded-full text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            View Demo
          </button>
        </div>
        <p class="text-sm text-white/70 mt-4">No credit card required · Free forever plan available</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8 mb-8">
          <!-- Brand -->
          <div>
            <div class="text-2xl font-bold text-white mb-3">Map2Home</div>
            <p class="text-sm text-gray-400">Design. Visualize. Estimate — with confidence.</p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-white font-semibold mb-3">Product</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#services" class="hover:text-white transition-colors">Services</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="text-white font-semibold mb-3">Support</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" class="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h4 class="text-white font-semibold mb-3">Legal</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-400 mb-4 md:mb-0">
            © 2025 Map2Home. All rights reserved.
          </p>
          <div class="flex gap-6">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ServiceCard from '../components/ServiceCard.vue'
import { MapIcon, CubeIcon, CalculatorIcon } from './icons'

const router = useRouter()

// Video modal state
const showVideoModal = ref(false)
const demoVideo = ref(null)

// Pause video when modal closes
watch(showVideoModal, (newVal) => {
  if (!newVal && demoVideo.value) {
    demoVideo.value.pause()
  }
})

const navigateToLogin = () => {
  router.push('/login')
}

const scrollToServices = () => {
  const el = document.getElementById('services')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const quickFeatures = ref([
  '2D Floor Plans',
  '3D Previews',
  'Cost Estimates',
  'Smart Layouts',
  'Export Options'
])

const showcaseCards = ref([
  { icon: '2D', label: 'Fast Maps', title: 'Smart 2D Layouts', tag: '$5' },
  { icon: '3D', label: 'Immersive', title: '3D Visualization', tag: 'Preview' },
  { icon: '$', label: 'Estimate', title: 'Cost Calculator', tag: 'Real-time' },
  { icon: '📊', label: 'Analytics', title: 'Project Insights', tag: 'Pro' }
])

const whyChooseUs = ref([
  { icon: '⚡', title: 'Lightning Fast', description: 'Generate maps and estimates in minutes, not days.' },
  { icon: '💎', title: 'Professional Quality', description: 'Industry-standard outputs trusted by professionals.' },
  { icon: '🔒', title: 'Secure & Private', description: 'Your designs and data are encrypted and protected.' },
  { icon: '🎯', title: 'Accurate Pricing', description: 'Real-time market data for precise cost estimates.' }
])

const team = ref([
  { initials: 'AB', name: 'A. Brown', role: 'Lead Architect' },
  { initials: 'LS', name: 'L. Smith', role: '3D Visualization Lead' },
  { initials: 'RM', name: 'R. Miller', role: 'Cost Analysis Expert' },
  { initials: 'ET', name: 'E. Taylor', role: 'Product Manager' }
])
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.15; }
}

.animate-pulse {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.bg-grid-white\/10 {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}
</style>
