<template>
  <div class="flex items-center gap-2">
    <!-- Logo Icon -->
    <svg 
      :width="size" 
      :height="size" 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      class="logo-icon"
    >
      <!-- House outline -->
      <path 
        d="M256 80L96 200V432H416V200L256 80Z" 
        stroke="#3B82F6" 
        stroke-width="24" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        fill="none"
      />
      
      <!-- Window -->
      <rect x="208" y="200" width="96" height="96" fill="#3B82F6" rx="4"/>
      <line x1="256" y1="200" x2="256" y2="296" stroke="white" stroke-width="8"/>
      <line x1="208" y1="248" x2="304" y2="248" stroke="white" stroke-width="8"/>
      
      <!-- Ruler on left side -->
      <line x1="96" y1="200" x2="96" y2="400" stroke="#374151" stroke-width="16"/>
      <line x1="96" y1="220" x2="108" y2="220" stroke="#374151" stroke-width="3"/>
      <line x1="96" y1="240" x2="108" y2="240" stroke="#374151" stroke-width="3"/>
      <line x1="96" y1="260" x2="108" y2="260" stroke="#374151" stroke-width="3"/>
      <line x1="96" y1="280" x2="108" y2="280" stroke="#374151" stroke-width="3"/>
      <line x1="96" y1="300" x2="108" y2="300" stroke="#374151" stroke-width="3"/>
      <line x1="96" y1="320" x2="108" y2="320" stroke="#374151" stroke-width="3"/>
      <line x1="96" y1="340" x2="108" y2="340" stroke="#374151" stroke-width="3"/>
      <line x1="96" y1="360" x2="108" y2="360" stroke="#374151" stroke-width="3"/>
      <line x1="96" y1="380" x2="108" y2="380" stroke="#374151" stroke-width="3"/>
      
      <!-- Hammer -->
      <g transform="translate(60, 60)">
        <rect x="10" y="40" width="20" height="80" fill="#374151" rx="2"/>
        <path d="M0 20 L40 20 L40 60 L30 60 L30 30 L10 30 L10 60 L0 60 Z" fill="#374151"/>
      </g>
      
      <!-- Triangle ruler on bottom right -->
      <g transform="translate(320, 280)">
        <path d="M0 120 L120 120 L120 0 Z" stroke="#374151" stroke-width="16" fill="none"/>
        <path d="M30 90 L90 90 L90 30 Z" fill="#3B82F6"/>
        <line x1="30" y1="110" x2="30" y2="115" stroke="#374151" stroke-width="2"/>
        <line x1="50" y1="110" x2="50" y2="115" stroke="#374151" stroke-width="2"/>
        <line x1="70" y1="110" x2="70" y2="115" stroke="#374151" stroke-width="2"/>
        <line x1="90" y1="110" x2="90" y2="115" stroke="#374151" stroke-width="2"/>
        <line x1="110" y1="30" x2="115" y2="30" stroke="#374151" stroke-width="2"/>
        <line x1="110" y1="50" x2="115" y2="50" stroke="#374151" stroke-width="2"/>
        <line x1="110" y1="70" x2="115" y2="70" stroke="#374151" stroke-width="2"/>
        <line x1="110" y1="90" x2="115" y2="90" stroke="#374151" stroke-width="2"/>
      </g>
      
      <!-- Wrench -->
      <g transform="translate(160, 340)">
        <circle cx="20" cy="20" r="18" stroke="#3B82F6" stroke-width="8" fill="none"/>
        <rect x="28" y="15" width="60" height="10" fill="#3B82F6" rx="2"/>
        <circle cx="20" cy="20" r="8" fill="#3B82F6"/>
      </g>
    </svg>
    
    <!-- Text -->
    <span v-if="showText" :class="textClass" class="font-bold tracking-tight">
      MAP<span class="text-primary">2</span>HOME
    </span>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: [String, Number],
    default: 40
  },
  showText: {
    type: Boolean,
    default: true
  },
  textClass: {
    type: String,
    default: 'text-2xl text-gray-800'
  }
})
</script>

<style scoped>
.logo-icon {
  flex-shrink: 0;
}
</style>
