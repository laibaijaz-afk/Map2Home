<template>
  <div 
    class="group relative bg-white rounded-3xl p-6 md:p-8 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-50 overflow-hidden"
  >
    <!-- Subtle background gradient on hover -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/6 to-secondary/6 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div class="relative z-10">
      <!-- Icon Container -->
      <div class="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500">
        <component :is="icon" class="w-8 h-8" />
      </div>

      <!-- Title -->
      <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
        {{ title }}
      </h3>

      <!-- Description -->
      <p class="text-gray-600 leading-relaxed mb-4">
        {{ description }}
      </p>

      <!-- Features List -->
      <ul class="space-y-2">
        <li 
          v-for="(feature, index) in features" 
          :key="index"
          class="flex items-start text-sm text-gray-500"
        >
          <svg class="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ feature }}</span>
        </li>
      </ul>

      <!-- Decorative element -->
      <div class="absolute -bottom-6 -right-6 w-28 h-28 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: {
    type: Array,
    default: () => []
  }
})
</script>
