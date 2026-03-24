import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Deduplicate Three.js - dxf-viewer and project both use it; prevents "Multiple instances" warning
    dedupe: ['three']
  },
  server: {
    port: 5173,
    strictPort: false
  }
})
