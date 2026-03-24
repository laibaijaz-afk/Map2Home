<template>
  <div class="dxf-viewer-container">
    <div class="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl p-8 border-2 border-indigo-100">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ mapTitle }}</h2>
          <p class="text-gray-600 text-sm mt-2 font-medium">{{ mapDescription }}</p>
        </div>
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          title="Back to form"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Close</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <svg class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading DXF file...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-red-800 font-semibold mb-2">Failed to load DXF file</h3>
        <p class="text-sm text-red-700 mb-4">{{ error }}</p>
        <div class="flex gap-4 justify-center">
          <button
            @click="loadDxf"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
          <a
            :href="dxfUrl"
            :download="downloadFilename"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download DXF File
          </a>
        </div>
        <p class="text-xs text-red-600 mt-4">Please check the browser console (F12) for detailed error information.</p>
      </div>

      <!-- DXF Viewer (dxf-viewer - prototype approach) -->
      <div v-if="!error" class="space-y-4">
        <!-- Controls -->
        <div v-if="!loading" class="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 shadow-md border border-indigo-200">
          <div class="flex items-center gap-4">
            <span class="text-sm font-semibold text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-sm">
              Mouse wheel: Zoom • Right-click drag: Pan
            </span>
          </div>
          <div class="flex items-center gap-3">
            <a
              :href="dxfUrl"
              :download="downloadFilename"
              class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download DXF
            </a>
          </div>
        </div>

        <!-- dxf-viewer Container - Viewer appends WebGL canvas here with autoResize -->
        <div class="bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 rounded-xl overflow-auto border-4 border-indigo-300 shadow-2xl" style="min-height: 600px; max-height: 900px;">
          <div
            ref="viewerContainer"
            class="w-full cad-view-container"
            style="min-height: 600px; position: relative;"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { DxfViewer } from 'dxf-viewer'

const authStore = useAuthStore()

const props = defineProps({
  dxfUrl: {
    type: String,
    required: true
  },
  mapTitle: {
    type: String,
    default: 'House Plan'
  },
  mapDescription: {
    type: String,
    default: 'Professional 2D house floor plan'
  }
})

const emit = defineEmits(['close', 'dxfParsed'])

const downloadFilename = computed(() => {
  const base = String(props.mapTitle || 'map')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "_")
    .replace(/\s+/g, "_");
  return `${base || "map"}.dxf`;
});

const loading = ref(true)
const error = ref(null)
const viewerContainer = ref(null)
let dxfViewer = null
let currentObjectUrl = null

function cleanup() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
  if (dxfViewer) {
    try {
      dxfViewer.Destroy()
    } catch (e) {
      console.warn('Viewer destroy warning:', e)
    }
    dxfViewer = null
  }
}

const loadDxf = async () => {
  loading.value = true
  error.value = null
  cleanup()

  try {
    // Step 1: Fetch DXF file with auth
    const token = authStore.token || localStorage.getItem('auth_token')
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(props.dxfUrl, { headers })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please login to view DXF files')
      }
      throw new Error(`Failed to fetch DXF file: ${response.statusText}`)
    }

    const blob = await response.blob()
    currentObjectUrl = URL.createObjectURL(blob)

    await nextTick()
    if (!viewerContainer.value) {
      throw new Error('Viewer container not ready.')
    }

    // Clear any placeholder content
    viewerContainer.value.innerHTML = ''
    viewerContainer.value.style.display = 'block'

    // Step 2: Create dxf-viewer (prototype approach) with autoResize for better rendering
    // retainParsedDxf: true is REQUIRED - otherwise GetDxf() returns undefined (worker drops parsed data by default)
    dxfViewer = new DxfViewer(viewerContainer.value, { autoResize: true, retainParsedDxf: true })

    dxfViewer.Subscribe('message', (e) => {
      if (e.detail?.level === 'error') {
        error.value = e.detail.message || 'DXF viewer error'
      }
    })

    const fonts = [
      'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/fonts/ttf/kenpixel.ttf'
    ]

    // Step 3: Load DXF by URL (object URL from fetched blob)
    await dxfViewer.Load({
      url: currentObjectUrl,
      fonts,
      progressCbk: () => {}
    })

    // Step 4: Emit parsed DXF for parent (Dashboard convertDxfToJson, editing, 3D)
    const parsedDxf = dxfViewer.GetDxf()
    if (parsedDxf && parsedDxf.entities && parsedDxf.entities.length > 0) {
      emit('dxfParsed', parsedDxf)
    } else {
      emit('dxfParsed', parsedDxf || { entities: [] })
    }

    loading.value = false
  } catch (err) {
    console.error('Error loading DXF:', err)
    error.value = err.message || 'Failed to load DXF file'
    loading.value = false
    cleanup()
  }
}

onMounted(async () => {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 100))
  loadDxf()
})

onBeforeUnmount(() => {
  cleanup()
})

watch(() => props.dxfUrl, () => {
  loadDxf()
})
</script>

<style scoped>
.dxf-viewer-container {
  width: 100%;
}

.cad-view-container :deep(canvas) {
  display: block;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.cad-view-container :deep(canvas:hover) {
  cursor: grab;
}

.cad-view-container :deep(canvas:active) {
  cursor: grabbing;
}

.dxf-viewer-container {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
