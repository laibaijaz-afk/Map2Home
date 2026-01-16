<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white py-8">
    <div class="max-w-6xl mx-auto px-4">

      <!-- DXF Viewer mode -->
      <div v-if="activeOption">
        <div class="mb-4 flex items-center gap-3">
          <button
            @click="activeOption = null"
            class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Options
          </button>
          <span class="text-gray-500 text-sm">{{ mapTitle }} › {{ activeOption.label }}</span>
        </div>
        <DxfViewer
          :dxfUrl="activeOption.url"
          :mapTitle="activeOption.label"
          :mapDescription="activeOption.desc"
          @close="activeOption = null"
        />
      </div>

      <!-- Options grid -->
      <template v-else>
        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <button
              @click="goBack"
              class="mb-3 inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Floor Plan
            </button>
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800">Complete Working Drawings</h1>
            <p class="text-gray-600 mt-1">{{ mapTitle }}</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span class="ml-3 text-gray-500">Loading drawings…</span>
        </div>

        <!-- Options Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <button
            v-for="opt in options"
            :key="opt.key"
            @click="selectOption(opt)"
            class="group bg-white rounded-2xl border-2 shadow-sm transition-all p-6 text-left flex flex-col items-start"
            :class="opt.url
              ? 'border-gray-200 hover:border-indigo-400 hover:shadow-lg cursor-pointer'
              : 'border-dashed border-gray-200 opacity-60 cursor-not-allowed'"
          >
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors"
              :class="opt.bg"
            >
              <span v-html="opt.icon" class="w-7 h-7" :class="opt.fg"></span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 transition" :class="opt.url ? 'group-hover:text-indigo-600' : ''">
              {{ opt.label }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">{{ opt.desc }}</p>
            <span v-if="opt.url" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
              Open
              <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span v-else class="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gray-400">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Not uploaded yet
            </span>
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DxfViewer from '../components/DxfViewer.vue'

const route = useRoute()
const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const mapTitle = computed(() => route.query.title || 'Floor Plan')
const loading = ref(false)

// Drawing URLs — seeded from query params first, then overwritten by API fetch
const drawingUrls = ref({
  elevation: route.query.elevation || null,
  working: route.query.working || null,
  electric: route.query.electric || null,
  sanitary: route.query.sanitary || null,
})

// Fetch fresh drawing URLs directly from the map record
const fetchMapDrawings = async () => {
  const id = parseInt(route.params.mapId, 10)
  if (!id || isNaN(id)) return   // JSON-saved plans don't have a maps-table id

  // Only show loading spinner if we have no query params at all
  const hasQueryData = drawingUrls.value.elevation || drawingUrls.value.working ||
                       drawingUrls.value.electric || drawingUrls.value.sanitary
  if (!hasQueryData) loading.value = true

  try {
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API_URL}/maps/info/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    const data = await res.json()
    if (data.success && data.map) {
      drawingUrls.value = {
        elevation: data.map.elevation_file || null,
        working: data.map.working_drawing_file || null,
        electric: data.map.electric_file || null,
        sanitary: data.map.sanitary_file || null,
      }
    }
  } catch (e) {
    console.warn('[WorkingDrawings] Could not fetch map info:', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchMapDrawings)

const options = computed(() => [
  {
    key: 'elevation',
    label: 'Elevation Drawing',
    desc: 'Front and side elevations of the house',
    bg: 'bg-blue-100 group-hover:bg-blue-200',
    fg: 'text-blue-600',
    url: drawingUrls.value.elevation,
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>'
  },
  {
    key: 'working',
    label: 'Working Plan',
    desc: 'Detailed construction working plan',
    bg: 'bg-emerald-100 group-hover:bg-emerald-200',
    fg: 'text-emerald-600',
    url: drawingUrls.value.working,
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'
  },
  {
    key: 'electric',
    label: 'Electric Layer',
    desc: 'Electrical wiring and fixtures layout',
    bg: 'bg-amber-100 group-hover:bg-amber-200',
    fg: 'text-amber-600',
    url: drawingUrls.value.electric,
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
  },
  {
    key: 'sanitary',
    label: 'Sanitary Layer',
    desc: 'Plumbing and sanitary layout',
    bg: 'bg-cyan-100 group-hover:bg-cyan-200',
    fg: 'text-cyan-600',
    url: drawingUrls.value.sanitary,
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-7 h-7"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>'
  }
])

const activeOption = ref(null)

const selectOption = (opt) => {
  if (!opt.url) return
  activeOption.value = opt
}

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'design-2d-map' })
}
</script>
