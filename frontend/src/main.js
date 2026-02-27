import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)

// Create Pinia instance and register it before using any stores
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth store to restore token/header from localStorage on app startup
// We call this after Pinia is installed so the store is available outside components
const authStore = useAuthStore(pinia)
if (authStore && typeof authStore.initialize === 'function') {
	authStore.initialize()
}

app.mount('#app')
