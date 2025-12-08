import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['three']
  },
  server: {
    port: 5173,
    strictPort: false
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'three-vendor': ['three', 'dxf-viewer'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
